const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const pdf = require('pdf-parse');

/**
 * Parses a file (CSV, Excel, PDF) into structured financial data.
 * @param {string} filePath - Path to the uploaded file
 * @param {string} mimeType - Mime type of the file
 * @returns {Promise<Array>} - Array of structured data objects [{year, revenue, expenses, netProfit, ...}]
 */
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize Gemini
let genAI;
try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
    console.error("SDM: Failed to init Gemini:", error);
}

/**
 * Parses a file (CSV, Excel, PDF) into structured financial data.
 * @param {string} filePath - Path to the uploaded file
 * @param {string} mimeType - Mime type
 * @param {string} documentType - User selected type (audit, tax, etc.)
 * @returns {Promise<Array>}
 */
async function structureFinancialData(filePath, mimeType, documentType = 'other') {
    try {
        let extractedData = [];
        let rawText = "";

        // 1. Extract Raw Content
        if (mimeType === 'text/csv' || mimeType === 'application/vnd.ms-excel' || filePath.endsWith('.csv')) {
            extractedData = await parseCSV(filePath);
            // Also read raw text in case we need AI fallback
            try { rawText = fs.readFileSync(filePath, 'utf8'); } catch (e) { console.warn("Could not read CSV text", e); }
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            extractedData = parseExcel(filePath);
        } else if (mimeType === 'application/pdf') {
            const pdfData = await parsePDF(filePath);
            rawText = pdfData.text; // Use text for AI
        }

        // 2. Assess Data Quality
        const validRows = extractedData.filter(d => d.revenue !== undefined || d.year !== undefined || d.netProfit !== undefined);
        const mostlyGarbage = extractedData.length > 0 && validRows.length === 0;

        // 3. AI Parsing Trigger
        // Trigger if:
        // - PDF with no data (messyPDF)
        // - Explicit 'audit'/'tax' type
        // - CSV/Excel that yielded only garbage (headers didn't match)
        const messyPDF = mimeType === 'application/pdf' && (!extractedData.length || documentType !== 'other');
        const garbageCSV = (extractedData.length > 0 && mostlyGarbage); // New check

        if (messyPDF || garbageCSV || documentType === 'audit' || documentType === 'tax') {
            console.log(`[SDM] Smart Parsing Triggered: Type=${documentType}, GarbageCSV=${garbageCSV}`);
            if (rawText.length > 50) {
                const aiData = await parseWithAI(rawText, documentType === 'other' ? 'financial statement' : documentType);
                if (aiData && aiData.length > 0) {
                    console.log(`[SDM] AI Parsing successful. Replaced ${extractedData.length} raw rows with ${aiData.length} structured rows.`);
                    extractedData = aiData;
                }
            }
        }

        // Clean up
        try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (e) {
            console.warn("Failed to delete temp file:", filePath);
        }

        return extractedData;

    } catch (error) {
        console.error("Error in SDM Service:", error);
        throw error;
    }
}

async function parseWithAI(text, docType) {
    if (!genAI) return [];
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const safeText = text.substring(0, 30000);

        const prompt = `
        Act as a Data Extraction AI. Extract financial data from the following text (${docType} document).
        
        Text Content:
        """${safeText}"""
        
        Return a JSON ARRAY of objects. Each object represents a Year/Period.
        Format: [{ "year": 2023, "revenue": 1000, "expenses": 800, "netProfit": 200 }]
        
        Rules:
        1. If Year is missing, estimate from context or use current year.
        2. Infer Net Profit if missing (Revenue - Expenses).
        3. Return ONLY valid JSON.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Simple JSON cleanup
        const jsonMatch = responseText.match(/\[.*\]/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(responseText);
    } catch (e) {
        console.error("AI Parse Failed:", e);
        return [];
    }
}

function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(mapKeys(data)))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
}
// ... keep existing parseExcel / parsePDF / mapKeys ...
function parseExcel(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    return data.map(item => mapKeys(item));
}

async function parsePDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    return await pdf(dataBuffer);
}

// Helper to normalize keys (fuzzy match headers)
function mapKeys(row) {
    const normalized = {};
    const keys = Object.keys(row);

    keys.forEach(key => {
        const k = key.toLowerCase().trim();
        const cleanValue = (val) => {
            if (typeof val === 'string') {
                return parseFloat(val.replace(/[^0-9.-]+/g, ""));
            }
            return val;
        };

        if (k.includes('year') || k.includes('date')) normalized.year = parseInt(row[key]);
        else if (k.includes('revenue') || k.includes('sales')) normalized.revenue = cleanValue(row[key]);
        else if (k.includes('expense') || k.includes('cost')) normalized.expenses = cleanValue(row[key]);
        else if (k.includes('profit') || k.includes('income')) normalized.netProfit = cleanValue(row[key]);
        else if (k.includes('churn')) normalized.churnRate = cleanValue(row[key]);
    });

    if (normalized.revenue && normalized.expenses && !normalized.netProfit) {
        normalized.netProfit = normalized.revenue - normalized.expenses;
    }

    return normalized;
}

module.exports = {
    structureFinancialData
};

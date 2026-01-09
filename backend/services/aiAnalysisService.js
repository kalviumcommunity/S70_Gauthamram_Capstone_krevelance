// server/services/aiAnalysisService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

let genAI;
try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
    console.error("Failed to initialize GoogleGenerativeAI. Check GEMINI_API_KEY.", error);
    genAI = null;
}

function safeJSONParse(text, fallback) {
    try {
        // 1. Try to find JSON inside markdown code blocks
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            let content = jsonMatch[1];
            // Attempt to clean unescaped newlines in strings if simple parse fails
            try {
                return JSON.parse(content);
            } catch (e2) {
                if (e2.message.includes("Bad control character")) {

                    console.warn("Attempting to sanitize JSON with control characters...");
                    const sanitized = content.replace(/\n/g, "\\n").replace(/\r/g, "");
                    try { return JSON.parse(sanitized); } catch (e3) { /* ignore */ }
                }
                throw e2;
            }
        }

        const firstOpen = text.indexOf('{');
        const lastClose = text.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
            const jsonString = text.substring(firstOpen, lastClose + 1);
            return JSON.parse(jsonString);
        }

        return JSON.parse(text);
    } catch (e) {
        console.error("AI Response JSON Parse Error:", e, "\nText:", text);
        return fallback;
    }
}
// --- Retry Logic Helper ---
const makeRequestWithRetry = async (modelName, prompt, retries = 3, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            const isLastAttempt = i === retries - 1;
            console.warn(`Attempt ${i + 1} failed for model ${modelName}:`, error.message);

            // If 503 (Service Unavailable) or 429 (Too Many Requests), wait and retry
            if ((error.message.includes("503") || error.message.includes("429")) && !isLastAttempt) {
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            } else if (isLastAttempt) {
                throw error;
            }
        }
    }
};

async function performAdvancedAnalysis(financialHistory, marketData) {
    if (!genAI) throw new Error("AI Service not initialized.");

    const prompt = `
        You are an expert AI Financial Advisor (ADM - Analysis & Decision Model).
        
        **Objective**: Analyze the provided historical financial data of a business and the current market trends to predict future performance and offer actionable advice.
        
        **1. Historical Financial Data (Yearly/Monthly):**
        ${JSON.stringify(financialHistory, null, 2)}
        
        **2. Current Market Data (Sector: ${marketData.sector}):**
        ${JSON.stringify(marketData, null, 2)}

        **3. Context**:
        - Current System Date: ${new Date().toLocaleDateString()}
        - Prediction Goal: Forecast for the NEXT 12 months starting from the month after the latest data point.

        
        **Task**:
        1. Predict the Revenue, Expenses, Net Profit, and Churn Rate for the NEXT 12 Months.
        2. Identify 3 Key Insights (Positive, Warning, Info).
        3. Identify 3 Specific Growth Opportunities based on Market Data.
        4. Provide a detailed markdown analysis explanation.
        5. Ensure 'monthlyForecast' array contains exactly 12 entries for the future months.
        6. In 'monthlyForecast', the "month" field MUST be a string "Month Year" (e.g., "February 2026").
        
        **IMPORTANT JSON FORMATTING RULES**:
        - Return ONLY a valid JSON object.
        - **Escape all newlines** inside strings. Use \\n, NOT literal newlines.
        - Do not include any text outside the JSON block.
        - Ensure all strings are properly quoted.
        
        **Response Format (JSON ONLY):**
        {
            "predictions": {
                "revenue": "Total predicted revenue value (Quarter/Year)",
                "expenses": "Total predicted expenses",
                "netProfit": "Total predicted profit",
                "churnRate": "Predicted %",
                "growthPercentage": "Predicted growth %",
                "monthlyForecast": [
                    { "month": "Month Name", "revenue": 1000, "profit": 200 }
                ]
            },
            "keyInsights": [
                { "title": "...", "description": "...", "type": "positive|warning|info", "icon": "TrendingUp|AlertTriangle|Info" }
            ],
            "scenarioPlanning": {
                "optimistic": "...",
                "pessimistic": "..."
            },
            "growthOpportunities": [
                { "title": "...", "description": "..." }
            ],
            "detailedAnalysis": "### Executive Summary\\n..."
        }
    `;

    try {
        try {
            text = await makeRequestWithRetry("gemini-2.5-flash-lite", prompt, 5, 2000);
        } catch (primaryError) {
            console.error("Primary model failed, trying fallback...", primaryError.message);
            // Fallback to gemini-2.0-flash
            text = await makeRequestWithRetry("gemini-2.0-flash", prompt, 3, 3000);
        }

        return safeJSONParse(text, {
            predictions: { revenue: "N/A", expenses: "N/A", netProfit: "N/A", churnRate: "N/A", growthPercentage: "N/A" },
            keyInsights: [],
            detailedAnalysis: "Analysis failed to parse."
        });

    } catch (error) {
        console.error("ADM Analysis All Attempts Failed:", error);
        return {
            predictions: { revenue: "N/A", expenses: "N/A", netProfit: "N/A", churnRate: "N/A", growthPercentage: "N/A" },
            keyInsights: [{ title: "Analysis Unavailable", description: "AI Service is currently overloaded. Please try again later.", type: "warning" }],
            detailedAnalysis: "The AI service is experiencing high traffic. Please wait a moment and try again."
        };
    }
}

async function generateFinancialInsights(financialDataSummary) {
    if (!genAI) return { keyInsights: [], revenueForecast: "N/A" };
    try {
        const result = await makeRequestWithRetry("gemini-2.5-flash-lite", `Analyze this summary: ${JSON.stringify(financialDataSummary)}. Return JSON: { "keyInsights": [...], "revenueForecast": "...", "expenseForecast": "...", "growthOpportunities": [...] }`);
        return safeJSONParse(result, {});
    } catch (e) { return {}; }
}

async function generateDetailedAIRecommendations(financialDataSummary, userTier) {
    if (!genAI) return "AI Service Unreachable";
    try {
        return await makeRequestWithRetry("gemini-2.5-flash-lite", `Provide detailed strategies for: ${JSON.stringify(financialDataSummary)}.`);
    } catch (e) { return "AI Service Unavailable"; }
}

async function predictRetainedUsers(historicalSummary, currentActiveCount, timeframe = '3m') {
    return currentActiveCount;
}

module.exports = {
    performAdvancedAnalysis,
    generateFinancialInsights,
    generateDetailedAIRecommendations,
    predictRetainedUsers
};
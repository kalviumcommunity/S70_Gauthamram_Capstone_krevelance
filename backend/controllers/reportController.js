const Report = require('../models/Report');
const fs = require('fs').promises;
const path = require('path');
const FinancialData = require('../models/FinancialData');
const User = require('../models/user');
const { getMarketTrendData } = require('../services/marketDataService');
const { performAdvancedAnalysis } = require('../services/aiAnalysisService');


exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user._id }).sort({ date: -1 });
        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Failed to fetch reports' });
    }
};

exports.viewReport = async (req, res) => {
    const { reportId } = req.params;

    try {
        const report = await Report.findOne({ _id: reportId, user: req.user._id });
        if (!report || !report.filePath) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Check if file exists
        try {
            await fs.access(report.filePath);
        } catch {
            return res.status(404).json({ message: 'Report file missing from server.' });
        }

        let contentType;
        const fileExtension = path.extname(report.filePath).toLowerCase();
        if (fileExtension === '.pdf') {
            contentType = 'application/pdf';
        } else if (fileExtension === '.xlsx') {
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        } else {
            return res.status(400).json({ message: 'Unsupported file type' });
        }

        res.setHeader('Content-Type', contentType);
        const fileStream = require('fs').createReadStream(report.filePath); // Use standard fs for stream
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error viewing report:', error);
        res.status(500).json({ message: 'Failed to view report' });
    }
};

exports.downloadReport = async (req, res) => {
    const { reportId } = req.params;

    try {
        const report = await Report.findOne({ _id: reportId, user: req.user._id });
        if (!report || !report.filePath) {
            return res.status(404).json({ message: 'Report not found' });
        }

        try {
            await fs.access(report.filePath);
        } catch {
            return res.status(404).json({ message: 'Report file missing from server.' });
        }

        const fileName = path.basename(report.filePath);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        const fileStream = require('fs').createReadStream(report.filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error downloading report:', error);
        res.status(500).json({ message: 'Failed to download report' });
    }
};

const PDFDocument = require('pdfkit');
const AnalysisResult = require('../models/AnalysisResult');

exports.generateReport = async (req, res) => {
    try {
        const userId = req.user._id;
        const { uploadId } = req.body;

        // 1. Fetch Specific Financial Data based on selection
        const query = { user: userId };
        if (uploadId && uploadId !== 'all') {
            query.uploadId = uploadId;
        }

        const financialHistory = await FinancialData.find(query).sort({ year: 1 });

        if (!financialHistory || financialHistory.length === 0) {
            return res.status(400).json({ message: "No financial data found for the selected source." });
        }

        const user = await User.findById(userId);
        const marketData = await getMarketTrendData(user.businessSector || 'Technology');

        let projectName = "Combined Data";
        if (uploadId && uploadId !== 'all') {
            const sampleDoc = await FinancialData.findOne({ user: userId, uploadId: uploadId });
            if (sampleDoc && sampleDoc.metadata && sampleDoc.metadata.originalFileName) {
                projectName = sampleDoc.metadata.originalFileName;
            } else {
                projectName = "Project Specific";
            }
        }

        let analysis;
        try {
            // Generating fresh insights...
            analysis = await performAdvancedAnalysis(financialHistory, marketData);
        } catch (err) {
            console.error("AI Analysis failed for report:", err);
            analysis = {
                predictions: {},
                keyInsights: [],
                detailedAnalysis: "AI Analysis could not be completed. Showing raw data summary."
            };
        }

        // 3. Prepare File Path
        const fileName = `Report-${Date.now()}.pdf`;
        const reportsDir = path.join(__dirname, '..', 'uploads', 'reports');

        // Ensure directory exists
        const fsSync = require('fs');
        if (!fsSync.existsSync(reportsDir)) {
            fsSync.mkdirSync(reportsDir, { recursive: true });
        }

        const filePath = path.join(reportsDir, fileName);

        // 3. Generate PDF
        const doc = new PDFDocument();
        const stream = fsSync.createWriteStream(filePath);

        doc.pipe(stream);

        // -- PDF Content --
        doc.fontSize(25).text('Krevelance Financial Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.moveDown();

        doc.fontSize(18).text('Executive Summary');
        doc.fontSize(12).text('Based on the AI-powered analysis of your recent financial data, here is the performance overview.');
        doc.moveDown();

        doc.fontSize(16).text('Financial Forecasts');
        doc.text(`Revenue Projection: ${analysis.predictions?.revenue || 'N/A'}`);
        doc.text(`Expense Projection: ${analysis.predictions?.expenses || 'N/A'}`);
        doc.text(`Net Profit Projection: ${analysis.predictions?.netProfit || 'N/A'}`);
        doc.moveDown();

        doc.fontSize(16).text('Key Insights');
        if (analysis.keyInsights && analysis.keyInsights.length > 0) {
            analysis.keyInsights.forEach(insight => {
                doc.fontSize(12).font('Helvetica-Bold').text(`• ${insight.title} (${insight.type})`);
                doc.fontSize(10).font('Helvetica').text(`  ${insight.description}`);
                doc.moveDown(0.5);
            });
        } else {
            doc.fontSize(12).text('No key insights generated.');
        }

        doc.moveDown();
        doc.fontSize(16).text('Detailed AI Analysis');
        doc.fontSize(10).text(analysis.detailedAnalysis || 'Detailed text not available.', {
            width: 410,
            align: 'justify'
        });

        doc.end();

        // 4. Save to DB when stream finishes
        stream.on('finish', async () => {
            const newReport = await Report.create({
                title: `Financial Analysis: ${projectName}`,
                description: `AI-Generated report for ${projectName}`,
                type: 'analysis',
                status: 'ready',
                format: 'pdf',
                filePath: filePath,
                user: userId
            });

            res.status(201).json({ message: "Report generated successfully", report: newReport });
        });

        stream.on('error', (err) => {
            console.error(err);
            res.status(500).json({ message: "Error writing PDF file." });
        });

    } catch (error) {
        console.error("Generate Report Error:", error);
        res.status(500).json({ message: error.message });
    }
};
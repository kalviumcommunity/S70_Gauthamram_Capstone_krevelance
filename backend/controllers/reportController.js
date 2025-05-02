const Report = require('../models/Report'); 
const fs = require('fs').promises;
const path = require('path');
const { generateFinancialInsights, generateDetailedAIRecommendations } = require('../services/aiAnalysisService');

exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find();
        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Failed to fetch reports' });
    }
};

exports.viewReport = async (req, res) => {
    const { reportId } = req.params;

    try {
        const report = await Report.findById(reportId);
        if (!report || !report.filePath) {
            return res.status(404).json({ message: 'Report not found or file path not available' });
        }
        let contentType;
        const fileExtension = path.extname(report.filePath).toLowerCase();
        if (fileExtension === '.pdf') {
            contentType = 'application/pdf';
        } else if (fileExtension === '.xlsx') {
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        } else {
            return res.status(400).json({ message: 'Unsupported file type for viewing' });
        }

        res.setHeader('Content-Type', contentType);
        const fileStream = fs.createReadStream(report.filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error viewing report:', error);
        res.status(500).json({ message: 'Failed to view report' });
    }
};

exports.downloadReport = async (req, res) => {
    const { reportId } = req.params;

    try {
        const report = await Report.findById(reportId);
        if (!report || !report.filePath) {
            return res.status(404).json({ message: 'Report not found or file path not available' });
        }

        const fileName = path.basename(report.filePath);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        const fileStream = fs.createReadStream(report.filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error downloading report:', error);
        res.status(500).json({ message: 'Failed to download report' });
    }
};
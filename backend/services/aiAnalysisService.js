const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: "v1" });

async function generateFinancialInsights(financialDataSummary) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" }); 
        const prompt = `Analyze the following financial data summary: ${JSON.stringify(financialDataSummary)}.
        Provide:
        1. Key insights (3-5 items) as a JSON array of objects with fields: id, title, description, type ('positive', 'warning', 'info'), icon ('TrendingUp', 'AlertTriangle', 'CheckCircle', 'Info').
        2. A short revenue forecast text.
        3. A short expense forecast text.
        4. Three distinct growth opportunity descriptions as a JSON array of objects with fields: title, description.

        Respond ONLY with a valid JSON object containing keys: "keyInsights", "revenueForecast", "expenseForecast", "growthOpportunities". Ensure descriptions are concise.`;

        const result = await model.generateContentStream({
            contents: [{ parts: [{ text: prompt }] }]
        });
        const response = await result.response;
        let text = '';
        for await (const chunk of result.stream) {
            text += chunk.text();
        }

        const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
        try {
            return JSON.parse(cleanedText);
        } catch(parseError) {
            console.error("Failed to parse AI response:", parseError, "\nRaw response:", text);
            return { keyInsights: [], revenueForecast: "N/A", expenseForecast: "N/A", growthOpportunities: [] };
        }

    } catch (error) {
        console.error("Error calling AI Service:", error);
        throw new Error("Failed to generate AI analysis.");
    }
}

async function generateDetailedAIRecommendations(financialDataSummary, userTier) {
    if (userTier !== 'pro' && userTier !== 'enterprise') {
        return "Upgrade to Pro or Enterprise for detailed AI recommendations.";
    }
    try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" }); // Ensure it's here
        const prompt = `Based on the following financial data summary: ${JSON.stringify(financialDataSummary)}, provide detailed, actionable strategies for a user with a '${userTier}' plan to increase their business production and profitability. Structure the response clearly.`;

        const result = await model.generateContentStream({
            contents: [{ parts: [{ text: prompt }] }]
        });
        const response = await result.response;
        let text = '';
        for await (const chunk of result.stream) {
            text += chunk.text();
        }
        return text;

    } catch (error) {
        console.error("Error calling AI Service for detailed recommendations:", error);
        throw new Error("Failed to generate detailed AI recommendations.");
    }
}

module.exports = { generateFinancialInsights, generateDetailedAIRecommendations };
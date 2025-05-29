// server/services/aiAnalysisService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getMarketTrendData } = require('./marketDataService'); // Import the new service
require('dotenv').config();

// Initialize Gemini Client ONCE
let genAI;
try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
    console.error("Failed to initialize GoogleGenerativeAI. Check GEMINI_API_KEY.", error);
    // Handle initialization failure, maybe throw or set genAI to null
    genAI = null;
}

// --- Existing generateFinancialInsights function ---
async function generateFinancialInsights(financialDataSummary) {
    if (!genAI) throw new Error("AI Service not initialized.");
    try {
        // Use specific model version like 'gemini-1.5-flash' or 'gemini-pro' etc.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Updated model name if needed
        const prompt = `Analyze the following financial data summary: ${JSON.stringify(financialDataSummary)}.
        Provide:
        1. Key insights (3-5 items) as a JSON array of objects with fields: id, title, description, type ('positive', 'warning', 'info'), icon ('TrendingUp', 'AlertTriangle', 'CheckCircle', 'Info').
        2. A short revenue forecast text.
        3. A short expense forecast text.
        4. Three distinct growth opportunity descriptions as a JSON array of objects with fields: title, description.

        Respond ONLY with a valid JSON object containing keys: "keyInsights", "revenueForecast", "expenseForecast", "growthOpportunities". Ensure descriptions are concise.`;

        // Updated to use generateContent for non-streaming
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
        try {
            return JSON.parse(cleanedText);
        } catch (parseError) {
            console.error("Failed to parse AI response for insights:", parseError, "\nRaw response:", text);
            // Provide a default structure on failure
            return { keyInsights: [], revenueForecast: "Analysis unavailable.", expenseForecast: "Analysis unavailable.", growthOpportunities: [] };
        }

    } catch (error) {
        console.error("Error calling AI Service for insights:", error);
        // Return default structure or throw a more specific error
        return { keyInsights: [], revenueForecast: "Error generating analysis.", expenseForecast: "Error generating analysis.", growthOpportunities: [] };
        // Or: throw new Error("Failed to generate AI financial insights.");
    }
}


// --- Existing generateDetailedAIRecommendations function ---
async function generateDetailedAIRecommendations(financialDataSummary, userTier) {
    if (userTier !== 'pro' && userTier !== 'enterprise') {
        return "Upgrade to Pro or Enterprise for detailed AI recommendations.";
    }
     if (!genAI) return "AI Service not initialized."; // Check initialization

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Ensure consistent model usage
        const prompt = `Based on the following financial data summary: ${JSON.stringify(financialDataSummary)}, provide detailed, actionable strategies for a user with a '${userTier}' plan to increase their business production and profitability. Structure the response clearly.`;

        // Updated to use generateContent for non-streaming
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text(); // Return the generated text directly

    } catch (error) {
        console.error("Error calling AI Service for detailed recommendations:", error);
        return "Failed to generate detailed AI recommendations due to an error."; // Return error message
        // Or: throw new Error("Failed to generate detailed AI recommendations.");
    }
}

// --- NEW Function for Predicting Retained Users ---
async function predictRetainedUsers(historicalSummary, currentActiveCount, timeframe = '3m') {
     if (!genAI) throw new Error("AI Service not initialized.");

    // **VERY IMPORTANT CAVEAT:** Using an LLM like Gemini for this specific numerical
    // prediction is NOT ideal. A dedicated ML model trained on user features
    // would be far more reliable. This is an attempt to fit it into the existing structure.
    // The reliability of the returned number might be low.

    try {
        // 1. Get Market Data
        const marketData = await getMarketTrendData();

        // 2. Construct the Prompt
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or another suitable model
        const prompt = `
        Analyze the following business context:
        - Historical Financial Summary: ${JSON.stringify(historicalSummary)}
        - Current Active Users (last 30 days): ${currentActiveCount}
        - Current Market Conditions: ${marketData.summary} (Sentiment: ${marketData.sentiment})

        Based *only* on this information, estimate the approximate number of users (out of the current ${currentActiveCount})
        that are likely to remain active customers over the next ${timeframe === '3m' ? '3 months' : timeframe === '6m' ? '6 months' : '1 year'}.

        Consider the historical performance and current market trends.

        Provide your best estimate as a single integer number. Respond ONLY with the number.
        Example Response: 850
        `;

        // 3. Call AI Model
        // console.log("Prediction Prompt:", prompt); // For debugging
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text().trim();
        // console.log("Raw Prediction Response:", text); // For debugging

        // 4. Parse the response (attempt to get just a number)
        const predictedNumber = parseInt(text.replace(/[^0-9]/g, ''), 10); // Extract digits only

        if (isNaN(predictedNumber)) {
            console.warn("AI did not return a valid number for user prediction. Raw:", text);
            // Fallback: maybe return current active count or null/undefined?
            return currentActiveCount; // Or handle error differently
        }

        // Basic sanity check (prediction shouldn't exceed current active users)
        return Math.min(predictedNumber, currentActiveCount);

    } catch (error) {
        console.error("Error calling AI Service for user prediction:", error);
        // Fallback or re-throw
        return currentActiveCount; // Return current count as a safe fallback
        // Or: throw new Error("Failed to generate AI user retention prediction.");
    }
}


module.exports = {
    generateFinancialInsights,
    generateDetailedAIRecommendations,
    predictRetainedUsers // Export the new function
};
const axios = require('axios');
require('dotenv').config();

// MOCK DATA GENERATOR for Sectors (Since we likely don't have paid keys for Agmarknet, etc.)
// In a real production app, these would be real API calls.

const SECTOR_MOCKS = {
    'Agriculture': {
        rainfall: "Normal (98% of LPA)",
        temperature: "Above Average (+2°C)",
        cropPrices: { Rice: "+2%", Wheat: "-1%", Cotton: "+5%" },
        majorTrend: "Stable monsoon expected, higher cotton prices likely."
    },
    'Tech/SaaS': {
        hiring: "Slow (-5% YoY)",
        currencyRates: { USD_INR: "83.50", EUR_USD: "1.08" },
        techTrends: "High demand for AI/ML services, Cloud cost optimization focus.",
        majorTrend: "Consolidation phase, but AI investment is booming."
    },
    'Retail': {
        cpi: "5.4% (Inflation slightly cooling)",
        consumerSpending: "Moderate Growth (+3%)",
        season: "Approaching holiday demand spike",
        majorTrend: "Inflation pressure easing, shoppers returning to premium brands."
    },
    'Manufacturing': {
        fuelPrices: "Diesel $3.50/gal (+5%)",
        rawMaterialCosts: { Steel: "-2%", Copper: "+4%" },
        logistics: "Port congestion clearing",
        majorTrend: "Rising energy costs impacting margins, but demand stable."
    },
    'Other': {
        generalSentiment: "Neutral",
        gdpGrowth: "6.5%",
        majorTrend: "Stable economic outlook."
    }
};

async function getMarketTrendData(sector = 'Other') {
    // Return mock data for now to simulate the "Fetch"
    console.log(`Fetching market data for sector: ${sector}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const data = SECTOR_MOCKS[sector] || SECTOR_MOCKS['Other'];

    // If we have an AlphaVantage Key, we can layer in S&P 500 data for all sectors
    // as a general economic indicator.
    let generalMarket = {};
    if (process.env.MARKET_DATA_API_KEY && process.env.MARKET_DATA_API_PROVIDER === 'AlphaVantage') {
        try {
            // Re-using logic from original marketDataService or keeping it simple here
            // For this task, let's keep it focused on the sector data.
        } catch (e) {
            console.warn("Failed to fetch real market data, using only sector mocks.");
        }
    }

    return {
        timestamp: new Date(),
        sector: sector,
        ...data,
        summary: `Market Outlook for ${sector}: ${data.majorTrend}`
    };
}

module.exports = {
    getMarketTrendData
};
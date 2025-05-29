const axios = require('axios');

require('dotenv').config();
function processAlphaVantageQuote(data) {
    const quote = data?.['Global Quote']; 
    if (!quote || Object.keys(quote).length === 0) {
        console.warn("Alpha Vantage response did not contain valid 'Global Quote' data.");
         return {
            sentiment: "unknown",
            summary: "Market trend data currently unavailable (Invalid API response).",
            relevantIndices: [],
        };
    }

    const changePercentStr = quote['10. change percent'];
    if (typeof changePercentStr !== 'string') {
         console.warn("Could not find '10. change percent' in Alpha Vantage response:", quote);
         return {
            sentiment: "unknown",
            summary: "Market trend data currently unavailable (Missing change percent).",
            relevantIndices: [],
        };
    }

    const changePercent = parseFloat(changePercentStr.replace('%', ''));

    let sentiment = "neutral";
    if (changePercent > 0.5) { 
        sentiment = "positive";
    } else if (changePercent < -0.5) { 
        sentiment = "negative";
    }

    return {
        sentiment: sentiment,
        summary: `General market sentiment appears ${sentiment}. S&P 500 (SPY) daily change: ${changePercent.toFixed(2)}%.`,
        relevantIndices: [
            { name: "S&P 500 (SPY)", changePercent: changePercent }
        ],

    };
}


async function getMarketTrendData() {
    const apiKey = process.env.MARKET_DATA_API_KEY;
    const provider = process.env.MARKET_DATA_API_PROVIDER;

    if (provider !== 'AlphaVantage' || !apiKey) {
        console.warn(`Market Data Provider is not 'AlphaVantage' or API Key is missing in .env. Configured Provider: ${provider}. Returning fallback data.`);
        return {
            sentiment: "unknown",
            summary: "Market data configuration missing or incorrect.",
            relevantIndices: [],
        };
    }

    const symbol = 'SPY'; 
    const alphaVantageUrl = `https://www.alphavantage.co/query`;

    try {
        console.log(`Workspaceing market data from Alpha Vantage for symbol: ${symbol}`);
        const response = await axios.get(alphaVantageUrl, {
            params: {
                function: 'GLOBAL_QUOTE', 
                symbol: symbol,
                apikey: apiKey
            }
        });

        if (response.data?.Note) {
             console.warn("Alpha Vantage API Limit Note:", response.data.Note);
             return {
                 sentiment: "unknown",
                 summary: "Market trend data potentially limited by API usage.",
                 relevantIndices: [],
                 apiNote: response.data.Note
             };
        }
         if (response.data?.['Error Message']) {
             console.error("Alpha Vantage API Error:", response.data['Error Message']);
             throw new Error(`Alpha Vantage API Error: ${response.data['Error Message']}`);
         }

        const trends = processAlphaVantageQuote(response.data);
        return trends;

    } catch (error) {
        console.error(`Error fetching market data from ${provider}:`, error.response?.data || error.message);
        return {
            sentiment: "unknown",
            summary: "Failed to fetch market data due to an error.",
            relevantIndices: [],
        };
    }
}

module.exports = { getMarketTrendData };
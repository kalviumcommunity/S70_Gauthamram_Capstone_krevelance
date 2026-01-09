import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

const PredictionChart = ({ historicalData, forecastData }) => {


    const combinedData = [];

    // Add Historical
    if (historicalData && historicalData.length > 0) {
        historicalData.forEach(item => {
            combinedData.push({
                name: item.name,
                historic: item.value,
                forecast: null
            });
        });
    }

    if (forecastData && forecastData.length > 0) {
        // Stitching: Add the last historical point as the start of the forecast line
        if (historicalData && historicalData.length > 0) {
            const lastHistory = historicalData[historicalData.length - 1];
            combinedData.push({
                name: lastHistory.name, // Same x-axis point
                historic: lastHistory.value, // Keep it in historic line (optional, already there)
                forecast: lastHistory.value // ALSO start forecast line here
            });
        }

        forecastData.forEach(item => {
            combinedData.push({
                name: item.month,
                historic: null,
                forecast: item.revenue || item.value
            });
        });
    }

    // Custom Legend Payload
    const renderLegend = (props) => {
        const { payload } = props;
        return (
            <div className="flex justify-center gap-4 mb-4">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-[#0FCE7C] mr-2"></div>
                    <span className="text-gray-300 text-sm">Present Data</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-[#FF4D4D] mr-2"></div>
                    <span className="text-gray-300 text-sm">Future Prediction</span>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-[350px] bg-white/5 p-4 rounded-lg border border-white/10 relative">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold text-lg">Revenue Projection & Growth</h3>
                {/* Optional: Add growth % badge here if available */}
            </div>


            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#666"
                        tick={{ fill: '#888', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="#666"
                        tick={{ fill: '#888', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value) => [`₹${value.toLocaleString()}`, ""]}
                    />
                    <Legend content={renderLegend} verticalAlign="top" height={36} />

                    <Line
                        type="monotone"
                        dataKey="historic"
                        stroke="#0FCE7C"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#0FCE7C', strokeWidth: 0 }}
                        activeDot={{ r: 6 }}
                        name="Present Data"
                        connectNulls={true}
                    />
                    <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="#FF4D4D"
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        dot={{ r: 4, fill: '#FF4D4D', strokeWidth: 0 }}
                        name="Future Prediction"
                    />
                </LineChart>
            </ResponsiveContainer>

            {(!forecastData || forecastData.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg backdrop-blur-sm z-10">
                    <div className="text-center p-4 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl">
                        <p className="text-white font-semibold mb-2">Analysis Required</p>
                        <p className="text-gray-400 text-sm mb-4">Run analysis on this file to see future predictions.</p>
                        <a href="/analysis" className="bg-[#0FCE7C] text-black text-xs font-bold py-2 px-4 rounded hover:bg-[#0FCE96] transition">
                            Go to Analysis
                        </a>
                    </div>
                </div>
            )}
        </div>

    );
};

export default PredictionChart;

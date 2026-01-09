import React from "react";
import PredictionChart from "./PredictionChart";

const ChartsSection = ({ revenueData, profitData, forecastData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="glass-card rounded-lg p-4">
        <PredictionChart
          title="Revenue Growth"
          historicalData={revenueData}
          forecastData={forecastData}
          forecastKey="revenue"
        />
      </div>
      <div className="glass-card rounded-lg p-4">
        <PredictionChart
          title="Profit Growth"
          historicalData={profitData}
          forecastData={forecastData}
          forecastKey="profit"
        />
      </div>
    </div>
  );
};

export default ChartsSection;

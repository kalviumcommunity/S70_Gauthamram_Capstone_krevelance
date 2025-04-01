import React from "react";
import LineChart from "../ui-custom/LineChart";

const ChartsSection = ({ revenueData, profitData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="glass-card rounded-lg p-4">
        <LineChart
          data={revenueData}
          height={300}
          title="Revenue Growth"
          subtitle="Monthly revenue in rupees"
        />
      </div>
      <div className="glass-card rounded-lg p-4">
        <LineChart
          data={profitData}
          height={300}
          title="Profit Growth"
          subtitle="Monthly profit in rupees"
        />
      </div>
    </div>
  );
};

export default ChartsSection;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LineChart from "../components/ui-custom/LineChart";
import {Lock,Zap,BarChart,PieChart,TrendingUp,AlertTriangle,Info,CheckCircle,} from "lucide-react";
import Navbar1 from "../components/layout/Navbar1";

const Badge = ({ className, variant, ...props }) => {
  let baseClasses =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  let variantClasses = "";

  switch (variant) {
    case "default":
      variantClasses =
        "border-transparent bg-primary text-primary-foreground hover:bg-primary/80";
      break;
    case "secondary":
      variantClasses =
        "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80";
      break;
    case "destructive":
      variantClasses =
        "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80";
      break;
    case "outline":
      variantClasses = "text-foreground";
      break;
    default:
      variantClasses =
        "border-transparent bg-primary text-primary-foreground hover:bg-primary/80";
  }

  const combinedClasses = `${baseClasses} ${variantClasses} ${
    className || ""
  }`.trim();
  return <div className={combinedClasses} {...props} />;
};

const Analysis = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const isPremium = false;

  const revenueData = [
    { name: "Jan", value: 4000 },
    { name: "Feb", value: 6000 },
    { name: "Mar", value: 8000 },
    { name: "Apr", value: 10000 },
    { name: "May", value: 12000 },
    { name: "Jun", value: 16000 },
    { name: "Jul", value: 18000 },
    { name: "Aug", value: 20000 },
    { name: "Sep", value: 19000 },
    { name: "Oct", value: 22000 },
    { name: "Nov", value: 25000 },
    { name: "Dec", value: 30000 },
  ];

  const expensesData = [
    { name: "Jan", value: 2000 },
    { name: "Feb", value: 2200 },
    { name: "Mar", value: 3000 },
    { name: "Apr", value: 4000 },
    { name: "May", value: 4500 },
    { name: "Jun", value: 5000 },
    { name: "Jul", value: 5500 },
    { name: "Aug", value: 6000 },
    { name: "Sep", value: 5800 },
    { name: "Oct", value: 6500 },
    { name: "Nov", value: 7000 },
    { name: "Dec", value: 7500 },
  ];

  const insightsList = [
    {
      id: 1,
      title: "Increasing Revenue Trend",
      description:
        "Your revenue has been steadily increasing over the past 6 months, with an average growth rate of 12.5% month-over-month.",
      type: "positive",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      id: 2,
      title: "Expense Ratio Warning",
      description:
        "Your expense to revenue ratio is currently at 35%, which is higher than the industry average of 30%. Consider reviewing your operational costs.",
      type: "warning",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      id: 3,
      title: "Profit Margin Improvement",
      description:
        "Your profit margin has improved by 5% compared to the previous quarter, showing effective cost management.",
      type: "positive",
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      id: 4,
      title: "Cash Flow Information",
      description:
        "Your cash flow remains stable, with sufficient liquidity to cover operational expenses for the next 6 months.",
      type: "info",
      icon: <Info className="h-5 w-5" />,
    },
  ];

  return (
    <div className="page-container py-16">
        <Navbar1/>
      <div className="page-header">
        <h1 className="page-title text-left text-4xl">Financial Analysis</h1>
        <p className="text-left my-5 text-[#C6C6C6]">
          Gain insights into your financial performance and discover
          opportunities for growth
        </p>
      </div>

      <div className="mt-8">
        <div className="tabs">
          <div className="tabs-list space-x-14 mb-8 bg-[#F1F1F1] text-black rounded-lg p-1 ">
            <button
              className={`tabs-trigger px-30 py-1 rounded-md ${activeTab === "overview" ? "bg-[#0FCE7C]" : ""}`}onClick={() => setActiveTab("overview")}>
              Overview
            </button>
            <button
              className={`tabs-trigger px-30 py-1 rounded-md ${
                activeTab === "trends" ? "bg-[#0FCE7C]" : ""
              }`}
              onClick={() => setActiveTab("trends")}
            >
              Trends & Forecasts
            </button>
            <button
              className={`tabs-trigger px-30 py-1 rounded-md ${activeTab === "ai" ? "bg-[#0FCE7C]" : ""} ${!isPremium ? "disabled opacity-50 cursor-not-allowed" : ""}`}onClick={() => !isPremium && setActiveTab("ai")}disabled={!isPremium}>
              AI Insights
              {!isPremium && <Lock className="ml-2 h-4 w-4 inline-block" />}
            </button>
          </div>
          <div className="tabs-content">
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-card rounded-lg p-4">
                    <LineChart
                      data={revenueData}
                      height={300}
                      title="Revenue Analysis"
                      subtitle="Monthly revenue data with trend analysis"
                    />
                  </div>
                  <div className="glass-card rounded-lg p-4">
                    <LineChart
                      data={expensesData}
                      height={300}
                      title="Expense Analysis"
                      subtitle="Monthly expense breakdown"
                    />
                  </div>
                </div>

                <div className="glass-card rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 text-white text-left">
                    Key Insights
                  </h2>
                  <div className="space-y-4">
                    {insightsList.map((insight) => (
                      <div
                        key={insight.id}
                        className="p-4 border border-white/10 rounded-md"
                      >
                        <div className="flex items-start">
                          <div
                            className={`p-2 rounded-full mr-3 ${
                              insight.type === "positive"
                                ? "bg-green-500/20 text-green-500"
                                : insight.type === "warning"
                                ? "bg-amber-500/20 text-amber-500"
                                : "bg-blue-500/20 text-blue-500"
                            }`}
                          >
                            {insight.icon}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium text-white">
                                {insight.title}
                              </h3>
                              <Badge
                                // Usage of Badge remains the same
                                variant="outline"
                                className={
                                  insight.type === "positive"
                                    ? "ml-2 bg-green-500/20 text-green-500 border-transparent"
                                    : insight.type === "warning"
                                    ? "ml-2 bg-amber-500/20 text-amber-500 border-transparent"
                                    : "ml-2 bg-blue-500/20 text-blue-500 border-transparent"
                                }
                              >
                                {insight.type}
                              </Badge>
                            </div>
                            <p className="text-gray-400 mt-1">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "trends" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-card rounded-lg p-6">
                    <h2 className="text-xl text-left font-bold mb-4 text-white">
                      Revenue Forecast
                    </h2>
                    <p className="text-gray-400 mb-4 text-left ">
                      Based on current trends, your projected revenue growth for
                      the next quarter is estimated at 15%.
                    </p>
                    <div className="p-4 bg-[#0FCE7C]/10 rounded-md text-left">
                      <div className="flex items-center mb-2">
                        <BarChart className="h-5 w-5 text-[#0FCE7C] mr-2" />
                        <h3 className="font-medium text-white">
                          Revenue Projection
                        </h3>
                      </div>
                      <p className="text-gray-400">Q3 2023: ₹245,500</p>
                      <p className="text-gray-400">
                        Q4 2023: ₹282,325 (projected)
                      </p>
                    </div>
                  </div>

                  <div className="glass-card rounded-lg p-6 text-left ">
                    <h2 className="text-xl font-bold mb-4 text-white">
                      Expense Forecast
                    </h2>
                    <p className="text-gray-400 mb-4">
                      Your expense growth rate is currently at 8%, which is
                      below your revenue growth rate, indicating improving
                      profitability.
                    </p>
                    <div className="p-4 bg-[#0FCE7C]/10 rounded-md">
                      <div className="flex items-center mb-2">
                        <PieChart className="h-5 w-5 text-[#0FCE7C] mr-2" />
                        <h3 className="font-medium text-white">
                          Expense Projection
                        </h3>
                      </div>
                      <p className="text-gray-400">Q3 2023: ₹98,700</p>
                      <p className="text-gray-400">
                        Q4 2023: ₹106,596 (projected)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-lg p-6 text-left ">
                  <h2 className="text-xl font-bold mb-4 text-white">
                    Growth Opportunities
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Based on your financial data, we've identified the following
                    growth opportunities:
                  </p>

                  <div className="space-y-4">
                    <div className="p-4 border border-white/10 rounded-md">
                      <h3 className="font-medium text-white mb-2">
                        Invest in Marketing
                      </h3>
                      <p className="text-gray-400">
                        Your marketing ROI is currently 3.5x. Increasing your
                        marketing budget by 20% could potentially yield a 7%
                        increase in overall revenue.
                      </p>
                    </div>

                    <div className="p-4 border border-white/10 rounded-md">
                      <h3 className="font-medium text-white mb-2">
                        Operational Efficiency
                      </h3>
                      <p className="text-gray-400">
                        Streamlining your operational processes could reduce
                        expenses by up to 12%, directly improving your bottom
                        line.
                      </p>
                    </div>

                    <div className="p-4 border border-white/10 rounded-md">
                      <h3 className="font-medium text-white mb-2">
                        Product Expansion
                      </h3>
                      <p className="text-gray-400">
                        Data suggests demand for additional services. Expanding
                        your product line could increase customer lifetime value
                        by 25%.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="glass-card rounded-lg p-8 text-center">
                <Zap className="h-16 w-16 text-krevelance-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4 text-white">
                  Unlock AI-Powered Financial Insights
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto mb-6">
                  Upgrade to our Premium plan to access advanced AI-powered
                  financial insights, predictive analytics, and personalized
                  recommendations.
                </p>
                <button
                  className="bg-krevelance-primary hover:bg-krevelance-primary-light text-black px-4 py-2 rounded font-semibold" // Added some basic button styling
                  onClick={() => navigate("/pricing")}
                >
                  Upgrade to Premium
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;

import React from "react";
import {
    ArrowUpIcon,
    ArrowDownIcon,
    TrendingUp,
    Users,
    MinusIcon, 
    Activity,
} from "lucide-react";

const StatCard = ({
    title,
    value,
    change, 
    icon,
    description,
    className = "",
    isPrimary = false,
    trend,
    predictionTimeframe 
}) => {
    const isPositive = trend === "up" && change !== null;
    const isNegative = trend === "down" && change !== null;
    const isPrediction = !!predictionTimeframe; 

    const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;

    return (
        <div
            className={`glass-card glass-card-hover rounded-lg p-5 flex flex-col ${isPrimary ? "border-[#0FCE7C]/20" : ""
                } ${className}`}
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-gray-400">
                    {title} {isPrediction ? `(${predictionTimeframe})` : ""}
                </h3>
                {icon && <div className="text-[#0FCE7C]">{icon}</div>}
            </div>

            <div className="flex-grow flex items-center">
                <span className={`text-2xl font-semibold ${isPrimary ? "text-[#0FCE7C]" : "text-white"}`}>
                    {formattedValue !== null && formattedValue !== undefined ? formattedValue : 'N/A'}
                </span>
            </div>

            {change !== null && change !== undefined && !isPrediction && (
                <div className="flex items-center mt-2">
                    {isPositive ? (
                        <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : isNegative ? (
                        <ArrowDownIcon className="h-4 w-4 text-red-400 mr-1" />
                    ) : ( 
                         <MinusIcon className="h-4 w-4 text-gray-500 mr-1" />
                    )}

                    <span className={`text-xs ${isPositive ? "text-green-500" : isNegative ? "text-red-400" : "text-gray-400"}`}>
                        {isPositive ? "+" : ""}
                        {change}% {isPositive ? "increase" : isNegative ? "decrease" : "no change"}
                    </span>
                     
                </div>
            )}

             {description && !isPrediction && <p className="text-xs text-gray-400 mt-2">{description}</p>}
             

        </div>
    );
};

const StatCardsSection = ({ statsInput }) => {
    const stats = [
        {
            title: "Total Revenue",
            icon: "₹", 
            ...statsInput?.totalRevenue
        },
        {
            title: "Total Expenses",
            icon: <TrendingUp className="h-5 w-5 transform scale-y-[-1]" />, 
            ...statsInput?.totalExpenses
        },
        {
            title: "Net Profit",
            icon: <TrendingUp className="h-5 w-5" />,
            ...statsInput?.netProfit
        },
        {
            title: "Active Users",
            icon: <Activity className="h-5 w-5" />, 
             predictionTimeframe: statsInput?.activeUsers?.predictionTimeframe,
            value: statsInput?.activeUsers?.value, 
            change: statsInput?.activeUsers?.change,
            trend: statsInput?.activeUsers?.trend, 
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <StatCard
                    key={index}
                    title={stat.title}
                    value={stat.value ?? null} 
                    change={stat.change ?? null} 
                    icon={stat.icon}
                    description={stat.description}
                    trend={stat.trend ?? null}
                    predictionTimeframe={stat.predictionTimeframe}/>
            ))}
        </div>
    );
};

export default StatCardsSection;
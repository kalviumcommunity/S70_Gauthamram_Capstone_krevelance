import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import {Lock,Zap,BarChart,PieChart,TrendingUp,AlertTriangle,Info,CheckCircle,} from "lucide-react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import LineChart from "../components/ui-custom/LineChart";
import Navbar1 from "../components/layout/Navbar1";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Badge = ({ className, variant, ...props }) => {
    let baseClasses =
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
    let variantClasses = "";
    switch (variant) {
        case "positive":
            variantClasses = "ml-2 bg-green-500/20 text-green-400 border-transparent";
            break;
        case "warning":
            variantClasses = "ml-2 bg-amber-500/20 text-amber-400 border-transparent";
            break;
        case "info":
            variantClasses = "ml-2 bg-blue-500/20 text-blue-400 border-transparent";
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

const iconMap = {
    TrendingUp: <TrendingUp className="h-5 w-5" />,
    AlertTriangle: <AlertTriangle className="h-5 w-5" />,
    CheckCircle: <CheckCircle className="h-5 w-5" />,
    Info: <Info className="h-5 w-5" />,
    Default: <Info className="h-5 w-5" />,
};

function getIconComponent(iconName) {
    const name =
        typeof iconName === "string" && iconMap[iconName] ? iconName : "Default";
    return iconMap[name];
}

const Analysis = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const navigate = useNavigate();

    const [analysisData, setAnalysisData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalysisData = async () => {
            const token = localStorage.getItem("authToken");
             if (!token) {
                console.log("No auth token found, redirecting to login.");
                navigate("/login");
                return;
             }
            setIsLoading(true);
            setError(null);
            setAnalysisData(null);

            try {
                const response = await api.get('/analysis/financials');

                setAnalysisData(response.data);
            } catch (err) {
                console.error("Failed to fetch analysis data:", err);
                let errorMsg = "Failed to load analysis data.";
                let toastType = "error";
                if (err.response) {
                    errorMsg =
                        err.response.data?.message ||
                        `Server Error: ${err.response.status}`;
                    if (err.response.status === 401) {
                        errorMsg = "Session expired. Please log in again.";
                        toastType = "warning";
                        setTimeout(() => navigate("/login"), 1500);
                    }
                } else if (err.request) {
                    errorMsg = "Net  Error: Could not connect to the server.";
                } else {
                    errorMsg = `Request setup error: ${err.message}`;
                }
                setError(errorMsg);
                if (toast[toastType]) {
                    toast[toastType](errorMsg, {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastType === "warning" ? "colored" : "dark",
                    });
                } else {
                     toast.error(errorMsg, {
                        position: "top-right", autoClose: 3000, hideProgressBar: false,
                        closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, theme: "dark",
                     });
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalysisData();
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="page-container py-16">
                <Navbar1 />
                <div className="mb-8">
                    <div className="page-title-container rounded-lg p-6 ">
                        <SkeletonTheme baseColor="#333333" highlightColor="#444">
                            <Skeleton count={6} />
                        </SkeletonTheme>
                    </div>
                    <div className="flex space-x-4">
                        <div className="page-title-container rounded-lg pt-6 px-6 w-1/2">
                            <SkeletonTheme baseColor="#333333" highlightColor="#444">
                                <Skeleton count={1} />
                                <Skeleton count={2} width="40%" />
                                <Skeleton count={3} width="70%" />
                                <Skeleton count={2} />
                                <Skeleton count={1} width="50%" />
                                <Skeleton count={1} width="80%" />
                            </SkeletonTheme>
                        </div>
                        <div className="page-title-container rounded-lg pt-6 px-6 w-1/2">
                            <SkeletonTheme baseColor="#333333" highlightColor="#444">
                                <Skeleton count={3} />
                                <Skeleton count={1} width="30%" />
                                <Skeleton count={2} width="70%" />
                                <Skeleton count={2} />
                                <Skeleton count={2} width="50%" />
                            </SkeletonTheme>
                        </div>
                    </div>
                </div>

                <div className="page-title-container rounded-lg p-6 ">
                    <SkeletonTheme baseColor="#333333" highlightColor="#444">
                        <Skeleton count={6} />
                    </SkeletonTheme>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container py-16">
                <Navbar1 />
                <h1 className="page-title text-left text-4xl mb-5">
                    Financial Analysis
                </h1>
                <ToastContainer />
            </div>
        );
    }

    if (!analysisData) {
        return (
            <div className="page-container py-16 text-center">
                <Navbar1 />
                <h1 className="page-title text-left text-4xl mb-5">
                    Financial Analysis
                </h1>
                <div className="flex justify-center items-center min-h-[300px]">
                    <Info className="h-8 w-8 mr-2 text-gray-500" />
                    <p>No analysis data available at the moment.</p>
                </div>
                <ToastContainer />
            </div>
        );
    }
    const isPremiumUser =
        analysisData.userTier === "pro" || analysisData.userTier === "enterprise";

    return (
        <div className="page-container py-16">
            <Navbar1 />
            <div className="page-header">
                <h1 className="page-title text-left text-4xl">Financial Analysis</h1>
                <p className="text-left my-5 text-[#C6C6C6]">
                    Gain insights into your financial performance and discover
                    opportunities for growth
                </p>
            </div>

            <div className="mt-8">
                <div className="tabs">
                    <div className="tabs-list space-x-4 md:space-x-14 mb-8 bg-[#F1F1F1] text-black rounded-lg p-1 inline-flex flex-wrap">
                        <button
                            className={`tabs-trigger px-4 md:px-8 py-1 rounded-md whitespace-nowrap ${
                                activeTab === "overview"
                                    ? "bg-[#0FCE7C] text-white font-semibold"
                                    : "hover:bg-gray-200"
                            }`}
                            onClick={() => setActiveTab("overview")}
                        >
                            Overview
                        </button>
                        <button
                            className={`tabs-trigger px-4 md:px-8 py-1 rounded-md whitespace-nowrap ${
                                activeTab === "trends"
                                    ? "bg-[#0FCE7C] text-white font-semibold"
                                    : "hover:bg-gray-200"
                            }`}
                            onClick={() => setActiveTab("trends")}
                        >
                            Trends & Forecasts
                        </button>
                        <button
                            className={`tabs-trigger px-4 md:px-8 py-1 rounded-md flex items-center whitespace-nowrap ${
                                activeTab === "ai"
                                    ? "bg-[#0FCE7C] text-white font-semibold"
                                    : ""
                            } ${
                                !isPremiumUser
                                    ? "disabled opacity-50 cursor-not-allowed"
                                    : "hover:bg-gray-200"
                            }`}
                            onClick={() => isPremiumUser && setActiveTab("ai")}
                            disabled={!isPremiumUser}
                        >
                            AI Insights
                            {!isPremiumUser && <Lock className="ml-2 h-4 w-4 inline-block" />}
                        </button>
                    </div>
                    <div className="tabs-content">
                        {activeTab === "overview" && analysisData.overview && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="glass-card rounded-lg p-4">
                                        <LineChart
                                            data={analysisData.overview.revenueData || []}
                                            height={300}
                                            title="Revenue Analysis"
                                            subtitle="Monthly revenue data"
                                        />
                                    </div>
                                    <div className="glass-card rounded-lg p-4">
                                        <LineChart
                                            data={analysisData.overview.expensesData || []}
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
                                        {(analysisData.overview.keyInsights || []).map(
                                            (insight, index) => (
                                                <div
                                                    key={insight.id || index}
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
                                                            {getIconComponent(insight.icon)}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center">
                                                                <h3 className="font-medium text-white">
                                                                    {insight.title || "Insight"}
                                                                </h3>
                                                                <Badge variant={insight.type || "info"}>
                                                                    {insight.type || "info"}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-gray-400 mt-1">
                                                                {insight.description ||
                                                                    "No description available."}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                        {(!analysisData.overview.keyInsights ||
                                            analysisData.overview.keyInsights.length === 0) && (
                                            <p className="text-gray-400">
                                                No key insights available yet.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === "trends" && analysisData.trends && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="glass-card rounded-lg p-6">
                                        <h2 className="text-xl text-left font-bold mb-4 text-white">
                                            Revenue Forecast
                                        </h2>
                                        <p className="text-gray-400 mb-4 text-left ">
                                            {analysisData.trends.revenueForecast ||
                                                "Revenue forecast not available."}
                                        </p>
                                        <div className="p-4 bg-[#0FCE7C]/10 rounded-md text-left">
                                            <div className="flex items-center mb-2">
                                                <BarChart className="h-5 w-5 text-[#0FCE7C] mr-2" />
                                                <h3 className="font-medium text-white">Projection</h3>
                                            </div>
                                            <p className="text-gray-400">
                                                Detailed projections coming soon.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="glass-card rounded-lg p-6 text-left ">
                                        <h2 className="text-xl font-bold mb-4 text-white">
                                            Expense Forecast
                                        </h2>
                                        <p className="text-gray-400 mb-4">
                                            {analysisData.trends.expenseForecast ||
                                                "Expense forecast not available."}
                                        </p>
                                        <div className="p-4 bg-[#0FCE7C]/10 rounded-md">
                                            <div className="flex items-center mb-2">
                                                <PieChart className="h-5 w-5 text-[#0FCE7C] mr-2" />
                                                <h3 className="font-medium text-white">Projection</h3>
                                            </div>
                                            <p className="text-gray-400">
                                                Detailed projections coming soon.
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
                                        potential growth opportunities:
                                    </p>
                                    <div className="space-y-4">
                                        {(analysisData.trends.growthOpportunities || []).map(
                                            (opp, index) => (
                                                <div
                                                    key={opp.title || index}
                                                    className="p-4 border border-white/10 rounded-md"
                                                >
                                                    <h3 className="font-medium text-white mb-2">
                                                        {opp.title || "Opportunity"}
                                                    </h3>
                                                    <p className="text-gray-400">
                                                        {opp.description || "No description available."}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                        {(!analysisData.trends.growthOpportunities ||
                                            analysisData.trends.growthOpportunities.length === 0) && (
                                            <p className="text-gray-400">
                                                No specific growth opportunities identified yet.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "ai" &&
                            (isPremiumUser && analysisData.aiInsights ? (
                                <div className="glass-card rounded-lg p-8 text-left">
                                    <h2 className="text-2xl font-bold mb-4 text-white">
                                        <Zap className="inline-block h-6 w-6 mr-2 text-[#0FCE7C]" />
                                        AI Recommendations
                                    </h2>
                                    <div className="text-gray-300 whitespace-pre-wrap prose prose-invert max-w-none">
                                        {analysisData.aiInsights.content ||
                                            "No detailed recommendations available at this time."}
                                    </div>
                                </div>
                            ) : (
                                <div className="glass-card rounded-lg p-6">
                                    <div className="flex items-center">
                                        <Lock className="h-5 w-5 mr-2 text-gray-500" />
                                        <h2 className="text-xl font-bold text-white">
                                            AI Insights (Premium Feature)
                                        </h2>
                                    </div>
                                    <p className="text-gray-400 mt-2">
                                        Upgrade to a Pro or Enterprise plan to unlock AI-powered
                                        financial recommendations.
                                    </p>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Analysis;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { Lock, Zap, BarChart, PieChart, TrendingUp, AlertTriangle, Info, CheckCircle, } from "lucide-react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import PredictionChart from "../components/dashboard/PredictionChart";
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

    const combinedClasses = `${baseClasses} ${variantClasses} ${className || ""
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
    const [uploads, setUploads] = useState([]);
    const [selectedUploadIds, setSelectedUploadIds] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUploads = async () => {
            const token = localStorage.getItem("authToken");
            if (!token) return;
            try {
                const res = await api.get('/analysis/history');
                setUploads(res.data);
            } catch (err) {
                console.error("Failed to fetch history", err);
            }
        };
        fetchUploads();
    }, []);

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
            let url = '/analysis/financials';
            if (selectedUploadIds.length > 0) {
                url += `?uploadId=${selectedUploadIds.join(',')}`;
            }
            const response = await api.get(url);

            setAnalysisData(response.data);
            // toast.success("Data loaded."); // Optional: verify it works first
        } catch (err) {
            console.error("Failed to fetch analysis data:", err);
            let errorMsg = "Failed to load analysis data.";
            setError("Failed to load data.");
            toast.error("Failed to load analysis data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysisData();
    }, [navigate]); // Removed selectedUploadIds to prevent auto-fetch/shaking

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
                <div className="text-center mb-8">
                    <button
                        onClick={async () => {
                            setIsLoading(true);
                            try {
                                await api.post('/analysis/analyze');
                                const response = await api.get('/analysis/financials');
                                setAnalysisData(response.data);
                                toast.success("Analysis complete!");
                            } catch (e) { toast.error("Analysis failed."); }
                            finally { setIsLoading(false); }
                        }}
                        className="bg-[#0FCE7C] text-black font-semibold py-2 px-4 rounded hover:bg-[#0FCE96]"
                    >
                        Run Initial Analysis
                    </button>
                </div>
                <ToastContainer />
            </div>
        );
    }
    const isPremiumUser =
        analysisData.userTier === "pro" || analysisData.userTier === "enterprise";

    const handleRunAnalysis = async () => {
        console.log("Running Analysis with IDs:", selectedUploadIds);
        setIsLoading(true);
        try {
            const params = {};
            if (selectedUploadIds.length > 0) {
                params.uploadId = selectedUploadIds.join(',');
            }

            await api.post('/analysis/analyze', {}, { params });

            const response = await api.get('/analysis/financials', { params });
            setAnalysisData(response.data);
            toast.success("Analysis complete! Dashboard updated.");
        } catch (error) {
            console.error("Analysis failed", error);
            toast.error("Failed to run analysis. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container py-16">
            <Navbar1 />
            <div className="page-header flex justify-between items-end">
                <div>
                    <h1 className="page-title text-left text-4xl">Financial Analysis</h1>

                    <div className="relative my-4 flex gap-10">
                        {/* Multi-Select Dropdown */}
                        <div className="relative w-[300px]">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#0FCE7C]"
                            >
                                <span className="truncate">
                                    {selectedUploadIds.length === 0
                                        ? "All Combined Data"
                                        : `${selectedUploadIds.length} File${selectedUploadIds.length > 1 ? 's' : ''} Selected`}
                                </span>
                                <span className="ml-2 text-gray-400">▼</span>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute z-[100] mt-1 w-full bg-[#1A1A1A] border border-white/10 rounded-md shadow-lg max-h-60 overflow-auto">
                                    <div
                                        className="px-3 py-2 hover:bg-white/5 cursor-pointer flex items-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedUploadIds([]); // Clear to select ALL
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        <div className={`w-4 h-4 mr-2 border rounded flex items-center justify-center ${selectedUploadIds.length === 0 ? 'bg-[#0FCE7C] border-[#0FCE7C]' : 'border-gray-500'}`}>
                                            {selectedUploadIds.length === 0 && <CheckCircle className="h-3 w-3 text-black" />}
                                        </div>
                                        <span className="text-sm text-gray-200">All Combined Data</span>
                                    </div>

                                    {uploads.map((upload) => (
                                        <div
                                            key={upload._id}
                                            className="px-3 py-2 hover:bg-white/5 cursor-pointer flex items-center"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedUploadIds(prev => {
                                                    const isSelected = prev.includes(upload._id);
                                                    if (isSelected) {
                                                        return prev.filter(id => id !== upload._id);
                                                    } else {
                                                        return [...prev, upload._id];
                                                    }
                                                });
                                            }}
                                        >
                                            <div className={`w-4 h-4 mr-2 border rounded flex items-center justify-center ${selectedUploadIds.includes(upload._id) ? 'bg-[#0FCE7C] border-[#0FCE7C]' : 'border-gray-500'}`}>
                                                {selectedUploadIds.includes(upload._id) && <CheckCircle className="h-3 w-3 text-black" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-200 truncate">{upload.originalFileName}</span>
                                                <span className="text-xs text-gray-500">{new Date(upload.uploadDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {analysisData.metadata && (
                            <div className="text-left mt-2 mb-4 bg-white/5 inline-block px-3 py-1 rounded text-sm text-gray-400 border border-white/10">
                                <span className="mr-3">Source: <span className="text-white">
                                    {selectedUploadIds.length > 0
                                        ? (selectedUploadIds.length === 1 ? "1 File Selected" : "Multiple/Combined Data")
                                        : "All Combined Data"}
                                </span></span>
                                <span>Analyzed: <span className="text-white">{new Date(analysisData.analysisDate || analysisData.metadata?.uploadDate || Date.now()).toLocaleDateString()}</span></span>
                            </div>
                        )}
                    </div>

                </div>
                <div className="-mt-10 flex gap-4">
                    <button
                        onClick={fetchAnalysisData}
                        className="bg-white/10 text-white font-semibold py-2 px-4 rounded hover:bg-white/20 transition duration-300 border border-white/10"
                    >
                        Load Selected Data
                    </button>
                    <button
                        onClick={handleRunAnalysis}
                        className="bg-[#0FCE7C] text-black font-semibold py-2 px-4 rounded hover:bg-[#0FCE96] transition duration-300"
                    >
                        Run New Analysis
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <div className="tabs">
                    <div className="tabs-list space-x-4 md:space-x-14 mb-8 bg-[#F1F1F1] text-black rounded-lg p-1 inline-flex flex-wrap">
                        <button
                            className={`tabs-trigger px-4 md:px-8 py-1 rounded-md whitespace-nowrap ${activeTab === "overview"
                                ? "bg-[#0FCE7C] text-white font-semibold"
                                : "hover:bg-gray-200"
                                }`}
                            onClick={() => setActiveTab("overview")}
                        >
                            Overview
                        </button>
                        <button
                            className={`tabs-trigger px-4 md:px-8 py-1 rounded-md whitespace-nowrap ${activeTab === "trends"
                                ? "bg-[#0FCE7C] text-white font-semibold"
                                : "hover:bg-gray-200"
                                }`}
                            onClick={() => setActiveTab("trends")}
                        >
                            Trends & Forecasts
                        </button>
                        {/* <button
                            className={`tabs-trigger px-4 md:px-8 py-1 rounded-md flex items-center whitespace-nowrap ${activeTab === "ai"
                                ? "bg-[#0FCE7C] text-white font-semibold"
                                : ""
                                } ${!isPremiumUser
                                    ? "disabled opacity-50 cursor-not-allowed"
                                    : "hover:bg-gray-200"
                                }`}
                            onClick={() => isPremiumUser && setActiveTab("ai")}
                            disabled={!isPremiumUser}
                        >
                            AI Insights
                            {!isPremiumUser && <Lock className="ml-2 h-4 w-4 inline-block" />}
                        </button> */}

                    </div>
                    <div className="tabs-content">
                        {activeTab === "overview" && analysisData.overview && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="glass-card rounded-lg p-4">
                                        <PredictionChart
                                            title="Expense Analysis"
                                            historicalData={analysisData.overview.expensesData || []}
                                            forecastData={analysisData.trends.monthlyForecast || []}
                                            forecastKey="expenses"
                                        />
                                    </div>
                                    <div className="glass-card rounded-lg p-4">
                                        <PredictionChart
                                            title="Profit Analysis"
                                            historicalData={analysisData.overview.revenueData.map((r, i) => ({
                                                name: r.name,
                                                value: r.value - (analysisData.overview.expensesData[i]?.value || 0)
                                            }))}
                                            forecastData={analysisData.trends.monthlyForecast || []}
                                            forecastKey="profit"
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
                                                            className={`p-2 rounded-full mr-3 ${insight.type === "positive"
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
                                                <h3 className="font-medium text-white">Projection Analysis</h3>
                                            </div>
                                            <p className="text-gray-400">
                                                Expected yearly growth of <span className="text-white font-bold">{analysisData.trends.growthPercentage}</span>.
                                                Predicted Net Profit: <span className="text-white font-bold">{analysisData.trends.netProfitForecast}</span>.
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
                                                <h3 className="font-medium text-white">Churn Rate</h3>
                                            </div>
                                            <p className="text-gray-400">
                                                Predicted Churn Rate: <span className="text-white font-bold">{analysisData.trends.churnForecast}</span>.
                                                <br />
                                                <span className="text-xs opacity-70">Lower churn contributes to better expense efficiency.</span>
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

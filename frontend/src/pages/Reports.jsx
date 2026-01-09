import React, { useState, useCallback, forwardRef, useEffect, useRef, useMemo } from "react";
import { FileText, Eye, Calendar, Filter, Search, X } from "lucide-react";
import Navbar1 from "../components/layout/Navbar1";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../api/endpoints";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui-custom/Select";

const Input = forwardRef(
    ({ className, placeholder, value, onChange, ...props }, ref) => {
        return (
            <input
                type="text"
                className={`flex h-10 w-full rounded  px-3 py-2 text-base  file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className}`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

const Badge = ({ className, children, ...props }) => {
    return (
        <div
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};



const Layout = ({ children }) => <div className="layout">{children}</div>;

// --- Modal Component ---
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="glass-card w-full max-w-md p-6 rounded-lg relative border border-white/10 bg-[#1a1a1a]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
                {children}
            </div>
        </div>
    );
};


const PageHeader = ({ title, description }) => {
    return (
        <div className=" mt-4">
            <h1 className="text-4xl font-bold mb-2">{title}</h1>
            {description && (
                <p className="text-gray-400 text-base max-w-2xl">{description}</p>
            )}
        </div>
    );
};

const ReportCard = ({ report, onDownload }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getTypeStyles = (type) => {
        switch (type) {
            case "financial":
                return { bg: "from-blue-500/10 to-blue-600/5", border: "border-blue-500/50", text: "text-blue-400", iconBg: "bg-blue-500/20" };
            case "analysis":
                return { bg: "from-purple-500/10 to-purple-600/5", border: "border-purple-500/50", text: "text-purple-400", iconBg: "bg-purple-500/20" };
            case "forecast":
                return { bg: "from-emerald-500/10 to-emerald-600/5", border: "border-emerald-500/50", text: "text-emerald-400", iconBg: "bg-emerald-500/20" };
            case "tax":
                return { bg: "from-orange-500/10 to-orange-600/5", border: "border-orange-500/50", text: "text-orange-400", iconBg: "bg-orange-500/20" };
            default:
                return { bg: "from-gray-500/10 to-gray-600/5", border: "border-gray-500/50", text: "text-gray-400", iconBg: "bg-gray-500/20" };
        }
    };

    const styles = getTypeStyles(report.type);

    const handleView = () => {
        if (report?.status !== "ready") return;
        api.get(API_ENDPOINTS.REPORTS.VIEW(report._id), { responseType: 'blob' })
            .then(response => {
                const file = new Blob([response.data], { type: 'application/pdf' });
                const fileURL = URL.createObjectURL(file);
                window.open(fileURL, '_blank');
            })
            .catch(err => toast.error("Failed to open report"));
    };

    return (
        <div className={`relative overflow-hidden rounded-xl border ${styles.border} bg-gradient-to-br ${styles.bg} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group shadow-md`}>
            {/* Background Decor */}
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${styles.iconBg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-lg ${styles.iconBg} ${styles.text}`}>
                    <FileText className="h-6 w-6" />
                </div>
                {report.status === "processing" ? (
                    <Badge className="bg-amber-500/20 text-amber-400 animate-pulse border-amber-500/30">Processing</Badge>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={handleView} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white" title="View">
                            <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => onDownload(report._id)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white" title="Download">
                            <div className="flex items-center">
                                {/* Using a standard download icon would be better but keeping text for clarity if needed, attempting icon swap */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            </div>
                        </button>
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${styles.text}`}>{report.type}</span>
                    <span className="text-[10px] text-gray-500">|</span>
                    <span className="text-[10px] text-gray-400 flex items-center"><Calendar className="h-3 w-3 mr-1" /> {formatDate(report.date)}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 leading-tight line-clamp-2" title={report.title}>
                    {report.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                    {report.description}
                </p>

                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${styles.text.replace('text', 'bg')} w-full opacity-30`} />
                </div>
            </div>
        </div>
    );
};

const Reports = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [sortBy, setSortBy] = useState("latest");
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [sortLabel, setSortLabel] = useState("Latest First");
    const [reportsData, setReportsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploads, setUploads] = useState([]);
    const [selectedUploadId, setSelectedUploadId] = useState("");
    const [generating, setGenerating] = useState(false);

    // Fetch Uploads for Dropdown
    useEffect(() => {
        const fetchUploads = async () => {
            try {
                const res = await api.get(API_ENDPOINTS.ANALYSIS.HISTORY);
                setUploads(res.data);
            } catch (err) {
                console.error("Failed to fetch history", err);
            }
        };
        fetchUploads();
    }, []);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(API_ENDPOINTS.REPORTS.LIST);
            setReportsData(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching reports:", err);
            setError("Failed to load reports.");
            toast.error("Failed to load reports.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const filteredReports = useMemo(() => {
        return reportsData
            .filter((report) => {
                if (activeTab !== "all" && report.type !== activeTab) return false;
                if (
                    searchTerm &&
                    !report.title.toLowerCase().includes(searchTerm.toLowerCase())
                )
                    return false;
                return true;
            })
            .sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                if (sortBy === "latest") {
                    return dateB.getTime() - dateA.getTime();
                } else if (sortBy === "oldest") {
                    return dateA.getTime() - dateB.getTime();
                } else if (sortBy === "name") {
                    return a.title.localeCompare(b.title);
                }
                return 0;
            });
    }, [reportsData, activeTab, searchTerm, sortBy]);

    const handleDownload = async (reportId) => {
        const report = reportsData.find((r) => r._id === reportId);
        if (report?.status === "processing") {
            toast.info("Report is still processing...");
            return;
        }

        try {
            const response = await api.get(API_ENDPOINTS.REPORTS.DOWNLOAD(reportId), {
                responseType: 'blob',
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const contentDisposition = response.headers['content-disposition'];
            let fileName = `report-${reportId}.pdf`;
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                if (fileNameMatch.length === 2)
                    fileName = fileNameMatch[1];
            }
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success(`Downloaded ${report.title}`);
        } catch (error) {
            console.error("Download failed", error);
            toast.error("Failed to download report.");
        }
    };


    const openGenerateModal = () => {
        setIsModalOpen(true);
        // Default to first upload or 'all'? Let's keep empty or 'all' if user wants combined.
        // Actually, let's imply "All Combined" is an option.
    };

    const handleConfirmGenerate = async () => {
        setIsModalOpen(false);
        setGenerating(true);
        const toastId = toast.loading("Generating AI Report for selected project...");

        try {
            const response = await api.post(API_ENDPOINTS.REPORTS.GENERATE, {
                uploadId: selectedUploadId || 'all'
            });
            toast.success("Report generated successfully!", { id: toastId });
            setReportsData(prev => [response.data.report, ...prev]);
        } catch (error) {
            console.error("Generation failed", error);
            const msg = error.response?.data?.message || "Failed to generate report.";
            toast.error(msg, { id: toastId });
        } finally {
            setGenerating(false);
        }
    };

    useEffect(() => {
        if (sortBy === "latest") {
            setSortLabel("Latest First");
        } else if (sortBy === "oldest") {
            setSortLabel("Oldest First");
        } else if (sortBy === "name") {
            setSortLabel("Name (A-Z)");
        }
    }, [sortBy]);

    if (loading && reportsData.length === 0) {
        return (
            <div className="text-center py-10 text-white">Loading reports...</div>
        );
    }

    if (error && reportsData.length === 0) {
        return (
            <div className="text-center py-10 text-red-500">
                Error loading reports: {error}
            </div>
        );
    }

    return (
        <Layout>
            <Navbar1 />
            <div className="page-container  ">
                <Toaster />
                <div className="flex flex-col text-left  py-14 ">
                    <PageHeader
                        title="Financial Reports"
                        description="View, download, and generate financial reports for your business"
                    />
                </div>

                <div className="my-8 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative w-full md:w-90 rounded">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            className="pl-10 border bg-white text-black  "
                            placeholder="Search reports..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4">
                        <Select
                            open={isSelectOpen}
                            onOpenChange={setIsSelectOpen}
                            defaultValue={sortBy}
                            onValueChange={(value) => {
                                setSortBy(value);
                                setIsSelectOpen(false);
                            }}
                        >
                            <SelectTrigger
                                className="w-[180px] glass-input bg-[#474747] transition-all duration-300 "
                                onClick={() => setIsSelectOpen(!isSelectOpen)}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Sort by">{sortLabel}</SelectValue>
                            </SelectTrigger>
                            <SelectContent onClose={() => setIsSelectOpen(false)}>
                                <SelectItem
                                    value="latest"
                                    className={"hover:text-[#0FCE7C] hover:scale-105"}
                                    onClick={() => setSortBy("latest")}
                                >
                                    Latest First
                                </SelectItem>
                                <SelectItem
                                    value="oldest"
                                    className={"hover:text-[#0FCE7C] hover:scale-105"}
                                    onClick={() => setSortBy("oldest")}
                                >
                                    Oldest First
                                </SelectItem>
                                <SelectItem
                                    value="name"
                                    className={"hover:text-[#0FCE7C] hover:scale-105"}
                                    onClick={() => setSortBy("name")}
                                >
                                    Name (A-Z)
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <button
                            className="bg-[#0FCE7C] hover:bg-[#0FCE96] rounded-lg px-3 text-black hover:scale-105 transition-all duration-300"
                            onClick={openGenerateModal}
                        >
                            Generate New Report
                        </button>
                    </div>
                </div>

                {/* Generate Report Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Select Project for Report"
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400">
                            Choose which data source you want to generate a report for.
                        </p>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">Project / Upload</label>
                            <Select
                                value={selectedUploadId}
                                onValueChange={setSelectedUploadId}
                            >
                                <SelectTrigger className="w-full bg-white/5 border border-white/10 text-left">
                                    <SelectValue>
                                        {selectedUploadId === 'all' || !selectedUploadId
                                            ? "All Combined Data"
                                            : uploads.find(u => u._id === selectedUploadId)?.originalFileName || "Select Project"
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Combined Data</SelectItem>
                                    {uploads.map((upload) => (
                                        <SelectItem key={upload._id} value={upload._id}>
                                            {upload.originalFileName} ({new Date(upload.uploadDate).toLocaleDateString()})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmGenerate}
                                disabled={generating}
                                className="bg-[#0FCE7C] hover:bg-[#0FCE96] text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                {generating ? "Generating..." : "Generate Report"}
                            </button>
                        </div>
                    </div>
                </Modal>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.map((report) => (
                        <ReportCard
                            key={report._id}
                            report={report}
                            onDownload={() => handleDownload(report._id)}
                        />
                    ))}
                    {filteredReports.length === 0 && !loading && (
                        <div className="col-span-full text-center py-20 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-white/10 rounded-full">
                                    <FileText className="h-8 w-8 text-[#0FCE7C]" />
                                </div>
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">No reports found</h3>
                            <p className="text-gray-400">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Reports;


import React, { useState, useCallback, forwardRef, useEffect, useRef, useMemo } from 'react';
import { FileText, Download, Eye, BarChart, PieChart, Calendar, Filter, Search, Check } from 'lucide-react';
import Navbar1 from '../components/layout/Navbar1';

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
Input.displayName = 'Input';

const Badge = ({ className, children, ...props }) => {
    return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`} {...props}>
        {children}
    </div>
    );
};

const Select = ({ children, defaultValue, onValueChange, value, ...props }) => {
    const [selectedValue, setSelectedValue] = useState(value || defaultValue);
    const [isOpen, setIsOpen] = useState(false);

    const handleValueChange = (newValue) => {
        setSelectedValue(newValue);
        onValueChange?.(newValue);
    };

    const updatedChildren = React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
            return React.cloneElement(child, {
                onClick: () => setIsOpen(!isOpen),
            });
        }
        if (child.type === SelectContent) {
            return React.cloneElement(child, {
                isOpen,
                onClose: () => setIsOpen(false),
            });
        }
        if (child.type === SelectItem) {
            return React.cloneElement(child, {
                onClick: () => {
                    handleValueChange(child.props.value);
                    setIsOpen(false);
                },
                'data-selected': selectedValue === child.props.value ? 'true' : 'false',
            });
        }
        return child;
    });

    return (
        <div {...props}>
            {updatedChildren}
        </div>
    );
};

const SelectGroup = ({ children, ...props }) => <div {...props}>{children}</div>;
const SelectValue = ({ placeholder, children, ...props }) => <span {...props}>{children || placeholder}</span>;

const SelectTrigger = ({ className, onClick, children, ...props }) => {
    return (
    <div
        className={`flex h-10 w-full items-center justify-between rounded-md  bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 ${className}`}
        onClick={onClick}
        {...props}
    >
        {children}
        <div>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 opacity-50 text-white"
            >
                <path d="M7 10l5 5 5-5" />
            </svg>
        </div>
    </div>
    );
};

const SelectContent = ({ className, children, isOpen, onClose, ...props }) => {
    const contentRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contentRef.current && !contentRef.current.contains(event.target)) {
                onClose?.();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        isOpen && (
            <div
                ref={contentRef}
                className={`absolute z-50 pr-5 py-3 mt-2 max-h-96 min-w-[8rem] overflow-hidden rounded-md bg-[#232323] ${className}`}
                {...props}
            >
                {children}
            </div>
        )
    );
};

const SelectItem = ({ className, value, onClick, children, ...props }) => {
   return (
    <div
        className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
        onClick={onClick}
        value={value}
        {...props}
    >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            {props['data-selected'] === 'true' && (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                >
                    <path d="M20 6L9 17l-5-5" />
                </svg>
            )}
        </span>
        {children}
    </div>
   );
};

const Layout = ({ children }) => <div className="layout">{children}</div>;

const PageHeader = ({ title, description }) => {
    return (
    <div className=" mt-4">
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        {description && <p className="text-gray-400 text-base max-w-2xl">{description}</p>}
    </div>
    );
};

const useToast = () => {
    const toast = (options) => {
        alert(`${options.title}\n${options.description}`);
    };

    return { toast };
};

const ReportCard = ({ report, onDownload }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getFormatIcon = (format) => {
        if (format === 'pdf') return <FileText className="h-4 w-4 text-red-400" />;
        if (format === 'xlsx') return <FileText className="h-4 w-4 text-green-400" />;
        return <FileText className="h-4 w-4 text-gray-400" />;
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'financial':
                return 'bg-blue-500/20 text-blue-500';
            case 'analysis':
                return 'bg-purple-500/20 text-purple-500';
            case 'forecast':
                return 'bg-krevelance-primary/20 text-krevelance-primary';
            case 'tax':
                return 'bg-orange-500/20 text-orange-500';
            default:
                return 'bg-gray-500/20 text-gray-500';
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/10 transition-all duration-300  hover:shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                    <div className="flex items-center mb-2">
                        <h3 className="text-lg font-medium text-white">{report.title}</h3>
                        <Badge className={`${getTypeColor(report.type)} ml-3`}>
                            {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                        </Badge>
                        {report.status === 'processing' && (
                            <Badge className="ml-2 bg-amber-500/20 text-amber-500 animate-pulse">
                                Processing
                            </Badge>
                        )}
                    </div>
                    <p className="text-gray-400 mb-4">{report.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(report.date)}</span>
                        <div className="ml-4 flex items-center">
                            {getFormatIcon(report.format)}
                            <span className="ml-1 uppercase">{report.format}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 md:mt-0 flex space-x-3">
                    <button
                        variant="outline"
                        className=" bg-white flex p-2 px-3 h-10 mt-4  w-22 rounded-lg text-black hover:bg-[#0FCE7C] text-black hover:scale-105"
                    >
                        <Eye className="h-4 w-4 mr-2 mt-1 text-black" /> View
                    </button>
                    <button
                        className={report.status === 'ready'
                            ? ' text-black transition-colors duration-200 hover:scale-105'
                            : ' text-gray-300 cursor-not-allowed'}
                        onClick={() => onDownload(report.id)}
                        disabled={report.status !== 'ready'}
                    >
                        <div className='bg-[#0FCE7C] mt-4 flex p-2 px-3 rounded-lg text-black hover:bg-black hover:text-white hover:border'>
                        Download
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};


const Reports = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const { toast } = useToast();
    const [sortBy, setSortBy] = useState('latest');
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [sortLabel, setSortLabel] = useState("Latest First");

    const reports = useMemo(() => [
        {
            id: 1,
            title: 'Financial Statement Q2 2023',
            description:
                'Comprehensive financial statement including balance sheet, income statement, and cash flow.',
            date: '2023-06-30',
            type: 'financial',
            status: 'ready',
            format: 'pdf',
        },
        {
            id: 2,
            title: 'Revenue Analysis Report',
            description:
                'Detailed analysis of revenue streams, growth patterns, and forecasts.',
            date: '2023-07-15',
            type: 'analysis',
            status: 'ready',
            format: 'xlsx',
        },
        {
            id: 3,
            title: 'Expense Breakdown Q2 2023',
            description:
                'Category-wise breakdown of expenses with month-over-month comparisons.',
            date: '2023-06-30',
            type: 'financial',
            status: 'ready',
            format: 'pdf',
        },
        {
            id: 4,
            title: 'Cash Flow Forecast',
            description:
                'Six-month cash flow projection based on historical data and growth trends.',
            date: '2023-08-05',
            type: 'forecast',
            status: 'processing',
            format: 'pdf',
        },
        {
            id: 5,
            title: 'Profitability Analysis',
            description:
                'In-depth analysis of profit margins, cost drivers, and optimization opportunities.',
            date: '2023-07-22',
            type: 'analysis',
            status: 'ready',
            format: 'pdf',
        },
        {
            id: 6,
            title: 'Tax Summary 2023 YTD',
            description:
                'Year-to-date tax obligations, payments, and remaining liabilities.',
            date: '2023-07-31',
            type: 'tax',
            status: 'ready',
            format: 'pdf',
        },
    ], []);

    const filteredReports = useMemo(() => {
        return reports.filter((report) => {

            if (activeTab !== 'all' && report.type !== activeTab) return false;

            if (
                searchTerm &&
                !report.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
                return false;

            return true;
        }).sort((a, b) => {
            if (sortBy === 'latest') {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            } else if (sortBy === 'oldest') {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            } else if (sortBy === 'name') {
                return a.title.localeCompare(b.title);
            }
            return 0;
        });
    }, [reports, activeTab, searchTerm, sortBy]);

    const handleDownload = useCallback(
        (reportId) => {
            const report = reports.find((r) => r.id === reportId);

            if (report?.status === 'processing') {
                alert(
                    'Report still processing\nThis report is still being generated. Please try again later.'
                );

                return;
            }

            alert(`${report?.title} is being downloaded.`);
        },
        [reports]
    );

    const handleGenerateReport = () => {
        alert('Report generation initiated\nYour custom report is being generated. This may take a few minutes.');
    };

    useEffect(() => {
        if (sortBy === 'latest') {
            setSortLabel('Latest First');
        } else if (sortBy === 'oldest') {
            setSortLabel('Oldest First');
        } else if (sortBy === 'name') {
            setSortLabel('Name (A-Z)');
        }
    }, [sortBy]);

    return (

        <Layout>
            <Navbar1 />
            <div className="page-container  ">
                <div className='flex flex-col text-left   py-14 '>
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
                                <SelectItem value="latest" className={"hover:text-[#0FCE7C] hover:scale-105"} onClick={() => setSortBy('latest')}>
                                    Latest First
                                </SelectItem>
                                <SelectItem value="oldest" className={"hover:text-[#0FCE7C] hover:scale-105"} onClick={() => setSortBy('oldest')}>
                                    Oldest First
                                </SelectItem>
                                <SelectItem value="name" className={"hover:text-[#0FCE7C] hover:scale-105"} onClick={() => setSortBy('name')}>
                                    Name (A-Z)
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <button
                            className="bg-[#0FCE7C] hover:bg-[#0FCE96] rounded-lg px-3 text-black hover:scale-105 transition-all duration-300"
                            onClick={handleGenerateReport}
                        >
                            Generate New Report
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex space-x-8 mb-8  bg-[#333333] rounded-lg p-2 w-fit ">
                        <button
                            className={`px-4 py-2 hover:bg-black hover:text-white hover:scale-105 rounded-md transition-all duration-300 ${activeTab === 'all' ? 'bg-[#0FCE7C] text-black' : 'bg-[#FDFDFD] text-black'}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All Reports
                        </button>
                        <button
                            className={`px-4 py-2 hover:bg-black hover:text-white hover:scale-105 rounded-md transition-all duration-300 ${activeTab === 'financial' ? 'bg-[#0FCE7C] text-black' : 'bg-[#FDFDFD] text-black'}`}
                            onClick={() => setActiveTab('financial')}
                        >
                            Financial
                        </button>
                        <button
                            className={`px-4 py-2 hover:bg-black hover:text-white hover:scale-105 rounded-md transition-all duration-300 ${activeTab === 'analysis' ? 'bg-[#0FCE7C] text-black' : 'bg-[#FDFDFD] text-black'}`}
                            onClick={() => setActiveTab('analysis')}
                        >
                            Analysis
                        </button>
                        <button
                            className={`px-4 py-2 hover:bg-black hover:text-white hover:scale-105 rounded-md transition-all duration-300 ${activeTab === 'forecast' ? 'bg-[#0FCE7C] text-black' : 'bg-[#FDFDFD] text-black'}`}
                            onClick={() => setActiveTab('forecast')}
                        >
                            Forecasts
                        </button>
                    </div>

                    {activeTab === 'all' && (
                        <div className="space-y-10">
                            {filteredReports.length > 0 ? (
                                filteredReports.map((report) => (
                                    <ReportCard
                                        key={report.id}
                                        report={report}
                                        onDownload={handleDownload}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-medium text-white mb-2">
                                        No reports found
                                    </h3>
                                    <p className="text-gray-400">
                                        Try adjusting your search or filters
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'financial' && (
                        <div className="space-y-6">
                            {filteredReports.filter((r) => r.type === 'financial').length > 0 ? (
                                filteredReports
                                    .filter((r) => r.type === 'financial')
                                    .map((report) => (
                                        <ReportCard
                                            key={report.id}
                                            report={report}
                                            onDownload={handleDownload}
                                        />
                                    ))
                            ) : (
                                <div className="text-center py-12">
                                    <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-medium text-white mb-2">
                                        No financial reports found
                                    </h3>
                                    <p className="text-gray-400">
                                        Try adjusting your search or filters
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'analysis' && (
                        <div className="space-y-6">
                            {filteredReports.filter((r) => r.type === 'analysis').length > 0 ? (
                                filteredReports
                                    .filter((r) => r.type === 'analysis')
                                    .map((report) => (
                                        <ReportCard
                                            key={report.id}
                                            report={report}
                                            onDownload={handleDownload}
                                        />
                                    ))
                            ) : (
                                <div className="text-center py-12">
                                    <BarChart className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-medium text-white mb-2">
                                        No analysis reports found
                                    </h3>
                                    <p className="text-gray-400">
                                        Try adjusting your search or filters
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'forecast' && (
                        <div className="space-y-6">
                            {filteredReports.filter((r) => r.type === 'forecast').length > 0 ? (
                                filteredReports
                                    .filter((r) => r.type === 'forecast')
                                    .map((report) => (
                                        <ReportCard
                                            key={report.id}
                                            report={report}
                                            onDownload={handleDownload}
                                        />
                                    ))
                            ) : (
                                <div className="text-center py-12">
                                    <PieChart className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-medium text-white mb-2">
                                        No forecast reports found
                                    </h3>
                                    <p className="text-gray-400">
                                        Try adjusting your search or filters
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Reports;


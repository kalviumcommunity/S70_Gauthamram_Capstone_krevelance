import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../api/endpoints";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import WelcomeHeader from "../components/dashboard/WelcomeHeader";
import StatCardsSection from "../components/dashboard/StatCardsSection";
import ChartsSection from "../components/dashboard/ChartsSection";
import Navbar1 from "../components/layout/Navbar1";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [selectedUploadIds, setSelectedUploadIds] = useState([]); // Array for multi-select
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();



  useEffect(() => {
    const fetchUploads = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      try {
        const res = await api.get(API_ENDPOINTS.ANALYSIS.HISTORY);
        setUploads(res.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
    };

    fetchUploads();
    fetchData();
  }, [navigate]);


  const fetchData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("No auth token found, redirecting to login.");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Reduced delay
      let url = API_ENDPOINTS.DASHBOARD.STATS;
      if (selectedUploadIds.length > 0) {
        url += `?uploadId=${selectedUploadIds.join(',')}`;
      }
      const response = await api.get(url);

      setDashboardData(response.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);

      if (err.response && err.response.status === 401) {
        console.log("JWT invalid or expired (401). Redirecting to login.");
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to load dashboard data.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container py-18">
        <Navbar1 />
        <div className="page-container py-18">
          <Navbar1 />
          <div className="mb-8">

            <div className="page-title-container rounded-lg  px-6">

              <SkeletonTheme baseColor="#333333" highlightColor="#444">
                <Skeleton count={1} width="80%" />
                <Skeleton className="mt-2" count={1} width="30%" />
                <Skeleton className="mt-2" count={1} width="60%" />
                <Skeleton className="mt-2" count={3} />
                <Skeleton className="mt-2" count={1} width="30%" />
                <Skeleton count={1} width="80%" />
              </SkeletonTheme>
              <div className="flex space-x-4 mt-10">

                <div className="page-title-container rounded-lg pt-6 px-6 w-1/2">

                  <SkeletonTheme baseColor="#333333" highlightColor="#444">
                    <Skeleton count={10} />
                  </SkeletonTheme>
                </div>
                <div className="page-title-container rounded-lg pt-6 px-6 w-1/2">

                  <SkeletonTheme baseColor="#333333" highlightColor="#444">
                    <Skeleton count={10} />
                  </SkeletonTheme>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container py-18">
        <Navbar1 />{" "}
        <div className="text-center p-10 text-red-500">Error: {error}</div>{" "}
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="page-container py-18">
        <Navbar1 />{" "}
        <div className="text-center p-10">No dashboard data available.</div>{" "}
      </div>
    );
  }

  return (
    <div className="page-container py-18">
      <Navbar1 />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4">
        <WelcomeHeader lastAnalysisDate={dashboardData.stats.lastAnalysisDate} />


        <div className="w-full md:w-auto -mb-6 md:mb-8 flex flex-col md:flex-row items-end gap-4">
          <div className="w-full md:w-[300px]">
            <label className="text-gray-400 text-sm mb-2 block">Data Source</label>
            <div className="relative">
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
                      console.log("Selected: All Combined Data");
                      setSelectedUploadIds([]);
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
                        console.log("Toggling ID:", upload._id);
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
                        <span className="text-xs text-gray-500">Uploaded: {new Date(upload.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={fetchData}
            className="bg-[#0FCE7C] text-black font-semibold py-2 px-6 rounded hover:bg-[#0FCE96] transition h-[42px]"
          >
            Update Dashboard
          </button>
        </div>
      </div>
      {dashboardData.stats.lastAnalysisDate && (
        <StatCardsSection statsInput={dashboardData.stats} />
      )}



      <ChartsSection
        revenueData={dashboardData.charts.revenueData}
        profitData={dashboardData.charts.profitData}
        forecastData={dashboardData.charts.forecastData}
      />
    </div>
  );
};

export default Dashboard;

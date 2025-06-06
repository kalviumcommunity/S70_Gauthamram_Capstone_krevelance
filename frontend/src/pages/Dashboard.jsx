import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import WelcomeHeader from "../components/dashboard/WelcomeHeader";
import StatCardsSection from "../components/dashboard/StatCardsSection";
import ChartsSection from "../components/dashboard/ChartsSection";
import Navbar1 from "../components/layout/Navbar1";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
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
        await new Promise((resolve) => setTimeout(resolve, 1300)); 
              const response = await api.get("/dashboard/stats");

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

    fetchData(); 
  }, [navigate]);

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
      <WelcomeHeader />
      <StatCardsSection statsInput={dashboardData.stats} />{" "}
      <ChartsSection
        revenueData={dashboardData.charts.revenueData}
        profitData={dashboardData.charts.profitData}
      />{" "}
    </div>
  );
};

export default Dashboard;

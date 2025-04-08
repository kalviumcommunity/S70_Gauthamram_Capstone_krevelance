import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import WelcomeHeader from '../components/dashboard/WelcomeHeader';
import StatCardsSection from '../components/dashboard/StatCardsSection';
import ChartsSection from '../components/dashboard/ChartsSection';
import Navbar1 from '../components/layout/Navbar1';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error("No authentication token found.");
                }

                const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:1316/api';

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };
                const response = await axios.get(`${API_URL}/dashboard/stats`, config);

                setDashboardData(response.data);

            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError(err.message || "Failed to load data.");
                 if (err.response && err.response.status === 401) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userInfo');
                    navigate('/login'); 
                 }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="page-container py-18">
                <Navbar1 />
                <div className="text-center p-10">Loading Dashboard Data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container py-18">
                <Navbar1 />
                <div className="text-center p-10 text-red-500">Error: {error}</div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="page-container py-18">
                <Navbar1 />
                <div className="text-center p-10">No dashboard data available.</div>
            </div>
        );
    }

    return (
        <div className="page-container py-18"> 
            <Navbar1/>
            <WelcomeHeader/>
            <StatCardsSection statsInput={dashboardData.stats} />
            <ChartsSection
                revenueData={dashboardData.charts.revenueData}
                profitData={dashboardData.charts.profitData}
            />
        </div>
    );
};

export default Dashboard;
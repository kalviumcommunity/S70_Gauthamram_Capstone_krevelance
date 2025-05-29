import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, TrendingUp, Upload, Home, User, Bell } from 'lucide-react';

const KrevelanceText = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [activePath, setActivePath] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setActivePath(location.pathname);
    }, [location.pathname]);

    const getButtonStyle = (path) => {

        return `flex items-center justify-center text-sm rounded-lg h-9 px-4 hover:scale-105 w-full md:w-auto whitespace-nowrap ${
            activePath === path
                ? 'bg-[#0FCE7C] text-black font-semibold'
                : 'bg-white text-black hover:bg-[#0FCE7C]/30 hover:text-[#0FCE7C]' 
        }`;
    };

     const getIconButtonSyle = (path = '') => {
         return `flex items-center justify-center text-white hover:scale-105 hover:bg-white hover:text-black rounded-full h-9 w-9 self-center md:self-auto flex-shrink-0 ${ 
             activePath === path ? 'bg-[#0FCE7C]' : ''
         }`;
     };


    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? "py-3 bg-krevelance-dark/80 backdrop-blur-lg shadow-md"
                    : "py-5 bg-transparent"
                }`}
        >
            <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center"> 
                    <NavLink to="/dashboard" className="flex items-center space-x-2 flex-shrink-0">
                        <span className={`text-2xl text-[#0FCE7C] font-bold`}>Krevelance</span>
                    </NavLink>
                    <div className="flex flex-col space-y-2 items-stretch md:flex-row md:space-y-0 md:space-x-3 md:items-center">
                        <button
                            className={getButtonStyle('/dashboard')}
                            onClick={() => navigate('/dashboard')}
                        >
                            <Home className="mr-2 h-3 w-3" />
                            Dashboard
                        </button>
                        <button
                            className={getButtonStyle('/reports')}
                            onClick={() => navigate('/reports')}
                        >
                            <BookOpen className="mr-2 h-3 w-3" />
                            View Reports
                        </button>
                        <button
                            className={getButtonStyle('/analysis')}
                            onClick={() => navigate('/analysis')}
                        >
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Run Analysis
                        </button>
                        <button
                            className={getButtonStyle('/upload')}
                            onClick={() => navigate('/upload')}
                        >
                            <Upload className="mr-2 h-3 w-3" />
                            Upload
                        </button>
                        <button
                            className={getIconButtonSyle('/notification')}
                            onClick={() => navigate('/notification')}
                             aria-label="Notifications"
                        >
                            <Bell className="h-5 w-5 " />
                        </button>
                        <button
                            className={getIconButtonSyle('/settings')}
                            onClick={() => navigate('/settings')}
                             aria-label="User Settings"
                        >
                            <User className="h-5 w-5" />
                        </button>
                    </div> 

                </div> 
            </div>
        </nav>
    );
};

export default KrevelanceText;
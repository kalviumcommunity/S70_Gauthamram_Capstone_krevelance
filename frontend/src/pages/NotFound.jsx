import React, { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar2 from '../components/layout/Navbar2'

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoHome = () => {
    navigate("/");
  };

  return (
  
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-4">
       <Navbar2/>
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-7xl font-bold mb-4 text-[#0FCE7C]">404</h1>
        <p className="text-2xl mb-6">Oops! Page not found</p>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/">
          <button
            className="bg-[#0FCE7C] hover:bg-[#0FCE7C] text-black px-6 py-2 rounded-md transition-colors duration-200"
          >
            Return to Home
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

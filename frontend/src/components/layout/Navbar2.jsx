import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const KrevelanceText = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "py-3 bg-krevelance-dark/80 backdrop-blur-lg shadow-md"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <NavLink to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">Krevelance</span>
          </NavLink>
          </div>
          </div>
    </nav>
  );
};

export default KrevelanceText;

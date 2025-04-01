import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { Menu, X, ChevronRight } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isLoggedIn = false;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = isLoggedIn
    ? [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Analysis", href: "/analysis" },
        { name: "Reports", href: "/reports" },
        { name: "Files", href: "/upload" },
        { name: "Settings", href: "/settings" },
      ]
    : [
        { name: "Home", href: "/" },
        { name: "Pricing", href: "/pricing" },
        { name: "About", href: "/about" },
      ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "py-3 bg-krevelance-dark/80 backdrop-blur-lg shadow-md"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center space-x-2">
              <span className="text-2xl  font-bold ">Krevelance</span>
            </NavLink>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.href}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      isActive
                        ? "text-white hover:scale-105 hover:text-[#0FCE7C]"
                        : "text-white hover:scale-105 hover:text-[#0FCE7C]"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            {!isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <NavLink
                  to="/login"
                  className="text-sm font-medium hover:scale-105 hover:text-[#0FCE7C] text-white  transition-colors"
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/signup"
                  variant="default"
                  className="btn-primary btn-secondary hover:scale-105 hover:text-white text-black flex"
                >
                  Sign up
                  <ChevronRight className="ml-1 mt-1 h-4 w-4 hover:text-white text-black hover:texte-white" />
                </NavLink>
              </div>
            ) : (
              <NavLink to="/profile">
                <div className="h-9 w-9 rounded-full btn-primary  flex items-center justify-center text-black font-medium">
                  JD
                </div>
              </NavLink>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-white p-2 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden fixed inset-0 z-40 bg-krevelance-dark pt-16 pb-6 px-4 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="space-y-6 mt-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.href}
                className={({ isActive }) =>
                  ` text-lg font-medium transition-colors ${
                    isActive
                      ? "text-krevelance-primary"
                      : "text-gray-200 hover:text-[#0FCE7C]"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {!isLoggedIn ? (
            <div className="mt-auto space-y-4">
              <NavLink
                to="/login"
                className="block w-full text-center py-3 text-white font-medium border border-krevelance-primary/30 rounded-md hover:bg-krevelance-primary/10"
              >
                Log in
              </NavLink>
              <NavLink
                to="/signup"
                className="block w-full text-center py-3 bg-krevelance-primary text-black font-medium rounded-md hover:bg-krevelance-primary-light"
              >
                Sign up
              </NavLink>
            </div>
          ) : (
            <div className="mt-auto ">
              <NavLink
                to="/profile"
                className="flex items-center space-x-3 p-3 rounded-md hover:bg-krevelance-accent/10"
              >
                <div className="h-9 w-9 rounded-full bg-krevelance-primary flex items-center justify-center text-black font-medium">
                  JD
                </div>
                <span className="text-white font-medium">My Profile</span>
              </NavLink>
            </div>
          )}
        </div>
      </div>
      {isMenuOpen && (
        <div
          className="md:hidden  fixed inset-0 bg-black/50 z-30"
          onClick={toggleMenu}
          aria-hidden="true"
        />
      )}
    </nav>
  );
};

export default Navbar;

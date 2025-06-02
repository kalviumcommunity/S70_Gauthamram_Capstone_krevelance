import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from '../api/axiosConfig'
import Layout from "../components/layout/Layout";
import { GiFarmTractor } from "react-icons/gi";
import { FaQuestion, FaIndustry, FaStore, FaLaptopCode } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const ALLOWED_SECTORS = [
  "Agriculture",
  "Tech/SaaS",
  "Retail",
  "Manufacturing",
  "Other",
];

const AgricultureIcon = () => (
  <GiFarmTractor className="h-6 w-6 inline-block mr-2" />
);

const TechIcon = () => <FaLaptopCode className="h-6 w-6 inline-block mr-2" />;

const RetailIcon = () => <FaIndustry className="h-6 w-6 inline-block mr-2" />;

const ManufacturingIcon = () => (
  <FaStore className="h-6 w-6 inline-block mr-2" />
);

const OtherIcon = () => <FaQuestion className="h-6 w-6 inline-block mr-2" />;

const SelectSector = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, email, password, agreeTerms } = location.state || {};
  const [selectedSector, setSelectedSector] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!name || !email || !password || agreeTerms === undefined) {
      console.warn("Missing signup data, redirecting to signup.");
      toast.error("Something went wrong, please start signup again.");
      navigate("/signup", { replace: true });
    }
  }, [name, email, password, agreeTerms, navigate]);

  const handleSectorSelect = (sector) => {
    setSelectedSector(sector);
  };

  const handleCompleteSignup = async (event) => {
    event.preventDefault();
    if (!selectedSector) {
      toast.error("Please select your business sector.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Completing signup...");

    try {
      const res = await api.post("https://s70-gauthamram-capstone-krevelance-1.onrender.com/api/auth/signup", {
        name,
        email,
        password,
        businessSector: selectedSector,
        agreeTerms: agreeTerms,
      });

      setIsLoading(false);
      toast.success(res.data.message || "Signup Successful!", { id: toastId });
      console.log("Signup successful:", res.data);

      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("userInfo", JSON.stringify(res.data.user));

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      const errorMsg =
        err.response?.data?.message ||
        "Signup failed. Please check your details or try again later.";
      toast.error(errorMsg, { id: toastId });
      console.error(
        "Final Signup Error:",
        err.response || err.request || err.message
      );
    }
  };

  if (!name || !email || !password || agreeTerms === undefined) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-screen flex items-center justify-center text-white">
          Loading...
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 animate-fade-in">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-lg p-8 shadow-neo-dark">
            <h2 className="text-3xl font-bold text-center mb-4 text-white">
              Select Your Business Sector
            </h2>
            <p className="text-center text-gray-300 mb-8">
              This helps us tailor your financial analysis.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {ALLOWED_SECTORS.map((sector) => (
                <button
                  key={sector}
                  type="button"
                  onClick={() => handleSectorSelect(sector)}
                  className={`
                                        p-4 rounded-lg text-center font-medium transition-all duration-200 ease-in-out border
                                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-[#0FCE7C]
                                        ${
                                          selectedSector === sector
                                            ? "bg-[#0FCE7C] text-black border-[#0FCE7C] shadow-md scale-105"
                                            : "bg-white/10 text-white border-gray-600 hover:bg-white/20 hover:border-gray-400"
                                        }
                                    `}
                >
                  {sector === "Agriculture" && <AgricultureIcon />}
                  {sector === "Tech/SaaS" && <TechIcon />}
                  {sector === "Retail" && <RetailIcon />}
                  {sector === "Manufacturing" && <ManufacturingIcon />}
                  {sector === "Other" && <OtherIcon />}
                  {sector}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCompleteSignup}
              className="w-full bg-[#0FCE7C] hover:bg-[#0FCE96] text-black font-semibold py-2.5 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-[#0FCE7C] disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading || !selectedSector}
            >
              {isLoading ? "Completing Signup..." : "Complete Signup"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SelectSector;

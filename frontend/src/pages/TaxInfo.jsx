import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from '../api/axiosConfig'
import Layout from "../components/layout/Layout";
import toast, { Toaster } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL;

const TaxInfo = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { email, password, agreeTerms, businessSector, company, phone, address, country, countryCode } = location.state || {};
    const [gstin, setGstin] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!email || !password || agreeTerms === undefined || !businessSector) {
            console.warn("Missing signup data, redirecting to signup.");
            toast.error("Process interrupted, please start again.");
            navigate("/signup", { replace: true });
        }
    }, [email, password, agreeTerms, businessSector, navigate]);

    const handleCompleteSignup = async (event) => {
        event.preventDefault();

        setIsLoading(true);
        const toastId = toast.loading("Finalizing account creation...");

        try {
            const res = await api.post(`${API_BASE_URL}/api/auth/signup`, {

                email,
                password,
                businessSector,
                agreeTerms,
                gstin,
                company,
                phone,
                address,
                country,
                countryCode
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
            console.error("Signup Error:", err);
        }
    };

    // GSTIN Verification Function
    const verifyGstin = async () => {
        if (!gstin) {
            toast.error("Please enter a GSTIN first.");
            return;
        }

        const toastId = toast.loading("Verifying GSTIN...");
        try {
            const res = await api.post(`${API_BASE_URL}/api/auth/verify-gstin`, { gstin });

            if (res.data.valid) {
                toast.success("GSTIN Verified!", { id: toastId });
                // You could auto-fill company name if the API returned it
                // if(res.data.details.legalName) setCompany(res.data.details.legalName);
            } else {
                toast.error(res.data.message || "Invalid GSTIN", { id: toastId });
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Verification failed";
            toast.error(errorMsg, { id: toastId });
        }
    };

    return (
        <Layout showFooter={false}>
            <div className="min-h-screen flex items-center justify-center px-4 py-12 animate-fade-in">
                <div className="w-full max-w-md">
                    <div className="glass-card rounded-lg p-8 shadow-neo-dark">
                        <h2 className="text-3xl font-bold text-center mb-4 text-white">
                            Tax Information
                        </h2>
                        <p className="text-center text-gray-300 mb-8">
                            Please provide your GSTIN for verification.
                        </p>

                        <form onSubmit={handleCompleteSignup} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="gstin" className="block text-left w-full font-bold text-base text-white">
                                    GSTIN
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        id="gstin"
                                        type="text"
                                        placeholder="Enter GSTIN"
                                        value={gstin}
                                        onChange={(e) => setGstin(e.target.value)}
                                        required
                                        className="glass-input bg-white text-black w-full mt-1 rounded-lg h-10 px-3 border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={verifyGstin}
                                        className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-md mt-1"
                                    >
                                        Verify
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#0FCE7C] hover:bg-[#0FCE96] text-black font-semibold py-2.5 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-[#0FCE7C] disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {isLoading ? "Creating Account..." : "Complete Registration"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TaxInfo;

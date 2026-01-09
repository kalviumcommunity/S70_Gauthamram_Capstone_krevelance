import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { COUNTRIES_LIST } from "../constants";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL;

const Signup = () => {
    // Phase 1: Email/Password
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Phase 2: Company/Address
    const [company, setCompany] = useState("");
    const [address, setAddress] = useState("");

    // Phase 3: Phone/Country
    const [phone, setPhone] = useState("");
    const [country, setCountry] = useState("");
    const [countryCode, setCountryCode] = useState("");

    const [agreeTerms, setAgreeTerms] = useState(false);
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    const allowedDomains = ['gmail.com', 'outlook.com', 'hotmail.com'];

    const validateStep1 = () => {
        let newErrors = {};

        if (!email) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Invalid email format";
        } else {
            const domain = email.split('@')[1];
            if (!allowedDomains.includes(domain?.toLowerCase())) {
                newErrors.email = `Only ${allowedDomains.join(', ')} allowed`;
            }
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 8) {
            newErrors.password = "Min 8 characters";
        } else if (!/(?=.*[A-Z])/.test(password)) {
            newErrors.password = "Must contain uppercase";
        } else if (!/(?=.*\d)/.test(password)) {
            newErrors.password = "Must contain number";
        } else if (!/(?=.*[!@#$%^&*])/.test(password)) {
            newErrors.password = "Must contain special char";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Confirm password";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        let newErrors = {};
        if (!company.trim()) newErrors.company = "Company name is required";
        if (!address.trim()) newErrors.address = "Address is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        let newErrors = {};
        if (!phone.trim()) newErrors.phone = "Phone number is required";
        if (!country.trim()) newErrors.country = "Country is required";
        if (!agreeTerms) newErrors.agreeTerms = "Must agree to terms";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = (e) => {
        e.preventDefault();
        let isValid = false;
        if (step === 1) isValid = validateStep1();
        if (step === 2) isValid = validateStep2();

        if (isValid) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateStep3()) {
            console.log("Validation passed. Navigating...");
            navigate('/select-sector', {
                replace: true,
                state: {
                    email: email.toLowerCase(),
                    password,
                    agreeTerms,
                    company,
                    address,
                    phone,
                    country
                }
            });
        }
    };

    return (
        <Layout showFooter={false}>
            <div className="min-h-screen flex items-center justify-center px-4 py-12 animate-fade-in relative">

                <div className="w-full max-w-md">
                    <div className="mb- bg-gray-700/50 rounded-full h-2.5 backdrop-blur-sm relative overflow-hidden">
                        <div
                            className="bg-[#0FCE7C] h-2.5 rounded-full transition-all duration-500 ease-in-out"
                            style={{ width: `${(step / 3) * 100}%` }}
                        ></div>
                    </div>

                    <div className="glass-card rounded-lg p-8 shadow-neo-dark">
                        <div className="text-center mb-6">
                            <Link to="/" className="inline-block">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0FCE7C] to-[#0FCE96] bg-clip-text text-transparent">
                                    Krevelance
                                </h1>
                            </Link>
                            <h2 className="text-2xl font-bold mt-4 text-white">
                                {step === 1 && "Create Account"}
                                {step === 2 && "Company Details"}
                                {step === 3 && "Contact Info"}
                            </h2>

                        </div>

                        <form onSubmit={step === 3 ? handleSubmit : nextStep} className="space-y-6" noValidate>

                            {step === 1 && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-white text-left">Email Address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={`glass-input bg-white text-black w-full rounded-lg h-10 px-3 ${errors.email ? 'border-red-500 border' : 'border-transparent'}`}
                                            placeholder="your@email.com"
                                        />
                                        {errors.email && <p className="text-red-400 text-xs text-left">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-white text-left">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`glass-input bg-white text-black w-full rounded-lg h-10 px-3 pr-10 ${errors.password ? 'border-red-500 border' : 'border-transparent'}`}
                                                placeholder="Min 8 chars"
                                                maxLength={20}
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400">
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-red-400 text-xs text-left">{errors.password}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-white text-left">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={`glass-input bg-white text-black w-full rounded-lg h-10 px-3 pr-10 ${errors.confirmPassword ? 'border-red-500 border' : 'border-transparent'}`}
                                                placeholder="Retype password"
                                                maxLength={20}
                                            />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400">
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <p className="text-red-400 text-xs text-left">{errors.confirmPassword}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Company & Address */}
                            {step === 2 && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-white text-left">Company Name</label>
                                        <input
                                            type="text"
                                            value={company}
                                            onChange={(e) => setCompany(e.target.value)}
                                            className={`glass-input bg-white text-black w-full rounded-lg h-10 px-3 ${errors.company ? 'border-red-500 border' : 'border-transparent'}`}
                                            placeholder="Company Name"
                                        />
                                        {errors.company && <p className="text-red-400 text-xs text-left">{errors.company}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-white text-left">Address</label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className={`glass-input bg-white text-black w-full rounded-lg h-10 px-3 ${errors.address ? 'border-red-500 border' : 'border-transparent'}`}
                                            placeholder="Business Address"
                                        />
                                        {errors.address && <p className="text-red-400 text-xs text-left">{errors.address}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Phone & Country */}
                            {/* Step 3: Phone & Country */}
                            {step === 3 && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-white text-left">Country</label>
                                        <select
                                            value={country}
                                            onChange={(e) => {
                                                const selected = COUNTRIES_LIST.find(c => c.name === e.target.value);
                                                setCountry(e.target.value);
                                                if (selected) setCountryCode(selected.phoneCode);
                                            }}
                                            className={`glass-input bg-white text-black w-full rounded-lg h-10 px-3 ${errors.country ? 'border-red-500 border' : 'border-transparent'}`}
                                        >
                                            <option value="">Select Country</option>
                                            {COUNTRIES_LIST.map((c) => (
                                                <option key={c.name} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                        {errors.country && <p className="text-red-400 text-xs text-left">{errors.country}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-white text-left">Phone Number</label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 h-10 rounded-l-lg bg-gray-200 text-gray-600 border border-r-0 border-transparent">
                                                {countryCode || "--"}
                                            </span>
                                            <input
                                                type="text"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className={`glass-input bg-white text-black w-full rounded-r-lg rounded-l-none h-10 px-3 ${errors.phone ? 'border-red-500 border' : 'border-transparent'}`}
                                                placeholder="Contact Number"
                                            />
                                        </div>
                                        {errors.phone && <p className="text-red-400 text-xs text-left">{errors.phone}</p>}
                                    </div>

                                    <div className="flex items-start space-x-3 pt-2">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            checked={agreeTerms}
                                            onChange={(e) => {
                                                setAgreeTerms(e.target.checked);
                                                if (e.target.checked && errors.agreeTerms) {
                                                    setErrors({ ...errors, agreeTerms: null });
                                                }
                                            }}
                                            className="mt-1 h-4 w-4 text-[#0FCE7C] border-gray-400 rounded focus:ring-[#0FCE7C] cursor-pointer"
                                        />
                                        <div className="flex-1">
                                            <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer -ml-16">
                                                I agree to the <Link to="/terms" className="text-[#0FCE7C] hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-[#0FCE7C] hover:underline">Privacy Policy</Link>
                                            </label>
                                            {errors.agreeTerms && <p className="text-red-400 text-xs mt-1">{errors.agreeTerms}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4">
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="w-full bg-white text-black hover:scale-105 font-semibold py-2.5 rounded-md transition-colors"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="w-full bg-[#0FCE7C] hover:bg-[#0FCE96] text-black font-semibold py-2.5 rounded-md transition-colors"
                                >
                                    {step === 3 ? "Next" : "Continue"}
                                </button>
                            </div>

                            {step === 1 && (
                                <div className="text-center">
                                    <div className="relative flex py-4 items-center">
                                        <div className="flex-grow border-t border-white/20"></div>
                                        <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">or continue with</span>
                                        <div className="flex-grow border-t border-white/20"></div>
                                    </div>
                                    <a href={`${API_BASE_URL}/api/auth/google`}>
                                        <button
                                            type="button"
                                            className="hover:bg-white hover:text-black bg-[#414141] text-white py-2 px-4 rounded-md transition-colors duration-300 flex items-center justify-center font-medium w-full"
                                        >
                                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" aria-hidden="true">
                                                <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                                            </svg>
                                            Sign up with Google
                                        </button>
                                    </a>
                                    <p className="mt-6 text-sm text-gray-400">
                                        Already have an account?{' '}
                                        <Link to="/login" className="font-medium text-[#0FCE7C] hover:text-[#0FCE96] hover:underline">
                                            Log in
                                        </Link>
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Signup;
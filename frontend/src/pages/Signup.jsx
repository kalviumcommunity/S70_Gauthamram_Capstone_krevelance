import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout"; 
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [agreeTermsError, setAgreeTermsError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    const allowedDomains = ['gmail.com', 'outlook.com', 'hotmail.com']; 

    useEffect(() => {
        if (email) {
            if (!email.includes("@")) {
                setEmailError("Email must contain '@'");
            } else {
                const domain = email.split('@')[1];
                if (!allowedDomains.includes(domain?.toLowerCase())) {
                    setEmailError(`Only ${allowedDomains.join(', ')} accounts are allowed.`);
                } else {
                    setEmailError(""); 
                }
            }
        } else {
            setEmailError("");
        }
    }, [email]);

    useEffect(() => {
        let error = "";
        if (password) {
            if (password.length < 8) {
                error = "Password must be at least 8 characters";
            } else if (password.length > 20) {
                error = "Password must be at most 20 characters";
            } else if (!/(?=.*[A-Z])/.test(password)) {
                error = "Password must contain a capital letter";
            } else if (!/(?=.*\d)/.test(password)) {
                error = "Password must contain a number";
            } else if (!/(?=.*[!@#$%^&*])/.test(password)) {
                error = "Password must contain a special character (!@#$%^&*)";
            }
        }
        setPasswordError(error);
    }, [password]);

    useEffect(() => {
        if (confirmPassword && password) { 
            if (confirmPassword !== password) {
                setConfirmPasswordError("Passwords do not match");
            } else {
                setConfirmPasswordError("");
            }
        } else {
            setConfirmPasswordError(""); 
        }
    }, [confirmPassword, password]);
    const handleSubmit = (e) => { 
        e.preventDefault();
        setNameError("");
        setEmailError("");
        setAgreeTermsError("");

        let hasErrors = false;

        if (!name.trim()) {
            setNameError("Please enter your full name");
            hasErrors = true;
        }

        if (!email) {
            setEmailError("Please enter your email address");
            hasErrors = true;
        } else if (!emailRegex.test(email)) {
            setEmailError("Invalid email address format");
            hasErrors = true;
        } else {
             const domain = email.split('@')[1];
             if (!allowedDomains.includes(domain?.toLowerCase())) {
                 setEmailError(`Only ${allowedDomains.join(', ')} accounts are allowed.`);
                 hasErrors = true;
             }
        }


        if (!password) {
            setPasswordError("Please enter a password");
            hasErrors = true;
        } else if (passwordError) { 
            hasErrors = true;
        }

        if (!confirmPassword) {
            setConfirmPasswordError("Please confirm your password");
            hasErrors = true;
        } else if (password && confirmPassword !== password) { 
            setConfirmPasswordError("Passwords do not match");
            hasErrors = true;
        }

        if (!agreeTerms) {
            setAgreeTermsError("You must agree to the Terms of Service and Privacy Policy");
            hasErrors = true;
        }

        if (hasErrors) {
            console.log("Validation errors found, stopping submission.");
            return; 
        }

        setIsLoading(true); 

        console.log("Navigating to sector selection...");
        navigate('/select-sector', {
            replace: true,
            state: {
                name: name.trim(), 
                email: email.toLowerCase(), 
                password: password,
                agreeTerms: agreeTerms,
            }
        });
    };

    return (
        <Layout showFooter={false}>
            <div className="min-h-screen flex items-center justify-center px-4 py-12 animate-fade-in">
                <div className="w-full max-w-md">
                    <div className="glass-card rounded-lg p-8 shadow-neo-dark">
                       
                        <div className="text-center mb-8">
                            <Link to="/" className="inline-block">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0FCE7C] to-[#0FCE96] bg-clip-text text-transparent">
                                    Krevelance 
                                </h1>
                            </Link>
                            <h2 className="text-3xl font-bold mt-6 mb-2 text-white">
                                Create an account
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            <div className="space-y-2">
                                <label htmlFor="name" className="w-full font-bold text-base text-left block text-white">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    type="text" 
                                    placeholder="Your Full Name" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    aria-invalid={!!nameError} 
                                    aria-describedby={nameError ? "name-error" : undefined}
                                    className={`glass-input bg-white text-black w-full mt-1 rounded-lg h-10 px-3 ${nameError ? 'border-red-500 border' : 'border-transparent'}`}
                                />
                                {nameError && <p id="name-error" className="text-red-400 text-xs mt-1">{nameError}</p>}
                            </div>

                          
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-left w-full font-bold text-base text-white">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    aria-invalid={!!emailError}
                                    aria-describedby={emailError ? "email-error" : undefined}
                                    className={`glass-input bg-white text-black w-full mt-1 rounded-lg h-10 px-3 ${emailError ? 'border-red-500 border' : 'border-transparent'}`}
                                />
                                {emailError && <p id="email-error" className="text-red-400 text-xs mt-1">{emailError}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-left w-full font-bold text-base text-white">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a strong password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        maxLength={20}
                                        aria-invalid={!!passwordError}
                                        aria-describedby={passwordError ? "password-error" : undefined}
                                        className={`glass-input bg-white text-black w-full mt-1 rounded-lg h-10 px-3 pr-10 ${passwordError ? 'border-red-500 border' : 'border-transparent'}`} 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute inset-y-0 right-0 px-3 mt-1 flex items-center text-gray-400 hover:text-black focus:outline-none" 
                                    >
                                        {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                    </button>
                                </div>
                                {passwordError && (
                                    <p id="password-error" className="text-red-400 text-xs mt-1">{passwordError}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="block text-left w-full font-bold text-base text-white">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your password" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        maxLength={20}
                                        aria-invalid={!!confirmPasswordError}
                                        aria-describedby={confirmPasswordError ? "confirm-password-error" : undefined}
                                        className={`glass-input bg-white text-black w-full mt-1 rounded-lg h-10 px-3 pr-10 ${confirmPasswordError ? 'border-red-500 border' : 'border-transparent'}`} 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"} 
                                        className="absolute inset-y-0 right-0 px-3 mt-1 flex items-center text-gray-400 hover:text-black focus:outline-none" 
                                    >
                                        {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                    </button>
                                </div>
                                {confirmPasswordError && (
                                    <p id="confirm-password-error" className="text-red-400 text-xs mt-1">{confirmPasswordError}</p>
                                )}
                            </div>

                            <div className="flex items-start space-x-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreeTerms}
                                    onChange={(e) => {
                                        setAgreeTerms(e.target.checked);
                                        if (e.target.checked) setAgreeTermsError(""); 
                                    }}
                                    aria-describedby={agreeTermsError ? "terms-error" : undefined}
                                    className="mt-1 h-4 w-4 text-[#0FCE7C] border-gray-400 rounded focus:ring-[#0FCE7C] cursor-pointer" 
                                />
                                <div className="flex-1"> 
                                    <label
                                        htmlFor="terms"
                                        className="text-sm mr-13 text-gray-300 cursor-pointer" 
                                    >
                                        I agree to the{" "}
                                        <Link to="/terms" className="text-[#0FCE7C] hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-[#0FCE7C] rounded">
                                            Terms of Service
                                        </Link>{" "}
                                        and{" "}
                                        <Link to="/privacy" className="text-[#0FCE7C] hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-[#0FCE7C] rounded">
                                            Privacy Policy
                                        </Link>
                                    </label>
                                    {agreeTermsError && (
                                        <p id="terms-error" className="text-red-400 text-xs mt-1">{agreeTermsError}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-[#0FCE7C] hover:bg-[#0FCE96] text-black font-semibold py-2.5 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-[#0FCE7C] disabled:opacity-60 disabled:cursor-not-allowed" 
                                disabled={isLoading}
                            >
                                {isLoading ? "Processing..." : "Next"}
                            </button>

                            <div className="relative flex py-4 items-center">
                                <div className="flex-grow border-t border-white/20"></div>
                                <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">or continue with</span>
                                <div className="flex-grow border-t border-white/20"></div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <a href="http://localhost:1316/api/auth/google">
                                    <button
                                        type="button"
                                        className="hover:bg-white hover:text-black bg-[#414141] text-white py-2 px-4 -mt-7 rounded-md transition-colors duration-300 flex items-center justify-center font-medium w-full" 
                                    >
                                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" aria-hidden="true"> 
                                            <path
                                                fill="currentColor"
                                                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                                            />
                                        </svg>
                                        Sign up with Google
                                    </button>
                                </a>
                            </div>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-[#0FCE7C] hover:text-[#0FCE96] hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-[#0FCE7C] rounded">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Signup;
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

  // Real-time email validation
  useEffect(() => {
    if (email) {
      if (!email.includes("@")) {
        setEmailError("Email must contain '@'");
      } else {
        const domain = email.split('@')[1];
        if (domain !== 'gmail.com' && domain !== 'outlook.com' && domain !== 'hotmail.com') {
          setEmailError("Only Google (gmail.com), Microsoft (outlook.com, hotmail.com) accounts are allowed.");
        }
        else {
          setEmailError("");
        }
      }
    }
    else {
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
      }
      else if (!/(?=.*[A-Z])/.test(password)) {
        error = "Password must contain a capital letter";
      } else if (!/(?=.*\d)/.test(password)) {
        error = "Password must contain a number";
      } else if (!/(?=.*[!@#$%^&*])/.test(password)) {
        error = "Password must contain a special character";
      }
    }
    setPasswordError(error);
  }, [password]);

  //Real-time confirm password validation
  useEffect(() => {
    if (confirmPassword) {
      if (confirmPassword !== password) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    } else {
      setConfirmPasswordError("");
    }
  }, [confirmPassword, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setAgreeTermsError("");

    let hasErrors = false;

    if (!name) {
      setNameError("Please enter your full name");
      hasErrors = true;
    }

    if (!email) {
      setEmailError("Please enter your email address");
      hasErrors = true;
    } else if (!emailRegex.test(email)) {
      setEmailError("Invalid email address");
      hasErrors = true;
    }

    if (!password) {
      setPasswordError("Please enter a password");
      hasErrors = true;
      hasErrors = true;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      hasErrors = true;
    } else if (password.length > 20) {
      setPasswordError("Password must be less than 20 characters");
      hasErrors = true;
    }
    else if (!/(?=.*[A-Z])/.test(password)) {
      setPasswordError("Password must contain a capital letter");
      hasErrors = true;
    } else if (!/(?=.*\d)/.test(password)) {
      setPasswordError("Password must contain a number");
      hasErrors = true;
    } else if (!/(?=.*[!@#$%^&*])/.test(password)) {
      setPasswordError("Password must contain a special character");
      hasErrors = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      hasErrors = true;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match");
      hasErrors = true;
    }

    if (!agreeTerms) {
      setAgreeTermsError("You must agree to the terms and conditions");
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      alert("You have successfully signed up. Welcome to krevelance!");
      navigate("/dashboard");
    }, 1500);
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="w-full font-bold text-base text-left block">
                  Full Name
                </label>
                <input
                  id="name"
                  placeholder=" Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="glass-input bg-white text-black w-full mt-3 rounded-lg h-10 "
                />
                {nameError && <p className="text-red-400 text-xs mt-1">{nameError}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-left w-full font-bold text-base ">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder=" Email ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="glass-input bg-white text-black w-full mt-3 rounded-lg h-10 "
                />
                {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-left w-full font-bold text-base ">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    maxLength={20} 
                    className="glass-input bg-white text-black w-full mt-3 rounded-lg h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-2 mt-3 flex items-center text-gray-400 hover:text-black"
                  >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-400 text-xs mt-1">{passwordError}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-left w-full font-bold text-base ">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    maxLength={20} 
                    className="glass-input bg-white text-black w-full mt-3 rounded-lg h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-2 mt-3 flex items-center text-gray-400 hover:text-black"
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-red-400 text-xs mt-1">{confirmPasswordError}</p>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-[#0FCE7C] border-gray-300 rounded focus:ring-[#0FCE7C]"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-400"
                >
                  I agree to the{" "}
                  <Link to="/terms" className="text-[#0FCE7C] hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-[#0FCE7C] hover:underline">
                    Privacy Policy
                  </Link>
                </label>
                {agreeTermsError && (
                  <p className="text-red-400 text-xs mt-1">{agreeTermsError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#0FCE7C] hover:bg-[#0FCE96] text-black py-2 rounded-md transition-colors duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>

              <div className="">
                <div className="absolute flex items-center">
                  <span className="w-full border-t border-white/10"></span>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-krevelance-dark-card px-2 text-gray-400">
                    or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  type="button"
                  className="bg-transparent border-white/10 hover:bg-white/10 text-white py-2 rounded-md transition-colors duration-300 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                    />
                  </svg>
                  Google
                </button>

              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;


import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Layout from "../components/layout/Layout";
import axios from "axios"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [apiError, setApiError] = useState(""); 
  const navigate = useNavigate();

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

  const API_URL =  'http://localhost:1316/api'; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setApiError("");


    let hasErrors = false;
    if (!email || !password) {
      setApiError("Please fill in both email and password."); 
      hasErrors = true;
    } else if (!emailRegex.test(email)) {
      setEmailError("Invalid email address format.");
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      setIsLoading(false);
      console.log("Login successful:", response.data);

      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userInfo', JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (err) {
      setIsLoading(false);
      console.error("Login API Error:", err);
      let errorMsg = "Login failed. Please check your credentials or try again."; 
        if (err.response && err.response.data) {
            if (err.response.data.errors && err.response.data.errors.length > 0) {
                 errorMsg = err.response.data.errors[0].msg;
            } else if (err.response.data.error) {
                 errorMsg = err.response.data.error;
            } else if (err.response.data.message) {
                errorMsg = err.response.data.message;
            }
        } else if (err.message) {
            errorMsg = err.message; 
        }
      setApiError(errorMsg);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };


  return (
    <Layout >
      <div className="min-h-screen flex items-center justify-center px-4 py-12 animate-fade-in">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-lg p-8 shadow-neo-dark -mt-10">
            <div className="text-center mb-7">
              <Link to="/" className="inline-block">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0FCE7C] to-[#0FCE96] bg-clip-text text-transparent">
                  Krevelance
                </h1>
              </Link>
              <h2 className="text-3xl font-bold mt-6 mb-2 text-white">Welcome back</h2>
              <p className="text-gray-400 text-base font-semibold">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
           
              <div className="space-y-2">
                  <label htmlFor="email" className="w-full font-bold text-base block text-left">Email address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email ID" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="glass-input bg-white text-black w-full mt-3 rounded-lg h-10"
                  />
                  {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
              </div>

           
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-base font-bold">Password</label> 
                  <Link to="/forgot-password" className="text-xs text-[#0FCE96] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="glass-input bg-white w-full mt-3 rounded-lg text-black h-10 pr-10" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                   
                    className="absolute inset-y-0 right-0 pr-3 mt-3 flex items-center text-gray-400 hover:text-black"
                  >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
              </div>

         
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
              
                  className="h-4 w-4 text-[#0FCE7C]  border-gray-300 rounded focus:ring-[#0FCE7C]"
                />
                <label htmlFor="remember" className="text-sm font-medium leading-none text-gray-400">
                  Remember me
                </label>
              </div>

              
              {apiError && (
                <p className="text-red-400 text-sm text-center">{apiError}</p>
              )}

              <button
                type="submit"
                className="w-full bg-[#0FCE7C]  hover:bg-[#0FCE96] h-10 rounded text-black font-semibold disabled:opacity-50" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>

    
              <div className="relative flex py-5 items-center"> 
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink mx-3 text-gray-400 text-xs">or continue with</span>
                    <div className="flex-grow border-t border-white/10"></div>
               </div>

              
              <button
                type="button" 
                onClick={handleGoogleLogin}
                className="hover:bg-white hover:text-black bg-[#414141] text-white py-2 px-4 -mt-7 rounded-md transition-colors duration-300 flex items-center justify-center font-medium w-full" 
               >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
                Google
              </button>
            </form>

          
            <div className="mt-8 text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#0FCE96] hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
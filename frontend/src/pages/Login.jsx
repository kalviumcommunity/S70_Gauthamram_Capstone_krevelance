import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Layout from "../components/layout/Layout";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(""); 

  const navigate = useNavigate();

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError(""); 

    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    if (!emailRegex.test(email)) {
      setEmailError("Invalid email address");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      alert("You have successfully logged in");
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen flex items-center justify-center ">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-lg p-8 ">
            <div className="text-cen ter mb-8">
              <Link to="/" className="inline-block">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0FCE7C] to-[#0FCE96] bg-clip-text text-transparent">
                  Krevelance
                </h1>
              </Link>
              <h2 className="text-3xl font-bold mt-6 mb-2 text-white">Welcome back</h2>
              <p className="text-gray-400 text-base font-semibold ">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                  <label  className="w-full font-bold text-base block text-left">Email address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="   Email ID"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="glass-input bg-white text-black w-full mt-3 rounded-lg h-10 "
                  />
                   {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
               
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-base font-bold">Password</label>
                  <Link to="/forgot-password" className="text-xs text-[#0FCE96]  hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative ">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="  Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="glass-input bg-white w-full mt-3 rounded-lg text-black h-10 "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-2 flex mt-3 items-center text-black"
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
                  className="h-4 w-4  border-black rounded "
                />
                <label htmlFor="remember" className="text-sm font-medium leading-none text-gray-400">
                  Remember me for 30 days
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0FCE7C] hover:bg-[#0FCE96] h-10 rounded text-black"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>

              <div className="relative ">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10"></span>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-krevelance-dark-card px-2 text-base text-gray-400">or continue </span>
                </div>
              </div>

              <button className=" bg- border hover:border-[#0FCE64] hover:bg-[#0FCE64] rounded text-white w-full flex items-center justify-center py-2">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
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

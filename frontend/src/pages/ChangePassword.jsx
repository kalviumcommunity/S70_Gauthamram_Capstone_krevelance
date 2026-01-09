import React, { useState } from "react";
import { Eye, EyeOff, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Navbar1 from "../components/layout/Navbar1";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL;

const ChangePassword = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!passwordData.currentPassword) {
            toast.error("Please enter your current password.");
            setIsLoading(false);
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            toast.error("New passwords do not match.");
            setIsLoading(false);
            return;
        }
        if (passwordData.newPassword.length < 8) {
            toast.error("New password must be at least 8 characters long.");
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.put(
                `${API_BASE_URL}/api/settings/password`,
                passwordData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            toast.success(response.data.message || "Password updated successfully!");
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: "",
            });
            setTimeout(() => navigate('/settings'), 1500);
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                err.message ||
                "Failed to update password."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Toaster />
            <Navbar1 />
            <div className="page-container mt-8 py-16 flex justify-center">
                <div className="w-full max-w-md">
                    <div className="glass-card p-6 rounded-lg text-left shadow-neo-dark">
                        <h2 className="text-2xl font-semibold mb-4 text-white">
                            Change Password
                        </h2>
                        <form onSubmit={handleUpdatePassword}>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            name="currentPassword"
                                            className="bg-white text-black rounded w-full h-9 px-2 pr-10"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordInputChange}
                                            required
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute inset-y-0 right-0 px-3 flex items-center text-black focus:outline-none"
                                        >
                                            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            className="bg-white text-black rounded w-full h-9 px-2 pr-10"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordInputChange}
                                            required
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute inset-y-0 right-0 px-3 flex items-center text-black focus:outline-none"
                                        >
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmNewPassword ? "text" : "password"}
                                            name="confirmNewPassword"
                                            className="bg-white text-black rounded w-full h-9 px-2 pr-10"
                                            value={passwordData.confirmNewPassword}
                                            onChange={handlePasswordInputChange}
                                            required
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                            className="absolute inset-y-0 right-0 px-3 flex items-center text-black focus:outline-none"
                                        >
                                            {showConfirmNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <button
                                    type="button"
                                    onClick={() => navigate('/settings')}
                                    className="bg-gray-600 hover:bg-gray-500 text-white rounded-md px-4 py-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#0FCE7C] hover:bg-[#0FCE96] text-black hover:scale-105 rounded-md px-4 py-2 flex items-center"
                                    disabled={isLoading}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {isLoading ? "Updating..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;

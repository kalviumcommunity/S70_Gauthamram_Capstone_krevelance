import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  CreditCard,
  Save,
  AlertTriangle,
  Check,
  X,
  Edit3,
  Eye,
  EyeOff,
  LogOut,
  Trash2,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

import Navbar1 from "../components/layout/Navbar1";

const COUNTRIES_LIST = [
  { name: "Choose your country" },
  { name: "Argentina", code: "AR", phoneCode: "+54" },
  { name: "Australia", code: "AU", phoneCode: "+61" },
  { name: "Brazil", code: "BR", phoneCode: "+55" },
  { name: "Canada", code: "CA", phoneCode: "+1" },
  { name: "China", code: "CN", phoneCode: "+86" },
  { name: "France", code: "FR", phoneCode: "+33" },
  { name: "Germany", code: "DE", phoneCode: "+49" },
  { name: "India", code: "IN", phoneCode: "+91" },
  { name: "Italy", code: "IT", phoneCode: "+39" },
  { name: "Japan", code: "JP", phoneCode: "+81" },
  { name: "Mexico", code: "MX", phoneCode: "+52" },
  { name: "Netherlands", code: "NL", phoneCode: "+31" },
  { name: "Nigeria", code: "NG", phoneCode: "+234" },
  { name: "Russia", code: "RU", phoneCode: "+7" },
  { name: "South Africa", code: "ZA", phoneCode: "+27" },
  { name: "South Korea", code: "KR", phoneCode: "+82" },
  { name: "Spain", code: "ES", phoneCode: "+34" },
  { name: "Switzerland", code: "CH", phoneCode: "+41" },
  { name: "United Kingdom", code: "GB", phoneCode: "+44" },
  { name: "United States", code: "US", phoneCode: "+1" },
];

const Toast = ({ message, type, onClose }) => {
  const bgColor = {
    success: "bg-green-600",
    error: "bg-red-600",
    warning: "bg-yellow-600",
    info: "bg-blue-600",
  }[type || "info"];

  const Icon = {
    success: Check,
    error: X,
    warning: AlertTriangle,
    info: null,
  }[type || "info"];

  return (
    <div
      className={`${bgColor} text-white px-4 py-3 rounded-md shadow-lg flex items-center justify-between transition-all duration-300 ease-in-out fixed bottom-4 left-1/2 -translate-x-1/2 z-50`}
      style={{ minWidth: "250px" }}
    >
      <div className="flex items-center text-white">
        {Icon && <Icon className="w-5 h-5 mr-2" />}
        <span className="text-white">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-white opacity-80 hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const Settings = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [profileLockedFields, setProfileLockedFields] = useState({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  const countries = COUNTRIES_LIST;

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    countryCode: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [plans, setPlans] = useState([
    {
      id: "free",
      name: "Free",
      price: 0,
      features: [
        "Basic financial analytics",
        "Up to 5 reports per month",
        "Data Export",
        "Email support",
      ],
      current: false,
    },
    {
      id: "pro",
      name: "Professional",
      price: 799,
      features: [
        "Advanced financial analytics",
        "Unlimited Financial Reports",
        "Data Export",
        "Email Support",
        "AI-Powered Insights",
        "Prioritized support",
      ],
      current: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 1999,
      features: [
        "Enterprise Financial Analysis",
        "Unlimited Financial Reports",
        "Data Export",
        "Email & Phone Support",
        "Advanced AI-Powered Insights",
        "Custom Reports",
        "Dedicated Account Manager",
      ],
      current: false,
    },
  ]);

  const [billingInfo, setBillingInfo] = useState({
    currentPlan: null,
    subscriptionStatus: null,
    nextBillingDate: null,
    razorpaySubscriptionId: null,
  });

  const showCustomToast = (message, type = "info") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setToastMessage("");
      setToastType("info");
    }, 5000);
  };

  const handleCancelSubscription = async () => {
  
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "http://localhost:1316/api/settings/billing/cancel",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showCustomToast( response.data.message || "Subscription cancelled successfully.", "success" );

      await fetchBillingDetails();
    } catch (err) {
      showCustomToast(
        err.response?.data?.message ||
          err.message ||
          "Failed to cancel subscription.",
        "error"
      );
      console.error(
        "Failed to cancel subscription:",
        err.response?.data || err
      );
    } finally {
      setIsLoading(false);
    }
  };

  const message = "Are you sure you want to cancel your subscription? This action cannot be undone.";
    

  const fetchBillingDetails = useCallback(async () => {
    console.log("fetchBillingDetails: Starting...");
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.get(
        "http://localhost:1316/api/settings/billing",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("fetchBillingDetails: API call successful, data:", data);
      setBillingInfo(data);
      setPlans((prevPlans) =>
        prevPlans.map((plan) => ({
          ...plan,
          current: plan.id === data.currentPlan,
        }))
      );
    } catch (err) {
      console.error(
        "fetchBillingDetails: API call failed:",
        err.response?.data || err
      );
      showCustomToast(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch billing details.",
        "error"
      );
    } finally {
      console.log("fetchBillingDetails: Setting isLoading to false.");
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    setIsProfileLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.get(
        "http://localhost:1316/api/settings/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProfile((prev) => ({
        ...prev,
        _id: data._id || "",
        name: data.name || "",
        email: data.email || "",
        company: data.company || "",
        phone: data.phone || "",
        address: data.address?.street || "",
        city: data.address?.city || "",
        state: data.address?.state || "",
        zip: data.address?.zip || "",
        country: data.address?.country || "",
        countryCode: data.address?.countryCode || "",
      }));

      if (data.address?.country && countries && countries.length > 0) {
        const countryDetails = countries.find(
          (c) => c.code === data.address.country
        );
        if (countryDetails) {
          setProfile((prev) => ({
            ...prev,
            countryCode: countryDetails.phoneCode || prev.countryCode || "",
          }));
        }
      }
      setProfileLockedFields(data.profileLockedFields || {});
    } catch (err) {
      console.error("Failed to fetch profile:", err.response?.data || err);
      showCustomToast(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch profile.",
        "error"
      );
    } finally {
      setIsProfileLoading(false);
    }
  }, [countries]);
  // setIsLoading, setBillingInfo, setPlans

  useEffect(() => {
    console.log("Main effect run. Active tab:", activeTab);
    if (activeTab === "profile") {
      fetchProfile();
      console.log("Would fetch profile");
    } else if (activeTab === "billing") {
      fetchBillingDetails();
      console.log("Would fetch billing details");
    }
  }, [activeTab, fetchProfile, fetchBillingDetails]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleCountryChange = (e) => {
    const selectedCountryCodeValue = e.target.value;
    const selectedCountryObject = countries.find(
      (c) => c.code === selectedCountryCodeValue
    );
    if (selectedCountryObject) {
      setProfile({
        ...profile,
        country: selectedCountryObject.code,
        countryCode: selectedCountryObject.phoneCode || "",
        phone: "",
      });
    } else {
      setProfile({ ...profile, country: "", countryCode: "", phone: "" });
    }
  };

  const handlePhoneInputChange = (e) => {
    const inputValue = e.target.value;
    const cleanedValue = inputValue.replace(/[^0-9]/g, "");
    setProfile({ ...profile, phone: cleanedValue });
  };

  const handleUpdateProfile = async (e) => {
    console.log("handleUpdateProfile called. Event:", e);
    e.preventDefault();
    setIsProfileLoading(true);

    const payload = {
      name: profile.name,
      company: profile.company,
      phone: profile.phone,
      street: profile.address,
      city: profile.city,
      state: profile.state,
      zip: profile.zip,
      country: profile.country,
      countryCode: profile.countryCode,
    };

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        "http://localhost:1316/api/settings/profile",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const responseData = response.data;

      setProfile((prevProfile) => ({
        ...prevProfile,
        name: responseData.user.name || "",
        email: responseData.user.email || "",
        company: responseData.user.company || "",
        phone: responseData.user.phone || "",
        address: responseData.user.address?.street || "",
        city: responseData.user.address?.city || "",
        state: responseData.user.address?.state || "",
        zip: responseData.user.address?.zip || "",
        country: responseData.user.address?.country || "",
        countryCode:
          responseData.user.address?.countryCode ||
          countries.find((c) => c.code === responseData.user.address?.country)
            ?.phoneCode ||
          "",
      }));
      setProfileLockedFields(responseData.user.profileLockedFields || {});
      showCustomToast(
        responseData.message || "Profile updated successfully!",
        "success"
      );
      setIsEditingProfile(false);
    } catch (err) {
      showCustomToast(
        err.response?.data?.message ||
          err.message ||
          "Failed to update profile.",
        "error"
      );
      console.error("Failed to update profile:", err.response?.data || err);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const toggleShowCurrentPassword = () =>
    setShowCurrentPassword(!showCurrentPassword);
  const toggleShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleShowConfirmNewPassword = () =>
    setShowConfirmNewPassword(!showConfirmNewPassword);

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setIsPasswordLoading(true);

    if (!passwordData.currentPassword) {
      showCustomToast("Please enter your current password.", "warning");
      setIsPasswordLoading(false);
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      showCustomToast("New passwords do not match.", "warning");
      setIsPasswordLoading(false);
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showCustomToast(
        "New password must be at least 8 characters long.",
        "warning"
      );
      setIsPasswordLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        "http://localhost:1316/api/settings/password",
        passwordData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = response.data;
      showCustomToast( data.message || "Password updated successfully!",
        "success"
      );
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      showCustomToast(
        err.response?.data?.message ||
          err.message ||
          "Failed to update password.",
        "error"
      );
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleChangePlan = async (newPlanId) => {
    const planToUpdate = plans.find((plan) => plan.id === newPlanId);

    if (isLoading) {
      showCustomToast("A plan change is already in progress.", "info");
      return;
    }
    if (!planToUpdate) {
      showCustomToast("Invalid plan selected.", "error");
      return;
    }
    if (planToUpdate.current) {
      showCustomToast("You are already on this plan.", "info");
      return;
    }

    let confirmMessage = `Are you sure you want to change to the ${planToUpdate.name} plan?`;
    if (newPlanId === "free" && billingInfo.currentPlan !== "free") {
      confirmMessage = "Are you sure you want to downgrade to the Free plan? Your current subscription will be cancelled.";
    } else if (planToUpdate.price > (billingInfo.currentPlanPrice || 0)) {
      confirmMessage = `Are you sure you want to upgrade to the ${planToUpdate.name} plan?`;
    } else if (planToUpdate.price < (billingInfo.currentPlanPrice || 0)) {
      confirmMessage = `Are you sure you want to downgrade to the ${planToUpdate.name} plan?`;
    }


    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await axios.post(
        "http://localhost:1316/api/settings/billing/subscribe",
        { newPlanId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { subscriptionId, status, message, razorpayKeyId } = response.data;

      setBillingInfo((prev) => ({
        ...prev,
        currentPlan: newPlanId,
        subscriptionStatus: status,
        razorpaySubscriptionId: subscriptionId,
        currentPlanPrice: planToUpdate.price,
      }));

      setPlans((prevPlans) =>
        prevPlans.map((p) => ({ ...p, current: p.id === newPlanId }))
      );

      if (newPlanId === "free") {
        showCustomToast("Successfully downgraded to Free Plan.", "success");
        setIsLoading(false);
        return;
      }

      if (status === "created" && subscriptionId) {
        if (typeof window.Razorpay === "undefined") {
          showCustomToast(
            "Razorpay SDK not loaded. Please refresh the page or check your internet connection.",
            "error"
          );
          console.error("Razorpay SDK (window.Razorpay) is not available.");
          setIsLoading(false);
          return;
        }

        const razorpayOptions = {
          key: razorpayKeyId,
          subscription_id: subscriptionId,
          name: "Krevelance",
          description: `Subscription for ${planToUpdate.name} plan`,
          handler: async function (paymentResponse) {
            setSuccessMessage("Payment successful! Your plan is now active.");
            console.log("Razorpay Payment Response:", paymentResponse);
            await fetchBillingDetails();
            setIsLoading(false);
          },
          prefill: {
            name: profile.name,
            email: profile.email,
            contact: profile.phone,
          },
          theme: {
            color: "#0FCE7C",
          },
        };

        const rzp = new window.Razorpay(razorpayOptions);
        rzp.on("payment.failed", function (response) {
          showCustomToast(
            `Payment failed: ${response.error.description}`,
            "error"
          );
          console.error("Razorpay Payment Failed:", response.error);
          fetchBillingDetails();
          setIsLoading(false);
        });
        rzp.open();
      } else {
        showCustomToast(
          message ||
            "Subscription could not be created or an unexpected status was returned.",
          "error"
        );
        setIsLoading(false);
      }
    } catch (err) {
      showCustomToast(
        err.response?.data?.message || err.message || "Failed to change plan.",
        "error"
      );
      console.error("Failed to change plan:", err.response?.data || err);
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    setIsDeletingAccount(true);
    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "http://localhost:1316/api/settings/delete-account-request",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = response.data;
      showCustomToast(
        data.message ||
          "Account deletion request sent. Please check your email to confirm.",
        "success"
      );

      // setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      showCustomToast(
        err.response?.data?.message ||
          err.message ||
          "Account deletion request failed.",
        "error"
      );
    } finally {
      setIsDeletingAccount(false);
      setIsLoading(false);
    }
  };

  const isFieldDisabled = (fieldName) =>
    !isEditingProfile || profileLockedFields[fieldName];

  return (
    <div>
      <Toaster />
      <Navbar1 />
      <div className="page-container mt-8 py-16">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-white text-left">
            Account Settings
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 transition duration-200 ease-in-out"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </div>

        <p className="text-gray-400 text-left">
          Manage your account, subscription and preferences
        </p>

        {showToast && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <div className="w-full lg:w-64">
            <div className="flex flex-row lg:flex-col gap-1">
              <button
                className={
                  "w-full justify-start gap-2 mb-2 rounded-md" +
                  (activeTab === "profile"
                    ? " bg-[#0FCE7C]/30 text-[#0FCE7C]"
                    : " hover:bg-gray-800/50 text-white")
                }
                onClick={() => setActiveTab("profile")}
              >
                <div className="flex p-3">
                  <User className="mr-4" />
                  <p className="text-lg text-left">Profile</p>
                </div>
              </button>
              <button
                className={
                  "w-full justify-start gap-2 mb-2 rounded-md" +
                  (activeTab === "billing"
                    ? " bg-[#0FCE7C]/30 text-[#0FCE7C]"
                    : " hover:bg-gray-800/50 text-white")
                }
                onClick={() => setActiveTab("billing")}
              >
                <div className="flex p-3">
                  <CreditCard className="mr-4" />
                  <p className="text-lg -mt-1 text-left">Billing</p>
                </div>
              </button>
            </div>
          </div>

          <div className="flex-1">
            {activeTab === "profile" && (
              <div className="mt-0 space-y-6">
                <div className="glass-card p-6 rounded-lg">
                  <h2 className=" font-semibold mb-4 text-white text-left text-2xl">
                    Personal Information
                  </h2>
                  {!isEditingProfile ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(!isEditingProfile);
                      }}
                      className="flex bg-[#0FCE7C]/30 text-[#0FCE7C] px-4 py-2 mb-2 rounded-md hover:scale-105 hover:bg-[#0FCE7C]/30"
                      disabled={isProfileLoading}
                    >
                      <Edit3 className="w-6 h-6 mr-3" /> Update Profile
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                      }}
                      className="flex items-center  px-4 py-2 mb-2 text-white bg-red-600 hover:text-white  hover:bg-red-600 rounded-md hover:scale-105"
                      disabled={isProfileLoading}
                    >
                      Cancel
                    </button>
                  )}
                  <form onSubmit={handleUpdateProfile}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-left">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Full Name
                        </label>
                        <input
                          name="name"
                          className={`bg-white text-black rounded w-full h-9 px-2 ${
                            isFieldDisabled("name")
                              ? "bg-gray-200 cursor-not-allowed"
                              : ""
                          }`}
                          value={profile.name}
                          onChange={handleProfileInputChange}
                          disabled={isFieldDisabled("name")}
                          placeholder={
                            !isEditingProfile && !profile.name ? "Not set" : ""
                          }
                        />
                        {isEditingProfile &&
                          profileLockedFields.name &&
                          profile.name && (
                            <p className="text-xs text-gray-400 mt-1">
                              Name cannot be changed.
                            </p>
                          )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          className="bg-gray-200 text-black rounded w-full h-9 px-2 cursor-not-allowed"
                          value={profile.email}
                          readOnly
                          placeholder="Not set"
                        />
                        {profileLockedFields.email && (
                          <p className="text-xs text-gray-400 mt-1">
                            Email cannot be changed.
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Company Name
                        </label>
                        <input
                          name="company"
                          className={`bg-white text-black rounded w-full h-9 px-2 ${
                            !isEditingProfile
                              ? "bg-gray-200 cursor-not-allowed"
                              : ""
                          }`}
                          value={profile.company}
                          onChange={handleProfileInputChange}
                          disabled={!isEditingProfile}
                          placeholder={
                            !isEditingProfile && !profile.company
                              ? "Not set"
                              : ""
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Country
                        </label>
                        <select
                          name="country"
                          className={`bg-white text-black rounded w-full h-9 px-2 ${
                            !isEditingProfile
                              ? "bg-gray-200 cursor-not-allowed"
                              : ""
                          }`}
                          value={profile.country}
                          onChange={handleCountryChange}
                          disabled={!isEditingProfile}
                        >
                          {countries.map((country) => (
                            <option
                              key={country.code || "choose"}
                              value={country.code}
                            >
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Phone Number
                        </label>
                        <div className="flex">
                          {isEditingProfile && profile.countryCode && (
                            <span className="inline-flex items-center px-3 h-9 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-sm">
                              {profile.countryCode}
                            </span>
                          )}
                          <input
                            name="phone"
                            type="tel"
                            className={`bg-white text-black rounded-${
                              isEditingProfile && profile.countryCode
                                ? "r-md"
                                : "md"
                            } w-full h-9 px-2 ${
                              !isEditingProfile
                                ? "bg-gray-200 cursor-not-allowed"
                                : ""
                            }`}
                            value={
                              !isEditingProfile && profile.countryCode
                                ? `${profile.countryCode} ${profile.phone}`
                                : profile.phone
                            }
                            onChange={handlePhoneInputChange}
                            disabled={!isEditingProfile || !profile.country}
                            placeholder={
                              !isEditingProfile && !profile.phone
                                ? "Not set"
                                : profile.country
                                ? "Enter phone number"
                                : "Select country first"
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <h3 className="text-md font-semibold mb-4 text-white text-left">
                      Billing Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-left">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Street Address
                        </label>
                        <input
                          name="address"
                          className={`bg-white text-black rounded w-full h-9 px-2 ${
                            !isEditingProfile
                              ? "bg-gray-200 cursor-not-allowed"
                              : ""
                          }`}
                          value={profile.address}
                          onChange={handleProfileInputChange}
                          disabled={!isEditingProfile}
                          placeholder={
                            !isEditingProfile && !profile.address
                              ? "Not set"
                              : ""
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          City
                        </label>
                        <input
                          name="city"
                          className={`bg-white text-black rounded w-full h-9 px-2 ${
                            !isEditingProfile
                              ? "bg-gray-200 cursor-not-allowed"
                              : ""
                          }`}
                          value={profile.city}
                          onChange={handleProfileInputChange}
                          disabled={!isEditingProfile}
                          placeholder={
                            !isEditingProfile && !profile.city ? "Not set" : ""
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            State/Province
                          </label>
                          <input
                            name="state"
                            className={`bg-white text-black rounded w-full h-9 px-2 ${
                              !isEditingProfile
                                ? "bg-gray-200 cursor-not-allowed"
                                : ""
                            }`}
                            value={profile.state}
                            onChange={handleProfileInputChange}
                            disabled={!isEditingProfile}
                            placeholder={
                              !isEditingProfile && !profile.state
                                ? "Not set"
                                : ""
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Zip/Postal Code
                          </label>
                          <input
                            name="zip"
                            className={`bg-white text-black rounded w-full h-9 px-2 ${
                              !isEditingProfile
                                ? "bg-gray-200 cursor-not-allowed"
                                : ""
                            }`}
                            value={profile.zip}
                            onChange={handleProfileInputChange}
                            disabled={!isEditingProfile}
                            placeholder={
                              !isEditingProfile && !profile.zip ? "Not set" : ""
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {isEditingProfile && (
                      <button
                        type="submit"
                        className="flex hover:scale-105 bg-[#0FCE7C] hover:bg-[#0FCE96] text-black rounded-md px-4 py-2"
                        disabled={isProfileLoading}
                      >
                        <Save className="mr-2 mt-1 h-4 w-4" />
                        {isProfileLoading ? "Saving..." : "Save Changes"}
                      </button>
                    )}
                  </form>
                </div>

                {/*password */}

                <div className="glass-card p-6 rounded-lg text-left">
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
                            className="bg-white text-black rounded w-85 h-9 px-2"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordInputChange}
                            required
                            disabled={isPasswordLoading}
                          />
                          <button
                            type="button"
                            onClick={toggleShowCurrentPassword}
                            className="absolute inset-y-0 left-78 pr-3 flex items-center text-black focus:outline-none"
                          >
                            {showCurrentPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              name="newPassword"
                              className="bg-white text-black rounded w-85  h-9 px-2"
                              value={passwordData.newPassword}
                              onChange={handlePasswordInputChange}
                              required
                              disabled={isPasswordLoading}
                            />
                            <button
                              type="button"
                              onClick={toggleShowNewPassword}
                              className="absolute inset-y-0 left-78 pr-3 flex items-center text-black focus:outline-none"
                            >
                              {showNewPassword ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={
                                showConfirmNewPassword ? "text" : "password"
                              }
                              name="confirmNewPassword"
                              className="bg-white text-black rounded w-85 h-9 px-2"
                              value={passwordData.confirmNewPassword}
                              onChange={handlePasswordInputChange}
                              required
                              disabled={isPasswordLoading}
                            />
                            <button
                              type="button"
                              onClick={toggleShowConfirmNewPassword}
                              className="absolute inset-y-0 left-78  pr-3 flex items-center text-black focus:outline-none"
                            >
                              {showConfirmNewPassword ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-[#0FCE7C] hover:bg-[#0FCE96] text-black hover:scale-105 rounded-md px-4 py-2"
                      disabled={isPasswordLoading}
                    >
                      {isPasswordLoading ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </div>

                {/*Delete Account */}

                <div className="glass-card text-left p-6 rounded-lg">
                  <h2 className="text-2xl font-semibold mb-2 text-white">
                    Danger Zone
                  </h2>
                  <p className="text-gray-400 mb-4">
                    Once you delete your account, all your data will be
                    permanently removed. This action cannot be undone.
                  </p>

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex bg-red-700 mb-3 hover:scale-105 hover:bg-red-500 text-white rounded-md px-4 py-2"
                    disabled={isLoading || isDeletingAccount}
                  >
                    <AlertTriangle className="mr-2 mt-1 h-4 w-4" />
                    Delete Account
                  </button>
                  
                </div>
              </div>
            )}

            {/* billing */}

            {activeTab === "billing" && (
              <div className="mt-0 space-y-6">
                {isLoading && (
                  <p className="text-white">Loading billing details...</p>
                )}
                {error && (
                  <p className="text-red-500 bg-red-100 p-3 rounded-md">
                    {error}
                  </p>
                )}

                <div className="glass-card p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-semibold text-white">
                      Current Plan
                    </h2>
                    <span className="bg-[#0FCE7C]/30 text-[#0FCE7C] font-medium px-2 py-1 rounded-full">
                      {plans.find((p) => p.id === billingInfo.currentPlan)
                        ?.name ||
                        billingInfo.currentPlan ||
                        "N/A"}{" "}
                      Plan
                    </span>
                  </div>
                  <p className="text-gray-400 mb-2 text-left">
                    Your next billing date is{" "}
                    <span className="text-white">
                      {billingInfo.nextBillingDate
                        ? new Date(
                            billingInfo.nextBillingDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                    <br />
                    Status:{" "}
                    <span className="text-white capitalize">
                      {billingInfo.subscriptionStatus || "N/A"}
                    </span>
                  </p>
                  <div className="text-left gap-4 mt-4">
                    <button
                      className="bg-white mr-4 text-black hover:scale-105 hover:bg-[#0FCE7C] rounded-md px-4 py-2"
                      onClick={() =>
                        showCustomToast(
                          "Invoice history feature coming soon!",
                          "info"
                        )
                      }
                    >
                      View Invoice History
                    </button>
                    {billingInfo.currentPlan &&
                      billingInfo.currentPlan !== "free" &&
                      billingInfo.subscriptionStatus === "active" && (
                        <button
                          onClick={handleCancelSubscription}
                          disabled={isLoading}
                          className="bg-red-600 hover:scale-105 hover:bg-red-700 rounded-md px-4 py-2 disabled:opacity-50"
                        >
                          Cancel Subscription
                        </button>
                      )}
                  </div>
                </div>

                <div className="glass-card p-6 rounded-lg">
                  <h2 className="text-3xl font-semibold mb-6 text-white text-left">
                    Available Plans
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                      const isCurrent = billingInfo.currentPlan === plan.id;
                      const currentPlanDetails = plans.find(
                        (p) => p.id === billingInfo.currentPlan
                      );

                      let buttonText = "Choose Plan";
                      if (isCurrent) {
                        buttonText = "Current Plan";
                      } else if (
                        currentPlanDetails &&
                        plan.price > currentPlanDetails.price
                      ) {
                        buttonText = "Upgrade";
                      } else if (
                        currentPlanDetails &&
                        plan.price < currentPlanDetails.price &&
                        plan.id !== "free"
                      ) {
                        buttonText = "Downgrade";
                      } else if (
                        plan.id === "free" &&
                        currentPlanDetails &&
                        currentPlanDetails.id !== "free"
                      ) {
                        buttonText = "Downgrade to Free";
                      }

                      return (
                        <div
                          key={plan.id}
                          className={`border rounded-lg p-5 ${
                            isCurrent
                              ? " border-[#0FCE7C] bg-[#0FCE7C]/5 ring-2 ring-[#0FCE7C]"
                              : " border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-white">
                                {plan.name}
                              </h3>
                              <div className="mt-1">
                                <span className="text-2xl font-bold text-white">
                                  ₹{plan.price}
                                </span>
                                {plan.id !== "free" && (
                                  <span className="text-gray-400 ml-1">
                                    /month
                                  </span>
                                )}
                              </div>
                            </div>
                            {isCurrent && (
                              <span className="bg-[#0FCE7C] text-black text-xs px-2 py-1 rounded-md font-semibold">
                                CURRENT
                              </span>
                            )}
                          </div>
                          <ul className="space-y-2 mb-6 text-left">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <Check className="h-5 w-5 text-[#0FCE7C] mr-2 shrink-0" />

                                <span className="text-sm text-gray-300">
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <button
                            className={`w-full rounded-md hover:scale-105 px-4 py-2 font-semibold disabled:opacity-60 disabled:cursor-not-allowed ${
                              isCurrent
                                ? "border border-white/20 text-white bg-transparent cursor-default"
                                : " bg-[#0FCE7C] hover:bg-[#0dbd74] text-black"
                            }`}
                            disabled={isCurrent || isLoading}
                            onClick={() => handleChangePlan(plan.id)}
                          >
                            {buttonText}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {showDeleteConfirm && (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div className="glass-card p-8 rounded-lg text-center max-w-md mx-4">
            <AlertTriangle className="mx-auto h-16 w-16 text-[#ff000d]" />
            <h2 className="text-2xl font-bold text-white mt-4">
                Are you sure?
            </h2>
            <p className="text-gray-300 mt-2 mb-6">
                This action is irreversible. All your data will be permanently removed. Please confirm you want to proceed.
            </p>
            <div className="flex justify-center gap-4">
                <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-6 py-2 rounded-md bg-[#303030] hover:bg-[#3b3b3b] text-white font-semibold"
                    disabled={isDeletingAccount}
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirmDelete}
                    className="px-6 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center"
                    disabled={isDeletingAccount}
                >
                    {isDeletingAccount ? (
                        <Loader2 className="animate-spin mr-2" />
                    ) : (
                        <Trash2 className="mr-2 h-5 w-5" />
                    )}
                    {isDeletingAccount ? "Deleting..." : "Yes, Delete It"}
                </button>
            </div>
        </div>
    </div>
)}
      </div>
    </div>
  );
};

export default Settings;

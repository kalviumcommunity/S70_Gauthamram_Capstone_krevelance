import React, { useState } from "react";
import {
  User,
  CreditCard,
  Bell,
  Shield,
  Save,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import Navbar1 from "../components/layout/Navbar1";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const countries = [
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

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordUpdated: "2023-05-15",
    loginAlerts: true,
  });

  const [plans, setPlans] = useState([
    {
      id: "free",
      name: "Free",
      price: 399,
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
      ],
      current: false,
    },
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: "visa",
      last4: "4242",
      expiry: "06/2025",
      default: true,
    },
    {
      id: 2,
      type: "mastercard",
      last4: "5555",
      expiry: "09/2024",
      default: false,
    },
  ]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    alert("Profile updated!\nYour profile information has been saved.");
    console.log("Updated profile:", profile);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    alert("Password updated!\nYour password has been changed successfully.");
    console.log("Password updated");
  };

  const handleUpdateSecurity = () => {
    alert(
      "Security settings updated!\nYour security preferences have been saved."
    );
    console.log("Updated security:", security);
  };

  const handleChangePlan = (planId) => {
    const planToUpdate = plans.find((plan) => plan.id === planId);

    if (planToUpdate) {
      const updatedPlans = plans.map((plan) => ({
        ...plan,
        current: plan.id === planId,
      }));
      setPlans(updatedPlans);

      const message =
        planId === "free"
          ? "Downgraded to Free Plan\nYour subscription has been updated."
          : `Upgraded to ${
              planId.charAt(0).toUpperCase() + planId.slice(1)
            } Plan\nYour subscription has been updated.`;
      alert(message);
      console.log("Changed plan to:", planId);
    }
  };

  const handleDeletePaymentMethod = (methodId) => {
    const updatedMethods = paymentMethods.filter(
      (method) => method.id !== methodId
    );
    setPaymentMethods(updatedMethods);
    alert("Payment method deleted.");
    console.log("Deleted payment method:", methodId);
  };

  const handleDeleteAccount = () => {
    alert("We've sent a confirmation to your email.");
    console.log("Account deletion requested");
  };

  return (
    <div>
      <Navbar1 />
      <div className="page-container mt-8 py-16">
        <h1 className="text-3xl font-bold text-white text-left">
          Account Settings
        </h1>
        <p className="text-gray-400 text-left">
          Manage your account, subscription and preferences
        </p>

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

              <button
                className={
                  "w-full justify-start gap-2 mb-2 rounded-md" +
                  (activeTab === "security"
                    ? " bg-[#0FCE7C]/30 text-[#0FCE7C]"
                    : " hover:bg-gray-800/50 text-white")
                }
                onClick={() => setActiveTab("security")}
              >
                <div className="flex p-3">
                  <Shield className="mr-4" />
                  <p className="text-lg -mt-1 text-left">Security</p>
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
                  <form onSubmit={handleUpdateProfile}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-left">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Full Name
                        </label>
                        <input
                          className="bg-white text-black rounded w-100 h-9"
                          value={profile.name}
                          onChange={(e) =>
                            setProfile({ ...profile, name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Email Address
                        </label>
                        <input
                          className="bg-white text-black rounded w-100 h-9"
                          type="email"
                          value={profile.email}
                          onChange={(e) =>
                            setProfile({ ...profile, email: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Company Name
                        </label>
                        <input
                          className="bg-white text-black rounded w-100 h-9"
                          value={profile.company}
                          onChange={(e) =>
                            setProfile({ ...profile, company: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Country
                        </label>
                        <select
                          className="bg-white text-black rounded w-100 h-9"
                          value={profile.country}
                          onChange={(e) => {
                            const selectedCountry = countries.find(
                              (c) => c.code === e.target.value
                            );
                            if (selectedCountry) {
                              setProfile({
                                ...profile,
                                country: selectedCountry.code,
                                countryCode: selectedCountry.phoneCode,
                              });
                            }
                          }}
                        >
                          {countries.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Phone Number
                        </label>
                        <input
                          className="bg-white text-black rounded w-100 h-9"
                          value={profile.countryCode + profile.phone}
                          onChange={(e) => {
                            const phoneNumber = e.target.value.slice(
                              profile.countryCode.length
                            );
                            setProfile({ ...profile, phone: phoneNumber });
                          }}
                        />
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
                          className="bg-white text-black rounded w-219 h-9"
                          value={profile.address}
                          onChange={(e) =>
                            setProfile({ ...profile, address: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          City
                        </label>
                        <input
                          className="bg-white text-black rounded w-100 h-9"
                          value={profile.city}
                          onChange={(e) =>
                            setProfile({ ...profile, city: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            State/Province
                          </label>
                          <input
                            className="bg-white text-black rounded w-50 h-9"
                            value={profile.state}
                            onChange={(e) =>
                              setProfile({ ...profile, state: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Zip/Postal Code
                          </label>
                          <input
                            className="bg-white text-black rounded w-50 h-9"
                            value={profile.zip}
                            onChange={(e) =>
                              setProfile({ ...profile, zip: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div></div>
                    </div>

                    <button
                      type="submit"
                      className="flex hover:scale-105 bg-[#0FCE7C] hover:bg-[#0FCE96] text-black rounded-md px-4 py-2"
                    >
                      <Save className="mr-2 mt-1 h-4 w-4" />
                      Save Changes
                    </button>
                  </form>
                </div>

                <div className="glass-card p-6 rounded-lg text-left">
                  <h2 className="text-3xl font-semibold mb-4 text-white">
                    Change Password
                  </h2>
                  <form onSubmit={handleUpdatePassword}>
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Current Password
                        </label>
                        <input
                          className="bg-white text-black rounded w-100 h-9"
                          type="password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          New Password
                        </label>
                        <input
                          className="bg-white text-black rounded w-100 h-9"
                          type="password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          className="bg-white text-black rounded w-100 h-9"
                          type="password"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-[#0FCE7C] hover:bg-[#0FCE96] text-black hover:scale-105 rounded-md px-4 py-2"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

                <div className="glass-card text-left p-6 rounded-lg">
                  <h2 className="text-3xl font-semibold mb-2 text-white">
                    Danger Zone
                  </h2>
                  <p className="text-gray-400 text-sm mb-4">
                    Permanently delete your account and all of your data
                  </p>

                  <button
                    className="flex bg-red-600 hover:scale-105 hover:bg-red-700 rounded-md px-4 py-2"
                    onClick={handleDeleteAccount}
                  >
                    <AlertTriangle className="mr-2 mt-1 h-4 w-4" />
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="mt-0 space-y-6">
                <div className="glass-card p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-semibold text-white">
                      Current Plan
                    </h2>
                    <span className="bg-[#0FCE7C]/30 text-[#0FCE7C]  font-medium px-2 py-1 rounded-full">
                      {plans.find((p) => p.current)?.name || "N/A"} Plan
                    </span>
                  </div>
                  <p className="text-gray-400 mb-2 text-left">
                    Your next billing date is{" "}
                    <span className="text-white">August 16, 2025</span>
                  </p>
                  <div className="text-left gap-4 mt-4">
                    <button className="bg-white mr-4 text-black hover:scale-105 hover:bg-[#0FCE7C] rounded-md px-4 py-2">
                      View Invoice History
                    </button>
                    <button className="bg-red-600 hover:scale-105 hover:bg-red-700 rounded-md px-4 py-2">
                      Cancel Subscription
                    </button>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-lg">
                  <h2 className="text-3xl font-semibold mb-6 text-white text-left">
                    Available Plans
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className={
                          "border rounded-lg p-5" +
                          (plan.current
                            ? " border-[#0FCE7C] bg-[#0FCE7C]/5"
                            : " border-white/10 hover:border-white/20")
                        }
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
                              <span className="text-gray-400 ml-1">/month</span>
                            </div>
                          </div>
                          {plan.current && (
                            <span className="bg-[#0FCE7C] text-black px-2 py-1 rounded-md">
                              Current
                            </span>
                          )}
                        </div>

                        <ul className="space-y-2 mb-6">
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
                          className={
                            "w-full rounded-md hover:scale-105 px-4 py-2" +
                            (plan.current
                              ? "  border border-white/20 text-black bg-white cursor-default"
                              : " bg-[#0FCE7C] hover:bg-[#0FCE7C]-light text-black")
                          }
                          disabled={plan.current}
                          onClick={() => handleChangePlan(plan.id)}
                        >
                          {plan.current
                            ? "Current Plan"
                            : plan.price > 0
                            ? "Upgrade"
                            : "Downgrade"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6 rounded-lg">
                  <h2 className="text-3xl font-semibold mb-4 text-white text-left">
                    Payment Methods
                  </h2>
                  <div className="space-y-4 mb-6">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between border border-white/10 rounded-lg p-4"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center mr-4">
                            {method.type === "visa" ? (
                              <span className="text-blue-500 font-bold">
                                VISA
                              </span>
                            ) : (
                              <span className="text-red-500 font-bold">MC</span>
                            )}
                          </div>
                          <div>
                            <p className="text-white">
                              •••• •••• •••• {method.last4}
                            </p>
                            <p className="text-sm text-gray-400">
                              Expires {method.expiry}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {method.default && (
                            <span className="bg-[#0FCE7C]/30 text-[#0FCE7C] px-2 py-1 rounded-md mr-3">
                              Default
                            </span>
                          )}
                          <button
                            size="sm"
                            className="h-8 w-8 pl-2 text-red-600  rounded-full hover:bg-white/10"
                            onClick={() => handleDeletePaymentMethod(method.id)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="hover:bg-white text-black hover:scale-105 bg-[#0FCE7C] rounded-md px-4 py-2">
                    Add Payment Method
                  </button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="mt-0 space-y-6">
                <div className="glass-card p-6 rounded-lg text-left">
                  <h2 className="text-3xl font-semibold mb-6 text-white">
                    Security Settings
                  </h2>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">
                            Two-Factor Authentication
                          </p>
                          <p className="text-sm text-gray-400">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            value=""
                            className="sr-only peer"
                            checked={security.twoFactorAuth}
                            onChange={(e) =>
                              setSecurity({
                                ...security,
                                twoFactorAuth: e.target.checked,
                              })
                            }
                          />
                          <div className="w-11 h-6 bg-white peer-focus:outline-none   rounded-full peer  peer-checked:after:translate-x-full  after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#000000] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0FCE7C] "></div>
                        </label>
                      </div>

                      <hr className="bg-white/10" />

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">
                            Session Timeout
                          </p>
                          <p className="text-sm text-gray-400">
                            Automatically log out after a period of inactivity
                            (minutes)
                          </p>
                        </div>
                        <button
                          variant="outline"
                          size="sm"
                          className={`border-white/10 p-2 rounded-lg ${
                            security.sessionTimeout === 15
                              ? "bg-[#0FCE7C]/30 text-[#0FCE7C]"
                              : "text-white"
                          }`}
                          onClick={() =>
                            setSecurity({ ...security, sessionTimeout: 15 })
                          }
                        >
                          15 minutes
                        </button>
                        <button
                          variant="outline"
                          size="sm"
                          className={`border-white/10 p-2 rounded-lg ${
                            security.sessionTimeout === 30
                              ? "bg-[#0FCE7C]/30 text-[#0FCE7C]"
                              : "text-white"
                          }`}
                          onClick={() =>
                            setSecurity({ ...security, sessionTimeout: 30 })
                          }
                        >
                          30 minutes
                        </button>
                        <button
                          variant="outline"
                          size="sm"
                          className={`border-white/10 p-2 rounded-lg ${
                            security.sessionTimeout === 60
                              ? "bg-[#0FCE7C]/30 text-[#0FCE7C]"
                              : "text-white"
                          }`}
                          onClick={() =>
                            setSecurity({ ...security, sessionTimeout: 60 })
                          }
                        >
                          1 hour
                        </button>
                      </div>

                      <hr className="bg-white/10" />

                      <div className="flex">
                        <p className="font-medium text-white">
                          Password Updated
                        </p>
                        <p className="text-sm mt-1 ml-166 text-gray-400">
                          {security.passwordUpdated}
                        </p>
                      </div>

                      <hr className="bg-white/10" />

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">Login Alerts</p>
                          <p className="text-sm text-gray-400">
                            Receive notifications for new logins to your account
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            value=""
                            className="sr-only peer"
                            checked={security.loginAlerts}
                            onChange={(e) =>
                              setSecurity({
                                ...security,
                                loginAlerts: e.target.checked,
                              })
                            }
                          />
                          <div className="w-11 h-6 bg-white peer-focus:outline-none   rounded-full peer  peer-checked:after:translate-x-full  after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#000000] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0FCE7C]"></div>
                        </label>
                      </div>
                    </div>

                    <button
                      className="bg-[#0FCE7C] hover:scale-105 hover:bg-[#0FCE96] text-black rounded-md px-4 py-2 mt-6"
                      onClick={handleUpdateSecurity}
                    >
                      Save Security Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
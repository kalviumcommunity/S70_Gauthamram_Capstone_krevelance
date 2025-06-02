import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WelcomeHeader = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);

      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        console.warn("No authentication token found. User not logged in?");
        setError("Authentication required.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "https://s70-gauthamram-capstone-krevelance-1.onrender.com/api/settings/profile",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Failed to parse error response" }));
          let errorMessage =
            errorData.message || `HTTP error! status: ${response.status}`;

          if (response.status === 401) {
            console.log(
              "Authentication failed (401), potentially redirecting to login..."
            );
            setError("Session expired. Please log in again.");
          } else {
            console.error(
              `HTTP error! status: ${response.status}`,
              errorData.message
            );
            setError(`Error fetching profile: ${errorMessage}`);
          }
          throw new Error(errorMessage); 
        } 

        const responseData = await response.json(); 
        if (responseData && responseData.name) {
          setUserName(responseData.name);
          console.log("Successfully fetched user name:", responseData.name);
        } else {
          console.warn(
            "Fetched user data missing name or invalid structure:",
            responseData
          );
          setError("User data incomplete or invalid."); 
          setUserName("User"); 
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        if (!error) {
          
          setError("Failed to fetch user data.");
        }
        setUserName("User"); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 block text-left text-white">
            Loading...
          </h1>
          <p className="text-gray-400">Fetching your details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 block text-left text-white">
            Welcome back!
          </h1>
          <p className="text-red-400">Could not load name: {error}</p>
          <p className="text-gray-400">
            Here's an overview of your financial performance
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 block text-left text-white">
          Welcome back, {userName}
        </h1>
        <p className="text-gray-400">
          Here's an overview of your financial performance
        </p>
      </div>
    </div>
  );
};

export default WelcomeHeader;

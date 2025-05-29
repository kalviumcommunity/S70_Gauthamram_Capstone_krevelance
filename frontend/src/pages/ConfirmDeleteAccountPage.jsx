import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar1";

const ConfirmDeleteAccountPage = () => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setError("No deletion token provided. This link is invalid.");
      setIsLoading(false);
      return;
    }

    const confirmDeletion = async () => {
      setIsLoading(true);
      setError("");
      setMessage("");
      try {
        const response = await fetch(
          `http://localhost:1316/api/settings/confirm-delete-account?token=${token}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (
            response.status === 400 &&
            data.message === "Invalid or expired deletion token."
          ) {
            setMessage(
              "Account was already deleted"
            );
            setError(""); 
            console.warn(
              "Deletion link used multiple times or already expired."
            );
          } else {
            throw new Error(
              data.message || `HTTP error! status: ${response.status}`
            );
          }
        } else {
          setMessage(data.message || "Account deleted successfully.");
          setError(""); 

          localStorage.removeItem("authToken"); 
          setTimeout(() => {
            navigate("/signup");
          }, 3000);
         }
      } catch (err) {
        console.error("Account deletion confirmation failed:", err); 
           if (!message) {
          
          setError(err.message || "An unexpected error occurred.");
        }
        setMessage(""); 
      } finally {
        setIsLoading(false); 
      }
    };
    confirmDeletion();
  }, [location.search, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <Navbar />

      <div className="bg-black p-8 rounded-lg shadow-lg text-center max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-4">Account Delete Confirmation</h1>

        {isLoading && (
          <div className="flex flex-col items-center">
            <p className="text-white ">Processing your request...</p>
          </div>
        )}

        {message && !isLoading && (
          <p className="text-green-500 text-lg">{message}</p>
        )}

        {error && !isLoading && <p className="text-red-500 text-lg">{error}</p>}
      </div>
    </div>
  );
};

export default ConfirmDeleteAccountPage;

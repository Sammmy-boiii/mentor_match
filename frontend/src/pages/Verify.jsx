import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const { sessionId, status: urlStatus } = useParams(); // Get from URL path
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(AppContext);
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState(null);

  // Get 'data' parameter from eSewa callback (eSewa appends ?data=... to success URL)
  const data = searchParams.get("data");

  const verifyPayment = async () => {
    try {
      // Debug: Log all params
      console.log("Verify page params:", {
        sessionId,
        urlStatus,
        data,
        allSearchParams: Object.fromEntries(searchParams.entries())
      });

      // Check if this is a failure callback
      if (urlStatus === "failure") {
        setStatus("failed");
        toast.error("Payment was cancelled or failed");
        return;
      }

      // For success callback, eSewa sends 'data' parameter with base64 encoded response
      if (urlStatus === "success" && data) {
        // Decode and log the data for debugging
        try {
          const decodedData = JSON.parse(atob(data));
          console.log("Decoded eSewa data:", decodedData);
        } catch (e) {
          console.log("Could not decode data:", e);
        }

        const response = await axios.post(backendUrl + "/api/user/verify-esewa", {
          sessionId,
          data
        });

        if (response.data.success) {
          setStatus("success");
          toast.success("Payment successful!");
        } else {
          setStatus("failed");
          toast.error(response.data.message || "Payment verification failed");
        }
      } else {
        // No data parameter on success - something went wrong
        setStatus("failed");
        toast.error("Payment verification failed - no response data");
      }
    } catch (error) {
      console.log("Verification error:", error);
      setStatus("failed");
      toast.error("Payment verification failed");
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    verifyPayment();
  }, []);

  useEffect(() => {
    if (!verifying && status) {
      const timer = setTimeout(() => {
        navigate("/my-sessions");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [verifying, status, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4">
        {verifying ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">
              Verifying Payment...
            </h2>
            <p className="text-gray-500 mt-2">Please wait while we confirm your payment</p>
          </>
        ) : status === "success" ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-600">
              Payment Successful!
            </h2>
            <p className="text-gray-500 mt-2">
              Your session has been confirmed. Redirecting to your sessions...
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600">
              Payment Failed
            </h2>
            <p className="text-gray-500 mt-2">
              Something went wrong. Redirecting to your sessions...
            </p>
          </>
        )}

        <button
          onClick={() => navigate("/my-sessions")}
          className="mt-6 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Go to My Sessions
        </button>
      </div>
    </div>
  );
};

export default Verify;

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

  // Khalti callback params
  const pidx = searchParams.get("pidx");
  const khaltiStatus = searchParams.get("status");

  const verifyPayment = async () => {
    try {
      console.log("Verify page params:", {
        sessionId,
        pidx,
        khaltiStatus
      });

      if (!pidx) {
        setStatus("failed");
        toast.error("No pidx found in payment callback");
        return;
      }

      if (khaltiStatus === "User canceled") {
        setStatus("failed");
        toast.error("Payment was cancelled by user");
        return;
      }

      // Always call lookup API to verify on backend
      const response = await axios.post(backendUrl + "/api/user/verify-khalti", {
        sessionId,
        pidx
      });

      if (response.data.success) {
        setStatus("success");
        toast.success("Payment verified successfully!");
      } else {
        setStatus("failed");
        toast.error(response.data.message || "Payment verification failed");
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

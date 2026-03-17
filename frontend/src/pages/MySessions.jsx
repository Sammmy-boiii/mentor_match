import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaVideo } from "react-icons/fa";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const MySessions = () => {
  const { currency, token, backendUrl, slotDateFormat } = useContext(AppContext);
  const [sessions, setSessions] = useState([]);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // eSewa hidden form refs
  const esewaFormRef = useRef(null);
  const [esewaPayload, setEsewaPayload] = useState(null);
  const [esewaGatewayUrl, setEsewaGatewayUrl] = useState("");

  const getUserSessions = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/sessions", {
        headers: { token },
      });
      if (data.success) {
        setSessions(data.sessions.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelSession = async (sessionId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-session",
        { sessionId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success("Session cancelled");
        getUserSessions();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const payWithEsewa = async (sessionId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-esewa",
        { sessionId },
        { headers: { token } }
      );
      if (data.success) {
        setEsewaGatewayUrl(data.gatewayUrl);
        setEsewaPayload(data.esewaData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Handle eSewa redirect back — URL will have ?data=base64string
  const handleEsewaReturn = async () => {
    const params = new URLSearchParams(location.search);
    const esewaData = params.get("data");
    if (!esewaData || !token) return;

    setVerifying(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/verify-esewa",
        { data: esewaData },
        { headers: { token } }
      );
      if (data.success) {
        toast.success("Payment successful! ✅");
        // Clean URL
        navigate("/my-sessions", { replace: true });
        getUserSessions();
      } else {
        toast.error(data.message || "Payment verification failed");
      }
    } catch (error) {
      toast.error("Payment verification error");
      console.log(error);
    } finally {
      setVerifying(false);
    }
  };

  // Auto-submit eSewa form once data is ready
  useEffect(() => {
    if (esewaPayload && esewaFormRef.current) {
      esewaFormRef.current.submit();
    }
  }, [esewaPayload]);

  // On mount: check if returning from eSewa
  useEffect(() => {
    if (token) {
      handleEsewaReturn();
      getUserSessions();
    }
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Sessions</h2>

      {verifying && (
        <div className="text-center py-6 text-blue-600 font-medium animate-pulse">
          Verifying your payment, please wait...
        </div>
      )}

      {sessions.length === 0 && !verifying ? (
        <div className="text-center py-12 text-gray-500">
          No sessions booked yet
        </div>
      ) : (
        <>
          {sessions.map((session, i) => (
            <div
              key={i}
              className="bg-white shadow-md px-6 py-4 mb-4 rounded-lg flex flex-col sm:flex-row gap-6 hover:shadow-lg transition items-center sm:items-start"
            >
              {/* Session Image */}
              <div className="relative h-28 w-28 overflow-hidden rounded-lg flex-shrink-0">
                <img
                  src={session.tutData.image}
                  alt="TutImg"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>

              {/* Details */}
              <div className="flex-1 text-gray-900">
                <h5 className="capitalize line-clamp-1 font-semibold text-gray-900 text-lg">
                  {session.tutData.name}
                </h5>
                <p className="text-sm text-gray-600">{session.tutData.qualification}</p>

                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex items-center gap-x-2">
                    <span className="font-semibold text-gray-700">Subject:</span>
                    <span className="text-gray-600">{session.tutData.subject}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-x-2">
                    <span className="font-semibold text-gray-700">Address:</span>
                    <span className="text-gray-600">
                      {session.tutData.location?.city}, {session.tutData.location?.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <span className="font-semibold text-gray-700">Fee:</span>
                    <span className="text-gray-600">{currency} {session.amount}</span>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <span className="font-semibold text-gray-700">Date:</span>
                    <span className="text-gray-600">
                      {slotDateFormat(session.slotDate)} | {session.slotTime}
                    </span>
                  </div>
                </div>

                {/* Action buttons / status */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {session.cancelled ? (
                    // Cancelled
                    <span className="px-3 py-1 text-sm text-red-600 bg-red-100 rounded-full">
                      Cancelled
                    </span>
                  ) : session.isCompleted && session.payment ? (
                    // Session done & paid
                    <span className="px-3 py-1 text-sm text-green-600 bg-green-100 rounded-full">
                      ✅ Paid &amp; Completed
                    </span>
                  ) : session.isCompleted && !session.payment ? (
                    // Session done but not paid yet — show eSewa
                    <>
                      <span className="px-3 py-1 text-sm text-blue-600 bg-blue-100 rounded-full">
                        Session Ended
                      </span>
                      <button
                        onClick={() => payWithEsewa(session._id)}
                        className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <img
                          src="https://esewa.com.np/common/images/esewa_logo.png"
                          alt="eSewa"
                          className="h-4 object-contain"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                        Pay with eSewa
                      </button>
                    </>
                  ) : (
                    // Session upcoming / in progress — Join + Cancel only
                    <>
                      {session.payment && (
                        <span className="px-3 py-1 text-sm text-green-600 bg-green-100 rounded-full">
                          ✅ Paid
                        </span>
                      )}
                      <button
                        onClick={() => navigate(`/video-room/${session._id}`)}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <FaVideo />
                        Join Session
                      </button>
                      <button
                        onClick={() => cancelSession(session._id)}
                        className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Hidden eSewa POST form — auto-submitted when esewaPayload is set */}
      {esewaPayload && (
        <form
          ref={esewaFormRef}
          action={esewaGatewayUrl}
          method="POST"
          style={{ display: "none" }}
        >
          {Object.entries(esewaPayload).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        </form>
      )}
    </div>
  );
};

export default MySessions;

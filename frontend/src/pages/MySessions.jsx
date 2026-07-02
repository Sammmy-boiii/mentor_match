import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaVideo } from "react-icons/fa";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const MySessions = () => {
  const { currency, token, backendUrl, slotDateFormat } = useContext(AppContext);
  const [sessions, setSessions] = useState([]);
  const [verifying, setVerifying] = useState(false);
  const [reviewSession, setReviewSession] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


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

  const openReviewModal = (session) => {
    setReviewSession(session);
    setReviewRating(5);
    setReviewComment("");
  };

  const closeReviewModal = () => {
    setReviewSession(null);
    setReviewRating(5);
    setReviewComment("");
  };

  const submitReview = async () => {
    if (!reviewSession) return;

    setSubmittingReview(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/review",
        {
          sessionId: reviewSession._id,
          tutorId: reviewSession.tutId,
          rating: reviewRating,
          comment: reviewComment
        },
        { headers: { token } }
      );

      if (data.success) {
        toast.success("Review submitted successfully.");
        closeReviewModal();
        getUserSessions();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Unable to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const submitEsewaForm = (payload) => {
    const paymentUrl = payload?.payment_url || payload?.gatewayUrl;
    if (!paymentUrl) {
      console.log("submitEsewaForm payload missing payment URL", payload);
      toast.error("Unable to start eSewa payment right now.");
      return;
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = paymentUrl;
    form.target = "_self";
    form.style.display = "none";

    Object.entries(payload).forEach(([key, value]) => {
      if (key === "payment_url" || key === "gatewayUrl") return;
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value ?? "");
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const payWithKhalti = async (sessionId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-khalti",
        { sessionId },
        { headers: { token } }
      );
      if (data.success && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        toast.error(data.message || "Unable to start Khalti payment right now.");
      }
    } catch (error) {
      console.log("Khalti payWithKhalti error", error);
      toast.error(error.message || "Unable to start Khalti payment right now.");
    }
  };

  const payWithEsewa = async (sessionId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-esewa",
        { sessionId },
        { headers: { token } }
      );

      console.log("eSewa payment init response", data);
      const rawPayload = data?.esewaData || data?.data?.esewaData || data?.data || data;
      const paymentPayload = {
        ...rawPayload,
        payment_url: rawPayload?.payment_url || data?.gatewayUrl || rawPayload?.gatewayUrl || data?.payment_url || data?.data?.gatewayUrl || data?.data?.payment_url,
      };

      if (data.success) {
        console.log("eSewa payment payload", paymentPayload);
        submitEsewaForm(paymentPayload);
      } else {
        toast.error(data.message || "Unable to start eSewa payment right now.");
      }
    } catch (error) {
      console.log("eSewa payWithEsewa error", error);
      toast.error(error.message || "Unable to start eSewa payment right now.");
    }
  };



  // Handle eSewa redirect back — URL will have ?data=base64string
  const handleEsewaReturn = async () => {
    const params = new URLSearchParams(location.search);
    const esewaData = params.get("data");
    if (!esewaData || !token) return;

    setVerifying(true);
    try {
      let sessionId = null;
      try {
        const decoded = JSON.parse(atob(esewaData));
        if (decoded.transaction_uuid) {
          sessionId = decoded.transaction_uuid.split("-")[0];
        }
      } catch (err) {
        console.warn("Unable to decode eSewa response for session ID extraction", err);
      }

      const payload = sessionId ? { sessionId, data: esewaData } : { data: esewaData };

      const { data } = await axios.post(
        backendUrl + "/api/user/verify-esewa",
        payload,
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

  // On mount: check if returning from eSewa
  useEffect(() => {
    if (token) {
      handleEsewaReturn();
      getUserSessions();
    }
  }, [token]);

  useEffect(() => {
    if (!token || sessions.length === 0) return;

    const reviewSessionId = location.state?.reviewSessionId || new URLSearchParams(location.search).get("review");
    if (!reviewSessionId) return;

    const matchedSession = sessions.find((session) => String(session._id) === String(reviewSessionId));
    if (matchedSession && !matchedSession.reviewed) {
      openReviewModal(matchedSession);
    }
  }, [token, sessions, location.state, location.search]);

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
                      <button
                        onClick={() => payWithKhalti(session._id)}
                        className="px-4 py-2 text-sm bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <img
                          src="https://blog.khalti.com/wp-content/uploads/2025/07/Khalti-Logo-New-3.png"
                          alt="Khalti"
                          className="h-4 object-contain"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                        Pay with Khalti
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

      {reviewSession && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Rate this tutor</h3>
                <p className="text-sm text-gray-500">{reviewSession.tutData.name} — {reviewSession.slotTime} on {slotDateFormat(reviewSession.slotDate)}</p>
              </div>
              <button onClick={closeReviewModal} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>

            <div className="space-y-5">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700 mb-3">How was your session?</p>
                <div className="flex items-center justify-center gap-2">
                  {[1,2,3,4,5].map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setReviewRating(value)}
                      className="text-3xl transition-transform hover:scale-110"
                      aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                    >
                      <span className={value <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="px-4 py-2 rounded-2xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={submitReview}
                  disabled={submittingReview}
                  className="px-5 py-2 rounded-2xl bg-teal-600 text-white text-sm hover:bg-teal-700 disabled:opacity-60"
                >
                  {submittingReview ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySessions;

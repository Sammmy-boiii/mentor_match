import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { FaVideo } from "react-icons/fa";

const MySessions = () => {
  const { currency, token, backendUrl, getTutorsData } = useContext(AppContext);
  const [sessions, setSessions] = useState([]);
  const esewaFormRef = useRef(null);
  const [esewaData, setEsewaData] = useState(null);
  const navigate = useNavigate();

  const getUserSessions = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/sessions", { headers: { token } })
      if (data.success) {
        setSessions(data.sessions.reverse())
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  };

  const cancelSession = async (sessionId) => {
    try {
      const { data } = await axios.post(backendUrl + "/api/user/cancel-session", { sessionId }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        getUserSessions()
        getTutorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // eSewa Payment Handler
  const payWithEsewa = async (sessionId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-esewa",
        { sessionId },
        { headers: { token } }
      )

      if (data.success) {
        setEsewaData(data.esewaData)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Submit eSewa form when data is ready
  useEffect(() => {
    if (esewaData && esewaFormRef.current) {
      esewaFormRef.current.submit()
    }
  }, [esewaData])

  useEffect(() => {
    if (token) {
      getUserSessions()
    }
  }, [token])

  return (
    <div className="max-padd-container py-28">
      {/* Hidden eSewa Form */}
      {esewaData && (
        <form
          ref={esewaFormRef}
          action={esewaData.payment_url}
          method="POST"
          style={{ display: "none" }}
        >
          <input type="hidden" name="amount" value={esewaData.amount} />
          <input type="hidden" name="tax_amount" value={esewaData.tax_amount} />
          <input type="hidden" name="total_amount" value={esewaData.total_amount} />
          <input type="hidden" name="transaction_uuid" value={esewaData.transaction_uuid} />
          <input type="hidden" name="product_code" value={esewaData.product_code} />
          <input type="hidden" name="product_service_charge" value={esewaData.product_service_charge} />
          <input type="hidden" name="product_delivery_charge" value={esewaData.product_delivery_charge} />
          <input type="hidden" name="success_url" value={esewaData.success_url} />
          <input type="hidden" name="failure_url" value={esewaData.failure_url} />
          <input type="hidden" name="signed_field_names" value={esewaData.signed_field_names} />
          <input type="hidden" name="signature" value={esewaData.signature} />
        </form>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No sessions booked yet
        </div>
      ) : (
        sessions.map((session, i) => (
          <div
            key={i}
            className="bg-white shadow-md px-6 py-4 mb-4 rounded-lg flex gap-6 hover:shadow-lg transition items-center"
          >
            {/* session Image */}
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
              <h5 className="h5 capitalize line-clamp-1 font-semibold text-gray-900">
                {session.tutData.name}
              </h5>
              <p className="text-sm text-gray-900">{session.tutData.qualification}</p>

              <div className="mt-2 space-y-2 text-sm">
                <div className="flex items-center gap-x-2">
                  <h4 className="font-semibold text-gray-900">Subject:</h4>
                  <p className="text-gray-900">{session.tutData.subject}</p>
                </div>

                <div className="hidden sm:flex items-center gap-x-2">
                  <h4 className="font-semibold text-gray-900">Address:</h4>
                  <p className="text-gray-900">
                    {session.tutData.location?.city || "N/A"},{" "}
                    {session.tutData.location?.country || "N/A"}
                  </p>
                </div>

                <div className="flex items-center gap-x-2">
                  <h4 className="font-semibold text-gray-900">Fee:</h4>
                  <p className="text-gray-900">
                    {currency}
                    {session.tutData.fees}
                  </p>
                </div>

                <div className="flex items-center gap-x-2">
                  <h4 className="font-semibold text-gray-900">Date & Time:</h4>
                  <p className="text-gray-900">{session.slotDate} | {session.slotTime}</p>
                </div>
              </div>
            </div>

            {/* Button - right center */}
            <div className="flex flex-col items-center gap-2">
              {session.cancelled ? (
                <span className="px-3 py-1 text-sm text-red-600 bg-red-100 rounded-full">
                  Cancelled
                </span>
              ) : session.isCompleted ? (
                <span className="px-3 py-1 text-sm text-green-600 bg-green-100 rounded-full">
                  Completed
                </span>
              ) : session.payment ? (
                <>
                  <span className="px-3 py-1 text-sm text-green-600 bg-green-100 rounded-full">
                    Paid
                  </span>
                  <button
                    onClick={() => navigate(`/video-room/${session._id}`)}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FaVideo />
                    Join Session
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => payWithEsewa(session._id)}
                    className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <img
                      src="https://esewa.com.np/common/images/esewa-icon-large.png"
                      alt="eSewa"
                      className="w-5 h-5"
                    />
                    Pay with eSewa
                  </button>
                  <button
                    onClick={() => cancelSession(session._id)}
                    className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MySessions;

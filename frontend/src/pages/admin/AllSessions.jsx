import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";

const AllSessions = () => {
  const { aToken, sessions, getAllSessions, cancelSession } = useContext(AdminContext);
  const { currency, slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getAllSessions();
    }
  }, [aToken]);

  return (
    <div className="m-5 w-full max-w-6xl">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">All Sessions</h2>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_2fr_1fr_2fr_1fr_1fr] gap-4 py-4 px-6 bg-gray-50 border-b border-gray-100 font-medium text-gray-600 text-sm">
          <p>#</p>
          <p>Student</p>
          <p>Tutor</p>
          <p>Payment</p>
          <p>Date & Time</p>
          <p>Status</p>
          <p>Actions</p>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {sessions && sessions.length > 0 ? (
            sessions.map((item, index) => (
              <div
                key={index}
                className="flex flex-wrap sm:grid sm:grid-cols-[0.5fr_2fr_2fr_1fr_2fr_1fr_1fr] gap-4 items-center py-4 px-6 hover:bg-gray-50 transition-colors"
              >
                {/* Index */}
                <p className="hidden sm:block text-gray-500">{index + 1}</p>

                {/* Student Info */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <img
                    src={item.userData?.image || "https://via.placeholder.com/40"}
                    alt={item.userData?.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <span className="font-medium text-gray-800">
                    {item.userData?.name}
                  </span>
                </div>

                {/* Tutor Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={item.tutData?.image || "https://via.placeholder.com/40"}
                    alt={item.tutData?.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <span className="text-gray-700">{item.tutData?.name}</span>
                </div>

                {/* Payment Status */}
                <div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${item.payment
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                      }`}
                  >
                    {item.payment ? "Paid" : "Pending"}
                  </span>
                </div>

                {/* Date & Time */}
                <p className="text-gray-600 text-sm">
                  {slotDateFormat(item.slotDate)} | {item.slotTime}
                </p>

                {/* Status */}
                <div>
                  {item.cancelled ? (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                      Cancelled
                    </span>
                  ) : item.isCompleted ? (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                      Completed
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                      Upcoming
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!item.cancelled && !item.isCompleted && (
                    <button
                      onClick={() => cancelSession(item._id)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                      title="Cancel Session"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-500">
              No sessions found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllSessions;

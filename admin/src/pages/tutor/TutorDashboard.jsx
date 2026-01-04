import React, { useContext, useEffect } from "react";
import { TutorContext } from "../../context/TutorContext";
import { AppContext } from "../../context/AppContext";
import earnings from "../../assets/earnings.png";
import session from "../../assets/session.png";
import client from "../../assets/client.png";

const TutorDashboard = () => {
  const { tToken, dashData, getDashData, completeSession, cancelSession } =
    useContext(TutorContext);
  const { currency, slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (tToken) {
      getDashData();
    }
  }, [tToken]);

  return (
    dashData && (
      <div className="m-5 w-full sm:ml-72">
        {/* Stats Cards */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Earnings Card */}
          <div className="flex items-center gap-4 bg-white p-5 min-w-[220px] rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all cursor-pointer">
            <img src={earnings} alt="Earnings" className="w-16 h-16" />
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {currency}
                {dashData.earnings}
              </p>
              <p className="text-gray-500 text-sm">Earnings</p>
            </div>
          </div>

          {/* Sessions Card */}
          <div className="flex items-center gap-4 bg-white p-5 min-w-[220px] rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all cursor-pointer">
            <img src={session} alt="Sessions" className="w-16 h-16" />
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {dashData.sessions}
              </p>
              <p className="text-gray-500 text-sm">Sessions</p>
            </div>
          </div>

          {/* Students Card */}
          <div className="flex items-center gap-4 bg-white p-5 min-w-[220px] rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all cursor-pointer">
            <img src={client} alt="Students" className="w-16 h-16" />
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {dashData.students}
              </p>
              <p className="text-gray-500 text-sm">Students</p>
            </div>
          </div>
        </div>

        {/* Latest Bookings Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <img src={session} alt="Latest Sessions" className="w-6 h-6" />
            <p className="font-semibold text-gray-700">Latest Bookings</p>
          </div>

          <div className="divide-y divide-gray-100">
            {dashData.latestSessions && dashData.latestSessions.length > 0 ? (
              dashData.latestSessions.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Student Image */}
                  <img
                    src={item.userData?.image || "https://via.placeholder.com/50"}
                    alt={item.userData?.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />

                  {/* Student Info */}
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {item.userData?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {slotDateFormat(item.slotDate)} | {item.slotTime}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {item.cancelled ? (
                    <span className="px-3 py-1 text-sm text-red-600 bg-red-100 rounded-full">
                      Cancelled
                    </span>
                  ) : item.isCompleted ? (
                    <span className="px-3 py-1 text-sm text-green-600 bg-green-100 rounded-full">
                      Completed
                    </span>
                  ) : (
                    <div className="flex gap-2">
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
                      <button
                        onClick={() => completeSession(item._id)}
                        className="p-2 text-green-500 hover:bg-green-100 rounded-full transition-colors"
                        title="Complete Session"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No bookings yet
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default TutorDashboard;

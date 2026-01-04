import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import tutor from "../../assets/tutor.png";
import session from "../../assets/session.png";
import latest from "../../assets/latest.png";

const Dashboard = () => {
  const { aToken, getDashData, dashData, cancelSession, approveApplication, rejectApplication } = useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);
  
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [fees, setFees] = useState("500");

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  const handleApprove = (app) => {
    setSelectedApp(app);
    setShowModal(true);
  };

  const handleConfirmApprove = async () => {
    if (!password || password.length < 8) {
      alert("Please enter a password with at least 8 characters");
      return;
    }
    await approveApplication(selectedApp._id, password, fees, JSON.stringify({ line1: "", line2: "" }));
    setShowModal(false);
    setSelectedApp(null);
    setPassword("");
    setFees("500");
  };

  const handleReject = async (applicationId) => {
    if (window.confirm("Are you sure you want to reject this application?")) {
      await rejectApplication(applicationId);
    }
  };

  return (
    dashData && (
      <div className="m-5 w-full sm:ml-72">
        {/* Stats Cards */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Tutors Card */}
          <div className="flex items-center gap-4 bg-white p-5 min-w-[220px] rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all cursor-pointer">
            <img src={tutor} alt="Tutors" className="w-16 h-16" />
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {dashData.tutors}
              </p>
              <p className="text-gray-500 text-sm">Tutors</p>
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

          {/* Pending Applications Card */}
          <div className="flex items-center gap-4 bg-orange-50 p-5 min-w-[220px] rounded-xl shadow-md border border-orange-200 hover:shadow-lg transition-all cursor-pointer">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {dashData.pendingApplications || 0}
              </p>
              <p className="text-gray-500 text-sm">Pending Applications</p>
            </div>
          </div>
        </div>

        {/* Pending Tutor Applications Section */}
        {dashData.latestApplications && dashData.latestApplications.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-8">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-orange-50 rounded-t-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-semibold text-gray-700">Pending Tutor Applications</p>
            </div>

            <div className="divide-y divide-gray-100">
              {dashData.latestApplications.map((app, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Applicant Photo */}
                    <img
                      src={app.image || "https://via.placeholder.com/80"}
                      alt={app.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />

                    {/* Application Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">{app.name}</h4>
                          <p className="text-sm text-gray-500">{app.email}</p>
                        </div>
                        <span className="px-3 py-1 text-xs font-medium text-orange-600 bg-orange-100 rounded-full">
                          Pending
                        </span>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <p><span className="text-gray-500">Subject:</span> <span className="font-medium">{app.subject}</span></p>
                        <p><span className="text-gray-500">Experience:</span> <span className="font-medium">{app.experience}</span></p>
                        <p><span className="text-gray-500">Education:</span> <span className="font-medium">{app.educationStatus}</span></p>
                        <p><span className="text-gray-500">Age:</span> <span className="font-medium">{app.age}</span></p>
                      </div>

                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{app.about}</p>

                      {/* Document Preview */}
                      <div className="mt-3">
                        <a 
                          href={app.document} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Certificate/Document
                        </a>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleApprove(app)}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(app._id)}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Latest Sessions Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <img src={latest} alt="Latest Sessions" className="w-6 h-6" />
            <p className="font-semibold text-gray-700">Latest Bookings</p>
          </div>

          <div className="divide-y divide-gray-100">
            {dashData.latestSessions && dashData.latestSessions.length > 0 ? (
              dashData.latestSessions.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Tutor Image */}
                  <img
                    src={item.tutData?.image || "https://via.placeholder.com/50"}
                    alt={item.tutData?.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />

                  {/* Session Info */}
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {item.tutData?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {slotDateFormat(item.slotDate)} | {item.slotTime}
                    </p>
                  </div>

                  {/* Student Info */}
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{item.userData?.name}</p>
                  </div>

                  {/* Status/Action */}
                  {item.cancelled ? (
                    <span className="px-3 py-1 text-sm text-red-600 bg-red-100 rounded-full">
                      Cancelled
                    </span>
                  ) : item.isCompleted ? (
                    <span className="px-3 py-1 text-sm text-green-600 bg-green-100 rounded-full">
                      Completed
                    </span>
                  ) : (
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
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No bookings yet
              </div>
            )}
          </div>
        </div>

        {/* Approval Modal */}
        {showModal && selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Approve Tutor Application</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Approving: <span className="font-semibold">{selectedApp.name}</span>
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Set Password for Tutor Login *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Fee (NPR)
                </label>
                <input
                  type="number"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  placeholder="500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmApprove}
                  className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Confirm Approve
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedApp(null);
                    setPassword("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default Dashboard;

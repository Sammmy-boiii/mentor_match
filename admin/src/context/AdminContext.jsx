import React, { createContext, useState, useContext } from 'react'
import axios from "axios"
import { toast } from "react-toastify"
import { AppContext } from "./AppContext" 

export const AdminContext = createContext();

const AdminContextProvider = (props) => {

  const [aToken, setAToken] = useState(
    localStorage.getItem('aToken') ? localStorage.getItem('aToken') : ""
  );

  const { backendUrl } = useContext(AppContext);

  const [tutors, setTutors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [dashData, setDashData] = useState(null);
  const [applications, setApplications] = useState([]);

  const getAllTutors = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/all-tutors",
        {},
        { headers: { aToken } }
      );
      if (data.success) {
        setTutors(data.tutors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const changeAvailability = async (tutId) => {
    try {
      const { data } = await axios.post(backendUrl + "/api/admin/change-availability", { tutId }, { headers: { aToken } })
      if (data.success) {
        toast.success(data.message)
        getAllTutors()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const getAllSessions = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/admin/all-sessions",
        { headers: { aToken } }
      );
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
        backendUrl + "/api/admin/cancel-session",
        { sessionId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllSessions();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/admin/dashboard",
        { headers: { aToken } }
      );
      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Get all tutor applications
  const getTutorApplications = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/admin/tutor-applications",
        { headers: { aToken } }
      );
      if (data.success) {
        setApplications(data.applications);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Approve tutor application
  const approveApplication = async (applicationId, password, fees, address) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/approve-application",
        { applicationId, password, fees, address },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getTutorApplications();
        getDashData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Reject tutor application
  const rejectApplication = async (applicationId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/reject-application",
        { applicationId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getTutorApplications();
        getDashData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const value = {
    aToken,
    setAToken,
    getAllTutors,
    tutors,
    changeAvailability,
    sessions,
    getAllSessions,
    cancelSession,
    dashData,
    getDashData,
    applications,
    getTutorApplications,
    approveApplication,
    rejectApplication
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;

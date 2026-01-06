import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"
import { toast } from "react-toastify"

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : "");
  const currency = "NPR";
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [tutors, setTutors] = useState([])
  const [userData, setUserData] = useState(false)

  const getTutorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/tutor/list")
      if (data.success) {
        // console.log(data.tutors)
        setTutors(data.tutors)
      }
      else {
        toast.error(data.message)

      }
    }
    catch (error) {
      console.log(error)
      toast.error(error.message)

    }
  }

  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", { headers: { token } })
      if (data.success) {
        console.log(data)
        setUserData(data.userData)
      }
      else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    getTutorsData()
  }, [])

  useEffect(() => {
    if (token) {
      loadUserProfileData()
    } else {
      setUserData(false)
    }
  }, [token])

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotDate) => {
    if (!slotDate) return "";
    // Handle both underscore-separated format and ISO format
    if (typeof slotDate === 'string' && slotDate.includes('_')) {
      // Format: "31_4_2026"
      const dateArray = slotDate.split('_');
      return dateArray[0] + " " + months[Number(dateArray[1]) - 1] + " " + dateArray[2];
    } else {
      // ISO format or Date object
      const date = new Date(slotDate);
      return date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
    }
  };

  const value = {
    tutors,
    navigate,
    currency,
    token,
    setToken,
    backendUrl,
    loadUserProfileData,
    userData,
    setUserData,
    getTutorsData,
    calculateAge,
    slotDateFormat
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;

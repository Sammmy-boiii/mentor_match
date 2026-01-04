import React, { createContext, useState, useContext } from 'react'
import axios from "axios"
import { toast } from "react-toastify"
import { AppContext } from "./AppContext"

export const TutorContext = createContext();

const TutorContextProvider = (props) => {
  const [tToken, setTToken] = useState(localStorage.getItem('tToken') ? localStorage.getItem('tToken') : "")
  const [dashData, setDashData] = useState(null)
  const [sessions, setSessions] = useState([])
  const [profileData, setProfileData] = useState(null)

  const { backendUrl } = useContext(AppContext)

  // Get tutor dashboard data
  const getDashData = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/tutor/dashboard",
        { headers: { tToken } }
      )
      if (data.success) {
        setDashData(data.dashData)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Get all sessions for the tutor
  const getSessions = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/tutor/sessions",
        { headers: { tToken } }
      )
      if (data.success) {
        setSessions(data.sessions.reverse())
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Get tutor profile data
  const getProfileData = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/tutor/profile",
        { headers: { tToken } }
      )
      if (data.success) {
        setProfileData(data.profileData)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Update tutor profile
  const updateProfile = async (updateData) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/tutor/update-profile",
        updateData,
        { headers: { tToken } }
      )
      if (data.success) {
        toast.success(data.message)
        getProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Mark session as complete
  const completeSession = async (sessionId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/tutor/complete-session",
        { sessionId },
        { headers: { tToken } }
      )
      if (data.success) {
        toast.success(data.message)
        getDashData()
        getSessions()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Cancel session
  const cancelSession = async (sessionId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/tutor/cancel-session",
        { sessionId },
        { headers: { tToken } }
      )
      if (data.success) {
        toast.success(data.message)
        getDashData()
        getSessions()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const value = {
    tToken,
    setTToken,
    dashData,
    getDashData,
    sessions,
    getSessions,
    profileData,
    getProfileData,
    updateProfile,
    completeSession,
    cancelSession
  }

  return (
    <TutorContext.Provider value={value}>
      {props.children}
    </TutorContext.Provider>
  )
}

export default TutorContextProvider
import React, { useContext, useEffect } from "react"
import { ToastContainer } from "react-toastify"
import Sidebar from "./components/Sidebar"
import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import Dashboard from "./pages/admin/Dashboard"
import AllSessions from "./pages/admin/AllSessions"
import AddTutor from "./pages/admin/AddTutor"
import TutorsList from "./pages/admin/TutorsList"
import { AdminContext } from "./context/AdminContext"
import Login from "./pages/admin/Login"
import { TutorContext } from "./context/TutorContext"
import TutorDashboard from "./pages/tutor/TutorDashboard"
import TutorSessions from "./pages/tutor/TutorSessions"
import TutorProfile from "./pages/tutor/TutorProfile"
import TutorVideoRoom from "./pages/tutor/TutorVideoRoom"


export default function App() {
  const { aToken, setAToken } = useContext(AdminContext)
  const { tToken, setTToken } = useContext(TutorContext)
  const location = useLocation()
  const navigate = useNavigate()
  const isVideoRoom = location.pathname.startsWith('/tutor-video-room')

  // Read token from URL params (passed from frontend login) and store in localStorage
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const urlAToken = searchParams.get('aToken')
    const urlTToken = searchParams.get('tToken')

    if (urlAToken) {
      localStorage.setItem('aToken', urlAToken)
      setAToken(urlAToken)
      // Remove token from URL for security, keep the pathname
      navigate(location.pathname, { replace: true })
    }

    if (urlTToken) {
      localStorage.setItem('tToken', urlTToken)
      setTToken(urlTToken)
      // Remove token from URL for security, keep the pathname
      navigate(location.pathname, { replace: true })
    }
  }, [location.search, location.pathname, setAToken, setTToken, navigate])

  return aToken || tToken ? (
    <main>
      <ToastContainer position="bottom-right" />
      <div className={isVideoRoom ? "" : "bg-light text-tertiary"}>
        <div className={isVideoRoom ? "" : "mx-auto max-w-[1440px] flex flex-col sm:flex-row"}>
          {!isVideoRoom && <Sidebar />}
          <Routes>
            {/* ADMIN ROUTES */}
            <Route path="/" element={<></>} />
            <Route path="/admin-dashboard" element={<Dashboard />} />
            <Route path="/all-sessions" element={<AllSessions />} />
            <Route path="/add-tutor" element={<AddTutor />} />
            <Route path="/tutors-list" element={<TutorsList />} />

            {/* TUTOR ROUTES */}
            <Route path="/tutor-dashboard" element={<TutorDashboard />} />
            <Route path="/tutor-sessions" element={<TutorSessions />} />
            <Route path="/tutor-profile" element={<TutorProfile />} />
            <Route path="/tutor-video-room/:sessionId" element={<TutorVideoRoom />} />
          </Routes>

        </div>
      </div>
    </main>
  ) : (
    <main>
      <ToastContainer position="bottom-right" />
      <Login setAToken={setAToken} />
    </main>
  )
}
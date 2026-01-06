import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Myprofile from "./pages/Myprofile";
import MySessions from "./pages/MySessions";
import Session from "./pages/Session";
import Tutors from "./pages/Tutors";
import Verify from "./pages/Verify";
import Login from "./pages/Login";
import VideoRoom from "./pages/VideoRoom";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import { ToastContainer } from "react-toastify"


// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import AllSessions from "./pages/admin/AllSessions";
import AddTutor from "./pages/admin/AddTutor";
import TutorsList from "./pages/admin/TutorsList";

// Tutor Pages
import TutorDashboard from "./pages/tutor/TutorDashboard";
import TutorSessions from "./pages/tutor/TutorSessions";
import TutorProfile from "./pages/tutor/TutorProfile";
import TutorVideoRoom from "./pages/tutor/TutorVideoRoom";

import Sidebar from "./Components/Sidebar";

export default function App() {
  const location = useLocation();
  const isVideoRoom = location.pathname.startsWith('/video-room') || location.pathname.startsWith('/tutor-video-room');
  const isAdminOrTutorRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/add-tutor') || location.pathname.startsWith('/all-sessions') || location.pathname.startsWith('/tutors-list') || location.pathname.startsWith('/tutor-');

  return (
    <main className="overflow-hidden bg-light text text-tertiary">
      <ToastContainer position="bottom-right" />

      {!isVideoRoom && !isAdminOrTutorRoute && <Header />}

      <div className={isAdminOrTutorRoute && !isVideoRoom ? "mx-auto max-w-[1440px] flex flex-col lg:flex-row relative pt-8" : ""}>
        {isAdminOrTutorRoute && !isVideoRoom && <Sidebar />}

        <div className={isAdminOrTutorRoute && !isVideoRoom ? "flex-1 lg:ml-72" : "w-full"}>
          <Routes>
            {/* User Routes */}
            <Route path='/' element={<Home />} />
            <Route path='/tutors' element={<Tutors />} />
            <Route path='/tutors/:subject' element={<Tutors />} />
            <Route path='/blog' element={<Blog />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/my-profile' element={<Myprofile />} />
            <Route path='/session/:tutId' element={<Session />} />
            <Route path='/my-sessions' element={<MySessions />} />
            <Route path='/verify/:sessionId/:status' element={<Verify />} />
            <Route path='/login' element={<Login />} />
            <Route path='/video-room/:sessionId' element={<VideoRoom />} />

            {/* Admin Routes */}
            <Route path="/admin-dashboard" element={<Dashboard />} />
            <Route path="/all-sessions" element={<AllSessions />} />
            <Route path="/add-tutor" element={<AddTutor />} />
            <Route path="/tutors-list" element={<TutorsList />} />

            {/* Tutor Routes */}
            <Route path="/tutor-dashboard" element={<TutorDashboard />} />
            <Route path="/tutor-sessions" element={<TutorSessions />} />
            <Route path="/tutor-profile" element={<TutorProfile />} />
            <Route path="/tutor-video-room/:sessionId" element={<TutorVideoRoom />} />
          </Routes>
        </div>
      </div>

      {!isVideoRoom && !isAdminOrTutorRoute && <Footer />}
    </main>
  )
}

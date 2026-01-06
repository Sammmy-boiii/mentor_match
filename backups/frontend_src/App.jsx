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
import {ToastContainer} from "react-toastify"


export default function App() {
  const location = useLocation();
  const isVideoRoom = location.pathname.startsWith('/video-room');

  return (
    <main className="overflow-hidden bg-light text text-tertiary">
      <ToastContainer
      position ="bottom-right"/>
      {!isVideoRoom && <Header/>}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/tutors' element={<Tutors/>}/>
        <Route path='/tutors/:subject' element={<Tutors/>}/>
        <Route path='/blog' element={<Blog/>}/>
        <Route path='/contact' element={<Contact/>}/>
        <Route path='/my-profile' element={<Myprofile/>}/>
        <Route path='/session/:tutId' element={<Session/>}/>
        <Route path='/my-sessions' element={<MySessions/>}/>
        <Route path='/verify/:sessionId/:status' element={<Verify/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/video-room/:sessionId' element={<VideoRoom/>}/>


        
      </Routes>
      {!isVideoRoom && <Footer/>}
    </main>
  )



}

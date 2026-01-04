import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";
import { FaSquarePlus, FaUser } from "react-icons/fa6";
import { FaClipboardList, FaListAlt } from "react-icons/fa";
import { MdFactCheck } from "react-icons/md";
import { BiLogOut } from "react-icons/bi";
import MentorLogo from "../assets/MentorLogo.png";
import { AppContext } from "../context/AppContext";
import { TutorContext } from "../context/TutorContext"; 

const Sidebar = () => {
  const { aToken, setAToken } = useContext(AdminContext);
  const { tToken, setTToken } = useContext(TutorContext);

  const { navigate } = useContext(AppContext);

  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

  const logout = () => {
    // Clear tokens
    if (aToken) {
      setAToken("");
      localStorage.removeItem("aToken");
    }
    if (tToken) {
      setTToken("");
      localStorage.removeItem("tToken");
    }
    // Redirect to frontend login page
    window.location.href = `${frontendUrl}/login`;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden sm:flex flex-col bg-[#1e293b] w-64 h-screen fixed rounded-xl m-2 text-white">
        {/* Logo */}
        <div className="p-6 text-center border-b border-gray-700">
          <Link to="/" className="flex flex-col items-center no-underline">
            <img
              src={MentorLogo}
              alt="Mentor Match Logo"
              className="h-12 w-auto object-contain mb-2"
            />
            <span className="font-bold text-lg">Mentor Match</span>
            <span className="text-xs bg-blue-500 px-3 py-1 rounded-full mt-2">
              {aToken ? "Admin" : "For Tutor"}
            </span>
          </Link>
        </div>

        {/* Links */}
        {aToken && (
          <nav className="flex-1 p-4">
            <NavLink
              to="/admin-dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-[#4f47e6] shadow-md"
                    : "hover:bg-[#4f47e6]"
                }`
              }
            >
              <FaListAlt className="text-lg" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/all-sessions"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-[#4f47e6] shadow-md"
                    : "hover:bg-[#4f47e6]"
                }`
              }
            >
              <MdFactCheck className="text-lg" />
              <span>Sessions</span>
            </NavLink>

            <NavLink
              to="/tutors-list"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-[#4f47e6] shadow-md"
                    : "hover:bg-[#4f47e6]"
                }`
              }
            >
              <FaClipboardList className="text-lg" />
              <span>Tutors List</span>
            </NavLink>

            <NavLink
              to="/add-tutor"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-[#4f47e6] shadow-md"
                    : "hover:bg-[#4f47e6]"
                }`
              }
            >
              <FaSquarePlus className="text-lg" />
              <span>Add Tutor</span>
            </NavLink>
          </nav>
        )}

        {/* Tutor Desktop Navigation */}
        {tToken && (
          <nav className="flex-1 p-4">
            <NavLink
              to="/tutor-dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-[#4f47e6] shadow-md"
                    : "hover:bg-[#4f47e6]"
                }`
              }
            >
              <FaListAlt className="text-lg" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/tutor-sessions"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-[#4f47e6] shadow-md"
                    : "hover:bg-[#4f47e6]"
                }`
              }
            >
              <MdFactCheck className="text-lg" />
              <span>Sessions</span>
            </NavLink>

            <NavLink
              to="/tutor-profile"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-[#4f47e6] shadow-md"
                    : "hover:bg-[#4f47e6]"
                }`
              }
            >
              <FaUser className="text-lg" />
              <span>Profile</span>
            </NavLink>
          </nav>
        )}

        {/* Tutor Logout Button */}
        {tToken && (
          <div className="p-4 mt-auto">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-500 transition-all hover:bg-red-500 hover:text-white"
            >
              <BiLogOut className="text-lg" />
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* Admin Logout Button */}
        {aToken && (
          <div className="p-4 mt-auto">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-500 transition-all hover:bg-red-500 hover:text-white"
            >
              <BiLogOut className="text-lg" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Navbar */}
      {tToken && (
        <div className="sm:hidden fixed top-0 left-0 right-0 bg-[#1e293b] text-white flex flex-col items-center z-50">
          {/* Logo */}
          <div className="p-3 border-b border-gray-700 w-full flex justify-center">
            <img
              src={MentorLogo}
              alt="Mentor Match Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Icon Buttons */}
          <div className="flex justify-around w-full py-2">
            <NavLink
              to="/tutor-dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center text-xs ${
                  isActive ? "text-[#4f47e6]" : "hover:text-[#4f47e6]"
                }`
              }
            >
              <FaListAlt className="text-xl" />
            </NavLink>

            <NavLink
              to="/tutor-sessions"
              className={({ isActive }) =>
                `flex flex-col items-center text-xs ${
                  isActive ? "text-[#4f47e6]" : "hover:text-[#4f47e6]"
                }`
              }
            >
              <MdFactCheck className="text-xl" />
            </NavLink>

            <NavLink
              to="/tutor-profile"
              className={({ isActive }) =>
                `flex flex-col items-center text-xs ${
                  isActive ? "text-[#4f47e6]" : "hover:text-[#4f47e6]"
                }`
              }
            >
              <FaUser className="text-xl" />
            </NavLink>

          
            <button
              onClick={logout}
              className="flex flex-col items-center text-xs text-red-500 hover:text-red-400"
            >
              <BiLogOut className="text-xl" />
            </button>
          </div>
        </div>
      )}
      {aToken && (
        <div className="sm:hidden fixed top-0 left-0 right-0 bg-[#1e293b] text-white flex flex-col items-center z-50">
          {/* Logo */}
          <div className="p-3 border-b border-gray-700 w-full flex justify-center">
            <img
              src={MentorLogo}
              alt="Mentor Match Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Icon Buttons */}
          <div className="flex justify-around w-full py-2">
            <NavLink
              to="/admin-dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center text-xs ${
                  isActive ? "text-[#4f47e6]" : "hover:text-[#4f47e6]"
                }`
              }
            >
              <FaListAlt className="text-xl" />
            </NavLink>

            <NavLink
              to="/all-sessions"
              className={({ isActive }) =>
                `flex flex-col items-center text-xs ${
                  isActive ? "text-[#4f47e6]" : "hover:text-[#4f47e6]"
                }`
              }
            >
              <MdFactCheck className="text-xl" />
            </NavLink>

            <NavLink
              to="/tutors-list"
              className={({ isActive }) =>
                `flex flex-col items-center text-xs ${
                  isActive ? "text-[#4f47e6]" : "hover:text-[#4f47e6]"
                }`
              }
            >
              <FaClipboardList className="text-xl" />
            </NavLink>

            <NavLink
              to="/add-tutor"
              className={({ isActive }) =>
                `flex flex-col items-center text-xs ${
                  isActive ? "text-[#4f47e6]" : "hover:text-[#4f47e6]"
                }`
              }
            >
              <FaSquarePlus className="text-xl" />
            </NavLink>

            <button
              onClick={logout}
              className="flex flex-col items-center text-xs text-red-500 hover:text-red-400"
            >
              <BiLogOut className="text-xl" />
            </button>
          </div>
        </div>

      )}
    </>
  );
};

export default Sidebar;

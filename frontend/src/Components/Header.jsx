import React, { useContext, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import { CgMenuLeft } from "react-icons/cg";
import { RiUserLine } from "react-icons/ri";
import { TbArrowNarrowRight } from "react-icons/tb";
import MentorLogos from "../assets/MentorLogos.png";
import { AppContext } from "../context/AppContext";
import userImage from "../assets/user.jpg"; // Placeholder user image
import upload_icon from "../assets/upload_icon.png";

const Header = () => {
  const [menuOpened, setMenuOpened] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { token, setToken, navigate, userData } = useContext(AppContext);
  const dropdownRef = useRef();

  const toggleMenu = () => setMenuOpened((prev) => !prev);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken("");
  };

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-gray-800 text-white shadow-md">
      <div className="max-padd-container flex items-center justify-between py-3">
        {/* Logo (Left) */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={MentorLogos}
            alt="Mentor Match Logo"
            className="h-12 w-auto object-contain"
          />
          <span className="font-bold text-xl tracking-wide text-white">
            Mentor Match
          </span>
        </Link>

        {/* Navbar (Center) */}
        <div className="flex justify-center flex-1">
          <Navbar
            menuOpened={menuOpened}
            toggleMenu={toggleMenu}
            containerStyles={
              menuOpened
                ? "flex flex-col gap-y-8 h-screen w-64 fixed left-0 top-0 bg-gray-900 z-50 px-6 py-6 shadow-2xl"
                : "hidden lg:flex gap-x-8 text-gray-300 hover:text-white transition"
            }
          />
        </div>

        {/* Right side */}
        <div className="flex items-center justify-end gap-x-3 sm:gap-x-8 relative">
          {/* Mobile menu icon */}
          <div className="lg:hidden">
            {!menuOpened && (
              <CgMenuLeft
                onClick={toggleMenu}
                className="text-2xl cursor-pointer hover:text-secondary transition"
              />
            )}
          </div>

          {/* Login / User */}
          {token ? (
            <div className="relative" ref={dropdownRef}>
              <img
                src={userData?.image || upload_icon}
                alt="User"
                className="h-10 w-10 rounded-full cursor-pointer border-2 border-white hover:border-teal-400 transition"
                onClick={() => setDropdownOpen((prev) => !prev)}
              />

              {dropdownOpen && (
                <ul className="absolute right-0 mt-2 w-44 bg-white text-gray-900 shadow-lg rounded-lg ring-1 ring-black/10 py-2 z-50 animate-fadeIn">
                  <li
                    onClick={() => {
                      navigate("/my-profile");
                      setDropdownOpen(false);
                    }}
                    className="flex justify-between items-center px-4 py-2 hover:bg-teal-50 cursor-pointer transition"
                  >
                    <span className="font-medium">My Profile</span>
                    <TbArrowNarrowRight className="text-gray-400" />
                  </li>
                  <li
                    onClick={() => {
                      navigate("/my-sessions");
                      setDropdownOpen(false);
                    }}
                    className="flex justify-between items-center px-4 py-2 hover:bg-teal-50 cursor-pointer transition"
                  >
                    <span className="font-medium">My Sessions</span>
                    <TbArrowNarrowRight className="text-gray-400" />
                  </li>
                  <li
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="flex justify-between items-center px-4 py-2 hover:bg-red-50 cursor-pointer transition"
                  >
                    <span className="font-medium text-red-500">Logout</span>
                    <TbArrowNarrowRight className="text-gray-400" />
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <Link to="/login">
              <button className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition">
                <span>Login</span>
                <RiUserLine className="text-lg" />
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

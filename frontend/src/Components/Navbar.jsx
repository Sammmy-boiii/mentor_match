import React from 'react'
import { FaRegWindowClose } from 'react-icons/fa'
import { Link, NavLink } from 'react-router-dom'
import MentorLogo from "../assets/MentorLogo.png"  

const Navbar = ({ containerStyles, toggleMenu, menuOpened }) => {
  const navItems = [
    { to: "/", label: "Home" },
    { to: "/tutors", label: "Tutors" },
    { to: "/blog", label: "Blog" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className={containerStyles}>
      {/* Close button & Logo (only when mobile menu is open) */}
      {menuOpened && (
        <>
          <FaRegWindowClose
            onClick={toggleMenu}
            className="text-xl self-end cursor-pointer relative left-8 hover:text-secondary transition"
          />
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={MentorLogo}
              alt="Mentor Match Logo"
              className="h-20 w-auto object-contain"
            /></Link>
            <span className="bold-24 tracking-wide">Mentor Match</span>
          {/* </Link> */}
        </>
      )}

      {/* Navigation Links */}
      {navItems.map(({ to, label }) => (
        <div key={label} className="inline-flex">
          <NavLink
            to={to}
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            <h5 className="medium-16">{label}</h5>
          </NavLink>
        </div>
      ))}
    </nav>
  );
};

export default Navbar;

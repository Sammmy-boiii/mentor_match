import React, { useState, useContext, useEffect } from "react";
import tutor1 from "../assets/tutor1.png";
import tutor2 from "../assets/tutor2.png";
import tutor3 from "../assets/tutor3.png";
import { AppContext } from "../context/AppContext";
import { useParams } from "react-router-dom";
import { subjectsData } from "../assets/data";
import { FaStar } from "react-icons/fa";

const Tutors = () => {
  const { subject: subjectParam } = useParams();
  const { navigate, tutors } = useContext(AppContext);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredTutors, setFilteredTutors] = useState([]);

  // Filter tutors based on subject param
  useEffect(() => {
    if (subjectParam) {
      setFilteredTutors(
        tutors.filter(
          (tutor) =>
            tutor.subject.toLowerCase().replace(/\s+/g, "-") ===
            subjectParam.toLowerCase()
        )
      );
    } else {
      setFilteredTutors(tutors); // show all tutors if no subject param
    }
  }, [subjectParam, tutors]);

  return (
    <div className="max-padd container py-28">
      {/* Header */}
      <div className="text-center mb-12">
        <h3 className="text-2xl font-bold text-[#0b4d54]">
          Get Started with Skilled Mentors Around
        </h3>
        <div className="flex justify-center items-center mt-4 -space-x-3">
          <img
            src={tutor1}
            alt="Tutor 1"
            className="rounded-full shadow-sm ring-1 ring-slate-900/5 object-cover w-16 h-16"
          />
          <img
            src={tutor2}
            alt="Tutor 2"
            className="rounded-full shadow-sm ring-1 ring-slate-900/5 object-cover w-16 h-16"
          />
          <img
            src={tutor3}
            alt="Tutor 3"
            className="rounded-full shadow-sm ring-1 ring-slate-900/5 object-cover w-16 h-16"
          />
          <span className="ml-4 text-[#0b4d54] text-2xl font-bold">
            To Learn and Earn
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="text-gray-500 leading-relaxed">
          Our platform brings together passionate learners and experienced
          mentors in one interactive space, allowing you to gain new skills,
          share your expertise, and learn, earn, and grow with every session.
        </p>
      </div>

      {/* Filters button (mobile only) */}
      <button
        onClick={() => setShowFilters((prev) => !prev)}
        className={`btn-secondary !py-1.5 mb-5 !rounded sm:hidden transition-all ${showFilters ? "bg-secondary text-white" : ""
          }`}
      >
        Filters
      </button>

      {/* Subjects tabs */}
      <div
        className={`mb-12 flex gap-3 overflow-x-auto scrollbar-hide rounded max-w-5xl mx-auto px-2 
        ${showFilters ? "flex" : "hidden sm:flex"}`}
      >
        {subjectsData.map((subject, i) => (
          <button
            key={i}
            onClick={() =>
              navigate(
                `/tutors/${subject.name.toLowerCase().replace(/\s+/g, "-")}`
              )
            }
            className={`px-6 py-2 whitespace-nowrap rounded-lg bg-deep text-white font-medium border-2 border-transparent transition ${subject.name.toLowerCase().replace(/\s+/g, "-") ===
                subjectParam?.toLowerCase()
                ? "border-b-2 border-b-secondary !text-secondary"
                : ""
              }`}
          >
            {subject.name}
          </button>
        ))}
      </div>

      {/* Tutors list */}
      <div className="grid md:grid-cols-3 gap-6">
        {filteredTutors?.map((tutor, i) => (
          <div
            key={i}
            className="relative rounded-lg overflow-hidden shadow-md group cursor-pointer"
          >
            <img
              src={tutor.image}
              alt={tutor.name}
              className="w-full h-64 object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-white font-semibold text-lg">
                  {tutor.name}
                </h5>
                <span className="flex items-center text-yellow-400">
                  <FaStar className="mr-1" /> 4.8
                </span>
              </div>
              <p className="text-sm text-gray-200 mb-2">{tutor.subject}</p>
              <p className="text-sm text-gray-200 mb-2">Rs. {tutor.fees} / hr</p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/session/${tutor._id}`)}
                  className="px-3 py-2 bg-[#0b4d54] text-white rounded hover:bg-[#0a3f44] transition text-sm"
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tutors;

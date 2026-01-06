import React, { useContext } from "react";
import tutor1 from "../assets/tutor1.png";
import tutor2 from "../assets/tutor2.png";
import tutor3 from "../assets/tutor3.png";
import { FaStar } from "react-icons/fa";
import { AppContext } from "../context/AppContext";

const FeaturedTutors = () => {
  const { tutors, navigate, currency } = useContext(AppContext);

  return (
    <section className="max-padd-container py-16 xl:py-20">
      <div className="mx-auto max-w-[1140px] px-6 lg:px-12 relative bottom-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h3 className="h3 text-[#0b4d54]">Empowering Mentors and Learners</h3>
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
          <p className="text-gray-500">
            Our platform brings together passionate learners and experienced
            mentors in one interactive space, allowing you to gain new skills,
            share your expertise, and learn, earn, and grow with every session.
          </p>
        </div>

        {/* Tutors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.slice(0, 5).map((tutor, i) => (
            <div key={i} className="relative rounded-lg overflow-hidden shadow-md group cursor-pointer">
              <img
                src={tutor.image}
                alt={tutor.name}
                className="w-full h-64 object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-white font-semibold text-lg">{tutor.name}</h5>
                  <span className="flex items-center text-yellow-400">
                    <FaStar className="mr-1" />4.8
                  </span>
                </div>
                <p className="text-sm text-gray-200 mb-2">{tutor.subject}</p>
                <p className="text-sm text-gray-200 mb-2">{tutor.fees}NPR / hr</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/session/${tutor._id}`)}
                    className="px-3 py-2 bg-[#0b4d54] text-white rounded hover:bg-[#0a3f44] transition text-sm"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => navigate("/tutors")}
                    className="px-3 py-2 bg-white text-[#0b4d54] rounded hover:bg-gray-100 transition text-sm"
                  >
                    Explore Tutors
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTutors;

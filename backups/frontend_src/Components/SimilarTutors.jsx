import React, { useContext, useState, useEffect } from "react";
import { FaStar } from "react-icons/fa6";
import { AppContext } from "../context/AppContext";

const SimilarTutors = ({ tutId, subject }) => {
  const { tutors, navigate } = useContext(AppContext);
  const [simTutors, setSimTutors] = useState([]);

  useEffect(() => {
    if (tutors.length > 0 && subject) {
      const tutData = tutors.filter(
        (tutor) => tutor.subject === subject && tutor._id !== tutId
      );
      setSimTutors(tutData);
    }
  }, [tutors, subject, tutId]);

  return (
    <section className="pt-16 xl:pt-32">
      {/* Section Header */}
      <div className="max-w-xl mx-auto text-center pb-16">
        <h3 className="text-2xl font-bold text-gray-800">
          Mentors With Similar Expertise
        </h3>
        <p className="text-gray-600 mt-3">
          Our platform brings together passionate learners and experienced
          mentors in one interactive space, allowing you to gain new skills,
          share your expertise, and learn, earn, and grow with every session.
        </p>
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {simTutors.slice(0, 5).map((tutor, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden relative group shadow-md hover:shadow-lg transition"
          >
            {/* Tutor Image */}
            <img
              src={tutor.image}
              alt={tutor.name}
              className="w-full h-64 object-cover"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-white font-semibold text-lg">
                  {tutor.name}
                </h5>
                <span className="flex items-center text-yellow-400">
                  <FaStar className="mr-1" /> 4.8
                </span>
              </div>
              <p className="text-sm text-gray-200 mb-1">{tutor.subject}</p>
              <p className="text-sm text-gray-200 mb-3">
                NPR {tutor.fees}/hr
              </p>

              {/* Action Buttons */}
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
    </section>
  );
};

export default SimilarTutors;

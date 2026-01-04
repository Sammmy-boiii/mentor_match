import React from 'react';
import { Link } from 'react-router-dom';
import { FaRobot, FaDatabase, FaLaptopCode, FaShieldAlt, FaChartLine, FaPaintBrush } from 'react-icons/fa';
import { SiTensorflow, SiFigma } from 'react-icons/si';

// Subjects data with icons
const subjectsData = [
  { name: "AI", icon: <FaRobot className="text-5xl mb-4 transition" /> },
  { name: "Data Analysis", icon: <FaDatabase className="text-5xl mb-4 transition" /> },
  { name: "UI/UX", icon: <SiFigma className="text-5xl mb-4 transition" /> },
  { name: "Cybersecurity", icon: <FaShieldAlt className="text-5xl mb-4 transition" /> },
  { name: "Machine Learning", icon: <SiTensorflow className="text-5xl mb-4 transition" /> },
  { name: "Digital Marketing", icon: <FaChartLine className="text-5xl mb-4 transition" /> },
  { name: "Graphic Design", icon: <FaPaintBrush className="text-5xl mb-4 transition" /> },
  { name: "Web Development", icon: <FaLaptopCode className="text-5xl mb-4 transition" /> },
];

const Subjects = () => {
  return (
    <section className="mx-padd-container py-16 xl:py-20">
      {/* Header */}
      <div className="max-w-lg mx-auto text-center pb-16">
        <h3 className="h3 text-[#0b4d54]">Explore By Subject</h3>
        <p className="text-gray-500 sm:text-base">
          Browse a wide range of courses and connect with expert tutors to enhance your skills. Click on a subject to start learning today!
        </p>
      </div>

      {/* Subjects row */}
      <div className="flex flex-wrap justify-center gap-6 px-4">
        {subjectsData.map((subject, i) => (
          <Link
            key={i}
            onClick={() => window.scrollTo(0, 0)}
            to={`/tutors/${subject.name.toLowerCase().replace(/\s+/g, '-')}`}
            className="w-full xs:w-[45%] sm:w-[30%] md:w-[22%] lg:w-[18%] flex flex-col items-center text-center text-gray-900 hover:text-white transition p-6 rounded-xl cursor-pointer hover:bg-[#4f47e6]"
          >
            {subject.icon}
            <h5 className="h5">{subject.name}</h5>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Subjects;

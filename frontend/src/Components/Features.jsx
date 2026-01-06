import React from "react";
import { FaUserTie, FaClock, FaUserFriends } from "react-icons/fa";
import { BsClipboardFill } from "react-icons/bs";

const Features = () => {
  const features = [
    {
      icon: <FaUserTie className="text-secondary text-2xl mb-2 transition" />,
      title: "Qualified Instructors",
      description: "Learn from expert mentors who guide you every step of the way.",
    },
    {
      icon: <FaClock className="text-secondary text-2xl mb-2 transition" />,
      title: "24/7 Availability",
      description: "Access learning materials and tutors anytime, anywhere.",
    },
    {
      icon: <BsClipboardFill className="text-secondary text-2xl mb-2 transition" />,
      title: "Interactive Whiteboards",
      description: "Engage in live interactive sessions for better understanding.",
    },
    {
      icon: <FaUserFriends className="text-secondary text-2xl mb-2 transition" />,
      title: "1-on-1 Live Sessions",
      description: "Personalized tutoring sessions focused on your growth.",
    },
  ];

  return (
    <section className="mx-auto max-w-[1140px] px-6 lg:px-12 relative bottom-12">
      <div className="flex flex-wrap gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex-1 min-w-[240px] flex flex-col items-center gap-y-2 p-6 bg-white text-gray-900 rounded-2xl hover:bg-[#4f47e6] transition cursor-pointer group shadow-sm"
          >
            {React.cloneElement(feature.icon, { className: "text-secondary text-2xl mb-2 transition group-hover:text-white" })}
            <h5 className="h5 text-center group-hover:text-white">{feature.title}</h5>
            <p className="text-center text-gray-700 group-hover:text-white">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;

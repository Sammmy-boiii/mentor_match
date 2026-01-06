import React from 'react';
import { Link } from 'react-router-dom';
import bg from '../assets/bg.png'; // import your image

const Hero = () => {
  return (
    <section
      className="max-padd-container min-h-[600px] md:h-[711px] w-full relative bg-center bg-no-repeat bg-cover flex items-center"
      style={{ backgroundImage: `url(${bg})` }} // use imported image
    >
      <div className="pt-44 xl:pt-52 max-w-[677px] text-white">
        <span className="ring-1 ring-white/30 max-w-72 px-3 rounded-3xl inline-block">
          <span className="text-secondary">#1</span> Trusted Online Tutoring Platform
        </span>

        <h1 className="h1 max-w-[44rem] mt-6">
          Personalized 1-on-1 Tutoring for Every Learner, Anytime, Anywhere
        </h1>

        <p className="text-gray-10 mt-4">
          Experience expert guidance with our advanced platform that connects students with mentors across a range of subjects built for results, flexibility, and growth.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/login"
            className="btn-light !bg-transparent !ring-white !py-3 px-6 rounded-full text-white hover:bg-white/10 transition"
          >
            Register Now
          </Link>
          <Link
            to="/tutors"
            className="btn-secondary text-tertiary !py-3 px-6 rounded-full hover:bg-secondary/90 transition"
          >
            Book Session
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;

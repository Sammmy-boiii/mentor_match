import React from "react";

const Footer = () => {
  return (
    <footer className="bg-deep text-light py-10 mt-12">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Column 1: Logo + About */}
        <div>
          <h2 className="text-2xl font-bold text-primary">MentorMatch</h2>
          <p className="mt-3 text-gray-30 text-sm leading-6">
            MentorMatch connects students with mentors for personalized 1:1 
            learning experiences. Grow your knowledge, achieve your goals, 
            and build lasting skills with the right guidance.
          </p>
        </div>

        {/* Column 2: Explore */}
        <div>
          <h3 className="text-lg font-semibold text-secondary mb-3">Explore</h3>
          <ul className="space-y-2 text-gray-30 text-sm">
            <li><a href="/" className="hover:text-light">Home</a></li>
            <li><a href="/about" className="hover:text-light">About Us</a></li>
            <li><a href="/tutors" className="hover:text-light">Tutors</a></li>
            <li><a href="/privacy" className="hover:text-light">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Column 3: Get in Touch */}
        <div>
          <h3 className="text-lg font-semibold text-secondary mb-3">Get in Touch</h3>
          <ul className="space-y-2 text-gray-30 text-sm">
            <li>Email: <a href="mailto:support@mentormatch.com" className="hover:text-light">support@mentormatch.com</a></li>
            <li>Phone: <a href="tel:+123456789" className="hover:text-light">+1 (234) 567-89</a></li>
            <li>Location: Kathmandu, Nepal</li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-30 mt-8 pt-4 text-center text-gray-50 text-sm">
        © {new Date().getFullYear()} MentorMatch. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

import React from "react";
import { FaEnvelope, FaPhone, FaLocationDot, FaHeadphones } from "react-icons/fa6";

const Contact = () => {
  return (
    <section className="max-padd-container py-16 xl:py-28 bg-gray-50">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
        {/* LEFT SIDE - Contact Form */}
        <div className="flex-1">
          <div className="max-w-lg pb-10">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Get <span className="font-light">in touch</span>
            </h3>
            <p className="text-gray-600">
              Have questions or need help? Send us a message, and we'll get back
              to you as soon as possible.
            </p>
          </div>

          <form className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter Your Name"
                className="w-1/2 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="email"
                placeholder="Enter Your Email"
                className="w-1/2 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <textarea
              rows="5"
              placeholder="Write Your Message Here..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>

            <button
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-[#0a3f44] transition font-semibold shadow-md"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* RIGHT SIDE - Contact Details */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Contact <span className="font-light">Details</span>
          </h3>
          <p className="text-gray-600 mb-8">
            Feel free to reach out to us through any of the following ways. Our
            team is always here to assist you!
          </p>

          <div className="space-y-6">
            {/* Location */}
            <div>
              <h5 className="font-semibold text-gray-900 mb-2">Location</h5>
              <div className="flex items-center gap-3 text-gray-700">
                <FaLocationDot className="text-primary text-xl" />
                <span>Kathmandu, Nepal</span>
              </div>
            </div>

            {/* Email */}
            <div>
              <h5 className="font-semibold text-gray-900 mb-2">Email</h5>
              <div className="flex items-center gap-3 text-gray-700">
                <FaEnvelope className="text-primary text-xl" />
                <span>support@mentormatch.com</span>
              </div>
            </div>

            {/* Phone */}
            <div>
              <h5 className="font-semibold text-gray-900 mb-2">Phone</h5>
              <div className="flex items-center gap-3 text-gray-700">
                <FaPhone className="text-primary text-xl" />
                <span>+977 9812345678</span>
              </div>
            </div>

            {/* Support */}
            <div>
              <h5 className="font-semibold text-gray-900 mb-2">Support</h5>
              <div className="flex items-center gap-3 text-gray-700">
                <FaHeadphones className="text-primary text-xl" />
                <span>24/7 Customer Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

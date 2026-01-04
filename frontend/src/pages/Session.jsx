import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { FaLocationDot } from "react-icons/fa6";
import SimilarTutors from "../Components/SimilarTutors";
import axios from "axios";
import { toast } from "react-toastify";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Session = () => {
  const { tutId } = useParams();
  const { tutors, currency, navigate, getTutorsData, backendUrl, token } = useContext(AppContext);
  const [tutorInfo, setTutorInfo] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState("");

  const readablePrimary = "#0b4d54";

  useEffect(() => {
    const tutor = tutors?.find((t) => String(t._id) === String(tutId));
    setTutorInfo(tutor || null);
  }, [tutors, tutId]);

  // Generate slots
  useEffect(() => {
    if (!tutorInfo) return;

    const generateSlots = () => {
      const today = new Date();
      const slotsPerDay = [];

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const daySlots = [];
        const startTime = new Date(date);
        const endTime = new Date(date);

        if (i === 0) {
          startTime.setHours(Math.max(today.getHours() + 1, 10));
          startTime.setMinutes(today.getMinutes() > 30 ? 30 : 0);
        } else {
          startTime.setHours(10, 0, 0, 0);
        }
        endTime.setHours(21, 0, 0, 0);

        while (startTime < endTime) {
          const slotTime = startTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          // Format date for checking booked slots
          const slotDateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

          // Check if slot is available (not booked)
          const isSlotAvailable = !tutorInfo.slots_booked?.[slotDateStr]?.includes(slotTime);
          if (isSlotAvailable) {
            daySlots.push({
              datetime: new Date(startTime),
              time: slotTime,
            });
          }
          startTime.setMinutes(startTime.getMinutes() + 30);
        }
        slotsPerDay.push(daySlots);
      }

      setAvailableSlots(slotsPerDay);
    };

    generateSlots();
  }, [tutorInfo]);

  const bookSession = async () => {
    if (!token) {
      toast.warn("Login to book session");
      return navigate("/login");
    }

    if (!selectedTime) {
      toast.warn("Please select a time slot");
      return;
    }

    try {
      const dateObj = availableSlots[selectedDayIndex][0].datetime;

      const day = dateObj.getDate();
      const month = dateObj.getMonth() + 1;
      const year = dateObj.getFullYear();

      const slotDate = `${day}/${month}/${year}`;

      const { data } = await axios.post(
        backendUrl + "/api/user/book-session",
        { tutId, slotDate, slotTime: selectedTime },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getTutorsData();
        navigate("/my-sessions");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="max-padd-container py-28 text-gray-800">
      {tutorInfo && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-x-12 gap-y-6">
            {/* LEFT SECTION - Profile Image */}
            <div className="max-w-[444px]">
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={tutorInfo.image}
                  alt="tutorImg"
                  className="w-full h-auto object-contain"
                />
                <div className="absolute inset-0 bg-black/15"></div>
              </div>
            </div>

            {/* RIGHT SECTION - Info */}
            <div>
              {/* Name + Availability inline, Qualification below */}
              <div className="mb-4 flex items-center gap-3">
                <h3 className="text-2xl font-bold text-gray-900">{tutorInfo.name}</h3>
                <span
                  className={`h-3 w-3 rounded-full mt-1 ${
                    tutorInfo.available ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <p
                  className={`font-semibold px-2 py-0.5 rounded-full text-sm mt-1 ${
                    tutorInfo.available
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {tutorInfo.available ? "Available" : "Unavailable"}
                </p>
              </div>
              <h5 className="text-md font-medium text-gray-600 mb-4">{tutorInfo.qualification}</h5>

              {/* Experience | Subject | Fee */}
              <div className="flex rounded-3xl text-sm font-medium max-w-2xl ring-1 ring-slate-900/10 p-5 my-4 bg-white shadow">
                {/* Experience */}
                <div className="flex flex-col items-center flex-1">
                  <h5 className="text-[15px] font-semibold text-teal-700">Experience</h5>
                  <p className="text-gray-700">{tutorInfo.experience}</p>
                </div>

                <div className="h-10 w-[1px] bg-gray-200 mx-3" />

                {/* Subject */}
                <div className="flex flex-col items-center flex-1">
                  <h5 className="text-[15px] font-semibold text-teal-700">Subject</h5>
                  <p className="text-gray-700">{tutorInfo.subject}</p>
                </div>

                <div className="h-10 w-[1px] bg-gray-200 mx-3" />

                {/* Fee */}
                <div className="flex flex-col items-center flex-1">
                  <h5 className="text-[15px] font-semibold text-teal-700">Fee</h5>
                  <p className="text-gray-700">
                    {currency}
                    {tutorInfo.fees}/30min
                  </p>
                </div>
              </div>

              {/* Location */}
              <p
                className="flex items-center gap-2 mb-3 font-medium"
                style={{ color: readablePrimary }}
              >
                <FaLocationDot className="text-lg" />
                <span>
                  {tutorInfo.location?.city ?? "N/A"},{" "}
                  {tutorInfo.location?.country ?? "N/A"}
                </span>
              </p>

              {/* About */}
              <h4 className="text-lg font-semibold mb-2 text-teal-700">About Me</h4>
              <p className="leading-relaxed mb-4 text-gray-700">{tutorInfo.about}</p>

              {/* Booking slots */}
              <div className="mt-8">
                <h5 className="h5 mb-3 text-teal-700">Booking Slots</h5>

                {/* Days scroll */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {availableSlots.map((slots, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedDayIndex(index)}
                      style={{ minWidth: 72 }}
                      className={`text-center py-3 rounded-full cursor-pointer flex flex-col items-center justify-center ${
                        selectedDayIndex === index
                          ? "bg-[#0b4d54] text-white"
                          : "border border-gray-200 bg-white text-gray-700"
                      }`}
                    >
                      <div className="font-medium">
                        {slots[0] && daysOfWeek[slots[0].datetime.getDay()]}
                      </div>
                      <div className="font-medium">
                        {slots[0] && slots[0].datetime.getDate()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time slots */}
                <div className="flex gap-3 overflow-x-auto mt-4 max-w-[777px]">
                  {availableSlots[selectedDayIndex]?.map((slot, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`text-xs font-light flex items-center justify-center min-w-[64px] py-2 rounded-full cursor-pointer ${
                        selectedTime === slot.time
                          ? "border border-[#0b4d54] text-[#0b4d54] bg-white"
                          : "text-gray-700 border border-gray-300 bg-white"
                      }`}
                    >
                      {slot.time.toLowerCase()}
                    </div>
                  ))}
                </div>

                {/* Book button */}
                <button
                  onClick={bookSession}
                  className="mt-4 px-6 py-2 rounded-md shadow"
                  style={{ backgroundColor: readablePrimary, color: "white" }}
                >
                  Book a Session
                </button>
              </div>
            </div>
          </div>
          {/* Similar Tutors Section */}
          <SimilarTutors tutId={tutId} subject={tutorInfo.subject} />
        </>
      )}
    </div>
  );
};

export default Session;

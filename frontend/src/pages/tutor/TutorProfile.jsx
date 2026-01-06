import React, { useContext, useEffect, useState } from "react";
import { TutorContext } from "../../context/TutorContext";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const TutorProfile = () => {
  const { tToken, profileData, getProfileData, updateProfile } =
    useContext(TutorContext);
  const { currency } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (tToken) {
      getProfileData();
    }
  }, [tToken]);

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
        qualification: profileData.qualification || "",
        subject: profileData.subject || "",
        experience: profileData.experience || "",
        about: profileData.about || "",
        fees: profileData.fees || 0,
        available: profileData.available || false,
        location: {
          city: profileData.location?.city || "",
          country: profileData.location?.country || "",
        },
      });
    }
  }, [profileData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes("location.")) {
      const locationField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEdit(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (!profileData || !formData) {
    return (
      <div className="m-5 w-full flex justify-center items-center h-64">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="m-5 w-full max-w-4xl">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#4f47e6] to-[#6366f1] p-6 text-white">
          <div className="flex items-center gap-6">
            <img
              src={profileData.image || "https://via.placeholder.com/100"}
              alt={profileData.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div>
              <h2 className="text-2xl font-bold">{profileData.name}</h2>
              <p className="text-blue-100">{profileData.qualification}</p>
              <p className="text-blue-100">{profileData.subject}</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Profile Information
            </h3>
            <button
              onClick={() => (isEdit ? handleSave() : setIsEdit(true))}
              className={`px-4 py-2 rounded-lg transition-colors ${isEdit
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-[#4f47e6] hover:bg-[#3f39c6] text-white"
                }`}
            >
              {isEdit ? "Save Changes" : "Edit Profile"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Experience
              </label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                disabled={!isEdit}
                className={`w-full px-4 py-2 border border-gray-200 rounded-lg ${isEdit ? "bg-white" : "bg-gray-50"
                  }`}
              />
            </div>

            {/* Fees */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Session Fee ({currency})
              </label>
              <input
                type="number"
                name="fees"
                value={formData.fees}
                onChange={handleInputChange}
                disabled={!isEdit}
                className={`w-full px-4 py-2 border border-gray-200 rounded-lg ${isEdit ? "bg-white" : "bg-gray-50"
                  }`}
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                City
              </label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleInputChange}
                disabled={!isEdit}
                className={`w-full px-4 py-2 border border-gray-200 rounded-lg ${isEdit ? "bg-white" : "bg-gray-50"
                  }`}
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Country
              </label>
              <input
                type="text"
                name="location.country"
                value={formData.location.country}
                onChange={handleInputChange}
                disabled={!isEdit}
                className={`w-full px-4 py-2 border border-gray-200 rounded-lg ${isEdit ? "bg-white" : "bg-gray-50"
                  }`}
              />
            </div>

            {/* Availability */}
            <div className="flex items-center gap-3">
              <label className="block text-sm font-medium text-gray-600">
                Available for Sessions
              </label>
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleInputChange}
                disabled={!isEdit}
                className="w-5 h-5 text-[#4f47e6] rounded focus:ring-[#4f47e6]"
              />
            </div>
          </div>

          {/* About Section */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              About
            </label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleInputChange}
              disabled={!isEdit}
              rows={4}
              className={`w-full px-4 py-2 border border-gray-200 rounded-lg resize-none ${isEdit ? "bg-white" : "bg-gray-50"
                }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfile;

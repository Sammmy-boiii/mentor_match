import React, { useContext, useState, useEffect } from "react";
import profileImage from "../assets/user.jpg";
import upload_icon from "../assets/upload_icon.png";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Myprofile = () => {
  const [selectedImage, setSelectedImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const {userData, setUserData,token,backendUrl,loadUserProfileData} = useContext(AppContext)
  
  useEffect(() => {
    if (token && !userData) {
      loadUserProfileData()
    }
  }, [token])

  useEffect(() => {
    if (userData && !userData.address) {
      setUserData(prev => ({
        ...prev,
        address: { city: prev.location?.city || "N/A", country: prev.location?.country || "N/A" }
      }))
    }
  }, [userData])
  
const handleProfileUpdate=async()=>{
  try{
    const formData=new FormData()
    formData.append("name",userData.name)
    formData.append("email",userData.email)
    formData.append("phone",userData.phone || "")
    formData.append("location",JSON.stringify(userData.address || {city: "N/A", country: "N/A"}))
    formData.append("gender",userData.gender || "")
    formData.append("dob",userData.dob || userData.DOB || "")
        if(selectedImage){
      formData.append("image",selectedImage)
    }
    const {data}=await axios.post(backendUrl+"/api/user/update-profile",formData,{ headers: {token} })
    
    if (data.success){
      toast.success(data.message)
      await loadUserProfileData()
      setIsEditing(false)
      setSelectedImage(false)
    }else{
      toast.error(data.message)
    }

  }
  catch(error){
    console.log(error)
    toast.error(error.message)
  }
}
  // handle change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "city" || name === "country") {
      setUserData((prev) => ({
        ...prev,
        address: { ...(prev.address || {}), [name]: value },
      }));
    } else {
      setUserData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    userData && userData.address ? (
      <div className="max-padd-container px-4 py-28 flex justify-center">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-6">
          {/* Profile Image + Name */}
          <div className="flex flex-col items-center relative">
            <div className="relative w-32 h-32 mb-3">
              <img
                src={
                  selectedImage
                    ? URL.createObjectURL(selectedImage)
                    : userData.image || upload_icon
                }
                alt="profile"
                className="h-32 w-32 rounded-full object-cover border-4 border-gray-200 shadow"
              />
              {isEditing && (
                <>
                  <label
                    htmlFor="image"
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer transition hover:bg-opacity-60"
                  >
                    <span className="text-white text-xs font-semibold">
                      Upload
                    </span>
                  </label>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    hidden
                    onChange={(e) => setSelectedImage(e.target.files[0])}
                  />
                </>
              )}
            </div>
            <h4 className="text-xl font-bold text-gray-900">{userData.name}</h4>
            <p className="text-sm text-gray-700">{userData.email}</p>
          </div>

          <hr className="my-4" />

          {/* Personal Details */}
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Personal Details
          </h4>
          <div className="space-y-4">
            {/* Name */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="font-semibold text-gray-800 min-w-32">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  className="border p-2 rounded w-full sm:w-2/3 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                />
              ) : (
                <p className="text-gray-900">{userData.name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="font-semibold text-gray-800 min-w-32">
                Phone
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={userData.phone || ""}
                  onChange={handleChange}
                  className="border p-2 rounded w-full sm:w-2/3 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                />
              ) : (
                <p className="text-gray-900">{userData.phone || "Not provided"}</p>
              )}
            </div>

            {/* DOB */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="font-semibold text-gray-800 min-w-32">
                Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="dob"
                  value={userData.dob || userData.DOB || ""}
                  onChange={handleChange}
                  className="border p-2 rounded w-full sm:w-2/3 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                />
              ) : (
                <p className="text-gray-900">{userData.dob || userData.DOB || "Not Selected"}</p>
              )}
            </div>

            {/* Gender */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="font-semibold text-gray-800 min-w-32">
                Gender
              </label>
              {isEditing ? (
                <select
                  name="gender"
                  value={userData.gender || ""}
                  onChange={handleChange}
                  className="border p-2 rounded w-full sm:w-2/3 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              ) : (
                <p className="text-gray-900">{userData.gender || "Not Selected"}</p>
              )}
            </div>
          </div>

          <hr className="my-4" />

          {/* Location */}
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Location Details
          </h4>
          <div className="space-y-4">
            {/* City */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="font-semibold text-gray-800 min-w-32">City</label>
              {isEditing ? (
                <input
                  type="text"
                  name="city"
                  value={userData.address?.city || ""}
                  onChange={handleChange}
                  className="border p-2 rounded w-full sm:w-2/3 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                />
              ) : (
                <p className="text-gray-900">{userData.address?.city || "N/A"}</p>
              )}
            </div>

            {/* Country */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="font-semibold text-gray-800 min-w-32">
                Country
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="country"
                  value={userData.address?.country || ""}
                  onChange={handleChange}
                  className="border p-2 rounded w-full sm:w-2/3 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                />
              ) : (
                <p className="text-gray-900">{userData.address?.country || "N/A"}</p>
              )}
            </div>
          </div>

          {/* Edit / Save Button */}
          <div className="flex justify-center">
            <button
              onClick={() =>{
                if(isEditing){
                  handleProfileUpdate()
                }
                else{
                  setIsEditing(true)
              } 
            }
            }
              className="mt-6 px-6 py-2 rounded-lg shadow-md font-semibold transition 
              bg-primary text-white hover:bg-[#0a3f44]"
            >
              {isEditing ? "Save Changes" : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div className="max-padd-container px-4 py-28 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    )
  );
};

export default Myprofile;

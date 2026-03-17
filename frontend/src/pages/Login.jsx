import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import loginImg from "../assets/login.png"; // make sure the path is correct
import axios from "axios";
import { toast } from "react-toastify"

const Login = () => {
  const { navigate, token, setToken, backendUrl } = useContext(AppContext);
  const [currState, setCurrState] = useState("Login"); // Login, Sign Up, Apply Tutor

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Tutor application fields
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [educationStatus, setEducationStatus] = useState("");
  const [experience, setExperience] = useState("");
  const [subject, setSubject] = useState("");
  const [about, setAbout] = useState("");
  const [image, setImage] = useState(null);
  const [document, setDocument] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);

  const adminUrl = import.meta.env.VITE_ADMIN_URL || "http://localhost:5174";

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currState === "Sign Up") {
        const { data } = await axios.post(backendUrl + '/api/user/register', { name, email, password })
        if (data.success) {
          setCurrState("Login")
          toast.success("Account created successfully! Please login.")
        } else {
          toast.error(data.message)
        }
      } else if (currState === "Apply Tutor") {
        // Tutor Application with file uploads
        if (!image) {
          toast.error("Please upload your profile photo")
          return
        }
        if (!document) {
          toast.error("Please upload your certificate/document")
          return
        }

        const formData = new FormData()
        formData.append('name', name)
        formData.append('email', email)
        formData.append('phone', phone)
        formData.append('age', age)
        formData.append('educationStatus', educationStatus)
        formData.append('experience', experience)
        formData.append('subject', subject)
        formData.append('about', about)
        formData.append('image', image)
        formData.append('document', document)

        const { data } = await axios.post(backendUrl + '/api/tutor/apply', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        if (data.success) {
          toast.success(data.message)
          // Reset form
          setName("")
          setEmail("")
          setPhone("")
          setAge("")
          setEducationStatus("")
          setExperience("")
          setSubject("")
          setAbout("")
          setImage(null)
          setDocument(null)
          setImagePreview(null)
          setDocumentPreview(null)
          setCurrState("Login")
        } else {
          toast.error(data.message)
        }
      } else {
        // Unified Login flow
        // 1. Check Admin
        try {
          const adminData = await axios.post(backendUrl + '/api/admin/login', { email, password })
          if (adminData.data.success) {
            toast.success("Admin login successful!")
            window.location.href = `${adminUrl}/admin-dashboard?aToken=${adminData.data.token}`
            return
          }
        } catch (error) {
           // Ignore to check next role
           console.log("Admin check failed", error)
        }
        
        // 2. Check Student
        try {
          const studentData = await axios.post(backendUrl + '/api/user/login', { email, password })
          if (studentData.data.success) {
            localStorage.setItem("token", studentData.data.token)
            setToken(studentData.data.token)
            toast.success("Student login successful!")
            return
          }
        } catch (error) {
           // Ignore to check next role
           console.log("Student check failed", error)
        }
        
        // 3. Check Tutor
        try {
          const tutorData = await axios.post(backendUrl + '/api/tutor/login', { email, password })
          if (tutorData.data.success) {
            toast.success("Tutor login successful!")
            window.location.href = `${adminUrl}/tutor-dashboard?tToken=${tutorData.data.token}`
            return
          }
        } catch (error) {
           // Ignore
           console.log("Tutor check failed", error)
        }
        
        toast.error("Invalid Credentials. Please check your email and password.")
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleDocumentChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setDocument(file)
      setDocumentPreview(URL.createObjectURL(file))
    }
  }

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token])

  // Reset form when switching states
  useEffect(() => {
    setEmail("")
    setPassword("")
    setName("")
    setPhone("")
    setAge("")
    setEducationStatus("")
    setExperience("")
    setSubject("")
    setAbout("")
    setImage(null)
    setDocument(null)
    setImagePreview(null)
    setDocumentPreview(null)
  }, [currState])

  return (
    <section className="absolute top-0 left-0 h-full w-full z-50 bg-white overflow-y-auto">
      <div className="flex min-h-full w-full">
        {/* Image side */}
        <div className="w-1/2 hidden sm:block sticky top-0 h-screen">
          <img
            src={loginImg}
            alt="Login"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Form side */}
        <div className="flex w-full sm:w-1/2 items-center justify-center py-10">
          <form
            onSubmit={onSubmitHandler}
            className="flex flex-col items-center w-[90%] sm:max-w-md m-auto gap-y-4 text-gray-800"
          >
            <div className="w-full mb-2">
              <h3 className="text-3xl font-bold text-gray-900">
                {currState === "Apply Tutor" ? "Tutor Application" : currState}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                {currState === "Sign Up" ? "Create your account to get started" :
                 currState === "Apply Tutor" ? "Fill out the form to apply as a tutor" :
                 "Welcome back! Please enter your details"}
              </p>
            </div>

            {/* USER SIGN UP FORM */}
            {currState === "Sign Up" && (
              <>
                <div className="w-full">
                  <label htmlFor="name" className="medium-14">Name</label>
                  <input
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 ring-1 ring-slate-900/10 bg-white mt-1 text-gray-800 placeholder:text-gray-500 rounded-md focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="email" className="medium-14">Email</label>
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 ring-1 ring-slate-900/10 bg-white mt-1 text-gray-800 placeholder:text-gray-500 rounded-md focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="password" className="medium-14">Password</label>
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter your password"
                    className="w-full px-3 py-2 ring-1 ring-slate-900/10 bg-white mt-1 text-gray-800 placeholder:text-gray-500 rounded-md focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </>
            )}

            {/* LOGIN FORM (Shared for all roles) */}
            {currState === "Login" && (
              <>
                <div className="w-full">
                  <label htmlFor="email" className="medium-14">Email</label>
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 ring-1 ring-slate-900/10 bg-white mt-1 text-gray-800 placeholder:text-gray-500 rounded-md focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="password" className="medium-14">Password</label>
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="w-full px-3 py-2 ring-1 ring-slate-900/10 bg-white mt-1 text-gray-800 placeholder:text-gray-500 rounded-md focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </>
            )}

            {/* TUTOR APPLICATION FORM */}
            {currState === "Apply Tutor" && (
              <>
                 <div className="w-full">
                  <label className="medium-14">Full Name</label>
                  <input
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    type="text"
                    placeholder="Enter your full name"
                    required
                    className="w-full px-3 py-2 ring-1 ring-slate-900/10 bg-white mt-1 text-gray-800 placeholder:text-gray-500 rounded-md focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="w-full">
                  <label className="medium-14">Email</label>
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    required
                    className="w-full px-3 py-2 ring-1 ring-slate-900/10 bg-white mt-1 text-gray-800 placeholder:text-gray-500 rounded-md focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="w-full">
                  <label className="medium-14">Phone Number</label>
                  <input
                    onChange={(e) => setPhone(e.target.value)}
                    value={phone}
                    type="tel"
                    placeholder="Enter your phone number"
                    required
                    className="w-full px-3 py-2 ring-1 ring-slate-900/10 bg-white mt-1 text-gray-800 placeholder:text-gray-500 rounded-md focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="w-full">
                  <label className="medium-14">Age</label>
                  <input
                    onChange={(e) => setAge(e.target.value)}
                    value={age}
                    type="number"
                    min="18"
                    max="80"
                    placeholder="Enter your age"
                    required
                    className="w-full px-3 py-2 ring-1 ring-slate-900/10 bg-white mt-1 text-gray-800 placeholder:text-gray-500 rounded-md focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="w-full">
                  <label className="medium-14">Education Status</label>
                  <select
                    onChange={(e) => setEducationStatus(e.target.value)}
                    value={educationStatus}
                    required
                    className="w-full px-3 py-2 ring-1 ring-slate-900/10 bg-white mt-1 text-gray-800 rounded-md focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Education Level</option>
                    <option value="High School">High School</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="w-full">
                  <label className="medium-14">Teaching Experience</label>
                  <select
                    onChange={(e) => setExperience(e.target.value)}
                    value={experience}
                    required
                    className="w-full px-3 py-2 ring-1 ring-slate-900/10 bg-white mt-1 text-gray-800 rounded-md focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Experience</option>
                    <option value="0-1 years">0-1 years</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5-10 years">5-10 years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                </div>
                <div className="w-full">
                  <label className="medium-14">Subject/Expertise</label>
                  <select
                    onChange={(e) => setSubject(e.target.value)}
                    value={subject}
                    required
                    className="w-full px-3 py-2 ring-1 ring-slate-900/10 bg-white mt-1 text-gray-800 rounded-md focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English">English</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                    <option value="Economics">Economics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="w-full">
                  <label className="medium-14">About Yourself</label>
                  <textarea
                    onChange={(e) => setAbout(e.target.value)}
                    value={about}
                    placeholder="Tell us about yourself and your teaching style..."
                    required
                    rows={3}
                    className="w-full px-3 py-2 ring-1 ring-slate-900/10 bg-white mt-1 text-gray-800 placeholder:text-gray-500 rounded-md focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                {/* Photo Upload */}
                <div className="w-full">
                  <label className="medium-14">Profile Photo *</label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="imageUpload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition text-sm font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Upload Photo
                      </label>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Document Upload */}
                <div className="w-full">
                  <label className="medium-14">Certificate/Document (Proof of Qualification) *</label>
                  <div className="mt-2">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                      {documentPreview ? (
                        <div className="relative">
                          <img src={documentPreview} alt="Document Preview" className="max-h-40 mx-auto rounded-lg" />
                          <button
                            type="button"
                            onClick={() => { setDocument(null); setDocumentPreview(null); }}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm text-gray-500 mt-2">Upload your degree, certificate, or any document that proves your qualification</p>
                        </div>
                      )}
                      <input
                        type="file"
                        id="documentUpload"
                        accept="image/*,.pdf"
                        onChange={handleDocumentChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="documentUpload"
                        className="cursor-pointer mt-3 inline-flex items-center justify-center w-full px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-sm font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {documentPreview ? "Change Document" : "Upload Document"}
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-4 py-2 rounded-md text-white font-semibold hover:opacity-90 transition"
              style={{ backgroundColor: currState === "Apply Tutor" ? '#16a34a' : '#4f47e6' }}
            >
              {currState === "Sign Up"
                ? "Sign Up"
                : currState === "Apply Tutor"
                  ? "Submit Application"
                  : "Login"}
            </button>

            {/* Switch between States */}
            <div className="w-full flex flex-col gap-y-3 medium-14 mt-4 text-center">
                {currState === "Login" ? (
                  <>
                    <div className="text-gray-500">
                      Don't have an account?{" "}
                      <span onClick={() => setCurrState("Sign Up")} className="cursor-pointer font-semibold" style={{ color: '#4f47e6' }}>
                        Create Student Account
                      </span>
                    </div>
                    <div className="text-gray-500">
                      Want to teach?{" "}
                      <span onClick={() => setCurrState("Apply Tutor")} className="cursor-pointer font-semibold" style={{ color: '#16a34a' }}>
                        Apply as Tutor
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500">
                    Already have an account?{" "}
                    <span onClick={() => setCurrState("Login")} className="cursor-pointer font-semibold" style={{ color: '#4f47e6' }}>
                      Login
                    </span>
                  </div>
                )}
            </div>

            {/* Info text for Tutor */}
            {currState === "Apply Tutor" && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Your application will be reviewed by admin. Once approved, you'll receive login credentials.
              </p>
            )}

          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;

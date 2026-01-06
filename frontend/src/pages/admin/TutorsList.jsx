import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const TutorsList = () => {
  const { tutors, aToken, getAllTutors, changeAvailability, updateTutor, deleteTutor } = useContext(AdminContext)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [editingTutor, setEditingTutor] = React.useState(null)
  const [formData, setFormData] = React.useState({
    name: '', fees: '', experience: '', qualification: '', subject: '', about: '', mobile: ''
  })
  const [selectedImage, setSelectedImage] = React.useState(null)

  useEffect(() => {
    if (aToken) {
      getAllTutors()
    }
  }, [aToken])

  const handleEditClick = (tutor) => {
    setEditingTutor(tutor)
    setFormData({
      name: tutor.name || '',
      fees: tutor.fees || '',
      experience: tutor.experience || '',
      qualification: tutor.qualification || '',
      subject: tutor.subject || '',
      about: tutor.about || '',
      mobile: tutor.phone || '' // Mapping phone to mobile
    })
    setSelectedImage(null)
    setIsEditOpen(true)
  }

  const handleDeleteClick = async (tutorId) => {
    if (window.confirm("Are you sure you want to delete this tutor? This action cannot be undone.")) {
      await deleteTutor(tutorId)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()

    // Create FormData object
    const data = new FormData();
    data.append('name', formData.name);
    data.append('fees', formData.fees);
    data.append('experience', formData.experience);
    data.append('qualification', formData.qualification);
    data.append('subject', formData.subject);
    data.append('about', formData.about);
    data.append('mobile', formData.mobile);

    if (selectedImage) {
      data.append('image', selectedImage);
    }

    const success = await updateTutor(editingTutor._id, data)
    if (success) {
      setIsEditOpen(false)
      setEditingTutor(null)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setSelectedImage(file)
  }

  return (
    <div className='px-2 sm:px-8 py-12 h-screen'>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-x-10  sm:gap-y-12">
        {tutors?.map((tutor, i) => (
          <div
            key={i}
            className="relative rounded-lg overflow-hidden shadow-md group cursor-pointer"
          >
            <img
              src={tutor.image}
              alt={tutor.name}
              className="w-full h-64 object-cover"
            />
            <span className="flex items-baseline gap-x-1 text-xs">
              {tutor.available ? (
                <div className="flex items-center gap-2">
                  <p className="min-w-2.5 h-2.5 rounded-full bg-green-500"></p>
                  <span>Available</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="min-w-2.5 h-2.5 rounded-full bg-red-500"></p>
                  <span>Unavailable</span>
                </div>
              )}
            </span>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition z-10">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-white font-semibold text-lg truncate">
                  {tutor.name}
                </h5>
              </div>
              <p className="text-sm text-gray-200 mb-1">{tutor.subject}</p>
              <p className="text-sm text-gray-200 mb-3">
                {tutor.fees || 0} / hr
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => changeAvailability(tutor._id)}
                  className="w-full px-3 py-1.5 bg-[#0b4d54] text-white rounded hover:bg-[#0a3f44] transition text-sm"
                >
                  {tutor.available ? "Mark Unavailable" : "Mark Available"}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(tutor)}
                    className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(tutor._id)}
                    className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Tutor Details</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 mb-2 rounded-full overflow-hidden border-2 border-gray-300">
                  <img
                    src={selectedImage ? URL.createObjectURL(selectedImage) : editingTutor?.image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="cursor-pointer bg-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-200">
                  Change Photo
                  <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fees (/hr)</label>
                  <input type="number" name="fees" value={formData.fees} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience</label>
                  <input type="text" name="experience" value={formData.experience} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Qualification</label>
                <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile</label>
                {/* Assuming mobile is mapped to phone */}
                <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">About</label>
                <textarea name="about" value={formData.about} onChange={handleChange} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md p-2" ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TutorsList

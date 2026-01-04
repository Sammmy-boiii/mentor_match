import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const TutorsList = () => {
  const { tutors, aToken, getAllTutors,changeAvailability } = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
      console.log(tutors)
      getAllTutors()
    }
  }, [aToken])

  return (
    <div className='px-2 sm:px-8  py-12 h-screen sm:pl-[23%]'>
      {/* {Container} */}
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
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-white font-semibold text-lg">
                  {tutor.name}
                </h5>
              </div>
              <p className="text-sm text-gray-200 mb-2">{tutor.subject}</p>

              {/* FIX: currency placeholder removed */}
              <p className="text-sm text-gray-200 mb-2">
                {tutor.fees || 0} / hr
              </p>

              <div className="flex gap-2">
                {/* FIX: onClick syntax */}
                <button
                  onClick={() =>changeAvailability(tutor._id) }
                  className="px-3 py-2 bg-[#0b4d54] text-white rounded hover:bg-[#0a3f44] transition text-sm"
                >
                  Switch Availability
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TutorsList

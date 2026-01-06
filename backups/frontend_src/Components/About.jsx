import React from 'react'
import about1 from "../assets/about1.png"
import { FaArrowRight,FaChalkboardTeacher,FaClock,FaUser } from 'react-icons/fa'
import playButton from "../assets/playButton.png"
const About = () => {
  return (
    <section className='max-padd-container px-6 lg:px-12 py-16 xl:py-20'>
      <div className='max-w-lg mx-auto text-center pb-16'>
         <h3 className='h3 capitalize'>Chosen By Thousands of Learners and Mentors</h3>
     <p>The platform brings togehter thousands of mentors and learners from around the world.  </p>
      </div>

      <div className='grid lg:grid-cols-[2fr_1fr] gap-5'>
        <div className='relative'>
          <img src={about1} alt="" className='rounded-3xl'/>

          <div className='absolute top-0 left-0 h-full w-full flex items-center justify-center'>
            <img src={playButton} alt='' height={66} width={66}/>
          </div>
        </div> 
        <div className='flex justify-between flex-col bg-[#1c404d] text-white rounded-3xl p-4'>
          <div className=''>
            <h4 className=''>Do you have Any Teaching Experience?</h4>
            <p className='mt-1 text-white/60 text-[13px]'>Share your academic background and mentorship history to help us verify your profile</p>
          </div>
          <div className='flexBetween gap-10'>
            <h4 className='medium-16'>Become a mentor on our platform</h4>
            <button className='btn-light
            text-tertiary'>
              <FaArrowRight className='text-xl mb-2 bg-white rounded-full h-10 w-10 p-2.5'/>
            </button>
          </div>
        </div>
      </div>

      <div className='grid grig-cols-1 xs:grid-cols-2 md:grid-cols-3 fap-4 bg-light rounded-3xl mt-8'>
        <div className="flex flex-col gap-y-2 p-4 rounded-3xl bg-[#aedae6]">
          <FaChalkboardTeacher className='text-xl mb-2 bg-white rounded-full h-10 w-10 p-2.5' />
          <h5 className='h5'>Teach what you Know</h5>
           <p>Share your knowledge,connect eith eager learners,and inspire 
            growth through flexible,personalized online tutoring sessions
           </p>
        </div>
        <div className="flex flex-col gap-y-3 p-4 rounded-3xl bg-[#fddbdb]">
          <FaUser className="text-xl mb-2 bg-white rounded-full h-10 w-10 p-2.5"/>
          <h5 className='h5'>Join a Global Community </h5>
           <p>Collaborate with expert tutors and students from around the world.
           </p>
        </div>
        <div className="flex flex-col gap-y-3 p-4 rounded-3xl bg-[#fff6c9]">
          <FaClock className='text-xl mb-2 bg-white rounded-full h-10 w-10 p-2.5'/>
          <h5 className='h5'>Teach on your Schedule</h5>
           <p>Enjoy complete freedom to set your own hours,manage your time,and grow your tutoring practice from anywhere.
           </p>
        </div>
      </div>
    </section>
  )
}

export default About

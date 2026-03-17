import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import bg from '../assets/bg.png';
import { subjectsData, tutors } from '../assets/data';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Hero = () => {
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const { backendUrl, token, navigate, currency } = useContext(AppContext);
  const tutorSubjects = [...new Set(tutors.map((t) => t.subject))];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please login to post a question");
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + '/api/marketplace/post-question',
        { subject, description, budget: Number(budget) },
        { headers: { token } }
      );

      if (data.success) {
        toast.success("Question posted! Mentors have been notified.");
        setShowForm(false);
        setSubject('');
        setDescription('');
        setBudget('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <section
      className="max-padd-container min-h-[600px] md:h-[711px] w-full relative bg-center bg-no-repeat bg-cover flex items-center"
      style={{ backgroundImage: `url(${bg})` }}
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
          <button
            onClick={() => setShowForm(!showForm)}
            className="!bg-orange-500 text-white !py-3 px-8 rounded-full font-bold hover:bg-orange-600 transition shadow-lg"
          >
            {showForm ? 'Close Form' : 'Post a Question'}
          </button>
          <Link
            to="/tutors"
            className="!bg-blue-600 text-white !py-3 px-8 rounded-full font-bold hover:bg-blue-700 transition shadow-lg"
          >
            Find a Mentor
          </Link>
        </div>

        {showForm && (
          <div className="mt-8 bg-slate-900/60 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/20 animate-fadeIn max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group z-50">
            {/* Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all duration-700"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>

            <button
              onClick={() => setShowForm(false)}
              className="absolute top-6 right-6 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all z-20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-tertiary text-2xl shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                  <span className="font-black">?</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-orange-400 leading-none">Find Your Mentor</h3>
                  <p className="text-white/50 text-xs mt-1 font-medium tracking-wide uppercase">Get responses in real-time</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] ml-1">Select Subject</label>
                  <div className="relative group/select">
                    <select
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-950/40 border border-white/10 rounded-2xl p-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all hover:bg-slate-950/60 font-semibold"
                    >
                      <option value="" className="bg-slate-900 text-white">Select Category</option>
                      {tutorSubjects.map((sub, i) => (
                        <option key={i} value={sub} className="bg-slate-900 text-white">{sub}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 group-hover/select:text-secondary transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] ml-1">Your Budget /Hr ({currency || 'NPR'})</label>
                  <input
                    type="number"
                    placeholder="e.g. 1500"
                    required
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-slate-950/40 border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all hover:bg-slate-950/60 font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] ml-1">The Problem</label>
                  <textarea
                    placeholder="Describe what you need help with. Mentors love details!"
                    required
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950/40 border border-blue-500/20 rounded-2xl p-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all hover:bg-slate-950/60 resize-none font-medium leading-relaxed"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 hover:scale-[1.02] transition-all transform active:scale-100 shadow-[0_10px_30px_rgba(255,112,0,0.35)] mt-2 flex items-center justify-center gap-3 overflow-hidden relative group/btn"
                >
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/60 border-t-transparent rounded-full animate-spin"></div>
                      <span className="uppercase tracking-widest text-sm">Deploying Alert...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl"></span>
                      <span className="uppercase tracking-widest text-sm">Broadcast to Experts</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;

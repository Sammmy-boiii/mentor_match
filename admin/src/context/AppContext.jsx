import React, { createContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';

export const AppContext = createContext();

const AppContextProvider = (props) => {

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const currency = "Rs. "

  const navigate = useNavigate()

  // Format slot date for display
  const slotDateFormat = (slotDate) => {
    if (!slotDate) return ""
    // Handle both ISO format and underscore-separated format
    let date;
    if (typeof slotDate === 'string' && slotDate.includes('_')) {
      // Format: "31_4_2026"
      const [day, month, year] = slotDate.split('_')
      date = new Date(year, parseInt(month) - 1, day)
    } else {
      // ISO format or Date object
      date = new Date(slotDate)
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const value = { navigate, backendUrl, currency, slotDateFormat }

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )
}

export default AppContextProvider
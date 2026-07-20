import { Routes, Route } from 'react-router-dom'
import BookingPage from './pages/BookingPage'
import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/booking/:slug" element={<BookingPage />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
    </Routes>
  )
}

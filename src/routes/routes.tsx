import { Routes, Route } from "react-router-dom"
import Dashboard from "@/pages/Dashboard"



export default function AppRoutes() {
  return (
      <Routes>
        <Route path="/" element={<Dashboard />} />

        {/* Future routes */}
        {/* <Route path="/satellites" element={<Satellites />} /> */}
        {/* <Route path="/commands" element={<Commands />} /> */}
        {/* <Route path="/history" element={<History />} /> */}

        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
  )
}
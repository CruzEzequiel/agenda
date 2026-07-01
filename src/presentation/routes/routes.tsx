import { Routes, Route, Navigate } from 'react-router-dom'
import Agenda from '../pages/agenda/Agenda'

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/agenda" replace />} />
    <Route path="/agenda" element={<Agenda />} />
  </Routes>
)

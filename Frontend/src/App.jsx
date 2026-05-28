import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

// Auth pages
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import VerifyOtp from './pages/auth/VerifyOtp'
import RoleSelect from './pages/auth/RoleSelect'
import CompleteProfile from './pages/auth/CompleteProfile'

// Placeholder pages — we'll build these next
const FarmerHome = () => <div>Farmer Home</div>
const OwnerHome = () => <div>Owner Home</div>
const AdminHome = () => <div>Admin Home</div>

// Protected route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to='/login' replace />
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to='/' replace />
  }
  return children
}

// Role based redirect after login
const RoleRedirect = () => {
  const { user } = useAuthStore()
  if (user?.role === 'farmer') return <Navigate to='/farmer/home' replace />
  if (user?.role === 'owner') return <Navigate to='/owner/home' replace />
  if (user?.role === 'admin') return <Navigate to='/admin/dashboard' replace />
  return <Navigate to='/role-select' replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path='/' element={<Landing />} />
        <Route path='/login' element={<Login />} />
        <Route path='/verify-otp' element={<VerifyOtp />} />
        <Route path='/role-select' element={<RoleSelect />} />
        <Route path='/complete-profile' element={<CompleteProfile />} />
        <Route path='/dashboard' element={<RoleRedirect />} />

        {/* Farmer */}
        <Route path='/farmer/*' element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerHome />
          </ProtectedRoute>
        } />

        {/* Owner */}
        <Route path='/owner/*' element={
          <ProtectedRoute allowedRoles={['owner']}>
            <OwnerHome />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path='/admin/*' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminHome />
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  )
}
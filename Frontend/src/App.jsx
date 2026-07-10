import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import useAuthStore from "./store/authStore";

// Auth pages
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import VerifyOtp from "./pages/auth/VerifyOtp";
import RoleSelect from "./pages/auth/RoleSelect";
import CompleteProfile from "./pages/auth/CompleteProfile";


import PublicExplore from './pages/Explore'
import EquipmentDetailPublic from './pages/EquipmentDetailPublic'

// Farmer pages
import FarmerHome from "./pages/farmer/Home";
import FarmerExplore from "./pages/farmer/Explore";
import FarmerBookings from "./pages/farmer/Bookings";
import FarmerProfile from "./pages/farmer/Profile";
import EquipmentDetail from "./pages/farmer/EquipmentDetail";
import FarmerBooking from "./pages/farmer/Booking";
import BookingDetail from "./pages/farmer/BookingDetail";

//owner pages
import OwnerHome from "./pages/owner/Home";
import OwnerRequests from "./pages/owner/Requests";
import OwnerListings from "./pages/owner/Listings";
import OwnerEarnings from "./pages/owner/Earnings";
import OwnerProfile from "./pages/owner/Profile";
import AddEquipment from "./pages/owner/AddEquipment";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import KycQueue from "./pages/admin/KycQueue";
import EquipmentQueue from "./pages/admin/EquipmentQueue";
import AdminUsers from "./pages/admin/Users";
import AdminDisputes from "./pages/admin/Disputes";

// Placeholder pages
const AdminHome = () => <div>Admin Home</div>;

// Error pages
import NotFound from "./pages/NotFound";

// Protected route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Role based redirect
const RoleRedirect = () => {
  const { user } = useAuthStore();
  if (user?.role === "farmer") return <Navigate to="/farmer/home" replace />;
  if (user?.role === "owner") return <Navigate to="/owner/home" replace />;
  if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/role-select" replace />;
};

// App
export default function App() {
  const { isAuthenticated, getMe, logout } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      getMe().then((user) => {
        if (!user) logout();
      });
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/role-select" element={<RoleSelect />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/dashboard" element={<RoleRedirect />} />
        
// Add inside Routes — before farmer routes
<Route path='/explore' element={<PublicExplore />} />
<Route path='/equipment/:id' element={<EquipmentDetailPublic />} />
        {/* Farmer */}
        <Route
          path="/farmer"
          element={
            <ProtectedRoute allowedRoles={["farmer"]}>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="home" element={<FarmerHome />} />
          <Route path="explore" element={<FarmerExplore />} />
          <Route path="bookings" element={<FarmerBookings />} />
          <Route path="profile" element={<FarmerProfile />} />
          <Route path="equipment/:id" element={<EquipmentDetail />} />
          <Route path="booking/:id" element={<FarmerBooking />} />
          <Route path="booking-detail/:id" element={<BookingDetail />} />
        </Route>

        {/* Owner */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="home" element={<OwnerHome />} />
          <Route path="requests" element={<OwnerRequests />} />
          <Route path="listings" element={<OwnerListings />} />
          <Route path="earnings" element={<OwnerEarnings />} />
          <Route path="profile" element={<OwnerProfile />} />
          <Route path="add-equipment" element={<AddEquipment />} />
        </Route>

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="kyc" element={<KycQueue />} />
          <Route path="equipment" element={<EquipmentQueue />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="disputes" element={<AdminDisputes />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

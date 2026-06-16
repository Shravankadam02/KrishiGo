import { HiHome, HiSearch, HiClipboardList, HiUser } from 'react-icons/hi'
import { FaTractor } from 'react-icons/fa'
import { MdDashboard, MdVerifiedUser, MdAgriculture, MdPeople, MdGavel } from 'react-icons/md'

export const farmerTabs = [
  { path: '/farmer/home',     icon: HiHome,          label: 'Home' },
  { path: '/farmer/explore',  icon: HiSearch,        label: 'Explore' },
  { path: '/farmer/bookings', icon: HiClipboardList, label: 'Bookings' },
  { path: '/farmer/profile',  icon: HiUser,          label: 'Profile' },
]

export const ownerTabs = [
  { path: '/owner/home',      icon: HiHome,          label: 'Home' },
  { path: '/owner/listings',  icon: FaTractor,       label: 'Listings' },
  { path: '/owner/requests',  icon: HiClipboardList, label: 'Requests' },
  { path: '/owner/earnings',  icon: HiSearch,        label: 'Earnings' },
  { path: '/owner/profile',   icon: HiUser,          label: 'Profile' },
]

export const adminTabs = [
  { path: '/admin/dashboard', icon: MdDashboard,    label: 'Dashboard' },
  { path: '/admin/kyc',       icon: MdVerifiedUser, label: 'KYC' },
  { path: '/admin/equipment', icon: MdAgriculture,  label: 'Equipment' },
  { path: '/admin/users',     icon: MdPeople,       label: 'Users' },
  { path: '/admin/disputes',  icon: MdGavel,        label: 'Disputes' },
]

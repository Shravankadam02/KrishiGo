import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      sendOtp: async (phone) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/api/auth/send-otp', { phone })
          set({ isLoading: false })
          return { success: true, message: data.message }
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to send OTP'
          set({ isLoading: false, error: message })
          return { success: false, message }
        }
      },

      verifyOtp: async (phone, otp) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/api/auth/verify-otp', { phone, otp })
          localStorage.setItem('token', data.token)
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false
          })
          return { success: true, isNewUser: data.isNewUser, user: data.user }
        } catch (error) {
          const message = error.response?.data?.message || 'OTP verification failed'
          set({ isLoading: false, error: message })
          return { success: false, message }
        }
      },

      completeProfile: async (profileData) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/api/auth/complete-profile', profileData)
          set({ user: data.user, isLoading: false })
          return { success: true, user: data.user }
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to complete profile'
          set({ isLoading: false, error: message })
          return { success: false, message }
        }
      },

      getMe: async () => {
        try {
          const { data } = await api.get('/api/auth/me')
          set({ user: data.user, isAuthenticated: true })
          return data.user
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false })
          localStorage.removeItem('token')
          return null
        }
      },

      logout: async () => {
        try {
          await api.post('/api/auth/logout')
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          localStorage.removeItem('token')
          set({ user: null, token: null, isAuthenticated: false })
          window.location.href = '/'
        }
      },

      updateUser: (userData) => set({ user: { ...get().user, ...userData } })
    }),
    {
      name: 'krishigo-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

export default useAuthStore
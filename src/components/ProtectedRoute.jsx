import React, { useEffect, useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'

function ProtectedRoute({ children }) {
  const { isLoggedIn, loading, justLoggedOut } = useAuth()
  const location = useLocation()
  const { toast } = useToast()
  const hasShownToast = useRef(false)

  // Show toast message when user tries to access protected route without being logged in
  useEffect(() => {
    if (!loading && !isLoggedIn && !hasShownToast.current && !justLoggedOut) {
      toast.error('Please sign in to access the dashboard', {
        title: 'Authentication Required',
        duration: 5000
      })
      hasShownToast.current = true
    }
    
    // Reset the flag when user becomes logged in
    if (isLoggedIn) {
      hasShownToast.current = false
    }
  }, [loading, isLoggedIn, justLoggedOut]) // Added justLoggedOut to dependencies

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // If not logged in, redirect based on whether this was a logout or unauthorized access
  if (!isLoggedIn) {
    // If user just logged out, redirect to home page
    if (justLoggedOut) {
      return <Navigate to="/" replace />
    }
    // Otherwise, redirect to login with the current location for unauthorized access
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If logged in, render the protected component
  return children
}

export default ProtectedRoute

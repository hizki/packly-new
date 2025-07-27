import { useState, useEffect } from 'react'
import './App.css'
import Pages from "@/pages/index.jsx"
import LoginPage from "@/components/auth/LoginPage.jsx"
import { Toaster } from "@/components/ui/toaster"
import { User } from "@/api/auth"
import LottieSpinner from "@/components/ui/lottie-spinner"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    checkAuthState()
    
    // Listen for auth state changes
    const { data: { subscription } } = User.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
      
      setLoading(false)
      setAuthChecked(true)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const checkAuthState = async () => {
    try {
      const currentUser = await User.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
      setAuthChecked(true)
    }
  }

  // Show loading spinner while checking authentication
  if (loading || !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LottieSpinner size={80} color="#3b82f6" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login page if no user is authenticated
  if (!user) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    )
  }

  // Show main app if user is authenticated
  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App 
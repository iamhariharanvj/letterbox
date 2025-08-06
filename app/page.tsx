'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PincodeEntry from '@/components/PincodeEntry'
import HomeScreen from '@/components/HomeScreen'

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has a pincode stored
    const storedPincode = localStorage.getItem('userPincode')
    if (storedPincode) {
      setCurrentUser(storedPincode)
    }
    setIsLoading(false)
  }, [])

  const handlePincodeSubmit = async (pincode: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pincode }),
      })

      if (response.ok) {
        setCurrentUser(pincode)
        localStorage.setItem('userPincode', pincode)
      } else {
        console.error('Failed to save pincode')
      }
    } catch (error) {
      console.error('Error saving pincode:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-post-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading LetterBox...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      {!currentUser ? (
        <PincodeEntry onSubmit={handlePincodeSubmit} />
      ) : (
        <HomeScreen userPincode={currentUser} />
      )}
    </main>
  )
} 
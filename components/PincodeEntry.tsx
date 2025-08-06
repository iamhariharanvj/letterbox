'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin } from 'lucide-react'

interface PincodeEntryProps {
  onSubmit: (pincode: string) => void
}

export default function PincodeEntry({ onSubmit }: PincodeEntryProps) {
  const [pincode, setPincode] = useState('')
  const [isValid, setIsValid] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validatePincode = (code: string) => {
    return /^\d{6}$/.test(code)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePincode(pincode)) {
      setIsValid(false)
      return
    }

    setIsValid(true)
    setIsSubmitting(true)
    
    try {
      await onSubmit(pincode)
    } catch (error) {
      console.error('Error submitting pincode:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="card text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-24 h-24 bg-post-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mail className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">LetterBox</h1>
            <p className="text-gray-600">Welcome to your digital post office</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your Pincode
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="pincode"
                  type="text"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    if (!isValid) setIsValid(true)
                  }}
                  placeholder="123456"
                  className={`input-field pl-10 text-center text-lg font-mono ${
                    !isValid ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  maxLength={6}
                />
              </div>
              {!isValid && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  Please enter a valid 6-digit pincode
                </motion.p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting || pincode.length !== 6}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Setting up your mailbox...
                </div>
              ) : (
                'Enter LetterBox'
              )}
            </motion.button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 text-sm text-gray-500"
          >
            <p>Your pincode will be used to receive letters</p>
            <p>Don't worry, it's completely private and secure</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
} 
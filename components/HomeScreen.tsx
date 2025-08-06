'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Plus, LogOut, Bell } from 'lucide-react'
import Postbox from './Postbox'
import LetterComposer from './LetterComposer'
import EnhancedLetterViewer from './EnhancedLetterViewer'
import PostboxCustomizer from './PostboxCustomizer'

interface HomeScreenProps {
  userPincode: string
}

interface Letter {
  id: string
  title: string
  content: string
  sender: {
    pincode: string
  }
  receiver: {
    pincode: string
  }
  deliveryTime: string
  isDelivered: boolean
  letterColor: string
  envelopeColor: string
  stampColor: string
  stampDesign: string
  envelopeDesign: string
  handwritingFont: string
  inkColor: string
  paperTexture: string
  paperType: string
  foldStyle: string
  createdAt: string
  brushStrokes?: any[]
}

export default function HomeScreen({ userPincode }: HomeScreenProps) {
  const [letters, setLetters] = useState<Letter[]>([])
  const [pendingLetters, setPendingLetters] = useState<Letter[]>([])
  const [showComposer, setShowComposer] = useState(false)
  const [showViewer, setShowViewer] = useState(false)
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null)
  const [isCheckingMail, setIsCheckingMail] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [isPostboxZoomed, setIsPostboxZoomed] = useState(false)
  const [isPostboxDoorOpen, setIsPostboxDoorOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [postboxCustomization, setPostboxCustomization] = useState({
    color: '#dc2626',
    stickers: [],
    decorations: [],
    pattern: 'solid',
    glow: false
  })

  useEffect(() => {
    fetchLetters()
  }, [userPincode])

  // Update current time every second for countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchLetters = async () => {
    try {
      // Fetch all letters including pending ones
      const response = await fetch(`/api/letters?receiverPincode=${userPincode}&includePending=true`)
      if (response.ok) {
        const data = await response.json()
        const allLetters = data.letters
        
        // Separate ready and pending letters
        const ready = allLetters.filter((letter: Letter) => {
          const deliveryDate = new Date(letter.deliveryTime)
          const diffMs = deliveryDate.getTime() - currentTime.getTime()
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
          
          // Safety check for unreasonably large delivery times (likely from old calculation)
          if (diffHours > 8760) { // More than 1 year
            console.warn('Letter with unreasonably large delivery time found, treating as ready:', letter.id)
            return true // Treat as ready
          }
          
          return diffMs <= 0
        })
        
        const pending = allLetters.filter((letter: Letter) => {
          const deliveryDate = new Date(letter.deliveryTime)
          const diffMs = deliveryDate.getTime() - currentTime.getTime()
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
          
          // Safety check for unreasonably large delivery times
          if (diffHours > 8760) { // More than 1 year
            return false // Don't show in pending
          }
          
          return diffMs > 0
        })
        

        
        setLetters(ready)
        setPendingLetters(pending)
        setUnreadCount(ready.filter((letter: Letter) => !letter.isDelivered).length)
      }
    } catch (error) {
      console.error('Error fetching letters:', error)
    }
  }

  const handleCheckMail = async () => {
    setIsCheckingMail(true)
    
    // Simulate checking mail with animation
    setTimeout(async () => {
      await fetchLetters()
      setIsCheckingMail(false)
      
      if (unreadCount > 0) {
        // Show notification
        const audio = new Audio('/notification.mp3')
        audio.play().catch(() => {}) // Ignore audio errors
      }
    }, 2000)
  }

  const handleLetterClick = async (letter: Letter) => {
    // Mark letter as delivered if it's not already delivered
    if (!letter.isDelivered) {
      try {
        const response = await fetch(`/api/letters/${letter.id}/deliver`, {
          method: 'POST'
        })
        if (response.ok) {
          // Update the letter in the local state
          setLetters(prev => prev.map(l => 
            l.id === letter.id ? { ...l, isDelivered: true } : l
          ))
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      } catch (error) {
        console.error('Error marking letter as delivered:', error)
      }
    }
    
    setSelectedLetter(letter)
    setShowViewer(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('userPincode')
    window.location.reload()
  }

  const handleLetterSent = () => {
    setShowComposer(false)
    setIsPosting(true)
    
    // Simulate posting animation
    setTimeout(() => {
      setIsPosting(false)
      fetchLetters() // Refresh letters
    }, 3000)
  }

  const handleCustomizePostbox = () => {
    setShowCustomizer(true)
  }

  const handleCustomizationChange = (customization: any) => {
    setPostboxCustomization(customization)
  }

  const formatDeliveryTime = (deliveryTime: string) => {
    const deliveryDate = new Date(deliveryTime)
    const diffMs = deliveryDate.getTime() - currentTime.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000)
    

    
    // Safety check for unreasonably large delivery times (likely from old calculation)
    if (diffHours > 8760) { // More than 1 year
      console.warn('Unreasonably large delivery time detected, treating as ready for delivery')
      return 'Ready for delivery'
    }
    
    if (diffMs <= 0) {
      return 'Ready for delivery'
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m until delivery`
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ${diffSeconds}s until delivery`
    } else {
      return `${diffSeconds}s until delivery`
    }
  }

  const handlePostboxClick = () => {
    if (!isPostboxZoomed) {
      setIsPostboxZoomed(true)
      // Open door after a short delay
      setTimeout(() => {
        setIsPostboxDoorOpen(true)
      }, 500)
    } else {
      // Close everything
      setIsPostboxDoorOpen(false)
      setTimeout(() => {
        setIsPostboxZoomed(false)
      }, 800)
    }
  }

  const handleLetterSelect = (letterIndex: number) => {
    if (letters[letterIndex]) {
      setSelectedLetter(letters[letterIndex])
      setShowViewer(true)
      // Close postbox
      setIsPostboxDoorOpen(false)
      setTimeout(() => {
        setIsPostboxZoomed(false)
      }, 800)
    }
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-post-red rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">LetterBox</h1>
            <p className="text-sm text-gray-600">Pincode: {userPincode}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative"
            >
              <Bell className="w-6 h-6 text-post-red" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            </motion.div>
          )}
          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Postbox Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-800">Your Postbox</h2>
            <Postbox
              onCheckMail={handleCheckMail}
              isChecking={isCheckingMail}
              letterCount={letters.length}
              unreadCount={unreadCount}
              customization={postboxCustomization}
              onCustomize={handleCustomizePostbox}
              isPosting={isPosting}
              onPostboxClick={handlePostboxClick}
              isZoomed={isPostboxZoomed}
              isDoorOpen={isPostboxDoorOpen}
              onLetterSelect={handleLetterSelect}
            />
          </motion.div>

          {/* Letters Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Your Letters</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowComposer(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Write Letter</span>
              </motion.button>
            </div>

            {/* Pending Letters Section */}
            {pendingLetters.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-700">📬 Pending Delivery</h3>
                <div className="space-y-2">
                  {pendingLetters.map((letter, index) => (
                    <motion.div
                      key={letter.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="card bg-gray-50 border-l-4 border-blue-500 cursor-not-allowed opacity-75"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-700 mb-1">{letter.title}</h4>
                          <p className="text-xs text-gray-500">
                            {formatDeliveryTime(letter.deliveryTime)}
                          </p>
                          <p className="text-xs text-gray-400">
                            From: {letter.sender.pincode}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: letter.letterColor }}
                          ></div>
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: letter.envelopeColor }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">📮 Ready for Reading</h3>
                {letters.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card text-center py-12"
                >
                  <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No letters yet</h3>
                  <p className="text-gray-500">Check your postbox or write your first letter!</p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {letters.map((letter, index) => (
                    <motion.div
                      key={letter.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleLetterClick(letter)}
                      className="card cursor-pointer hover:shadow-xl transition-shadow duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{letter.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {new Date(letter.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-2">
                            {!letter.isDelivered && (
                              <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                            <span className="text-xs text-gray-500">
                              {letter.isDelivered ? 'Delivered' : formatDeliveryTime(letter.deliveryTime)}
                            </span>
                            <span className="text-xs text-gray-400">
                              From: {letter.sender.pincode}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: letter.letterColor }}
                          ></div>
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: letter.envelopeColor }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Letter Composer Modal */}
      <AnimatePresence>
        {showComposer && (
          <LetterComposer
            userPincode={userPincode}
            onClose={() => setShowComposer(false)}
            onLetterSent={handleLetterSent}
          />
        )}
      </AnimatePresence>

      {/* Enhanced Letter Viewer Modal */}
      <AnimatePresence>
        {showViewer && selectedLetter && (
          <EnhancedLetterViewer
            letter={selectedLetter}
            onClose={() => {
              setShowViewer(false)
              setSelectedLetter(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* Postbox Customizer Modal */}
      <AnimatePresence>
        {showCustomizer && (
          <PostboxCustomizer
            customization={postboxCustomization}
            onCustomizationChange={handleCustomizationChange}
            onClose={() => setShowCustomizer(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
} 
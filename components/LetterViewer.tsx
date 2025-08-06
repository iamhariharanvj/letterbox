'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Clock, MapPin, User } from 'lucide-react'

interface Letter {
  id: string
  title: string
  content: string
  senderId: string
  receiverId: string
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
  createdAt: string
  brushStrokes?: any[]
}

interface LetterViewerProps {
  letter: Letter
  onClose: () => void
  onMarkAsRead: () => void
}

export default function LetterViewer({ letter, onClose, onMarkAsRead }: LetterViewerProps) {
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false)
  const [isLetterOpen, setIsLetterOpen] = useState(false)

  const handleOpenEnvelope = async () => {
    setIsEnvelopeOpen(true)
    
    // Mark as read after opening
    if (!letter.isDelivered) {
      try {
        await fetch(`/api/letters/${letter.id}/deliver`, {
          method: 'PUT',
        })
        onMarkAsRead()
      } catch (error) {
        console.error('Error marking letter as delivered:', error)
      }
    }
  }

  const handleOpenLetter = () => {
    setIsLetterOpen(true)
  }

  const getStampIcon = (design: string) => {
    switch (design) {
      case 'classic': return '🏛️'
      case 'nature': return '🌿'
      case 'modern': return '⚡'
      case 'vintage': return '📜'
      default: return '🏛️'
    }
  }

  const getEnvelopeIcon = (design: string) => {
    switch (design) {
      case 'standard': return '✉️'
      case 'elegant': return '💎'
      case 'casual': return '📝'
      case 'premium': return '👑'
      default: return '✉️'
    }
  }

  const getFontStyle = (fontType: string) => {
    switch (fontType) {
      case 'cursive':
        return 'font-cursive italic'
      case 'handwriting':
        return 'font-handwriting'
      case 'calligraphy':
        return 'font-calligraphy'
      case 'casual':
        return 'font-casual'
      default:
        return 'font-cursive italic'
    }
  }

  const getPaperStyle = (texture: string) => {
    switch (texture) {
      case 'textured':
        return 'bg-gradient-to-br from-gray-50 to-gray-100'
      case 'linen':
        return 'bg-gradient-to-br from-amber-50 to-amber-100'
      case 'kraft':
        return 'bg-gradient-to-br from-yellow-50 to-yellow-100'
      default:
        return 'bg-white'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Your Letter</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Envelope */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mb-8"
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Envelope</h3>
              <p className="text-sm text-gray-600">Click to open your letter</p>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenEnvelope}
              className="relative mx-auto w-64 h-40 cursor-pointer"
            >
              {/* Envelope Body */}
              <div
                className="absolute inset-0 rounded-lg shadow-lg border-2 border-gray-300"
                style={{ backgroundColor: letter.envelopeColor }}
              >
                {/* Envelope Flap */}
                <motion.div
                  animate={isEnvelopeOpen ? { rotateX: 180 } : { rotateX: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute top-0 left-0 right-0 h-16 bg-opacity-80 rounded-t-lg"
                  style={{ backgroundColor: letter.envelopeColor }}
                >
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-2xl">
                    {getEnvelopeIcon(letter.envelopeDesign)}
                  </div>
                </motion.div>

                {/* Stamp */}
                <motion.div
                  animate={isEnvelopeOpen ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute top-2 right-2 w-12 h-8 rounded border border-gray-400 flex items-center justify-center text-lg"
                  style={{ backgroundColor: letter.stampColor }}
                >
                  {getStampIcon(letter.stampDesign)}
                </motion.div>

                {/* Letter Inside */}
                <AnimatePresence>
                  {isEnvelopeOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="absolute top-8 left-4 right-4 bottom-4"
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={handleOpenLetter}
                        className="w-full h-full rounded shadow-md cursor-pointer flex items-center justify-center"
                        style={{ backgroundColor: letter.letterColor }}
                      >
                        <div className="text-center">
                          <Mail className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Click to read</p>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>

          {/* Letter Content */}
          <AnimatePresence>
            {isLetterOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{letter.title}</h3>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(letter.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>Pincode: {letter.receiverId}</span>
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`rounded-lg p-6 shadow-lg ${getPaperStyle(letter.paperTexture)} relative`}
                  style={{ 
                    backgroundColor: letter.letterColor,
                    color: letter.inkColor
                  }}
                >
                  {/* Canvas for Brush Strokes */}
                  {letter.brushStrokes && letter.brushStrokes.length > 0 && (
                    <canvas
                      className="absolute inset-0 w-full h-full z-10 pointer-events-none rounded-lg"
                      ref={(canvas) => {
                        if (canvas && letter.brushStrokes) {
                          const ctx = canvas.getContext('2d')
                          if (ctx) {
                            // Set canvas size to match display size
                            canvas.width = canvas.offsetWidth
                            canvas.height = canvas.offsetHeight
                            
                            // Clear canvas
                            ctx.clearRect(0, 0, canvas.width, canvas.height)
                            
                            // Group strokes by strokeId and type
                            const strokeGroups: { [key: string]: any[] } = {}
                            
                            letter.brushStrokes.forEach((stroke) => {
                              if (stroke.type === 'brush' || stroke.type === 'fingerprint' || stroke.type === 'lip') {
                                const groupKey = `${stroke.type}-${stroke.strokeId || 'default'}`
                                if (!strokeGroups[groupKey]) {
                                  strokeGroups[groupKey] = []
                                }
                                strokeGroups[groupKey].push(stroke)
                              }
                            })
                            
                            // Draw each group separately
                            Object.values(strokeGroups).forEach((strokeGroup) => {
                              if (strokeGroup.length === 0) return
                              
                              const firstStroke = strokeGroup[0]
                              
                              if (firstStroke.type === 'fingerprint') {
                                // Realistic fingerprint effect
                                ctx.lineCap = 'round'
                                ctx.lineJoin = 'round'
                                
                                strokeGroup.forEach((stroke) => {
                                  const alphaVariation = 0.6 + Math.random() * 0.3
                                  ctx.globalAlpha = alphaVariation
                                  
                                  ctx.beginPath()
                                  ctx.arc(stroke.x, stroke.y, stroke.size * 0.6, 0, Math.PI * 2)
                                  ctx.fillStyle = stroke.color
                                  ctx.fill()
                                  
                                  ctx.globalAlpha = alphaVariation * 0.5
                                  ctx.lineWidth = 1
                                  ctx.strokeStyle = stroke.color
                                  ctx.stroke()
                                })
                                
                                ctx.globalAlpha = 1.0
                              } else if (firstStroke.type === 'lip') {
                                // Realistic lip print effect
                                ctx.lineCap = 'round'
                                ctx.lineJoin = 'round'
                                
                                strokeGroup.forEach((stroke) => {
                                  const alphaVariation = 0.5 + Math.random() * 0.4
                                  ctx.globalAlpha = alphaVariation
                                  
                                  ctx.beginPath()
                                  ctx.arc(stroke.x, stroke.y, stroke.size * 0.8, 0, Math.PI * 2)
                                  ctx.fillStyle = stroke.color
                                  ctx.fill()
                                  
                                  const textureLayers = 2
                                  for (let layer = 1; layer <= textureLayers; layer++) {
                                    ctx.globalAlpha = alphaVariation * (0.3 / layer)
                                    ctx.beginPath()
                                    ctx.arc(stroke.x, stroke.y, stroke.size * (0.8 + layer * 0.2), 0, Math.PI * 2)
                                    ctx.fillStyle = stroke.color
                                    ctx.fill()
                                  }
                                  
                                  ctx.globalAlpha = alphaVariation * 0.8
                                  ctx.beginPath()
                                  ctx.arc(stroke.x - stroke.size * 0.2, stroke.y - stroke.size * 0.2, stroke.size * 0.3, 0, Math.PI * 2)
                                  ctx.fillStyle = stroke.color
                                  ctx.fill()
                                })
                                
                                ctx.globalAlpha = 1.0
                              } else {
                                // Regular brush strokes
                                ctx.lineCap = 'round'
                                ctx.lineJoin = 'round'
                                ctx.globalAlpha = 1.0
                                ctx.strokeStyle = firstStroke.color
                                ctx.lineWidth = firstStroke.size
                                
                                ctx.beginPath()
                                ctx.moveTo(strokeGroup[0].x, strokeGroup[0].y)
                                strokeGroup.forEach((stroke) => {
                                  ctx.lineTo(stroke.x, stroke.y)
                                })
                                ctx.stroke()
                              }
                            })
                            
                            ctx.globalAlpha = 1.0
                          }
                        }
                      }}
                    />
                  )}
                  
                  <div className="prose max-w-none relative z-20 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                    <p className={`whitespace-pre-wrap leading-relaxed text-lg ${getFontStyle(letter.handwritingFont)}`} style={{
                      fontFamily: letter.handwritingFont === 'cursive' ? 'cursive' : 
                                 letter.handwritingFont === 'handwriting' ? 'Brush Script MT, cursive' :
                                 letter.handwritingFont === 'calligraphy' ? 'Lucida Handwriting, cursive' :
                                 'Comic Sans MS, cursive'
                    }}>
                      {letter.content}
                    </p>
                  </div>
                </motion.div>

                {/* Letter Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-post-blue" />
                      <span className="font-medium">From</span>
                    </div>
                    <p className="text-gray-600">Pincode: {letter.senderId}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Mail className="w-4 h-4 text-post-red" />
                      <span className="font-medium">Status</span>
                    </div>
                    <p className="text-gray-600">
                      {letter.isDelivered ? 'Delivered' : 'In Transit'}
                    </p>
                  </div>
                </div>

                {/* Customization Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">Letter Customization</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Paper:</span>
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: letter.letterColor }}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Ink:</span>
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: letter.inkColor }}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Envelope:</span>
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: letter.envelopeColor }}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Stamp:</span>
                      <div
                        className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-xs"
                        style={{ backgroundColor: letter.stampColor }}
                      >
                        {getStampIcon(letter.stampDesign)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Font: {letter.handwritingFont}</span>
                      <span className="text-gray-600">Texture: {letter.paperTexture}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 
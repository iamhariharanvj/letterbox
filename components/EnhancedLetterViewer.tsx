'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { X, Mail, Clock, MapPin, User, FileText, Eye, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

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
  brushStrokes?: BrushStroke[]
}

interface BrushStroke {
  x: number
  y: number
  size: number
  color: string
  type: 'brush' | 'fingerprint' | 'lip' | 'text'
  id: string
  timestamp: number
  strokeId?: string
  isNewStroke?: boolean
}

interface EnhancedLetterViewerProps {
  letter: Letter
  onClose: () => void
}

export default function EnhancedLetterViewer({ letter, onClose }: EnhancedLetterViewerProps) {
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false)
  const [isLetterUnfolded, setIsLetterUnfolded] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [unfoldProgress, setUnfoldProgress] = useState(0)
  const [unfoldDirection, setUnfoldDirection] = useState<'left' | 'right' | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  
  const letterRef = useRef<HTMLDivElement>(null)

  const handleOpenEnvelope = async () => {
    // Mark as read if not already delivered
    if (!letter.isDelivered) {
      try {
        await fetch(`/api/letters/${letter.id}/deliver`, {
          method: 'POST',
        })
      } catch (error) {
        console.error('Error marking letter as delivered:', error)
      }
    }
    
    setIsEnvelopeOpen(true)
    setCurrentStep(2)
  }

  const handleUnfoldLetter = () => {
    setIsLetterUnfolded(true)
    setCurrentStep(3)
  }

  const handleSwipeUnfold = (event: any, info: PanInfo) => {
    const threshold = 100
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left'
      setUnfoldDirection(direction)
      handleUnfoldLetter()
    }
  }

  const handleStartReading = () => {
    setIsReading(true)
    setCurrentStep(4)
  }

  const handleReset = () => {
    setIsEnvelopeOpen(false)
    setIsLetterUnfolded(false)
    setIsReading(false)
    setUnfoldProgress(0)
    setUnfoldDirection(null)
    setCurrentStep(1)
  }

  const getUnfoldAnimation = () => {
    if (!isLetterUnfolded) return {}
    
    const baseRotation = unfoldDirection === 'right' ? -90 : 90
    return {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      transition: { duration: 1.5, ease: "easeInOut" }
    }
  }

  const getFontStyle = (fontType: string) => {
    switch (fontType) {
      case 'cursive':
        return 'font-cursive'
      case 'handwriting':
        return 'font-handwriting'
      case 'calligraphy':
        return 'font-calligraphy'
      case 'casual':
        return 'font-casual'
      default:
        return 'font-cursive'
    }
  }

  const getPaperStyle = (texture: string) => {
    switch (texture) {
      case 'textured':
        return 'paper-texture-textured'
      case 'linen':
        return 'paper-texture-linen'
      case 'kraft':
        return 'paper-texture-kraft'
      case 'vellum':
        return 'paper-texture-vellum'
      case 'embossed':
        return 'paper-texture-embossed'
      default:
        return ''
    }
  }

  const getTextureOverlay = (texture: string) => {
    switch (texture) {
      case 'textured':
        return 'radial-gradient(circle at 20% 80%, rgba(0,0,0,0.1) 0%, transparent 50%)'
      case 'linen':
        return 'linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)'
      case 'kraft':
        return 'radial-gradient(ellipse at center, rgba(139,69,19,0.1) 0%, transparent 70%)'
      case 'vellum':
        return 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%)'
      case 'embossed':
        return 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)'
      default:
        return 'none'
    }
  }

  const getStampIcon = (design: string) => {
    switch (design) {
      case 'classic': return '🏛️'
      case 'nature': return '🌿'
      case 'modern': return '⚡'
      case 'vintage': return '📜'
      case 'floral': return '🌸'
      case 'geometric': return '🔷'
      default: return '🏛️'
    }
  }

  const steps = [
    { id: 1, title: 'Envelope', description: 'Click to open envelope' },
    { id: 2, title: 'Folded Letter', description: 'Swipe to unfold letter' },
    { id: 3, title: 'Letter', description: 'Click to read content' },
    { id: 4, title: 'Reading', description: 'Enjoy your letter' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`bg-gray-900 rounded-lg shadow-2xl w-full flex flex-col overflow-hidden ${
          isReading ? 'max-w-full h-full' : 'max-w-6xl h-[90vh]'
        }`}
      >
        {/* Header */}
        {!isReading && (
          <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Letter Viewer</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      currentStep >= step.id ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-400'
                    }`}>
                      {step.id}
                    </div>
                    <span className={currentStep >= step.id ? 'text-blue-400' : 'text-gray-500'}>
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
              title="Reset to beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Letter Info */}
          {!isReading && (
            <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-white font-medium mb-4">Letter Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Title</label>
                    <p className="text-white font-medium">{letter.title}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">From</label>
                    <p className="text-white">Pincode: {letter.sender.pincode}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">To</label>
                    <p className="text-white">Pincode: {letter.receiver.pincode}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Delivery Date</label>
                    <p className="text-white">{new Date(letter.deliveryTime).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-4">Customization</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Paper</div>
                    <div className="w-6 h-6 rounded border-2 border-gray-600" style={{ backgroundColor: letter.letterColor }}></div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Ink</div>
                    <div className="w-6 h-6 rounded border-2 border-gray-600" style={{ backgroundColor: letter.inkColor }}></div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Envelope</div>
                    <div className="w-6 h-6 rounded border-2 border-gray-600" style={{ backgroundColor: letter.envelopeColor }}></div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Stamp</div>
                    <div className="w-6 h-6 rounded border-2 border-gray-600 flex items-center justify-center text-xs">
                      {getStampIcon(letter.stampDesign)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-4">Properties</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Font:</span>
                    <span className="text-white capitalize">{letter.handwritingFont}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Texture:</span>
                    <span className="text-white capitalize">{letter.paperTexture}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white capitalize">{letter.paperType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fold:</span>
                    <span className="text-white capitalize">{letter.foldStyle}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Center - Letter Display */}
          <div className={`flex-1 bg-gray-900 flex items-center justify-center ${
            isReading ? 'p-0' : 'p-8'
          }`}>
            <div className={`relative w-full ${
              isReading ? 'h-full' : 'max-w-2xl'
            }`}>
              {/* Step Instructions */}
              {!isReading && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium z-10">
                  {steps.find(s => s.id === currentStep)?.description}
                </div>
              )}

              {/* Envelope */}
              {!isEnvelopeOpen && (
                <motion.div
                  onClick={handleOpenEnvelope}
                  className="relative w-full aspect-[5/6] rounded-lg shadow-2xl cursor-pointer"
                  style={{ backgroundColor: letter.envelopeColor }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Mail className="w-16 h-16 text-white mx-auto mb-4" />
                      <p className="text-white text-lg font-medium">Click to open envelope</p>
                      <p className="text-white text-sm opacity-75 mt-2">From: {letter.sender.pincode}</p>
                    </div>
                  </div>
                  
                  {/* Envelope Flap */}
                  <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-gray-700 to-transparent rounded-t-lg"></div>
                </motion.div>
              )}

              {/* Folded Letter */}
              {isEnvelopeOpen && !isLetterUnfolded && (
                <motion.div
                  ref={letterRef}
                  drag="x"
                  dragConstraints={{ left: -50, right: 50 }}
                  onDragEnd={handleSwipeUnfold}
                  className="relative w-full aspect-[5/6] rounded-lg shadow-2xl cursor-grab active:cursor-grabbing"
                  style={{ backgroundColor: letter.letterColor }}
                  animate={getUnfoldAnimation()}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-600 text-sm">Swipe left or right to unfold</p>
                      <div className="flex items-center justify-center space-x-2 mt-2">
                        <ChevronLeft className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-500">Swipe</span>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Unfolded Letter */}
              {isLetterUnfolded && !isReading && (
                <motion.div
                  onClick={handleStartReading}
                  className="relative w-full aspect-[5/6] rounded-lg shadow-2xl cursor-pointer"
                  style={{ 
                    backgroundColor: letter.letterColor,
                    backgroundImage: getTextureOverlay(letter.paperTexture)
                  }}
                  initial={{ rotateX: 180, rotateY: unfoldDirection === 'right' ? -90 : 90, scale: 0.7 }}
                  animate={{ rotateX: 0, rotateY: 0, scale: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                  <div className="absolute inset-0 p-8">
                    <div className="h-full flex flex-col">
                      <div className="text-center mb-6">
                        <h1 className={`text-2xl font-bold ${getFontStyle(letter.handwritingFont)}`}
                            style={{ color: letter.inkColor }}>
                          {letter.title}
                        </h1>
                      </div>
                      
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <Eye className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-600 text-sm">Click to read letter</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Reading Mode */}
              {isReading && (
                <motion.div
                  className="relative w-full h-full rounded-lg shadow-2xl overflow-hidden"
                  style={{ 
                    backgroundColor: letter.letterColor,
                    backgroundImage: getTextureOverlay(letter.paperTexture)
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Canvas for Brush Strokes */}
                  {letter.brushStrokes && letter.brushStrokes.length > 0 && (
                    <canvas
                      className="absolute inset-0 w-full h-full z-10 pointer-events-none"
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
                            const strokeGroups: { [key: string]: BrushStroke[] } = {}
                            
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
                  
                  <div className="absolute inset-0 p-8 z-20">
                    {/* Close button for reading mode */}
                    <button
                      onClick={onClose}
                      className="absolute top-4 right-4 p-2 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 text-white rounded-lg transition-all duration-200 z-30"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    
                    <div className="h-full flex flex-col">
                      <div className="text-center mb-6 flex-shrink-0">
                        <h1 className={`text-2xl font-bold ${getFontStyle(letter.handwritingFont)}`}
                            style={{ color: letter.inkColor }}>
                          {letter.title}
                        </h1>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                        <div className={`text-lg leading-relaxed ${getFontStyle(letter.handwritingFont)} ${getPaperStyle(letter.paperTexture)} whitespace-pre-wrap`}
                             style={{ color: letter.inkColor }}>
                          {letter.content}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 
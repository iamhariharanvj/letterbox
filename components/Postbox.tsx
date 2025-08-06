'use client'

import { motion } from 'framer-motion'
import { Mail, Package, Clock, Palette, Send, X } from 'lucide-react'

interface PostboxCustomization {
  color: string
  stickers: StickerData[]
  decorations: DecorationData[]
  pattern: string
  glow: boolean
}

interface StickerData {
  id: string
  type: string
  x: number
  y: number
  rotation: number
  scale: number
}

interface DecorationData {
  id: string
  type: string
  x: number
  y: number
  color: string
}

interface PostboxProps {
  onCheckMail: () => void
  isChecking: boolean
  letterCount: number
  unreadCount: number
  customization?: PostboxCustomization
  onCustomize?: () => void
  isPosting?: boolean
  onPostboxClick?: () => void
  isZoomed?: boolean
  isDoorOpen?: boolean
  onLetterSelect?: (letterIndex: number) => void
}

export default function Postbox({ 
  onCheckMail, 
  isChecking, 
  letterCount, 
  unreadCount, 
  customization = {
    color: '#dc2626',
    stickers: [],
    decorations: [],
    pattern: 'solid',
    glow: false
  },
  onCustomize,
  isPosting = false,
  onPostboxClick,
  isZoomed = false,
  isDoorOpen = false,
  onLetterSelect
}: PostboxProps) {
  
  const getPatternStyle = (pattern: string, color: string) => {
    switch (pattern) {
      case 'stripes':
        return {
          background: `repeating-linear-gradient(45deg, ${color}, ${color} 10px, ${color}dd 10px, ${color}dd 20px)`
        }
      case 'polka':
        return {
          background: `radial-gradient(circle, ${color} 2px, transparent 2px)`,
          backgroundSize: '20px 20px'
        }
      case 'chevron':
        return {
          background: `linear-gradient(45deg, ${color} 25%, transparent 25%), linear-gradient(-45deg, ${color} 25%, transparent 25%)`,
          backgroundSize: '20px 20px'
        }
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${color}, ${color}dd, ${color}bb)`
        }
      default:
        return { backgroundColor: color }
    }
  }

  const STICKERS = [
    { type: 'star', emoji: '⭐' },
    { type: 'heart', emoji: '❤️' },
    { type: 'flower', emoji: '🌸' },
    { type: 'moon', emoji: '🌙' },
    { type: 'sun', emoji: '☀️' },
    { type: 'rainbow', emoji: '🌈' },
    { type: 'butterfly', emoji: '🦋' },
    { type: 'cat', emoji: '🐱' },
    { type: 'dog', emoji: '🐶' },
    { type: 'unicorn', emoji: '🦄' },
    { type: 'rocket', emoji: '🚀' },
    { type: 'crown', emoji: '👑' }
  ]

  const DECORATIONS = [
    { type: 'sparkle', emoji: '✨' },
    { type: 'gem', emoji: '💎' },
    { type: 'ribbon', emoji: '🎀' },
    { type: 'balloon', emoji: '🎈' },
    { type: 'gift', emoji: '🎁' },
    { type: 'music', emoji: '🎵' }
  ]

  return (
    <div className="relative">
      {/* Background overlay when zoomed */}
      {isZoomed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onPostboxClick}
        />
      )}
      {/* Postbox Container */}
      <motion.div
        whileHover={!isZoomed ? { scale: 1.02 } : {}}
        animate={isZoomed ? { 
          scale: 1.5,
          zIndex: 50
        } : {
          scale: 1,
          zIndex: 1
        }}
        style={{ zIndex: isZoomed ? 50 : 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`postbox p-8 text-center relative overflow-hidden ${isZoomed ? 'cursor-default' : 'cursor-pointer hover:shadow-2xl'}`}
        onClick={onPostboxClick}
      >
        {/* Close button when zoomed */}
        {isZoomed && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={(e) => {
              e.stopPropagation()
              onPostboxClick?.()
            }}
            className="absolute top-2 right-2 z-50 p-2 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 text-white rounded-full transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}

        {/* Instruction text when zoomed but door not open */}
        {isZoomed && !isDoorOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium"
          >
            Click to open door
          </motion.div>
        )}
        {/* Postbox Design */}
        <div className="relative">
          {/* Main Postbox Body */}
          <div className="w-48 h-64 mx-auto relative">
            {/* Postbox Front */}
            <motion.div 
              className="absolute inset-0 rounded-lg border-4 border-gray-800 shadow-2xl"
              style={getPatternStyle(customization.pattern, customization.color)}
              animate={customization.glow ? {
                boxShadow: [
                  '0 0 20px rgba(255, 255, 255, 0.3)',
                  '0 0 40px rgba(255, 255, 255, 0.6)',
                  '0 0 20px rgba(255, 255, 255, 0.3)'
                ]
              } : {}}
              transition={customization.glow ? { duration: 2, repeat: Infinity } : {}}
            >
              {/* Mail Slot */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-gray-800 rounded-full"></div>
              
              {/* Postbox Door */}
              <motion.div 
                className="absolute bottom-4 left-4 right-4 h-32 rounded-lg border-2 border-gray-800 origin-bottom"
                style={{ backgroundColor: `${customization.color}dd` }}
                animate={isDoorOpen ? { 
                  rotateX: -90,
                  y: 20
                } : {
                  rotateX: 0,
                  y: 0
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                {/* Door Handle */}
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2 w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-800"></div>
              </motion.div>
              
              {/* LetterBox Sign */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded px-3 py-1 shadow-md">
                <span className="text-xs font-bold text-gray-800">LETTERS</span>
              </div>

              {/* Stickers */}
              {customization.stickers.map((sticker) => {
                const stickerData = STICKERS.find(s => s.type === sticker.type)
                return (
                  <motion.div
                    key={sticker.id}
                    className="absolute"
                    style={{
                      left: `${sticker.x}%`,
                      top: `${sticker.y}%`,
                      transform: `rotate(${sticker.rotation}deg) scale(${sticker.scale})`
                    }}
                    whileHover={{ scale: 1.2 }}
                  >
                    <span className="text-2xl">
                      {stickerData?.emoji}
                    </span>
                  </motion.div>
                )
              })}

              {/* Decorations */}
              {customization.decorations.map((decoration) => {
                const decorationData = DECORATIONS.find(d => d.type === decoration.type)
                return (
                  <motion.div
                    key={decoration.id}
                    className="absolute"
                    style={{
                      left: `${decoration.x}%`,
                      top: `${decoration.y}%`,
                      color: decoration.color
                    }}
                    whileHover={{ scale: 1.2 }}
                  >
                    <span className="text-xl">
                      {decorationData?.emoji}
                    </span>
                  </motion.div>
                )
              })}
            </motion.div>
            
            {/* Letters Inside (if any) */}
            {letterCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: isDoorOpen ? 1 : 0.3, 
                  y: isDoorOpen ? 0 : 20,
                  scale: isDoorOpen ? 1.2 : 1
                }}
                transition={{ duration: 0.5, delay: isDoorOpen ? 0.4 : 0 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              >
                <div className="flex flex-wrap justify-center items-end gap-1 max-w-20">
                  {Array.from({ length: Math.min(letterCount, 12) }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: 0, rotate: 0 }}
                      animate={{ 
                        y: isDoorOpen ? [0, -2, 0] : [0, -5, 0],
                        rotate: isDoorOpen ? [-2, 2, -2] : 0
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: i * 0.1,
                        ease: "easeInOut"
                      }}
                      className={`w-3 h-10 bg-paper-white rounded-sm shadow-sm border border-gray-200 ${
                        isDoorOpen && onLetterSelect ? 'cursor-pointer hover:scale-110' : ''
                      }`}
                      onClick={isDoorOpen && onLetterSelect ? () => onLetterSelect(i) : undefined}
                      whileHover={isDoorOpen && onLetterSelect ? { scale: 1.1, zIndex: 10 } : {}}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {/* Check Mail Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCheckMail}
            disabled={isChecking}
            className="btn-primary flex items-center justify-center space-x-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Checking Mail...</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>Check Mail</span>
              </>
            )}
          </motion.button>

          {/* Customize Button */}
          {onCustomize && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCustomize}
              className="btn-secondary flex items-center justify-center space-x-2 w-full"
            >
              <Palette className="w-4 h-4" />
              <span>Customize Postbox</span>
            </motion.button>
          )}
        </div>

        {/* Mail Statistics */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-3 shadow-md"
          >
            <div className="flex items-center justify-center space-x-2">
              <Package className="w-5 h-5 text-post-blue" />
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{letterCount}</div>
                <div className="text-xs text-gray-600">Total Letters</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-3 shadow-md"
          >
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-5 h-5 text-post-red" />
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{unreadCount}</div>
                <div className="text-xs text-gray-600">Unread</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Animation Effects */}
        {isChecking && (
          <>
            {/* Shake Animation */}
            <motion.div
              animate={{ x: [-5, 5, -5, 5, 0] }}
              transition={{ duration: 0.5, repeat: 4 }}
              className="absolute inset-0 pointer-events-none"
            />
            
            {/* Mail Drop Animation */}
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="absolute top-8 left-1/2 transform -translate-x-1/2"
            >
              <div className="w-8 h-12 bg-paper-white rounded-sm shadow-lg border border-gray-200"></div>
            </motion.div>
          </>
        )}

        {/* Posting Animation */}
        {isPosting && (
          <>
            {/* Postbox Zoom Effect */}
            <motion.div
              initial={{ scale: 1 }}
              animate={{ 
                scale: [1, 1.3, 1.1, 1]
              }}
              transition={{ 
                duration: 2.5,
                ease: "easeInOut"
              }}
              className="absolute inset-0 pointer-events-none"
            />

            {/* Letter Flying Animation */}
            <motion.div
              initial={{ x: -300, y: 200, opacity: 0, rotate: -45, scale: 0.5 }}
              animate={{ 
                x: [0, 0, 0],
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                rotate: [-45, 0, 0],
                scale: [0.5, 1, 0.8]
              }}
              transition={{ 
                duration: 2,
                ease: "easeInOut"
              }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-12 h-16 bg-paper-white rounded-sm shadow-lg border border-gray-200 flex items-center justify-center"
                >
                  <Send className="w-6 h-6 text-gray-600" />
                </motion.div>
              </div>
            </motion.div>

            {/* Letter Sliding into Postbox */}
            <motion.div
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.8 }}
              animate={{ 
                x: [0, 0, 0],
                y: [0, 50, 80],
                opacity: [0, 1, 0],
                scale: [0.8, 1, 0.6]
              }}
              transition={{ 
                duration: 1.5,
                delay: 1,
                ease: "easeInOut"
              }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-10 h-14 bg-paper-white rounded-sm shadow-lg border border-gray-200 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </motion.div>

            {/* Success Sparkles */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              className="absolute inset-0 pointer-events-none"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    opacity: 0,
                    scale: 0
                  }}
                  animate={{ 
                    x: Math.cos(i * Math.PI / 4) * 100,
                    y: Math.sin(i * Math.PI / 4) * 100,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 1,
                    delay: 2.5 + i * 0.1,
                    ease: "easeOut"
                  }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Background Decoration */}
      <div className="absolute -top-4 -left-4 w-8 h-8 bg-post-blue rounded-full opacity-20"></div>
      <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-post-green rounded-full opacity-20"></div>
      <div className="absolute top-1/2 -right-2 w-4 h-4 bg-stamp-gold rounded-full opacity-30"></div>
    </div>
  )
} 
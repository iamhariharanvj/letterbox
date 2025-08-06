'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Palette, Sticker, Sparkles, Save, RotateCcw } from 'lucide-react'

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

interface PostboxCustomizerProps {
  customization: PostboxCustomization
  onCustomizationChange: (customization: PostboxCustomization) => void
  onClose: () => void
}

const POSTBOX_COLORS = [
  { name: 'Classic Red', value: '#dc2626' },
  { name: 'Ocean Blue', value: '#2563eb' },
  { name: 'Forest Green', value: '#16a34a' },
  { name: 'Sunset Orange', value: '#ea580c' },
  { name: 'Royal Purple', value: '#7c3aed' },
  { name: 'Golden Yellow', value: '#ca8a04' },
  { name: 'Pink Rose', value: '#ec4899' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Slate Gray', value: '#475569' },
  { name: 'Amber', value: '#d97706' }
]

const STICKERS = [
  { type: 'star', emoji: '⭐', name: 'Star' },
  { type: 'heart', emoji: '❤️', name: 'Heart' },
  { type: 'flower', emoji: '🌸', name: 'Flower' },
  { type: 'moon', emoji: '🌙', name: 'Moon' },
  { type: 'sun', emoji: '☀️', name: 'Sun' },
  { type: 'rainbow', emoji: '🌈', name: 'Rainbow' },
  { type: 'butterfly', emoji: '🦋', name: 'Butterfly' },
  { type: 'cat', emoji: '🐱', name: 'Cat' },
  { type: 'dog', emoji: '🐶', name: 'Dog' },
  { type: 'unicorn', emoji: '🦄', name: 'Unicorn' },
  { type: 'rocket', emoji: '🚀', name: 'Rocket' },
  { type: 'crown', emoji: '👑', name: 'Crown' }
]

const DECORATIONS = [
  { type: 'sparkle', emoji: '✨', name: 'Sparkle' },
  { type: 'gem', emoji: '💎', name: 'Gem' },
  { type: 'ribbon', emoji: '🎀', name: 'Ribbon' },
  { type: 'balloon', emoji: '🎈', name: 'Balloon' },
  { type: 'gift', emoji: '🎁', name: 'Gift' },
  { type: 'music', emoji: '🎵', name: 'Music' }
]

const PATTERNS = [
  { name: 'Solid', value: 'solid' },
  { name: 'Stripes', value: 'stripes' },
  { name: 'Polka Dots', value: 'polka' },
  { name: 'Chevron', value: 'chevron' },
  { name: 'Gradient', value: 'gradient' }
]

export default function PostboxCustomizer({ customization, onCustomizationChange, onClose }: PostboxCustomizerProps) {
  const [activeTab, setActiveTab] = useState<'color' | 'stickers' | 'decorations' | 'effects'>('color')
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null)

  const addSticker = (stickerType: string) => {
    const newSticker: StickerData = {
      id: Date.now().toString(),
      type: stickerType,
      x: Math.random() * 60 + 20, // Random position
      y: Math.random() * 60 + 20,
      rotation: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.4
    }
    
    onCustomizationChange({
      ...customization,
      stickers: [...customization.stickers, newSticker]
    })
  }

  const removeSticker = (stickerId: string) => {
    onCustomizationChange({
      ...customization,
      stickers: customization.stickers.filter(s => s.id !== stickerId)
    })
  }

  const addDecoration = (decorationType: string) => {
    const newDecoration: DecorationData = {
      id: Date.now().toString(),
      type: decorationType,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    }
    
    onCustomizationChange({
      ...customization,
      decorations: [...customization.decorations, newDecoration]
    })
  }

  const removeDecoration = (decorationId: string) => {
    onCustomizationChange({
      ...customization,
      decorations: customization.decorations.filter(d => d.id !== decorationId)
    })
  }

  const resetCustomization = () => {
    onCustomizationChange({
      color: '#dc2626',
      stickers: [],
      decorations: [],
      pattern: 'solid',
      glow: false
    })
  }

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Customize Your Postbox</h2>
              <p className="text-sm text-gray-600">Make it uniquely yours!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Customization Tools */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Tab Navigation */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('color')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'color' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Palette className="w-4 h-4 inline mr-1" />
                  Colors
                </button>
                <button
                  onClick={() => setActiveTab('stickers')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'stickers' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Sticker className="w-4 h-4 inline mr-1" />
                  Stickers
                </button>
                <button
                  onClick={() => setActiveTab('decorations')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'decorations' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Decorations
                </button>
                <button
                  onClick={() => setActiveTab('effects')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'effects' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Effects
                </button>
              </div>

              {/* Color Tab */}
              {activeTab === 'color' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Postbox Color</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {POSTBOX_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => onCustomizationChange({ ...customization, color: color.value })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          customization.color === color.value 
                            ? 'border-blue-500 shadow-lg' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded mb-2"
                          style={{ backgroundColor: color.value }}
                        />
                        <span className="text-xs text-gray-700">{color.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-800">Pattern</h4>
                    <select
                      value={customization.pattern}
                      onChange={(e) => onCustomizationChange({ ...customization, pattern: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      {PATTERNS.map((pattern) => (
                        <option key={pattern.value} value={pattern.value}>
                          {pattern.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Stickers Tab */}
              {activeTab === 'stickers' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Add Stickers</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {STICKERS.map((sticker) => (
                      <button
                        key={sticker.type}
                        onClick={() => addSticker(sticker.type)}
                        className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-2xl mb-1">{sticker.emoji}</div>
                        <span className="text-xs text-gray-700">{sticker.name}</span>
                      </button>
                    ))}
                  </div>

                  {customization.stickers.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-800">Your Stickers</h4>
                      <div className="space-y-2">
                        {customization.stickers.map((sticker) => {
                          const stickerData = STICKERS.find(s => s.type === sticker.type)
                          return (
                            <div key={sticker.id} className="flex items-center justify-between p-2 bg-white rounded border">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{stickerData?.emoji}</span>
                                <span className="text-sm text-gray-700">{stickerData?.name}</span>
                              </div>
                              <button
                                onClick={() => removeSticker(sticker.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Decorations Tab */}
              {activeTab === 'decorations' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Add Decorations</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {DECORATIONS.map((decoration) => (
                      <button
                        key={decoration.type}
                        onClick={() => addDecoration(decoration.type)}
                        className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-2xl mb-1">{decoration.emoji}</div>
                        <span className="text-xs text-gray-700">{decoration.name}</span>
                      </button>
                    ))}
                  </div>

                  {customization.decorations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-800">Your Decorations</h4>
                      <div className="space-y-2">
                        {customization.decorations.map((decoration) => {
                          const decorationData = DECORATIONS.find(d => d.type === decoration.type)
                          return (
                            <div key={decoration.id} className="flex items-center justify-between p-2 bg-white rounded border">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{decorationData?.emoji}</span>
                                <span className="text-sm text-gray-700">{decorationData?.name}</span>
                              </div>
                              <button
                                onClick={() => removeDecoration(decoration.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Effects Tab */}
              {activeTab === 'effects' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Special Effects</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={customization.glow}
                        onChange={(e) => onCustomizationChange({ ...customization, glow: e.target.checked })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      <span className="text-gray-700">Glowing Effect</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Reset Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={resetCustomization}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset to Default</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 bg-gray-100 flex items-center justify-center p-8">
            <div className="relative">
              {/* Customized Postbox Preview */}
              <motion.div
                className="relative"
                animate={customization.glow ? {
                  boxShadow: [
                    '0 0 20px rgba(255, 255, 255, 0.3)',
                    '0 0 40px rgba(255, 255, 255, 0.6)',
                    '0 0 20px rgba(255, 255, 255, 0.3)'
                  ]
                } : {}}
                transition={customization.glow ? { duration: 2, repeat: Infinity } : {}}
              >
                <div className="w-48 h-64 mx-auto relative">
                  {/* Postbox Front */}
                  <div 
                    className="absolute inset-0 rounded-lg border-4 border-gray-800 shadow-2xl"
                    style={getPatternStyle(customization.pattern, customization.color)}
                  >
                    {/* Mail Slot */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-gray-800 rounded-full"></div>
                    
                    {/* Postbox Door */}
                    <div className="absolute bottom-4 left-4 right-4 h-32 rounded-lg border-2 border-gray-800"
                         style={{ backgroundColor: `${customization.color}dd` }}>
                      {/* Door Handle */}
                      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-800"></div>
                    </div>
                    
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
                          <span className="text-2xl cursor-pointer" onClick={() => removeSticker(sticker.id)}>
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
                          <span className="text-xl cursor-pointer" onClick={() => removeDecoration(decoration.id)}>
                            {decorationData?.emoji}
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Preview Label */}
              <div className="text-center mt-6">
                <h3 className="text-lg font-semibold text-gray-800">Preview</h3>
                <p className="text-sm text-gray-600">Your customized postbox</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Customization</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 
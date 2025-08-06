'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Stamp, RotateCcw } from 'lucide-react'

interface LetterFoldingProps {
  letterData: any
  onFoldComplete: () => void
  onStampComplete: () => void
}

export default function LetterFolding({ letterData, onFoldComplete, onStampComplete }: LetterFoldingProps) {
  const [isFolding, setIsFolding] = useState(false)
  const [isStamping, setIsStamping] = useState(false)
  const [foldProgress, setFoldProgress] = useState(0)
  const [foldStage, setFoldStage] = useState(0)
  const [stampPosition, setStampPosition] = useState({ x: 0, y: 0 })

  const handleFoldLetter = () => {
    setIsFolding(true)
    setFoldProgress(0)
    setFoldStage(0)
    
    // Animate folding through stages
    const stages = [
      { progress: 25, rotation: 90, scale: 0.95 },
      { progress: 50, rotation: 180, scale: 0.9 },
      { progress: 75, rotation: 270, scale: 0.85 },
      { progress: 100, rotation: 360, scale: 0.8 }
    ]
    
    stages.forEach((stage, index) => {
      setTimeout(() => {
        setFoldProgress(stage.progress)
        setFoldStage(index + 1)
        if (index === stages.length - 1) {
          setTimeout(() => {
            setIsFolding(false)
            onFoldComplete()
          }, 500)
        }
      }, index * 800)
    })
  }

  const handleStampLetter = () => {
    setIsStamping(true)
    
    // Random stamp position
    const x = Math.random() * 60 + 20 // 20-80%
    const y = Math.random() * 60 + 20 // 20-80%
    setStampPosition({ x, y })
    
    // Stamping animation
    setTimeout(() => {
      setIsStamping(false)
      onStampComplete()
    }, 1500)
  }

  const getStampIcon = (design: string) => {
    const stamps = {
      classic: '🏛️',
      nature: '🌿',
      modern: '⚡',
      vintage: '📜',
      floral: '🌸',
      geometric: '🔷'
    }
    return stamps[design as keyof typeof stamps] || '🏛️'
  }

  const getFoldAnimation = () => {
    const animations = {
      classic: {
        rotateY: foldStage * 90,
        scale: 1 - (foldStage * 0.05),
        z: foldStage * 10
      },
      accordion: {
        rotateX: foldStage * 45,
        scale: 1 - (foldStage * 0.03),
        z: foldStage * 5
      },
      triangular: {
        rotateZ: foldStage * 60,
        scale: 1 - (foldStage * 0.04),
        z: foldStage * 8
      },
      origami: {
        rotateY: foldStage * 90,
        rotateX: foldStage * 45,
        scale: 1 - (foldStage * 0.06),
        z: foldStage * 12
      }
    }
    return animations[letterData.foldStyle as keyof typeof animations] || animations.classic
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Fold & Stamp Your Letter</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Letter Preview with Folding */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Letter Preview</h4>
          
          <div className="relative w-full h-80 bg-white border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden perspective">
            <motion.div
              className="w-full h-full relative"
              style={{ 
                backgroundColor: letterData.letterColor,
                transformStyle: 'preserve-3d'
              }}
              animate={isFolding ? getFoldAnimation() : {}}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              {/* Letter Content */}
              <div className="p-4 h-full">
                <div className="text-sm" style={{
                  color: letterData.inkColor,
                  fontFamily: letterData.handwritingFont === 'cursive' ? 'cursive' : 
                             letterData.handwritingFont === 'handwriting' ? 'Brush Script MT, cursive' :
                             letterData.handwritingFont === 'calligraphy' ? 'Lucida Handwriting, cursive' :
                             'Comic Sans MS, cursive'
                }}>
                  {letterData.content.slice(0, 200)}...
                </div>
              </div>

              {/* Folding Lines */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-0 right-0 h-px bg-gray-400 opacity-30"></div>
                <div className="absolute top-2/3 left-0 right-0 h-px bg-gray-400 opacity-30"></div>
                <div className="absolute top-0 bottom-0 left-1/3 w-px bg-gray-400 opacity-30"></div>
                <div className="absolute top-0 bottom-0 left-2/3 w-px bg-gray-400 opacity-30"></div>
              </div>

              {/* Stamp Position */}
              <AnimatePresence>
                {stampPosition.x > 0 && (
                  <motion.div
                    className="absolute w-8 h-6 rounded border border-gray-400 flex items-center justify-center text-xs"
                    style={{ 
                      backgroundColor: letterData.stampColor,
                      left: `${stampPosition.x}%`,
                      top: `${stampPosition.y}%`
                    }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ 
                      scale: isStamping ? [0, 1.2, 1] : 1,
                      rotate: isStamping ? [0, 5, -5, 0] : 0
                    }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.5 }}
                  >
                    {getStampIcon(letterData.stampDesign)}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Folding Overlay */}
              {isFolding && (
                <motion.div
                  className="absolute inset-0 bg-blue-500 bg-opacity-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <motion.button
              type="button"
              onClick={handleFoldLetter}
              disabled={isFolding}
              className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FileText className="w-4 h-4" />
              <span>{isFolding ? 'Folding...' : 'Fold Letter'}</span>
            </motion.button>

            <motion.button
              type="button"
              onClick={handleStampLetter}
              disabled={isStamping}
              className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Stamp className="w-4 h-4" />
              <span>{isStamping ? 'Stamping...' : 'Stamp Letter'}</span>
            </motion.button>

            <motion.button
              type="button"
              onClick={() => {
                setFoldProgress(0)
                setFoldStage(0)
                setStampPosition({ x: 0, y: 0 })
              }}
              className="btn-secondary flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </motion.button>
          </div>

          {/* Folding Progress */}
          {isFolding && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-post-blue h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${foldProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          )}

          {/* Status Messages */}
          <div className="text-center text-sm text-gray-600">
            {isFolding && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-post-blue font-medium"
              >
                Folding stage {foldStage}/4...
              </motion.p>
            )}
            {isStamping && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-post-red font-medium"
              >
                Applying stamp...
              </motion.p>
            )}
          </div>
        </div>

        {/* Customization Options */}
        <div className="space-y-6">
          <h4 className="font-medium text-gray-800">Folding & Stamping Options</h4>

          {/* Fold Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fold Style
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'classic', label: 'Classic Fold', description: 'Traditional letter fold' },
                { value: 'accordion', label: 'Accordion Fold', description: 'Pleated fold style' },
                { value: 'triangular', label: 'Triangular Fold', description: 'Triangle envelope fold' },
                { value: 'origami', label: 'Origami Fold', description: 'Japanese origami style' }
              ].map((fold) => (
                <motion.button
                  key={fold.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    letterData.foldStyle === fold.value
                      ? 'border-post-blue bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg mb-1">📄</div>
                  <div className="text-sm font-medium">{fold.label}</div>
                  <div className="text-xs text-gray-600">{fold.description}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Stamp Design */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stamp Design
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'classic', label: 'Classic', icon: '🏛️', description: 'Traditional post office stamp' },
                { value: 'nature', label: 'Nature', icon: '🌿', description: 'Natural elements design' },
                { value: 'modern', label: 'Modern', icon: '⚡', description: 'Contemporary geometric design' },
                { value: 'vintage', label: 'Vintage', icon: '📜', description: 'Retro nostalgic design' },
                { value: 'floral', label: 'Floral', icon: '🌸', description: 'Beautiful flower design' },
                { value: 'geometric', label: 'Geometric', icon: '🔷', description: 'Modern geometric patterns' }
              ].map((design) => (
                <motion.button
                  key={design.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    letterData.stampDesign === design.value
                      ? 'border-post-blue bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{design.icon}</div>
                  <div className="text-sm font-medium">{design.label}</div>
                  <div className="text-xs text-gray-600">{design.description}</div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
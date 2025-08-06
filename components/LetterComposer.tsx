'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { X, Send, Palette, Clock, MapPin, Mail, Type, FileText, Stamp, Layers, Settings, Eye, RotateCcw, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Grid, Sliders, Brush, Image, Smile, Upload, Check } from 'lucide-react'
import { ChromePicker } from 'react-color'

interface LetterComposerProps {
  userPincode: string
  onClose: () => void
  onLetterSent: () => void
}

interface LetterData {
  title: string
  content: string
  receiverPincode: string
  receiverAddress: string
  deliveryTime: string
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
  customStamp?: string
  envelopeTexture: string
  brushStrokes: BrushStroke[]
}

interface BrushStroke {
  x: number
  y: number
  size: number
  color: string
  type: 'brush' | 'fingerprint' | 'lip' | 'text'
  id: string
  timestamp: number
  strokeId?: string // For grouping connected strokes
  isNewStroke?: boolean // For separating different strokes
}

export default function LetterComposer({ userPincode, onClose, onLetterSent }: LetterComposerProps) {
  const [letterData, setLetterData] = useState<LetterData>({
    title: '',
    content: '',
    receiverPincode: '',
    receiverAddress: '',
    deliveryTime: '1',
    letterColor: '#FEFEFE',
    envelopeColor: '#8B4513',
    stampColor: '#D97706',
    stampDesign: 'classic',
    envelopeDesign: 'standard',
    handwritingFont: 'cursive',
    inkColor: '#2D3748',
    paperTexture: 'smooth',
    paperType: 'standard',
    foldStyle: 'classic',
    envelopeTexture: 'smooth',
    brushStrokes: []
  })

  const [currentStage, setCurrentStage] = useState(1)
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isFolding, setIsFolding] = useState(false)
  const [isStamping, setIsStamping] = useState(false)
  const [foldProgress, setFoldProgress] = useState(0)
  const [foldStage, setFoldStage] = useState(0) // 0: not folded, 1: half width folded, 2: half height folded, 3: fully folded
  const [isInEnvelope, setIsInEnvelope] = useState(false)
  const [stampPosition, setStampPosition] = useState({ x: 50, y: 20 })
  const [isDraggingStamp, setIsDraggingStamp] = useState(false)
  const [brushSize, setBrushSize] = useState(3)
  const [brushColor, setBrushColor] = useState('#2D3748')
  const [brushStrokes, setBrushStrokes] = useState<BrushStroke[]>([])
  const [strokeHistory, setStrokeHistory] = useState<BrushStroke[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentStrokeId, setCurrentStrokeId] = useState<string>('')
  const [selectedTool, setSelectedTool] = useState<'brush' | 'fingerprint' | 'lip' | 'text'>('text')
  const [customStampFile, setCustomStampFile] = useState<File | null>(null)
  const [customStampPreview, setCustomStampPreview] = useState<string>('')
  const [tempColor, setTempColor] = useState<string>('')
  const [isPosting, setIsPosting] = useState(false)
  const [postProgress, setPostProgress] = useState(0)
  
  const letterRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize canvas when component mounts
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Set canvas size to match display size
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
        
        // Set initial canvas style
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
      }
    }
  }, [currentStage]) // Re-initialize when stage changes

  // Function to render brush strokes on a canvas
  const renderBrushStrokes = useCallback((canvas: HTMLCanvasElement, strokes: BrushStroke[]) => {
    const ctx = canvas.getContext('2d')
    if (ctx && strokes.length > 0) {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Group strokes by strokeId and type
      const strokeGroups: { [key: string]: BrushStroke[] } = {}
      
      strokes.forEach((stroke) => {
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
          // Realistic fingerprint effect with natural imperfections
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          
          // Render each stroke individually for realistic texture
          strokeGroup.forEach((stroke) => {
            // Add natural variation to alpha for realistic appearance
            const alphaVariation = 0.6 + Math.random() * 0.3
            ctx.globalAlpha = alphaVariation
            
            // Create realistic fingerprint dot with natural variation
            ctx.beginPath()
            ctx.arc(stroke.x, stroke.y, stroke.size * 0.6, 0, Math.PI * 2)
            ctx.fillStyle = stroke.color
            ctx.fill()
            
            // Add subtle outline for depth
            ctx.globalAlpha = alphaVariation * 0.5
            ctx.lineWidth = 1
            ctx.strokeStyle = stroke.color
            ctx.stroke()
          })
          
          ctx.globalAlpha = 1.0
        } else if (firstStroke.type === 'lip') {
          // Realistic lip print effect with natural lipstick texture
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          
          // Render each stroke individually for realistic lipstick texture
          strokeGroup.forEach((stroke) => {
            // Add natural variation to alpha for realistic lipstick appearance
            const alphaVariation = 0.5 + Math.random() * 0.4
            ctx.globalAlpha = alphaVariation
            
            // Create realistic lipstick dot with natural variation
            ctx.beginPath()
            ctx.arc(stroke.x, stroke.y, stroke.size * 0.8, 0, Math.PI * 2)
            ctx.fillStyle = stroke.color
            ctx.fill()
            
            // Add lipstick texture with multiple layers
            const textureLayers = 2
            for (let layer = 1; layer <= textureLayers; layer++) {
              ctx.globalAlpha = alphaVariation * (0.3 / layer)
              ctx.beginPath()
              ctx.arc(stroke.x, stroke.y, stroke.size * (0.8 + layer * 0.2), 0, Math.PI * 2)
              ctx.fillStyle = stroke.color
              ctx.fill()
            }
            
            // Add subtle highlight for realistic lipstick shine
            ctx.globalAlpha = alphaVariation * 0.8
            ctx.beginPath()
            ctx.arc(stroke.x - stroke.size * 0.2, stroke.y - stroke.size * 0.2, stroke.size * 0.3, 0, Math.PI * 2)
            ctx.fillStyle = stroke.color
            ctx.fill()
          })
          
          ctx.globalAlpha = 1.0
        } else {
          // Regular brush - connected path
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
      
      ctx.globalAlpha = 1.0 // Reset alpha
    }
  }, [])

  // Draw brush strokes on canvas
  useEffect(() => {
    if (canvasRef.current && brushStrokes.length > 0) {
      const canvas = canvasRef.current
      // Set canvas size to match display size
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      renderBrushStrokes(canvas, brushStrokes)
    }
  }, [brushStrokes, renderBrushStrokes])

  // Re-render brush strokes when stage changes
  useEffect(() => {
    if (canvasRef.current && brushStrokes.length > 0) {
      // Small delay to ensure canvas is properly sized
      setTimeout(() => {
        const canvas = canvasRef.current
        if (canvas) {
          canvas.width = canvas.offsetWidth
          canvas.height = canvas.offsetHeight
          renderBrushStrokes(canvas, brushStrokes)
        }
      }, 100)
    }
  }, [currentStage, brushStrokes, renderBrushStrokes])

  // Debug: Log brush strokes when they change
  useEffect(() => {
    console.log('Brush strokes updated:', brushStrokes.length, brushStrokes)
  }, [brushStrokes])

  // Debug: Log letter data when it changes
  useEffect(() => {
    console.log('Letter data updated - Title:', letterData.title, 'Content:', letterData.content)
  }, [letterData.title, letterData.content])

  // Add to history when stroke is completed
  useEffect(() => {
    if (brushStrokes.length > 0 && !isDrawing) {
      addToHistory(brushStrokes)
    }
  }, [isDrawing])

  // Update letter data when brush strokes change
  useEffect(() => {
    setLetterData(prev => ({ ...prev, brushStrokes: brushStrokes }))
  }, [brushStrokes])

  // Undo function
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setBrushStrokes(strokeHistory[newIndex] || [])
    }
  }

  // Redo function
  const redo = () => {
    if (historyIndex < strokeHistory.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setBrushStrokes(strokeHistory[newIndex] || [])
    }
  }

  // Add stroke to history
  const addToHistory = (strokes: BrushStroke[]) => {
    const newHistory = strokeHistory.slice(0, historyIndex + 1)
    newHistory.push([...strokes])
    setStrokeHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  // Create new stroke
  const createStroke = (x: number, y: number, isNewStroke: boolean = false): BrushStroke => ({
    x,
    y,
    size: brushSize,
    color: brushColor,
    type: selectedTool,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    strokeId: currentStrokeId,
    isNewStroke
  })

  // Generate perfect oval thumb shape with realistic fingerprint pattern
  const generateFingerprintPattern = (x: number, y: number, size: number): BrushStroke[] => {
    const strokes: BrushStroke[] = []
    const centerX = x
    const centerY = y
    const width = size * 6  // Oval width
    const height = size * 4 // Oval height
    
    // Create perfect oval thumb shape with fingerprint ridges
    const ovalPoints = 100
    
    for (let i = 0; i < ovalPoints; i++) {
      const t = i / ovalPoints
      const angle = t * Math.PI * 2
      
      // Create perfect oval shape
      const ovalX = centerX + width * Math.cos(angle)
      const ovalY = centerY + height * Math.sin(angle)
      
      // Add fingerprint ridges along the oval
      const ridgeCount = 8
      for (let ridge = 0; ridge < ridgeCount; ridge++) {
        const ridgeOffset = (ridge - ridgeCount/2) * size * 0.3
        const ridgeAngle = angle + Math.sin(angle * 3) * 0.1
        
        const ridgeX = ovalX + Math.cos(ridgeAngle + Math.PI/2) * ridgeOffset
        const ridgeY = ovalY + Math.sin(ridgeAngle + Math.PI/2) * ridgeOffset
        
        // Add natural variation to ridge size
        const sizeVariation = 0.8 + Math.random() * 0.4
        
        strokes.push({
          x: ridgeX,
          y: ridgeY,
          size: size * 0.6 * sizeVariation,
          color: brushColor,
          type: 'fingerprint',
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          strokeId: currentStrokeId
        })
      }
    }
    
    // Add center fingerprint whorl pattern
    const whorlPoints = 30
    for (let i = 0; i < whorlPoints; i++) {
      const angle = (i / whorlPoints) * Math.PI * 2
      const whorlRadius = size * 1.2 + Math.sin(angle * 5) * size * 0.4
      
      const strokeX = centerX + Math.cos(angle) * whorlRadius
      const strokeY = centerY + Math.sin(angle) * whorlRadius
      
      strokes.push({
        x: strokeX,
        y: strokeY,
        size: size * 0.7 + Math.random() * size * 0.3,
        color: brushColor,
        type: 'fingerprint',
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        strokeId: currentStrokeId
      })
    }
    
    // Add fingerprint texture dots within the oval
    const texturePoints = 40
    for (let i = 0; i < texturePoints; i++) {
      const randomAngle = Math.random() * Math.PI * 2
      const randomRadius = Math.random() * width * 0.6
      
      const textureX = centerX + Math.cos(randomAngle) * randomRadius
      const textureY = centerY + Math.sin(randomAngle) * randomRadius * 0.7
      
      strokes.push({
        x: textureX,
        y: textureY,
        size: size * 0.3 + Math.random() * size * 0.4,
        color: brushColor,
        type: 'fingerprint',
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        strokeId: currentStrokeId
      })
    }
    
    return strokes
  }

  // Generate perfect kiss shape lip print pattern
  const generateLipPrintPattern = (x: number, y: number, size: number): BrushStroke[] => {
    const strokes: BrushStroke[] = []
    const centerX = x
    const centerY = y
    const width = size * 7
    const height = size * 4
    
    // Create perfect kiss shape with realistic lip contours
    const lipPoints = 120
    
    // Upper lip - perfect cupid's bow kiss shape
    for (let i = 0; i <= lipPoints / 2; i++) {
      const t = i / (lipPoints / 2)
      const angle = t * Math.PI
      
      // Create perfect cupid's bow for kiss shape
      const cupidBow = Math.sin(angle * 2) * 0.5
      const kissCurve = Math.sin(angle * 3) * 0.2
      
      const lipX = centerX + width * Math.cos(angle) * (1 - cupidBow + kissCurve)
      const lipY = centerY - height * Math.sin(angle) * (1 - cupidBow) * 1.2
      
      // Create perfect kiss contour with consistent thickness
      const thickness = 5
      for (let j = 0; j < thickness; j++) {
        const offset = (j - thickness/2) * size * 0.12
        const sizeVariation = 0.9 + Math.random() * 0.2
        
        strokes.push({
          x: lipX + offset,
          y: lipY,
          size: size * (1.4 - j * 0.08) * sizeVariation,
          color: brushColor,
          type: 'lip',
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          strokeId: currentStrokeId
        })
      }
    }
    
    // Lower lip - perfect full kiss shape
    for (let i = 0; i <= lipPoints / 2; i++) {
      const t = i / (lipPoints / 2)
      const angle = t * Math.PI
      
      // Create perfect full lower lip for kiss shape
      const fullness = Math.sin(angle) * 0.6
      const kissCurve = Math.cos(angle * 2) * 0.1
      
      const lipX = centerX + width * Math.cos(angle) * (1 - fullness + kissCurve)
      const lipY = centerY + height * Math.sin(angle) * (1 - fullness) * 2.2
      
      // Create perfect kiss contour with consistent thickness
      const thickness = 6
      for (let j = 0; j < thickness; j++) {
        const offset = (j - thickness/2) * size * 0.1
        const sizeVariation = 0.95 + Math.random() * 0.1
        
        strokes.push({
          x: lipX + offset,
          y: lipY,
          size: size * (1.8 - j * 0.06) * sizeVariation,
          color: brushColor,
          type: 'lip',
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          strokeId: currentStrokeId
        })
      }
    }
    
    // Add perfect kiss texture with lipstick patterns
    const texturePoints = 60
    for (let i = 0; i < texturePoints; i++) {
      const t = i / texturePoints
      const angle = t * Math.PI * 2
      
      // Create perfect texture within kiss shape
      const textureRadius = (0.3 + Math.sin(angle * 5) * 0.12) * width
      const textureX = centerX + Math.cos(angle) * textureRadius
      const textureY = centerY + Math.sin(angle) * textureRadius * 0.8
      
      strokes.push({
        x: textureX,
        y: textureY,
        size: size * 0.8 + Math.random() * size * 0.3,
        color: brushColor,
        type: 'lip',
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        strokeId: currentStrokeId
      })
    }
    
    // Add perfect kiss highlights
    const highlightPoints = 25
    for (let i = 0; i < highlightPoints; i++) {
      const t = i / highlightPoints
      const angle = t * Math.PI * 2
      
      // Create perfect highlight pattern for kiss
      const highlightRadius = (0.2 + Math.sin(angle * 4) * 0.06) * width
      const highlightX = centerX + Math.cos(angle) * highlightRadius
      const highlightY = centerY + Math.sin(angle) * highlightRadius * 0.6
      
      strokes.push({
        x: highlightX,
        y: highlightY,
        size: size * (1.0 + Math.random() * 0.3),
        color: brushColor,
        type: 'lip',
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        strokeId: currentStrokeId
      })
    }
    
    // Add perfect kiss smudges for realistic effect
    const smudgePoints = 20
    for (let i = 0; i < smudgePoints; i++) {
      const randomAngle = Math.random() * Math.PI * 2
      const randomRadius = Math.random() * width * 0.7
      
      const smudgeX = centerX + Math.cos(randomAngle) * randomRadius
      const smudgeY = centerY + Math.sin(randomAngle) * randomRadius * 0.9
      
      strokes.push({
        x: smudgeX,
        y: smudgeY,
        size: size * (0.4 + Math.random() * 0.5),
        color: brushColor,
        type: 'lip',
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        strokeId: currentStrokeId
      })
    }
    
    return strokes
  }

  // Clear brush strokes
  const clearBrushStrokes = () => {
    setBrushStrokes([])
    setStrokeHistory([])
    setHistoryIndex(-1)
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  const deliveryOptions = [
    { value: '0.0042', label: '15 Seconds', description: 'Instant mail' },
    { value: '0.0208', label: '30 Minutes', description: 'Quick delivery' },
    { value: '0.0417', label: '1 Hour', description: 'Ultra fast delivery' },
    { value: '0.5', label: '12 Hours', description: 'Same day delivery' },
    { value: '1', label: '1 Day', description: 'Express delivery' },
    { value: '2', label: '2 Days', description: 'Standard delivery' },
    { value: '3', label: '3 Days', description: 'Regular delivery' },
    { value: '7', label: '1 Week', description: 'Economy delivery' },
    { value: '14', label: '2 Weeks', description: 'Slow delivery' }
  ]

  const stampDesigns = [
    { value: 'classic', label: 'Classic', icon: '🏛️', description: 'Traditional post office stamp' },
    { value: 'nature', label: 'Nature', icon: '🌿', description: 'Natural elements design' },
    { value: 'modern', label: 'Modern', icon: '⚡', description: 'Contemporary geometric design' },
    { value: 'vintage', label: 'Vintage', icon: '📜', description: 'Retro nostalgic design' },
    { value: 'floral', label: 'Floral', icon: '🌸', description: 'Beautiful flower design' },
    { value: 'geometric', label: 'Geometric', icon: '🔷', description: 'Modern geometric patterns' },
    { value: 'custom', label: 'Custom', icon: '🎨', description: 'Upload your own design' }
  ]

  const envelopeDesigns = [
    { value: 'standard', label: 'Standard', icon: '✉️' },
    { value: 'elegant', label: 'Elegant', icon: '💎' },
    { value: 'casual', label: 'Casual', icon: '📝' },
    { value: 'premium', label: 'Premium', icon: '👑' }
  ]

  const handwritingFonts = [
    { value: 'cursive', label: 'Elegant Cursive', preview: 'Beautiful handwriting' },
    { value: 'handwriting', label: 'Natural Hand', preview: 'Natural handwriting' },
    { value: 'calligraphy', label: 'Calligraphy', preview: 'Artistic calligraphy' },
    { value: 'casual', label: 'Casual Script', preview: 'Relaxed handwriting' }
  ]

  const paperTextures = [
    { value: 'smooth', label: 'Smooth', description: 'Premium smooth paper', texture: 'none' },
    { value: 'textured', label: 'Textured', description: 'Slightly textured paper', texture: 'dots' },
    { value: 'linen', label: 'Linen', description: 'Linen finish paper', texture: 'lines' },
    { value: 'kraft', label: 'Kraft', description: 'Natural kraft paper', texture: 'kraft' },
    { value: 'vellum', label: 'Vellum', description: 'Translucent vellum paper', texture: 'vellum' },
    { value: 'embossed', label: 'Embossed', description: 'Embossed pattern paper', texture: 'embossed' }
  ]

  const envelopeTextures = [
    { value: 'smooth', label: 'Smooth', description: 'Classic smooth envelope', texture: 'none' },
    { value: 'textured', label: 'Textured', description: 'Slightly textured envelope', texture: 'dots' },
    { value: 'patterned', label: 'Patterned', description: 'Decorative pattern envelope', texture: 'pattern' },
    { value: 'leather', label: 'Leather', description: 'Luxury leather envelope', texture: 'leather' },
    { value: 'metallic', label: 'Metallic', description: 'Shiny metallic envelope', texture: 'metallic' }
  ]

  const paperTypes = [
    { value: 'standard', label: 'Standard Paper', description: 'Regular writing paper' },
    { value: 'premium', label: 'Premium Paper', description: 'High-quality paper' },
    { value: 'parchment', label: 'Parchment', description: 'Ancient parchment style' },
    { value: 'cotton', label: 'Cotton Paper', description: 'Luxury cotton paper' }
  ]

  const foldStyles = [
    { value: 'classic', label: 'Classic Fold', description: 'Traditional letter fold' },
    { value: 'accordion', label: 'Accordion Fold', description: 'Pleated fold style' },
    { value: 'triangular', label: 'Triangular Fold', description: 'Triangle envelope fold' },
    { value: 'origami', label: 'Origami Fold', description: 'Japanese origami style' }
  ]

  const brushSizes = [1, 2, 3, 5, 8, 12, 16, 20]

  const lipstickColors = [
    { name: 'Classic Red', color: '#DC143C' },
    { name: 'Deep Rose', color: '#B22222' },
    { name: 'Coral Pink', color: '#FF6B6B' },
    { name: 'Berry', color: '#8B0000' },
    { name: 'Nude', color: '#DEB887' },
    { name: 'Hot Pink', color: '#FF1493' },
    { name: 'Burgundy', color: '#800020' },
    { name: 'Orange Red', color: '#FF4500' }
  ]

  const handlePostLetter = () => {
    setIsPosting(true)
    setPostProgress(0)
    
    // Simulate posting progress
    const interval = setInterval(() => {
      setPostProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          // Complete posting and send letter
          handleSubmit()
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!letterData.title || !letterData.content || !letterData.receiverPincode) {
      alert('Please fill in all required fields')
      return
    }

    setIsSending(true)
    try {
      // Calculate delivery time in seconds (the value is in days, so convert properly)
      // For 15 seconds: 0.0042 days * 24 * 60 * 60 = 15 seconds
      const deliveryDays = parseFloat(letterData.deliveryTime)
      const deliverySeconds = deliveryDays * 24 * 60 * 60 // Convert days to seconds
      const deliveryDate = new Date()
      deliveryDate.setSeconds(deliveryDate.getSeconds() + deliverySeconds)

      const requestBody = {
        ...letterData,
        senderPincode: userPincode,
        deliveryTime: deliveryDate.toISOString(),
        deliverySeconds: deliverySeconds, // Add this for API reference
      }
      
      console.log('Sending letter with brush strokes:', requestBody.brushStrokes?.length || 0)
      console.log('Sending letter with title:', requestBody.title)
      console.log('Sending letter with content:', requestBody.content)
      console.log('Delivery time:', deliveryDate.toISOString())
      console.log('Delivery seconds:', deliverySeconds)
      
      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Letter sent successfully:', result)
        onLetterSent()
        onClose()
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to send letter')
      }
    } catch (error) {
      console.error('Error sending letter:', error)
      alert(`Failed to send letter: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSending(false)
      setIsPosting(false)
    }
  }

  const handleColorChange = (color: any, type: string) => {
    if (type === 'brushColor') {
      setBrushColor(color.hex)
    } else {
      setTempColor(color.hex)
    }
  }

  const handleApplyColor = () => {
    if (showColorPicker && showColorPicker !== 'brushColor') {
      setLetterData(prev => ({
        ...prev,
        [showColorPicker]: tempColor
      }))
    }
    setShowColorPicker(null)
    setTempColor('')
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if ((selectedTool === 'brush' || selectedTool === 'fingerprint' || selectedTool === 'lip') && canvasRef.current) {
      setIsDrawing(true)
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Generate new stroke ID for this drawing session
      const newStrokeId = Math.random().toString(36).substr(2, 9)
      setCurrentStrokeId(newStrokeId)
      
      if (selectedTool === 'fingerprint') {
        // Create realistic fingerprint pattern
        const fingerprintStrokes = generateFingerprintPattern(x, y, brushSize)
        setBrushStrokes(prev => [...prev, ...fingerprintStrokes])
      } else if (selectedTool === 'lip') {
        // Create realistic lip print pattern
        const lipStrokes = generateLipPrintPattern(x, y, brushSize)
        setBrushStrokes(prev => [...prev, ...lipStrokes])
      } else {
        // Regular brush - add initial point
        const newStroke = createStroke(x, y, true)
        setBrushStrokes(prev => [...prev, newStroke])
      }
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing && selectedTool === 'brush' && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Add point to current stroke (only for brush, not for prints)
      const newStroke = createStroke(x, y, false)
      setBrushStrokes(prev => [...prev, newStroke])
    }
  }

  const handleCanvasMouseUp = () => {
    setIsDrawing(false)
  }

  const handleFoldLetter = () => {
    setIsFolding(true)
    setFoldProgress(0)
    setFoldStage(1)
    
    // First fold (half)
    setTimeout(() => {
      setFoldStage(2)
      setTimeout(() => {
        setIsFolding(false)
        setCurrentStage(3)
      }, 500)
    }, 800)
  }

  const handleSwipeFold = (event: any, info: PanInfo) => {
    const horizontalDistance = Math.abs(info.offset.x)
    const verticalDistance = Math.abs(info.offset.y)
    const swipeThreshold = 100
    
    if (foldStage === 0 && horizontalDistance > swipeThreshold) {
      // Horizontal swipe for horizontal fold
      setFoldStage(1)
      setIsFolding(true)
      setTimeout(() => {
        setIsFolding(false)
      }, 1000)
    } else if (foldStage === 1 && verticalDistance > swipeThreshold) {
      // Vertical swipe for vertical fold
      setFoldStage(2)
      setIsFolding(true)
      setTimeout(() => {
        setIsFolding(false)
        setCurrentStage(3) // Move to envelope stage
      }, 1000)
    }
  }

  const handleInsertInEnvelope = () => {
    setIsInEnvelope(true)
    setTimeout(() => {
      setCurrentStage(4)
    }, 1000)
  }

  const handleStampDrag = (event: any, info: PanInfo) => {
    if (letterRef.current) {
      const rect = letterRef.current.getBoundingClientRect()
      const x = ((info.point.x - rect.left) / rect.width) * 100
      const y = ((info.point.y - rect.top) / rect.height) * 100
      setStampPosition({ x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCustomStampFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCustomStampPreview(e.target?.result as string)
        setLetterData(prev => ({ ...prev, stampDesign: 'custom' }))
      }
      reader.readAsDataURL(file)
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

  const getEnvelopeTextureOverlay = (texture: string) => {
    switch (texture) {
      case 'textured':
        return 'radial-gradient(circle at 20% 20%, rgba(0,0,0,0.15) 1px, transparent 1px), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.15) 1px, transparent 1px)'
      case 'patterned':
        return 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%)'
      case 'leather':
        return 'radial-gradient(circle at 25% 25%, rgba(139,69,19,0.2) 3px, transparent 3px), radial-gradient(circle at 75% 75%, rgba(139,69,19,0.2) 3px, transparent 3px)'
      case 'metallic':
        return 'linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)'
      default:
        return 'none'
    }
  }

  const getFoldAnimation = (stage: number) => {
    switch (stage) {
      case 1:
        return { 
          rotateY: 180, 
          scaleX: 0.5, 
          transformOrigin: 'left center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }
      case 2:
        return { 
          rotateY: 180, 
          rotateX: 180,
          scaleX: 0.5, 
          scaleY: 0.5,
          transformOrigin: 'left center',
          boxShadow: '0 15px 40px rgba(0,0,0,0.4)'
        }
      default:
        return {}
    }
  }

  const getStampIcon = (design: string) => {
    if (design === 'custom' && customStampPreview) {
      return customStampPreview
    }
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

  const stages = [
    { id: 1, title: 'Write Letter', description: 'Write content and paint with brush' },
    { id: 2, title: 'Fold Letter', description: 'Swipe to fold the letter' },
    { id: 3, title: 'Insert in Envelope', description: 'Slide letter into envelope' },
    { id: 4, title: 'Customize Envelope', description: 'Address envelope and place stamp' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 w-full h-full flex flex-col overflow-hidden rounded-lg"
      >
        {/* Header */}
        <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Letter Composer</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                {stages.map((stage, index) => (
                  <div key={stage.id} className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      currentStage >= stage.id ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-400'
                    }`}>
                      {stage.id}
                    </div>
                    <span className={currentStage >= stage.id ? 'text-blue-400' : 'text-gray-500'}>
                      {stage.title}
                    </span>
                    {index < stages.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Tools */}
          <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <div className="p-4">
              {/* Stage 1: Letter Writing */}
              {currentStage === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white font-medium mb-3">Letter Writing Tools</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Writing Tools</label>
                        <div className="flex space-x-2 mb-3">
                          <button
                            onClick={() => setSelectedTool('text')}
                            className={`p-2 rounded-lg ${selectedTool === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}`}
                            title="Text Mode"
                          >
                            <Type className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedTool('brush')}
                            className={`p-2 rounded-lg ${selectedTool === 'brush' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}`}
                            title="Brush Tool"
                          >
                            <Brush className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedTool('fingerprint')}
                            className={`p-2 rounded-lg ${selectedTool === 'fingerprint' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}`}
                            title="Fingerprint Tool"
                          >
                            <div className="w-4 h-4 text-center text-xs">👆</div>
                          </button>
                          <button
                            onClick={() => setSelectedTool('lip')}
                            className={`p-2 rounded-lg ${selectedTool === 'lip' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}`}
                            title="Lip Imprint Tool"
                          >
                            <div className="w-4 h-4 text-center text-xs">💋</div>
                          </button>
                        </div>

                        {/* Undo/Redo Controls */}
                        <div className="flex space-x-2 mb-3">
                          <button
                            onClick={undo}
                            disabled={historyIndex <= 0}
                            className={`p-2 rounded-lg ${historyIndex > 0 ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                            title="Undo"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={redo}
                            disabled={historyIndex >= strokeHistory.length - 1}
                            className={`p-2 rounded-lg ${historyIndex < strokeHistory.length - 1 ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                            title="Redo"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {(selectedTool === 'brush' || selectedTool === 'fingerprint' || selectedTool === 'lip') && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">
                                {selectedTool === 'fingerprint' ? 'Fingerprint Size' : 
                                 selectedTool === 'lip' ? 'Lip Imprint Size' : 'Brush Size'}
                              </label>
                              <div className="flex space-x-1">
                                {brushSizes.map((size) => (
                                  <button
                                    key={size}
                                    onClick={() => setBrushSize(size)}
                                    className={`w-6 h-6 rounded-full border-2 ${
                                      brushSize === size ? 'border-blue-500 bg-blue-500' : 'border-gray-600 bg-gray-700'
                                    }`}
                                    style={{ width: `${size + 8}px`, height: `${size + 8}px` }}
                                  />
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs text-gray-400 mb-1">
                                {selectedTool === 'fingerprint' ? 'Fingerprint Color' : 
                                 selectedTool === 'lip' ? 'Lipstick Color' : 'Brush Color'}
                              </label>
                              
                              {selectedTool === 'lip' ? (
                                // Lipstick color palette
                                <div className="space-y-2">
                                  <div className="grid grid-cols-4 gap-1">
                                    {lipstickColors.map((lipstick) => (
                                      <button
                                        key={lipstick.color}
                                        onClick={() => setBrushColor(lipstick.color)}
                                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                                          brushColor === lipstick.color 
                                            ? 'border-white scale-110' 
                                            : 'border-gray-600 hover:border-gray-400'
                                        }`}
                                        style={{ backgroundColor: lipstick.color }}
                                        title={lipstick.name}
                                      />
                                    ))}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className="w-8 h-8 rounded-lg border-2 border-gray-600 cursor-pointer"
                                      style={{ backgroundColor: brushColor }}
                                      onClick={() => setShowColorPicker('brushColor')}
                                    />
                                    <span className="text-gray-400 text-xs">Custom Color</span>
                                  </div>
                                </div>
                              ) : (
                                // Regular color picker for other tools
                                <div className="flex items-center space-x-2">
                                  <div
                                    className="w-8 h-8 rounded-lg border-2 border-gray-600 cursor-pointer"
                                    style={{ backgroundColor: brushColor }}
                                    onClick={() => setShowColorPicker('brushColor')}
                                  />
                                  <span className="text-gray-400 text-xs">{brushColor}</span>
                                </div>
                              )}
                            </div>

                            <div>
                              <button
                                onClick={clearBrushStrokes}
                                className="w-full bg-red-500 hover:bg-red-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
                              >
                                Clear Drawing
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Paper Customization</label>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Paper Color</label>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-8 h-8 rounded-lg border-2 border-gray-600 cursor-pointer"
                                style={{ backgroundColor: letterData.letterColor }}
                                onClick={() => setShowColorPicker('letterColor')}
                              />
                              <span className="text-gray-400 text-xs">{letterData.letterColor}</span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Paper Texture</label>
                            <div className="grid grid-cols-2 gap-2">
                              {paperTextures.map((texture) => (
                                <button
                                  key={texture.value}
                                  onClick={() => setLetterData(prev => ({ ...prev, paperTexture: texture.value }))}
                                  className={`p-2 rounded-lg border text-center transition-all ${
                                    letterData.paperTexture === texture.value
                                      ? 'border-green-500 bg-green-500 bg-opacity-20'
                                      : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                                  }`}
                                >
                                  <div className="text-xs text-white">{texture.label}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Ink Color</label>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-8 h-8 rounded-lg border-2 border-gray-600 cursor-pointer"
                                style={{ backgroundColor: letterData.inkColor }}
                                onClick={() => setShowColorPicker('inkColor')}
                              />
                              <span className="text-gray-400 text-xs">{letterData.inkColor}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Instructions</label>
                        <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-3">
                          <p className="text-blue-300 text-sm">
                            <strong>Text Mode:</strong> Click on the letter to type title and content directly on the paper.
                          </p>
                          <p className="text-blue-300 text-sm mt-2">
                            <strong>Brush Mode:</strong> Paint and draw on the letter with different brush sizes and colors.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage 2: Folding Instructions */}
              {currentStage === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white font-medium mb-3">Fold Letter</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4">
                        <p className="text-blue-300 text-sm">
                          Swipe left or right on the letter to fold it into an envelope
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-400 text-sm">
                          <ChevronLeft className="w-4 h-4" />
                          <span>Swipe Left</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400 text-sm">
                          <ChevronRight className="w-4 h-4" />
                          <span>Swipe Right</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage 3: Insert in Envelope */}
              {currentStage === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white font-medium mb-3">Insert in Envelope</h3>
                    <div className="space-y-4">
                      <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-4">
                        <p className="text-green-300 text-sm">
                          Click the button below to slide the letter into the envelope
                        </p>
                      </div>
                      
                      <button
                        onClick={handleInsertInEnvelope}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Insert Letter in Envelope
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage 4: Envelope & Stamp */}
              {currentStage === 4 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white font-medium mb-3">Envelope & Stamp</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Receiver Pincode</label>
                        <input
                          type="text"
                          value={letterData.receiverPincode}
                          onChange={(e) => setLetterData(prev => ({ ...prev, receiverPincode: e.target.value }))}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="6-digit pincode"
                          maxLength={6}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Receiver Address</label>
                        <textarea
                          value={letterData.receiverAddress}
                          onChange={(e) => setLetterData(prev => ({ ...prev, receiverAddress: e.target.value }))}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                          placeholder="Full address..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Envelope Color</label>
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-10 h-10 rounded-lg border-2 border-gray-600 cursor-pointer"
                            style={{ backgroundColor: letterData.envelopeColor }}
                            onClick={() => setShowColorPicker('envelopeColor')}
                          />
                          <span className="text-gray-400 text-sm">{letterData.envelopeColor}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Stamp Design</label>
                        <div className="grid grid-cols-2 gap-2">
                          {stampDesigns.map((design) => (
                            <button
                              key={design.value}
                              onClick={() => setLetterData(prev => ({ ...prev, stampDesign: design.value }))}
                              className={`p-3 rounded-lg border text-center transition-all ${
                                letterData.stampDesign === design.value
                                  ? 'border-purple-500 bg-purple-500 bg-opacity-20'
                                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                              }`}
                            >
                              <div className="text-2xl mb-1">{design.icon}</div>
                              <div className="text-sm text-white">{design.label}</div>
                              <div className="text-xs text-gray-400">{design.description}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {letterData.stampDesign === 'custom' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Upload Custom Stamp</label>
                          <div className="space-y-3">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
                            >
                              <Upload className="w-6 h-6 mx-auto mb-2" />
                              <span className="text-sm">Click to upload image</span>
                            </button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            {customStampPreview && (
                              <div className="w-16 h-16 mx-auto border-2 border-gray-600 rounded-lg overflow-hidden">
                                <img src={customStampPreview} alt="Custom stamp" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Stamp Color</label>
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-10 h-10 rounded-lg border-2 border-gray-600 cursor-pointer"
                            style={{ backgroundColor: letterData.stampColor }}
                            onClick={() => setShowColorPicker('stampColor')}
                          />
                          <span className="text-gray-400 text-sm">{letterData.stampColor}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Delivery Time</label>
                        <div className="space-y-2">
                          {deliveryOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => setLetterData(prev => ({ ...prev, deliveryTime: option.value }))}
                              className={`w-full p-3 rounded-lg border text-left transition-all ${
                                letterData.deliveryTime === option.value
                                  ? 'border-red-500 bg-red-500 bg-opacity-20'
                                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                              }`}
                            >
                              <div className="text-sm text-white">{option.label}</div>
                              <div className="text-xs text-gray-400">{option.description}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center - Canvas/Letter Display */}
          <div className="flex-1 bg-gray-900 flex items-center justify-center p-4">
            <div className="relative w-full max-w-xl">
              {/* Stage Instructions */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium z-10">
                {stages.find(s => s.id === currentStage)?.description}
              </div>

              {/* Stage 1: Letter Writing Canvas */}
              {currentStage === 1 && (
                <div className="relative w-full aspect-[5/6] rounded-lg shadow-2xl overflow-hidden"
                     style={{ 
                       backgroundColor: letterData.letterColor,
                       backgroundImage: getTextureOverlay(letterData.paperTexture)
                     }}>
                  <canvas
                    ref={canvasRef}
                    className={`absolute inset-0 w-full h-full z-10 ${
                      selectedTool === 'brush' || selectedTool === 'fingerprint' || selectedTool === 'lip' ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
                    }`}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                  />
                  
                  {/* Drawing Mode Indicator */}
                  {(selectedTool === 'brush' || selectedTool === 'fingerprint' || selectedTool === 'lip') && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium z-30">
                      {selectedTool === 'fingerprint' ? 'Fingerprint Mode' : 
                       selectedTool === 'lip' ? 'Lip Imprint Mode' : 'Brush Mode'} Active
                    </div>
                  )}
                  
                  {/* Brush Color & Size Indicator */}
                  {selectedTool === 'brush' && (
                    <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-80 text-white px-3 py-2 rounded-lg text-xs font-medium z-30">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full border border-white"
                          style={{ backgroundColor: brushColor }}
                        />
                        <span>Size: {brushSize}px</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Interactive Text Content - Only show in text mode */}
                  {selectedTool === 'text' && (
                    <div className="absolute inset-0 p-6 z-30 pointer-events-auto">
                      <div className="h-full flex flex-col">
                        <div className="text-center mb-4">
                          <input
                            type="text"
                            value={letterData.title}
                            onChange={(e) => setLetterData(prev => ({ ...prev, title: e.target.value }))}
                            className={`text-xl font-bold bg-transparent border-none outline-none text-center w-full cursor-text ${getFontStyle(letterData.handwritingFont)} ${getPaperStyle(letterData.paperTexture)}`}
                            style={{ color: letterData.inkColor }}
                            placeholder="Your Letter Title"
                            autoFocus
                          />
                        </div>
                        
                        <div className="flex-1 overflow-y-auto">
                          <textarea
                            value={letterData.content}
                            onChange={(e) => setLetterData(prev => ({ ...prev, content: e.target.value }))}
                            className={`w-full h-full bg-transparent border-none outline-none resize-none text-base leading-relaxed cursor-text ${getFontStyle(letterData.handwritingFont)} ${getPaperStyle(letterData.paperTexture)} scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent`}
                            style={{ color: letterData.inkColor }}
                            placeholder="Write your letter here..."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Letter Content Display with Brush Strokes - Only show when not in text mode */}
                  {selectedTool !== 'text' && (
                    <div className="absolute inset-0 p-6 z-20 pointer-events-none">
                      <div className="h-full flex flex-col">
                        <div className="text-center mb-4 flex-shrink-0">
                          <h1 className={`text-xl font-bold ${getFontStyle(letterData.handwritingFont)}`}
                              style={{ color: letterData.inkColor }}>
                            {letterData.title}
                          </h1>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                          <div className={`text-base leading-relaxed ${getFontStyle(letterData.handwritingFont)} whitespace-pre-wrap`}
                               style={{ color: letterData.inkColor }}>
                            {letterData.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stage 2: Folding Letter */}
              {currentStage === 2 && (
                <div className="space-y-4">
                  {/* Folding Instructions */}
                  <div className="text-center text-gray-600 mb-4">
                    {foldStage === 0 && (
                      <div className="space-y-2">
                        <p className="text-lg">Swipe left or right to fold horizontally (first fold)</p>
                        <div className="flex justify-center space-x-8">
                          <div className="flex items-center space-x-2 text-blue-500">
                            <ChevronLeft className="w-6 h-6 animate-pulse" />
                            <span className="text-sm">Swipe Left</span>
                          </div>
                          <div className="flex items-center space-x-2 text-blue-500">
                            <span className="text-sm">Swipe Right</span>
                            <ChevronRight className="w-6 h-6 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    )}
                    {foldStage === 1 && (
                      <div className="space-y-2">
                        <p className="text-lg">Swipe up or down to fold vertically (second fold)</p>
                        <div className="flex justify-center space-x-8">
                          <div className="flex items-center space-x-2 text-green-500">
                            <ChevronUp className="w-6 h-6 animate-pulse" />
                            <span className="text-sm">Swipe Up</span>
                          </div>
                          <div className="flex items-center space-x-2 text-green-500">
                            <span className="text-sm">Swipe Down</span>
                            <ChevronDown className="w-6 h-6 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                <motion.div
                  ref={letterRef}
                  drag="x"
                  dragConstraints={{ left: -50, right: 50 }}
                  onDragEnd={handleSwipeFold}
                  className="relative w-full aspect-[5/6] rounded-lg shadow-2xl cursor-grab active:cursor-grabbing"
                  style={{ 
                    backgroundColor: letterData.letterColor,
                    backgroundImage: getTextureOverlay(letterData.paperTexture)
                  }}
                  animate={getFoldAnimation(foldStage)}
                  transition={{ duration: 1.0, ease: "easeInOut" }}
                >
                  {/* Canvas for Brush Strokes */}
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                  />
                  
                  <div className="absolute inset-0 p-6 z-20">
                    <div className="h-full flex flex-col">
                      <div className="text-center mb-4 flex-shrink-0">
                        <h1 className={`text-xl font-bold ${getFontStyle(letterData.handwritingFont)}`}
                            style={{ color: letterData.inkColor }}>
                          {letterData.title}
                        </h1>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                        <div className={`text-base leading-relaxed ${getFontStyle(letterData.handwritingFont)} whitespace-pre-wrap`}
                             style={{ color: letterData.inkColor }}>
                          {letterData.content}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                </div>
              )}

              {/* Stage 3: Insert in Envelope */}
              {currentStage === 3 && (
                                  <div className="relative w-full aspect-[5/6] rounded-lg shadow-2xl overflow-hidden">
                  {/* Envelope */}
                  <div className="absolute inset-0 rounded-lg shadow-2xl"
                       style={{ backgroundColor: letterData.envelopeColor }}>
                    <div className="absolute inset-0 p-8">
                      <div className="text-center text-white">
                        <Mail className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-lg">Envelope</p>
                        <p className="text-sm text-gray-300 mt-2">Swipe down to insert letter</p>
                      </div>
                    </div>
                  </div>

                  {/* Folded Letter sliding down */}
                  <motion.div
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 200 }}
                    dragElastic={0.1}
                    onDragEnd={(event, info) => {
                      if (info.offset.y > 100) {
                        setIsInEnvelope(true)
                        setTimeout(() => {
                          setCurrentStage(4)
                        }, 1000)
                      }
                    }}
                    animate={isInEnvelope ? { y: '100%', opacity: 0 } : { y: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-lg shadow-2xl cursor-grab active:cursor-grabbing"
                    style={{ 
                      backgroundColor: letterData.letterColor,
                      backgroundImage: getTextureOverlay(letterData.paperTexture)
                    }}
                  >
                    {/* Apply folded letter animation */}
                    <motion.div
                      animate={getFoldAnimation(foldStage)}
                      transition={{ duration: 1.0, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      {/* Canvas for Brush Strokes */}
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                      />
                      
                      <div className="absolute inset-0 p-6 z-20">
                        <div className="h-full flex flex-col">
                          <div className="text-center mb-4 flex-shrink-0">
                            <h1 className={`text-xl font-bold ${getFontStyle(letterData.handwritingFont)}`}
                                style={{ color: letterData.inkColor }}>
                              {letterData.title}
                            </h1>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                            <div className={`text-base leading-relaxed ${getFontStyle(letterData.handwritingFont)} whitespace-pre-wrap`}
                                 style={{ color: letterData.inkColor }}>
                              {letterData.content}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Folded letter visual indicator */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-gray-800 bg-opacity-50 rounded flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-sm"></div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Stage 4: Envelope with Address */}
              {currentStage === 4 && (
                <div className="space-y-4">
                  {/* Envelope Customization Tools */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-4">Envelope Customization</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Envelope Color */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Envelope Color</label>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-8 h-8 rounded border-2 border-white cursor-pointer"
                            style={{ backgroundColor: letterData.envelopeColor }}
                            onClick={() => setShowColorPicker('envelopeColor')}
                          />
                          <span className="text-gray-400 text-sm">{letterData.envelopeColor}</span>
                        </div>
                      </div>
                      
                      {/* Envelope Texture */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Envelope Texture</label>
                        <select
                          value={letterData.envelopeTexture}
                          onChange={(e) => setLetterData(prev => ({ ...prev, envelopeTexture: e.target.value }))}
                          className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                        >
                          {envelopeTextures.map((texture) => (
                            <option key={texture.value} value={texture.value}>
                              {texture.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Envelope Display */}
                  <div className="relative w-full aspect-[3/2] rounded-lg shadow-2xl overflow-hidden"
                       style={{ 
                         backgroundColor: letterData.envelopeColor,
                         backgroundImage: getEnvelopeTextureOverlay(letterData.envelopeTexture)
                       }}>
                    {/* Envelope Flap */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-700 to-transparent opacity-60"></div>
                    
                    {/* Envelope Seals */}
                    <div className="absolute top-2 left-2 w-3 h-3 bg-red-500 rounded-full opacity-80"></div>
                    <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full opacity-80"></div>
                    
                    {/* Address Area with Better Design */}
                    <div className="absolute top-12 left-6 right-6 bottom-6">
                      {/* Address Lines */}
                      <div className="space-y-4">
                        <div className="h-0.5 bg-white opacity-40"></div>
                        <div className="h-0.5 bg-white opacity-40"></div>
                        <div className="h-0.5 bg-white opacity-40"></div>
                        <div className="h-0.5 bg-white opacity-40"></div>
                      </div>
                      
                      {/* Direct Address Input on Envelope */}
                      <div className="absolute top-0 left-0 right-0 text-white text-sm space-y-3">
                        <input
                          type="text"
                          value={letterData.receiverAddress}
                          onChange={(e) => setLetterData(prev => ({ ...prev, receiverAddress: e.target.value }))}
                          placeholder="Enter recipient address"
                          className="w-full bg-transparent border-none outline-none text-white text-sm placeholder-gray-400 font-medium"
                        />
                        <input
                          type="text"
                          value={letterData.receiverPincode}
                          onChange={(e) => setLetterData(prev => ({ ...prev, receiverPincode: e.target.value }))}
                          placeholder="Enter pincode"
                          className="w-full bg-transparent border-none outline-none text-white text-sm placeholder-gray-400 font-medium"
                        />
                      </div>
                    </div>

                    {/* Draggable Stamp */}
                    <motion.div
                      drag
                      dragMomentum={false}
                      onDrag={handleStampDrag}
                      className="absolute w-12 h-12 cursor-grab active:cursor-grabbing z-10"
                      style={{
                        left: `${stampPosition.x}%`,
                        top: `${stampPosition.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <div
                        className="w-full h-full rounded border border-white flex items-center justify-center text-white font-bold text-xs shadow-lg"
                        style={{ backgroundColor: letterData.stampColor }}
                      >
                        {letterData.stampDesign === 'custom' && customStampPreview ? (
                          <img src={customStampPreview} alt="Custom stamp" className="w-full h-full object-cover rounded" />
                        ) : (
                          getStampIcon(letterData.stampDesign)
                        )}
                      </div>
                    </motion.div>
                    
                    {/* Envelope Shadow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent pointer-events-none"></div>
                  </div>
                </div>
              )}

              {/* Stage 5: Posting Letter */}
              {currentStage === 5 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-white text-xl font-medium mb-2">Post Your Letter</h3>
                    <p className="text-gray-400">Swipe your letter into the postbox to send it</p>
                  </div>

                  {/* Postbox and Letter Scene */}
                  <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-blue-900 to-blue-700 rounded-lg shadow-2xl overflow-hidden">
                    {/* Postbox */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          boxShadow: [
                            '0 0 20px rgba(255, 255, 255, 0.3)',
                            '0 0 40px rgba(255, 255, 255, 0.6)',
                            '0 0 20px rgba(255, 255, 255, 0.3)'
                          ]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-32 h-40 bg-red-600 rounded-lg border-4 border-gray-800 shadow-2xl relative"
                      >
                        {/* Mail Slot */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-gray-800 rounded-full"></div>
                        
                        {/* Drop Zone Indicator */}
                        <motion.div
                          animate={{ 
                            opacity: [0.3, 0.7, 0.3],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="absolute top-2 left-1/2 transform -translate-x-1/2 w-20 h-6 border-2 border-dashed border-white rounded-lg opacity-50"
                        />
                        
                        {/* Postbox Door */}
                        <div className="absolute bottom-4 left-4 right-4 h-32 rounded-lg border-2 border-gray-800 bg-red-700">
                          {/* Door Handle */}
                          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-800"></div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Letter to be Posted */}
                    <motion.div
                      drag
                      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                      dragElastic={0.1}
                      onDragEnd={(event, info) => {
                        // Check if letter is near postbox slot
                        const target = event.target as HTMLElement
                        const container = target.closest('.relative')
                        if (container) {
                          const rect = container.getBoundingClientRect()
                          const postboxSlot = { 
                            x: rect.width / 2, 
                            y: rect.height * 0.7 
                          }
                          const letterPosition = { 
                            x: info.point.x - rect.left, 
                            y: info.point.y - rect.top 
                          }
                          const distance = Math.sqrt(
                            Math.pow(postboxSlot.x - letterPosition.x, 2) + 
                            Math.pow(postboxSlot.y - letterPosition.y, 2)
                          )
                          
                          if (distance < 80) {
                            handlePostLetter()
                          }
                        }
                      }}
                      className="absolute top-8 left-8 w-16 h-20 bg-paper-white rounded-sm shadow-lg border border-gray-200 cursor-grab active:cursor-grabbing z-10"
                      whileHover={{ scale: 1.05 }}
                      whileDrag={{ scale: 1.1, zIndex: 50 }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <Mail className="w-6 h-6 text-gray-600" />
                      </div>
                    </motion.div>

                    {/* Posting Progress */}
                    {isPosting && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-full"
                      >
                        <div className="flex items-center space-x-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          <span>Posting letter... {postProgress}%</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Instructions */}
                    <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm">
                      <p>Drag the letter to the postbox slot</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="h-16 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>Delivery: {deliveryOptions.find(opt => opt.value === letterData.deliveryTime)?.label}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <MapPin className="w-4 h-4" />
              <span>To: {letterData.receiverPincode || 'Not set'}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentStage > 1 && (
              <button
                onClick={() => setCurrentStage(currentStage - 1)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
            )}
            
            {currentStage < 4 ? (
              <button
                onClick={() => setCurrentStage(currentStage + 1)}
                disabled={!letterData.title || !letterData.content}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : currentStage === 4 ? (
              <button
                onClick={() => setCurrentStage(5)}
                disabled={!letterData.title || !letterData.content || !letterData.receiverPincode}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Letter
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSending || isPosting || !letterData.title || !letterData.content || !letterData.receiverPincode}
                className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Sending...' : 'Send Letter'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Color Picker Modal */}
        <AnimatePresence>
          {showColorPicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowColorPicker(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="relative"
              >
                <ChromePicker
                  color={showColorPicker === 'brushColor' ? brushColor : tempColor || letterData[showColorPicker as keyof LetterData] as string}
                  onChange={(color) => handleColorChange(color, showColorPicker)}
                />
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => setShowColorPicker(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyColor}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
} 
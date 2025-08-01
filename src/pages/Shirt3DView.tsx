import { useEffect, useState, Suspense } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, Share2, RotateCcw } from 'lucide-react'
import { Shirt3D } from '@/components/Shirt3D'

interface ShirtData {
  prompt: string
  imageUrl?: string
  generatedAt?: string
}

type TexturePlacement = 'front' | 'back' | 'full-shirt'

export function Shirt3DView() {
  const navigate = useNavigate()
  const location = useLocation()
  const [shirtData, setShirtData] = useState<ShirtData | null>(null)
  const [texturePlacement, setTexturePlacement] = useState<TexturePlacement>('front')

  useEffect(() => {
    // Check if data was passed via router state
    if (location.state) {
      setShirtData(location.state as ShirtData)
    } else {
      // Fallback to localStorage for backward compatibility
      const stored = localStorage.getItem('shirtGenData')
      if (stored) {
        setShirtData(JSON.parse(stored))
      }
    }
  }, [location.state])

  if (!shirtData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="shadow-xl">
            <CardContent className="py-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Design Found</h2>
              <p className="text-gray-600 mb-8">Create your first shirt design to see it here.</p>
              <Button onClick={() => navigate('/')} size="lg">
                Create Design
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Design
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your 3D Shirt Design</h1>
            <p className="text-gray-600">Interactive 3D preview of your design</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 3D Canvas */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl h-96 lg:h-[600px]">
              <CardContent className="p-0 h-full">
                <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200">
                  <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                    <OrbitControls 
                      enablePan={true} 
                      enableZoom={true} 
                      enableRotate={true}
                      minDistance={0.5}
                      maxDistance={8}
                    />
                    <Environment preset="studio" />
                    <ambientLight intensity={0.3} />
                    <directionalLight position={[5, 5, 3]} intensity={0.4} />
                    <Suspense fallback={null}>
                      {shirtData.imageUrl && (
                        <Shirt3D 
                          imageUrl={shirtData.imageUrl} 
                          texturePlacement={texturePlacement}
                        />
                      )}
                    </Suspense>
                  </Canvas>
                </div>
              </CardContent>
            </Card>
            
            {/* Texture Placement Selector */}
            <Card className="shadow-lg mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Texture Placement</CardTitle>
                <CardDescription>Choose where to apply the design</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={texturePlacement === 'front' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTexturePlacement('front')}
                  >
                    Front Only
                  </Button>
                  <Button
                    variant={texturePlacement === 'back' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTexturePlacement('back')}
                  >
                    Back Only
                  </Button>
                  <Button
                    variant={texturePlacement === 'full-shirt' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTexturePlacement('full-shirt')}
                  >
                    Full Shirt
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 3D Controls Info */}
            <Card className="shadow-lg mt-4">
              <CardContent className="py-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    <span>Drag to rotate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🔍</span>
                    <span>Scroll to zoom</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✋</span>
                    <span>Right-click to pan</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Design Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Your Design Prompt</h4>
                  <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                    {shirtData.prompt}
                  </p>
                </div>
                
                {shirtData.generatedAt && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Created</h4>
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-md">
                      {new Date(shirtData.generatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>What would you like to do with your design?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full flex items-center gap-2" 
                  size="lg"
                  disabled={!shirtData.imageUrl}
                  onClick={() => {
                    if (shirtData.imageUrl) {
                      const link = document.createElement('a')
                      link.href = shirtData.imageUrl
                      link.download = `shirt_design_${Date.now()}.png`
                      link.click()
                    }
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download Design
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2" 
                  size="lg"
                  disabled={!shirtData.imageUrl}
                  onClick={() => {
                    if (shirtData.imageUrl && navigator.share) {
                      navigator.share({
                        title: 'ShirtGen 3D Design',
                        text: 'Check out this AI-generated 3D shirt design!',
                        url: window.location.href
                      })
                    } else if (shirtData.imageUrl) {
                      navigator.clipboard.writeText(window.location.href)
                      alert('Design URL copied to clipboard!')
                    }
                  }}
                >
                  <Share2 className="w-4 h-4" />
                  Share Design
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate('/')}
                >
                  Create New Design
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => navigate('/view')}
                >
                  View 2D Version
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
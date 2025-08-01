import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, Share2 } from 'lucide-react'

interface ShirtData {
  prompt: string
  imageUrl?: string
  generatedAt?: string
}

export function ViewPage() {
  const navigate = useNavigate()
  const [shirtData, setShirtData] = useState<ShirtData | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('shirtGenData')
    if (stored) {
      setShirtData(JSON.parse(stored))
    }
  }, [])

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
      <div className="max-w-4xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900">Your Shirt Design</h1>
            <p className="text-gray-600">AI-generated design ready to wear</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Design Preview */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Design Preview</CardTitle>
              <CardDescription>Your shirt design will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                {shirtData.imageUrl ? (
                  <img 
                    src={shirtData.imageUrl} 
                    alt={shirtData.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-lg shadow-md flex items-center justify-center">
                      <span className="text-2xl">👕</span>
                    </div>
                    <p className="text-sm">No design generated yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Design Details */}
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
                        title: 'ShirtGen Design',
                        text: 'Check out this AI-generated shirt design!',
                        url: shirtData.imageUrl
                      })
                    } else if (shirtData.imageUrl) {
                      navigator.clipboard.writeText(shirtData.imageUrl)
                      alert('Image URL copied to clipboard!')
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
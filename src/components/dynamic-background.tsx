import React, { useState, useEffect } from 'react'

interface DynamicBackgroundProps {
  children: React.ReactNode
  currentPage?: string
}

const UAE_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1734456061630-87babdefd904?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMGx1eHVyeSUyMHNreXNjcmFwZXIlMjBwcm9wZXJ0eXxlbnwxfHx8fDE3NTg5ODk5MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Dubai Luxury Skyscraper Property',
    category: 'modern'
  },
  {
    url: 'https://images.unsplash.com/photo-1636111505978-6a08217d7d36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBYnUlMjBEaGFiaSUyMG1vc3F1ZSUyMGhlcml0YWdlJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc1ODk4OTkxNnww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Abu Dhabi Mosque Heritage Architecture',
    category: 'heritage'
  },
  {
    url: 'https://images.unsplash.com/photo-1735320864239-798f9bd96c3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMG1hcmluYSUyMGx1eHVyeSUyMGFwYXJ0bWVudCUyMGJ1aWxkaW5nc3xlbnwxfHx8fDE3NTg5ODk5MjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Dubai Marina Luxury Apartment Buildings',
    category: 'modern'
  },
  {
    url: 'https://images.unsplash.com/photo-1592922453757-d4678cc9390a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxVQUUlMjB0cmFkaXRpb25hbCUyMGZvcnQlMjBoZXJpdGFnZXxlbnwxfHx8fDE3NTg5ODk5MjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'UAE Traditional Fort Heritage',
    category: 'heritage'
  },
  {
    url: 'https://images.unsplash.com/photo-1650728670975-062f36a97c1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTaGFyamFoJTIwaGVyaXRhZ2UlMjBhcmNoaXRlY3R1cmUlMjBidWlsZGluZ3xlbnwxfHx8fDE3NTg5ODk5MzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Sharjah Heritage Architecture Building',
    category: 'heritage'
  },
  {
    url: 'https://images.unsplash.com/photo-1698948684109-01de0994a832?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMENyZWVrJTIwbW9kZXJuJTIwZGV2ZWxvcG1lbnR8ZW58MXx8fHwxNzU4OTg5OTM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Dubai Creek Modern Development',
    category: 'modern'
  },
  {
    url: 'https://images.unsplash.com/photo-1686643878143-2936bf6c97eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxVQUUlMjB0cmFkaXRpb25hbCUyMHNvdWslMjBtYXJrZXQlMjBoZXJpdGFnZXxlbnwxfHx8fDE3NTg5ODk5NDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'UAE Traditional Souk Market Heritage',
    category: 'heritage'
  },
  {
    url: 'https://images.unsplash.com/photo-1743819455744-05417bf55cea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMGx1eHVyeSUyMHZpbGxhJTIwcHJvcGVydHl8ZW58MXx8fHwxNzU4OTg5OTQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Dubai Luxury Villa Property',
    category: 'modern'
  },
  {
    url: 'https://images.unsplash.com/photo-1712238743961-daf77526b15c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBbCUyMEFpbiUyMG9hc2lzJTIwaGVyaXRhZ2UlMjBVQUV8ZW58MXx8fHwxNzU4OTg5OTUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Al Ain Oasis Heritage UAE',
    category: 'heritage'
  },
  {
    url: 'https://images.unsplash.com/photo-1741115579711-e0cd179217c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMEZyYW1lJTIwYXJjaGl0ZWN0dXJhbCUyMGxhbmRtYXJrfGVufDF8fHx8MTc1ODk4OTk1NXww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Dubai Frame Architectural Landmark',
    category: 'modern'
  },
  {
    url: 'https://images.unsplash.com/photo-1735320864430-38153049e1e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMGJ1cmolMjBraGFsaWZhJTIwY2l0eXNjYXBlfGVufDF8fHx8MTc1ODk4ODQ4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Dubai Burj Khalifa Cityscape',
    category: 'modern'
  },
  {
    url: 'https://images.unsplash.com/photo-1677508398331-58597cd61618?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxVQUUlMjBwYWxtJTIwanVtZWlyYWglMjBhZXJpYWwlMjB2aWV3fGVufDF8fHx8MTc1ODk4ODQ5MXww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'UAE Palm Jumeirah Aerial View',
    category: 'modern'
  },
  {
    url: 'https://images.unsplash.com/photo-1628005926648-89d119e48b52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBYnUlMjBEaGFiaSUyMHNoZWlraCUyMHpheWVkJTIwbW9zcXVlfGVufDF8fHx8MTc1ODk4ODQ5NHww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Abu Dhabi Sheikh Zayed Mosque',
    category: 'heritage'
  },
  {
    url: 'https://images.unsplash.com/photo-1656515814596-100b90efe451?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxVQUUlMjBkZXNlcnQlMjBsYW5kc2NhcGUlMjBoZXJpdGFnZXxlbnwxfHx8fDE3NTg5ODg1MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'UAE Desert Landscape Heritage',
    category: 'heritage'
  },
  {
    url: 'https://images.unsplash.com/photo-1732360489182-4ecc94d72b7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMHNreXNjcmFwZXJzJTIwbW9kZXJuJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc1OTcyMzkzOHww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Dubai Modern Skyscrapers Architecture',
    category: 'modern'
  },
  {
    url: 'https://images.unsplash.com/photo-1607320874448-d33f052651e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxVQUUlMjB2aWxsYSUyMG1vZGVybiUyMHJlc2lkZW50aWFsJTIwcHJvcGVydHl8ZW58MXx8fHwxNzU5NzIzOTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'UAE Modern Residential Villa Property',
    category: 'modern'
  }
]

export function DynamicBackground({ children, currentPage }: DynamicBackgroundProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [nextImageIndex, setNextImageIndex] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set())

  // Get high-resolution version of the image URL with fallback
  const getHighResUrl = (url: string) => {
    try {
      // Use medium quality for better loading performance
      return url.replace('w=1080', 'w=1920').replace('q=80', 'q=85')
    } catch (error) {
      console.warn('Error processing image URL:', error)
      return url // Return original URL as fallback
    }
  }

  // Preload images to prevent lagging with timeout protection
  useEffect(() => {
    let isMounted = true
    
    const preloadImage = (url: string, timeout = 10000) => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        let resolved = false
        
        const handleResolve = () => {
          if (!resolved && isMounted) {
            resolved = true
            setPreloadedImages(prev => new Set(prev).add(url))
            resolve()
          }
        }
        
        const handleTimeout = () => {
          if (!resolved) {
            resolved = true
            // Silent timeout - don't warn, just resolve
            resolve()
          }
        }
        
        img.onload = handleResolve
        img.onerror = handleResolve
        
        // Set timeout to prevent hanging
        setTimeout(handleTimeout, timeout)
        
        try {
          img.src = getHighResUrl(url)
        } catch (error) {
          console.warn(`Error loading image: ${url}`, error)
          handleResolve()
        }
      })
    }

    // Preload first 3 images immediately with shorter timeout
    const imagesToPreload = UAE_IMAGES.slice(0, 3)
    Promise.all(imagesToPreload.map(img => preloadImage(img.url, 5000)))
      .catch(error => console.warn('Error preloading initial images:', error))

    // Preload remaining images in background with staggered loading
    setTimeout(() => {
      if (isMounted) {
        const remainingImages = UAE_IMAGES.slice(3)
        remainingImages.forEach((img, index) => {
          setTimeout(() => {
            if (isMounted) {
              preloadImage(img.url, 8000)
                .catch(error => console.warn(`Error preloading image ${img.url}:`, error))
            }
          }, index * 500) // Stagger by 500ms each
        })
      }
    }, 3000)
    
    return () => {
      isMounted = false
    }
  }, [])

  const transitionToNextImage = () => {
    if (isTransitioning) return // Prevent multiple transitions
    
    setIsTransitioning(true)
    
    // Use requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
      try {
        setTimeout(() => {
          setCurrentImageIndex(nextImageIndex)
          setNextImageIndex((nextImageIndex + 1) % UAE_IMAGES.length)
          setIsTransitioning(false)
        }, 600) // Faster transition for better performance
      } catch (error) {
        console.warn('Error during image transition:', error)
        setIsTransitioning(false)
      }
    })
  }

  // Auto-rotate every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        transitionToNextImage()
      }
    }, 20000)

    return () => clearInterval(interval)
  }, [nextImageIndex, isTransitioning])

  // Change image when page changes (with debouncing)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    if (currentPage && !isTransitioning) {
      // Debounce page changes to prevent rapid transitions
      timeoutId = setTimeout(() => {
        if (!isTransitioning) {
          transitionToNextImage()
        }
      }, 1000) // Increased debounce time to reduce conflicts
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [currentPage])

  const currentImage = UAE_IMAGES[currentImageIndex]
  const nextImage = UAE_IMAGES[nextImageIndex]

  return (
    <div className="relative min-h-screen">
      {/* Background Image Layer */}
      <div className="fixed inset-0 z-0">
        {/* Current Image */}
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ease-in-out transform-gpu ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3)), url(${getHighResUrl(currentImage.url)})`,
            willChange: 'opacity',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)'
          }}
        />
        
        {/* Next Image (for smooth transition) */}
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ease-in-out transform-gpu ${
            isTransitioning ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3)), url(${getHighResUrl(nextImage.url)})`,
            willChange: 'opacity',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)'
          }}
        />

        {/* Animated overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-amber-900/20 animate-pulse" 
             style={{ animationDuration: '8s' }} />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m0 40 40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/svg%3E")`
             }} />
      </div>

      {/* Image Info Overlay */}
      <div className="fixed bottom-4 left-4 z-10 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white/90 text-sm">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            currentImage.category === 'modern' ? 'bg-blue-400' : 'bg-amber-400'
          }`} />
          <span>{currentImage.title}</span>
        </div>
        <div className="flex items-center space-x-1 mt-1">
          {UAE_IMAGES.map((_, index) => (
            <div
              key={index}
              className={`w-1 h-1 rounded-full transition-all duration-300 ${
                index === currentImageIndex ? 'bg-white w-4' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 3D Floating Elements */}
      <div className="fixed inset-0 z-5 pointer-events-none overflow-hidden">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-white/10 rounded-full animate-bounce" 
             style={{ animationDelay: '0s', animationDuration: '6s' }} />
        <div className="absolute top-40 right-20 w-6 h-6 bg-blue-400/20 rounded-full animate-bounce" 
             style={{ animationDelay: '2s', animationDuration: '8s' }} />
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-amber-400/20 rounded-full animate-bounce" 
             style={{ animationDelay: '4s', animationDuration: '7s' }} />
        <div className="absolute bottom-60 right-10 w-5 h-5 bg-white/5 rounded-full animate-bounce" 
             style={{ animationDelay: '1s', animationDuration: '9s' }} />
        
        {/* Gradient orbs */}
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl animate-pulse" 
             style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full blur-xl animate-pulse" 
             style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Loading indicator during transitions */}
      {isTransitioning && (
        <div className="fixed top-4 right-4 z-20 bg-black/20 backdrop-blur-sm rounded-full p-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
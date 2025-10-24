import React, { useState, useEffect } from 'react'

interface DynamicBackgroundProps {
  children: React.ReactNode
  currentPage?: string
}

// 🔧 Helper: Determine background category based on page
const getCategoryForPage = (page?: string): 'modern' | 'heritage' => {
  if (!page) return 'modern'
  if (/heritage|culture|tradition/i.test(page)) return 'heritage'
  return 'modern'
}

// ✅ Enhanced: UAE Images with categories for filtering
const UAE_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1734456061630-87babdefd904?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMGx1eHVyeSUyMHNreXNjcmFwZXIlMjBwcm9wZXJ0eXxlbnwxfHx8fDE3NTg5ODk5MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Dubai Luxury Skyscraper Property',
    category: 'modern',
  },
  {
    url: 'https://images.unsplash.com/photo-1636111505978-6a08217d7d36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBYnUlMjBEaGFiaSUyMG1vc3F1ZSUyMGhlcml0YWdlJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc1ODk4OTkxNnww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Abu Dhabi Mosque Heritage Architecture',
    category: 'heritage',
  },
  {
    url: 'https://images.unsplash.com/photo-1735320864239-798f9bd96c3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMG1hcmluYSUyMGx1eHVyeSUyMGFwYXJ0bWVudCUyMGJ1aWxkaW5nc3xlbnwxfHx8fDE3NTg5ODk5MjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Dubai Marina Luxury Apartment Buildings',
    category: 'modern',
  },
  {
    url: 'https://images.unsplash.com/photo-1592922453757-d4678cc9390a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxVQUUlMjB0cmFkaXRpb25hbCUyMGZvcnQlMjBoZXJpdGFnZXxlbnwxfHx8fDE3NTg5ODk5MjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'UAE Traditional Fort Heritage',
    category: 'heritage',
  },
  {
    url: 'https://images.unsplash.com/photo-1650728670975-062f36a97c1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTaGFyamFoJTIwaGVyaXRhZ2UlMjBhcmNoaXRlY3R1cmUlMjBidWlsZGluZ3xlbnwxfHx8fDE3NTg5ODk5MzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Sharjah Heritage Architecture Building',
    category: 'heritage',
  },
  {
    url: 'https://images.unsplash.com/photo-1698948684109-01de0994a832?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMENyZWVrJTIwbW9kZXJuJTIwZGV2ZWxvcG1lbnR8ZW58MXx8fHwxNzU4OTg5OTM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Dubai Creek Modern Development',
    category: 'modern',
  },
  {
    url: 'https://images.unsplash.com/photo-1686643878143-2936bf6c97eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'UAE Traditional Souk Market Heritage',
    category: 'heritage',
  },
  {
    url: 'https://images.unsplash.com/photo-1712238743961-daf77526b15c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Al Ain Oasis Heritage UAE',
    category: 'heritage',
  },
  {
    url: 'https://images.unsplash.com/photo-1741115579711-e0cd179217c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Dubai Frame Architectural Landmark',
    category: 'modern',
  },
  {
    url: 'https://images.unsplash.com/photo-1735320864430-38153049e1e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Dubai Burj Khalifa Cityscape',
    category: 'modern',
  },
  {
    url: 'https://images.unsplash.com/photo-1677508398331-58597cd61618?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'UAE Palm Jumeirah Aerial View',
    category: 'modern',
  },
  {
    url: 'https://images.unsplash.com/photo-1628005926648-89d119e48b52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Abu Dhabi Sheikh Zayed Mosque',
    category: 'heritage',
  },
  {
    url: 'https://images.unsplash.com/photo-1656515814596-100b90efe451?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'UAE Desert Landscape Heritage',
    category: 'heritage',
  },
  {
    url: 'https://images.unsplash.com/photo-1732360489182-4ecc94d72b7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Dubai Modern Skyscrapers Architecture',
    category: 'modern',
  },
  {
    url: 'https://images.unsplash.com/photo-1607320874448-d33f052651e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'UAE Modern Residential Villa Property',
    category: 'modern',
  },
]

export function DynamicBackground({ children, currentPage }: DynamicBackgroundProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [nextImageIndex, setNextImageIndex] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set())
  const [fadeState, setFadeState] = useState<'fadeIn' | 'fadeOut'>('fadeIn')
  const [category, setCategory] = useState<'modern' | 'heritage'>(getCategoryForPage(currentPage))

  // Memoize filtered images for performance
  const filteredImages = React.useMemo(
    () => UAE_IMAGES.filter((img) => img.category === category),
    [category]
  )

  // Get high-resolution version of the image URL with safe fallback
  const getHighResUrl = (url: string) => {
    try {
      // If Unsplash query params present try to update width & quality
      if (url.includes('w=') || url.includes('q=')) {
        return url.replace(/w=\d+/g, 'w=1920').replace(/q=\d+/g, 'q=85')
      }
      // Soft fallback: append width param if possible
      if (!url.includes('?')) return `${url}?w=1920&q=85`
      return `${url}&w=1920&q=85`
    } catch (error) {
      console.warn('Error processing image URL:', error)
      return url
    }
  }

  // Robust image preloader with timeout and decode support
  useEffect(() => {
    let isMounted = true

    const preloadImage = (url: string, timeout = 10000) =>
      new Promise<void>((resolve) => {
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
            // silent fallback
            resolve()
          }
        }

        img.onload = async () => {
          try {
            // if decode is available, await it to ensure image is ready
            // @ts-ignore decode may exist on HTMLImageElement
            if (typeof img.decode === 'function') await img.decode()
          } catch (e) {
            // ignore decode errors
          } finally {
            handleResolve()
          }
        }
        img.onerror = handleResolve

        // safety timeout
        const to = setTimeout(handleTimeout, timeout)

        try {
          img.src = getHighResUrl(url)
        } catch (error) {
          console.warn(`Error loading image: ${url}`, error)
          handleResolve()
        }

        // cleanup for this promise if component unmounts
        const cleanup = () => {
          clearTimeout(to)
        }
        // returning cleanup not applicable here, but kept for clarity
      })

    const startPreload = async () => {
      try {
        // Preload first 3 immediately
        await Promise.all(filteredImages.slice(0, 3).map(img => preloadImage(img.url, 5000)))
        // Staggered preload for the rest
        filteredImages.slice(3).forEach((img, idx) => {
          setTimeout(() => {
            if (isMounted) preloadImage(img.url, 8000).catch(() => {})
          }, idx * 500)
        })
      } catch (e) {
        // swallow preload failures
        console.warn('Preload error:', e)
      }
    }

    if (filteredImages.length > 0) startPreload()

    return () => {
      isMounted = false
    }
  }, [filteredImages])


  // Ensure indexes remain valid if filteredImages length changes
  useEffect(() => {
    if (filteredImages.length === 0) return
    // clamp indexes
    setCurrentImageIndex((idx) => Math.min(idx, Math.max(0, filteredImages.length - 1)))
    setNextImageIndex((idx) => Math.min(idx, Math.max(0, filteredImages.length - 1)))
  }, [filteredImages.length])

  const transitionToNextImage = () => {
    if (isTransitioning || filteredImages.length <= 1) return

    setIsTransitioning(true)
    setFadeState('fadeOut')

    // Smooth transition scheduling; keep durations consistent with CSS
    requestAnimationFrame(() => {
      setTimeout(() => {
        setCurrentImageIndex(nextImageIndex)
        setNextImageIndex((nextImageIndex + 1) % filteredImages.length)
        setFadeState('fadeIn')
        setIsTransitioning(false)
      }, 600) // matches CSS transition duration
    })
  }

  // Auto-rotate every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) transitionToNextImage()
    }, 20000)

    return () => clearInterval(interval)
    // note: nextImageIndex intentionally not included to avoid rapid interval resets
  }, [isTransitioning, filteredImages.length])

  // Change category (and optionally rotate) when currentPage prop changes
  useEffect(() => {
    const newCategory = getCategoryForPage(currentPage)
    setCategory(newCategory)
    let timeoutId: NodeJS.Timeout | undefined

    if (!isTransitioning && filteredImages.length > 0) {
      timeoutId = setTimeout(() => {
        transitionToNextImage()
      }, 1000)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])


  const currentImage = filteredImages[currentImageIndex] ?? filteredImages[0]
  const nextImage = filteredImages[nextImageIndex] ?? filteredImages[(currentImageIndex + 1) % Math.max(1, filteredImages.length)]

  return (
    <div className="relative min-h-screen">
      {/* Background Image Layer */}
      <div className="fixed inset-0 z-0">
        {/* Current Image */}
        <div
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ease-in-out transform-gpu ${
            fadeState === 'fadeIn' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url(${getHighResUrl(currentImage.url)})`,
            willChange: 'opacity, transform',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)'
          }}
        />

        {/* Next Image for smooth transition */}
        <div
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ease-in-out transform-gpu ${
            fadeState === 'fadeOut' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url(${getHighResUrl(nextImage.url)})`,
            willChange: 'opacity, transform',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)'
          }}
        />

        {/* Animated overlay for subtle depth */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-amber-900/20 animate-pulse"
          style={{ animationDuration: '8s' }}
        />

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m0 40 40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Image Info Overlay */}
      <div className="fixed bottom-4 left-4 z-10 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white/90 text-sm">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              currentImage?.category === 'modern' ? 'bg-blue-400' : 'bg-amber-400'
            }`}
          />
          <span>{currentImage?.title ?? ''}</span>
        </div>
        <div className="flex items-center space-x-1 mt-1">
          {filteredImages.map((_, index) => (
            <div
              key={index}
              className={`w-1 h-1 rounded-full transition-all duration-300 ${
                index === currentImageIndex ? 'bg-white w-4' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 3D Floating Elements & Gradient Orbs */}
      <div className="fixed inset-0 z-5 pointer-events-none overflow-hidden">
        {[
          { x: 'top-20', y: 'left-10', w: 4, h: 4, color: 'bg-white/10', duration: 6, delay: 0 },
          { x: 'top-40', y: 'right-20', w: 6, h: 6, color: 'bg-blue-400/20', duration: 8, delay: 2 },
          { x: 'bottom-40', y: 'left-20', w: 3, h: 3, color: 'bg-amber-400/20', duration: 7, delay: 4 },
          { x: 'bottom-60', y: 'right-10', w: 5, h: 5, color: 'bg-white/5', duration: 9, delay: 1 },
        ].map((shape, idx) => (
          <div
            key={`shape-${idx}`}
            className={`absolute ${shape.x} ${shape.y} rounded-full ${shape.color} animate-bounce`}
            style={{
              width: `${shape.w}rem`,
              height: `${shape.h}rem`,
              animationDuration: `${shape.duration}s`,
              animationDelay: `${shape.delay}s`,
            }}
          />
        ))}

        {[
          { x: 'top-1/3', y: 'left-1/4', size: 32, from: 'from-blue-500/10', to: 'to-purple-500/10', duration: 4, delay: 0 },
          { x: 'bottom-1/3', y: 'right-1/4', size: 40, from: 'from-amber-500/10', to: 'to-orange-500/10', duration: 6, delay: 2 },
        ].map((orb, idx) => (
          <div
            key={`orb-${idx}`}
            className={`absolute ${orb.x} ${orb.y} rounded-full blur-xl bg-gradient-to-r ${orb.from} ${orb.to} animate-pulse`}
            style={{
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              animationDuration: `${orb.duration}s`,
              animationDelay: `${orb.delay || 0}s`,
            }}
          />
        ))}
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

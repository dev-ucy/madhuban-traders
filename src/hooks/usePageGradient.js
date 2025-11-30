import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function usePageGradient(){
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname
    const root = document.documentElement
    
    // Remove all gradient classes
    root.classList.remove('gradient-home', 'gradient-oils', 'gradient-spices', 'gradient-contact')
    
    // Add the appropriate gradient class based on the route
    if (path === '/') {
      root.classList.add('gradient-home')
    } else if (path.includes('/catalog') && location.search.includes('oils')) {
      root.classList.add('gradient-oils')
    } else if (path.includes('/catalog') && location.search.includes('spices')) {
      root.classList.add('gradient-spices')
    } else if (path.includes('/catalog')) {
      // Default catalog to oils gradient
      root.classList.add('gradient-oils')
    } else if (path === '/contact') {
      root.classList.add('gradient-contact')
    } else {
      root.classList.add('gradient-home')
    }
  }, [location.pathname, location.search])
}

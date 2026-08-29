import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // If there's a hash fragment, try to scroll to that element (account for a fixed header)
    if (hash) {
      const id = hash.replace('#', '')
      const scrollToEl = () => {
        const el = document.getElementById(id)
        if (!el) return false
        const header = document.querySelector('.app-header')
        const offset = (header && header.offsetHeight) ? header.offsetHeight + 12 : 80
        const top = el.getBoundingClientRect().top + window.pageYOffset - offset
        window.scrollTo({ top, behavior: 'smooth' })
        return true
      }

      // Try immediately, otherwise retry after a micro-delay (for route transitions)
      if (!scrollToEl()) setTimeout(scrollToEl, 50)
      return
    }

    // No hash → default scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash])

  return null
}

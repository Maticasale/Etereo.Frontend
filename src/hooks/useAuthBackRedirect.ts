import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface UseAuthBackRedirectOptions {
  to: string
}

export function useAuthBackRedirect({ to }: UseAuthBackRedirectOptions) {
  const navigate = useNavigate()

  useEffect(() => {
    if (typeof window === 'undefined') return

    window.history.pushState({ authBackRedirect: true }, '', window.location.href)

    const handlePopState = () => {
      navigate(to, { replace: true })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [navigate, to])
}

import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [coincide, setCoincide] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setCoincide(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return coincide
}

export function useEsMovil(): boolean {
  return useMediaQuery('(max-width: 767px)')
}

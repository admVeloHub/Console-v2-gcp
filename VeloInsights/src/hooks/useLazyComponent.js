import { useState, useEffect, useRef } from 'react'

/**
 * Hook para lazy loading de componentes
 * Carrega componentes apenas quando necessário
 */
export const useLazyComponent = (importFunction, fallback = null) => {
  const [Component, setComponent] = useState(fallback)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const loadComponent = async () => {
    if (Component !== fallback) return Component

    setLoading(true)
    setError(null)

    try {
      const module = await importFunction()
      const LoadedComponent = module.default || module
      
      if (mountedRef.current) {
        setComponent(() => LoadedComponent)
        setLoading(false)
      }
      
      return LoadedComponent
    } catch (err) {
      if (mountedRef.current) {
        setError(err)
        setLoading(false)
      }
      throw err
    }
  }

  return {
    Component,
    loading,
    error,
    loadComponent
  }
}

/**
 * Hook para lazy loading com intersection observer
 * Carrega componentes quando entram na viewport
 */
export const useLazyComponentWithIntersection = (importFunction, options = {}) => {
  const [Component, setComponent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const elementRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !Component && !loading) {
          setLoading(true)
          setError(null)

          try {
            const module = await importFunction()
            const LoadedComponent = module.default || module
            
            if (mountedRef.current) {
              setComponent(() => LoadedComponent)
              setLoading(false)
            }
          } catch (err) {
            if (mountedRef.current) {
              setError(err)
              setLoading(false)
            }
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [Component, loading, importFunction, options])

  return {
    Component,
    loading,
    error,
    elementRef
  }
}

/**
 * Hook para debounce de valores
 * Útil para otimizar filtros e pesquisas
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook para throttle de funções
 * Limita a frequência de execução de funções
 */
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now())

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args)
      lastRun.current = Date.now()
    }
  }, [callback, delay])
}

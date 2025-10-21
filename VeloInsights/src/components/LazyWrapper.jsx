import React, { useState, useEffect, useRef } from 'react'

const LazyWrapper = ({ children, threshold = 0.1 }) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return (
    <div ref={ref}>
      {isVisible ? children : <div style={{ height: '200px' }} />}
    </div>
  )
}

export const LazyChart = ({ children, ...props }) => {
  return <LazyWrapper {...props}>{children}</LazyWrapper>
}

export default LazyWrapper

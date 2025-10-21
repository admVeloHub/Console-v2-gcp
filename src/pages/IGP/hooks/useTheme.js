import { useState, useEffect } from 'react'

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    // Verificar se há tema salvo no localStorage
    const savedTheme = localStorage.getItem('veloinsights-theme')
    if (savedTheme) {
      return savedTheme
    }
    // Verificar preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    // Padrão: tema claro
    return 'light'
  })

  useEffect(() => {
    // Salvar tema no localStorage
    localStorage.setItem('veloinsights-theme', theme)
    
    // Aplicar tema ao documento
    document.documentElement.setAttribute('data-theme', theme)
    
    // Adicionar classe ao body para CSS
    document.body.className = `theme-${theme}`
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return {
    theme,
    toggleTheme,
    isLight: theme === 'light',
    isDark: theme === 'dark'
  }
}

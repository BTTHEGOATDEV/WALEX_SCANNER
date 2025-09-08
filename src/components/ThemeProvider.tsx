import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  isTransitioning: boolean
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  isTransitioning: false,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement

    // Smoother theme transition logic
    root.style.setProperty('--theme-transition-duration', '200ms')
    
    // Add transition overlay for seamless switching
    const overlay = document.createElement('div')
    overlay.className = 'theme-transition-overlay'
    document.body.appendChild(overlay)
    
    // Fade out
    overlay.style.opacity = '1'
    
    setTimeout(() => {
      root.classList.remove("light", "dark")

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light"
        root.classList.add(systemTheme)
      } else {
        root.classList.add(theme)
      }

      // Fade in
      setTimeout(() => {
        overlay.style.opacity = '0'
        setTimeout(() => {
          document.body.removeChild(overlay)
        }, 200)
      }, 50)
    }, 100)
  }, [theme])

  const value = {
    theme,
    isTransitioning,
    setTheme: (theme: Theme) => {
      setIsTransitioning(true)
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
      // Reset transition state after animation completes
      setTimeout(() => setIsTransitioning(false), 300)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
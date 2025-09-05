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

    // Add transition class for smooth theme switching
    root.classList.add("theme-transitioning")
    
    // Use requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
      root.classList.remove("light", "dark")

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light"

        requestAnimationFrame(() => {
          root.classList.add(systemTheme)
          // Remove transition class after theme is applied
          setTimeout(() => root.classList.remove("theme-transitioning"), 300)
        })
        return
      }

      requestAnimationFrame(() => {
        root.classList.add(theme)
        // Remove transition class after theme is applied
        setTimeout(() => root.classList.remove("theme-transitioning"), 300)
      })
    })
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
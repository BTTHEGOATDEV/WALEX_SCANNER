import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/ThemeProvider"
import { useState } from "react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [isRippling, setIsRippling] = useState(false)

  const triggerRipple = () => {
    setIsRippling(true)
    setTimeout(() => setIsRippling(false), 600)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          onClick={triggerRipple}
          variant="outline"
          size="icon"
          id="theme-btn"
          className="relative overflow-hidden transition-all duration-500 hover:scale-110 hover:shadow-lg bg-gradient-to-br from-background to-card border-border/50 hover:border-primary/50"
        >
          {/* Sun / Moon Morph Animation */}
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-transform duration-700 ease-in-out dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-transform duration-700 ease-in-out dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>

          {/* Glow Overlay */}
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100">
            <div className="absolute inset-0 animate-pulse-glow rounded-md bg-gradient-to-r from-primary/20 to-cyber-blue/20" />
          </div>

          {/* Ripple Effect */}
          {isRippling && <span className="theme-ripple" />}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="mt-2 min-w-[180px] bg-background/95 backdrop-blur-md border border-border/50 shadow-xl"
      >
        {/* Light Mode */}
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 hover:bg-muted/80 ${
            theme === "light" ? "bg-primary/10 text-primary" : ""
          }`}
        >
          <Sun className="h-4 w-4" />
          <span className="font-medium">WHITE HAT</span>
          {theme === "light" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </DropdownMenuItem>

        {/* Dark Mode */}
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 hover:bg-muted/80 ${
            theme === "dark" ? "bg-primary/10 text-primary" : ""
          }`}
        >
          <Moon className="h-4 w-4" />
          <span className="font-medium">BLACK HAT</span>
          {theme === "dark" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </DropdownMenuItem>

        {/* System Mode */}
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 hover:bg-muted/80 ${
            theme === "system" ? "bg-primary/10 text-primary" : ""
          }`}
        >
          <Monitor className="h-4 w-4" />
          <span className="font-medium">System</span>
          {theme === "system" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

"use client"

import { createContext, JSX, useContext, type ReactNode } from "react"

// Define the theme structure with proper types
type ThemeColors = {
  primary: string
  secondary: string
  accent: string
  text: string
  background: string
  card: string
  border: string
}

type ThemeSpacing = {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
}

type ThemeBorderRadius = {
  sm: number
  md: number
  lg: number
  xl: number
}

type Theme = {
  colors: ThemeColors
  spacing: ThemeSpacing
  borderRadius: ThemeBorderRadius
}

// Golden Retriever inspired color palette
const theme: Theme = {
  colors: {
    primary: "#F9B872", // Golden/yellow
    secondary: "#E8D0B3", // Light cream
    accent: "#D4A76A", // Darker gold
    text: "#7D4E24", // Dark brown
    background: "#FFF9F0", // Off-white
    card: "#FFFFFF", // White
    border: "#E8D0B3", // Light cream
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
  },
}

// Create context with the proper type
const ThemeContext = createContext<Theme>(theme)

// Define props type for ThemeProvider
type ThemeProviderProps = {
  children: ReactNode
}

export const useTheme = (): Theme => useContext(ThemeContext)

export const ThemeProvider = ({ children }: ThemeProviderProps): JSX.Element => {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}


"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Pet } from "../data/pets"

type FavoritesContextType = {
  favorites: number[]
  addFavorite: (petId: number) => void
  removeFavorite: (petId: number) => void
  isFavorite: (petId: number) => boolean
  favoritePets: Pet[]
  isLoading: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}

type FavoritesProviderProps = {
  children: React.ReactNode
  allPets: Pet[]
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children, allPets }) => {
  const [favorites, setFavorites] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem("favorites")
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites))
        }
      } catch (error) {
        console.error("Failed to load favorites:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [])

  // Save favorites to AsyncStorage whenever they change
  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem("favorites", JSON.stringify(favorites))
      } catch (error) {
        console.error("Failed to save favorites:", error)
      }
    }

    // Only save if we've finished initial loading
    if (!isLoading) {
      saveFavorites()
    }
  }, [favorites, isLoading])

  const addFavorite = (petId: number) => {
    setFavorites((prev) => {
      if (prev.includes(petId)) return prev
      return [...prev, petId]
    })
  }

  const removeFavorite = (petId: number) => {
    setFavorites((prev) => prev.filter((id) => id !== petId))
  }

  const isFavorite = (petId: number) => {
    return favorites.includes(petId)
  }

  // Get the full pet objects for all favorites
  const favoritePets = allPets.filter((pet) => favorites.includes(pet.id))

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        favoritePets,
        isLoading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}


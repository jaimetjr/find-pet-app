// Define the pet data structure with TypeScript types
import type { Coordinates } from "../types/location"

export type Pet = {
  id: number
  name: string
  type: string
  breed: string
  age: number
  gender: string
  size: string
  location: string
  coordinates: Coordinates
  description: string
  contactName: string
  contactPhone: string
  imageUrl: string // Main image (keeping for backward compatibility)
  images: string[] // Array of image URLs
}
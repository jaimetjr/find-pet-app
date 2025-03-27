import { calculateDistance } from "./location"

export type FilterOptions = {
  petType: string[]
  gender: string[]
  size: string[]
  ageRange: string[]
  location: string[]
  distance: string // "5", "10", "25", "50", "100", or "" (any)
}

export const emptyFilters: FilterOptions = {
  petType: [],
  gender: [],
  size: [],
  ageRange: [],
  location: [],
  distance: "",
}

// Helper function to check if a pet matches the current filters
export function matchesFilters(
  pet: any,
  filters: FilterOptions,
  userLocation: { latitude: number; longitude: number } | null | undefined,
): boolean {
  // If no filters are applied, show all pets
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "distance") return value !== ""
    return (value as string[]).length > 0
  })

  if (!hasActiveFilters) return true

  // Check pet type filter
  if (filters.petType.length > 0 && !filters.petType.includes(pet.type)) {
    return false
  }

  // Check gender filter
  if (filters.gender.length > 0 && !filters.gender.includes(pet.gender)) {
    return false
  }

  // Check size filter
  if (filters.size.length > 0 && !filters.size.includes(pet.size)) {
    return false
  }

  // Check location filter (city only, without state)
  if (filters.location.length > 0) {
    const petCity = pet.location.split(",")[0].trim()
    const matchesLocation = filters.location.some((loc) => {
      const filterCity = loc.split(",")[0].trim()
      return petCity === filterCity
    })
    if (!matchesLocation) return false
  }

  // Check age range filter
  if (filters.ageRange.length > 0) {
    const petAge = pet.age
    const matchesAgeRange = filters.ageRange.some((range) => {
      if (range === "0-1") return petAge < 1
      if (range === "1-3") return petAge >= 1 && petAge <= 3
      if (range === "4-8") return petAge >= 4 && petAge <= 8
      if (range === "9+") return petAge >= 9
      return false
    })
    if (!matchesAgeRange) return false
  }

  // Check distance filter if user location is available
  if (filters.distance && userLocation) {
    const maxDistance = Number.parseInt(filters.distance)
    if (!isNaN(maxDistance)) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        pet.coordinates.latitude,
        pet.coordinates.longitude,
      )
      if (distance > maxDistance) {
        return false
      }
    }
  } else if (filters.distance && !userLocation) {
    // If distance filter is applied but no user location is available,
    // we can't calculate distance, so we should return false
    // However, this might be too restrictive, so we'll just ignore the distance filter
    // and let other filters apply
    console.warn("Distance filter applied but user location is not available")
  }

  // If all filters pass, the pet matches
  return true
}


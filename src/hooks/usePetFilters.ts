import { useState, useCallback, useMemo } from 'react';
import { Pet } from '@/models/pet';
import { FilterOptions, emptyFilters } from '@/components/Pets/ActiveFilters';
import { calculateDistance } from '@/utils/locationUtils';
import { Coordinates } from '@/utils/locationUtils';

export const usePetFilters = (pets: Pet[], userLocation: Coordinates | null) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<FilterOptions>(emptyFilters);

  // Filter pets based on search query and filters
  const filteredPets = useMemo(() => {
    let filtered = pets;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (pet) =>
          pet.name.toLowerCase().includes(query) ||
          pet.breed.toLowerCase().includes(query) ||
          pet.type.toLowerCase().includes(query) ||
          pet.location.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filters.petType.length > 0) {
      filtered = filtered.filter((pet) =>
        filters.petType.includes(pet.type)
      );
    }

    // Apply gender filter
    if (filters.gender.length > 0) {
      filtered = filtered.filter((pet) =>
        filters.gender.includes(pet.gender)
      );
    }

    // Apply size filter
    if (filters.size.length > 0) {
      filtered = filtered.filter((pet) =>
        filters.size.includes(pet.size)
      );
    }

    // Apply age range filter
    if (filters.ageRange.length > 0) {
      filtered = filtered.filter((pet) => {
        const age = pet.age;
        return filters.ageRange.some((range) => {
          const [min, max] = range.split('-').map(Number);
          return age >= min && age <= max;
        });
      });
    }

    // Apply location filter
    if (filters.location.length > 0) {
      filtered = filtered.filter((pet) =>
        filters.location.includes(pet.location)
      );
    }

    // Apply distance filter
    if (filters.distance && userLocation) {
      const maxDistance = parseFloat(filters.distance);
      filtered = filtered.filter((pet) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          pet.coordinates.latitude,
          pet.coordinates.longitude
        );
        return distance <= maxDistance;
      });
    }

    return filtered;
  }, [pets, searchQuery, filters, userLocation]);

  // Sort pets by distance
  const sortByDistance = useCallback(() => {
    if (!userLocation) return;

    const sortedPets = [...filteredPets].sort((a, b) => {
      const distanceA = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        a.coordinates.latitude,
        a.coordinates.longitude
      );
      const distanceB = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        b.coordinates.latitude,
        b.coordinates.longitude
      );
      return distanceA - distanceB;
    });

    return sortedPets;
  }, [filteredPets, userLocation]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleRemoveFilter = useCallback((category: keyof FilterOptions, value: string) => {
    if (category === 'distance') {
      setFilters((prev) => ({
        ...prev,
        distance: '',
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [category]: prev[category].filter((item) => item !== value),
      }));
    }
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(emptyFilters);
  }, []);

  const handleApplyFilters = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);

  return {
    searchQuery,
    filters,
    filteredPets,
    handleSearch,
    handleRemoveFilter,
    handleClearFilters,
    handleApplyFilters,
    sortByDistance,
  };
}; 
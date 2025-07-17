import { useState, useEffect, useCallback } from 'react';
import { getPets } from '@/services/petService';
import { PetDTO } from '@/dtos/pet/petDto';
import { Alert } from 'react-native';
import { getCoordinatesFromAddress } from '@/utils/locationUtils';
import { DEFAULTS, ERROR_MESSAGES } from '@/constants';
import { Pet } from '@/models/pet';

export const usePets = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert PetDTO to Pet model with coordinates
  const convertPetDTOToPet = useCallback(async (petDTO: PetDTO): Promise<Pet> => {
    const coordinates = await getCoordinatesFromAddress(
      petDTO.cep,
      petDTO.address,
      petDTO.city,
      petDTO.state
    );

    return {
      id: petDTO.id,
      name: petDTO.name,
      type: petDTO.type.name,
      breed: petDTO.breed.name,
      size: petDTO.size.toString(),
      age: petDTO.age,
      gender: DEFAULTS.PET.GENDER,
      location: `${petDTO.city}`,
      coordinates: coordinates || {
        latitude: DEFAULTS.LOCATION.DEFAULT_LATITUDE,
        longitude: DEFAULTS.LOCATION.DEFAULT_LONGITUDE,
      },
      description: petDTO.bio,
      contactName: DEFAULTS.PET.CONTACT_NAME,
      contactPhone: DEFAULTS.PET.CONTACT_PHONE,
      imageUrl: petDTO.petImages?.[0]?.imageUrl || "",
      images: petDTO.petImages?.map(img => img.imageUrl) || [],
    };
  }, []);

  const fetchPets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await getPets();
      if (result.success && result.value) {
        const petsPromises = result.value.map(convertPetDTOToPet);
        const pets = await Promise.all(petsPromises);
        
        setPets(pets);
      } else {
        setError(ERROR_MESSAGES.FAILED_TO_FETCH_PETS);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      setError(ERROR_MESSAGES.LOADING_PETS_ERROR);
      Alert.alert('Erro', ERROR_MESSAGES.FETCH_PETS_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [convertPetDTOToPet]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  return {
    pets,
    isLoading,
    error,
    refetch: fetchPets,
  };
}; 
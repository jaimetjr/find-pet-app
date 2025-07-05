import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

export const useMapToggle = (hasLocationPermission: boolean) => {
  const [showMap, setShowMap] = useState<boolean>(false);

  const handleToggleMap = useCallback(() => {
    if (!showMap && !hasLocationPermission) {
      Alert.alert(
        'Permissão de localização recomendada',
        'Para uma melhor experiência com o mapa, recomendamos conceder permissão de localização. Deseja continuar mesmo assim?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Continuar',
            onPress: () => setShowMap(true),
          },
        ]
      );
    } else {
      setShowMap(!showMap);
    }
  }, [showMap, hasLocationPermission]);

  const handleCloseMap = useCallback(() => {
    setShowMap(false);
  }, []);

  const handleSelectPetFromMap = useCallback(() => {
    setShowMap(false);
  }, []);

  return {
    showMap,
    handleToggleMap,
    handleCloseMap,
    handleSelectPetFromMap,
  };
}; 
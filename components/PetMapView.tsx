"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from "react-native-maps"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import type { Pet } from "../data/pets"
import type { Coordinates } from "../types/location"

type PetMapViewProps = {
  pets: Pet[]
  userLocation: Coordinates | null
  onPetSelect: (pet: Pet) => void
  onClose: () => void
}

const { width, height } = Dimensions.get("window")
const ASPECT_RATIO = width / height
const LATITUDE_DELTA = 0.0922
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

const PetMapView: React.FC<PetMapViewProps> = ({ pets, userLocation, onPetSelect, onClose }) => {
  const theme = useTheme()
  const mapRef = useRef<MapView>(null)

  // Initial region based on user location or first pet
  const initialRegion: Region = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }
    : pets.length > 0
      ? {
          latitude: pets[0].coordinates.latitude,
          longitude: pets[0].coordinates.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }
      : {
          latitude: -23.5505, // Default to São Paulo
          longitude: -46.6333,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }

  // Fit map to show all markers
  useEffect(() => {
    if (mapRef.current && pets.length > 0) {
      const coordinates = pets.map((pet) => ({
        latitude: pet.coordinates.latitude,
        longitude: pet.coordinates.longitude,
      }))

      if (userLocation) {
        coordinates.push(userLocation)
      }

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      })
    }
  }, [pets, userLocation])

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={true}
      >
        {pets.map((pet) => (
          <Marker
            key={pet.id}
            coordinate={{
              latitude: pet.coordinates.latitude,
              longitude: pet.coordinates.longitude,
            }}
            title={pet.name}
            description={pet.breed}
            onCalloutPress={() => onPetSelect(pet)}
          />
        ))}
      </MapView>

      <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.colors.card }]} onPress={onClose}>
        <Feather name="x" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      <View style={[styles.infoPanel, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.infoText, { color: theme.colors.text }]}>
          {pets.length} {pets.length === 1 ? "pet encontrado" : "pets encontrados"} no mapa
        </Text>
        <Text style={[styles.infoSubtext, { color: theme.colors.text }]}>Toque nos marcadores para ver detalhes</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  infoPanel: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 14,
  },
})

export default PetMapView


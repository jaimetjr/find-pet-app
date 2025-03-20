import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"
import type { Pet } from "../data/pets"

// Define the stack navigator param list
export type RootStackParamList = {
  Home: undefined
  PetDetail: Pet
}

// Define navigation prop types for each screen
export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">

export type PetDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "PetDetail">

// Define route prop types for each screen
export type PetDetailScreenRouteProp = RouteProp<RootStackParamList, "PetDetail">


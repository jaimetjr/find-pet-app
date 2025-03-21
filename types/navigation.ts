import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs"
import type { CompositeNavigationProp, RouteProp } from "@react-navigation/native"
import type { Pet } from "../data/pets"

// Define the stack navigator param list
export type RootStackParamList = {
  Main: undefined
  PetDetail: Pet
}

// Define the tab navigator param list
export type RootTabParamList = {
  HomeTab: undefined
  Favorites: undefined
}

// Define navigation prop types for each screen
export type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, "HomeTab">,
  NativeStackNavigationProp<RootStackParamList>
>

export type FavoritesScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, "Favorites">,
  NativeStackNavigationProp<RootStackParamList>
>

export type PetDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "PetDetail">

// Define route prop types for each screen
export type PetDetailScreenRouteProp = RouteProp<RootStackParamList, "PetDetail">


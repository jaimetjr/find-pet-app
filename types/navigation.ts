import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs"
import type { DrawerNavigationProp } from "@react-navigation/drawer"
import type { CompositeNavigationProp, RouteProp } from "@react-navigation/native"
import type { Pet } from "../data/pets"
import type { FilterOptions } from "../types/filters"

// Define the stack navigator param list with params
export type RootStackParamList = {
  Drawer:
    | {
        screen?: string
        params?: {
          filters?: FilterOptions
          searchQuery?: string
        }
      }
    | undefined
  PetDetail: Pet
}

// Define the drawer navigator param list with params
export type DrawerParamList = {
  Main:
    | {
        filters?: FilterOptions
        searchQuery?: string
      }
    | undefined
  UserProfile: undefined
  CreateUser: undefined
  CreatePet: undefined
}

// Define the tab navigator param list with params
export type RootTabParamList = {
  HomeTab:
    | {
        filters?: FilterOptions
        searchQuery?: string
      }
    | undefined
  Favorites: undefined
}

// Define navigation prop types for each screen
export type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, "HomeTab">,
  CompositeNavigationProp<DrawerNavigationProp<DrawerParamList>, NativeStackNavigationProp<RootStackParamList>>
>

export type FavoritesScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, "Favorites">,
  CompositeNavigationProp<DrawerNavigationProp<DrawerParamList>, NativeStackNavigationProp<RootStackParamList>>
>

export type PetDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "PetDetail">

export type UserProfileScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, "UserProfile">,
  NativeStackNavigationProp<RootStackParamList>
>

export type CreateUserScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, "CreateUser">,
  NativeStackNavigationProp<RootStackParamList>
>

export type CreatePetScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, "CreatePet">,
  NativeStackNavigationProp<RootStackParamList>
>

// We're keeping this type for now in case it's used elsewhere
export type AdvancedSearchScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList>,
  NativeStackNavigationProp<RootStackParamList>
>

// Define route prop types for each screen
export type PetDetailScreenRouteProp = RouteProp<RootStackParamList, "PetDetail">
export type HomeScreenRouteProp = RouteProp<RootTabParamList, "HomeTab">


import { ContactType } from "@/enums/contactType";

// Base API Response Types
export interface ApiResponse<T> {
  success: boolean;
  value: T;
  errors: string[];
}

// User Types
export interface UserApiResponse {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  birthDate: string; // ISO date string
  cpf: string;
  phone: string;
  bio: string;
  avatar?: string;
  address: string;
  neighborhood: string;
  cep: string;
  state: string;
  city: string;
  number: string;
  complement?: string;
  notifications: boolean;
  approvalStatus: number;
  role: number;
  contactType: ContactType;
  createdAt: string;
  updatedAt: string;
  expoPushToken: string;
}

// Pet Types
export interface PetTypeApiResponse {
  id: string;
  name: string;
}

export interface PetBreedApiResponse {
  id: string;
  name: string;
  petTypeId: string;
}

export interface PetImageApiResponse {
  id: string;
  imageUrl: string;
  petId: string;
  createdAt: string;
}

export interface PetApiResponse {
  id: string;
  name: string;
  type: PetTypeApiResponse;
  breed: PetBreedApiResponse;
  size: number;
  age: number;
  bio: string;
  cep: string;
  address: string;
  neighborhood: string;
  state: string;
  city: string;
  number: string;
  complement?: string;
  petImages?: PetImageApiResponse[];
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface RegisterUserRequest {
  clerkId: string;
  name: string;
  email: string;
  birthDate: string; // ISO date string
  cpf: string;
  phone: string;
  bio: string;
  cep: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  number: string;
  provider: number;
  contactType: number;
  complement?: string;
  avatar?: string;
  notifications: boolean;
}

export interface AddPetRequest {
  name: string;
  typeId: string;
  breedId: string;
  size: number;
  age: number;
  bio: string;
  cep: string;
  address: string;
  neighborhood: string;
  state: string;
  city: string;
  number: string;
  complement?: string;
}

// Error Types
export interface ApiError {
  message: string;
  status?: number;
  field?: string;
  code?: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter Types
export interface PetFilters {
  petType?: string[];
  gender?: string[];
  size?: string[];
  ageRange?: string[];
  location?: string[];
  distance?: string;
  search?: string;
}

// Location Types
export interface LocationApiResponse {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
} 
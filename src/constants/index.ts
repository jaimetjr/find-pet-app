// API Endpoints
export const API_ENDPOINTS = {
  PETS: '/pet',
  PETS_BY_ID: '/pet/GetAllPetsByUser',
  PET_IMAGES: '/pet/images',
  AUTH_REGISTER: '/auth/register',
  AUTH_ME: '/auth/me',
  AUTH_UPDATE: '/auth/update',
  AUTH_UPDATE_EXPO_PUSH_TOKEN: '/auth/update-expo-push-token',
  CHAT_ROOMS: '/chat',
  CHAT_MARK_MESSAGE: '/chat/MarkMessageAsSeen',
  ADOPTION_REQUESTS: '/adoption-requests',
  ADOPTION_REQUESTS_RECEIVED: '/adoption-requests/received',
  ADOPTION_REQUEST_STATUS: (id: string) => `/adoption-requests/${id}/status`,
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_UNREAD_COUNT: '/notifications/unread-count',
  NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: '/notifications/read-all'
} as const;

// Environment Variables
export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL,
  GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API,
} as const;

// Default Values
export const DEFAULTS = {
  PET: {
    GENDER: 'Não informado',
    CONTACT_NAME: 'Não informado',
    CONTACT_PHONE: 'Não informado',
    IMAGE_TYPE: 'image/jpeg',
    IMAGE_NAME_PREFIX: 'pet_image_',
  },
  USER:{
    IMAGE_TYPE: 'image/jpeg',
    IMAGE_NAME_PREFIX: 'user_image_',
  },
  LOCATION: {
    COUNTRY: 'Brasil',
    DEFAULT_LATITUDE: -23.5505, // São Paulo, Brazil
    DEFAULT_LONGITUDE: -46.6333, // São Paulo, Brazil
    MOCK_LOCATION_ENABLED: __DEV__, // Only enable in development
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNKNOWN_ERROR: 'Unknown error',
  FETCH_PETS_ERROR: 'Erro ao carregar pets. Tente novamente.',
  LOADING_PETS_ERROR: 'Error loading pets. Please try again.',
  FAILED_TO_FETCH_PETS: 'Failed to fetch pets',
  COORDINATES_ERROR: 'Error getting coordinates:',
  LOCATION_UNKNOWN: 'Localização desconhecida',
} as const;

// Form Validation
export const VALIDATION = {
  CEP_LENGTH: 8,
} as const;

// Adoption Requests
export const ADOPTION_REQUEST_CONSTANTS = {
  MAX_PENDING_REQUESTS: 5,
  MESSAGE_MIN_LENGTH: 20,
  MESSAGE_MAX_LENGTH: 500,
} as const; 
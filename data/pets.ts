// Define the pet data structure with TypeScript types
import type { Coordinates } from "../types/location"

export type Pet = {
  id: number
  name: string
  type: string
  breed: string
  age: number
  gender: string
  size: string
  location: string
  coordinates: Coordinates
  description: string
  contactName: string
  contactPhone: string
  imageUrl: string // Main image (keeping for backward compatibility)
  images: string[] // Array of image URLs
}

// Expanded pet data with more variety for filtering and location coordinates
export const petData: Pet[] = [
  {
    id: 1,
    name: "Max",
    type: "Cachorro",
    breed: "Golden Retriever",
    age: 2,
    gender: "Macho",
    size: "Grande",
    location: "São Paulo, SP",
    coordinates: {
      latitude: -23.5505,
      longitude: -46.6333,
    },
    description:
      "Max é um Golden Retriever muito amoroso e brincalhão. Ele adora brincar com bolas e é muito bom com crianças. Está procurando um lar com espaço para correr e brincar.",
    contactName: "Maria Silva",
    contactPhone: "(11) 98765-4321",
    imageUrl: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1612774412771-005aa26192dc?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611250282006-4484dd3fba6f?q=80&w=1000&auto=format&fit=crop",
    ],
  },
  {
    id: 2,
    name: "Luna",
    type: "Gato",
    breed: "Siamês",
    age: 1,
    gender: "Fêmea",
    size: "Médio",
    location: "Rio de Janeiro, RJ",
    coordinates: {
      latitude: -22.9068,
      longitude: -43.1729,
    },
    description:
      "Luna é uma gatinha siamesa muito carinhosa e tranquila. Ela gosta de dormir em lugares quentinhos e receber carinho. Já está castrada e vacinada.",
    contactName: "João Oliveira",
    contactPhone: "(21) 97654-3210",
    imageUrl: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618189063538-57c32a02e765?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511044568932-338cba0ad803?q=80&w=1000&auto=format&fit=crop",
    ],
  },
  {
    id: 3,
    name: "Thor",
    type: "Cachorro",
    breed: "Labrador",
    age: 3,
    gender: "Macho",
    size: "Grande",
    location: "Belo Horizonte, MG",
    coordinates: {
      latitude: -19.9167,
      longitude: -43.9345,
    },
    description:
      "Thor é um labrador muito dócil e obediente. Ele já está treinado para comandos básicos e é muito sociável com outros animais. Precisa de um lar com pessoas ativas.",
    contactName: "Ana Santos",
    contactPhone: "(31) 96543-2109",
    imageUrl: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab2?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1591769225440-811ad7d6eab2?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579213838826-6e8744060c1d?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605897472359-85e4b94d685d?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=1000&auto=format&fit=crop",
    ],
  },
  {
    id: 4,
    name: "Nina",
    type: "Cachorro",
    breed: "Shih Tzu",
    age: 4,
    gender: "Fêmea",
    size: "Pequeno",
    location: "Curitiba, PR",
    coordinates: {
      latitude: -25.4284,
      longitude: -49.2733,
    },
    description:
      "Nina é uma Shih Tzu muito dócil e companheira. Ela adora ficar no colo e receber carinho. É ideal para apartamentos e famílias tranquilas.",
    contactName: "Carlos Mendes",
    contactPhone: "(41) 95432-1098",
    imageUrl: "https://images.unsplash.com/photo-1588269845464-8993565cac3a?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1588269845464-8993565cac3a?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1591946614720-90a587da4a36?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?q=80&w=1000&auto=format&fit=crop",
    ],
  },
  {
    id: 5,
    name: "Simba",
    type: "Gato",
    breed: "Persa",
    age: 2,
    gender: "Macho",
    size: "Médio",
    location: "Brasília, DF",
    coordinates: {
      latitude: -15.7801,
      longitude: -47.9292,
    },
    description:
      "Simba é um gato persa muito tranquilo e independente. Ele gosta de brincar com bolinhas e dormir em lugares altos. Está castrado e com todas as vacinas em dia.",
    contactName: "Fernanda Lima",
    contactPhone: "(61) 94321-0987",
    imageUrl: "https://images.unsplash.com/photo-1616046619793-7e4badf3fe1f?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1616046619793-7e4badf3fe1f?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?q=80&w=1000&auto=format&fit=crop",
    ],
  },
  {
    id: 6,
    name: "Bella",
    type: "Cachorro",
    breed: "Poodle",
    age: 7,
    gender: "Fêmea",
    size: "Pequeno",
    location: "São Paulo, SP",
    coordinates: {
      latitude: -23.5632,
      longitude: -46.6541,
    },
    description:
      "Bella é uma poodle idosa muito dócil e tranquila. Ela gosta de passeios curtos e dormir no colo. Ideal para pessoas que buscam um pet calmo e companheiro.",
    contactName: "Roberto Alves",
    contactPhone: "(11) 97654-3210",
    imageUrl: "https://images.unsplash.com/photo-1575859431774-2e57ed632664?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1575859431774-2e57ed632664?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594149929911-78975a43d4f5?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1591160690555-5debfba289f0?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608096299210-db7e38487075?q=80&w=1000&auto=format&fit=crop",
    ],
  },
  {
    id: 7,
    name: "Rex",
    type: "Cachorro",
    breed: "Pastor Alemão",
    age: 5,
    gender: "Macho",
    size: "Grande",
    location: "Rio de Janeiro, RJ",
    coordinates: {
      latitude: -22.9865,
      longitude: -43.2096,
    },
    description:
      "Rex é um pastor alemão muito inteligente e protetor. Ele foi treinado para obedecer a comandos básicos e é um excelente cão de guarda. Precisa de espaço e atividade física regular.",
    contactName: "Camila Santos",
    contactPhone: "(21) 98765-4321",
    imageUrl: "https://images.unsplash.com/photo-1589941013453-ec89f98c6e8e?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1589941013453-ec89f98c6e8e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555991415-1b04a71f18c5?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553882809-a4f57e59501d?q=80&w=1000&auto=format&fit=crop",
    ],
  },
  {
    id: 8,
    name: "Mia",
    type: "Gato",
    breed: "Maine Coon",
    age: 1,
    gender: "Fêmea",
    size: "Grande",
    location: "Curitiba, PR",
    coordinates: {
      latitude: -25.4456,
      longitude: -49.2531,
    },
    description:
      "Mia é uma filhote de Maine Coon muito brincalhona e sociável. Ela se dá bem com outros animais e crianças. Está vacinada e vermifugada.",
    contactName: "Paulo Mendes",
    contactPhone: "(41) 97654-3210",
    imageUrl: "https://images.unsplash.com/photo-1568152950566-c1bf43f4ab28?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1568152950566-c1bf43f4ab28?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1494256997604-768d1f608cac?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?q=80&w=1000&auto=format&fit=crop",
    ],
  },
  {
    id: 9,
    name: "Toby",
    type: "Cachorro",
    breed: "Beagle",
    age: 3,
    gender: "Macho",
    size: "Médio",
    location: "Belo Horizonte, MG",
    coordinates: {
      latitude: -19.9345,
      longitude: -43.9454,
    },
    description:
      "Toby é um beagle muito ativo e curioso. Ele adora farejar e explorar novos ambientes. Precisa de um lar com pessoas que gostem de passear e brincar.",
    contactName: "Juliana Costa",
    contactPhone: "(31) 98765-4321",
    imageUrl: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1505628346881-b72b27e84530?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1529429617124-95b109e86bb8?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605897472359-85e4b94d685d?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1561037404-61cd46aa615b?q=80&w=1000&auto=format&fit=crop",
    ],
  },
  {
    id: 10,
    name: "Lola",
    type: "Gato",
    breed: "Ragdoll",
    age: 4,
    gender: "Fêmea",
    size: "Médio",
    location: "Brasília, DF",
    coordinates: {
      latitude: -15.7934,
      longitude: -47.8823,
    },
    description:
      "Lola é uma gata ragdoll muito dócil e calma. Ela gosta de receber carinho e dormir em lugares confortáveis. Ideal para apartamentos e famílias tranquilas.",
    contactName: "Ricardo Lima",
    contactPhone: "(61) 97654-3210",
    imageUrl: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=1000&auto=format&fit=crop",
    ],
  },
]


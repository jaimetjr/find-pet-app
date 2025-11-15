import { PetBreedDTO } from "./petBreedDto";
import { PetTypeDTO } from "./petTypeDto";
import { PetSize } from "@/enums/petSize-enum";
import { PetGender } from "@/enums/petGender-enum";
import { UserDTO } from "../user/userDto";

export interface PetDTO {
    id: string;
    name: string;
    breed: PetBreedDTO;
    type: PetTypeDTO;
    size: PetSize;
    age: number;
    gender: PetGender;
    bio: string;
    history: string;
    cep: string;
    address: string;
    neighborhood: string;
    state: string;
    city: string;
    number: string;
    complement?: string;
    petImages? : PetImagesDTO[];
    user : UserDTO;
    petFavorites?: PetFavoriteDTO[];
}

export interface PetImagesDTO {   
    id: string;
    imageUrl: string;
}

export interface PetFavoriteDTO {
    isFavorite: boolean;
    petId: string;
}
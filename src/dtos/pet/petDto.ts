import { PetBreedDTO } from "./petBreedDto";
import { PetTypeDTO } from "./petTypeDto";
import { PetSize } from "@/enums/petSize-enum";

export interface PetDTO {
    id: string;
    name: string;
    breed: PetBreedDTO;
    type: PetTypeDTO;
    size: PetSize;
    age: number;
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
}

export interface PetImagesDTO {   
    id: string;
    imageUrl: string;
}
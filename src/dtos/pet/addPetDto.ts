import { PetSize } from '@/enums/petSize-enum';
import { PetGender } from '@/enums/petGender-enum';

export interface PetType {
    id: string; // Guid
    name: string;
}

export interface PetBreed {
    id: string; // Guid
    name: string;
    type?: PetType;
}

export interface PetImage {
    id: string; // Guid
    imageUrl: string;
}

export class AddPetDTO {
    userId: string;
    name: string;
    type: PetType;
    breed: PetBreed;
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
    //petImages: PetImage[];

    constructor(
        userId: string,
        name: string,
        type: PetType,
        breed: PetBreed,
        size: PetSize,
        age: number,
        gender: PetGender,
        bio: string,
        history: string,
        cep: string,
        address: string,
        neighborhood: string,
        state: string,
        city: string,
        number: string,
        //  petImages: PetImage[],
        complement?: string,
    ) {
        this.userId = userId;
        this.name = name;
        this.type = type;
        this.breed = breed;
        this.size = size;
        this.age = age;
        this.gender = gender;
        this.bio = bio;
        this.history = history;
        this.cep = cep;
        this.address = address;
        this.neighborhood = neighborhood;
        this.state = state;
        this.city = city;
        this.number = number;
        this.complement = complement;
        //this.petImages = petImages;
    }
} 
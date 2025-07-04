import { PetTypeDTO } from "./petTypeDto";

export interface PetBreedDTO {
    id: string;
    name: string;
    type : PetTypeDTO;
}

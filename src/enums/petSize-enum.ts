export enum PetSize {
    Small = 0,
    Medium = 1,
    Large = 2,
    Gigant = 3
} 

export const PetSizeHelper = {
    getLabel: (size: PetSize): string => {
        console.log(size);
        switch (size) {
            case PetSize.Small:
                return "Pequeno";
            case PetSize.Medium:
                return "Médio";
            case PetSize.Large:
                return "Grande";
            case PetSize.Gigant:
                return "Gigante";
            default:
                return "Desconhecido";
        }
    }
};
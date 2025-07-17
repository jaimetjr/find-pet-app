export class UpdateUserDTO {
    id: string;
    birthDate: string; // ISO date string
    cpf: string;
    phone: string;
    bio: string;
    cep: string;
    address: string;
    number: string; 
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    notifications: boolean;
    contactType: number;

    constructor(
        id: string,
        birthDate: string,
        cpf: string,
        phone: string, 
        bio: string, 
        cep: string, 
        address: string,
        neighborhood: string, 
        city: string, 
        state: string, 
        number: string, 
        notifications: boolean,
        contactType: number,
        complement?: string,
    ) {
        this.id = id;
        this.birthDate = birthDate;
        this.cpf = cpf;
        this.phone = phone;
        this.bio = bio;
        this.cep = cep;
        this.address = address;
        this.neighborhood = neighborhood;
        this.city = city;
        this.state = state;
        this.number = number;
        this.complement = complement;
        this.notifications = notifications;
        this.contactType = contactType;
    }
} 
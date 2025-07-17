import { ProviderEnum } from "@/enums/provider-enum";
import { ContactType } from "@/enums/contactType";

export class RegisterUserDTO {
    clerkId : string;
    name : string;
    email : string;
    birthDate : string; // ISO date string
    cpf : string;
    phone : string;
    notifications? : boolean;
    bio : string;
    cep: string;
    address: string;
    number: string; 
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    provider: ProviderEnum;
    contactType: ContactType;

    constructor(
        clerkId : string, 
        name : string, 
        email : string, 
        birthDate : string,
        cpf : string,
        phone : string, 
        bio : string, 
        cep : string, 
        address : string,
        neighborhood : string, 
        city : string, 
        state : string, 
        number : string, 
        provider: ProviderEnum, 
        contactType: ContactType,
        complement? : string, 
        notifications? : boolean
    ) {
        this.clerkId = clerkId;
        this.name = name;
        this.email = email;
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
        this.provider = provider;
        this.notifications = notifications;
        this.contactType = contactType;
    }
}
import { ProviderEnum } from "@/enums/provider-enum";

export class RegisterUserDTO {
    clerkId : string;
    name : string;
    email : string;
    phone : string;
    notifications? : boolean;
    avatar? : string;
    bio : string;
    cep: string;
    address: string;
    number: string; 
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    provider: ProviderEnum;

    constructor(clerkId : string, name : string, email : string, phone : string, bio : string, cep : string, address : string,
        neighborhood : string, city : string, state : string, number : string, provider: ProviderEnum, complement? : string, avatar? : string, notifications? : boolean) {
        this.clerkId = clerkId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.bio = bio;
        this.cep = cep;
        this.address = address;
        this.neighborhood = neighborhood;
        this.city = city;
        this.state = state;
        this.number = number;
        this.complement = complement;
        this.avatar = avatar;
        this.provider = provider;
        this.notifications = notifications;
    }
}
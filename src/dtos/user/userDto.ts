import { ApprovalStatus } from "@/enums/approvalStatus-enum";
import { ContactType } from "@/enums/contactType";

export interface UserDTO {
    id: string;
    clerkId: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;

    // Profile fields used throughout the app
    birthDate?: string; // ISO date string
    cpf?: string;
    bio?: string;
    cep?: string;
    address?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    number?: string;
    complement?: string;
    notifications?: boolean;

    contactType: ContactType;
    approvalStatus: ApprovalStatus;
    expoPushToken?: string;
}
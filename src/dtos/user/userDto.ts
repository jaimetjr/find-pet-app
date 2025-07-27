import { ApprovalStatus } from "@/enums/approvalStatus-enum";
import { ContactType } from "@/enums/contactType";

export interface UserDTO {
    id : string;
    clerkId : string;
    name : string;
    email : string;
    phone : string;
    avatar : string;
    contactType : ContactType;
    approvalStatus : ApprovalStatus;
    expoPushToken : string;
}
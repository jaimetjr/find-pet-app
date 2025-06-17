import { ApprovalStatus } from "@/enums/approvalStatus-enum";

export interface UserDTO {
    id : string;
    clerkId : string;
    name : string;
    email : string;
    phone : string;

    approvalStatus : ApprovalStatus
}
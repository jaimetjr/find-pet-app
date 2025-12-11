import { AdoptionRequestStatus } from "@/enums/adoptionRequestStatus-enum";
import { PetDTO } from "./pet/petDto";
import { UserDTO } from "./user/userDto";

export interface AdoptionRequestDTO {
  id: string;
  petId: string;
  pet: PetDTO;
  adopterClerkId: string;
  adopter: UserDTO;
  ownerClerkId: string;
  owner: UserDTO;
  status: AdoptionRequestStatus;
  message: string;
  rejectionReason?: string;
  active: boolean; // Soft delete flag (true = active, false = deleted)
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAdoptionRequestDTO {
  petId: string;
  message: string;
}

export interface UpdateAdoptionRequestStatusDTO {
  status: AdoptionRequestStatus;
  rejectionReason?: string;
}

export interface AdoptionRequestSummaryDTO {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}


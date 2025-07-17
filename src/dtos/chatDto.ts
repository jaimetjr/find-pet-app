import { PetDTO } from './pet/petDto';
import { UserDTO } from './user/userDto';

export interface ChatMessageDTO {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
}

export interface ChatRoomDTO {
  id: string;
  userAClerkId: string;
  userA: UserDTO;
  userBClerkId: string;
  userB: UserDTO;
  petId: string;
  pet: PetDTO;
  messages: ChatMessageDTO[];
}
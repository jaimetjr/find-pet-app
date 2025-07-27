import { PetDTO } from './pet/petDto';
import { UserDTO } from './user/userDto';

export interface ChatMessageDTO {
  id: string;
  chatRoom: ChatRoomDTO;
  chatRoomId: string;
  recipientId: string
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  wasSeen: boolean;
  wasSeenAt?: Date;
  seenByClerkId : string;
  wasDelivered? : boolean;
  wasDeliveredAt? : Date
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
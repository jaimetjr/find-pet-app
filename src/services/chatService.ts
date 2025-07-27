import { BaseService } from './baseService';
import { API_ENDPOINTS } from '@/constants';
import { ChatRoomDTO } from '@/dtos/chatDto';
import { Result } from '@/dtos/result';

export const getChats = async (): Promise<Result<ChatRoomDTO[]>> => {
  return BaseService.get<ChatRoomDTO[]>(API_ENDPOINTS.CHAT_ROOMS);
};

export const markMessageAsSeen = async (roomId: string): Promise<void> => {
  await BaseService.post(`${API_ENDPOINTS.CHAT_MARK_MESSAGE}`, {
    roomId: roomId
  });
}; 
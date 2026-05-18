import {
  createChat,
  getSidebarChat,
  getChatHistory,
  deleteChat,
  renameChat,
  pinChat,
  updateResponse
} from './actions';
import Chat from '@/app/models/chat.model';
import connectDB from '../utils/db';
import { auth } from '@/auth';
import { Types } from 'mongoose';
import { Message } from '../types/types';

// Mock modules
jest.mock('@/app/models/chat.model', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    aggregate: jest.fn(),
    find: jest.fn(),
    deleteMany: jest.fn(),
    updateMany: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));
jest.mock('../utils/db');
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock all of mongoose, including ObjectId
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: jest.fn((id) => id || 'mock-object-id'),
  },
  // Include other necessary mongoose functionality if used
}));

describe('Actions', () => {
  const mockSession = {
    user: {
      id: 'mock-user-id',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (connectDB as jest.Mock).mockResolvedValue(undefined);
    // Suppress console.error during tests to avoid expected error messages showing up
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    (console.error as jest.Mock).mockRestore();
  });

  describe('createChat', () => {
    it('should create a chat successfully when user is authenticated', async () => {
      const mockChatData = {
        userPrompt: 'Test prompt',
        llmResponse: 'Test response',
        userID: 'mock-user-id',
        chatID: 'mock-chat-id',
      };

      (auth as jest.Mock).mockResolvedValue(mockSession);
      const mockCreatedChat = {
        _id: 'mock-id',
        participant: 'mock-user-id',
        chatID: 'mock-chat-id',
        message: { userPrompt: 'Test prompt', llmResponse: 'Test response' },
      };
      (Chat.create as jest.Mock).mockResolvedValue(mockCreatedChat);

      const result = await createChat(mockChatData);

      expect(auth).toHaveBeenCalled();
      expect(connectDB).toHaveBeenCalled();
      expect(Chat.create).toHaveBeenCalledWith({
        participant: 'mock-user-id',
        chatID: 'mock-chat-id',
        message: { userPrompt: 'Test prompt', llmResponse: 'Test response' },
      });
      expect(result).toEqual({
        message: JSON.parse(JSON.stringify(mockCreatedChat)),
        success: true,
      });
    });

    it('should return error when user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await createChat({
        userPrompt: 'Test prompt',
        llmResponse: 'Test response',
        userID: 'mock-user-id',
        chatID: 'mock-chat-id',
      } as any);

      expect(auth).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        message: 'User not authenticated',
      });
    });

    it('should handle errors during chat creation', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      (Chat.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await createChat({
        userPrompt: 'Test prompt',
        llmResponse: 'Test response',
        userID: 'mock-user-id',
        chatID: 'mock-chat-id',
      } as any);

      expect(auth).toHaveBeenCalled();
      expect(connectDB).toHaveBeenCalled();
      expect(Chat.create).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        message: 'Database error',
      });
    });
  });

  describe('getSidebarChat', () => {
    it('should return sidebar chats successfully', async () => {
      const mockUserID = 'mock-user-id';
      const mockChats = [
        {
          _id: 'chat1',
          participant: mockUserID,
          chatID: 'chat-id-1',
          message: { userPrompt: 'Prompt 1', llmResponse: 'Response 1' },
        },
      ];
      (Chat.aggregate as jest.Mock).mockResolvedValue(mockChats);

      const result = await getSidebarChat(mockUserID);

      expect(connectDB).toHaveBeenCalled();
      expect(Chat.aggregate).toHaveBeenCalledWith([
        { $match: { participant: new Types.ObjectId(mockUserID) } },
        {
          $group: {
            _id: '$chatID',
            doc: { $first: '$$ROOT' },
          },
        },
        { $replaceRoot: { newRoot: '$doc' } },
        { $sort: { isPinned: -1, createdAt: -1 } },
      ]);
      expect(result).toEqual({ success: true, message: JSON.parse(JSON.stringify(mockChats)) });
    });

    it('should handle errors when getting sidebar chats', async () => {
      const mockUserID = 'mock-user-id';
      (Chat.aggregate as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getSidebarChat(mockUserID);

      expect(connectDB).toHaveBeenCalled();
      expect(Chat.aggregate).toHaveBeenCalled();
      expect(result).toEqual({ success: false });
    });
  });

  describe('getChatHistory', () => {
    it('should return chat history successfully', async () => {
      const mockUserID = 'mock-user-id';
      const mockChatID = 'mock-chat-id';
      const mockChats = [
        {
          _id: 'chat1',
          participant: mockUserID,
          chatID: mockChatID,
          message: { userPrompt: 'Prompt 1', llmResponse: 'Response 1' },
        },
      ];
      (Chat.find as jest.Mock).mockResolvedValue(mockChats);

      const result = await getChatHistory({
        userID: mockUserID,
        chatID: mockChatID,
      });

      expect(connectDB).toHaveBeenCalled();
      expect(Chat.find).toHaveBeenCalledWith({
        participant: new Types.ObjectId(mockUserID),
        chatID: mockChatID,
      });
      expect(result).toEqual({ success: true, message: JSON.parse(JSON.stringify(mockChats)) });
    });

    it('should handle errors when getting chat history', async () => {
      (Chat.find as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getChatHistory({
        userID: 'mock-user-id',
        chatID: 'mock-chat-id',
      });

      expect(connectDB).toHaveBeenCalled();
      expect(Chat.find).toHaveBeenCalled();
      expect(result).toEqual({ success: false });
    });
  });

  describe('deleteChat', () => {
    it('should delete chat successfully when user is authenticated', async () => {
      const mockChatID = 'mock-chat-id';
      const mockDeleteResult = { deletedCount: 1 };
      
      (auth as jest.Mock).mockResolvedValue(mockSession);
      (Chat.deleteMany as jest.Mock).mockResolvedValue(mockDeleteResult);

      const result = await deleteChat(mockChatID);

      expect(auth).toHaveBeenCalled();
      expect(connectDB).toHaveBeenCalled();
      expect(Chat.deleteMany).toHaveBeenCalledWith({
        participant: new Types.ObjectId('mock-user-id'),
        chatID: mockChatID,
      });
      expect(result).toEqual({
        success: true,
        message: JSON.parse(JSON.stringify(mockDeleteResult)),
      });
    });

    it('should return error when user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await deleteChat('mock-chat-id');

      expect(auth).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
      });
    });

    it('should handle errors during chat deletion', async () => {
      const mockChatID = 'mock-chat-id';
      
      (auth as jest.Mock).mockResolvedValue(mockSession);
      (Chat.deleteMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await deleteChat(mockChatID);

      expect(auth).toHaveBeenCalled();
      expect(connectDB).toHaveBeenCalled();
      expect(result).toEqual({ success: false });
    });
  });

  describe('renameChat', () => {
    it('should rename chat successfully when user is authenticated', async () => {
      const mockChatID = 'mock-chat-id';
      const mockMessage = { title: 'New Title' };
      const mockUpdateResult = { acknowledged: true, modifiedCount: 1 };

      (auth as jest.Mock).mockResolvedValue(mockSession);
      (Chat.updateMany as jest.Mock).mockResolvedValue(mockUpdateResult);

      const result = await renameChat(mockChatID, mockMessage);

      expect(auth).toHaveBeenCalled();
      expect(Chat.updateMany).toHaveBeenCalledWith(
        {
          participant: new Types.ObjectId('mock-user-id'),
          chatID: mockChatID,
        },
        { $set: { chatInfo: { title: 'New Title' } } },
        { new: true }
      );
      expect(result).toEqual({
        success: true,
        message: JSON.parse(JSON.stringify(mockUpdateResult)),
      });
    });

    it('should rename chat with both title and icon', async () => {
      const mockChatID = 'mock-chat-id';
      const mockMessage = { title: 'New Title', icon: '🚀' };
      const mockUpdateResult = { acknowledged: true, modifiedCount: 1 };

      (auth as jest.Mock).mockResolvedValue(mockSession);
      (Chat.updateMany as jest.Mock).mockResolvedValue(mockUpdateResult);

      const result = await renameChat(mockChatID, mockMessage);

      expect(auth).toHaveBeenCalled();
      expect(Chat.updateMany).toHaveBeenCalledWith(
        {
          participant: new Types.ObjectId('mock-user-id'),
          chatID: mockChatID,
        },
        { $set: { chatInfo: { title: 'New Title', icon: '🚀' } } },
        { new: true }
      );
      expect(result).toEqual({
        success: true,
        message: JSON.parse(JSON.stringify(mockUpdateResult)),
      });
    });

    it('should return error when user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await renameChat('mock-chat-id', { title: 'New Title' });

      expect(auth).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        message: 'An error occurred while renaming the chat',
      });
    });

    it('should handle errors during chat renaming', async () => {
      const mockChatID = 'mock-chat-id';
      const mockMessage = { title: 'New Title' };

      (auth as jest.Mock).mockResolvedValue(mockSession);
      (Chat.updateMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await renameChat(mockChatID, mockMessage);

      expect(auth).toHaveBeenCalled();
      expect(Chat.updateMany).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        message: 'An error occurred while renaming the chat',
      });
    });
  });

  describe('pinChat', () => {
    it('should pin chat successfully when user is authenticated', async () => {
      const mockChatID = 'mock-chat-id';
      const mockPinStatus = true;
      const mockUpdateResult = { acknowledged: true, modifiedCount: 1 };

      (auth as jest.Mock).mockResolvedValue(mockSession);
      (Chat.updateMany as jest.Mock).mockResolvedValue(mockUpdateResult);

      const result = await pinChat(mockChatID, mockPinStatus);

      expect(auth).toHaveBeenCalled();
      expect(connectDB).toHaveBeenCalled();
      expect(Chat.updateMany).toHaveBeenCalledWith(
        {
          participant: new Types.ObjectId('mock-user-id'),
          chatID: mockChatID,
        },
        { $set: { isPinned: true } },
        { new: true }
      );
      expect(result).toEqual({
        success: true,
        message: JSON.parse(JSON.stringify(mockUpdateResult)),
      });
    });

    it('should unpin chat successfully when user is authenticated', async () => {
      const mockChatID = 'mock-chat-id';
      const mockPinStatus = false;
      const mockUpdateResult = { acknowledged: true, modifiedCount: 1 };

      (auth as jest.Mock).mockResolvedValue(mockSession);
      (Chat.updateMany as jest.Mock).mockResolvedValue(mockUpdateResult);

      const result = await pinChat(mockChatID, mockPinStatus);

      expect(auth).toHaveBeenCalled();
      expect(connectDB).toHaveBeenCalled();
      expect(Chat.updateMany).toHaveBeenCalledWith(
        {
          participant: new Types.ObjectId('mock-user-id'),
          chatID: mockChatID,
        },
        { $set: { isPinned: false } },
        { new: true }
      );
      expect(result).toEqual({
        success: true,
        message: JSON.parse(JSON.stringify(mockUpdateResult)),
      });
    });

    it('should return error when user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await pinChat('mock-chat-id', true);

      expect(auth).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        message: 'An error occurred while pinning the chat',
      });
    });

    it('should handle errors during pinning/unpinning chat', async () => {
      const mockChatID = 'mock-chat-id';
      const mockPinStatus = true;

      (auth as jest.Mock).mockResolvedValue(mockSession);
      (Chat.updateMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await pinChat(mockChatID, mockPinStatus);

      expect(auth).toHaveBeenCalled();
      expect(connectDB).toHaveBeenCalled();
      expect(Chat.updateMany).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        message: 'An error occurred while pinning the chat',
      });
    });
  });

  describe('updateResponse', () => {
    it('should update response successfully', async () => {
      const mockChatId = 'mock-chat-id';
      const updatedResponse = 'Updated response';
      const mockUpdatedChat = {
        _id: mockChatId,
        message: { userPrompt: 'Original prompt', llmResponse: 'Updated response' },
      };

      (Chat.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedChat);

      const result = await updateResponse({
        chatUniqueId: mockChatId,
        updatedResponse,
      });

      expect(Chat.findByIdAndUpdate).toHaveBeenCalledWith(
        mockChatId,
        {
          $set: {
            'message.llmResponse': updatedResponse,
          },
        },
        { new: true, runValidators: true }
      );
      expect(result).toEqual({
        success: true,
        message: JSON.parse(JSON.stringify(mockUpdatedChat)),
      });
    });

    it('should return error when chat is not found', async () => {
      (Chat.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await updateResponse({
        chatUniqueId: 'nonexistent-id',
        updatedResponse: 'Updated response',
      });

      expect(Chat.findByIdAndUpdate).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        message: 'Chat not found',
      });
    });

    it('should handle errors during response update', async () => {
      (Chat.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await updateResponse({
        chatUniqueId: 'mock-chat-id',
        updatedResponse: 'Updated response',
      });

      expect(Chat.findByIdAndUpdate).toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        message: 'An error occurred while updating response',
      });
    });
  });
});
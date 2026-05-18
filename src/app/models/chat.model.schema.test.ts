import mongoose from "mongoose";
import Chat from "./chat.model";

// Mock MongoDB connection for testing
jest.mock("mongoose", () => {
  const actualMongoose = jest.requireActual("mongoose");
  
  return {
    ...actualMongoose,
    connect: jest.fn(),
    disconnect: jest.fn(),
    models: {},
    model: jest.fn().mockImplementation((name, schema) => {
      // Return a mock model with basic operations
      return {
        schema,
        findOne: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
        path: (pathName: string) => {
          // Mock path method for schema field validation
          return schema.path(pathName);
        }
      };
    }),
  };
});

describe("Chat Model", () => {
  describe("Schema Definition", () => {
    it("should have the correct fields defined", () => {
      const schemaObj = (Chat.schema as any).obj;
      
      expect(schemaObj.participant).toBeDefined();
      expect(schemaObj.chatInfo).toBeDefined();
      expect(schemaObj.isPinned).toBeDefined();
      expect(schemaObj.chatID).toBeDefined();
      expect(schemaObj.message).toBeDefined();
    });

    it("should have participant field with correct type and reference", () => {
      const path = Chat.schema.path("participant");
      expect(path).toBeDefined();
      // @ts-ignore - accessing private property for testing
      expect((path as any)?.instance).toMatch(/ObjectID|ObjectId/); // Handle both variants
      const schemaObj = (Chat.schema as any).obj;
      expect(schemaObj.participant.ref).toBe("User");
    });

    it("should have chatInfo field with correct structure", () => {
      const schemaObj = (Chat.schema as any).obj;
      const chatInfo = schemaObj.chatInfo;
      expect(chatInfo).toBeDefined();
      
      const iconField = chatInfo.icon;
      expect(iconField.type).toBe(String);
      expect(iconField.default).toBeNull();
      
      const titleField = chatInfo.title;
      expect(titleField.type).toBe(String);
      expect(titleField.default).toBeNull();
    });

    it("should have isPinned field with correct type and default", () => {
      const schemaObj = (Chat.schema as any).obj;
      const isPinned = schemaObj.isPinned;
      expect(isPinned).toBeDefined();
      expect(isPinned.type).toBe(Boolean);
      expect(isPinned.default).toBe(false);
    });

    it("should have chatID field with required validation", () => {
      const schemaObj = (Chat.schema as any).obj;
      const chatID = schemaObj.chatID;
      expect(chatID).toBeDefined();
      expect(chatID.type).toBe(String);
      // The required property can be an array [true, "message"] or boolean
      if (Array.isArray(chatID.required)) {
        expect(chatID.required[0]).toBe(true);
      } else {
        expect(chatID.required).toBe(true);
      }
      expect(chatID.unique).toBeUndefined(); // Not explicitly unique, but may be intended
    });

    it("should have message field with correct structure", () => {
      const schemaObj = (Chat.schema as any).obj;
      const message = schemaObj.message;
      expect(message).toBeDefined();
      
      expect(message.userPrompt).toBe(String);
      expect(message.llmResponse).toBe(String);
      
      const imgNameField = message.imgName;
      expect(imgNameField.type).toBe(String);
      expect(imgNameField.default).toBeNull();
    });

    it("should have timestamps enabled", () => {
      expect((Chat.schema as any).options.timestamps).toBe(true);
    });
  });

  describe("Validation", () => {
    it("should validate required fields correctly", () => {
      // Test chatID is required
      const schemaObj = (Chat.schema as any).obj;
      const chatID = schemaObj.chatID;
      // The required property can be an array [true, "message"] or boolean
      if (Array.isArray(chatID.required)) {
        expect(chatID.required[0]).toBe(true);
      } else {
        expect(chatID.required).toBe(true);
      }
    });

    it("should have correct default values", () => {
      const schemaObj = (Chat.schema as any).obj;
      
      // Check default values
      expect(schemaObj.isPinned.default).toBe(false);
      expect(schemaObj.chatInfo.icon.default).toBeNull();
      expect(schemaObj.chatInfo.title.default).toBeNull();
      expect((schemaObj.message.imgName as any).default).toBeNull();
    });
  });
});
import Chat from "./chat.model";
import mongoose, { Schema } from "mongoose";

describe("Chat Model", () => {
  describe("Schema Structure", () => {
    it("should have the correct fields defined", () => {
      const schema = Chat.schema;
      
      // Check participant field
      expect(schema.path("participant")).toBeDefined();
      const participantPath = schema.path("participant");
      expect(participantPath).toBeDefined();
      if (participantPath) {
        expect((participantPath as any).instance).toBe("ObjectId");
        const participantOptions = (participantPath as any).options;
        expect(participantOptions?.ref).toBe("User");
      }

      // Check isPinned field
      expect(schema.path("isPinned")).toBeDefined();
      const isPinnedPath = schema.path("isPinned");
      expect(isPinnedPath).toBeDefined();
      if (isPinnedPath) {
        expect((isPinnedPath as any).instance).toBe("Boolean");
        expect((isPinnedPath as any).defaultValue).toBe(false);
      }

      // Check chatID field
      expect(schema.path("chatID")).toBeDefined();
      const chatIDPath = schema.path("chatID");
      expect(chatIDPath).toBeDefined();
      if (chatIDPath) {
        expect((chatIDPath as any).instance).toBe("String");
        const chatIDOptions = (chatIDPath as any).options;
        // The required property is an array [true, "Chat ID is required"]
        expect(Array.isArray(chatIDOptions?.required)).toBe(true);
        expect(chatIDOptions?.required[0]).toBe(true);
        expect(chatIDOptions?.required[1]).toBe("Chat ID is required");
      }
    });

    it("should have timestamps enabled", () => {
      const schemaOptions = (Chat.schema as any).options;
      expect(schemaOptions.timestamps).toBe(true);
    });

    it("should have nested chatInfo field structure", () => {
      const schema = Chat.schema;
      
      // Check nested fields explicitly
      expect(schema.path("chatInfo.icon")).toBeDefined();
      expect(schema.path("chatInfo.title")).toBeDefined();
      
      const iconPath = schema.path("chatInfo.icon");
      const titlePath = schema.path("chatInfo.title");
      
      if (iconPath) {
        expect((iconPath as any).instance).toBe("String");
        expect((iconPath as any).defaultValue).toBeNull();
      }
      
      if (titlePath) {
        expect((titlePath as any).instance).toBe("String");
        expect((titlePath as any).defaultValue).toBeNull();
      }
    });

    it("should have nested message field structure", () => {
      const schema = Chat.schema;
      
      // Check nested message fields
      expect(schema.path("message.userPrompt")).toBeDefined();
      expect(schema.path("message.llmResponse")).toBeDefined();
      expect(schema.path("message.imgName")).toBeDefined();
      
      const userPromptPath = schema.path("message.userPrompt");
      const llmResponsePath = schema.path("message.llmResponse");
      const imgNamePath = schema.path("message.imgName");
      
      if (userPromptPath) {
        expect((userPromptPath as any).instance).toBe("String");
      }
      
      if (llmResponsePath) {
        expect((llmResponsePath as any).instance).toBe("String");
      }
      
      if (imgNamePath) {
        expect((imgNamePath as any).instance).toBe("String");
        expect((imgNamePath as any).defaultValue).toBeNull();
      }
    });
  });
});
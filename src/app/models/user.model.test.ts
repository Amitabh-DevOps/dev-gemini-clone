import mongoose from "mongoose";
import User from "./user.model";

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

describe("User Model", () => {
  describe("Schema Definition", () => {
    it("should have the correct fields defined", () => {
      const schemaObj = (User.schema as any).obj;

      expect(schemaObj.username).toBeDefined();
      expect(schemaObj.email).toBeDefined();
      expect(schemaObj.image).toBeDefined();
    });

    it("should have username field with correct type and required validation", () => {
      const schemaObj = (User.schema as any).obj;
      const username = schemaObj.username;

      expect(username).toBeDefined();
      expect(username.type).toBe(String);

      // Check required validation
      if (Array.isArray(username.required)) {
        expect(username.required[0]).toBe(true);
        expect(username.required[1]).toBe("Name is required");
      } else {
        expect(username.required).toBe(true);
      }
    });

    it("should have email field with correct type, unique and required validation", () => {
      const schemaObj = (User.schema as any).obj;
      const email = schemaObj.email;

      expect(email).toBeDefined();
      expect(email.type).toBe(String);
      expect(email.unique).toBe(true);

      // Check required validation
      if (Array.isArray(email.required)) {
        expect(email.required[0]).toBe(true);
        expect(email.required[1]).toBe("Email is required");
      } else {
        expect(email.required).toBe(true);
      }
    });

    it("should have image field with correct type and required validation", () => {
      const schemaObj = (User.schema as any).obj;
      const image = schemaObj.image;

      expect(image).toBeDefined();
      expect(image.type).toBe(String);

      // Check required validation
      if (Array.isArray(image.required)) {
        expect(image.required[0]).toBe(true);
        expect(image.required[1]).toBe("Image is required");
      } else {
        expect(image.required).toBe(true);
      }
    });
  });

  describe("Validation", () => {
    it("should validate required fields correctly", () => {
      const schemaObj = (User.schema as any).obj;

      // Check username is required
      if (Array.isArray(schemaObj.username.required)) {
        expect(schemaObj.username.required[0]).toBe(true);
      } else {
        expect(schemaObj.username.required).toBe(true);
      }

      // Check email is required
      if (Array.isArray(schemaObj.email.required)) {
        expect(schemaObj.email.required[0]).toBe(true);
      } else {
        expect(schemaObj.email.required).toBe(true);
      }

      // Check image is required
      if (Array.isArray(schemaObj.image.required)) {
        expect(schemaObj.image.required[0]).toBe(true);
      } else {
        expect(schemaObj.image.required).toBe(true);
      }
    });

    it("should have unique constraint on email field", () => {
      const schemaObj = (User.schema as any).obj;

      expect(schemaObj.email.unique).toBe(true);
    });
  });
});
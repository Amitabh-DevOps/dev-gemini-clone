import { Message, SessionProps, MessageProps, ChatSectionProps } from './types';

// Test that the types are properly defined and can be used
describe('Types', () => {
  test('Message type should have required and optional fields', () => {
    const message: Message = {
      userPrompt: 'Test prompt',
      llmResponse: 'Test response',
      imgName: 'test-image.jpg' // optional field
    };

    expect(message.userPrompt).toBe('Test prompt');
    expect(message.llmResponse).toBe('Test response');
    expect(message.imgName).toBe('test-image.jpg');

    // Test without optional field
    const messageWithoutImg: Message = {
      userPrompt: 'Test prompt 2',
      llmResponse: 'Test response 2'
    };

    expect(messageWithoutImg.userPrompt).toBe('Test prompt 2');
    expect(messageWithoutImg.llmResponse).toBe('Test response 2');
    expect(messageWithoutImg.imgName).toBeUndefined();
  });

  test('SessionProps type should have all required fields', () => {
    const sessionProps: SessionProps = {
      email: 'test@example.com',
      id: '123',
      name: 'Test User',
      image: 'test-image.jpg'
    };

    expect(sessionProps.email).toBe('test@example.com');
    expect(sessionProps.id).toBe('123');
    expect(sessionProps.name).toBe('Test User');
    expect(sessionProps.image).toBe('test-image.jpg');
  });

  test('MessageProps type should have _id and message fields', () => {
    const messageProps: MessageProps = {
      _id: 'message-id-123',
      message: {
        userPrompt: 'Test prompt',
        llmResponse: 'Test response'
      }
    };

    expect(messageProps._id).toBe('message-id-123');
    expect(messageProps.message.userPrompt).toBe('Test prompt');
    expect(messageProps.message.llmResponse).toBe('Test response');
  });

  test('ChatSectionProps type should have data, image, and name fields', () => {
    const chatSectionProps: ChatSectionProps = {
      data: {
        message: [
          {
            _id: 'message-id-1',
            message: {
              userPrompt: 'Test prompt 1',
              llmResponse: 'Test response 1'
            }
          },
          {
            _id: 'message-id-2',
            message: {
              userPrompt: 'Test prompt 2',
              llmResponse: 'Test response 2',
              imgName: 'test-img.jpg'
            }
          }
        ]
      },
      image: 'user-image.jpg',
      name: 'Test User'
    };

    expect(chatSectionProps.data.message).toHaveLength(2);
    expect(chatSectionProps.image).toBe('user-image.jpg');
    expect(chatSectionProps.name).toBe('Test User');
    expect(chatSectionProps.data.message?.[0]._id).toBe('message-id-1');
    expect(chatSectionProps.data.message?.[1].message.imgName).toBe('test-img.jpg');
  });

  test('ChatSectionProps can have empty data', () => {
    const chatSectionProps: ChatSectionProps = {
      data: {},
      image: 'user-image.jpg',
      name: 'Test User'
    };

    expect(chatSectionProps.data.message).toBeUndefined();
    expect(chatSectionProps.image).toBe('user-image.jpg');
    expect(chatSectionProps.name).toBe('Test User');
  });
});
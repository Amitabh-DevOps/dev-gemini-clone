import geminiZustand from './gemini-zustand';
import { Message } from '../types/types';
import { User } from 'next-auth';

describe('geminiZustand', () => {
  beforeEach(() => {
    // Reset the store to initial state before each test by calling all setters with default values
    geminiZustand.getState().setMsgLoader(false);
    geminiZustand.getState().setPrevChat({ userPrompt: '', llmResponse: '' });
    geminiZustand.getState().setTopLoader(false);
    geminiZustand.getState().setCurrChat('userPrompt', '');
    geminiZustand.getState().setCurrChat('llmResponse', '');
    geminiZustand.getState().setUserData({} as User);
    geminiZustand.getState().setOptimisticResponse(null);
    geminiZustand.getState().setToast(null);
    geminiZustand.getState().setInputImgName(null);
    geminiZustand.getState().setOptimisticPrompt(null);
    geminiZustand.getState().setCustomPrompt({ prompt: null, placeholder: null });
  });

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      const state = geminiZustand.getState();
      
      expect(state.msgLoader).toBe(false);
      expect(state.prevChat).toEqual({ userPrompt: '', llmResponse: '' });
      expect(state.topLoader).toBe(false);
      expect(state.currChat).toEqual({ userPrompt: '', llmResponse: '' });
      expect(state.userData).toEqual({});
      expect(state.optimisticResponse).toBeNull();
      expect(state.devToast).toBeNull();
      expect(state.inputImgName).toBeNull();
      expect(state.optimisticPrompt).toBeNull();
      expect(state.customPrompt).toEqual({ prompt: null, placeholder: null });
    });
  });

  describe('setMsgLoader', () => {
    it('should update msgLoader state', () => {
      const stateBefore = geminiZustand.getState();
      expect(stateBefore.msgLoader).toBe(false);

      geminiZustand.getState().setMsgLoader(true);

      const stateAfter = geminiZustand.getState();
      expect(stateAfter.msgLoader).toBe(true);
    });

    it('should handle boolean values correctly', () => {
      geminiZustand.getState().setMsgLoader(true);
      expect(geminiZustand.getState().msgLoader).toBe(true);

      geminiZustand.getState().setMsgLoader(false);
      expect(geminiZustand.getState().msgLoader).toBe(false);
    });
  });

  describe('setTopLoader', () => {
    it('should update topLoader state', () => {
      const stateBefore = geminiZustand.getState();
      expect(stateBefore.topLoader).toBe(false);

      geminiZustand.getState().setTopLoader(true);

      const stateAfter = geminiZustand.getState();
      expect(stateAfter.topLoader).toBe(true);
    });
  });

  describe('setPrevChat', () => {
    it('should update prevChat state', () => {
      const newState: Message = { userPrompt: 'test prompt', llmResponse: 'test response' };
      const stateBefore = geminiZustand.getState();
      expect(stateBefore.prevChat).toEqual({ userPrompt: '', llmResponse: '' });

      geminiZustand.getState().setPrevChat(newState);

      const stateAfter = geminiZustand.getState();
      expect(stateAfter.prevChat).toEqual(newState);
    });

    it('should handle empty message', () => {
      const emptyMessage: Message = { userPrompt: '', llmResponse: '' };
      geminiZustand.getState().setPrevChat(emptyMessage);
      expect(geminiZustand.getState().prevChat).toEqual(emptyMessage);
    });
  });

  describe('setCurrChat', () => {
    it('should update userPrompt in currChat', () => {
      const stateBefore = geminiZustand.getState();
      expect(stateBefore.currChat.userPrompt).toBe('');

      geminiZustand.getState().setCurrChat('userPrompt', 'new prompt');

      const stateAfter = geminiZustand.getState();
      expect(stateAfter.currChat.userPrompt).toBe('new prompt');
      expect(stateAfter.currChat.llmResponse).toBe('');
    });

    it('should update llmResponse in currChat', () => {
      const stateBefore = geminiZustand.getState();
      expect(stateBefore.currChat.llmResponse).toBe('');

      geminiZustand.getState().setCurrChat('llmResponse', 'new response');

      const stateAfter = geminiZustand.getState();
      expect(stateAfter.currChat.llmResponse).toBe('new response');
      expect(stateAfter.currChat.userPrompt).toBe('');
    });

    it('should preserve other properties when updating one', () => {
      // First set one property
      geminiZustand.getState().setCurrChat('userPrompt', 'test prompt');
      
      // Then update another property
      geminiZustand.getState().setCurrChat('llmResponse', 'test response');

      const state = geminiZustand.getState();
      expect(state.currChat.userPrompt).toBe('test prompt');
      expect(state.currChat.llmResponse).toBe('test response');
    });
  });

  describe('setUserData', () => {
    it('should update userData state', () => {
      const newUser: User = { name: 'Test User', email: 'test@example.com' } as User;
      const stateBefore = geminiZustand.getState();
      expect(stateBefore.userData).toEqual({});

      geminiZustand.getState().setUserData(newUser);

      const stateAfter = geminiZustand.getState();
      expect(stateAfter.userData).toEqual(newUser);
    });

    it('should handle empty user object', () => {
      const emptyUser = {} as User;
      geminiZustand.getState().setUserData(emptyUser);
      expect(geminiZustand.getState().userData).toEqual(emptyUser);
    });
  });

  describe('setOptimisticResponse', () => {
    it('should update optimisticResponse state', () => {
      const stateBefore = geminiZustand.getState();
      expect(stateBefore.optimisticResponse).toBeNull();

      geminiZustand.getState().setOptimisticResponse('test response');

      const stateAfter = geminiZustand.getState();
      expect(stateAfter.optimisticResponse).toBe('test response');
    });

    it('should handle null value', () => {
      geminiZustand.getState().setOptimisticResponse('test response');
      expect(geminiZustand.getState().optimisticResponse).toBe('test response');

      geminiZustand.getState().setOptimisticResponse(null);
      expect(geminiZustand.getState().optimisticResponse).toBeNull();
    });
  });

  describe('setToast', () => {
    it('should update devToast state', () => {
      const stateBefore = geminiZustand.getState();
      expect(stateBefore.devToast).toBeNull();

      geminiZustand.getState().setToast('test toast');

      const stateAfter = geminiZustand.getState();
      expect(stateAfter.devToast).toBe('test toast');
    });

    it('should handle null value', () => {
      geminiZustand.getState().setToast('test toast');
      expect(geminiZustand.getState().devToast).toBe('test toast');

      geminiZustand.getState().setToast(null);
      expect(geminiZustand.getState().devToast).toBeNull();
    });
  });

  describe('setInputImgName', () => {
    it('should update inputImgName state', () => {
      const stateBefore = geminiZustand.getState();
      expect(stateBefore.inputImgName).toBeNull();

      geminiZustand.getState().setInputImgName('test-image.jpg');

      const stateAfter = geminiZustand.getState();
      expect(stateAfter.inputImgName).toBe('test-image.jpg');
    });

    it('should handle null value', () => {
      geminiZustand.getState().setInputImgName('test-image.jpg');
      expect(geminiZustand.getState().inputImgName).toBe('test-image.jpg');

      geminiZustand.getState().setInputImgName(null);
      expect(geminiZustand.getState().inputImgName).toBeNull();
    });
  });

  describe('setOptimisticPrompt', () => {
    it('should update optimisticPrompt state', () => {
      const stateBefore = geminiZustand.getState();
      expect(stateBefore.optimisticPrompt).toBeNull();

      geminiZustand.getState().setOptimisticPrompt('test prompt');

      const stateAfter = geminiZustand.getState();
      expect(stateAfter.optimisticPrompt).toBe('test prompt');
    });

    it('should handle null value', () => {
      geminiZustand.getState().setOptimisticPrompt('test prompt');
      expect(geminiZustand.getState().optimisticPrompt).toBe('test prompt');

      geminiZustand.getState().setOptimisticPrompt(null);
      expect(geminiZustand.getState().optimisticPrompt).toBeNull();
    });
  });

  describe('setCustomPrompt', () => {
    it('should update customPrompt state with prompt and placeholder', () => {
      const newState = { prompt: 'custom prompt', placeholder: 'enter text' };
      const stateBefore = geminiZustand.getState();
      expect(stateBefore.customPrompt).toEqual({ prompt: null, placeholder: null });

      geminiZustand.getState().setCustomPrompt(newState);

      const stateAfter = geminiZustand.getState();
      expect(stateAfter.customPrompt).toEqual(newState);
    });

    it('should handle null values for individual properties', () => {
      const newState = { prompt: null, placeholder: null };
      geminiZustand.getState().setCustomPrompt(newState);
      expect(geminiZustand.getState().customPrompt).toEqual(newState);
    });

    it('should handle partial null values', () => {
      const newState = { prompt: 'some prompt', placeholder: null };
      geminiZustand.getState().setCustomPrompt(newState);
      expect(geminiZustand.getState().customPrompt).toEqual(newState);

      const newState2 = { prompt: null, placeholder: 'some placeholder' };
      geminiZustand.getState().setCustomPrompt(newState2);
      expect(geminiZustand.getState().customPrompt).toEqual(newState2);
    });
  });

  describe('action methods existence', () => {
    it('should have all required action methods', () => {
      const state = geminiZustand.getState();
      
      expect(typeof state.setMsgLoader).toBe('function');
      expect(typeof state.setPrevChat).toBe('function');
      expect(typeof state.setTopLoader).toBe('function');
      expect(typeof state.setCurrChat).toBe('function');
      expect(typeof state.setUserData).toBe('function');
      expect(typeof state.setOptimisticResponse).toBe('function');
      expect(typeof state.setToast).toBe('function');
      expect(typeof state.setInputImgName).toBe('function');
      expect(typeof state.setOptimisticPrompt).toBe('function');
      expect(typeof state.setCustomPrompt).toBe('function');
    });
  });
});
import { jest } from '@jest/globals';
import type { Dependencies } from '../utils';
import type { 
  LongLivedToken, 
  FacebookPage, 
  FbEventResponse, 
  FirestorePage 
} from '../types';

// Mock FacebookService - Use jest.fn() without type assertions
export const createMockFacebookService = () => ({
  getShortLivedToken: jest.fn<(code: string) => Promise<string>>(),
  getLongLivedToken: jest.fn<(shortToken: string) => Promise<LongLivedToken>>(),
  getPagesFromUser: jest.fn<(userToken: string) => Promise<FacebookPage[]>>(),
  getPageEvents: jest.fn<(pageId: string, pageToken: string) => Promise<FbEventResponse[]>>(),
  refreshLongLivedToken: jest.fn<(oldToken: string) => Promise<LongLivedToken>>(),
});

// Mock SecretManagerService
export const createMockSecretManagerService = () => ({
  addPageToken: jest.fn<(pageId: string, token: string, expiresIn: number) => Promise<void>>(),
  getPageToken: jest.fn<(pageId: string) => Promise<string | null>>(),
  checkTokenExpiry: jest.fn<(pageId: string) => Promise<boolean>>(),
  markTokenExpired: jest.fn<(pageId: string) => Promise<void>>(),
});

// Mock StorageService
export const createMockStorageService = () => ({
  addImage: jest.fn<(path: string, buffer: Buffer, contentType: string) => Promise<string>>(),
  addImageFromUrl: jest.fn<(path: string, url: string) => Promise<string>>(),
  getImage: jest.fn<(path: string) => Promise<string | null>>(),
  removeImage: jest.fn<(path: string) => Promise<void>>(),
});

// Mock FirestoreService
export const createMockFirestoreService = () => ({
  addPage: jest.fn<(pageId: string, data: any) => Promise<void>>(),
  updatePage: jest.fn<(pageId: string, data: Record<string, any>) => Promise<void>>(),
  getPages: jest.fn<() => Promise<(FirestorePage & { id: string })[]>>(),
  addEvents: jest.fn<(pageId: string, events: any[]) => Promise<{ upserted: number }>>(),
});

// Create full mock dependencies
export const createMockDependencies = (): Dependencies => ({
  facebookService: createMockFacebookService() as any,
  secretManagerService: createMockSecretManagerService() as any,
  storageService: createMockStorageService() as any,
  firestoreService: createMockFirestoreService() as any,
});
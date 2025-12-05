import * as admin from 'firebase-admin';
import {
  FacebookService,
  SecretManagerService,
  StorageService,
  FirestoreService,
} from '../src/services';
import type { Dependencies } from '../src/utils';

function ensureAdminInitialized() {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
}

export function buildDeps(): Dependencies {
  ensureAdminInitialized();

  const facebookService = new FacebookService();
  const secretManagerService = new SecretManagerService();
  const storageService = new StorageService(admin.storage().bucket());
  const firestoreService = new FirestoreService(admin.firestore());

  return { facebookService, secretManagerService, storageService, firestoreService };
}
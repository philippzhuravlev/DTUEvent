import { FacebookService, SecretManagerService, StorageService, FirestoreService } from '../services';

// Dependency injection = passing objects into functions instead of importing them directly. This means 
// that instead of the functions importing Firestore, FacebookService, SecretManagerService, etc.,
// they receive instances as parameters (i.e. inside function(parameters)). Also helps with testing

export type Dependencies = {
    facebookService: FacebookService;
    secretManagerService: SecretManagerService;
    storageService: StorageService;
    firestoreService: FirestoreService;
};

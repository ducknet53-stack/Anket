export interface Poll {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  votesA: number;
  votesB: number;
  createdBy: string;
  creatorName: string;
  createdAt: any; // Firestore Timestamp
  voters: Record<string, number>; // userId -> 0 (optionA) or 1 (optionB)
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId: string;
}

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    addDoc,
    serverTimestamp,
    where
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Firestore fetching helper functions
export interface QuizQuestion {
    text: string;
    type: 'single' | 'multi';
    explanation: string;
    options: { id: string; text: string }[];
    correctOptionId?: string;
    correctOptionIds?: string[];
}

export interface Quiz {
    id: string;
    title: string;
    questions?: QuizQuestion[];
}

export interface Subject {
    id: string;
    name: string;
    order: number;
    quizzes?: Quiz[];
}

export const getSubjects = async () => {
    const subjectsCol = collection(db, 'subjects');
    const q = query(subjectsCol, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Subject[];
};

export const getQuizzes = async (subjectId: string) => {
    const quizzesCol = collection(db, `subjects/${subjectId}/quizzes`);
    const snapshot = await getDocs(quizzesCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Quiz[];
};

export const getQuizDetails = async (subjectId: string, quizId: string) => {
    const quizDoc = doc(db, `subjects/${subjectId}/quizzes/${quizId}`);
    const snapshot = await getDoc(quizDoc);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Quiz;
};

// --- Content Management (Admin) ---

export const addSubject = async (name: string, order: number) => {
    const subjectsCol = collection(db, 'subjects');
    await addDoc(subjectsCol, { name, order });
};

export const deleteSubject = async (subjectId: string) => {
    await deleteDoc(doc(db, 'subjects', subjectId));
};

export const addQuiz = async (subjectId: string, title: string) => {
    const quizzesCol = collection(db, `subjects/${subjectId}/quizzes`);
    await addDoc(quizzesCol, { title, questions: [] });
};

export const deleteQuiz = async (subjectId: string, quizId: string) => {
    await deleteDoc(doc(db, `subjects/${subjectId}/quizzes/${quizId}`));
};

export const updateQuizQuestions = async (subjectId: string, quizId: string, questions: QuizQuestion[]) => {
    const quizRef = doc(db, `subjects/${subjectId}/quizzes/${quizId}`);
    await updateDoc(quizRef, { questions });
};

// --- Phase 6: Admin & User Management ---

export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    role: 'user' | 'admin' | 'owner';
    status: 'active' | 'banned';
    createdAt: number;
}

export interface MistakeQuestion {
    questionText: string;
    options: { id: string; text: string }[];
    selectedOptionIds: string[];
    correctOptionIds: string[];
    explanation: string;
}

export interface SubjectMistakes {
    subjectId: string;
    quizzes: {
        quizId: string;
        quizTitle: string;
        questions: MistakeQuestion[];
    }[];
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const docRef = doc(db, 'users', uid);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return snapshot.data() as UserProfile;
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => doc.data() as UserProfile);
};

export const updateUserRole = async (uid: string, role: string) => {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, { role });
};

export const updateUserStatus = async (uid: string, status: string) => {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, { status });
};

export const deleteUserRecord = async (uid: string) => {
    const docRef = doc(db, 'users', uid);
    await deleteDoc(docRef);
};

export const createInitialProfile = async (uid: string, email: string) => {
    const docRef = doc(db, 'users', uid);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
        await setDoc(docRef, {
            uid,
            email,
            role: 'user', // Default role for new signups
            status: 'active',
            createdAt: serverTimestamp()
        });
    }
};

// --- Mistakes System ---

export const saveMistakes = async (userId: string, subjectId: string, quizId: string, quizTitle: string, questions: MistakeQuestion[]) => {
    if (questions.length === 0) return;

    // We'll use a flatter structure for better querying: users/{userId}/mistakes/{subjectId}_{quizId}
    const docId = `${subjectId}_${quizId}`;
    const docRef = doc(db, 'users', userId, 'mistakes', docId);

    await setDoc(docRef, {
        subjectId,
        quizId,
        quizTitle,
        questions,
        updatedAt: serverTimestamp()
    });
};

export const getMistakesCount = async (userId: string, subjectId: string): Promise<number> => {
    const mistakesCol = collection(db, 'users', userId, 'mistakes');
    const q = query(mistakesCol, where('subjectId', '==', subjectId));
    const snapshot = await getDocs(q);
    return snapshot.size;
};

export const getSubjectMistakes = async (userId: string, subjectId: string): Promise<SubjectMistakes | null> => {
    const mistakesCol = collection(db, 'users', userId, 'mistakes');
    const q = query(mistakesCol, where('subjectId', '==', subjectId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const quizzes = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            quizId: data.quizId,
            quizTitle: data.quizTitle,
            questions: data.questions as MistakeQuestion[]
        };
    });

    return {
        subjectId,
        quizzes
    };
};

export { auth, db };

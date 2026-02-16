import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!projectId) {
    console.error('Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID not found in .env.local');
    process.exit(1);
}

// Initialize Admin SDK
// Note: This expects either a serviceAccount.json in this directory 
// or GOOGLE_APPLICATION_CREDENTIALS environment variable.
try {
    const serviceAccountPath = path.resolve(__dirname, './serviceAccount.json');
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId
    });
} catch {
    console.log('No serviceAccount.json found, attempting to use default credentials...');
    admin.initializeApp({
        projectId: projectId
    });
}

const db = admin.firestore();

const seedData = [
    {
        id: 'math',
        name: 'Mathematics',
        order: 1,
        quizzes: [
            {
                id: 'math-q1',
                title: 'Calculus I - Limits',
                questions: [
                    {
                        text: 'What is the limit of (sin x)/x as x approaches 0?',
                        type: 'single',
                        explanation: 'The limit of (sin x)/x as x approaches 0 is a fundamental limit equal to 1.',
                        options: [
                            { id: 'a', text: '0' },
                            { id: 'b', text: '1' },
                            { id: 'c', text: 'Infinity' },
                            { id: 'd', text: 'Undefined' }
                        ],
                        correctOptionId: 'b'
                    },
                    {
                        text: 'Which of the following are prime numbers?',
                        type: 'multi',
                        explanation: '2, 3, 5, and 7 are prime numbers.',
                        options: [
                            { id: 'a', text: '1' },
                            { id: 'b', text: '2' },
                            { id: 'c', text: '4' },
                            { id: 'd', text: '7' }
                        ],
                        correctOptionIds: ['b', 'd']
                    }
                ]
            }
        ]
    },
    {
        id: 'physics',
        name: 'Physics',
        order: 2,
        quizzes: [
            {
                id: 'phys-q1',
                title: 'Newtonian Laws',
                questions: [
                    {
                        text: 'What is Newton\'s second law?',
                        type: 'single',
                        explanation: 'F = ma (Force equals mass times acceleration) is the second law of motion.',
                        options: [
                            { id: 'a', text: 'F = m/a' },
                            { id: 'b', text: 'F = ma' },
                            { id: 'c', text: 'F = 1/2 mv^2' },
                            { id: 'd', text: 'a = F/m' }
                        ],
                        correctOptionId: 'b'
                    }
                ]
            }
        ]
    }
];

async function seed() {
    console.log('Starting Firestore seeding...');

    for (const subject of seedData) {
        const subjectRef = db.collection('subjects').doc(subject.id);
        await subjectRef.set({
            name: subject.name,
            order: subject.order
        });
        console.log(`Seeded subject: ${subject.name}`);

        for (const quiz of subject.quizzes) {
            const quizRef = subjectRef.collection('quizzes').doc(quiz.id);
            await quizRef.set({
                title: quiz.title,
                questions: quiz.questions
            });
            console.log(`  Seeded quiz: ${quiz.title}`);
        }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
}

seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});

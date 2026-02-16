export interface Quiz {
    id: string;
    title: string;
    type: 'mcq' | 'pdf';
}

export interface Subject {
    id: string;
    title: string;
    description: string;
    quizzes: Quiz[];
}

export const subjectsMock: Subject[] = [
    {
        id: 'math',
        title: 'Mathematics',
        description: 'Calculus, Algebra, and Geometry fundamentals.',
        quizzes: [
            { id: 'math-q1', title: 'Calculus I - Limits', type: 'mcq' },
            { id: 'math-q2', title: 'Linear Algebra Basics', type: 'mcq' },
            { id: 'math-pdf-1', title: 'Math Formulas Cheat Sheet', type: 'pdf' }
        ]
    },
    {
        id: 'physics',
        title: 'Physics',
        description: 'Classical Mechanics and Thermodynamics.',
        quizzes: [
            { id: 'phys-q1', title: 'Newtonian Laws', type: 'mcq' },
            { id: 'phys-q2', title: 'Thermodynamics Quiz', type: 'mcq' }
        ]
    },
    {
        id: 'biology',
        title: 'Biology',
        description: 'Cell biology, genetics, and evolution.',
        quizzes: [
            { id: 'bio-q1', title: 'Cell Structure', type: 'mcq' },
            { id: 'bio-q2', title: 'Genetic Inheritance', type: 'mcq' }
        ]
    },
    {
        id: 'chemistry',
        title: 'Chemistry',
        description: 'Organic and Inorganic Chemistry principles.',
        quizzes: [
            { id: 'chem-q1', title: 'Periodic Table Mastery', type: 'mcq' },
            { id: 'chem-q2', title: 'Organic Reaction Mechanisms', type: 'mcq' }
        ]
    }
];

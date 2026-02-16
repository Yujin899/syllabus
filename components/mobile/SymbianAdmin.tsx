import React, { useState } from 'react';
import {
    getAllUsers, UserProfile,
    getSubjects, addSubject, deleteSubject, Subject,
    getQuizzes, addQuiz, deleteQuiz, Quiz,
    getQuizDetails, updateQuizQuestions, QuizQuestion
} from '@/lib/firebase';
import { Loader2, Shield, User, RefreshCw, Folder, FileText, Plus, Trash2, ChevronRight, ArrowLeft, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Types ---
type AdminView = 'home' | 'users' | 'subjects' | 'subject-detail' | 'quiz-detail' | 'add-question';

interface SubjectViewData {
    id: string;
    name: string;
}

interface QuizViewData {
    subjectId: string;
    quizId: string;
    title: string;
}

interface QuestionViewData {
    subjectId: string;
    quizId: string;
}

type ViewData = SubjectViewData | QuizViewData | QuestionViewData | Subject;

export function SymbianAdmin() {
    const [viewStack, setViewStack] = useState<{ view: AdminView, data?: ViewData }>([{ view: 'home' }]);
    const [loading, setLoading] = useState(false);

    // Data State
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);

    // Form State
    const [newItemName, setNewItemName] = useState('');

    const currentView = viewStack[viewStack.length - 1];

    // --- Navigation ---
    const navigate = (view: AdminView, data?: ViewData) => {
        setViewStack([...viewStack, { view, data }]);
        setNewItemName(''); // Reset form
    };

    const goBack = () => {
        if (viewStack.length > 1) {
            const newStack = [...viewStack];
            newStack.pop();
            setViewStack(newStack);
        }
    };

    // --- Data Fetching ---
    const loadUsers = async () => {
        setLoading(true);
        try { const res = await getAllUsers(); setUsers(res); } finally { setLoading(false); }
    };

    const loadSubjects = async () => {
        setLoading(true);
        try { const res = await getSubjects(); setSubjects(res); } finally { setLoading(false); }
    };

    const loadQuizzes = async (subjectId: string) => {
        setLoading(true);
        try { const res = await getQuizzes(subjectId); setQuizzes(res); } finally { setLoading(false); }
    };

    const loadQuizDetails = async (subjectId: string, quizId: string) => {
        setLoading(true);
        try {
            const res = await getQuizDetails(subjectId, quizId);
            setCurrentQuiz(res);
        } finally { setLoading(false); }
    };

    // --- Actions ---
    const handleAddSubject = async () => {
        if (!newItemName.trim()) return;
        setLoading(true);
        try {
            await addSubject(newItemName, subjects.length);
            await loadSubjects();
            setNewItemName('');
        } finally { setLoading(false); }
    };

    const handleDeleteSubject = async (id: string) => {
        if (!confirm('Delete this subject and all its quizzes?')) return;
        setLoading(true);
        try {
            await deleteSubject(id);
            await loadSubjects();
            goBack(); // If in detail view
        } finally { setLoading(false); }
    };

    const handleAddQuiz = async () => {
        if (!newItemName.trim()) return;
        const subjectId = (currentView.data as Subject).id;
        setLoading(true);
        try {
            await addQuiz(subjectId, newItemName);
            await loadQuizzes(subjectId);
            setNewItemName('');
        } finally { setLoading(false); }
    };

    const handleDeleteQuiz = async (id: string) => {
        if (!confirm('Delete this quiz?')) return;
        setLoading(true);
        try {
            await deleteQuiz((currentView.data as Subject).id, id);
            await loadQuizzes((currentView.data as Subject).id);
        } finally { setLoading(false); }
    };

    // --- Renderers ---

    // 1. Home Menu
    if (currentView.view === 'home') {
        return (
            <div className="flex flex-col h-full bg-[#121212] font-sans text-white">
                <div className="p-4 flex items-center gap-3 border-b border-[#333]">
                    <Shield className="w-8 h-8 text-[#0055AA]" />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold">Admin Tools</span>
                        <span className="text-[10px] text-[#888]">System Management</span>
                    </div>
                </div>
                <div className="p-2 flex flex-col gap-2">
                    <div onClick={() => { loadUsers(); navigate('users'); }} className="bg-[#222] p-3 rounded-sm border border-[#333] active:bg-[#0055AA] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-[#AAA]" />
                            <span>Manage Users</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#555]" />
                    </div>
                    <div onClick={() => { loadSubjects(); navigate('subjects'); }} className="bg-[#222] p-3 rounded-sm border border-[#333] active:bg-[#0055AA] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Folder className="w-5 h-5 text-[#FFCC00]" />
                            <span>Manage Content</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#555]" />
                    </div>
                </div>
            </div>
        );
    }

    // 2. Users List
    if (currentView.view === 'users') {
        return (
            <div className="flex flex-col h-full bg-[#121212] font-sans text-white">
                <Header title="Users" onBack={goBack} onRefresh={loadUsers} loading={loading} />
                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                    {users.map(u => (
                        <div key={u.uid} className="bg-[#222] p-3 rounded-sm border border-[#333] flex flex-col gap-1">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-sm">{u.displayName || 'No Name'}</span>
                                <span className={cn("text-[9px] px-1 rounded-xs uppercase", u.role === 'owner' ? "bg-[#500]" : "bg-[#333]")}>{u.role}</span>
                            </div>
                            <span className="text-[10px] text-[#888]">{u.email}</span>
                            <div className="text-[10px] text-[#666]">Status: {u.status}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 3. Subjects List
    if (currentView.view === 'subjects') {
        return (
            <div className="flex flex-col h-full bg-[#121212] font-sans text-white">
                <Header title="Subjects" onBack={goBack} onRefresh={loadSubjects} loading={loading} />
                <div className="p-2 border-b border-[#333] flex gap-2">
                    <input
                        value={newItemName}
                        onChange={e => setNewItemName(e.target.value)}
                        placeholder="New Subject Name"
                        className="flex-1 bg-[#222] border border-[#444] text-xs p-2 rounded-sm text-white outline-none focus:border-[#0055AA]"
                    />
                    <button onClick={handleAddSubject} className="bg-[#0055AA] p-2 rounded-sm text-white disabled:opacity-50" disabled={!newItemName}>
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                    {subjects.map(s => (
                        <div key={s.id} onClick={() => { loadQuizzes(s.id); navigate('subject-detail', s); }} className="bg-[#222] p-3 rounded-sm border border-[#333] active:bg-[#0055AA] flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <Folder className="w-5 h-5 text-[#FFCC00]" />
                                <span>{s.name}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#555] group-active:text-white" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 4. Subject Detail (Quizzes List)
    if (currentView.view === 'subject-detail') {
        const subject = currentView.data as Subject;
        return (
            <div className="flex flex-col h-full bg-[#121212] font-sans text-white">
                <Header title={subject.name} onBack={goBack} loading={loading}
                    action={<button onClick={() => handleDeleteSubject(subject.id)}><Trash2 className="w-4 h-4 text-[#F44]" /></button>}
                />
                <div className="p-2 border-b border-[#333] flex gap-2">
                    <input
                        value={newItemName}
                        onChange={e => setNewItemName(e.target.value)}
                        placeholder="New Quiz Title"
                        className="flex-1 bg-[#222] border border-[#444] text-xs p-2 rounded-sm text-white outline-none focus:border-[#0055AA]"
                    />
                    <button onClick={handleAddQuiz} className="bg-[#0055AA] p-2 rounded-sm text-white disabled:opacity-50" disabled={!newItemName}>
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                    {quizzes.map(q => (
                        <div key={q.id} className="bg-[#222] p-3 rounded-sm border border-[#333] flex items-center justify-between">
                            <div
                                onClick={() => { loadQuizDetails(subject.id, q.id); navigate('quiz-detail', { subjectId: subject.id, quizId: q.id, title: q.title }); }}
                                className="flex items-center gap-3 flex-1"
                            >
                                <FileText className="w-5 h-5 text-[#88BBFF]" />
                                <span>{q.title}</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(q.id); }} className="p-2">
                                <Trash2 className="w-4 h-4 text-[#666] hover:text-[#F44]" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 5. Quiz Detail (Questions List)
    if (currentView.view === 'quiz-detail') {
        const quizData = currentView.data as QuizViewData;
        return (
            <div className="flex flex-col h-full bg-[#121212] font-sans text-white">
                <Header title={quizData.title} onBack={goBack} loading={loading} />

                <div className="p-2 border-b border-[#333]">
                    <button onClick={() => navigate('add-question', { subjectId: quizData.subjectId, quizId: quizData.quizId })} className="w-full bg-[#0055AA] p-2 rounded-sm text-white flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Add Question
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-3">
                    {currentQuiz?.questions?.map((q, i) => (
                        <div key={i} className="bg-[#222] p-3 rounded-sm border border-[#333] flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-xs text-[#AAA]">Q{i + 1}</span>
                                <div className="px-1 bg-[#333] rounded-xs text-[9px]">{q.type}</div>
                            </div>
                            <p className="text-sm font-serif">{q.text}</p>
                            <div className="pl-2 border-l-2 border-[#444] flex flex-col gap-1">
                                {q.options.map((opt) => (
                                    <div key={opt.id} className={cn("text-xs", (q.correctOptionId === opt.id || q.correctOptionIds?.includes(opt.id)) ? "text-green-500 font-bold" : "text-[#888]")}>
                                        - {opt.text}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-1 pt-1 border-t border-[#333] text-[9px] text-[#666] italic">
                                {q.explanation}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 6. Add/Edit Question Form
    if (currentView.view === 'add-question') {
        const qData = currentView.data as QuestionViewData;
        return <QuestionEditor
            onSave={async (q) => {
                setLoading(true);
                try {
                    const updatedQuestions = [...(currentQuiz?.questions || []), q];
                    await updateQuizQuestions(qData.subjectId, qData.quizId, updatedQuestions);
                    await loadQuizDetails(qData.subjectId, qData.quizId);
                    goBack();
                } finally { setLoading(false); }
            }}
            onCancel={goBack}
        />;
    }

    return null;
}

// --- Sub-components ---

function Header({ title, onBack, onRefresh, loading, action }: { title: string, onBack: () => void, onRefresh?: () => void, loading?: boolean, action?: React.ReactNode }) {
    return (
        <div className="h-10 bg-[#1E1E1E] border-b border-[#333] flex items-center px-2 gap-2 shadow-sm shrink-0 justify-between">
            <div className="flex items-center gap-2">
                <button onClick={onBack} className="p-1 hover:bg-[#333] rounded-sm active:bg-[#444]">
                    <ArrowLeft className="w-4 h-4 text-[#AAA]" />
                </button>
                <h1 className="text-sm font-bold truncate max-w-[150px]">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
                {action}
                {onRefresh && (
                    <button onClick={onRefresh} className="p-1 hover:bg-[#333] rounded-sm active:bg-[#444]">
                        {loading ? <Loader2 className="w-4 h-4 text-[#AAA] animate-spin" /> : <RefreshCw className="w-4 h-4 text-[#AAA]" />}
                    </button>
                )}
            </div>
        </div>
    );
}

function QuestionEditor({ onSave, onCancel }: { onSave: (q: QuizQuestion) => void, onCancel: () => void }) {
    const [text, setText] = useState('');
    const [explanation, setExplanation] = useState('');
    const [type, setType] = useState<'single' | 'multi'>('single');
    const [options, setOptions] = useState<{ id: string, text: string }[]>([{ id: '1', text: '' }, { id: '2', text: '' }]);
    const [correct, setCorrect] = useState<string[]>([]);

    const handleSave = () => {
        if (!text || !explanation) return alert('Fill all fields');
        if (correct.length === 0) return alert('Select correct option');

        onSave({
            text,
            explanation,
            type,
            options: options.filter(o => o.text.trim() !== ''),
            correctOptionIds: correct,
            correctOptionId: type === 'single' ? correct[0] : undefined
        });
    };

    return (
        <div className="flex flex-col h-full bg-[#121212] font-sans text-white">
            <div className="h-10 bg-[#1E1E1E] border-b border-[#333] flex items-center px-2 gap-2 justify-between">
                <button onClick={onCancel} className="p-1 hover:bg-[#333] rounded-sm">
                    <X className="w-4 h-4 text-[#AAA]" />
                </button>
                <span className="font-bold text-sm">New Question</span>
                <button onClick={handleSave} className="p-1 hover:bg-[#333] rounded-sm text-[#00AA00]">
                    <Check className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#888]">Question Text</label>
                    <textarea value={text} onChange={e => setText(e.target.value)} className="bg-[#222] border border-[#444] p-2 rounded-sm text-xs h-20 outline-none focus:border-[#0055AA]" />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#888]">Type</label>
                    <div className="flex gap-2">
                        <button onClick={() => setType('single')} className={cn("px-3 py-1 text-xs border rounded-sm", type === 'single' ? "bg-[#0055AA] border-[#0055AA]" : "bg-[#222] border-[#444]")}>Single Choice</button>
                        <button onClick={() => setType('multi')} className={cn("px-3 py-1 text-xs border rounded-sm", type === 'multi' ? "bg-[#0055AA] border-[#0055AA]" : "bg-[#222] border-[#444]")}>Multi Choice</button>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] text-[#888]">Options</label>
                        <button onClick={() => setOptions([...options, { id: Date.now().toString(), text: '' }])} className="text-xs text-[#0055AA]">+ Add Option</button>
                    </div>
                    {options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={correct.includes(opt.id)}
                                onChange={e => {
                                    if (type === 'single') {
                                        setCorrect(e.target.checked ? [opt.id] : []);
                                    } else {
                                        setCorrect(e.target.checked ? [...correct, opt.id] : correct.filter(c => c !== opt.id));
                                    }
                                }}
                                className="w-4 h-4 accent-[#0055AA]"
                            />
                            <input
                                value={opt.text}
                                onChange={e => {
                                    const newOpts = [...options];
                                    newOpts[idx].text = e.target.value;
                                    setOptions(newOpts);
                                }}
                                placeholder={`Option ${idx + 1}`}
                                className="flex-1 bg-[#222] border border-[#444] p-1.5 rounded-sm text-xs outline-none focus:border-[#0055AA]"
                            />
                            <button onClick={() => setOptions(options.filter((_, i) => i !== idx))}><X className="w-3 h-3 text-[#666]" /></button>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#888]">Explanation</label>
                    <textarea value={explanation} onChange={e => setExplanation(e.target.value)} className="bg-[#222] border border-[#444] p-2 rounded-sm text-xs h-16 outline-none focus:border-[#0055AA]" />
                </div>
            </div>
        </div>
    );
}

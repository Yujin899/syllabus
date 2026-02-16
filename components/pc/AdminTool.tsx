
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    getAllUsers,
    updateUserRole,
    updateUserStatus,
    deleteUserRecord,
    UserProfile,
    getSubjects,
    addSubject,
    deleteSubject,
    getQuizzes,
    addQuiz,
    deleteQuiz,
    updateQuizQuestions,
    Subject,
    Quiz,
    QuizQuestion
} from '@/lib/firebase';
import {
    Loader2,
    Shield,
    UserX,
    UserCheck,
    Trash2,
    ShieldAlert,
    UserPlus,
    BookOpen,
    FileText,
    Code,
    Plus,
    Copy,
    Upload,
    Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminTool() {
    const { profile, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<'subjects' | 'quizzes' | 'json' | 'users' | 'database'>('subjects');
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    // Data States
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

    // Form States
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectOrder, setNewSubjectOrder] = useState(1);
    const [newQuizTitle, setNewQuizTitle] = useState('');

    // JSON Import State
    const [jsonInput, setJsonInput] = useState('');
    const [importSubjectId, setImportSubjectId] = useState('');
    const [importQuizId, setImportQuizId] = useState('');
    const [importQuizzes, setImportQuizzes] = useState<Quiz[]>([]);

    const fetchAllSubjects = useCallback(async () => {
        const data = await getSubjects();
        setSubjects(data);
    }, []);

    const fetchSubjectQuizzes = useCallback(async (subId: string) => {
        if (!subId) {
            setQuizzes([]);
            return;
        }
        setLoading(true);
        const data = await getQuizzes(subId);
        setQuizzes(data);
        setLoading(false);
    }, []);

    const fetchUsers = useCallback(async () => {
        if (profile?.role === 'owner') {
            const fetchedUsers = await getAllUsers();
            setUsers(fetchedUsers);
        }
    }, [profile?.role]);

    useEffect(() => {
        if (!authLoading && profile) {
            fetchAllSubjects();
            if (profile.role === 'owner') fetchUsers();
        }
    }, [profile, authLoading, fetchAllSubjects, fetchUsers]);

    // Handlers
    const handleAddSubject = async () => {
        if (!newSubjectName) return;
        setLoading(true);
        try {
            await addSubject(newSubjectName, Number(newSubjectOrder));
            setNewSubjectName('');
            await fetchAllSubjects();
            setStatusMsg('Subject added successfully');
        } catch (e) {
            console.error(e);
            setStatusMsg('Seeding failed: ' + (e instanceof Error ? e.message : String(e)));
        }
        setLoading(false);
    };

    const handleDeleteSubject = async (id: string) => {
        if (!confirm('Delete this subject? This action cannot be undone.')) return;
        setLoading(true);
        try {
            await deleteSubject(id);
            await fetchAllSubjects();
            if (selectedSubjectId === id) setSelectedSubjectId('');
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleSubjectSelect = (id: string) => {
        setSelectedSubjectId(id);
        fetchSubjectQuizzes(id);
    };

    const handleAddQuiz = async () => {
        if (!selectedSubjectId || !newQuizTitle) return;
        setLoading(true);
        try {
            await addQuiz(selectedSubjectId, newQuizTitle);
            setNewQuizTitle('');
            await fetchSubjectQuizzes(selectedSubjectId);
            setStatusMsg('Quiz added successfully');
        } catch (e) {
            console.error(e);
            setStatusMsg('Error adding quiz');
        }
        setLoading(false);
    };

    const handleDeleteQuiz = async (quizId: string) => {
        if (!confirm('Delete this quiz?')) return;
        setLoading(true);
        try {
            await deleteQuiz(selectedSubjectId, quizId);
            await fetchSubjectQuizzes(selectedSubjectId);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    // JSON Import Logic
    const handleImportSubjectChange = async (subId: string) => {
        setImportSubjectId(subId);
        const data = await getQuizzes(subId);
        setImportQuizzes(data);
        setImportQuizId('');
    };

    const copyFormula = () => {
        const formula = `[
  {
    "text": "Question Text",
    "type": "single",
    "options": [
      { "id": "a", "text": "Option A" },
      { "id": "b", "text": "Option B" }
    ],
    "correctOptionId": "a",
    "explanation": "Explanation here"
  }
]`;
        navigator.clipboard.writeText(formula);
        setStatusMsg('Formula copied to clipboard!');
        setTimeout(() => setStatusMsg(''), 2000);
    };

    const handleUploadJson = async () => {
        if (!importSubjectId || !importQuizId || !jsonInput) return;
        try {
            const questions = JSON.parse(jsonInput) as QuizQuestion[];
            if (!Array.isArray(questions)) throw new Error('Root must be an array');

            setLoading(true);
            await updateQuizQuestions(importSubjectId, importQuizId, questions);
            setStatusMsg(`Successfully uploaded ${questions.length} questions!`);
            setJsonInput('');
        } catch (e) {
            alert('Invalid JSON Format: ' + (e instanceof Error ? e.message : String(e)));
        }
        setLoading(false);
    };

    // User Management Handlers
    const handleToggleRole = async (targetUid: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        await updateUserRole(targetUid, newRole);
        fetchUsers();
    };

    const handleToggleStatus = async (targetUid: string, currentStatus: string) => {
        const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
        await updateUserStatus(targetUid, newStatus);
        fetchUsers();
    };

    const handleDelete = async (targetUid: string) => {
        if (confirm('Are you sure you want to delete this user record?')) {
            await deleteUserRecord(targetUid);
            fetchUsers();
        }
    };

    // --- Render ---

    if (authLoading) return <div className="p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

    if (profile?.role !== 'owner' && profile?.role !== 'admin') {
        return (
            <div className="p-8">
                <div className="bg-[#FFFFE1] border border-[#E6DB55] p-6 text-center space-y-4 max-w-lg mx-auto">
                    <ShieldAlert className="w-12 h-12 text-[#CCAA00] mx-auto" />
                    <h2 className="text-xl font-bold text-[#665D00]">Access Denied</h2>
                    <p className="text-xs">Administrator access required.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#ECE9D8] text-black overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-[#808080] bg-[#ECE9D8] shrink-0">
                <div className="bg-[#003399] p-2 rounded-sm shadow-sm text-white">
                    <Shield className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#003399]">Admin Configuration</h2>
                    <p className="text-[10px] text-[#444]">Content & User Management System</p>
                </div>
                {statusMsg && (
                    <div className="ml-auto bg-[#FFFFE1] border border-[#E6DB55] px-3 py-1 text-[10px] text-[#665D00] flex items-center gap-2 animate-in fade-in">
                        <Check className="w-3 h-3" />
                        {statusMsg}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex px-4 pt-2 gap-1 border-b border-[#808080] shrink-0">
                {(['subjects', 'quizzes', 'json', 'users'] as const).map(tabId => {
                    const tab = [
                        { id: 'subjects', icon: BookOpen, label: 'Subjects' },
                        { id: 'quizzes', icon: FileText, label: 'Quizzes' },
                        { id: 'json', icon: Code, label: 'Import Qs' },
                        { id: 'users', icon: UserPlus, label: 'Users' }
                    ].find(t => t.id === tabId);

                    if (!tab) return null;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'subjects' | 'quizzes' | 'json' | 'users')}
                            className={cn(
                                "px-3 py-1.5 flex items-center gap-2 text-xs rounded-t-sm border-t border-l border-r border-[#808080]",
                                activeTab === tab.id ? "bg-white font-bold -mb-px pb-2 z-10" : "bg-[#ECE9D8] text-[#444] hover:bg-[#F5F5F5]"
                            )}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white p-6 overflow-auto border-[#808080] border-l border-r border-b m-4 mt-0 shadow-sm relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#003399]" />
                    </div>
                )}

                {/* SUBJECTS TAB */}
                {activeTab === 'subjects' && (
                    <div className="max-w-2xl space-y-8">
                        <div className="bg-[#F5F9FF] border border-[#B5C7DE] p-4 space-y-4 rounded-sm">
                            <h3 className="font-bold text-[#003399] flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add New Subject
                            </h3>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Subject Name"
                                    value={newSubjectName}
                                    onChange={e => setNewSubjectName(e.target.value)}
                                    className="flex-1 border border-[#7F9DB9] px-2 py-1 text-sm rounded-none"
                                />
                                <input
                                    type="number"
                                    placeholder="Order"
                                    value={newSubjectOrder}
                                    onChange={e => setNewSubjectOrder(Number(e.target.value))}
                                    className="w-20 border border-[#7F9DB9] px-2 py-1 text-sm rounded-none"
                                />
                                <button
                                    onClick={handleAddSubject}
                                    className="xp-button px-4 py-1 font-bold text-xs"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-bold border-b border-[#CCC] pb-1">Existing Subjects</h3>
                            {subjects.map(sub => (
                                <div key={sub.id} className="flex items-center justify-between p-2 hover:bg-[#F1F1F1] border border-transparent hover:border-[#CCC] group">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 bg-[#003399] text-white flex items-center justify-center text-xs font-bold rounded-sm">
                                            {sub.order}
                                        </span>
                                        <span className="font-bold text-sm">{sub.name}</span>
                                        <span className="text-[10px] text-gray-500 font-mono">ID: {sub.id}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteSubject(sub.id)}
                                        className="text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* QUIZZES TAB */}
                {activeTab === 'quizzes' && (
                    <div className="max-w-2xl space-y-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold">Select Subject to Manage Quizzes:</label>
                            <select
                                value={selectedSubjectId}
                                onChange={e => handleSubjectSelect(e.target.value)}
                                className="w-full border border-[#7F9DB9] px-2 py-1.5 text-sm outline-none"
                            >
                                <option value="">-- Select Subject --</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        {selectedSubjectId && (
                            <>
                                <div className="bg-[#F5F9FF] border border-[#B5C7DE] p-4 space-y-4 rounded-sm">
                                    <h3 className="font-bold text-[#003399] flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> Add New Quiz
                                    </h3>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            placeholder="Quiz Title"
                                            value={newQuizTitle}
                                            onChange={e => setNewQuizTitle(e.target.value)}
                                            className="flex-1 border border-[#7F9DB9] px-2 py-1 text-sm rounded-none"
                                        />
                                        <button
                                            onClick={handleAddQuiz}
                                            className="xp-button px-4 py-1 font-bold text-xs"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-bold border-b border-[#CCC] pb-1">Quizzes in Subject</h3>
                                    {quizzes.length === 0 && <p className="text-xs italic text-gray-500">No quizzes found.</p>}
                                    {quizzes.map(quiz => (
                                        <div key={quiz.id} className="flex items-center justify-between p-2 hover:bg-[#F1F1F1] border border-transparent hover:border-[#CCC] group">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-[#3366CC]" />
                                                <span className="font-bold text-sm">{quiz.title}</span>
                                                <span className="text-[10px] text-gray-500">({quiz.questions?.length || 0} qs)</span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteQuiz(quiz.id)}
                                                className="text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* JSON IMPORT TAB */}
                {activeTab === 'json' && (
                    <div className="max-w-3xl space-y-6 h-full flex flex-col">
                        <div className="grid grid-cols-2 gap-4 shrink-0">
                            <div className="space-y-1">
                                <label className="text-xs font-bold">1. Select Subject</label>
                                <select
                                    value={importSubjectId}
                                    onChange={e => handleImportSubjectChange(e.target.value)}
                                    className="w-full border border-[#7F9DB9] px-2 py-1 text-xs"
                                >
                                    <option value="">-- Select Subject --</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold">2. Select Quiz</label>
                                <select
                                    value={importQuizId}
                                    onChange={e => setImportQuizId(e.target.value)}
                                    className="w-full border border-[#7F9DB9] px-2 py-1 text-xs"
                                    disabled={!importSubjectId}
                                >
                                    <option value="">-- Select Quiz --</option>
                                    {importQuizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 py-2 border-y border-[#CCC] bg-[#F9F9F9] px-2 shrink-0">
                            <span className="text-xs font-bold text-[#444]">Step 3. Paste JSON below</span>
                            <button
                                onClick={copyFormula}
                                className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-white border border-[#7F9DB9] hover:bg-[#F0F0F0] text-xs shadow-sm rounded-sm"
                            >
                                <Copy className="w-3.5 h-3.5 text-[#3366CC]" />
                                Copy Formula
                            </button>
                        </div>

                        <textarea
                            value={jsonInput}
                            onChange={e => setJsonInput(e.target.value)}
                            placeholder="// Paste questions array here..."
                            className="flex-1 w-full border border-[#7F9DB9] p-3 font-mono text-xs leading-relaxed resize-none outline-none focus:border-[#316AC5]"
                        />

                        <button
                            onClick={handleUploadJson}
                            disabled={!importQuizId || !jsonInput}
                            className="shrink-0 w-full xp-button py-2 flex items-center justify-center gap-2 font-bold disabled:opacity-50"
                        >
                            <Upload className="w-4 h-4" />
                            UPLOAD QUESTIONS
                        </button>
                    </div>
                )}

                {/* USERS TAB (ORIGINAL) */}
                {activeTab === 'users' && profile?.role === 'owner' && (
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-[10px] text-left border-collapse">
                            <thead className="sticky top-0 bg-[#F1F1F1] border-b border-[#CCC]">
                                <tr>
                                    <th className="px-3 py-1.5 border-r border-[#CCC] font-normal w-1/3 text-black">Email</th>
                                    <th className="px-3 py-1.5 border-r border-[#CCC] font-normal w-1/6 text-black">Role</th>
                                    <th className="px-3 py-1.5 border-r border-[#CCC] font-normal w-1/6 text-black">Status</th>
                                    <th className="px-3 py-1.5 font-normal text-black">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.uid} className="border-b border-[#EEE] hover:bg-[#F5F9FF] group">
                                        <td className="px-3 py-2 border-r border-[#CCC] text-black bg-white">{u.email}</td>
                                        <td className="px-3 py-2 border-r border-[#CCC] bg-white text-black">
                                            <span className={cn(
                                                "px-1.5 py-0.5 border rounded-none uppercase",
                                                u.role === 'owner' ? "bg-purple-100 border-purple-400 text-purple-800" :
                                                    u.role === 'admin' ? "bg-blue-100 border-blue-400 text-blue-800" :
                                                        "bg-gray-100 border-gray-400 text-gray-800"
                                            )}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 border-r border-[#CCC] text-black bg-white">
                                            <span className={cn(
                                                "font-bold uppercase",
                                                u.status === 'banned' ? "text-red-600" : "text-green-600"
                                            )}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 bg-white flex gap-2">
                                            {u.role !== 'owner' && (
                                                <>
                                                    <button
                                                        onClick={() => handleToggleRole(u.uid, u.role)}
                                                        className="p-1 border border-transparent hover:border-[#808080] hover:bg-gray-100"
                                                    >
                                                        {u.role === 'admin' ? <UserX className="w-3.5 h-3.5 text-orange-600" /> : <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(u.uid, u.status)}
                                                        className="p-1 border border-transparent hover:border-[#808080] hover:bg-gray-100"
                                                    >
                                                        {u.status === 'banned' ? <UserCheck className="w-3.5 h-3.5 text-green-600" /> : <UserX className="w-3.5 h-3.5 text-red-600" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(u.uid)}
                                                        className="p-1 border border-transparent hover:border-[#808080] hover:bg-gray-100"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-red-800" />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

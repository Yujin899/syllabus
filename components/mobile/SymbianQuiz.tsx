'use client';

import React, { useState } from 'react';
import { Quiz, saveMistakes, MistakeQuestion } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, HelpCircle } from 'lucide-react';

interface SymbianQuizProps {
    quiz: Quiz;
    subjectId: string;
    onBack: () => void;
}

export function SymbianQuiz({ quiz, subjectId, onBack }: SymbianQuizProps) {
    const { user } = useAuth();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
    const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({});
    const [submitted, setSubmitted] = useState(false);

    const currentQuestion = quiz.questions?.[currentQuestionIndex];
    if (!currentQuestion) return <div className="p-4 text-white">No questions.</div>;

    const options = currentQuestion.options;
    const isLastQuestion = currentQuestionIndex === (quiz.questions?.length || 0) - 1;
    const isChecked = checkedQuestions[currentQuestionIndex];

    const isSelected = (optionId: string) => {
        if (currentQuestion.type === 'single') {
            return answers[currentQuestionIndex] === optionId;
        } else {
            return ((answers[currentQuestionIndex] as string[]) || []).includes(optionId);
        }
    };

    const hasAnswer = currentQuestion.type === 'single'
        ? !!answers[currentQuestionIndex]
        : ((answers[currentQuestionIndex] as string[]) || []).length > 0;

    const handleOptionClick = (optionId: string) => {
        if (submitted || isChecked) return;

        if (currentQuestion.type === 'single') {
            setAnswers({ ...answers, [currentQuestionIndex]: optionId });
        } else {
            const currentAnswers = (answers[currentQuestionIndex] as string[]) || [];
            if (currentAnswers.includes(optionId)) {
                setAnswers({
                    ...answers,
                    [currentQuestionIndex]: currentAnswers.filter(id => id !== optionId)
                });
            } else {
                setAnswers({
                    ...answers,
                    [currentQuestionIndex]: [...currentAnswers, optionId]
                });
            }
        }
    };

    const handleCheck = () => {
        setCheckedQuestions({ ...checkedQuestions, [currentQuestionIndex]: true });
    };

    const handleNext = async () => {
        if (submitted) {
            onBack();
            return;
        }

        if (isLastQuestion) {
            await finishQuiz();
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const finishQuiz = async () => {
        setSubmitted(true);
        if (user && quiz.questions) {
            const mistakes: MistakeQuestion[] = [];
            quiz.questions.forEach((q, idx) => {
                const userAnswer = answers[idx];
                const correctIds = q.type === 'single' ? [q.correctOptionId!] : q.correctOptionIds!;
                const userIds = q.type === 'single' ? [userAnswer as string] : (userAnswer as string[] || []);

                const isCorrect = correctIds.length === userIds.length &&
                    correctIds.every(id => userIds.includes(id));

                if (!isCorrect && userAnswer !== undefined) {
                    mistakes.push({
                        questionText: q.text,
                        options: q.options,
                        selectedOptionIds: userIds,
                        correctOptionIds: correctIds,
                        explanation: q.explanation
                    });
                }
            });

            if (mistakes.length > 0) {
                await saveMistakes(user.uid, subjectId, quiz.id, quiz.title, mistakes);
            }
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#121212] text-white select-none overflow-hidden h-full no-scrollbar">
            {/* Header / Title Bar */}
            <div className="h-10 bg-[#1E1E1E] border-b border-[#333] flex items-center px-3 justify-between shrink-0">
                <span className="text-white text-xs font-normal uppercase tracking-wider truncate max-w-[70%]">
                    {quiz.title}
                </span>
                <span className="text-[#88BBFF] text-[10px]">
                    {currentQuestionIndex + 1}/{quiz.questions?.length}
                </span>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar">
                {/* Question Box */}
                <div className="bg-[#222] border border-[#333] p-3 rounded-sm shadow-sm relative">
                    <p className="text-white text-base leading-snug font-normal">
                        {currentQuestion.text}
                    </p>
                    <div className="absolute top-2 right-2 text-[10px] text-[#666] uppercase tracking-wide">
                        {currentQuestion.type}
                    </div>
                </div>

                {/* Options List */}
                <div className="flex flex-col gap-2">
                    {options.map((option) => {
                        const checked = isSelected(option.id);
                        let statusColor = "border-[#333] bg-[#1A1A1A]";
                        let iconColor = "border-[#555]";

                        if (isChecked) {
                            const correctIds = currentQuestion.type === 'single' ? [currentQuestion.correctOptionId!] : currentQuestion.correctOptionIds!;
                            const isCorrectOption = correctIds.includes(option.id);

                            if (isCorrectOption) {
                                statusColor = "bg-[#0B330B] border-[#228822]"; // Green
                                iconColor = "bg-[#228822] border-[#228822]";
                            } else if (checked) {
                                statusColor = "bg-[#330B0B] border-[#882222]"; // Red
                                iconColor = "bg-[#882222] border-[#882222]";
                            }
                        } else if (checked) {
                            statusColor = "bg-[#2A2A2A] border-[#4466FF]";
                            iconColor = "bg-[#4466FF] border-[#4466FF] text-white";
                        }

                        return (
                            <div
                                key={option.id}
                                onClick={() => handleOptionClick(option.id)}
                                className={cn(
                                    "min-h-12 px-4 py-2 flex items-center border rounded-sm gap-3 transition-colors",
                                    !isChecked && !submitted ? "active:bg-[#333] cursor-pointer" : "cursor-default",
                                    statusColor
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                    iconColor
                                )}>
                                    {checked && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <span className={cn("text-sm font-normal flex-1", checked || isChecked ? "text-white" : "text-[#CCC]")}>
                                    {option.text}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Explanation (Only after check) */}
                {isChecked && (
                    <div className="bg-[#222] border-l-2 border-[#88BBFF] p-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-2 mb-1">
                            <HelpCircle className="w-4 h-4 text-[#88BBFF]" />
                            <span className="text-xs font-bold text-[#88BBFF] uppercase">Explanation</span>
                        </div>
                        <p className="text-sm text-[#DDD] italic leading-relaxed">
                            {currentQuestion.explanation}
                        </p>
                    </div>
                )}

                {submitted && (
                    <div className="p-4 text-center text-green-500 font-bold border border-green-900 bg-green-950/20 rounded-sm">
                        Quiz Completed!
                    </div>
                )}
            </div>

            {/* Bottom Action Bar */}
            <div className="p-3 bg-[#111] border-t border-[#333]">
                {!isChecked && !submitted ? (
                    <button
                        onClick={handleCheck}
                        disabled={!hasAnswer}
                        className="w-full bg-[#0055AA] hover:bg-[#0066CC] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-sm font-bold text-sm uppercase tracking-wide shadow-md flex items-center justify-center gap-2"
                    >
                        <Check className="w-4 h-4" /> Check Answer
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="w-full bg-[#222] hover:bg-[#333] text-white border border-[#444] py-3 rounded-sm font-bold text-sm uppercase tracking-wide shadow-md flex items-center justify-center gap-2"
                    >
                        {submitted ? "Back to Menu" : isLastQuestion ? "Finish Quiz" : "Next Question"} <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

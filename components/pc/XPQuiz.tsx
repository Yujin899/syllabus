'use client';

import React, { useState } from 'react';
import { Quiz, saveMistakes, MistakeQuestion } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface XPQuizProps {
    quiz: Quiz;
    subjectId: string;
}

export function XPQuiz({ quiz, subjectId }: XPQuizProps) {
    const { user } = useAuth();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
    const [submitted, setSubmitted] = useState(false);
    const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({});

    const currentQuestion = quiz.questions?.[currentQuestionIndex];
    if (!currentQuestion) return <div className="p-4">No questions found.</div>;

    const handleOptionChange = (optionId: string) => {
        if (checkedQuestions[currentQuestionIndex]) return; // Prevent changing after check

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

    const isLastQuestion = currentQuestionIndex === (quiz.questions?.length || 0) - 1;
    const isChecked = checkedQuestions[currentQuestionIndex];

    const handleCheck = () => {
        setCheckedQuestions({ ...checkedQuestions, [currentQuestionIndex]: true });
    };

    const nextQuestion = () => {
        if (!isLastQuestion) setCurrentQuestionIndex(currentQuestionIndex + 1);
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
    };

    const finishQuiz = async () => {
        setSubmitted(true);
        if (!user || !quiz.questions) return;

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
    };

    return (
        <div className="flex flex-col h-full bg-white text-black p-6 select-none overflow-y-auto">
            <div className="max-w-xl mx-auto w-full space-y-8">
                {/* Header */}
                <div className="border-b border-[#CCC] pb-2">
                    <h2 className="text-xl font-bold text-[#003399] leading-tight">
                        {quiz.title}
                    </h2>
                    <p className="text-[11px] text-[#666] mt-1">
                        Question {currentQuestionIndex + 1} of {quiz.questions?.length}
                    </p>
                </div>

                {/* Question Area */}
                <div className="space-y-6">
                    <p className="text-sm font-bold leading-relaxed">
                        {currentQuestion.text}
                    </p>

                    <div className="space-y-3">
                        {currentQuestion.options.map(option => {
                            const isSelected = currentQuestion.type === 'single'
                                ? answers[currentQuestionIndex] === option.id
                                : ((answers[currentQuestionIndex] as string[]) || []).includes(option.id);

                            let labelStyle = "flex items-start gap-3 cursor-default group p-2 border border-transparent rounded-sm";
                            if (isChecked) {
                                const correctIds = currentQuestion.type === 'single' ? [currentQuestion.correctOptionId!] : currentQuestion.correctOptionIds!;
                                const isCorrectOption = correctIds.includes(option.id);

                                if (isCorrectOption) {
                                    labelStyle += " bg-[#E6F4EA] border-[#B8E2C3]"; // Correct green
                                } else if (isSelected) {
                                    labelStyle += " bg-[#FDECEA] border-[#F4C7C7]"; // Wrong red
                                }
                            } else {
                                labelStyle += " active:brightness-95 hover:bg-gray-50";
                            }

                            return (
                                <label
                                    key={option.id}
                                    className={labelStyle}
                                >
                                    <div className="pt-0.5">
                                        <input
                                            type={currentQuestion.type === 'single' ? 'radio' : 'checkbox'}
                                            name={`q-${currentQuestionIndex}`}
                                            checked={isSelected}
                                            onChange={() => handleOptionChange(option.id)}
                                            disabled={isChecked || submitted}
                                            className="w-3.5 h-3.5 border-[#808080] rounded-none outline-none"
                                        />
                                    </div>
                                    <span className={`text-xs ${isChecked && (currentQuestion.type === 'single' ? currentQuestion.correctOptionId === option.id : currentQuestion.correctOptionIds?.includes(option.id)) ? 'font-bold text-green-700' : ''}`}>
                                        {option.text}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Feedback Area */}
                {isChecked && (
                    <div className="bg-[#FFFFE1] border border-[#E6DB55] p-4 text-xs space-y-2 animate-in fade-in duration-300">
                        <p className="font-bold text-[#665D00]">Explanation:</p>
                        <p className="leading-relaxed italic">{currentQuestion.explanation}</p>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-8 border-t border-[#CCC]">
                    <div className="flex gap-2">
                        <button
                            onClick={prevQuestion}
                            disabled={currentQuestionIndex === 0}
                            className="xp-button-alt min-w-[75px] h-[23px] text-xs disabled:opacity-50"
                        >
                            &lt; Back
                        </button>
                    </div>

                    {!submitted && (
                        <div className="flex gap-2 ml-auto">
                            {!isChecked ? (
                                <button
                                    onClick={handleCheck}
                                    disabled={!answers[currentQuestionIndex]}
                                    className="xp-button min-w-[75px] h-[23px] text-xs font-bold disabled:opacity-50"
                                >
                                    Check
                                </button>
                            ) : (
                                isLastQuestion ? (
                                    <button
                                        onClick={finishQuiz}
                                        className="xp-button min-w-[100px] h-[26px] text-xs font-bold"
                                    >
                                        Finish Quiz
                                    </button>
                                ) : (
                                    <button
                                        onClick={nextQuestion}
                                        className="xp-button min-w-[75px] h-[23px] text-xs font-bold"
                                    >
                                        Next &gt;
                                    </button>
                                )
                            )}
                        </div>
                    )}

                    {submitted && (
                        <div className="text-center w-full font-bold text-green-600">
                            Quiz Completed! Check Results/Mistakes.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

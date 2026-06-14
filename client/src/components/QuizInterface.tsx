import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

interface QuizInterfaceProps {
  quizId: number;
  lessonId: number;
  questions: Question[];
  onSubmit?: (score: number, passed: boolean) => void;
}

export function QuizInterface({
  quizId,
  lessonId,
  questions,
  onSubmit,
}: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = answers[currentQuestionIndex] !== null;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (optionIndex: number) => {
    if (!isSubmitted) {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = optionIndex;
      setAnswers(newAnswers);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (answers.some((a) => a === null)) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    // Calculate score
    let correctCount = 0;
    answers.forEach((answer, idx) => {
      if (answer === questions[idx].correctOptionIndex) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    const passed = calculatedScore >= 60;

    setScore(calculatedScore);
    setIsSubmitted(true);
    onSubmit?.(calculatedScore, passed);
  };

  if (isSubmitted) {
    const passed = score >= 60;
    const correctCount = answers.filter(
      (answer, idx) => answer === questions[idx].correctOptionIndex
    ).length;

    return (
      <Card className="p-8 text-center space-y-6">
        <div className="flex justify-center">
          {passed ? (
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500" />
          )}
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {passed ? "Great job!" : "Try again"}
          </h3>
          <p className="text-gray-600">
            You scored {score}% ({correctCount}/{questions.length} correct)
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            {passed
              ? "✓ You have passed this quiz and completed the lesson."
              : "✗ You need to score at least 60% to pass. Review the material and try again."}
          </p>
        </div>

        <Button
          onClick={() => {
            setCurrentQuestionIndex(0);
            setAnswers(new Array(questions.length).fill(null));
            setIsSubmitted(false);
          }}
          className="w-full"
        >
          {passed ? "Continue to Next Lesson" : "Retake Quiz"}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {currentQuestion.question}
          </h3>

          {/* Options */}
          <RadioGroup
            value={
              answers[currentQuestionIndex] !== null
                ? answers[currentQuestionIndex]!.toString()
                : ""
            }
            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
          >
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <RadioGroupItem
                    value={idx.toString()}
                    id={`option-${idx}`}
                    disabled={isSubmitted}
                  />
                  <Label
                    htmlFor={`option-${idx}`}
                    className="flex-1 cursor-pointer p-3 rounded border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex-1"
        >
          Previous
        </Button>

        {currentQuestionIndex === questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={!answers.every((a) => a !== null)}
            className="flex-1"
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!isAnswered}
            className="flex-1"
          >
            Next
          </Button>
        )}
      </div>

      {/* Info */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            Answer all questions to submit. You need 60% or higher to pass.
          </p>
        </div>
      </Card>
    </div>
  );
}

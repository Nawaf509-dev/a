import { useState } from 'react';
import { MessageCircle, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { Problem } from '../lib/supabase';
import { InteractiveChat } from './InteractiveChat';

interface SolutionDisplayProps {
  problem: Problem;
}

export function SolutionDisplay({ problem }: SolutionDisplayProps) {
  const [showChat, setShowChat] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepNumber)) {
        newSet.delete(stepNumber);
      } else {
        newSet.add(stepNumber);
      }
      return newSet;
    });
  };

  const problemTypeNames: Record<string, string> = {
    algebra: 'جبر',
    geometry: 'هندسة',
    calculus: 'تفاضل وتكامل',
    trigonometry: 'حساب المثلثات',
    statistics: 'إحصاء',
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="w-6 h-6" />
          <h2 className="text-2xl font-bold">الحل التفصيلي</h2>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">
            {problemTypeNames[problem.problem_type] || problem.problem_type}
          </span>
          <span className="bg-white/20 px-3 py-1 rounded-full">
            {problem.input_method === 'text' ? 'إدخال نصي' : 'إدخال بالصورة'}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">المسألة:</h3>
          <div className="bg-gray-50 p-4 rounded-lg" dir="rtl">
            {problem.problem_image_url && (
              <img
                src={problem.problem_image_url}
                alt="Problem"
                className="mb-3 max-h-48 rounded-lg mx-auto"
              />
            )}
            <p className="text-gray-700">{problem.problem_text}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">خطوات الحل:</h3>
          <div className="space-y-3">
            {problem.solution.steps?.map((step) => (
              <div
                key={step.step}
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
              >
                <button
                  onClick={() => toggleStep(step.step)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-semibold text-sm">
                      {step.step}
                    </span>
                    <span className="font-medium text-gray-700">
                      الخطوة {step.step}
                    </span>
                  </div>
                  {expandedSteps.has(step.step) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedSteps.has(step.step) && (
                  <div className="p-4 bg-white" dir="rtl">
                    <p className="text-gray-700 mb-2">{step.description}</p>
                    {step.equation && (
                      <div className="bg-blue-50 p-3 rounded-lg font-mono text-center text-lg">
                        {step.equation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border-2 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">الجواب النهائي:</h3>
          <p className="text-2xl font-bold text-blue-700" dir="rtl">
            {problem.solution.final_answer}
          </p>
        </div>

        {problem.solution.graphs && problem.solution.graphs.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">الرسم البياني:</h3>
            <div className="grid gap-4">
              {problem.solution.graphs.map((graph, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <img src={graph} alt={`Graph ${index + 1}`} className="max-w-full rounded-lg mx-auto" />
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowChat(!showChat)}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          {showChat ? 'إخفاء المحادثة التفاعلية' : 'اسأل عن خطوات الحل'}
        </button>

        {showChat && <InteractiveChat problemId={problem.id} />}
      </div>
    </div>
  );
}

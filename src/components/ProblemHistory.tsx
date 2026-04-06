import { useState, useEffect } from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { supabase, Problem } from '../lib/supabase';

interface ProblemHistoryProps {
  onSelectProblem: (problem: Problem) => void;
  currentProblemId?: string;
}

export function ProblemHistory({ onSelectProblem, currentProblemId }: ProblemHistoryProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('problems')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setProblems(data);
      }
    } catch (error) {
      console.error('Error loading problems:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const problemTypeNames: Record<string, string> = {
    algebra: 'جبر',
    geometry: 'هندسة',
    calculus: 'تفاضل وتكامل',
    trigonometry: 'حساب المثلثات',
    statistics: 'إحصاء',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-800">المسائل السابقة</h2>
        </div>
        <div className="text-center text-gray-500 py-8">جاري التحميل...</div>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-800">المسائل السابقة</h2>
        </div>
        <div className="text-center text-gray-500 py-8">لا توجد مسائل سابقة</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-gray-600" />
        <h2 className="text-xl font-bold text-gray-800">المسائل السابقة</h2>
      </div>

      <div className="space-y-2">
        {problems.map((problem) => (
          <button
            key={problem.id}
            onClick={() => onSelectProblem(problem)}
            className={`w-full text-right p-4 rounded-lg border transition-all hover:shadow-md ${
              currentProblemId === problem.id
                ? 'bg-blue-50 border-blue-300'
                : 'bg-gray-50 border-gray-200 hover:border-blue-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {problemTypeNames[problem.problem_type] || problem.problem_type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(problem.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 truncate" dir="rtl">
                  {problem.problem_text}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

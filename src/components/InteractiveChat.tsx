import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { supabase, Conversation } from '../lib/supabase';

interface InteractiveChatProps {
  problemId: string;
}

export function InteractiveChat({ problemId }: InteractiveChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [problemId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const loadConversations = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('problem_id', problemId)
      .order('created_at', { ascending: true });

    if (data) {
      setConversations(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    const currentQuestion = question;
    setQuestion('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/answer-question`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problem_id: problemId,
          question: currentQuestion,
        }),
      });

      if (!response.ok) throw new Error('Failed to get answer');

      const { answer } = await response.json();

      const { error } = await supabase.from('conversations').insert({
        problem_id: problemId,
        user_id: user.id,
        question: currentQuestion,
        answer,
      });

      if (error) throw error;

      await loadConversations();
    } catch (error) {
      console.error('Error asking question:', error);
      alert('حدث خطأ أثناء الحصول على الإجابة. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">المحادثة التفاعلية</h3>

      <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Bot className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>اسأل أي سؤال عن خطوات الحل</p>
            <p className="text-sm mt-2">مثال: لماذا قمنا بهذه الخطوة؟</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <div key={conv.id} className="space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-lg shadow-sm" dir="rtl">
                    <p className="text-gray-800">{conv.question}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg" dir="rtl">
                    <p className="text-gray-800">{conv.answer}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="اكتب سؤالك هنا..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          dir="rtl"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
}

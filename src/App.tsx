import { useState, useEffect } from 'react';
import { supabase, Problem } from './lib/supabase';
import { Header } from './components/Header';
import { ProblemInput } from './components/ProblemInput';
import { SolutionDisplay } from './components/SolutionDisplay';
import { ProblemHistory } from './components/ProblemHistory';
import { LogIn, LogOut, User } from 'lucide-react';

function App() {
  const [user, setUser] = useState<any>(null);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      setShowAuth(false);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentProblem(null);
  };

  const handleSubmitProblem = async (
    problemText: string,
    imageFile: File | null,
    problemType: string,
    inputMethod: 'text' | 'image'
  ) => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('problem-images')
          .upload(fileName, imageFile);

        if (error) throw error;
        imageUrl = data.path;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/solve-problem`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problem_text: problemText,
          problem_type: problemType,
          input_method: inputMethod,
          problem_image_url: imageUrl,
        }),
      });

      if (!response.ok) throw new Error('Failed to solve problem');

      const { solution } = await response.json();

      const { data: problemData, error: insertError } = await supabase
        .from('problems')
        .insert({
          user_id: user.id,
          problem_type: problemType,
          input_method: inputMethod,
          problem_text: problemText,
          problem_image_url: imageUrl,
          solution,
          language: 'ar',
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setCurrentProblem(problemData);
    } catch (error) {
      console.error('Error solving problem:', error);
      alert('حدث خطأ أثناء حل المسألة. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" dir="rtl">
      <Header />

      {!user ? (
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <User className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
              </h2>
              <p className="text-gray-600">للوصول إلى جميع الميزات</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                {isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
              </button>

              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-blue-600 hover:text-blue-700 text-sm"
              >
                {isSignUp ? 'لديك حساب؟ سجل الدخول' : 'ليس لديك حساب؟ أنشئ حساباً'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <>
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="text-gray-700">
                <span className="font-medium">مرحباً،</span> {user.email}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                تسجيل الخروج
              </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ProblemInput onSubmit={handleSubmitProblem} isLoading={isLoading} />
                {currentProblem && <SolutionDisplay problem={currentProblem} />}
              </div>

              <div className="lg:col-span-1">
                <ProblemHistory
                  onSelectProblem={setCurrentProblem}
                  currentProblemId={currentProblem?.id}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;

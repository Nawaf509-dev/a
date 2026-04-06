import { Brain } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <Brain className="w-10 h-10" />
          <div>
            <h1 className="text-3xl font-bold">مُدرك</h1>
            <p className="text-sm text-blue-50">حلول فورية للمسائل الرياضية بالذكاء الاصطناعي</p>
          </div>
        </div>
      </div>
    </header>
  );
}

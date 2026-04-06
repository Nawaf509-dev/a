import { useState, useRef } from 'react';
import { Camera, Type, Loader2, Upload } from 'lucide-react';

interface ProblemInputProps {
  onSubmit: (problemText: string, imageFile: File | null, problemType: string, inputMethod: 'text' | 'image') => Promise<void>;
  isLoading: boolean;
}

export function ProblemInput({ onSubmit, isLoading }: ProblemInputProps) {
  const [inputMethod, setInputMethod] = useState<'text' | 'image'>('text');
  const [problemText, setProblemText] = useState('');
  const [problemType, setProblemType] = useState('algebra');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMethod === 'text' && !problemText.trim()) return;
    if (inputMethod === 'image' && !selectedImage) return;

    await onSubmit(problemText, selectedImage, problemType, inputMethod);

    setProblemText('');
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setInputMethod('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
            inputMethod === 'text'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Type className="w-5 h-5" />
          كتابة المسألة
        </button>
        <button
          type="button"
          onClick={() => setInputMethod('image')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
            inputMethod === 'image'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Camera className="w-5 h-5" />
          تصوير المسألة
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع المسألة
          </label>
          <select
            value={problemType}
            onChange={(e) => setProblemType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="algebra">جبر</option>
            <option value="geometry">هندسة</option>
            <option value="calculus">تفاضل وتكامل</option>
            <option value="trigonometry">حساب المثلثات</option>
            <option value="statistics">إحصاء</option>
          </select>
        </div>

        {inputMethod === 'text' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اكتب المسألة الرياضية
            </label>
            <textarea
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="مثال: حل المعادلة 2x + 5 = 15"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-32 resize-none"
              dir="rtl"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التقط صورة للمسألة
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              {imagePreview ? (
                <div className="space-y-3">
                  <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                  <p className="text-sm text-gray-600">اضغط لتغيير الصورة</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-12 h-12 text-gray-400" />
                  <p className="text-gray-600">اضغط لالتقاط أو اختيار صورة</p>
                </div>
              )}
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (inputMethod === 'text' ? !problemText.trim() : !selectedImage)}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري الحل...
            </>
          ) : (
            'حل المسألة'
          )}
        </button>
      </form>
    </div>
  );
}

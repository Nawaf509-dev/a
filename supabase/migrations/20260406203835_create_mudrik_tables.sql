/*
  # إنشاء قاعدة بيانات مُدرك - برنامج حل المسائل الرياضية

  ## الجداول الجديدة
  
  ### `problems`
  جدول لتخزين المسائل الرياضية المحلولة
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users) - معرف المستخدم
  - `problem_type` (text) - نوع المسألة (جبر، هندسة، تفاضل، تكامل)
  - `input_method` (text) - طريقة الإدخال (صورة أو نص)
  - `problem_text` (text) - نص المسألة
  - `problem_image_url` (text, nullable) - رابط صورة المسألة
  - `solution` (jsonb) - الحل الكامل مع الخطوات
  - `language` (text) - لغة المسألة
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `conversations`
  جدول لتخزين المحادثات التفاعلية حول المسائل
  - `id` (uuid, primary key)
  - `problem_id` (uuid, foreign key to problems)
  - `user_id` (uuid, foreign key to auth.users)
  - `question` (text) - سؤال المستخدم
  - `answer` (text) - جواب الذكاء الاصطناعي
  - `created_at` (timestamptz)

  ## الأمان
  - تفعيل RLS على جميع الجداول
  - سياسات للمستخدمين المسجلين فقط
  - يمكن للمستخدمين رؤية وتعديل بياناتهم فقط
*/

-- إنشاء جدول المسائل
CREATE TABLE IF NOT EXISTS problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_type text NOT NULL,
  input_method text NOT NULL,
  problem_text text NOT NULL,
  problem_image_url text,
  solution jsonb NOT NULL DEFAULT '{}',
  language text DEFAULT 'ar',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول المحادثات
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id uuid REFERENCES problems(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لجدول المسائل
CREATE POLICY "Users can view own problems"
  ON problems FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own problems"
  ON problems FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own problems"
  ON problems FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own problems"
  ON problems FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- سياسات الأمان لجدول المحادثات
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_problems_user_id ON problems(user_id);
CREATE INDEX IF NOT EXISTS idx_problems_created_at ON problems(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_problem_id ON conversations(problem_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
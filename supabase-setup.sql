-- Create profiles table to store user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sleep_records table to store sleep data
CREATE TABLE IF NOT EXISTS sleep_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  total_sleep NUMERIC NOT NULL,
  sleep_debt NUMERIC NOT NULL,
  ideal_sleep_per_day NUMERIC NOT NULL,
  sleep_quality INTEGER,
  sleep_hours JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies to secure the data

-- Enable row level security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_records ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for sleep_records
CREATE POLICY "Users can view their own sleep records" ON sleep_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sleep records" ON sleep_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sleep records" ON sleep_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sleep records" ON sleep_records
  FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS sleep_records_user_id_idx ON sleep_records (user_id);
CREATE INDEX IF NOT EXISTS sleep_records_date_idx ON sleep_records (date); 
/*
  # Online Resource Request System - Database Schema

  ## Overview
  This migration creates the complete database schema for a college campus resource request system
  with user authentication, resource management, and request tracking.

  ## New Tables

  ### 1. profiles
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique, not null)
  - `full_name` (text, not null)
  - `role` (text, not null, default 'user') - Either 'user' or 'admin'
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### 2. resources
  - `id` (uuid, primary key, auto-generated)
  - `name` (text, not null)
  - `description` (text)
  - `category` (text, not null)
  - `quantity_available` (integer, not null, default 0)
  - `created_by` (uuid, references profiles.id)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### 3. requests
  - `id` (uuid, primary key, auto-generated)
  - `user_id` (uuid, references profiles.id, not null)
  - `resource_id` (uuid, references resources.id, not null)
  - `quantity_requested` (integer, not null, default 1)
  - `purpose` (text, not null)
  - `status` (text, not null, default 'pending') - 'pending', 'approved', 'rejected'
  - `rejection_reason` (text, nullable)
  - `reviewed_by` (uuid, references profiles.id, nullable)
  - `reviewed_at` (timestamptz, nullable)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can read their own profile
  - Users can update their own profile (except role)
  - Admins can read all profiles
  - All authenticated users can read resources
  - Only admins can create, update, or delete resources
  - Users can create their own requests
  - Users can read their own requests
  - Admins can read all requests
  - Only admins can update request status

  ## Indexes
  - Index on profiles.email for fast lookups
  - Index on requests.user_id for user request queries
  - Index on requests.status for filtering requests
  - Index on resources.category for filtering resources
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL,
  quantity_available integer NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  quantity_requested integer NOT NULL DEFAULT 1 CHECK (quantity_requested > 0),
  purpose text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Resources policies
CREATE POLICY "Authenticated users can read resources"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update resources"
  ON resources FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete resources"
  ON resources FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Requests policies
CREATE POLICY "Users can create own requests"
  ON requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own requests"
  ON requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all requests"
  ON requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update requests"
  ON requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample resources
INSERT INTO resources (name, description, category, quantity_available) VALUES
  ('Laptop', 'High-performance laptop for projects', 'Electronics', 10),
  ('Projector', 'HD Projector for presentations', 'Electronics', 5),
  ('Whiteboard', 'Portable whiteboard', 'Supplies', 8),
  ('Lab Equipment Set', 'Complete chemistry lab equipment', 'Laboratory', 3),
  ('Camera', 'DSLR Camera for events', 'Electronics', 4),
  ('Microphone', 'Wireless microphone system', 'Audio', 6)
ON CONFLICT DO NOTHING;
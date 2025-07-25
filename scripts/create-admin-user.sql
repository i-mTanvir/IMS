-- Create Admin User in Supabase Auth
-- Run this SQL in Supabase Dashboard > SQL Editor

-- First, let's create the auth user
-- Note: This creates the user in auth.users table
-- You'll need to set the password manually in Supabase Dashboard

-- Insert into auth.users (this requires admin privileges)
-- Since we can't directly insert into auth.users via SQL Editor,
-- we'll create a function to help with user creation

-- Function to create or update user profile after auth signup
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user already exists in our users table
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = NEW.email) THEN
    -- Insert new user into our users table
    INSERT INTO public.users (id, email, full_name, role, is_active)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
      CASE 
        WHEN NEW.email = 'admin@serranotex.com' THEN 'super_admin'::user_role
        ELSE 'sales_manager'::user_role
      END,
      true
    );
  ELSE
    -- Update existing user's auth ID if needed
    UPDATE public.users 
    SET id = NEW.id 
    WHERE email = NEW.email AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update existing admin user to match auth.users structure if needed
UPDATE public.users 
SET email = 'admin@serranotex.com',
    full_name = 'System Administrator',
    role = 'super_admin'
WHERE email = 'admin@serranotex.com';

SELECT 'Admin user setup completed!' as status;
SELECT 'Next steps:' as info;
SELECT '1. Go to Supabase Dashboard > Authentication > Users' as step1;
SELECT '2. Click "Add user" and create: admin@serranotex.com with password: Admin123!' as step2;
SELECT '3. The trigger will automatically sync with your users table' as step3;
-- Create Admin User Setup (Safe Version)
-- Run this SQL in Supabase Dashboard > SQL Editor

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
        WHEN NEW.email = 'sales@serranotex.com' THEN 'sales_manager'::user_role
        WHEN NEW.email = 'investor@serranotex.com' THEN 'investor'::user_role
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

-- Create trigger for new user signup (will replace if exists)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update existing admin user to ensure consistency
UPDATE public.users 
SET email = 'admin@serranotex.com',
    full_name = 'System Administrator',
    role = 'super_admin'
WHERE email = 'admin@serranotex.com';

-- If admin user doesn't exist, create it
INSERT INTO public.users (email, full_name, role, is_active)
VALUES ('admin@serranotex.com', 'System Administrator', 'super_admin', true)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

SELECT 'Admin user setup completed successfully!' as status;
SELECT 'Next steps:' as info;
SELECT '1. Go to Supabase Dashboard > Authentication > Users' as step1;
SELECT '2. Click "Add user" and create: admin@serranotex.com with password: Admin123!' as step2;
SELECT '3. The trigger will automatically sync with your users table' as step3;
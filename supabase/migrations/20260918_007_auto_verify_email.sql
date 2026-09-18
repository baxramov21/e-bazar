-- Create a function to automatically verify emails upon signup
CREATE OR REPLACE FUNCTION public.handle_new_user_auto_verify()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically set the email to confirmed
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created_auto_verify ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_verify
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_auto_verify();

-- Fix egg_deliveries trigger issues
-- Drop the problematic trigger that tries to set user_id field that doesn't exist
DROP TRIGGER IF EXISTS set_delivery_user_id ON egg_deliveries;

-- Ensure we have the correct triggers for egg_deliveries table
-- First, drop any duplicate triggers to clean up
DROP TRIGGER IF EXISTS set_delivery_metadata_trigger ON egg_deliveries;
DROP TRIGGER IF EXISTS calculate_delivery_total_trigger ON egg_deliveries;
DROP TRIGGER IF EXISTS trigger_delivery_financial_update ON egg_deliveries;

-- Recreate the proper triggers with correct functions
-- 1. Set metadata (created_by and updated_at)
CREATE TRIGGER set_delivery_metadata_trigger
  BEFORE INSERT OR UPDATE ON egg_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION set_delivery_metadata();

-- 2. Calculate total amount
CREATE TRIGGER calculate_delivery_total_trigger
  BEFORE INSERT OR UPDATE ON egg_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_delivery_total();

-- 3. Update financial summary after changes
CREATE TRIGGER trigger_delivery_financial_update
  AFTER INSERT OR UPDATE OR DELETE ON egg_deliveries
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_delivery_financial_update();

-- Fix transaction_audit_log RLS policy to allow system inserts
-- This fixes the RLS violations we see in the logs
DROP POLICY IF EXISTS "Allow authenticated users to insert audit logs" ON transaction_audit_log;
CREATE POLICY "Allow authenticated users to insert audit logs"
  ON transaction_audit_log
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR user_id IS NULL);
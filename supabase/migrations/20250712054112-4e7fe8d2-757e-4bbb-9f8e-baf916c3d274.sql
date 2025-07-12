-- Update transfer agents with correct contact information
UPDATE transfer_agents 
SET 
  phone_number = '+256704414770',
  email = 'info@goldcharpinvestments.com'
WHERE status = 'active';

-- Fix the name spelling inconsistency for Najjuko Agnes in loan_book_live table
UPDATE loan_book_live 
SET client_name = 'Najjuko Agnes' 
WHERE client_name = 'Najuuko Agnes';

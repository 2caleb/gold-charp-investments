export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      applicant_name: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      client_name: {
        Row: {
          address: string
          created_at: string
          deleted_at: string | null
          email: string | null
          employment_status: string
          full_name: string
          id: string
          id_number: string
          monthly_income: number
          phone_number: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          employment_status: string
          full_name: string
          id?: string
          id_number: string
          monthly_income: number
          phone_number: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          employment_status?: string
          full_name?: string
          id?: string
          id_number?: string
          monthly_income?: number
          phone_number?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      delete_to: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      document_metadata: {
        Row: {
          content_type: string
          description: string | null
          document_type: string
          file_name: string
          file_size: number
          id: string
          loan_application_id: string | null
          storage_path: string
          tags: string[] | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          content_type: string
          description?: string | null
          document_type: string
          file_name: string
          file_size: number
          id?: string
          loan_application_id?: string | null
          storage_path: string
          tags?: string[] | null
          uploaded_at?: string
          user_id: string
        }
        Update: {
          content_type?: string
          description?: string | null
          document_type?: string
          file_name?: string
          file_size?: number
          id?: string
          loan_application_id?: string | null
          storage_path?: string
          tags?: string[] | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          created_at: string | null
          effective_date: string | null
          from_currency: string
          id: string
          rate: number
          to_currency: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          effective_date?: string | null
          from_currency: string
          id?: string
          rate: number
          to_currency: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          effective_date?: string | null
          from_currency?: string
          id?: string
          rate?: number
          to_currency?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      Expenses: {
        Row: {
          account_2: string | null
          amount: string | null
          date: string | null
          date_2: string | null
          loan_amount: string | null
          Loan_holders: string
          particulars: string | null
        }
        Insert: {
          account_2?: string | null
          amount?: string | null
          date?: string | null
          date_2?: string | null
          loan_amount?: string | null
          Loan_holders: string
          particulars?: string | null
        }
        Update: {
          account_2?: string | null
          amount?: string | null
          date?: string | null
          date_2?: string | null
          loan_amount?: string | null
          Loan_holders?: string
          particulars?: string | null
        }
        Relationships: []
      }
      expenses_live: {
        Row: {
          Account: string
          account_name: string | null
          amount: number
          category: string | null
          created_at: string | null
          created_by: string | null
          expense_date: string
          Final_amount: number | null
          id: string
          particulars: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          Account: string
          account_name?: string | null
          amount: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          expense_date?: string
          Final_amount?: number | null
          id?: string
          particulars: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          Account?: string
          account_name?: string | null
          amount?: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          expense_date?: string
          Final_amount?: number | null
          id?: string
          particulars?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_adjustments: {
        Row: {
          adjusted_value: number
          adjustment_type: string
          approved_by: string | null
          created_at: string
          created_by: string
          effective_date: string
          expires_at: string | null
          id: string
          original_value: number
          reason: string
          status: string | null
          updated_at: string
        }
        Insert: {
          adjusted_value: number
          adjustment_type: string
          approved_by?: string | null
          created_at?: string
          created_by: string
          effective_date?: string
          expires_at?: string | null
          id?: string
          original_value: number
          reason: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          adjusted_value?: number
          adjustment_type?: string
          approved_by?: string | null
          created_at?: string
          created_by?: string
          effective_date?: string
          expires_at?: string | null
          id?: string
          original_value?: number
          reason?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      financial_management: {
        Row: {
          amount: number
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          category: string
          created_at: string
          created_by: string
          description: string
          entry_type: string
          id: string
          metadata: Json | null
          period_end: string | null
          period_start: string | null
          rejection_reason: string | null
          status: string | null
          target_amount: number | null
          updated_at: string
        }
        Insert: {
          amount: number
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category: string
          created_at?: string
          created_by: string
          description: string
          entry_type: string
          id?: string
          metadata?: Json | null
          period_end?: string | null
          period_start?: string | null
          rejection_reason?: string | null
          status?: string | null
          target_amount?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          entry_type?: string
          id?: string
          metadata?: Json | null
          period_end?: string | null
          period_start?: string | null
          rejection_reason?: string | null
          status?: string | null
          target_amount?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      financial_management_audit_log: {
        Row: {
          action: string
          details: Json | null
          financial_management_id: string | null
          id: string
          ip_address: string | null
          new_status: string | null
          old_status: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          financial_management_id?: string | null
          id?: string
          ip_address?: string | null
          new_status?: string | null
          old_status?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          financial_management_id?: string | null
          id?: string
          ip_address?: string | null
          new_status?: string | null
          old_status?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_management_audit_log_financial_management_id_fkey"
            columns: ["financial_management_id"]
            isOneToOne: false
            referencedRelation: "financial_management"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_summary: {
        Row: {
          active_loan_holders: number
          calculated_at: string
          collection_rate: number
          created_at: string
          id: string
          net_income: number
          outstanding_balance: number
          total_expenses: number
          total_income: number
          total_loan_portfolio: number
          total_repaid: number
          updated_at: string
        }
        Insert: {
          active_loan_holders?: number
          calculated_at?: string
          collection_rate?: number
          created_at?: string
          id?: string
          net_income?: number
          outstanding_balance?: number
          total_expenses?: number
          total_income?: number
          total_loan_portfolio?: number
          total_repaid?: number
          updated_at?: string
        }
        Update: {
          active_loan_holders?: number
          calculated_at?: string
          collection_rate?: number
          created_at?: string
          id?: string
          net_income?: number
          outstanding_balance?: number
          total_expenses?: number
          total_income?: number
          total_loan_portfolio?: number
          total_repaid?: number
          updated_at?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string
          date: string
          description: string
          id: string
          loan_application_id: string | null
          payment_method: string | null
          reference_number: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string
          created_at?: string
          created_by: string
          date?: string
          description: string
          id?: string
          loan_application_id?: string | null
          payment_method?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string
          date?: string
          description?: string
          id?: string
          loan_application_id?: string | null
          payment_method?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: []
      }
      loan_applications: {
        Row: {
          address: string
          approval_notes: string | null
          client_id: string | null
          client_name: string
          created_at: string | null
          created_by: string
          current_approver: string
          employment_status: string
          id: string
          id_number: string
          last_updated: string | null
          loan_amount: string
          loan_id: string
          loan_type: string
          monthly_income: number
          notes: string | null
          phone_number: string
          purpose_of_loan: string
          rejection_reason: string | null
          status: string
        }
        Insert: {
          address: string
          approval_notes?: string | null
          client_id?: string | null
          client_name: string
          created_at?: string | null
          created_by: string
          current_approver: string
          employment_status: string
          id?: string
          id_number: string
          last_updated?: string | null
          loan_amount: string
          loan_id?: string
          loan_type: string
          monthly_income: number
          notes?: string | null
          phone_number: string
          purpose_of_loan: string
          rejection_reason?: string | null
          status?: string
        }
        Update: {
          address?: string
          approval_notes?: string | null
          client_id?: string | null
          client_name?: string
          created_at?: string | null
          created_by?: string
          current_approver?: string
          employment_status?: string
          id?: string
          id_number?: string
          last_updated?: string | null
          loan_amount?: string
          loan_id?: string
          loan_type?: string
          monthly_income?: number
          notes?: string | null
          phone_number?: string
          purpose_of_loan?: string
          rejection_reason?: string | null
          status?: string
        }
        Relationships: []
      }
      loan_applications_workflow: {
        Row: {
          ceo_approved: boolean | null
          ceo_notes: string | null
          chairperson_approved: boolean | null
          chairperson_notes: string | null
          created_at: string | null
          current_stage: string
          director_approved: boolean | null
          director_notes: string | null
          field_officer_approved: boolean | null
          field_officer_notes: string | null
          id: string
          loan_application_id: string
          manager_approved: boolean | null
          manager_notes: string | null
          updated_at: string | null
        }
        Insert: {
          ceo_approved?: boolean | null
          ceo_notes?: string | null
          chairperson_approved?: boolean | null
          chairperson_notes?: string | null
          created_at?: string | null
          current_stage: string
          director_approved?: boolean | null
          director_notes?: string | null
          field_officer_approved?: boolean | null
          field_officer_notes?: string | null
          id?: string
          loan_application_id: string
          manager_approved?: boolean | null
          manager_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          ceo_approved?: boolean | null
          ceo_notes?: string | null
          chairperson_approved?: boolean | null
          chairperson_notes?: string | null
          created_at?: string | null
          current_stage?: string
          director_approved?: boolean | null
          director_notes?: string | null
          field_officer_approved?: boolean | null
          field_officer_notes?: string | null
          id?: string
          loan_application_id?: string
          manager_approved?: boolean | null
          manager_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_loan_app_workflow"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_book: {
        Row: {
          Amount_Paid_1: number | null
          Amount_Paid_2: number | null
          Amount_paid_3: string | null
          Amount_paid_4: number | null
          Amount_Returnable: number | null
          Date: string
          Name: string | null
          Payment_Mode: string | null
          Remaining_Balance: string | null
        }
        Insert: {
          Amount_Paid_1?: number | null
          Amount_Paid_2?: number | null
          Amount_paid_3?: string | null
          Amount_paid_4?: number | null
          Amount_Returnable?: number | null
          Date: string
          Name?: string | null
          Payment_Mode?: string | null
          Remaining_Balance?: string | null
        }
        Update: {
          Amount_Paid_1?: number | null
          Amount_Paid_2?: number | null
          Amount_paid_3?: string | null
          Amount_paid_4?: number | null
          Amount_Returnable?: number | null
          Date?: string
          Name?: string | null
          Payment_Mode?: string | null
          Remaining_Balance?: string | null
        }
        Relationships: []
      }
      loan_book_live: {
        Row: {
          amount_paid_1: number | null
          amount_paid_2: number | null
          amount_paid_3: number | null
          amount_paid_4: number | null
          amount_returnable: number
          client_name: string
          created_at: string | null
          id: string
          loan_date: string
          payment_mode: string | null
          remaining_balance: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_paid_1?: number | null
          amount_paid_2?: number | null
          amount_paid_3?: number | null
          amount_paid_4?: number | null
          amount_returnable?: number
          client_name: string
          created_at?: string | null
          id?: string
          loan_date?: string
          payment_mode?: string | null
          remaining_balance?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_paid_1?: number | null
          amount_paid_2?: number | null
          amount_paid_3?: number | null
          amount_paid_4?: number | null
          amount_returnable?: number
          client_name?: string
          created_at?: string | null
          id?: string
          loan_date?: string
          payment_mode?: string | null
          remaining_balance?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      loan_workflow_log: {
        Row: {
          action: string
          id: string
          loan_application_id: string
          performed_at: string | null
          performed_by: string
          status: string | null
        }
        Insert: {
          action: string
          id?: string
          loan_application_id: string
          performed_at?: string | null
          performed_by: string
          status?: string | null
        }
        Update: {
          action?: string
          id?: string
          loan_application_id?: string
          performed_at?: string | null
          performed_by?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_workflow_log_loan_application_id_fkey"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      "loan-approval": {
        Row: {
          full_name: string | null
          id: string
          Permissions: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          full_name?: string | null
          id: string
          Permissions?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          full_name?: string | null
          id?: string
          Permissions?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: []
      }
      money_transfers: {
        Row: {
          audit_trail: Json | null
          completed_at: string | null
          created_at: string | null
          estimated_delivery: string | null
          exchange_rate: number
          failure_reason: string | null
          flutterwave_reference: string | null
          flutterwave_transaction_id: string | null
          id: string
          pickup_location: string | null
          processor_response: Json | null
          purpose: string | null
          receive_amount: number
          receive_currency: string
          receiver_phone: string
          recipient_id: string
          reference_number: string
          send_amount: number
          send_currency: string
          sender_id: string
          sender_phone: string | null
          status: string | null
          total_amount: number
          transaction_hash: string | null
          transfer_fee: number
          transfer_method: string
          updated_at: string | null
        }
        Insert: {
          audit_trail?: Json | null
          completed_at?: string | null
          created_at?: string | null
          estimated_delivery?: string | null
          exchange_rate: number
          failure_reason?: string | null
          flutterwave_reference?: string | null
          flutterwave_transaction_id?: string | null
          id?: string
          pickup_location?: string | null
          processor_response?: Json | null
          purpose?: string | null
          receive_amount: number
          receive_currency: string
          receiver_phone?: string
          recipient_id: string
          reference_number?: string
          send_amount: number
          send_currency?: string
          sender_id: string
          sender_phone?: string | null
          status?: string | null
          total_amount: number
          transaction_hash?: string | null
          transfer_fee: number
          transfer_method: string
          updated_at?: string | null
        }
        Update: {
          audit_trail?: Json | null
          completed_at?: string | null
          created_at?: string | null
          estimated_delivery?: string | null
          exchange_rate?: number
          failure_reason?: string | null
          flutterwave_reference?: string | null
          flutterwave_transaction_id?: string | null
          id?: string
          pickup_location?: string | null
          processor_response?: Json | null
          purpose?: string | null
          receive_amount?: number
          receive_currency?: string
          receiver_phone?: string
          recipient_id?: string
          reference_number?: string
          send_amount?: number
          send_currency?: string
          sender_id?: string
          sender_phone?: string | null
          status?: string | null
          total_amount?: number
          transaction_hash?: string | null
          transfer_fee?: number
          transfer_method?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "money_transfers_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "transfer_recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      mortgage_calculations: {
        Row: {
          created_at: string
          id: string
          insurance: number | null
          interest_rate: number
          monthly_payment: number
          principal: number
          tax: number | null
          term_years: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          insurance?: number | null
          interest_rate: number
          monthly_payment: number
          principal: number
          tax?: number | null
          term_years: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          insurance?: number | null
          interest_rate?: number
          monthly_payment?: number
          principal?: number
          tax?: number | null
          term_years?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string
          id: string
          is_read: boolean | null
          message: string
          related_to: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          id?: string
          is_read?: boolean | null
          message: string
          related_to: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          id?: string
          is_read?: boolean | null
          message?: string
          related_to?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          new_column_name: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          new_column_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          new_column_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      "public.client_name": {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      roles: {
        Row: {
          full_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          full_name?: string | null
          id: string
          role?: string | null
        }
        Update: {
          full_name?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      shared_excel_data: {
        Row: {
          created_at: string
          id: string
          row_data: Json
          row_index: number
          sheet_name: string
          updated_at: string
          upload_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          row_data: Json
          row_index: number
          sheet_name: string
          updated_at?: string
          upload_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          id?: string
          row_data?: Json
          row_index?: number
          sheet_name?: string
          updated_at?: string
          upload_id?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      transaction_audit_log: {
        Row: {
          action: string
          details: Json | null
          id: string
          ip_address: string | null
          new_status: string | null
          old_status: string | null
          timestamp: string | null
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          new_status?: string | null
          old_status?: string | null
          timestamp?: string | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          new_status?: string | null
          old_status?: string | null
          timestamp?: string | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_audit_log_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "money_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_agents: {
        Row: {
          address: string
          agent_name: string
          city: string
          country: string
          created_at: string | null
          email: string | null
          id: string
          operating_hours: string | null
          phone_number: string | null
          services: Json | null
          status: string | null
        }
        Insert: {
          address: string
          agent_name: string
          city: string
          country: string
          created_at?: string | null
          email?: string | null
          id?: string
          operating_hours?: string | null
          phone_number?: string | null
          services?: Json | null
          status?: string | null
        }
        Update: {
          address?: string
          agent_name?: string
          city?: string
          country?: string
          created_at?: string | null
          email?: string | null
          id?: string
          operating_hours?: string | null
          phone_number?: string | null
          services?: Json | null
          status?: string | null
        }
        Relationships: []
      }
      transfer_fees: {
        Row: {
          amount_max: number
          amount_min: number
          created_at: string | null
          currency: string
          fee_percentage: number | null
          fixed_fee: number | null
          id: string
          transfer_method: string
        }
        Insert: {
          amount_max: number
          amount_min: number
          created_at?: string | null
          currency?: string
          fee_percentage?: number | null
          fixed_fee?: number | null
          id?: string
          transfer_method: string
        }
        Update: {
          amount_max?: number
          amount_min?: number
          created_at?: string | null
          currency?: string
          fee_percentage?: number | null
          fixed_fee?: number | null
          id?: string
          transfer_method?: string
        }
        Relationships: []
      }
      transfer_recipients: {
        Row: {
          account_number: string | null
          address: string | null
          bank_name: string | null
          city: string | null
          country: string
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          phone_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_number?: string | null
          address?: string | null
          bank_name?: string | null
          city?: string | null
          country: string
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          phone_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_number?: string | null
          address?: string | null
          bank_name?: string | null
          city?: string | null
          country?: string
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      upload_history: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          id: string
          original_file_name: string
          processing_notes: string | null
          sheet_count: number
          status: string
          storage_path: string
          total_rows: number
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          id?: string
          original_file_name: string
          processing_notes?: string | null
          sheet_count?: number
          status?: string
          storage_path: string
          total_rows?: number
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          id?: string
          original_file_name?: string
          processing_notes?: string | null
          sheet_count?: number
          status?: string
          storage_path?: string
          total_rows?: number
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          role: string
          user_id: string
        }
        Insert: {
          role: string
          user_id: string
        }
        Update: {
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      view_data: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      weekly_reports: {
        Row: {
          applications_approved: number
          applications_rejected: number
          applications_reviewed: number
          created_at: string | null
          id: string
          pending_applications: number
          report_week: string
          role_type: string
          updated_at: string | null
        }
        Insert: {
          applications_approved?: number
          applications_rejected?: number
          applications_reviewed?: number
          created_at?: string | null
          id?: string
          pending_applications?: number
          report_week: string
          role_type: string
          updated_at?: string | null
        }
        Update: {
          applications_approved?: number
          applications_rejected?: number
          applications_reviewed?: number
          created_at?: string | null
          id?: string
          pending_applications?: number
          report_week?: string
          role_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_repayment_schedule: {
        Args: {
          p_principal: number
          p_interest_rate: number
          p_term_months: number
          p_start_date: string
        }
        Returns: {
          payment_number: number
          payment_date: string
          principal_payment: number
          interest_payment: number
          total_payment: number
          remaining_balance: number
        }[]
      }
      check_loan_application: {
        Args: { application_id: number }
        Returns: Json
      }
      get_loan_workflow: {
        Args: { application_id: string }
        Returns: {
          id: string
          loan_application_id: string
          current_stage: string
          field_officer_approved: boolean
          manager_approved: boolean
          director_approved: boolean
          ceo_approved: boolean
          chairperson_approved: boolean
          field_officer_notes: string
          manager_notes: string
          director_notes: string
          ceo_notes: string
          chairperson_notes: string
          created_at: string
          updated_at: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      is_director_caleb: {
        Args: { user_id: string }
        Returns: boolean
      }
      update_financial_summary: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      transaction_status: "pending" | "completed" | "cancelled"
      transaction_type: "income" | "expense"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      transaction_status: ["pending", "completed", "cancelled"],
      transaction_type: ["income", "expense"],
    },
  },
} as const

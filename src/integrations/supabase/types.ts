export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      egg_deliveries: {
        Row: {
          created_at: string | null
          created_by: string | null
          delivery_date: string
          delivery_location: string | null
          id: string
          notes: string | null
          payment_status: string
          phone_number: string | null
          price_per_tray: number
          supplier_name: string
          total_amount: number
          trays: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          delivery_date: string
          delivery_location?: string | null
          id?: string
          notes?: string | null
          payment_status?: string
          phone_number?: string | null
          price_per_tray: number
          supplier_name: string
          total_amount: number
          trays: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          delivery_date?: string
          delivery_location?: string | null
          id?: string
          notes?: string | null
          payment_status?: string
          phone_number?: string | null
          price_per_tray?: number
          supplier_name?: string
          total_amount?: number
          trays?: number
          updated_at?: string | null
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
      expense_daily_summaries: {
        Row: {
          account: string
          average_amount: number
          category: string
          created_at: string | null
          day_of_week: number
          expense_date: string
          id: string
          max_amount: number
          min_amount: number
          total_amount: number
          transaction_count: number
          updated_at: string | null
        }
        Insert: {
          account: string
          average_amount?: number
          category: string
          created_at?: string | null
          day_of_week: number
          expense_date: string
          id?: string
          max_amount?: number
          min_amount?: number
          total_amount?: number
          transaction_count?: number
          updated_at?: string | null
        }
        Update: {
          account?: string
          average_amount?: number
          category?: string
          created_at?: string | null
          day_of_week?: number
          expense_date?: string
          id?: string
          max_amount?: number
          min_amount?: number
          total_amount?: number
          transaction_count?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      expense_monthly_summaries: {
        Row: {
          account: string
          average_weekly_amount: number
          budget_amount: number | null
          budget_variance: number | null
          category: string
          created_at: string | null
          growth_percentage: number | null
          id: string
          month: number
          month_end_date: string
          month_start_date: string
          total_amount: number
          updated_at: string | null
          variance_from_previous_month: number | null
          weekly_summaries_count: number
          year: number
        }
        Insert: {
          account: string
          average_weekly_amount?: number
          budget_amount?: number | null
          budget_variance?: number | null
          category: string
          created_at?: string | null
          growth_percentage?: number | null
          id?: string
          month: number
          month_end_date: string
          month_start_date: string
          total_amount?: number
          updated_at?: string | null
          variance_from_previous_month?: number | null
          weekly_summaries_count?: number
          year: number
        }
        Update: {
          account?: string
          average_weekly_amount?: number
          budget_amount?: number | null
          budget_variance?: number | null
          category?: string
          created_at?: string | null
          growth_percentage?: number | null
          id?: string
          month?: number
          month_end_date?: string
          month_start_date?: string
          total_amount?: number
          updated_at?: string | null
          variance_from_previous_month?: number | null
          weekly_summaries_count?: number
          year?: number
        }
        Relationships: []
      }
      expense_smart_calculations: {
        Row: {
          account: string | null
          calculation_data: Json
          calculation_type: string
          category: string | null
          confidence_score: number | null
          created_at: string | null
          id: string
          insights: string[] | null
          month: number
          recommendations: string[] | null
          year: number
        }
        Insert: {
          account?: string | null
          calculation_data?: Json
          calculation_type: string
          category?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          insights?: string[] | null
          month: number
          recommendations?: string[] | null
          year: number
        }
        Update: {
          account?: string | null
          calculation_data?: Json
          calculation_type?: string
          category?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          insights?: string[] | null
          month?: number
          recommendations?: string[] | null
          year?: number
        }
        Relationships: []
      }
      expense_weekly_summaries: {
        Row: {
          account: string
          average_amount: number
          category: string
          created_at: string | null
          id: string
          max_amount: number
          min_amount: number
          total_amount: number
          transaction_count: number
          updated_at: string | null
          week_end_date: string
          week_number: number
          week_start_date: string
          year: number
        }
        Insert: {
          account: string
          average_amount?: number
          category: string
          created_at?: string | null
          id?: string
          max_amount?: number
          min_amount?: number
          total_amount?: number
          transaction_count?: number
          updated_at?: string | null
          week_end_date: string
          week_number: number
          week_start_date: string
          year: number
        }
        Update: {
          account?: string
          average_amount?: number
          category?: string
          created_at?: string | null
          id?: string
          max_amount?: number
          min_amount?: number
          total_amount?: number
          transaction_count?: number
          updated_at?: string | null
          week_end_date?: string
          week_number?: number
          week_start_date?: string
          year?: number
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
          date: string
          description: string
          id: string
          payment_method: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string
          created_at?: string
          date?: string
          description: string
          id?: string
          payment_method?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          payment_method?: string | null
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
          Amount_paid_10: number | null
          Amount_paid_11: number | null
          Amount_paid_12: number | null
          Amount_Paid_2: number | null
          Amount_paid_3: string | null
          Amount_paid_4: number | null
          Amount_paid_5: number | null
          Amount_paid_6: number | null
          Amount_paid_7: number | null
          Amount_paid_8: number | null
          Amount_paid_9: number | null
          Amount_Returnable: number | null
          Date: string
          Name: string | null
          Payment_Mode: string | null
          Remaining_Balance: string | null
        }
        Insert: {
          Amount_Paid_1?: number | null
          Amount_paid_10?: number | null
          Amount_paid_11?: number | null
          Amount_paid_12?: number | null
          Amount_Paid_2?: number | null
          Amount_paid_3?: string | null
          Amount_paid_4?: number | null
          Amount_paid_5?: number | null
          Amount_paid_6?: number | null
          Amount_paid_7?: number | null
          Amount_paid_8?: number | null
          Amount_paid_9?: number | null
          Amount_Returnable?: number | null
          Date: string
          Name?: string | null
          Payment_Mode?: string | null
          Remaining_Balance?: string | null
        }
        Update: {
          Amount_Paid_1?: number | null
          Amount_paid_10?: number | null
          Amount_paid_11?: number | null
          Amount_paid_12?: number | null
          Amount_Paid_2?: number | null
          Amount_paid_3?: string | null
          Amount_paid_4?: number | null
          Amount_paid_5?: number | null
          Amount_paid_6?: number | null
          Amount_paid_7?: number | null
          Amount_paid_8?: number | null
          Amount_paid_9?: number | null
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
          "02-06-2025": number | null
          "04-06-2025": number | null
          "05-06-2025": number | null
          "07-06-2025": number | null
          "10-06-2025": number | null
          "11-06-2025": number | null
          "12-06-2025": number | null
          "13-06-2025": number | null
          "14-06-2025": number | null
          "16-06-2025": number | null
          "17-06-2025": number | null
          "18-06-2025": number | null
          "19-05-2025": number | null
          "19-06-2025": number | null
          "20-06-2025": number | null
          "22-05-2025": number | null
          "23-06-2025": number | null
          "24-06-2025": number | null
          "25-06-2025": number | null
          "26-05-2025": number | null
          "26-06-2025": number | null
          "27-05-2025": number | null
          "27-06-2025": number | null
          "28-05-2025": number | null
          "30-05-2025": number | null
          "31-05-2025": number | null
          amount_returnable: number
          client_name: string
          created_at: string | null
          default_probability: number
          id: string
          loan_date: string
          payment_mode: string | null
          remaining_balance: number | null
          risk_factors: Json | null
          risk_level: string
          risk_score: number
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          "02-06-2025"?: number | null
          "04-06-2025"?: number | null
          "05-06-2025"?: number | null
          "07-06-2025"?: number | null
          "10-06-2025"?: number | null
          "11-06-2025"?: number | null
          "12-06-2025"?: number | null
          "13-06-2025"?: number | null
          "14-06-2025"?: number | null
          "16-06-2025"?: number | null
          "17-06-2025"?: number | null
          "18-06-2025"?: number | null
          "19-05-2025"?: number | null
          "19-06-2025"?: number | null
          "20-06-2025"?: number | null
          "22-05-2025"?: number | null
          "23-06-2025"?: number | null
          "24-06-2025"?: number | null
          "25-06-2025"?: number | null
          "26-05-2025"?: number | null
          "26-06-2025"?: number | null
          "27-05-2025"?: number | null
          "27-06-2025"?: number | null
          "28-05-2025"?: number | null
          "30-05-2025"?: number | null
          "31-05-2025"?: number | null
          amount_returnable?: number
          client_name: string
          created_at?: string | null
          default_probability?: number
          id?: string
          loan_date?: string
          payment_mode?: string | null
          remaining_balance?: number | null
          risk_factors?: Json | null
          risk_level?: string
          risk_score?: number
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          "02-06-2025"?: number | null
          "04-06-2025"?: number | null
          "05-06-2025"?: number | null
          "07-06-2025"?: number | null
          "10-06-2025"?: number | null
          "11-06-2025"?: number | null
          "12-06-2025"?: number | null
          "13-06-2025"?: number | null
          "14-06-2025"?: number | null
          "16-06-2025"?: number | null
          "17-06-2025"?: number | null
          "18-06-2025"?: number | null
          "19-05-2025"?: number | null
          "19-06-2025"?: number | null
          "20-06-2025"?: number | null
          "22-05-2025"?: number | null
          "23-06-2025"?: number | null
          "24-06-2025"?: number | null
          "25-06-2025"?: number | null
          "26-05-2025"?: number | null
          "26-06-2025"?: number | null
          "27-05-2025"?: number | null
          "27-06-2025"?: number | null
          "28-05-2025"?: number | null
          "30-05-2025"?: number | null
          "31-05-2025"?: number | null
          amount_returnable?: number
          client_name?: string
          created_at?: string | null
          default_probability?: number
          id?: string
          loan_date?: string
          payment_mode?: string | null
          remaining_balance?: number | null
          risk_factors?: Json | null
          risk_level?: string
          risk_score?: number
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      loan_risk_history: {
        Row: {
          calculated_at: string | null
          calculated_by: string | null
          default_probability: number
          id: string
          loan_id: string
          risk_factors: Json | null
          risk_level: string
          risk_score: number
        }
        Insert: {
          calculated_at?: string | null
          calculated_by?: string | null
          default_probability: number
          id?: string
          loan_id: string
          risk_factors?: Json | null
          risk_level: string
          risk_score: number
        }
        Update: {
          calculated_at?: string | null
          calculated_by?: string | null
          default_probability?: number
          id?: string
          loan_id?: string
          risk_factors?: Json | null
          risk_level?: string
          risk_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "loan_risk_history_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loan_book_live"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_risk_prediction_log: {
        Row: {
          calculated_at: string | null
          default_probability: number
          id: string
          loan_id: string
          model_input: Json | null
          model_output: Json | null
          model_version: string
          risk_score: number
        }
        Insert: {
          calculated_at?: string | null
          default_probability: number
          id?: string
          loan_id: string
          model_input?: Json | null
          model_output?: Json | null
          model_version: string
          risk_score: number
        }
        Update: {
          calculated_at?: string | null
          default_probability?: number
          id?: string
          loan_id?: string
          model_input?: Json | null
          model_output?: Json | null
          model_version?: string
          risk_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "loan_risk_prediction_log_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loan_book_live"
            referencedColumns: ["id"]
          },
        ]
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
      sticky_notes: {
        Row: {
          author_name: string | null
          color: string | null
          content: string
          created_at: string
          id: string
          note_type: string
          payment_id: string | null
          position_x: number | null
          position_y: number | null
          record_id: string
          record_type: string
          updated_at: string
          user_id: string
          user_role: string
        }
        Insert: {
          author_name?: string | null
          color?: string | null
          content?: string
          created_at?: string
          id?: string
          note_type?: string
          payment_id?: string | null
          position_x?: number | null
          position_y?: number | null
          record_id: string
          record_type?: string
          updated_at?: string
          user_id: string
          user_role: string
        }
        Update: {
          author_name?: string | null
          color?: string | null
          content?: string
          created_at?: string
          id?: string
          note_type?: string
          payment_id?: string | null
          position_x?: number | null
          position_y?: number | null
          record_id?: string
          record_type?: string
          updated_at?: string
          user_id?: string
          user_role?: string
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
          p_interest_rate: number
          p_principal: number
          p_start_date: string
          p_term_months: number
        }
        Returns: {
          interest_payment: number
          payment_date: string
          payment_number: number
          principal_payment: number
          remaining_balance: number
          total_payment: number
        }[]
      }
      check_loan_application: {
        Args: { application_id: number }
        Returns: Json
      }
      cluster_expenses_daily: {
        Args: { target_date?: string }
        Returns: undefined
      }
      cluster_expenses_monthly: {
        Args: { target_month?: number; target_year?: number }
        Returns: undefined
      }
      cluster_expenses_weekly: {
        Args: { target_week_start?: string }
        Returns: undefined
      }
      create_egg_delivery: {
        Args: { delivery: Json; user_id_override?: string }
        Returns: Json
      }
      get_loan_workflow: {
        Args: { application_id: string }
        Returns: {
          ceo_approved: boolean
          ceo_notes: string
          chairperson_approved: boolean
          chairperson_notes: string
          created_at: string
          current_stage: string
          director_approved: boolean
          director_notes: string
          field_officer_approved: boolean
          field_officer_notes: string
          id: string
          loan_application_id: string
          manager_approved: boolean
          manager_notes: string
          updated_at: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_week_boundaries: {
        Args: { input_date: string }
        Returns: {
          week_end: string
          week_number: number
          week_start: string
          year: number
        }[]
      }
      is_director_caleb: {
        Args: { user_id: string }
        Returns: boolean
      }
      smart_end_of_day_analysis: {
        Args: { target_date?: string }
        Returns: undefined
      }
      smart_end_of_month_analysis: {
        Args: { target_month?: number; target_year?: number }
        Returns: undefined
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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

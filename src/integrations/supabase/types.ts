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
      branches: {
        Row: {
          address: string
          created_at: string
          email: string | null
          id: string
          location: string
          manager_id: string | null
          name: string
          phone_number: string
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string
          email?: string | null
          id?: string
          location: string
          manager_id?: string | null
          name: string
          phone_number: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          email?: string | null
          id?: string
          location?: string
          manager_id?: string | null
          name?: string
          phone_number?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string
          created_at: string
          email: string | null
          employment_status: string
          full_name: string
          id: string
          id_number: string
          monthly_income: number
          phone_number: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address: string
          created_at?: string
          email?: string | null
          employment_status: string
          full_name: string
          id?: string
          id_number: string
          monthly_income: number
          phone_number: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          email?: string | null
          employment_status?: string
          full_name?: string
          id?: string
          id_number?: string
          monthly_income?: number
          phone_number?: string
          updated_at?: string | null
          user_id?: string | null
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
      loan_applications: {
        Row: {
          address: string
          approval_notes: string | null
          client_name: string
          created_at: string | null
          created_by: string
          current_approver: string
          employment_status: string
          id: string
          id_number: string
          last_updated: string | null
          loan_amount: string
          loan_type: string
          monthly_income: string
          notes: string | null
          phone_number: string
          purpose_of_loan: string
          rejection_reason: string | null
          status: string
        }
        Insert: {
          address: string
          approval_notes?: string | null
          client_name: string
          created_at?: string | null
          created_by: string
          current_approver: string
          employment_status: string
          id?: string
          id_number: string
          last_updated?: string | null
          loan_amount: string
          loan_type: string
          monthly_income: string
          notes?: string | null
          phone_number: string
          purpose_of_loan: string
          rejection_reason?: string | null
          status?: string
        }
        Update: {
          address?: string
          approval_notes?: string | null
          client_name?: string
          created_at?: string | null
          created_by?: string
          current_approver?: string
          employment_status?: string
          id?: string
          id_number?: string
          last_updated?: string | null
          loan_amount?: string
          loan_type?: string
          monthly_income?: string
          notes?: string | null
          phone_number?: string
          purpose_of_loan?: string
          rejection_reason?: string | null
          status?: string
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
          phone: string | null
          role: string | null
          supabase_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          supabase_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          supabase_id?: string | null
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
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

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
      candidates: {
        Row: {
          created_at: string | null
          "Currency Sal": string | null
          "Data Source": string | null
          Email: string | null
          id: string
          Location: string | null
          Name: string
          "Number of Experience": string | null
          Phone: string | null
          Tech: string | null
          user_id: string | null
          "When Data is loaded in database": string | null
          "When was the profile updated lastly": string | null
          "Which Company working": string | null
        }
        Insert: {
          created_at?: string | null
          "Currency Sal"?: string | null
          "Data Source"?: string | null
          Email?: string | null
          id?: string
          Location?: string | null
          Name: string
          "Number of Experience"?: string | null
          Phone?: string | null
          Tech?: string | null
          user_id?: string | null
          "When Data is loaded in database"?: string | null
          "When was the profile updated lastly"?: string | null
          "Which Company working"?: string | null
        }
        Update: {
          created_at?: string | null
          "Currency Sal"?: string | null
          "Data Source"?: string | null
          Email?: string | null
          id?: string
          Location?: string | null
          Name?: string
          "Number of Experience"?: string | null
          Phone?: string | null
          Tech?: string | null
          user_id?: string | null
          "When Data is loaded in database"?: string | null
          "When was the profile updated lastly"?: string | null
          "Which Company working"?: string | null
        }
        Relationships: []
      }
      failed_records: {
        Row: {
          created_at: string | null
          error_message: string
          id: string
          record_data: Json
          row_number: number
          upload_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message: string
          id?: string
          record_data: Json
          row_number: number
          upload_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string
          id?: string
          record_data?: Json
          row_number?: number
          upload_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "failed_records_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "upload_history"
            referencedColumns: ["id"]
          },
        ]
      }
      job_candidates: {
        Row: {
          created_at: string | null
          created_by: string
          education: string | null
          email: string | null
          experience: string | null
          first_name: string | null
          id: string
          last_name: string | null
          notes: string | null
          phone: string | null
          resume_url: string | null
          skills: string[] | null
          source_file: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          education?: string | null
          email?: string | null
          experience?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          resume_url?: string | null
          skills?: string[] | null
          source_file?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          education?: string | null
          email?: string | null
          experience?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          resume_url?: string | null
          skills?: string[] | null
          source_file?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignedto: string
          createdat: string
          description: string | null
          duedate: string
          id: string
          status: string
          title: string
        }
        Insert: {
          assignedto: string
          createdat?: string
          description?: string | null
          duedate: string
          id?: string
          status: string
          title: string
        }
        Update: {
          assignedto?: string
          createdat?: string
          description?: string | null
          duedate?: string
          id?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      upload_history: {
        Row: {
          created_at: string | null
          error_count: number
          filename: string
          id: string
          success_count: number
          total_records: number
          upload_date: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_count: number
          filename: string
          id?: string
          success_count: number
          total_records: number
          upload_date?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_count?: number
          filename?: string
          id?: string
          success_count?: number
          total_records?: number
          upload_date?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_role_assignments: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role_type"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          permissions: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          permissions: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          permissions?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_has_role: {
        Args: {
          role_name: Database["public"]["Enums"]["user_role_type"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin" | "super_admin"
      user_role_type: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

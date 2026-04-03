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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      app_config: {
        Row: {
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      checklist_notes: {
        Row: {
          content: string | null
          id: string
          section_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          id?: string
          section_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          id?: string
          section_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      checklist_progress: {
        Row: {
          checked: boolean | null
          checked_at: string | null
          created_at: string | null
          id: string
          item_id: string
          user_id: string
        }
        Insert: {
          checked?: boolean | null
          checked_at?: string | null
          created_at?: string | null
          id?: string
          item_id: string
          user_id: string
        }
        Update: {
          checked?: boolean | null
          checked_at?: string | null
          created_at?: string | null
          id?: string
          item_id?: string
          user_id?: string
        }
        Relationships: []
      }
      clinical_questions: {
        Row: {
          created_at: string | null
          difficulty: string | null
          display_order: number | null
          explanation: string | null
          id: string
          options: Json
          question: string
          scenario: string
          theme: string
        }
        Insert: {
          created_at?: string | null
          difficulty?: string | null
          display_order?: number | null
          explanation?: string | null
          id?: string
          options: Json
          question: string
          scenario: string
          theme: string
        }
        Update: {
          created_at?: string | null
          difficulty?: string | null
          display_order?: number | null
          explanation?: string | null
          id?: string
          options?: Json
          question?: string
          scenario?: string
          theme?: string
        }
        Relationships: []
      }
      enamed_dates: {
        Row: {
          display_order: number | null
          event_date: string
          event_name: string
          id: string
          is_critical: boolean | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          display_order?: number | null
          event_date: string
          event_name: string
          id?: string
          is_critical?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          display_order?: number | null
          event_date?: string
          event_name?: string
          id?: string
          is_critical?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          crm: string | null
          full_name: string | null
          id: string
          perfil: string | null
        }
        Insert: {
          created_at?: string | null
          crm?: string | null
          full_name?: string | null
          id: string
          perfil?: string | null
        }
        Update: {
          created_at?: string | null
          crm?: string | null
          full_name?: string | null
          id?: string
          perfil?: string | null
        }
        Relationships: []
      }
      simulado_answers: {
        Row: {
          answered_at: string | null
          id: string
          is_correct: boolean
          question_id: string
          selected_option: number
          session_id: string
          user_id: string
        }
        Insert: {
          answered_at?: string | null
          id?: string
          is_correct: boolean
          question_id: string
          selected_option: number
          session_id: string
          user_id: string
        }
        Update: {
          answered_at?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_option?: number
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulado_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "simulado_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulado_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "simulado_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      simulado_questions: {
        Row: {
          created_at: string | null
          difficulty: string | null
          display_order: number | null
          explanation: string | null
          id: string
          level: number
          options: Json
          question: string
          scenario: string
          theme: string
        }
        Insert: {
          created_at?: string | null
          difficulty?: string | null
          display_order?: number | null
          explanation?: string | null
          id?: string
          level: number
          options: Json
          question: string
          scenario: string
          theme: string
        }
        Update: {
          created_at?: string | null
          difficulty?: string | null
          display_order?: number | null
          explanation?: string | null
          id?: string
          level?: number
          options?: Json
          question?: string
          scenario?: string
          theme?: string
        }
        Relationships: []
      }
      simulado_sessions: {
        Row: {
          completed_at: string | null
          correct_answers: number
          id: string
          is_completed: boolean
          level: number
          started_at: string
          time_seconds: number | null
          total_questions: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          correct_answers?: number
          id?: string
          is_completed?: boolean
          level: number
          started_at?: string
          time_seconds?: number | null
          total_questions?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          correct_answers?: number
          id?: string
          is_completed?: boolean
          level?: number
          started_at?: string
          time_seconds?: number | null
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      user_answers: {
        Row: {
          answered_at: string | null
          id: string
          is_correct: boolean
          question_id: string
          selected_option: number
          user_id: string
        }
        Insert: {
          answered_at?: string | null
          id?: string
          is_correct: boolean
          question_id: string
          selected_option: number
          user_id: string
        }
        Update: {
          answered_at?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_option?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "clinical_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          clinical_level: string | null
          created_at: string | null
          enamed_score: number | null
          last_active_date: string | null
          questions_answered: number | null
          questions_correct: number | null
          streak: number | null
          updated_at: string | null
          user_id: string
          xp: number | null
        }
        Insert: {
          clinical_level?: string | null
          created_at?: string | null
          enamed_score?: number | null
          last_active_date?: string | null
          questions_answered?: number | null
          questions_correct?: number | null
          streak?: number | null
          updated_at?: string | null
          user_id: string
          xp?: number | null
        }
        Update: {
          clinical_level?: string | null
          created_at?: string | null
          enamed_score?: number | null
          last_active_date?: string | null
          questions_answered?: number | null
          questions_correct?: number | null
          streak?: number | null
          updated_at?: string | null
          user_id?: string
          xp?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_clinical_questions: {
        Args: never
        Returns: {
          created_at: string
          difficulty: string
          display_order: number
          explanation: string
          id: string
          options: Json
          question: string
          scenario: string
          theme: string
        }[]
      }
      get_simulado_questions: {
        Args: { p_level: number }
        Returns: {
          difficulty: string
          display_order: number
          explanation: string
          id: string
          level: number
          options: Json
          question: string
          scenario: string
          theme: string
        }[]
      }
      get_simulado_ranking: {
        Args: { p_level: number }
        Returns: {
          attempts: number
          best_score: number
          best_time: number
          full_name: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reset_user_stats: { Args: { p_reset_type: string }; Returns: undefined }
      submit_answer: {
        Args: { p_question_id: string; p_selected_option: number }
        Returns: Json
      }
      submit_simulado_answer: {
        Args: {
          p_question_id: string
          p_selected_option: number
          p_session_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

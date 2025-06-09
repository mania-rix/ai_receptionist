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
      activity_feed: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          id: string
          is_read: boolean | null
          metadata: Json | null
          title: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          conversation_flow_id: string | null
          created_at: string | null
          custom_instructions: string | null
          greeting: string | null
          id: string
          interruption_sensitivity: number | null
          knowledge_base_id: string | null
          name: string | null
          retell_agent_id: string | null
          retell_llm_id: string | null
          temperature: number | null
          tone_settings: Json | null
          user_id: string | null
          voice: string | null
          voice_engine: string | null
        }
        Insert: {
          conversation_flow_id?: string | null
          created_at?: string | null
          custom_instructions?: string | null
          greeting?: string | null
          id?: string
          interruption_sensitivity?: number | null
          knowledge_base_id?: string | null
          name?: string | null
          retell_agent_id?: string | null
          retell_llm_id?: string | null
          temperature?: number | null
          tone_settings?: Json | null
          user_id?: string | null
          voice?: string | null
          voice_engine?: string | null
        }
        Update: {
          conversation_flow_id?: string | null
          created_at?: string | null
          custom_instructions?: string | null
          greeting?: string | null
          id?: string
          interruption_sensitivity?: number | null
          knowledge_base_id?: string | null
          name?: string | null
          retell_agent_id?: string | null
          retell_llm_id?: string | null
          temperature?: number | null
          tone_settings?: Json | null
          user_id?: string | null
          voice?: string | null
          voice_engine?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_knowledge_base_id_fkey"
            columns: ["knowledge_base_id"]
            isOneToOne: false
            referencedRelation: "knowledge_bases"
            referencedColumns: ["id"]
          },
        ]
      }
      anomaly_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          data: Json | null
          description: string | null
          id: string
          is_resolved: boolean | null
          notification_channels: string[] | null
          resolved_at: string | null
          severity: string | null
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          is_resolved?: boolean | null
          notification_channels?: string[] | null
          resolved_at?: string | null
          severity?: string | null
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          is_resolved?: boolean | null
          notification_channels?: string[] | null
          resolved_at?: string | null
          severity?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      brand_settings: {
        Row: {
          company_name: string | null
          created_at: string | null
          custom_css: string | null
          email_templates: Json | null
          id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          custom_css?: string | null
          email_templates?: Json | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          custom_css?: string | null
          email_templates?: Json | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calendar_integrations: {
        Row: {
          access_token: string
          calendar_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          provider: string
          refresh_token: string | null
          sync_settings: Json | null
          user_id: string
        }
        Insert: {
          access_token: string
          calendar_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          provider: string
          refresh_token?: string | null
          sync_settings?: Json | null
          user_id: string
        }
        Update: {
          access_token?: string
          calendar_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          refresh_token?: string | null
          sync_settings?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      call_analytics: {
        Row: {
          anomaly_flags: Json | null
          call_id: string
          compliance_flags: Json | null
          created_at: string | null
          id: string
          quality_score: number | null
          sentiment_score: number | null
          sentiment_timeline: Json | null
          upsell_likelihood: number | null
        }
        Insert: {
          anomaly_flags?: Json | null
          call_id: string
          compliance_flags?: Json | null
          created_at?: string | null
          id?: string
          quality_score?: number | null
          sentiment_score?: number | null
          sentiment_timeline?: Json | null
          upsell_likelihood?: number | null
        }
        Update: {
          anomaly_flags?: Json | null
          call_id?: string
          compliance_flags?: Json | null
          created_at?: string | null
          id?: string
          quality_score?: number | null
          sentiment_score?: number | null
          sentiment_timeline?: Json | null
          upsell_likelihood?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "call_analytics_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      call_recordings: {
        Row: {
          call_id: string
          created_at: string | null
          duration_seconds: number | null
          file_size_bytes: number | null
          id: string
          recording_url: string | null
          transcript: string | null
        }
        Insert: {
          call_id: string
          created_at?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          recording_url?: string | null
          transcript?: string | null
        }
        Update: {
          call_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          recording_url?: string | null
          transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_recordings_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          agent_id: string | null
          callee: string
          cost: number | null
          created_at: string | null
          direction: string
          duration_seconds: number | null
          ended_at: string | null
          from_number: string | null
          id: string
          provider: string | null
          recording_url: string | null
          started_at: string | null
          status: string | null
          transcript: string | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          callee: string
          cost?: number | null
          created_at?: string | null
          direction: string
          duration_seconds?: number | null
          ended_at?: string | null
          from_number?: string | null
          id: string
          provider?: string | null
          recording_url?: string | null
          started_at?: string | null
          status?: string | null
          transcript?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          callee?: string
          cost?: number | null
          created_at?: string | null
          direction?: string
          duration_seconds?: number | null
          ended_at?: string | null
          from_number?: string | null
          id?: string
          provider?: string | null
          recording_url?: string | null
          started_at?: string | null
          status?: string | null
          transcript?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calls_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_scripts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          required_phrases: string[]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          required_phrases: string[]
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          required_phrases?: string[]
          user_id?: string
        }
        Relationships: []
      }
      conversation_flows: {
        Row: {
          created_at: string | null
          flow_data: Json
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          flow_data?: Json
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          flow_data?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      data_exports: {
        Row: {
          created_at: string | null
          expires_at: string | null
          export_type: string
          file_size_bytes: number | null
          file_url: string | null
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          export_type: string
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          export_type?: string
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          caller_name: string | null
          caller_phone: string
          created_at: string | null
          event_id: string
          id: string
          rsvp_method: string | null
        }
        Insert: {
          caller_name?: string | null
          caller_phone: string
          created_at?: string | null
          event_id: string
          id?: string
          rsvp_method?: string | null
        }
        Update: {
          caller_name?: string | null
          caller_phone?: string
          created_at?: string | null
          event_id?: string
          id?: string
          rsvp_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          auto_promote: boolean | null
          created_at: string | null
          description: string | null
          event_date: string
          id: string
          max_attendees: number | null
          title: string
          user_id: string
        }
        Insert: {
          auto_promote?: boolean | null
          created_at?: string | null
          description?: string | null
          event_date: string
          id?: string
          max_attendees?: number | null
          title: string
          user_id: string
        }
        Update: {
          auto_promote?: boolean | null
          created_at?: string | null
          description?: string | null
          event_date?: string
          id?: string
          max_attendees?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback_submissions: {
        Row: {
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          priority: string | null
          status: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      hr_requests: {
        Row: {
          call_recording_url: string | null
          created_at: string | null
          employee_name: string | null
          employee_phone: string
          id: string
          reason: string | null
          request_type: string
          status: string | null
          user_id: string
        }
        Insert: {
          call_recording_url?: string | null
          created_at?: string | null
          employee_name?: string | null
          employee_phone: string
          id?: string
          reason?: string | null
          request_type: string
          status?: string | null
          user_id: string
        }
        Update: {
          call_recording_url?: string | null
          created_at?: string | null
          employee_name?: string | null
          employee_phone?: string
          id?: string
          reason?: string | null
          request_type?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      knowledge_bases: {
        Row: {
          created_at: string | null
          data: Json | null
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      live_relay_sessions: {
        Row: {
          call_id: string | null
          ended_at: string | null
          id: string
          operator_id: string
          started_at: string | null
          status: string | null
          transcript: Json | null
          user_id: string
        }
        Insert: {
          call_id?: string | null
          ended_at?: string | null
          id?: string
          operator_id: string
          started_at?: string | null
          status?: string | null
          transcript?: Json | null
          user_id: string
        }
        Update: {
          call_id?: string | null
          ended_at?: string | null
          id?: string
          operator_id?: string
          started_at?: string | null
          status?: string | null
          transcript?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      phone_numbers: {
        Row: {
          assigned_agent_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          label: string
          phone_number: string
          provider: string
          sip_config: Json | null
          type: string
          user_id: string
        }
        Insert: {
          assigned_agent_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          phone_number: string
          provider: string
          sip_config?: Json | null
          type: string
          user_id: string
        }
        Update: {
          assigned_agent_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          phone_number?: string
          provider?: string
          sip_config?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "phone_numbers_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      retell_numbers: {
        Row: {
          created_at: string | null
          id: string
          label: string
          phone_number: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          label: string
          phone_number: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          phone_number?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_clones: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          name: string
          provider: string | null
          sample_url: string | null
          status: string | null
          user_id: string
          voice_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          provider?: string | null
          sample_url?: string | null
          status?: string | null
          user_id: string
          voice_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          provider?: string | null
          sample_url?: string | null
          status?: string | null
          user_id?: string
          voice_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

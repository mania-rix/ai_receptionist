export type Database = {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          voice: string;
          greeting: string;
          temperature: number;
          interruption_sensitivity: number;
          retell_agent_id: string;
          retell_llm_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          voice: string;
          greeting: string;
          temperature: number;
          interruption_sensitivity: number;
          retell_agent_id: string;
          retell_llm_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          voice?: string;
          greeting?: string;
          temperature?: number;
          interruption_sensitivity?: number;
          retell_agent_id?: string;
          retell_llm_id?: string | null;
          created_at?: string;
        };
      };
      calls: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string;
          callee: string;
          direction: 'outbound' | 'inbound';
          status: string;
          started_at: string;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id: string;
          callee: string;
          direction: 'outbound' | 'inbound';
          status: string;
          started_at?: string;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          agent_id?: string;
          callee?: string;
          direction?: 'outbound' | 'inbound';
          status?: string;
          started_at?: string;
          ended_at?: string | null;
          created_at?: string;
        };
      };
      retell_numbers: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          phone_number: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label: string;
          phone_number: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string;
          phone_number?: string;
          created_at?: string;
        };
      };
    };
  };
};
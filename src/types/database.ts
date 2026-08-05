export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      couples: {
        Row: {
          anniversary: string | null;
          created_at: string;
          created_by: string;
          id: string;
          relationship_name: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          anniversary?: string | null;
          created_at?: string;
          created_by: string;
          id?: string;
          relationship_name: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          anniversary?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          relationship_name?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "couples_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      invitations: {
        Row: {
          accepted_at: string | null;
          couple_id: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invite_code: string;
          receiver_id: string | null;
          sender_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          couple_id?: string | null;
          created_at?: string;
          email: string;
          expires_at: string;
          id?: string;
          invite_code: string;
          receiver_id?: string | null;
          sender_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          couple_id?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invite_code?: string;
          receiver_id?: string | null;
          sender_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitations_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invitations_receiver_id_fkey";
            columns: ["receiver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invitations_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      memories: {
        Row: {
          id: string;
          couple_id: string;
          created_by: string;
          uploaded_by?: string;
          title: string;
          caption: string | null;
          description: string | null;
          image_url: string;
          cover_image: string | null;
          media_urls: string[];
          memory_date: string;
          location: string | null;
          latitude: number | null;
          longitude: number | null;
          album_id: string | null;
          is_favorite: boolean;
          is_private: boolean;
          visibility: string;
          weather: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          created_by: string;
          uploaded_by?: string;
          title: string;
          caption?: string | null;
          description?: string | null;
          image_url?: string;
          cover_image?: string | null;
          media_urls?: string[];
          memory_date?: string;
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          album_id?: string | null;
          is_favorite?: boolean;
          is_private?: boolean;
          visibility?: string;
          weather?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          created_by?: string;
          uploaded_by?: string;
          title?: string;
          caption?: string | null;
          description?: string | null;
          image_url?: string;
          cover_image?: string | null;
          media_urls?: string[];
          memory_date?: string;
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          album_id?: string | null;
          is_favorite?: boolean;
          is_private?: boolean;
          visibility?: string;
          weather?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memories_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "memories_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "memories_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "memory_albums";
            referencedColumns: ["id"];
          },
        ];
      };
      memory_albums: {
        Row: {
          id: string;
          couple_id: string;
          title: string;
          description: string | null;
          cover_image: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          title: string;
          description?: string | null;
          cover_image?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          title?: string;
          description?: string | null;
          cover_image?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memory_albums_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
        ];
      };
      memory_comments: {
        Row: {
          id: string;
          memory_id: string;
          parent_comment_id: string | null;
          user_id: string;
          content: string;
          edited: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          memory_id: string;
          parent_comment_id?: string | null;
          user_id: string;
          content: string;
          edited?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          memory_id?: string;
          parent_comment_id?: string | null;
          user_id?: string;
          content?: string;
          edited?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memory_comments_memory_id_fkey";
            columns: ["memory_id"];
            isOneToOne: false;
            referencedRelation: "memories";
            referencedColumns: ["id"];
          },
        ];
      };
      memory_reactions: {
        Row: {
          id: string;
          memory_id: string;
          user_id: string;
          emoji: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          memory_id: string;
          user_id: string;
          emoji: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          memory_id?: string;
          user_id?: string;
          emoji?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memory_reactions_memory_id_fkey";
            columns: ["memory_id"];
            isOneToOne: false;
            referencedRelation: "memories";
            referencedColumns: ["id"];
          },
        ];
      };
      relationship_milestones: {
        Row: {
          id: string;
          couple_id: string;
          title: string;
          description: string | null;
          date: string;
          type: string;
          cover_image: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          title: string;
          description?: string | null;
          date: string;
          type?: string;
          cover_image?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          title?: string;
          description?: string | null;
          date?: string;
          type?: string;
          cover_image?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "relationship_milestones_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          read: boolean;
          recipient_id: string;
          sender_id: string | null;
          title: string;
          type: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          read?: boolean;
          recipient_id: string;
          sender_id?: string | null;
          title: string;
          type: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          read?: boolean;
          recipient_id?: string;
          sender_id?: string | null;
          title?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: {
          category: string;
          color: string;
          completed: boolean;
          couple_id: string;
          created_at: string;
          created_by: string;
          description: string | null;
          end_at: string;
          id: string;
          location: string | null;
          priority: string;
          reminder_minutes: number | null;
          repeat: string;
          source_proposal_id: string | null;
          start_at: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          category?: string;
          color?: string;
          completed?: boolean;
          couple_id: string;
          created_at?: string;
          created_by: string;
          description?: string | null;
          end_at: string;
          id?: string;
          location?: string | null;
          priority?: string;
          reminder_minutes?: number | null;
          repeat?: string;
          source_proposal_id?: string | null;
          start_at: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          color?: string;
          completed?: boolean;
          couple_id?: string;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          end_at?: string;
          id?: string;
          location?: string | null;
          priority?: string;
          reminder_minutes?: number | null;
          repeat?: string;
          source_proposal_id?: string | null;
          start_at?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plans_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plans_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          email: string;
          id: string;
          partner_id: string | null;
          relationship_status: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          email: string;
          id: string;
          partner_id?: string | null;
          relationship_status?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          email?: string;
          id?: string;
          partner_id?: string | null;
          relationship_status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      proposals: {
        Row: {
          accepted_at: string | null;
          auto_add_to_calendar: boolean;
          category: string;
          couple_id: string;
          cover_image: string | null;
          created_at: string;
          created_by: string;
          declined_at: string | null;
          description: string | null;
          dress_code: string | null;
          end_datetime: string | null;
          estimated_cost: number | null;
          id: string;
          is_surprise: boolean;
          latitude: number | null;
          location: string | null;
          longitude: number | null;
          parent_proposal_id: string | null;
          planned_date: string;
          priority: string;
          reminder_minutes: number | null;
          responded_at: string | null;
          response_message: string | null;
          start_datetime: string;
          status: string;
          title: string;
          updated_at: string;
          visibility: string;
          weather_required: string | null;
        };
        Insert: {
          accepted_at?: string | null;
          auto_add_to_calendar?: boolean;
          category?: string;
          couple_id: string;
          cover_image?: string | null;
          created_at?: string;
          created_by: string;
          declined_at?: string | null;
          description?: string | null;
          dress_code?: string | null;
          end_datetime?: string | null;
          estimated_cost?: number | null;
          id?: string;
          is_surprise?: boolean;
          latitude?: number | null;
          location?: string | null;
          longitude?: number | null;
          parent_proposal_id?: string | null;
          planned_date: string;
          priority?: string;
          reminder_minutes?: number | null;
          responded_at?: string | null;
          response_message?: string | null;
          start_datetime?: string;
          status?: string;
          title: string;
          updated_at?: string;
          visibility?: string;
          weather_required?: string | null;
        };
        Update: {
          accepted_at?: string | null;
          auto_add_to_calendar?: boolean;
          category?: string;
          couple_id?: string;
          cover_image?: string | null;
          created_at?: string;
          created_by?: string;
          declined_at?: string | null;
          description?: string | null;
          dress_code?: string | null;
          end_datetime?: string | null;
          estimated_cost?: number | null;
          id?: string;
          is_surprise?: boolean;
          latitude?: number | null;
          location?: string | null;
          longitude?: number | null;
          parent_proposal_id?: string | null;
          planned_date?: string;
          priority?: string;
          reminder_minutes?: number | null;
          responded_at?: string | null;
          response_message?: string | null;
          start_datetime?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          visibility?: string;
          weather_required?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "proposals_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposals_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      proposal_comments: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          is_deleted: boolean;
          is_edited: boolean;
          parent_id: string | null;
          proposal_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          is_deleted?: boolean;
          is_edited?: boolean;
          parent_id?: string | null;
          proposal_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          is_deleted?: boolean;
          is_edited?: boolean;
          parent_id?: string | null;
          proposal_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "proposal_comments_proposal_id_fkey";
            columns: ["proposal_id"];
            isOneToOne: false;
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposal_comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      proposal_reactions: {
        Row: {
          created_at: string;
          emoji: string;
          id: string;
          proposal_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          emoji: string;
          id?: string;
          proposal_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          emoji?: string;
          id?: string;
          proposal_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "proposal_reactions_proposal_id_fkey";
            columns: ["proposal_id"];
            isOneToOne: false;
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposal_reactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      statuses: {
        Row: {
          couple_id: string | null;
          created_at: string;
          emoji: string;
          expires_at: string | null;
          id: string;
          status_text: string;
          updated_at: string;
          user_id: string;
          visibility: string;
        };
        Insert: {
          couple_id?: string | null;
          created_at?: string;
          emoji?: string;
          expires_at?: string | null;
          id?: string;
          status_text: string;
          updated_at?: string;
          user_id: string;
          visibility?: string;
        };
        Update: {
          couple_id?: string | null;
          created_at?: string;
          emoji?: string;
          expires_at?: string | null;
          id?: string;
          status_text?: string;
          updated_at?: string;
          user_id?: string;
          visibility?: string;
        };
        Relationships: [
          {
            foreignKeyName: "statuses_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "statuses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      activities: {
        Row: {
          id: string;
          couple_id: string;
          user_id: string;
          type: string;
          title: string;
          description: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          user_id: string;
          type: string;
          title: string;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_activity_views: {
        Row: {
          activity_id: string;
          user_id: string;
          viewed_at: string;
        };
        Insert: {
          activity_id: string;
          user_id: string;
          viewed_at?: string;
        };
        Update: {
          activity_id?: string;
          user_id?: string;
          viewed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_activity_views_activity_id_fkey";
            columns: ["activity_id"];
            isOneToOne: false;
            referencedRelation: "activities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_activity_views_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_member_of_couple: { Args: { c_id: string }; Returns: boolean };
      accept_couple_invite: {
        Args: { p_invite_code: string; p_user_id: string; p_anniversary?: string | null };
        Returns: { couple_id?: string; sender_id?: string; receiver_id?: string; status?: string };
      };
      leave_relationship: {
        Args: { p_user_id: string };
        Returns: { user_id?: string; former_partner_id?: string; couple_id?: string; status?: string };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

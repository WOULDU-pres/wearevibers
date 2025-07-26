export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          content: string
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          parent_id: string | null
          updated_at: string | null
          user_id: string
          vibe_count: number | null
        }
        Insert: {
          content: string
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id: string
          vibe_count?: number | null
        }
        Update: {
          content?: string
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string
          vibe_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          category: string
          comment_count: number | null
          content: string
          created_at: string | null
          id: string
          image_urls: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          vibe_count: number | null
        }
        Insert: {
          category: string
          comment_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          image_urls?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          vibe_count?: number | null
        }
        Update: {
          category?: string
          comment_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          image_urls?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          vibe_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          follower_count: number | null
          following_count: number | null
          full_name: string | null
          github_url: string | null
          id: string
          is_online: boolean | null
          linkedin_url: string | null
          project_count: number | null
          tech_stack: string[] | null
          twitter_url: string | null
          updated_at: string | null
          username: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          follower_count?: number | null
          following_count?: number | null
          full_name?: string | null
          github_url?: string | null
          id: string
          is_online?: boolean | null
          linkedin_url?: string | null
          project_count?: number | null
          tech_stack?: string[] | null
          twitter_url?: string | null
          updated_at?: string | null
          username: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          follower_count?: number | null
          following_count?: number | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          is_online?: boolean | null
          linkedin_url?: string | null
          project_count?: number | null
          tech_stack?: string[] | null
          twitter_url?: string | null
          updated_at?: string | null
          username?: string
          website_url?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          comment_count: number | null
          created_at: string | null
          demo_url: string | null
          description: string | null
          difficulty_level: number | null
          figma_url: string | null
          github_url: string | null
          id: string
          image_urls: string[] | null
          status: string | null
          tech_stack: string[]
          title: string
          updated_at: string | null
          user_id: string
          vibe_count: number | null
        }
        Insert: {
          comment_count?: number | null
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          difficulty_level?: number | null
          figma_url?: string | null
          github_url?: string | null
          id?: string
          image_urls?: string[] | null
          status?: string | null
          tech_stack: string[]
          title: string
          updated_at?: string | null
          user_id: string
          vibe_count?: number | null
        }
        Update: {
          comment_count?: number | null
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          difficulty_level?: number | null
          figma_url?: string | null
          github_url?: string | null
          id?: string
          image_urls?: string[] | null
          status?: string | null
          tech_stack?: string[]
          title?: string
          updated_at?: string | null
          user_id?: string
          vibe_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tips: {
        Row: {
          bookmark_count: number | null
          category: string
          comment_count: number | null
          content: string
          created_at: string | null
          difficulty_level: number | null
          id: string
          read_time: number | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
          vibe_count: number | null
        }
        Insert: {
          bookmark_count?: number | null
          category: string
          comment_count?: number | null
          content: string
          created_at?: string | null
          difficulty_level?: number | null
          id?: string
          read_time?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          vibe_count?: number | null
        }
        Update: {
          bookmark_count?: number | null
          category?: string
          comment_count?: number | null
          content?: string
          created_at?: string | null
          difficulty_level?: number | null
          id?: string
          read_time?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          vibe_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vibes: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vibes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const

// Convenience type exports
export type Profile = Tables<"profiles">;
export type Project = Tables<"projects">;
export type Post = Tables<"posts">;
export type Tip = Tables<"tips">;
export type Comment = Tables<"comments">;
export type Vibe = Tables<"vibes">;
export type Follow = Tables<"follows">;
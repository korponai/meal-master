export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      ingredients: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      meal_plans: {
        Row: {
          created_at: string | null;
          custom_name: string | null;
          date: string;
          id: string;
          meal_type: string | null;
          recipe_id: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          custom_name?: string | null;
          date: string;
          id?: string;
          meal_type?: string | null;
          recipe_id?: string | null;
          user_id?: string;
        };
        Update: {
          created_at?: string | null;
          custom_name?: string | null;
          date?: string;
          id?: string;
          meal_type?: string | null;
          recipe_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meal_plans_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          banner_url: string | null;
          bio: string | null;
          food_sensitivities: string[] | null;
          full_name: string | null;
          id: string;
          updated_at: string | null;
          preferred_language: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          food_sensitivities?: string[] | null;
          full_name?: string | null;
          id: string;
          updated_at?: string | null;
          preferred_language?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          food_sensitivities?: string[] | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string | null;
          preferred_language?: string | null;
        };
        Relationships: [];
      };
      recipe_ingredients: {
        Row: {
          created_at: string | null;
          id: string;
          ingredient_id: string;
          quantity: number;
          recipe_id: string;
          unit: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          ingredient_id: string;
          quantity: number;
          recipe_id: string;
          unit: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          ingredient_id?: string;
          quantity?: number;
          recipe_id?: string;
          unit?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_categories: {
        Row: {
          id: string;
          recipe_id: string;
          category: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          category: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          category?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_categories_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
        ];
      };
      recipes: {
        Row: {
          allergens: string[] | null;
          created_at: string | null;
          description: string | null;
          experience: string | null;
          id: string;
          image_url: string | null;
          instructions: string | null;
          nutrients: Json | null;
          title: string;
          updated_at: string | null;
          user_id: string;
          visibility: string;
        };
        Insert: {
          allergens?: string[] | null;
          created_at?: string | null;
          description?: string | null;
          experience?: string | null;
          id?: string;
          image_url?: string | null;
          instructions?: string | null;
          nutrients?: Json | null;
          title: string;
          updated_at?: string | null;
          user_id?: string;
          visibility?: string;
        };
        Update: {
          allergens?: string[] | null;
          created_at?: string | null;
          description?: string | null;
          experience?: string | null;
          id?: string;
          image_url?: string | null;
          instructions?: string | null;
          nutrients?: Json | null;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
          visibility?: string;
        };
        Relationships: [];
      };
      shopping_list_items: {
        Row: {
          created_at: string | null;
          id: string;
          ingredient_id: string | null;
          is_checked: boolean | null;
          name: string;
          quantity: number | null;
          unit: string | null;
          user_id: string;
          category: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          ingredient_id?: string | null;
          is_checked?: boolean | null;
          name: string;
          quantity?: number | null;
          unit?: string | null;
          user_id: string;
          category?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          ingredient_id?: string | null;
          is_checked?: boolean | null;
          name?: string;
          quantity?: number | null;
          unit?: string | null;
          user_id?: string;
          category?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [key: string]: never;
    };
    Functions: {
      [key: string]: never;
    };
    Enums: {
      [key: string]: never;
    };
    CompositeTypes: {
      [key: string]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

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
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

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
    : never;

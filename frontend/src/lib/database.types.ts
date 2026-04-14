// ─── Tipo base para campos JSONB ─────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Tipo de referência (salvo em visao_ancora.referencias como Json) ─────────

export type ReferenciaJson = {
  nome:   string;
  area:   string;
  admiro: string;
};

// ─── Tipos de linha (resultado de SELECT *) ───────────────────────────────────

export type VisaoAncora = {
  id:             string;
  user_id:        string;
  manchete:       string;
  declaracao:     string;
  pedido1:        string;
  pedido2:        string;
  pedido3:        string;
  area_referencia: string;
  obstaculo:      string;
  financas:       string;
  como_vive:      string;
  tira_sono:      string;
  da_energia:     string;
  faria_graca:    string;
  mundo_perderia: string;
  referencias:    Json;
  created_at:     string;
  updated_at:     string;
};

export type FerramentasRespostas = {
  id:                string;
  user_id:           string;
  ferramenta_codigo: string;
  ferramenta_slug:   string;
  respostas:         Json;
  progresso:         number;
  concluida:         boolean;
  created_at:        string;
  updated_at:        string;
};

export type RodaVida = {
  id:              string;
  user_id:         string;
  saude:           number;
  carreira:        number;
  financas:        number;
  relacionamentos: number;
  lazer:           number;
  espiritualidade: number;
  familia:         number;
  crescimento:     number;
  created_at:      string;
};

export type MomentoKairos = {
  id:            string;
  data:          string;
  fase:          number;
  voz_texto:     string;
  versiculo:     string;
  versiculo_ref: string;
  missao:        string;
  missao_fase1:  string | null;
  missao_fase2:  string | null;
  missao_fase3:  string | null;
  missao_fase4:  string | null;
  trilha:        string | null;
  tom:           string | null;
  created_at:    string;
};

export type DiarioKairos = {
  id:               string;
  user_id:          string;
  data:             string;
  qualidade_sono:   number | null;
  emocao:           string | null;
  preocupacao:      string | null;
  gratidao:         string | null;
  missao_cumprida:  boolean;
  missao_execucao:  string | null;
  created_at:       string;
  updated_at:       string;
  conquista:        string | null;
  aprendizado:      string | null;
  energia_fim:      number | null;
  nota_dia:         number | null;
};

// ─── Schema completo para createClient<Database> ─────────────────────────────
// Segue o formato exato gerado por `supabase gen types typescript`:
// Insert — campos com defaults ou nullable são opcionais
// Update — todos opcionais

export type Database = {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id:                     string;
          user_id:                string;
          status:                 string;
          trial_ends_at:          string;
          plan:                   string | null;
          stripe_customer_id:     string | null;
          stripe_subscription_id: string | null;
          created_at:             string;
          updated_at:             string;
        };
        Insert: {
          id?:                     string;
          user_id:                 string;
          status?:                 string;
          trial_ends_at:           string;
          plan?:                   string | null;
          stripe_customer_id?:     string | null;
          stripe_subscription_id?: string | null;
          created_at?:             string;
          updated_at?:             string;
        };
        Update: {
          id?:                     string;
          user_id?:                string;
          status?:                 string;
          trial_ends_at?:          string;
          plan?:                   string | null;
          stripe_customer_id?:     string | null;
          stripe_subscription_id?: string | null;
          created_at?:             string;
          updated_at?:             string;
        };
        Relationships: [];
      };
      visao_ancora: {
        Row: VisaoAncora;
        Insert: {
          id?:              string;
          user_id:          string;
          manchete?:        string;
          declaracao?:      string;
          pedido1?:         string;
          pedido2?:         string;
          pedido3?:         string;
          area_referencia?: string;
          obstaculo?:       string;
          financas?:        string;
          como_vive?:       string;
          tira_sono?:       string;
          da_energia?:      string;
          faria_graca?:     string;
          mundo_perderia?:  string;
          referencias?:     Json;
          created_at?:      string;
          updated_at?:      string;
        };
        Update: {
          id?:              string;
          user_id?:         string;
          manchete?:        string;
          declaracao?:      string;
          pedido1?:         string;
          pedido2?:         string;
          pedido3?:         string;
          area_referencia?: string;
          obstaculo?:       string;
          financas?:        string;
          como_vive?:       string;
          tira_sono?:       string;
          da_energia?:      string;
          faria_graca?:     string;
          mundo_perderia?:  string;
          referencias?:     Json;
          updated_at?:      string;
        };
        Relationships: [];
      };
      ferramentas_respostas: {
        Row: FerramentasRespostas;
        Insert: {
          id?:                string;
          user_id:            string;
          ferramenta_codigo:  string;
          ferramenta_slug:    string;
          respostas?:         Json;
          progresso?:         number;
          concluida?:         boolean;
          created_at?:        string;
          updated_at?:        string;
        };
        Update: {
          id?:                string;
          user_id?:           string;
          ferramenta_codigo?: string;
          ferramenta_slug?:   string;
          respostas?:         Json;
          progresso?:         number;
          concluida?:         boolean;
          updated_at?:        string;
        };
        Relationships: [];
      };
      roda_vida: {
        Row: RodaVida;
        Insert: {
          id?:              string;
          user_id:          string;
          saude?:           number;
          carreira?:        number;
          financas?:        number;
          relacionamentos?: number;
          lazer?:           number;
          espiritualidade?: number;
          familia?:         number;
          crescimento?:     number;
          created_at?:      string;
        };
        Update: {
          id?:              string;
          user_id?:         string;
          saude?:           number;
          carreira?:        number;
          financas?:        number;
          relacionamentos?: number;
          lazer?:           number;
          espiritualidade?: number;
          familia?:         number;
          crescimento?:     number;
        };
        Relationships: [];
      };
      diario_kairos: {
        Row: DiarioKairos;
        Insert: {
          id?:               string;
          user_id:           string;
          data:              string;
          qualidade_sono?:   number | null;
          emocao?:           string | null;
          preocupacao?:      string | null;
          gratidao?:         string | null;
          missao_cumprida?:  boolean;
          missao_execucao?:  string | null;
          conquista?:        string | null;
          aprendizado?:      string | null;
          energia_fim?:      number | null;
          nota_dia?:         number | null;
          created_at?:       string;
          updated_at?:       string;
        };
        Update: {
          id?:               string;
          user_id?:          string;
          data?:             string;
          qualidade_sono?:   number | null;
          emocao?:           string | null;
          preocupacao?:      string | null;
          gratidao?:         string | null;
          missao_cumprida?:  boolean;
          missao_execucao?:  string | null;
          conquista?:        string | null;
          aprendizado?:      string | null;
          energia_fim?:      number | null;
          nota_dia?:         number | null;
          updated_at?:       string;
        };
        Relationships: [];
      };
    };
    Views:          Record<string, never>;
    Functions:      Record<string, never>;
    Enums:          Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

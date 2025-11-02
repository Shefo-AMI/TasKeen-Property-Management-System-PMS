/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_EDGE_FUNCTION_URL?: string
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_ENV?: string
  readonly VITE_STRIPE_PUBLIC_KEY?: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string
  readonly VITE_STRIPE_PRO_PRICE_ID?: string
  readonly VITE_STRIPE_WEBHOOK_SECRET?: string
  readonly VITE_PAYPAL_CLIENT_ID?: string
  readonly VITE_PAYPAL_PRO_PLAN_ID?: string
  readonly VITE_PAYPAL_MODE?: string
  readonly VITE_RESEND_API_KEY?: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_BUILDER_IO_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

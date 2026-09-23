// Public settings for the live chat (used by the portfolio and /admin/).
// The anon / publishable key is meant to be shipped to browsers: Row Level
// Security in supabase/migrations decides what each visitor can read or write.
// Never put the service_role / secret key here.
window.CHAT_CONFIG = {
  supabaseUrl: "https://mpimdncyoajtzcjfmplc.supabase.co",
  supabaseAnonKey: "sb_publishable_GspeNdqUgVOndQLWo_HRLg_8qDpB4Ur"
};

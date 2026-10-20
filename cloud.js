(function(){
  // Support the current ABC config name and the legacy BELTYX name.
  const cfg=window.ABC_CONFIG||window.BELTYX_CONFIG||{};
  const url=cfg.SUPABASE_URL, key=cfg.SUPABASE_ANON_KEY;
  if(url&&key&&window.supabase){
    window.BELTYX_DB=window.supabase.createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    window.ABC_DB=window.BELTYX_DB;
  }
})();

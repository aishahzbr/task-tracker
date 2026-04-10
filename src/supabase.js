import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://gpiivxwfpcfxtsqkzqqr.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaWl2eHdmcGNmeHRzcWt6cXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MjAyNjYsImV4cCI6MjA5MTM5NjI2Nn0.dAXCWgOyFQvZuJ4Wrf9iwbLOYMl5xDyPlOfr_DMFq0U'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

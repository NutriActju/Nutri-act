import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://nnyzfyqiafadixfzezsp.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ueXpmeXFpYWZhZGl4ZnplenNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NTUxMjMsImV4cCI6MjA5MTQzMTEyM30.JEON6DZnQ3zkaBvAAc0-8GuAb0S2b4ZzDH7_Gw4sv7Q"

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
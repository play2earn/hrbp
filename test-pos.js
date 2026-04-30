import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env', 'utf8')
const getEnv = (key) => {
  const match = envFile.match(new RegExp(`${key}=(.*)`))
  return match ? match[1].trim().replace(/"/g, '') : null
}

const supabaseUrl = getEnv('VITE_SUPABASE_URL')
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY')

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data } = await supabase.from('positions').select('*')
  console.log(JSON.stringify(data.filter(p => p.name_th.includes('โปรแกรม') || p.name_en?.includes('Program')), null, 2))
}
test()

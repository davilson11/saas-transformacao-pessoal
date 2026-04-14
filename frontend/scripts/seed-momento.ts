import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
  const arquivo = process.argv[2]
  if (!arquivo) {
    console.error('Uso: npx ts-node scripts/seed-momento.ts scripts/maio-2026.json')
    process.exit(1)
  }
  const dados = JSON.parse(fs.readFileSync(path.resolve(arquivo), 'utf-8'))
  console.log(`Inserindo ${dados.length} registros...`)
  const { error } = await supabase
    .from('momento_kairos')
    .upsert(dados, { onConflict: 'data' })
  if (error) { console.error('Erro:', error); process.exit(1) }
  console.log(`✅ ${dados.length} registros inseridos!`)
}

seed()

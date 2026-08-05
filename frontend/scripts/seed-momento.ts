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

  // O conflito é por `dia_jornada`, não por `data`.
  //
  // Depois que os textos sazonais viraram linhas especiais, passaram a existir
  // duas linhas com a mesma `data`: a de jornada e a especial. Com
  // onConflict: 'data' o seed sobrescreveria a linha errada — apagando o
  // conteúdo especial de Natal ao atualizar o conteúdo de dezembro.
  const semDiaJornada = dados.filter((d: { dia_jornada?: number }) => d.dia_jornada == null)
  if (semDiaJornada.length > 0) {
    console.error(
      `❌ ${semDiaJornada.length} registro(s) sem dia_jornada. ` +
      `O seed só atualiza conteúdo de jornada; linhas especiais (data_fixa) ` +
      `são editadas direto no Supabase.`
    )
    process.exit(1)
  }

  console.log(`Inserindo ${dados.length} registros...`)
  const { error } = await supabase
    .from('momento_kairos')
    .upsert(dados, { onConflict: 'dia_jornada' })
  if (error) { console.error('Erro:', error); process.exit(1) }
  console.log(`✅ ${dados.length} registros inseridos!`)
}

seed()

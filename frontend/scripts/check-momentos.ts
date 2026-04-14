import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const { data, error } = await supabase
  .from('momento_kairos')
  .select('mes, data, dia_do_mes')
  .order('data')

if (error) { console.error(error); process.exit(1) }

const nomes = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const porMes: Record<string, number> = {}
data.forEach((r: any) => {
  const label = r.mes ? nomes[r.mes] : `SEM MES (data: ${r.data?.slice(0,7)})`
  porMes[label] = (porMes[label] || 0) + 1
})

Object.entries(porMes).forEach(([mes, total]) => {
  const esperado = total
  console.log(`${mes}: ${total} dias`)
})
console.log(`\nTotal: ${data.length} registros`)

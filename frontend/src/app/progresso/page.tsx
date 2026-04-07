'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/useSupabaseClient'
import { buscarTodasRespostas } from '@/lib/queries'
import type { FerramentasRespostas } from '@/lib/database.types'
import { CheckCircle2, Circle, Flame, Trophy } from 'lucide-react'

const FERRAMENTAS = [
  { nome: 'Arquiteto de Rotinas', slug: 'arquiteto-rotinas' },
  { nome: 'Auditoria de Tempo', slug: 'auditoria-tempo' },
  { nome: 'Bússola de Valores', slug: 'bussola-valores' },
  { nome: 'CRM de Relacionamentos', slug: 'crm-relacionamentos' },
  { nome: 'Desconstrutor de Crenças', slug: 'desconstrutor-crencas' },
  { nome: 'Design de Vida', slug: 'design-vida' },
  { nome: 'Diário de Bordo', slug: 'diario-bordo' },
  { nome: 'DRE Pessoal', slug: 'dre-pessoal' },
  { nome: 'Energia e Vitalidade', slug: 'energia-vitalidade' },
  { nome: 'Feedback 360', slug: 'feedback-360' },
  { nome: 'OKRs Pessoais', slug: 'okrs-pessoais' },
  { nome: 'Prevenção de Recaída', slug: 'prevencao-recaida' },
  { nome: 'Raio-X', slug: 'raio-x' },
  { nome: 'Rotina Ideal', slug: 'rotina-ideal' },
  { nome: 'Sprint de Aprendizado', slug: 'sprint-aprendizado' },
  { nome: 'SWOT Pessoal', slug: 'swot-pessoal' },
]

export default function ProgressoPage() {
  const { userId } = useAuth()
  const { getClient } = useSupabaseClient()
  const [concluidas, setConcluidas] = useState(0)
  const [streak, setStreak] = useState(0)
  const [ferramentasConcluidas, setFerramentasConcluidas] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    ;(async () => {
      const client = await getClient()
      const respostas = await buscarTodasRespostas(userId, client)
      const feitas = respostas.filter((r: FerramentasRespostas) => r.concluida)
      setConcluidas(feitas.length)
      setFerramentasConcluidas(feitas.map((r: FerramentasRespostas) => r.ferramenta_slug))

      const { data: hist } = await client
        .from('diario_kairos')
        .select('data')
        .eq('user_id', userId)
        .order('data', { ascending: false })
        .limit(30)

      if (hist) {
        const datas = hist
          .map((h: { data: string }) => h.data)
          .sort((a: string, b: string) => b.localeCompare(a))
        let s = 0
        const hoje = new Date()
        for (let i = 0; i < datas.length; i++) {
          const esp = new Date(hoje)
          esp.setDate(hoje.getDate() - i)
          if (datas[i] === esp.toISOString().split('T')[0]) s++
          else break
        }
        setStreak(s)
      }

      setLoading(false)
    })()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="p-8 text-center text-white/50">Carregando...</div>

  const total = FERRAMENTAS.length
  const pct = Math.round((concluidas / total) * 100)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Meu Progresso</h1>
        <p className="text-white/50 text-sm mt-1">Acompanhe sua jornada de transformação</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <Trophy className="mx-auto mb-2 text-yellow-400" size={24} />
          <p className="text-2xl font-bold text-white">{pct}%</p>
          <p className="text-white/50 text-xs">Concluído</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <CheckCircle2 className="mx-auto mb-2 text-green-400" size={24} />
          <p className="text-2xl font-bold text-white">{concluidas}/{total}</p>
          <p className="text-white/50 text-xs">Ferramentas</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <Flame className="mx-auto mb-2 text-orange-400" size={24} />
          <p className="text-2xl font-bold text-white">{streak}</p>
          <p className="text-white/50 text-xs">Dias seguidos</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm text-white/50 mb-2">
          <span>Progresso geral</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-white font-semibold mb-3">Ferramentas</h2>
        {FERRAMENTAS.map((ferramenta) => {
          const feita = ferramentasConcluidas.includes(ferramenta.slug)
          return (
            <div
              key={ferramenta.slug}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                feita ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'
              }`}
            >
              {feita
                ? <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                : <Circle size={18} className="text-white/30 shrink-0" />
              }
              <span className={feita ? 'text-white' : 'text-white/50'}>{ferramenta.nome}</span>
              {feita && <span className="ml-auto text-xs text-green-400">Concluída</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/useSupabaseClient'
import type { DiarioKairos } from '@/lib/database.types'

export default function ScoreDiario() {
  const { user, isLoaded } = useUser()
  const [score, setScore] = useState(0)
  const [diario, setDiario] = useState<DiarioKairos | null>(null)
  const [loading, setLoading] = useState(true)
  
  const getClient = useSupabaseClient()

  useEffect(() => {
    async function carregar() {
      if (!isLoaded || !user) {
        setLoading(false)
        return
      }
      
      const client = await getClient()
      const { data } = await client
        .from('diario_kairos')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false })
        .limit(1)
      
      if (data?.[0]) {
        setDiario(data[0])
        const novoScore = Math.round(
          ((data[0].humor || 3) + (data[0].nota_dia || 3) * 2 + (data[0].energia_fim || 3)) / 5 * 20
        )
        setScore(Math.min(100, novoScore))
      }
      
      setLoading(false)
    }
    
    carregar()
  }, [isLoaded, user, getClient])

  if (loading || !diario || !user) return null

  return (
    <div className="mb-8 p-8 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 rounded-3xl border border-amber-200/50 shadow-xl">
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 120 120" className="w-28 h-28">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#C8A030" strokeWidth="10" strokeDasharray={`${score/100 * 330}, 330`} strokeLinecap="round" className="transition-all duration-1000 origin-center" />
          <text x="60" y="70" textAnchor="middle" fill="#C8A030" fontFamily="DM Mono" fontSize="32" fontWeight="700">{score}</text>
        </svg>
        
        <div className="flex-1">
          <h2 className="text-2xl font-serif text-gray-900 font-medium mb-3">Score Hoje</h2>
          <div className="space-y-2 mb-4">
            <Bar label="Humor" value={diario.humor || 3} color="#10B981" max={5} />
            <Bar label="Nota" value={diario.nota_dia || 3} color="#C8A030" max={5} />
            <Bar label="Energia" value={diario.energia_fim || 3} color="#F59E0B" max={5} />
          </div>
          <p className="text-sm text-gray-600 font-semibold bg-amber-50 px-3 py-2 rounded-xl">
            {score < 70 ? '📝 Amanhã: mais reflexão!' : '🚀 Excelente dia! Mantenha!'}
          </p>
        </div>
      </div>
    </div>
  )
}

interface BarProps {
  label: string
  value: number
  color: string
  max: number
}

function Bar({ label, value, color, max }: BarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-xs font-mono text-gray-500 font-medium">{label}</span>
      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(value/max)*100}%`, backgroundColor: color }} />
      </div>
      <span className="w-10 text-xs font-mono font-semibold text-gray-700">{value}/{max}</span>
    </div>
  )
}

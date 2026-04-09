'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/useSupabaseClient'
import { DiarioKairos } from '@/lib/database.types'

export default function ScoreDiario() {
  const [score, setScore] = useState(0)
  const [diario, setDiario] = useState<DiarioKairos | null>(null)
  const [loading, setLoading] = useState(true)
  
  const user = useUser()
  const getClient = useSupabaseClient()

  useEffect(() => {
    async function carregar() {
      if (!user?.id) {
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
        // Score: humor(25%) + nota(50%) + energia(25%)
        const novoScore = Math.round(
          (data[0].humor || 0) * 0.25 +
          (data[0].nota_dia || 0) * 0.5 +
          (data[0].energia_fim || 0) * 0.25
        )
        setScore(novoScore)
      }
      
      setLoading(false)
    }
    
    carregar()
  }, [user?.id])

  if (loading || !diario) return null

  return (
    <div className="mb-8 p-8 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 rounded-3xl border border-amber-200/50 shadow-xl">
      <div className="flex items-center gap-6">
        {/* Círculo gigante */}
        <svg viewBox="0 0 120 120" className="w-24 h-24">
          <circle 
            cx="60" cy="60" r="52" 
            fill="none" 
            stroke="#C8A030" 
            strokeWidth="8"
            strokeDasharray={`${(score/100)*330}, 330`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
          <text x="60" y="68" textAnchor="middle" fill="#C8A030" fontFamily="DM Mono" fontSize="28" fontWeight="700">
            {score}
          </text>
        </svg>
        
        <div className="flex-1">
          <h2 className="text-2xl font-serif text-gray-900 font-medium mb-2">
            Score Hoje
          </h2>
          <div className="space-y-2 mb-4">
            <Bar label="Humor" value={diario.humor || 0} color="#10B981" />
            <Bar label="Nota" value={diario.nota_dia || 0} color="#C8A030" />
            <Bar label="Energia" value={diario.energia_fim || 0} color="#F59E0B" />
          </div>
          <p className="text-sm text-gray-600 font-medium">
            {score < 60 ? 'Amanhã foque na reflexão' : 'Ótimo! Mantenha o ritmo 🔥'}
          </p>
        </div>
      </div>
    </div>
  )
}

function Bar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-xs font-mono text-gray-500 font-medium">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${value}%`, 
            backgroundColor: color 
          }}
        />
      </div>
      <span className="w-8 text-xs font-mono text-gray-500">{value}</span>
    </div>
  )
}

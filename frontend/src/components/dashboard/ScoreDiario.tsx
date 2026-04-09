'use client'

export default function ScoreDiario() {
  const score = 78

  return (
    <div className="p-8 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl border border-amber-200 shadow-xl mb-8">
      <h2 className="text-3xl font-bold mb-6">
        Score Hoje: <span className="text-4xl">{score}</span>/100
      </h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl">
          <span className="text-xs">Sono</span>
          <div className="h-3 bg-gray-200 rounded">
            <div className="h-full bg-green-500" style={{ width: '80%' }} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl">
          <span className="text-xs">Missão</span>
          <div className="h-3 bg-gray-200 rounded">
            <div className="h-full bg-amber-500" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl">
          <span className="text-xs">Dia</span>
          <div className="h-3 bg-gray-200 rounded">
            <div className="h-full bg-emerald-500" style={{ width: '78%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

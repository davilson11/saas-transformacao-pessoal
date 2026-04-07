'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/useSupabaseClient'

type Step = 1 | 2 | 3 | 4

interface FormData {
  nome: string
  area_foco: string
  fase: number
  meta_12_meses: string
}

const AREAS = [
  { value: 'carreira', label: 'Carreira & Propósito', emoji: '🚀' },
  { value: 'financeiro', label: 'Financeiro & Negócios', emoji: '💰' },
  { value: 'saude', label: 'Saúde & Energia', emoji: '💪' },
  { value: 'relacionamentos', label: 'Relacionamentos', emoji: '❤️' },
  { value: 'espiritualidade', label: 'Espiritualidade & Fé', emoji: '🙏' },
  { value: 'mentalidade', label: 'Mentalidade & Emocional', emoji: '🧠' },
]

const FASES = [
  { value: 1, label: 'Fase 1 — Despertar', desc: 'Estou começando a jornada. Quero entender quem sou e o que quero.', emoji: '🌱' },
  { value: 2, label: 'Fase 2 — Construção', desc: 'Já tenho clareza. Estou construindo hábitos e um plano de ação.', emoji: '🔨' },
  { value: 3, label: 'Fase 3 — Consolidação', desc: 'Tenho sistemas funcionando. Quero escalar e eliminar bloqueios.', emoji: '⚡' },
  { value: 4, label: 'Fase 4 — Liderança', desc: 'Estou sólido. Quero impactar outros e viver no meu melhor nível.', emoji: '🏆' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()
  const { getClient } = useSupabaseClient()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormData>({ nome: '', area_foco: '', fase: 0, meta_12_meses: '' })

  const handleNext = () => { if (step < 4) setStep((prev) => (prev + 1) as Step) }
  const handleBack = () => { if (step > 1) setStep((prev) => (prev - 1) as Step) }

  const handleFinish = async () => {
    if (!user) return
    setLoading(true)
    try {
      const client = await getClient()
      const { error } = await client
        .from('perfil' as any)
        .upsert({
          user_id: user.id,
          nome: form.nome,
          area_foco: form.area_foco,
          fase: form.fase,
          meta_12_meses: form.meta_12_meses,
          onboarding_completo: true,
        })
      if (error) throw error
      router.push('/momento')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const canAdvance = () => {
    if (step === 1) return form.nome.trim().length >= 2
    if (step === 2) return form.area_foco !== ''
    if (step === 3) return form.fase !== 0
    if (step === 4) return form.meta_12_meses.trim().length >= 10
    return false
  }

  const progress = (step / 4) * 100

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--color-border)',
    background: 'var(--color-surface)',
    fontSize: 'var(--text-base)',
    color: 'var(--color-ink)',
    outline: 'none',
    fontFamily: 'var(--font-body)',
    transition: 'border-color 220ms',
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-surface)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'var(--font-body)',
    }}>

      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
          Kairos
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-muted)', marginTop: 4 }}>
          Configure sua jornada
        </p>
      </div>

      {/* Card principal */}
      <div style={{
        width: '100%',
        maxWidth: 520,
        background: 'var(--color-surface-raised)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-modal)',
      }}>

        {/* Barra de progresso */}
        <div style={{ height: 3, background: 'var(--color-border)' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--color-primary)', transition: 'width 0.4s var(--ease-out)' }} />
        </div>

        {/* Steps indicadores */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '20px 24px 0' }}>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 28, height: 28,
                borderRadius: '50%',
                background: s < step ? 'var(--color-primary)' : s === step ? 'var(--color-primary-muted)' : 'var(--color-surface-overlay)',
                border: `2px solid ${s <= step ? 'var(--color-primary)' : 'var(--color-border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                color: s < step ? '#fff' : s === step ? 'var(--color-primary)' : 'var(--color-ink-muted)',
                transition: 'all 0.3s var(--ease-out)',
              }}>
                {s < step ? '✓' : s}
              </div>
              {s < 4 && <div style={{ width: 24, height: 2, background: s < step ? 'var(--color-primary)' : 'var(--color-border)', borderRadius: 2, transition: 'background 0.3s' }} />}
            </div>
          ))}
        </div>

        {/* Conteúdo do step */}
        <div style={{ padding: '28px 32px 32px' }}>

          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-ink)', marginBottom: 8, fontWeight: 400 }}>
                👋 Olá! Como posso te chamar?
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-muted)', marginBottom: 24, lineHeight: 1.6 }}>
                Sua jornada de transformação começa agora. Vamos personalizar tudo para você.
              </p>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-ink-secondary)', marginBottom: 8 }}>Seu nome</label>
              <input
                type="text"
                placeholder="Ex: João, Maria, Davi..."
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                autoFocus
                style={inputStyle}
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-ink)', marginBottom: 8, fontWeight: 400 }}>
                🎯 Qual área você quer transformar?
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                Escolha o foco principal da sua jornada agora.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {AREAS.map((area) => (
                  <button key={area.value} onClick={() => setForm({ ...form, area_foco: area.value })} style={{
                    padding: '14px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${form.area_foco === area.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: form.area_foco === area.value ? 'var(--color-primary-muted)' : 'var(--color-surface)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s var(--ease-out)',
                    boxShadow: form.area_foco === area.value ? 'var(--shadow-xs)' : 'none',
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{area.emoji}</div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: form.area_foco === area.value ? 'var(--color-primary)' : 'var(--color-ink)', lineHeight: 1.3 }}>{area.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-ink)', marginBottom: 8, fontWeight: 400 }}>
                📍 Em que fase você está?
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                Isso define as missões que você recebe cada dia.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FASES.map((fase) => (
                  <button key={fase.value} onClick={() => setForm({ ...form, fase: fase.value })} style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${form.fase === fase.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: form.fase === fase.value ? 'var(--color-primary-muted)' : 'var(--color-surface)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    transition: 'all 0.2s var(--ease-out)',
                  }}>
                    <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{fase.emoji}</span>
                    <div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: form.fase === fase.value ? 'var(--color-primary)' : 'var(--color-ink)', marginBottom: 3 }}>{fase.label}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>{fase.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-ink)', marginBottom: 8, fontWeight: 400 }}>
                🌟 Qual é a sua grande meta?
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-muted)', marginBottom: 24, lineHeight: 1.6 }}>
                O que você quer ter transformado daqui a 12 meses? Escreva com coragem.
              </p>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-ink-secondary)', marginBottom: 8 }}>Minha grande meta em 12 meses</label>
              <textarea
                placeholder="Ex: Quero largar o emprego CLT e viver do meu negócio digital, gerando R$10k/mês com liberdade de tempo..."
                value={form.meta_12_meses}
                onChange={(e) => setForm({ ...form, meta_12_meses: e.target.value })}
                rows={5}
                autoFocus
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
              />
              <p style={{ fontSize: 'var(--text-xs)', color: form.meta_12_meses.length >= 10 ? 'var(--color-success)' : 'var(--color-ink-muted)', marginTop: 6 }}>
                {form.meta_12_meses.length < 10 ? `Mínimo ${10 - form.meta_12_meses.length} caracteres ainda` : '✓ Ótimo!'}
              </p>
            </div>
          )}

          {/* Navegação */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, gap: 12 }}>
            {step > 1 ? (
              <button onClick={handleBack} style={{
                padding: '11px 20px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                background: 'transparent',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-ink-muted)',
                cursor: 'pointer',
                fontWeight: 500,
                fontFamily: 'var(--font-body)',
                transition: 'all 0.2s',
              }}>← Voltar</button>
            ) : <div />}

            {step < 4 ? (
              <button onClick={handleNext} disabled={!canAdvance()} className={canAdvance() ? 'btn-primary' : ''} style={!canAdvance() ? {
                padding: '11px 28px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--color-border)',
                color: 'var(--color-ink-muted)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                cursor: 'not-allowed',
                fontFamily: 'var(--font-body)',
              } : { padding: '11px 28px' }}>
                Continuar →
              </button>
            ) : (
              <button onClick={handleFinish} disabled={!canAdvance() || loading} className={canAdvance() && !loading ? 'btn-primary' : ''} style={!canAdvance() || loading ? {
                padding: '11px 28px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--color-border)',
                color: 'var(--color-ink-muted)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                cursor: 'not-allowed',
                fontFamily: 'var(--font-body)',
              } : { padding: '11px 28px' }}>
                {loading ? 'Salvando...' : '🚀 Começar minha jornada'}
              </button>
            )}
          </div>
        </div>
      </div>

      <p style={{ marginTop: 20, fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)', textAlign: 'center' }}>
        Você pode alterar essas informações depois em Configurações
      </p>
    </div>
  )
}

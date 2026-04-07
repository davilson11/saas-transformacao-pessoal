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
        .from('perfil')
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

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>

      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-brand-dark-green)', letterSpacing: '-0.5px' }}>A Virada</div>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>Configurando sua jornada</p>
      </div>

      <div style={{ width: '100%', maxWidth: 480, background: 'var(--color-surface)', borderRadius: 16, border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

        <div style={{ height: 4, background: 'var(--color-border)' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--color-brand-dark-green)', transition: 'width 0.4s ease' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '16px 24px 0' }}>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: s === step ? 'var(--color-brand-dark-green)' : s < step ? 'var(--color-text-muted)' : 'var(--color-text-faint)', fontWeight: s === step ? 600 : 400 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: s < step ? 'var(--color-brand-dark-green)' : s === step ? 'var(--color-brand-light-green)' : 'var(--color-surface-offset)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: s < step ? '#fff' : s === step ? 'var(--color-brand-dark-green)' : 'var(--color-text-faint)', fontWeight: 700 }}>
                {s < step ? '✓' : s}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '24px 24px 28px' }}>

          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-brand-dark-green)', marginBottom: 8 }}>👋 Olá! Como posso te chamar?</h2>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.5 }}>Sua jornada de transformação começa agora. Vamos personalizar tudo para você.</p>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>Seu nome</label>
              <input type="text" placeholder="Ex: João, Maria, Davi..." value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} autoFocus style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid var(--color-border)', background: 'var(--color-surface-2)', fontSize: 15, color: 'var(--color-text)', outline: 'none', fontFamily: 'inherit' }} />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-brand-dark-green)', marginBottom: 8 }}>🎯 Qual área você quer transformar?</h2>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 20, lineHeight: 1.5 }}>Escolha o foco principal da sua jornada agora. Você pode mudar depois.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {AREAS.map((area) => (
                  <button key={area.value} onClick={() => setForm({ ...form, area_foco: area.value })} style={{ padding: '12px 10px', borderRadius: 10, border: `1.5px solid ${form.area_foco === area.value ? 'var(--color-brand-dark-green)' : 'var(--color-border)'}`, background: form.area_foco === area.value ? 'var(--color-brand-light-green)' : 'var(--color-surface-2)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{area.emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: form.area_foco === area.value ? 'var(--color-brand-dark-green)' : 'var(--color-text)', lineHeight: 1.3 }}>{area.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-brand-dark-green)', marginBottom: 8 }}>📍 Em que fase você está?</h2>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 20, lineHeight: 1.5 }}>Isso define as missões que você vai receber cada dia. Seja honesto!</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FASES.map((fase) => (
                  <button key={fase.value} onClick={() => setForm({ ...form, fase: fase.value })} style={{ padding: '14px 16px', borderRadius: 10, border: `1.5px solid ${form.fase === fase.value ? 'var(--color-brand-dark-green)' : 'var(--color-border)'}`, background: form.fase === fase.value ? 'var(--color-brand-light-green)' : 'var(--color-surface-2)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 12, transition: 'all 0.2s' }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{fase.emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: form.fase === fase.value ? 'var(--color-brand-dark-green)' : 'var(--color-text)', marginBottom: 2 }}>{fase.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{fase.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-brand-dark-green)', marginBottom: 8 }}>🌟 Qual é a sua grande meta?</h2>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.5 }}>O que você quer ter transformado daqui a 12 meses? Escreva com coragem.</p>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>Minha grande meta em 12 meses</label>
              <textarea placeholder="Ex: Quero largar o emprego CLT e viver do meu negócio digital, gerando R$10k/mês com liberdade de tempo..." value={form.meta_12_meses} onChange={(e) => setForm({ ...form, meta_12_meses: e.target.value })} rows={5} autoFocus style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid var(--color-border)', background: 'var(--color-surface-2)', fontSize: 14, color: 'var(--color-text)', outline: 'none', resize: 'none', lineHeight: 1.6, fontFamily: 'inherit' }} />
              <p style={{ fontSize: 11, color: 'var(--color-text-faint)', marginTop: 6 }}>
                {form.meta_12_meses.length < 10 ? `Mínimo ${10 - form.meta_12_meses.length} caracteres ainda` : '✓ Ótimo!'}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, gap: 12 }}>
            {step > 1 ? (
              <button onClick={handleBack} style={{ padding: '11px 20px', borderRadius: 10, border: '1.5px solid var(--color-border)', background: 'transparent', fontSize: 14, color: 'var(--color-text-muted)', cursor: 'pointer', fontWeight: 500 }}>← Voltar</button>
            ) : <div />}
            {step < 4 ? (
              <button onClick={handleNext} disabled={!canAdvance()} style={{ padding: '11px 28px', borderRadius: 10, border: 'none', background: canAdvance() ? 'var(--color-brand-dark-green)' : 'var(--color-border)', color: canAdvance() ? '#fff' : 'var(--color-text-faint)', fontSize: 14, fontWeight: 600, cursor: canAdvance() ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                Continuar →
              </button>
            ) : (
              <button onClick={handleFinish} disabled={!canAdvance() || loading} style={{ padding: '11px 28px', borderRadius: 10, border: 'none', background: canAdvance() && !loading ? 'var(--color-brand-dark-green)' : 'var(--color-border)', color: canAdvance() && !loading ? '#fff' : 'var(--color-text-faint)', fontSize: 14, fontWeight: 600, cursor: canAdvance() && !loading ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                {loading ? 'Salvando...' : '🚀 Começar minha jornada'}
              </button>
            )}
          </div>
        </div>
      </div>

      <p style={{ marginTop: 20, fontSize: 12, color: 'var(--color-text-faint)', textAlign: 'center' }}>
        Você pode alterar essas informações depois em Configurações
      </p>
    </div>
  )
}

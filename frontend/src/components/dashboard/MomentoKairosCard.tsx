'use client';
import Link from 'next/link';

export default function MomentoKairosCard() {
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Link href="/momento" style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'linear-gradient(135deg, #0E0E0E 0%, #1a1a0a 100%)',
        border: '1px solid rgba(200,160,48,0.3)',
        borderRadius: 16,
        padding: '20px 24px',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(200,160,48,0.7)', marginBottom: 6 }}>
              MOMENTO KAIROS · HOJE
            </p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#F5F0E8', margin: 0 }}>
              {hoje.charAt(0).toUpperCase() + hoje.slice(1)}
            </p>
            <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.5)', marginTop: 4 }}>
              Sua voz, versículo e missão do dia estão te esperando →
            </p>
          </div>
          <span style={{ fontSize: 28 }}>☀️</span>
        </div>
      </div>
    </Link>
  );
}

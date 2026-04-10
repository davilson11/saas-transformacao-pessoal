import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Serviço — Kairos',
  description: 'Termos e condições de uso da plataforma Kairos de transformação pessoal.',
};

// ─── Tokens ───────────────────────────────────────────────────────────────────

const BG     = '#0E0E0E';
const CREAM  = '#F5F0E8';
const GOLD   = '#C8A030';
const MUTED  = 'rgba(245,240,232,0.55)';
const BORDER = 'rgba(245,240,232,0.08)';

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Section({ id, titulo, children }: {
  id:       string;
  titulo:   string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{
        borderTop:     `1px solid ${BORDER}`,
        paddingTop:    32,
        marginTop:     32,
        display:       'flex',
        flexDirection: 'column',
        gap:           14,
      }}
    >
      <h2 style={{
        fontFamily: 'var(--font-heading)',
        fontSize:   '1.25rem',
        fontWeight: 600,
        color:      GOLD,
        margin:     0,
        lineHeight: 1.2,
      }}>
        {titulo}
      </h2>
      <div style={{
        fontFamily:    'var(--font-body)',
        fontSize:      15,
        color:         CREAM,
        lineHeight:    1.75,
        display:       'flex',
        flexDirection: 'column',
        gap:           12,
      }}>
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: 0 }}>{children}</p>;
}

function Lista({ itens }: { itens: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {itens.map((item) => (
        <li key={item} style={{ color: CREAM }}>{item}</li>
      ))}
    </ul>
  );
}

function Destaque({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background:   'rgba(200,160,48,0.08)',
      border:       `1px solid rgba(200,160,48,0.25)`,
      borderRadius: 10,
      padding:      '14px 18px',
      fontFamily:   'var(--font-body)',
      fontSize:     14,
      color:        CREAM,
      lineHeight:   1.65,
    }}>
      {children}
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function TermosPage() {
  const vigencia = '10 de abril de 2026';

  return (
    <div style={{ background: BG, minHeight: '100vh', color: CREAM }}>

      {/* ── Header ── */}
      <header style={{
        borderBottom:   `1px solid ${BORDER}`,
        padding:        '18px 24px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
      }}>
        <Link
          href="/"
          style={{
            fontFamily:     'var(--font-heading)',
            fontSize:       20,
            fontWeight:     700,
            color:          GOLD,
            textDecoration: 'none',
            letterSpacing:  '0.06em',
          }}
        >
          KAIROS
        </Link>
        <Link
          href="/"
          style={{
            fontFamily:     'var(--font-body)',
            fontSize:       13,
            color:          MUTED,
            textDecoration: 'none',
          }}
        >
          ← Voltar ao início
        </Link>
      </header>

      {/* ── Conteúdo ── */}
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px 80px' }}>

        {/* Título */}
        <div style={{ marginBottom: 40 }}>
          <p style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      11,
            fontWeight:    600,
            color:         GOLD,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom:  12,
          }}>
            Termos & Condições
          </p>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize:   'clamp(28px, 5vw, 42px)',
            fontWeight: 700,
            color:      CREAM,
            lineHeight: 1.15,
            margin:     '0 0 16px',
          }}>
            Termos de Serviço
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: MUTED, margin: 0 }}>
            Vigente a partir de {vigencia} · Kairos Plataforma Digital Ltda.
          </p>
        </div>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: CREAM, lineHeight: 1.75 }}>
          Ao criar uma conta ou usar a plataforma Kairos, você concorda com estes
          Termos de Serviço. Leia com atenção antes de utilizar o serviço.
        </p>

        <Section id="servico" titulo="1. Descrição do Serviço">
          <P>
            O Kairos é uma plataforma digital de transformação pessoal que oferece
            16 ferramentas interativas estruturadas em 4 fases — Autoconhecimento,
            Planejamento, Execução e Sustentação — além de dashboard, Diário de
            Bordo, Roda da Vida, Visão Âncora e análises baseadas nos dados
            registrados pelo próprio usuário.
          </P>
          <P>
            O serviço é prestado online, via navegador web, sem instalação de
            aplicativo. A disponibilidade é de melhor esforço, com objetivo de
            99% de uptime mensal, excluídos períodos de manutenção programada.
          </P>
        </Section>

        <Section id="conta" titulo="2. Criação de Conta e Responsabilidades">
          <Lista itens={[
            'Você deve ter pelo menos 18 anos para criar uma conta.',
            'As credenciais de acesso (e-mail e senha) são pessoais e intransferíveis.',
            'Você é responsável por manter a confidencialidade da sua senha.',
            'Cada conta é de uso individual — não é permitido o compartilhamento de acesso.',
            'Informações falsas no cadastro podem resultar no cancelamento da conta.',
            'Notifique-nos imediatamente em caso de acesso não autorizado à sua conta.',
          ]} />
        </Section>

        <Section id="planos" titulo="3. Planos e Acesso">
          <P>O Kairos oferece os seguintes planos:</P>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              background:   'rgba(245,240,232,0.04)',
              border:       `1px solid ${BORDER}`,
              borderRadius: 10,
              padding:      '14px 18px',
            }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: CREAM, margin: '0 0 6px' }}>
                Plano Grátis
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: MUTED, margin: 0 }}>
                Acesso permanente e gratuito a 3 ferramentas selecionadas. Sem prazo de expiração.
                Sem necessidade de cartão de crédito.
              </p>
            </div>

            <div style={{
              background:   'rgba(245,240,232,0.04)',
              border:       `1px solid ${BORDER}`,
              borderRadius: 10,
              padding:      '14px 18px',
            }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: CREAM, margin: '0 0 6px' }}>
                Pro Mensal — R$29/mês
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: MUTED, margin: 0 }}>
                Acesso completo a todas as 16 ferramentas, dashboard, Diário de Bordo e análises.
                Cobrança recorrente mensal. Cancele a qualquer momento, sem multa.
              </p>
            </div>

            <div style={{
              background:   'rgba(200,160,48,0.06)',
              border:       `1px solid rgba(200,160,48,0.20)`,
              borderRadius: 10,
              padding:      '14px 18px',
            }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: GOLD, margin: '0 0 6px' }}>
                Pro Anual — R$197/ano
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: MUTED, margin: 0 }}>
                Todos os benefícios do Pro Mensal com 45% de desconto. Cobrança única anual.
                Inclui garantia de 7 dias com reembolso integral. Acesso antecipado a novidades.
              </p>
            </div>
          </div>

          <P>
            Os preços podem ser alterados com aviso prévio de 30 dias. Assinaturas
            ativas não são afetadas por reajustes durante o ciclo em curso.
          </P>
        </Section>

        <Section id="pagamentos" titulo="4. Pagamentos via Stripe">
          <P>
            Todos os pagamentos são processados pelo Stripe, Inc., provedor de
            pagamentos certificado PCI-DSS nível 1. Não armazenamos dados de
            cartão de crédito em nossos servidores.
          </P>
          <Lista itens={[
            'Aceitamos cartões de crédito e débito das bandeiras Visa, Mastercard, American Express e Elo.',
            'Cobranças são realizadas em Reais (BRL) na data de contratação.',
            'Assinaturas mensais renovam automaticamente a cada 30 dias.',
            'Assinaturas anuais renovam automaticamente após 12 meses.',
            'Em caso de falha no pagamento, tentaremos cobrar novamente por até 3 vezes em 7 dias.',
            'Se todas as tentativas falharem, o acesso Pro será suspenso até regularização.',
            'Você receberá um recibo por e-mail após cada cobrança bem-sucedida.',
          ]} />
          <Destaque>
            🔒 Seus dados de pagamento são processados diretamente pelo Stripe com
            criptografia TLS. O Kairos nunca tem acesso ao número completo do seu cartão.
          </Destaque>
        </Section>

        <Section id="cancelamento" titulo="5. Cancelamento e Reembolso">
          <P>
            Você pode cancelar sua assinatura a qualquer momento através do painel
            de configurações da conta ou enviando e-mail para{' '}
            <a href="mailto:contato@kairos.app" style={{ color: GOLD }}>contato@kairos.app</a>.
          </P>
          <Lista itens={[
            'Plano Mensal: o cancelamento entra em vigor ao final do ciclo atual. Não há reembolso proporcional por dias não utilizados.',
            'Plano Anual: garantia de reembolso integral nos primeiros 7 dias corridos após a contratação. Após esse prazo, não há reembolso proporcional.',
            'Após o cancelamento, você mantém acesso ao plano Pro até o fim do período pago.',
            'Dados pessoais e respostas das ferramentas permanecem disponíveis para exportação por 30 dias após o cancelamento.',
          ]} />
        </Section>

        <Section id="uso-aceitavel" titulo="6. Uso Aceitável">
          <P>É proibido usar a plataforma para:</P>
          <Lista itens={[
            'Compartilhar credenciais de acesso ou revender o serviço.',
            'Realizar scraping automatizado, ataques de força bruta ou tentativas de invasão.',
            'Inserir conteúdo ilegal, ofensivo, discriminatório ou que viole direitos de terceiros.',
            'Tentar contornar medidas de segurança ou limitações de plano.',
            'Usar o serviço para fins comerciais não autorizados expressamente por nós.',
          ]} />
          <P>
            O descumprimento dessas regras pode resultar na suspensão imediata da conta,
            sem direito a reembolso.
          </P>
        </Section>

        <Section id="conteudo" titulo="7. Conteúdo do Usuário">
          <P>
            Tudo que você registra na plataforma (respostas, reflexões, diário) é de
            sua propriedade intelectual. Ao salvar conteúdo, você nos concede licença
            limitada, não exclusiva e revogável para processar e armazenar esses dados
            com o único objetivo de prestar o serviço contratado.
          </P>
          <P>
            Não utilizamos o conteúdo dos seus registros para treinamento de modelos
            de IA de terceiros, publicidade ou qualquer finalidade além da descrita
            nestes Termos.
          </P>
        </Section>

        <Section id="responsabilidades" titulo="8. Responsabilidades e Limitações">
          <P>
            O Kairos é uma ferramenta de suporte ao autoconhecimento e planejamento
            pessoal. <strong style={{ color: CREAM }}>Não somos substituto para
            acompanhamento psicológico, psiquiátrico, financeiro ou médico profissional.</strong>
          </P>
          <Lista itens={[
            'O Kairos não garante resultados específicos de transformação pessoal.',
            'Não somos responsáveis por decisões tomadas com base no conteúdo da plataforma.',
            'Nossa responsabilidade máxima está limitada ao valor pago nos últimos 3 meses de assinatura.',
            'Não nos responsabilizamos por perdas indiretas, lucros cessantes ou danos consequenciais.',
            'Faremos esforços razoáveis para manter a plataforma disponível, mas não garantimos disponibilidade ininterrupta.',
          ]} />
        </Section>

        <Section id="propriedade" titulo="9. Propriedade Intelectual">
          <P>
            Todo o conteúdo da plataforma Kairos — incluindo textos das ferramentas,
            design, código, marca, logotipo, metodologia e estrutura das 4 fases —
            é de propriedade exclusiva da Kairos Plataforma Digital Ltda. e protegido
            por leis de direitos autorais.
          </P>
          <P>
            É vedada a reprodução, cópia, distribuição ou criação de obras derivadas
            sem autorização prévia e expressa por escrito.
          </P>
        </Section>

        <Section id="vigencia" titulo="10. Vigência e Rescisão">
          <P>
            Estes Termos vigoram enquanto você mantiver uma conta ativa no Kairos.
            Podemos encerrar ou suspender sua conta em caso de violação destes Termos,
            mediante aviso prévio sempre que possível.
          </P>
          <P>
            Você pode encerrar sua conta a qualquer momento pelo painel de configurações.
            Após o encerramento, seus dados serão retidos conforme descrito na
            Política de Privacidade.
          </P>
        </Section>

        <Section id="alteracoes" titulo="11. Alterações nos Termos">
          <P>
            Podemos atualizar estes Termos periodicamente. Alterações relevantes serão
            comunicadas com pelo menos 15 dias de antecedência por e-mail ou aviso
            destacado na plataforma. O uso continuado após a vigência das novas versões
            implica aceitação dos termos atualizados.
          </P>
        </Section>

        <Section id="lei-aplicavel" titulo="12. Lei Aplicável e Foro">
          <P>
            Estes Termos são regidos pelas leis da República Federativa do Brasil,
            incluindo o Código de Defesa do Consumidor (Lei nº 8.078/1990), o Marco
            Civil da Internet (Lei nº 12.965/2014) e a LGPD (Lei nº 13.709/2018).
          </P>
          <P>
            Fica eleito o foro da comarca de São Paulo/SP para resolução de conflitos
            decorrentes destes Termos, com renúncia a qualquer outro, por mais
            privilegiado que seja.
          </P>
        </Section>

        <Section id="contato" titulo="13. Contato">
          <Lista itens={[
            'Dúvidas gerais: contato@kairos.app',
            'Cancelamentos e cobranças: financeiro@kairos.app',
            'Privacidade e dados: privacidade@kairos.app',
            'Prazo de resposta: até 5 dias úteis.',
          ]} />
        </Section>

        {/* Rodapé da página */}
        <div style={{
          marginTop:      48,
          paddingTop:     24,
          borderTop:      `1px solid ${BORDER}`,
          display:        'flex',
          gap:            24,
          flexWrap:       'wrap',
          alignItems:     'center',
          justifyContent: 'space-between',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: MUTED, margin: 0 }}>
            Vigente a partir de {vigencia}
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/privacidade" style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: GOLD, textDecoration: 'none' }}>
              Política de Privacidade →
            </Link>
            <Link href="/" style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: MUTED, textDecoration: 'none' }}>
              Voltar ao início
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

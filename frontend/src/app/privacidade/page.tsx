import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade — Kairos',
  description: 'Saiba como o Kairos coleta, usa e protege seus dados pessoais conforme a LGPD.',
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
        borderTop:    `1px solid ${BORDER}`,
        paddingTop:   32,
        marginTop:    32,
        display:      'flex',
        flexDirection:'column',
        gap:          14,
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
        fontFamily: 'var(--font-body)',
        fontSize:   15,
        color:      CREAM,
        lineHeight: 1.75,
        display:    'flex',
        flexDirection: 'column',
        gap:        12,
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

// ─── Página ───────────────────────────────────────────────────────────────────

export default function PrivacidadePage() {
  const vigencia = '10 de abril de 2026';

  return (
    <div style={{ background: BG, minHeight: '100vh', color: CREAM }}>

      {/* ── Header ── */}
      <header style={{
        borderBottom: `1px solid ${BORDER}`,
        padding:      '18px 24px',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'space-between',
      }}>
        <Link
          href="/"
          style={{
            fontFamily:  'var(--font-heading)',
            fontSize:    20,
            fontWeight:  700,
            color:       GOLD,
            textDecoration: 'none',
            letterSpacing:  '0.06em',
          }}
        >
          KAIROS
        </Link>
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize:   13,
            color:      MUTED,
            textDecoration: 'none',
          }}
        >
          ← Voltar ao início
        </Link>
      </header>

      {/* ── Conteúdo ── */}
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px 80px' }}>

        {/* Título principal */}
        <div style={{ marginBottom: 40 }}>
          <p style={{
            fontFamily:     'var(--font-mono)',
            fontSize:       11,
            fontWeight:     600,
            color:          GOLD,
            letterSpacing:  '0.12em',
            textTransform:  'uppercase',
            marginBottom:   12,
          }}>
            Privacidade & LGPD
          </p>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize:   'clamp(28px, 5vw, 42px)',
            fontWeight: 700,
            color:      CREAM,
            lineHeight: 1.15,
            margin:     '0 0 16px',
          }}>
            Política de Privacidade
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: MUTED, margin: 0 }}>
            Vigente a partir de {vigencia} · Empresa: Kairos Plataforma Digital Ltda.
          </p>
        </div>

        {/* Introdução */}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: CREAM, lineHeight: 1.75 }}>
          A Kairos respeita e protege a privacidade de seus usuários. Esta Política descreve
          como coletamos, usamos, armazenamos e protegemos seus dados pessoais, em conformidade
          com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
        </p>

        <Section id="dados-coletados" titulo="1. Dados Pessoais Coletados">
          <P>Coletamos os seguintes dados ao longo do uso da plataforma:</P>
          <Lista itens={[
            'Dados de cadastro: nome completo, endereço de e-mail e senha (armazenada de forma criptografada via Clerk).',
            'Dados de perfil: foto de perfil (opcional), preferências de personalização.',
            'Respostas das ferramentas: conteúdo que você preenche nas 16 ferramentas interativas (Raio-X 360°, Bússola de Valores, SWOT Pessoal, entre outras), armazenado em banco de dados seguro (Supabase).',
            'Diário de Bordo: registros diários de humor, nota do dia e reflexões textuais.',
            'Dados de pagamento: processados exclusivamente pelo Stripe. Não armazenamos número de cartão, CVV ou dados bancários.',
            'Dados de uso: páginas acessadas, tempo de sessão, funcionalidades utilizadas (via logs do servidor).',
            'Dados técnicos: endereço IP, tipo de dispositivo, navegador e sistema operacional.',
          ]} />
        </Section>

        <Section id="finalidade" titulo="2. Finalidade do Tratamento">
          <P>Seus dados são usados para:</P>
          <Lista itens={[
            'Criar e gerenciar sua conta de usuário.',
            'Fornecer acesso às ferramentas e ao dashboard personalizado.',
            'Gerar insights e análises com base nos seus próprios registros.',
            'Processar pagamentos e gerenciar assinaturas (Pro Mensal e Pro Anual).',
            'Enviar comunicações transacionais (confirmação de cadastro, recibo de pagamento).',
            'Enviar comunicações de produto (novidades, dicas) — com possibilidade de cancelamento a qualquer momento.',
            'Melhorar a plataforma com base em dados agregados e anonimizados.',
            'Cumprir obrigações legais e regulatórias.',
          ]} />
        </Section>

        <Section id="base-legal" titulo="3. Base Legal para o Tratamento">
          <Lista itens={[
            'Execução de contrato (Art. 7º, V, LGPD): dados necessários para prestar o serviço contratado.',
            'Consentimento (Art. 7º, I, LGPD): comunicações de marketing e cookies não essenciais.',
            'Legítimo interesse (Art. 7º, IX, LGPD): segurança, prevenção a fraudes e melhoria do produto.',
            'Cumprimento de obrigação legal (Art. 7º, II, LGPD): obrigações fiscais e legais.',
          ]} />
        </Section>

        <Section id="cookies" titulo="4. Cookies e Tecnologias de Rastreamento">
          <P>
            Utilizamos cookies e tecnologias similares para manter sua sessão ativa, salvar
            preferências e coletar dados de uso agregados.
          </P>
          <Lista itens={[
            'Cookies essenciais: necessários para o funcionamento do login e das sessões (não podem ser desativados).',
            'Cookies de desempenho: medem o tempo de carregamento e erros de interface (dados agregados, sem identificação pessoal).',
            'Cookies de preferência: salvam configurações de layout e tema.',
          ]} />
          <P>
            Você pode gerenciar ou bloquear cookies nas configurações do seu navegador.
            A desativação de cookies essenciais pode impedir o uso da plataforma.
          </P>
        </Section>

        <Section id="compartilhamento" titulo="5. Compartilhamento de Dados">
          <P>Seus dados são compartilhados apenas com:</P>
          <Lista itens={[
            'Clerk (autenticação): gerencia login, sessões e credenciais de forma segura.',
            'Supabase (banco de dados): armazena respostas das ferramentas e dados de progresso, com criptografia em repouso.',
            'Stripe (pagamentos): processa cobranças de assinatura. Sujeito à Política de Privacidade do Stripe.',
            'Provedores de infraestrutura cloud (Vercel): hospedagem da aplicação na região mais próxima.',
          ]} />
          <P>
            Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins
            publicitários. Todos os subprocessadores estão sujeitos a acordos de processamento
            de dados (DPA) compatíveis com a LGPD.
          </P>
        </Section>

        <Section id="retencao" titulo="6. Retenção de Dados">
          <Lista itens={[
            'Dados de conta: mantidos enquanto a conta estiver ativa.',
            'Dados de ferramentas e diário: mantidos por até 5 anos após o encerramento da conta, salvo solicitação de exclusão.',
            'Dados de pagamento: retidos conforme exigências fiscais e regulatórias (mínimo 5 anos).',
            'Logs de acesso: até 6 meses, conforme o Marco Civil da Internet (Lei nº 12.965/2014).',
          ]} />
        </Section>

        <Section id="direitos" titulo="7. Direitos do Titular (Você)">
          <P>
            Nos termos da LGPD (Art. 18), você tem direito a:
          </P>
          <Lista itens={[
            'Acesso: solicitar cópia dos seus dados pessoais armazenados.',
            'Correção: corrigir dados incompletos, inexatos ou desatualizados.',
            'Anonimização ou bloqueio: bloquear dados desnecessários ou tratados em desconformidade.',
            'Portabilidade: receber seus dados em formato estruturado e legível por máquina.',
            'Eliminação: solicitar a exclusão dos dados tratados com base no seu consentimento.',
            'Revogação do consentimento: retirar o consentimento para tratamentos baseados nele, sem custo.',
            'Oposição: opor-se a tratamentos realizados com fundamento em legítimo interesse.',
            'Informação: ser informado sobre o uso compartilhado dos seus dados.',
          ]} />
          <P>
            Para exercer qualquer um desses direitos, envie sua solicitação para{' '}
            <a href="mailto:privacidade@kairos.app" style={{ color: GOLD }}>
              privacidade@kairos.app
            </a>
            . Responderemos em até 15 dias úteis.
          </P>
        </Section>

        <Section id="seguranca" titulo="8. Segurança dos Dados">
          <Lista itens={[
            'Transmissão criptografada via HTTPS/TLS em toda a plataforma.',
            'Senhas nunca armazenadas em texto puro — gerenciadas pelo Clerk com hash seguro.',
            'Banco de dados com criptografia em repouso (Supabase).',
            'Acesso aos dados restrito a colaboradores com necessidade operacional, sob NDA.',
            'Monitoramento contínuo de vulnerabilidades e atualizações de segurança.',
          ]} />
          <P>
            Em caso de incidente de segurança que afete seus dados, você será notificado
            dentro do prazo legal, conforme exige a LGPD.
          </P>
        </Section>

        <Section id="menores" titulo="9. Menores de Idade">
          <P>
            A plataforma Kairos é destinada a maiores de 18 anos. Não coletamos
            intencionalmente dados de menores de 18 anos. Se identificarmos dados
            de menores, procederemos à exclusão imediata.
          </P>
        </Section>

        <Section id="transferencia" titulo="10. Transferência Internacional de Dados">
          <P>
            Alguns de nossos subprocessadores (Clerk, Supabase, Stripe, Vercel) operam
            em servidores fora do Brasil. Essas transferências são realizadas com base em
            cláusulas contratuais padrão e mecanismos reconhecidos pela ANPD, garantindo
            nível de proteção equivalente ao exigido pela LGPD.
          </P>
        </Section>

        <Section id="alteracoes" titulo="11. Alterações nesta Política">
          <P>
            Podemos atualizar esta Política periodicamente. Notificaremos alterações
            relevantes por e-mail ou mediante aviso destacado na plataforma com pelo menos
            15 dias de antecedência. O uso continuado após a vigência das alterações
            implica a aceitação da nova versão.
          </P>
        </Section>

        <Section id="contato" titulo="12. Contato e Encarregado (DPO)">
          <Lista itens={[
            'E-mail geral: contato@kairos.app',
            'E-mail para solicitações de privacidade (DPO): privacidade@kairos.app',
            'Prazo de resposta: até 15 dias úteis para solicitações de titulares.',
          ]} />
          <P>
            Caso não esteja satisfeito com nossa resposta, você pode contatar a Autoridade
            Nacional de Proteção de Dados (ANPD) em{' '}
            <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" style={{ color: GOLD }}>
              www.gov.br/anpd
            </a>.
          </P>
        </Section>

        {/* Rodapé da página */}
        <div style={{
          marginTop:    48,
          paddingTop:   24,
          borderTop:    `1px solid ${BORDER}`,
          display:      'flex',
          gap:          24,
          flexWrap:     'wrap',
          alignItems:   'center',
          justifyContent: 'space-between',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: MUTED, margin: 0 }}>
            Vigente a partir de {vigencia}
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/termos" style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: GOLD, textDecoration: 'none' }}>
              Termos de Serviço →
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

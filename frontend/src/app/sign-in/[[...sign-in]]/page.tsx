import { SignIn } from '@clerk/nextjs';

const LOGO_STYLE: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: 26,
  fontWeight: 400,
  color: '#F5F0E8',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  lineHeight: 1,
};

const DOT_STYLE: React.CSSProperties = {
  width: 7,
  height: 7,
  background: '#C8A030',
  borderRadius: '50%',
  display: 'inline-block',
  flexShrink: 0,
  marginBottom: 2,
};

export default function SignInPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={LOGO_STYLE}>KAIROS</span>
        <span style={DOT_STYLE} />
      </div>
      <SignIn
        forceRedirectUrl='/momento'
        appearance={{
          variables: {
            colorPrimary: '#C8A030',
            colorBackground: '#141414',
            colorText: '#F5F0E8',
            colorTextSecondary: 'rgba(245,240,232,0.6)',
            colorInputBackground: '#1e1e1e',
            colorInputText: '#F5F0E8',
            colorNeutral: '#F5F0E8',
            borderRadius: '10px',
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: '15px',
          },
          elements: {
            card: { backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 8px 48px rgba(0,0,0,0.7)' },
            headerTitle: { fontFamily: 'Georgia, serif', fontWeight: 400, letterSpacing: '0.08em', color: '#F5F0E8' },
            headerSubtitle: { color: 'rgba(245,240,232,0.55)' },
            socialButtonsBlockButton: { backgroundColor: '#1e1e1e', border: '1px solid rgba(255,255,255,0.12)', color: '#F5F0E8' },
            socialButtonsBlockButtonText: { color: '#F5F0E8', fontWeight: 500 },
            dividerLine: { backgroundColor: 'rgba(255,255,255,0.1)' },
            dividerText: { color: 'rgba(245,240,232,0.4)' },
            formFieldLabel: { color: 'rgba(245,240,232,0.7)', fontSize: '13px' },
            formFieldInput: { backgroundColor: '#1e1e1e', border: '1px solid rgba(255,255,255,0.12)', color: '#F5F0E8', caretColor: '#C8A030' },
            formButtonPrimary: { backgroundColor: '#C8A030', color: '#0E0E0E', fontWeight: 700, letterSpacing: '0.05em' },
            footerActionLink: { color: '#C8A030' },
            footerActionText: { color: 'rgba(245,240,232,0.5)' },
            identityPreviewText: { color: '#F5F0E8' },
            formResendCodeLink: { color: '#C8A030' },
          },
        }}
      />
    </div>
  );
}

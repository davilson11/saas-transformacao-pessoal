import { SignUp } from "@clerk/nextjs";

const LOGO_STYLE: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: 26,
  fontWeight: 400,
  color: "#F5F0E8",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  lineHeight: 1,
};

const DOT_STYLE: React.CSSProperties = {
  width: 7,
  height: 7,
  background: "#B5840A",
  borderRadius: "50%",
  display: "inline-block",
  flexShrink: 0,
  marginBottom: 2,
};

export default function SignUpPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080808",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        gap: "32px",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={LOGO_STYLE}>KAIROS</span>
        <span style={DOT_STYLE} />
      </div>

      <SignUp
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
          },
        }}
      />
    </div>
  );
}

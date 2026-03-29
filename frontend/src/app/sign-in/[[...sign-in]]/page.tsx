import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1a5c3a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        gap: "32px",
      }}
    >
      {/* Logo */}
      <span
        style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontStyle: "italic",
          fontSize: 28,
          fontWeight: 400,
          color: "#f5f4f0",
          letterSpacing: "-0.01em",
        }}
      >
        A Virada
      </span>

      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#b5840a",
            colorBackground: "#133028",
            colorText: "#f5f4f0",
            colorTextSecondary: "rgba(245,244,240,0.6)",
            colorInputBackground: "rgba(0,0,0,0.2)",
            colorInputText: "#f5f4f0",
            borderRadius: "12px",
            fontFamily: '"Inter", system-ui, sans-serif',
          },
          elements: {
            card: {
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
            },
            headerTitle: {
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontStyle: "italic",
              fontWeight: 400,
            },
          },
        }}
      />
    </div>
  );
}

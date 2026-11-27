export default function App() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        gap: '12px',
      }}
    >
      <h1 style={{ margin: 0, fontFamily: "'Noto Sans', sans-serif" }}>Dinkatha</h1>
      <p style={{ margin: 0, fontFamily: "'Noto Sans Bengali', sans-serif" }} lang="bn">
        দিনকথা
      </p>
      <p style={{ margin: 0, fontFamily: "'Noto Sans Devanagari', sans-serif" }} lang="hi">
        दिनकथा
      </p>
      <p style={{ margin: '12px 0 0' }}>A voice diary for parents.</p>
    </main>
  );
}

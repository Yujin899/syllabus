export default function Home() {
    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Syllabus Platform</h1>
            <p>If you see this, the root route is working.</p>
            <a href="/auth/login" style={{ color: '#004E98', fontWeight: 'bold' }}>Go to Login Page</a>
        </div>
    );
}

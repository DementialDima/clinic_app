import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [doctors, setDoctors] = useState([]);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Авторизація
            const res = await axios.post('/auth/jwt/create/', { username, password });
            localStorage.setItem('access', res.data.access);
            localStorage.setItem('refresh', res.data.refresh);

            // Отримання профілю користувача
            const me = await axios.get('/auth/users/me/');
            localStorage.setItem('role', me.data.role);
            localStorage.setItem('user', JSON.stringify(me.data)); // ⬅️ ВАЖЛИВО

            navigate('/appointments');
        } catch (err) {
            alert('Помилка логіну!');
        }
    };

    useEffect(() => {
        axios.get('/api/doctors/public/')
            .then(res => setDoctors(res.data))
            .catch(() => {});
    }, []);

    return (
        <div style={{ padding: 40 }}>
            <h2>Вхід</h2>
            <form onSubmit={handleLogin} style={{ marginBottom: 40 }}>
                <input
                    placeholder="Ім'я користувача"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ display: 'block', marginBottom: 10, padding: 8, width: 300 }}
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ display: 'block', marginBottom: 10, padding: 8, width: 300 }}
                />
                <button type="submit" style={{ padding: 10, width: 150 }}>Увійти</button>
            </form>

            <hr style={{ margin: '40px 0' }} />
            <h3>Наші спеціалісти 🦷</h3>

            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 20,
                justifyContent: 'flex-start',
                marginTop: 20
            }}>
                {doctors.map(doc => (
                    <div key={doc.id} style={{
                        border: '1px solid #ccc',
                        borderRadius: 10,
                        padding: 10,
                        width: 220,
                        textAlign: 'center',
                        background: '#f9f9f9',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                        {doc.photo_url ? (
                            <img
                                src={`http://localhost:8000${doc.photo_url}`}
                                alt="Фото"
                                style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 6 }}
                            />
                        ) : (
                            <div style={{ fontSize: 60, paddingTop: 20 }}>👨‍⚕️</div>
                        )}
                        <h4 style={{ margin: '10px 0 5px' }}>
                            {doc.first_name} {doc.last_name}
                        </h4>
                        <p style={{ margin: '0 0 5px' }}><strong>{doc.specialization}</strong></p>
                        <p style={{ color: '#666' }}>{doc.experience_years} років досвіду</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

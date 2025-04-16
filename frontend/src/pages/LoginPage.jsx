import { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // 🔐 логін
            const res = await axios.post('/auth/jwt/create/', {
                username,
                password,
            });

            // 🔐 збереження токенів
            localStorage.setItem('access', res.data.access);
            localStorage.setItem('refresh', res.data.refresh);

            // ⚙️ отримання ролі користувача
            const me = await axios.get('/auth/users/me/');
            localStorage.setItem('role', me.data.role);

            // 🔁 перехід на сторінку прийомів
            navigate('/appointments');
        } catch (err) {
            alert('Помилка логіну!');
        }
    };

    return (
        <div>
            <h2>Вхід</h2>
            <form onSubmit={handleLogin}>
                <input placeholder="username" onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Увійти</button>
            </form>
        </div>
    );
}

import { useEffect, useState } from 'react';
import axios from '../api/axios';
import AppHeader from '../components/Header';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        axios.get('/auth/users/me/')
            .then(res => setUser(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleChangePassword = (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage('❌ Паролі не співпадають!');
            return;
        }

        axios.post('/auth/users/set_password/', {
            current_password: oldPassword,
            new_password: newPassword,
        })
            .then(() => {
                setMessage('✅ Пароль успішно змінено!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            })
            .catch(() => {
                setMessage('❌ Помилка зміни пароля.');
            });
    };

    if (!user) return <p>Завантаження профілю...</p>;

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>Мій профіль</h2>
                <ul>
                    <li><strong>Ім’я користувача:</strong> {user.username}</li>
                    <li><strong>Email:</strong> {user.email || '—'}</li>
                    <li><strong>Ім’я:</strong> {user.first_name || '—'}</li>
                    <li><strong>Прізвище:</strong> {user.last_name || '—'}</li>
                    <li><strong>Роль:</strong> {user.role}</li>
                </ul>

                <hr />
                <h3>Зміна пароля</h3>
                <form onSubmit={handleChangePassword}>
                    <div>
                        <input
                            type="password"
                            placeholder="Старий пароль"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Новий пароль"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Повторіть новий пароль"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Змінити пароль</button>
                </form>

                {message && <p style={{ marginTop: 10 }}>{message}</p>}
            </div>
        </>
    );
}

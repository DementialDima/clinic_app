import { useState } from 'react';
import axios from '../api/axios';
import AppHeader from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../api/auth';

export default function AdminCreateUserPage() {
    const navigate = useNavigate();

    if (getUserRole() !== 'ADMIN') {
        navigate('/');
    }

    const [role, setRole] = useState('PATIENT');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [form, setForm] = useState({});

    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            username,
            password,
            role,
            [`${role.toLowerCase()}_profile`]: form,
        };

        try {
            await axios.post('/api/users/create/', data);
            alert('✅ Користувача створено!');
            navigate('/admin-panel');
        } catch (err) {
            alert('❌ Помилка при створенні!');
            console.error(err.response?.data || err);
        }
    };

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>➕ Створення нового користувача</h2>
                <form onSubmit={handleSubmit}>
                    <label>Роль:</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="PATIENT">Пацієнт</option>
                        <option value="DOCTOR">Лікар</option>
                    </select>

                    <div>
                        <input required placeholder="Логін" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <input required type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    {role === 'PATIENT' ? (
                        <>
                            <h4>Дані пацієнта:</h4>
                            <input required placeholder="Ім’я" onChange={handleChange('first_name')} />
                            <input required placeholder="Прізвище" onChange={handleChange('last_name')} />
                            <input placeholder="По батькові" onChange={handleChange('middle_name')} />
                            <input required type="date" onChange={handleChange('birth_date')} />
                            <select required onChange={handleChange('gender')}>
                                <option value="">Стать</option>
                                <option value="MALE">Чоловіча</option>
                                <option value="FEMALE">Жіноча</option>
                            </select>
                            <input required placeholder="Номер телефону" onChange={handleChange('phone_number')} />
                            <input required placeholder="Адреса" onChange={handleChange('address')} />
                            <input placeholder="ІНН" onChange={handleChange('inn')} />
                            <input required placeholder="Номер медичної картки" onChange={handleChange('medical_card_number')} />
                        </>
                    ) : (
                        <>
                            <h4>Дані лікаря:</h4>
                            <input required placeholder="Ім’я" onChange={handleChange('first_name')} />
                            <input required placeholder="Прізвище" onChange={handleChange('last_name')} />
                            <input placeholder="По батькові" onChange={handleChange('middle_name')} />
                            <input required placeholder="Спеціалізація" onChange={handleChange('specialization')} />
                            <input required type="number" placeholder="Стаж (років)" onChange={handleChange('experience_years')} />
                            <input required placeholder="Номер ліцензії" onChange={handleChange('license_number')} />
                            <input required type="date" placeholder="Дата видачі ліцензії" onChange={handleChange('license_issued')} />
                            <input required placeholder="Освіта" onChange={handleChange('education')} />
                            <input required placeholder="Категорія" onChange={handleChange('category')} />
                            <input required placeholder="Телефон" onChange={handleChange('phone_number')} />
                            <input required type="email" placeholder="Email" onChange={handleChange('email')} />
                            <input required placeholder="Адреса" onChange={handleChange('address')} />
                        </>
                    )}

                    <br />
                    <button type="submit">Створити користувача</button>
                </form>
            </div>
        </>
    );
}

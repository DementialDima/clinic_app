


import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import AppHeader from '../components/Header';
import { getUserRole } from '../api/auth';

export default function AdminEditUserPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState('');

    useEffect(() => {
        if (getUserRole() !== 'ADMIN') {
            navigate('/');
        }

        axios.get(`/api/users/${id}/`)
            .then(res => {
                setUser(res.data);
                setRole(res.data.role);
                const profile = res.data[role.toLowerCase() + '_profile'] || {};
                setForm(profile);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id, navigate, role]);

    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                [`${role.toLowerCase()}_profile`]: form
            };
            await axios.patch(`/api/users/${id}/`, data);
            alert('✅ Дані оновлено!');
            navigate('/admin-panel');
        } catch (err) {
            alert('❌ Помилка оновлення!');
            console.error(err.response?.data || err);
        }
    };

    if (loading) return <p>Завантаження...</p>;
    if (!user) return <p>Користувача не знайдено</p>;

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>Редагування користувача #{user.id}</h2>
                <form onSubmit={handleSubmit}>
                    <p><strong>Логін:</strong> {user.username}</p>
                    <p><strong>Роль:</strong> {user.role}</p>

                    {role === 'PATIENT' ? (
                        <>
                            <input placeholder="Ім’я" value={form.first_name || ''} onChange={handleChange('first_name')} />
                            <input placeholder="Прізвище" value={form.last_name || ''} onChange={handleChange('last_name')} />
                            <input placeholder="По батькові" value={form.middle_name || ''} onChange={handleChange('middle_name')} />
                            <input type="date" value={form.birth_date || ''} onChange={handleChange('birth_date')} />
                            <select value={form.gender || ''} onChange={handleChange('gender')}>
                                <option value="">Стать</option>
                                <option value="MALE">Чоловіча</option>
                                <option value="FEMALE">Жіноча</option>
                            </select>
                            <input placeholder="Телефон" value={form.phone_number || ''} onChange={handleChange('phone_number')} />
                            <input placeholder="Адреса" value={form.address || ''} onChange={handleChange('address')} />
                            <input placeholder="ІНН" value={form.inn || ''} onChange={handleChange('inn')} />
                            <input placeholder="Номер медичної картки" value={form.medical_card_number || ''} onChange={handleChange('medical_card_number')} />
                        </>
                    ) : (
                        <>
                            <input placeholder="Ім’я" value={form.first_name || ''} onChange={handleChange('first_name')} />
                            <input placeholder="Прізвище" value={form.last_name || ''} onChange={handleChange('last_name')} />
                            <input placeholder="По батькові" value={form.middle_name || ''} onChange={handleChange('middle_name')} />
                            <input placeholder="Спеціалізація" value={form.specialization || ''} onChange={handleChange('specialization')} />
                            <input type="number" placeholder="Стаж" value={form.experience_years || ''} onChange={handleChange('experience_years')} />
                            <input placeholder="Номер ліцензії" value={form.license_number || ''} onChange={handleChange('license_number')} />
                            <input type="date" placeholder="Дата ліцензії" value={form.license_issued || ''} onChange={handleChange('license_issued')} />
                            <input placeholder="Освіта" value={form.education || ''} onChange={handleChange('education')} />
                            <input placeholder="Категорія" value={form.category || ''} onChange={handleChange('category')} />
                            <input placeholder="Телефон" value={form.phone_number || ''} onChange={handleChange('phone_number')} />
                            <input placeholder="Email" value={form.email || ''} onChange={handleChange('email')} />
                            <input placeholder="Адреса" value={form.address || ''} onChange={handleChange('address')} />
                        </>
                    )}

                    <br />
                    <button type="submit">💾 Зберегти зміни</button>
                </form>
            </div>
        </>
    );
}

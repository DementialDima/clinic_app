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
    const [profile, setProfile] = useState({});
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (getUserRole() !== 'ADMIN') {
            navigate('/');
        } else {
            fetchUser();
        }
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axios.get(`/api/users/${id}/`);
            setUser(response.data);
            setForm({
                username: response.data.username,
                email: response.data.email,
            });
            setRole(response.data.role);
            if (response.data.patient_profile) {
                setProfile(response.data.patient_profile);
            } else if (response.data.doctor_profile) {
                setProfile(response.data.doctor_profile);
            }
        } catch (err) {
            console.error('Помилка при завантаженні користувача', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
    };

    const handleProfileChange = (field) => (e) => {
        setProfile({ ...profile, [field]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                role,
            };

            if (role === 'PATIENT') {
                payload.patient_profile = profile;
            } else if (role === 'DOCTOR') {
                payload.doctor_profile = profile;
            }

            await axios.patch(`/api/users/${id}/`, payload);
            setMessage('✅ Дані користувача оновлено');
            setTimeout(() => navigate('/admin/users'), 1500);
        } catch (err) {
            console.error('❌ Помилка при оновленні:', err.response?.data || err);
            setMessage('❌ Помилка при оновленні');
        }
    };

    if (loading) return <div>Завантаження...</div>;

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>📝 Редагування користувача #{id}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        required
                        placeholder="Логін"
                        value={form.username || ''}
                        onChange={handleChange('username')}
                    />
                    <input
                        placeholder="Email"
                        type="email"
                        value={form.email || ''}
                        onChange={handleChange('email')}
                    />
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="PATIENT">Пацієнт</option>
                        <option value="DOCTOR">Лікар</option>
                        <option value="ADMIN">Адмін</option>
                    </select>

                    {role === 'PATIENT' && (
                        <>
                            <h4>Профіль пацієнта</h4>
                            <input placeholder="Ім’я" value={profile.first_name || ''} onChange={handleProfileChange('first_name')} />
                            <input placeholder="Прізвище" value={profile.last_name || ''} onChange={handleProfileChange('last_name')} />
                            <input placeholder="Номер телефону" value={profile.phone_number || ''} onChange={handleProfileChange('phone_number')} />
                            <input placeholder="Адреса" value={profile.address || ''} onChange={handleProfileChange('address')} />
                            <input placeholder="Номер медичної картки" value={profile.medical_card_number || ''} onChange={handleProfileChange('medical_card_number')} />
                        </>
                    )}

                    {role === 'DOCTOR' && (
                        <>
                            <h4>Профіль лікаря</h4>
                            <input placeholder="Ім’я" value={profile.first_name || ''} onChange={handleProfileChange('first_name')} />
                            <input placeholder="Прізвище" value={profile.last_name || ''} onChange={handleProfileChange('last_name')} />
                            <input placeholder="Спеціалізація" value={profile.specialization || ''} onChange={handleProfileChange('specialization')} />
                            <input placeholder="Телефон" value={profile.phone_number || ''} onChange={handleProfileChange('phone_number')} />
                            <input placeholder="Адреса" value={profile.address || ''} onChange={handleProfileChange('address')} />
                        </>
                    )}

                    <br />
                    <button type="submit">Зберегти зміни</button>
                </form>

                {message && <p>{message}</p>}
            </div>
        </>
    );
}

import { useEffect, useState } from 'react';
import axios from '../api/axios';
import AppHeader from '../components/Header';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoUrl, setPhotoUrl] = useState('');

    useEffect(() => {
        axios.get('/auth/users/me/')
            .then(res => {
                setUser(res.data);
                const doctorPhoto = res.data.doctor_profile?.photo;
                if (res.data.role === 'DOCTOR' && doctorPhoto) {
                    const isAbsolute = doctorPhoto.startsWith('http://') || doctorPhoto.startsWith('https://');
                    setPhotoUrl(isAbsolute ? doctorPhoto : `http://localhost:8000${doctorPhoto}`);
                }
            })

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

    const handleUploadPhoto = async (e) => {
        e.preventDefault();
        if (!photo) return;

        const formData = new FormData();
        formData.append('photo', photo);

        try {
            await axios.put('/api/doctors/profile/photo/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setPhotoUrl(URL.createObjectURL(photo));
            alert('📸 Фото успішно завантажено!');
        } catch (err) {
            alert('❌ Помилка при завантаженні фото');
        }
    };

    if (!user) return <p>Завантаження профілю...</p>;

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>Мій профіль</h2>
                <ul>
                    <li><strong>Ім’я користувача:</strong> {user.username}</li>

                    {user.role === 'DOCTOR' && user.doctor_profile && (
                        <>
                            <li><strong>Ім’я:</strong> {user.doctor_profile.first_name}</li>
                            <li><strong>Прізвище:</strong> {user.doctor_profile.last_name}</li>
                            <li><strong>Спеціалізація:</strong> {user.doctor_profile.specialization}</li>
                            <li><strong>Стаж:</strong> {user.doctor_profile.experience_years} років</li>
                            <li><strong>Номер ліцензії:</strong> {user.doctor_profile.license_number}</li>
                            <li><strong>Освіта:</strong> {user.doctor_profile.education}</li>
                            <li><strong>Категорія:</strong> {user.doctor_profile.category}</li>
                            <li><strong>Телефон:</strong> {user.doctor_profile.phone_number}</li>
                            <li><strong>Адреса:</strong> {user.doctor_profile.address}</li>
                            <li><strong>Email:</strong> {user.email || '—'}</li>

                            {photoUrl && (
                                <li>
                                    <strong>Фото:</strong><br />
                                    <img
                                        src={photoUrl}
                                        alt="Фото лікаря"
                                        style={{ width: 150, height: 'auto', marginTop: 10 }}
                                    />
                                </li>
                            )}

                            <li>
                                <form onSubmit={handleUploadPhoto}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setPhoto(e.target.files[0])}
                                        required
                                    />
                                    <button type="submit">📤 Завантажити фото</button>
                                </form>
                            </li>
                        </>
                    )}

                    {user.role === 'PATIENT' && user.patient_profile && (
                        <>
                            <li><strong>Ім’я:</strong> {user.patient_profile.first_name}</li>
                            <li><strong>Прізвище:</strong> {user.patient_profile.last_name}</li>
                            <li><strong>По батькові:</strong> {user.patient_profile.middle_name || '—'}</li>
                            <li><strong>Дата народження:</strong> {user.patient_profile.birth_date}</li>
                            <li><strong>Стать:</strong> {user.patient_profile.gender}</li>
                            <li><strong>Номер телефону:</strong> {user.patient_profile.phone_number}</li>
                            <li><strong>Адреса:</strong> {user.patient_profile.address}</li>
                            <li><strong>ІНН:</strong> {user.patient_profile.inn}</li>
                            <li><strong>Медична картка №:</strong> {user.patient_profile.medical_card_number}</li>
                            <li><strong>Email:</strong> {user.email || '—'}</li>
                        </>
                    )}

                    {user.role === 'ADMIN' && (
                        <>
                            <li><strong>Ім’я:</strong> {user.first_name || '—'}</li>
                            <li><strong>Прізвище:</strong> {user.last_name || '—'}</li>
                            <li><strong>Email:</strong> {user.email || '—'}</li>
                        </>
                    )}

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

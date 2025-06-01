import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axios';
import AppHeader from '../components/Header';
import { getUserRole } from '../api/auth';

export default function TreatmentFormPage() {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [form, setForm] = useState({
        diagnosis: '',
        procedure: '',
        recommendations: '',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!['ADMIN', 'DOCTOR'].includes(getUserRole())) {
            navigate('/');
        } else {
            fetchAppointment();
        }
    }, []);

    const fetchAppointment = async () => {
        try {
            const response = await axios.get(`/api/appointments/${appointmentId}/`);
            setAppointment(response.data);
        } catch (err) {
            console.error('❌ Помилка при завантаженні прийому', err);
            setMessage('❌ Прийом не знайдено');
        }
    };

    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/treatments/', {
                appointment: appointmentId,
                ...form,
            });
            setMessage('✅ Лікування додано!');
            setTimeout(() => navigate('/admin/appointments'), 1500);
        } catch (err) {
            console.error(err.response?.data || err);
            setMessage('❌ Помилка при збереженні лікування');
        }
    };

    const getFullName = (profile) => {
        if (!profile) return '—';
        return `${profile.last_name || ''} ${profile.first_name || ''} ${profile.middle_name || ''}`.trim();
    };

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>🩺 Додати лікування до прийому #{appointmentId}</h2>

                {appointment && (
                    <div style={{ marginBottom: 20 }}>
                        <p>
                            <strong>📅 Дата:</strong> {new Date(appointment.scheduled_time).toLocaleString()}<br />
                            <strong>🧑‍🦱 Пацієнт:</strong>{' '}
                            {getFullName(appointment.patient?.patient_profile) || appointment.patient?.username || 'Невідомо'}<br />
                            <strong>👨‍⚕️ Лікар:</strong>{' '}
                            {getFullName(appointment.doctor?.doctor_profile) || appointment.doctor?.username || 'Невідомо'}<br />
                            <strong>📄 Опис прийому:</strong> {appointment.description || 'Без опису'}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <label>Діагноз:</label>
                    <input required value={form.diagnosis} onChange={handleChange('diagnosis')} />

                    <label>Процедура:</label>
                    <input required value={form.procedure} onChange={handleChange('procedure')} />

                    <label>Рекомендації:</label>
                    <textarea value={form.recommendations} onChange={handleChange('recommendations')} />

                    <br />
                    <button type="submit">💾 Зберегти лікування</button>
                </form>

                {message && <p>{message}</p>}
            </div>
        </>
    );
}

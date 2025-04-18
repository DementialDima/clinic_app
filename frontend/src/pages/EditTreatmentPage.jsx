import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axios';
import AppHeader from '../components/Header';
import { getUserRole } from '../api/auth';

export default function EditTreatmentPage() {
    const { treatmentId } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        diagnosis: '',
        procedure: '',
        recommendations: '',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (getUserRole() !== 'ADMIN') {
            navigate('/');
        } else {
            fetchTreatment();
        }
    }, []);

    const fetchTreatment = async () => {
        try {
            const response = await axios.get(`/api/treatments/${treatmentId}/`);
            setForm({
                diagnosis: response.data.diagnosis,
                procedure: response.data.procedure,
                recommendations: response.data.recommendations || '',
            });
        } catch (err) {
            console.error('❌ Помилка при завантаженні лікування', err);
            setMessage('❌ Лікування не знайдено');
        }
    };

    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`/api/treatments/${treatmentId}/`, form);
            setMessage('✅ Лікування оновлено!');
            setTimeout(() => navigate('/admin/appointments'), 1500);
        } catch (err) {
            console.error(err.response?.data || err);
            setMessage('❌ Помилка при оновленні лікування');
        }
    };

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>✏️ Редагування лікування #{treatmentId}</h2>

                <form onSubmit={handleSubmit}>
                    <label>Діагноз:</label>
                    <input required value={form.diagnosis} onChange={handleChange('diagnosis')} />

                    <label>Процедура:</label>
                    <input required value={form.procedure} onChange={handleChange('procedure')} />

                    <label>Рекомендації:</label>
                    <textarea value={form.recommendations} onChange={handleChange('recommendations')} />

                    <br />
                    <button type="submit">💾 Зберегти зміни</button>
                </form>

                {message && <p>{message}</p>}
            </div>
        </>
    );
}

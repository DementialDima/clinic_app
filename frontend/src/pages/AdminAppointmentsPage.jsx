import { useEffect, useState } from 'react';
import axios from '../api/axios';
import AppHeader from '../components/Header';
import { getUserRole } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export default function AdminAppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [search, setSearch] = useState('');
    const [filtered, setFiltered] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (getUserRole() !== 'ADMIN') {
            navigate('/');
        } else {
            fetchAppointments();
        }
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get('/api/appointments/');
            setAppointments(response.data);
            setFiltered(response.data);
        } catch (err) {
            console.error('Помилка при завантаженні прийомів', err);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearch(value);
        const result = appointments.filter((appt) => {
            const patient = appt.patient?.first_name + ' ' + appt.patient?.last_name;
            const doctor = appt.doctor?.first_name + ' ' + appt.doctor?.last_name;
            return (
                patient.toLowerCase().includes(value) ||
                doctor.toLowerCase().includes(value) ||
                appt.description?.toLowerCase().includes(value)
            );
        });
        setFiltered(result);
    };

    const handleCancel = async (id) => {
        if (window.confirm('Справді скасувати цей прийом?')) {
            try {
                await axios.patch(`/api/appointments/${id}/cancel/`);
                fetchAppointments();
            } catch (err) {
                alert('❌ Помилка при скасуванні');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Видалити цей прийом назавжди?')) {
            try {
                await axios.delete(`/api/appointments/${id}/`);
                fetchAppointments();
            } catch (err) {
                alert('❌ Помилка при видаленні');
            }
        }
    };

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>📅 Всі прийоми</h2>

                <input
                    type="text"
                    placeholder="🔍 Пошук по пацієнту, лікарю, опису..."
                    value={search}
                    onChange={handleSearch}
                    style={{ padding: 8, width: '100%', marginBottom: 20 }}
                />

                <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr>
                        <th>Дата і час</th>
                        <th>Пацієнт</th>
                        <th>Лікар</th>
                        <th>Опис</th>
                        <th>Лікування</th>
                        <th>Дії</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map((appt) => (
                        <tr key={appt.id}>
                            <td>{new Date(appt.scheduled_time).toLocaleString()}</td>
                            <td>{appt.patient?.first_name} {appt.patient?.last_name}</td>
                            <td>{appt.doctor?.first_name} {appt.doctor?.last_name}</td>
                            <td>{appt.description}</td>
                            <td>
                                {appt.treatment ? (
                                    <span style={{ color: 'green' }}>✅ Є</span>
                                ) : (
                                    <span style={{ color: 'red' }}>⛔ Немає</span>
                                )}
                            </td>
                            <td>
                                {appt.treatment ? (
                                    <button onClick={() => navigate(`/treatments/${appt.treatment.id}/edit`)}>
                                        ✏️ Редагувати лікування
                                    </button>
                                ) : (
                                    <button onClick={() => navigate(`/appointments/${appt.id}/treatment`)}>
                                        ➕ Додати лікування
                                    </button>
                                )}

                                {appt.status !== 'CANCELLED' && (
                                    <button style={{ marginLeft: 5 }} onClick={() => handleCancel(appt.id)}>
                                        ❌ Скасувати
                                    </button>
                                )}

                                <button style={{ marginLeft: 5 }} onClick={() => handleDelete(appt.id)}>
                                    🗑 Видалити
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan="6">Немає записів</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

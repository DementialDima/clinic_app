import { useEffect, useState } from 'react';
import axios from '../api/axios';
import AppHeader from '../components/Header';
import { getUserRole } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export default function AdminAppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [search, setSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('');
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

    const applyFilters = (searchValue, dateValue) => {
        const result = appointments.filter((appt) => {
            const patient = appt.patient?.patient_profile
                ? appt.patient.patient_profile.first_name + ' ' + appt.patient.patient_profile.last_name
                : appt.patient?.username || '';
            const doctor = appt.doctor?.doctor_profile
                ? appt.doctor.doctor_profile.first_name + ' ' + appt.doctor.doctor_profile.last_name
                : appt.doctor?.username || '';
            const matchesSearch =
                patient.toLowerCase().includes(searchValue.toLowerCase()) ||
                doctor.toLowerCase().includes(searchValue.toLowerCase()) ||
                appt.description?.toLowerCase().includes(searchValue.toLowerCase());

            const matchesDate = dateValue
                ? appt.scheduled_time?.slice(0, 10) === dateValue
                : true;

            return matchesSearch && matchesDate;
        });

        setFiltered(result);
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        applyFilters(value, dateFilter);
    };

    const handleDateFilter = (e) => {
        const value = e.target.value;
        setDateFilter(value);
        applyFilters(search, value);
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
                    style={{ padding: 8, width: '60%', marginBottom: 10 }}
                />
                <input
                    type="date"
                    value={dateFilter}
                    onChange={handleDateFilter}
                    style={{ padding: 8, marginLeft: 10 }}
                />

                <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
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
                            <td>
                                {appt.patient?.patient_profile?.last_name} {appt.patient?.patient_profile?.first_name} <br />
                                <small>{appt.patient?.username}</small>
                            </td>
                            <td>
                                {appt.doctor?.doctor_profile?.last_name} {appt.doctor?.doctor_profile?.first_name} <br />
                                <small>{appt.doctor?.username}</small>
                            </td>
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

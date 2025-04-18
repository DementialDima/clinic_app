import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/Header';
import { getUserRole } from '../api/auth';

export default function AdminCreateAppointmentPage() {
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [form, setForm] = useState({
        patient: '',
        doctor: '',
        scheduled_time: '',
        end_time: '',
        description: '',
    });

    const [selectedDate, setSelectedDate] = useState('');
    const [doctorAppointments, setDoctorAppointments] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (getUserRole() !== 'ADMIN') {
            navigate('/');
        } else {
            fetchUsers();
        }
    }, []);

    useEffect(() => {
        if (form.doctor && selectedDate) {
            fetchDoctorAppointments();
        }
    }, [form.doctor, selectedDate]);

    const fetchUsers = async () => {
        try {
            const allUsers = await axios.get('/api/users/');
            setPatients(allUsers.data.filter((u) => u.role === 'PATIENT'));
            setDoctors(allUsers.data.filter((u) => u.role === 'DOCTOR'));
        } catch (err) {
            console.error('Помилка при завантаженні користувачів', err);
        }
    };

    const fetchDoctorAppointments = async () => {
        try {
            const res = await axios.get(`/api/appointments/?patient_id=&doctor=${form.doctor}`);
            const allAppointments = res.data;
            const filtered = allAppointments.filter(appt =>
                new Date(appt.scheduled_time).toISOString().startsWith(selectedDate)
            );
            setDoctorAppointments(filtered);
        } catch (err) {
            console.error('Помилка при завантаженні прийомів лікаря', err);
        }
    };

    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        setForm({ ...form, scheduled_time: '', end_time: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const start = new Date(form.scheduled_time);
            const end = new Date(form.end_time);

            if ((end - start) / 60000 < 30) {
                setMessage('❌ Мінімальний час прийому — 30 хвилин');
                return;
            }

            if (
                start.getHours() < 9 ||
                end.getHours() > 17 ||
                (end.getHours() === 17 && end.getMinutes() > 0)
            ) {
                setMessage('❌ Прийоми дозволені тільки з 9:00 до 17:00');
                return;
            }

            await axios.post('/api/appointments/', {
                patient: form.patient,
                doctor: form.doctor,
                scheduled_time: form.scheduled_time,
                end_time: form.end_time,
                description: form.description,
            });

            setMessage('✅ Прийом успішно створено!');
            setTimeout(() => navigate('/appointments'), 1500);
        } catch (err) {
            console.error(err.response?.data || err);
            setMessage('❌ Помилка при створенні прийому');
        }
    };

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>📅 Створення прийому</h2>
                <form onSubmit={handleSubmit}>
                    <label>Пацієнт:</label>
                    <select required value={form.patient} onChange={handleChange('patient')}>
                        <option value="">Оберіть пацієнта</option>
                        {patients.map((p) => (
                            <option key={p.id} value={p.id}>{p.username}</option>
                        ))}
                    </select>

                    <label>Лікар:</label>
                    <select required value={form.doctor} onChange={handleChange('doctor')}>
                        <option value="">Оберіть лікаря</option>
                        {doctors.map((d) => (
                            <option key={d.id} value={d.id}>{d.username}</option>
                        ))}
                    </select>

                    <label>Дата прийому:</label>
                    <input
                        type="date"
                        required
                        value={selectedDate}
                        onChange={handleDateChange}
                    />

                    <label>Час початку:</label>
                    <input
                        type="datetime-local"
                        required
                        value={form.scheduled_time}
                        onChange={handleChange('scheduled_time')}
                    />

                    <label>Час завершення:</label>
                    <input
                        type="datetime-local"
                        required
                        value={form.end_time}
                        onChange={handleChange('end_time')}
                    />

                    <label>Опис прийому:</label>
                    <textarea
                        required
                        value={form.description}
                        onChange={handleChange('description')}
                    />

                    <br />
                    <button type="submit">Створити прийом</button>
                </form>

                {message && <p>{message}</p>}

                {doctorAppointments.length > 0 && (
                    <>
                        <h3 style={{ marginTop: 30 }}>Прийоми лікаря на {selectedDate}</h3>
                        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr>
                                <th>Час</th>
                                <th>Пацієнт</th>
                                <th>Опис</th>
                            </tr>
                            </thead>
                            <tbody>
                            {doctorAppointments.map(appt => (
                                <tr key={appt.id}>
                                    <td>{new Date(appt.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>{appt.patient?.first_name} {appt.patient?.last_name}</td>
                                    <td>{appt.description}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </>
    );
}

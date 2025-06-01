import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import AppHeader from '../components/Header';
import { getUserRole } from '../api/auth';
import AppointmentCalendar from '../components/AppointmentCalendar';
import AsyncSelect from 'react-select/async';

export default function AdminCreateAppointmentPage() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [form, setForm] = useState({
        doctor: '',
        patient: '',
        scheduled_time: '',
        end_time: '',
        description: '',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (getUserRole() !== 'ADMIN') {
            navigate('/');
        } else {
            fetchUsers();
        }
    }, []);

    useEffect(() => {
        if (form.doctor) fetchAppointments();
    }, [form.doctor]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/users/');
            setDoctors(res.data.filter(u => u.role === 'DOCTOR'));
            setPatients(res.data.filter(u => u.role === 'PATIENT'));
        } catch (err) {
            console.error('❌ Помилка при завантаженні користувачів', err);
        }
    };

    const fetchAppointments = async () => {
        try {
            const res = await axios.get('/api/appointments/?doctor_id=' + form.doctor);
            setAppointments(res.data);
        } catch (err) {
            console.error('❌ Помилка при завантаженні прийомів', err);
        }
    };

    const handleSlotSelect = (startStr, endStr) => {
        setForm({ ...form, scheduled_time: startStr, end_time: endStr });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/appointments/', form);
            setMessage('✅ Прийом створено');
            setTimeout(() => navigate('/appointments'), 1500);
        } catch (err) {
            console.error(err.response?.data || err);
            setMessage('❌ Помилка при створенні прийому');
        }
    };

    const doctorOptions = doctors.map(d => ({
        value: d.id,
        label: `${d.doctor_profile?.last_name} ${d.doctor_profile?.first_name} (${d.username})`
    }));

    const patientOptions = patients.map(p => ({
        value: p.id,
        label: `${p.patient_profile?.last_name} ${p.patient_profile?.first_name} (${p.username})`
    }));

    const loadDoctors = (inputValue, callback) => {
        const filtered = doctorOptions.filter(d =>
            d.label.toLowerCase().includes(inputValue.toLowerCase())
        );
        callback(filtered);
    };

    const loadPatients = (inputValue, callback) => {
        const filtered = patientOptions.filter(p =>
            p.label.toLowerCase().includes(inputValue.toLowerCase())
        );
        callback(filtered);
    };

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>📅 Створення прийому</h2>
                <form onSubmit={handleSubmit}>
                    <label>Пацієнт:</label>
                    <AsyncSelect
                        cacheOptions
                        defaultOptions={patientOptions}
                        loadOptions={loadPatients}
                        value={patientOptions.find(opt => opt.value === form.patient) || null}
                        onChange={option => setForm({ ...form, patient: option?.value })}
                        placeholder="🔍 Виберіть пацієнта..."
                    />

                    <label>Лікар:</label>
                    <AsyncSelect
                        cacheOptions
                        defaultOptions={doctorOptions}
                        loadOptions={loadDoctors}
                        value={doctorOptions.find(opt => opt.value === form.doctor) || null}
                        onChange={option => setForm({ ...form, doctor: option?.value })}
                        placeholder="🔍 Виберіть лікаря..."
                    />

                    <label>Опис:</label>
                    <textarea
                        required
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder="Наприклад: Консультація, пломба, огляд..."
                    />

                    <br />
                    <button type="submit">Створити прийом</button>
                </form>

                {message && <p>{message}</p>}

                {form.doctor && (
                    <AppointmentCalendar
                        appointments={appointments}
                        onSlotSelect={handleSlotSelect}
                    />
                )}
            </div>
        </>
    );
}

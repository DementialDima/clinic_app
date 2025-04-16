import { useEffect, useState } from 'react';
import axios from '../api/axios';
import AppHeader from '../components/Header';
import NewAppointmentForm from '../components/NewAppointmentForm';
import AppointmentItem from '../components/AppointmentItem';
import CalendarView from '../components/CalendarView';
import { isPatient, isDoctor, isAdmin } from '../api/auth';
import { Link } from 'react-router-dom';

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState([]);

    const fetchAppointments = () => {
        axios.get('/api/appointments/')
            .then(res => setAppointments(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    // Унікальні пацієнти для лікаря
    const uniquePatients = [...new Map(
        appointments.map(a => [a.patient.id, a.patient])
    ).values()];

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>Мої прийоми</h2>

                {/* 📅 Календар прийомів */}
                <CalendarView appointments={appointments} />

                {/* 📝 Список прийомів */}
                <ul>
                    {appointments.map(appt => (
                        <AppointmentItem
                            key={appt.id}
                            appointment={appt}
                            onUpdated={fetchAppointments}
                        />
                    ))}
                </ul>

                {/* ➕ Пацієнт: створення прийому */}
                {isPatient() && (
                    <NewAppointmentForm onCreated={fetchAppointments} />
                )}

                {/* 👨‍⚕️ Лікар: список пацієнтів */}
                {isDoctor() && (
                    <>
                        <h3>Пацієнти:</h3>
                        <ul>
                            {uniquePatients.map(patient => (
                                <li key={patient.id}>
                                    {patient.username} —
                                    <Link to={`/patients/${patient.id}/history`} style={{ marginLeft: 10 }}>
                                        Переглянути історію
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {/* 🧑‍💼 Адмін */}
                {isAdmin() && (
                    <p>🧑‍💼 Ви маєте адміністративний доступ</p>
                )}
            </div>
        </>
    );
}

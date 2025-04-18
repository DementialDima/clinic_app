import { useEffect, useState } from 'react';
import axios from '../api/axios';
import AppHeader from '../components/Header';
import NewAppointmentForm from '../components/NewAppointmentForm';
import AppointmentItem from '../components/AppointmentItem';
import { isPatient, isDoctor, isAdmin, getUserRole } from '../api/auth';
import { Link } from 'react-router-dom';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';

const localizer = momentLocalizer(moment);

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [filteredAppointments, setFilteredAppointments] = useState([]);

    const fetchAppointments = () => {
        axios.get('/api/appointments/')
            .then(res => setAppointments(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleDateClick = (date) => {
        const clicked = moment(date).startOf('day');
        setSelectedDate(clicked);

        const filtered = appointments.filter(appt =>
            moment(appt.scheduled_time).isSame(clicked, 'day')
        );
        setFilteredAppointments(filtered);
    };

    const uniquePatients = [...new Map(
        appointments.map(a => [a.patient.id, a.patient])
    ).values()];

    const events = appointments.map(appt => ({
        title: `${appt.doctor?.first_name} (${appt.patient?.first_name})`,
        start: new Date(appt.scheduled_time),
        end: new Date(appt.end_time || appt.scheduled_time),
    }));

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>Мої прийоми</h2>

                {/* 📅 Календар прийомів */}
                <Calendar
                    localizer={localizer}
                    events={events}
                    style={{ height: 500, marginBottom: 20 }}
                    onSelectSlot={(slotInfo) => handleDateClick(slotInfo.start)}
                    selectable
                />

                {selectedDate && isAdmin() && (
                    <>
                        <h3>📋 Прийоми на {selectedDate.format('YYYY-MM-DD')}</h3>

                        {filteredAppointments.length === 0 ? (
                            <p>Немає прийомів на цю дату.</p>
                        ) : (
                            <table border="1" cellPadding={6} style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                <tr>
                                    <th>👨‍⚕️ Лікар</th>
                                    <th>🧑‍🦱 Пацієнт</th>
                                    <th>🕒 Година</th>
                                    <th>📄 Опис</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredAppointments.map((appt) => (
                                    <tr key={appt.id}>
                                        <td>{appt.doctor?.last_name} {appt.doctor?.first_name}</td>
                                        <td>{appt.patient?.last_name} {appt.patient?.first_name}</td>
                                        <td>{moment(appt.scheduled_time).format('HH:mm')}</td>
                                        <td>{appt.description}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}

                {selectedDate && isDoctor() && (
                    <>
                        <h3>📋 Прийоми на {selectedDate.format('YYYY-MM-DD')}</h3>

                        {filteredAppointments.length === 0 ? (
                            <p>Немає прийомів на цю дату.</p>
                        ) : (
                            <table border="1" cellPadding={6} style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                <tr>
                                    <th>🧑‍🦱 Пацієнт</th>
                                    <th>🕒 Година</th>
                                    <th>📄 Опис</th>
                                    <th>🔧 Дії</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredAppointments.map((appt) => (
                                    <tr key={appt.id}>
                                        <td>{appt.patient?.last_name} {appt.patient?.first_name}</td>
                                        <td>{moment(appt.scheduled_time).format('HH:mm')}</td>
                                        <td>{appt.description}</td>
                                        <td>
                                            {appt.treatment ? (
                                                <button onClick={() => window.location.href = `/treatments/${appt.treatment.id}/edit`}>
                                                    ✏️ Редагувати
                                                </button>
                                            ) : (
                                                <button onClick={() => window.location.href = `/appointments/${appt.id}/treatment`}>
                                                    ➕ Додати
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}




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

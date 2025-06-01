import { useEffect, useState } from 'react';
import axios from '../api/axios';
import AppHeader from '../components/Header';
import AppointmentItem from '../components/AppointmentItem';
import { isPatient, isDoctor, isAdmin } from '../api/auth';
import { Link } from 'react-router-dom';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';

const localizer = momentLocalizer(moment);

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [search, setSearch] = useState('');

    const currentUser = JSON.parse(localStorage.getItem('user'));

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

        const filtered = appointments.filter(appt => {
            const apptDate = moment(appt.scheduled_time).startOf('day');
            return apptDate.isSame(clicked, 'day');
        });
        setFilteredAppointments(filtered);
    };

    const uniquePatients = [...new Map(
        appointments.map(a => [a.patient.id, a.patient])
    ).values()];

    const filteredPatients = uniquePatients.filter(p => {
        const fullName = `${p.patient_profile?.last_name ?? ''} ${p.patient_profile?.first_name ?? ''} ${p.username}`.toLowerCase();
        return fullName.includes(search.toLowerCase());
    });

    const events = appointments.map(appt => {
        const doctorName = appt.doctor?.doctor_profile
            ? `${appt.doctor.doctor_profile.first_name} ${appt.doctor.doctor_profile.last_name}`
            : appt.doctor?.username || 'Лікар';

        const patientName = appt.patient?.patient_profile
            ? `${appt.patient.patient_profile.first_name} ${appt.patient.patient_profile.last_name}`
            : appt.patient?.username || 'Пацієнт';

        return {
            title: `${doctorName} (${patientName})`,
            start: new Date(appt.scheduled_time),
            end: new Date(appt.end_time || appt.scheduled_time),
        };
    });

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>Мої прийоми</h2>

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
                                        <td>
                                            {appt.doctor?.doctor_profile?.last_name} {appt.doctor?.doctor_profile?.first_name}
                                        </td>
                                        <td>
                                            {appt.patient?.patient_profile?.last_name} {appt.patient?.patient_profile?.first_name}
                                        </td>
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
                                        <td>{appt.patient?.patient_profile?.last_name} {appt.patient?.patient_profile?.first_name}</td>
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

                {selectedDate && isPatient() && (
                    <>
                        <h3>📋 Мої записи на {selectedDate.format('YYYY-MM-DD')}</h3>
                        {filteredAppointments.filter(appt => Number(appt.patient?.id) === Number(currentUser?.id)).length === 0 ? (
                            <p>Немає записів на цю дату.</p>
                        ) : (
                            <table border="1" cellPadding={6} style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                <tr>
                                    <th>👨‍⚕️ Лікар</th>
                                    <th>🕒 Година</th>
                                    <th>📄 Опис</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredAppointments
                                    .filter(appt => Number(appt.patient?.id) === Number(currentUser?.id))
                                    .map(appt => (
                                        <tr key={appt.id}>
                                            <td>{appt.doctor?.doctor_profile?.last_name} {appt.doctor?.doctor_profile?.first_name}</td>
                                            <td>{moment(appt.scheduled_time).format('HH:mm')}</td>
                                            <td>{appt.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}

                {isDoctor() && (
                    <>
                        <h3>Пацієнти:</h3>
                        <input
                            type="text"
                            placeholder="🔍 Пошук пацієнта..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ padding: 8, width: '100%', marginBottom: 10 }}
                        />
                        <ul>
                            {filteredPatients.map(patient => (
                                <li key={patient.id}>
                                    {patient.patient_profile?.last_name} {patient.patient_profile?.first_name} ({patient.username})
                                    <Link to={`/patients/${patient.id}/history`} style={{ marginLeft: 10 }}>
                                        Переглянути історію
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {isAdmin() && (
                    <p>🧑‍💼 Ви маєте адміністративний доступ</p>
                )}
            </div>
        </>
    );
}

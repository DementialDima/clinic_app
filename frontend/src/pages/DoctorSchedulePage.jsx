import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { getUserRole } from '../api/auth';
import AppHeader from '../components/Header';
import axios from '../api/axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

const localizer = momentLocalizer(moment);

export default function DoctorSchedulePage() {
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (getUserRole() !== 'DOCTOR') {
            navigate('/');
        } else {
            fetchAppointments();
        }
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await axios.get('/api/appointments/');
            const mapped = res.data.map(appt => ({
                id: appt.id,
                title: `${appt.patient?.first_name} ${appt.patient?.last_name}`,
                start: new Date(appt.scheduled_time),
                end: new Date(appt.end_time),
                desc: appt.description,
            }));
            setEvents(mapped);
        } catch (err) {
            console.error('❌ Помилка при завантаженні календаря', err);
        }
    };

    const handleSelectEvent = (event) => {
        alert(`Прийом з пацієнтом: ${event.title}\n\nОпис: ${event.desc}`);
    };

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>📅 Календар прийомів</h2>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600 }}
                    views={['day', 'week', 'agenda']}
                    onSelectEvent={handleSelectEvent}
                    messages={{
                        next: "Наступний",
                        previous: "Попередній",
                        today: "Сьогодні",
                        month: "Місяць",
                        week: "Тиждень",
                        day: "День",
                        agenda: "Список",
                        date: "Дата",
                        time: "Час",
                        event: "Подія",
                        noEventsInRange: "Немає прийомів у вибраному діапазоні",
                    }}
                />
            </div>
        </>
    );
}

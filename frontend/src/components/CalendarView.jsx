import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useState } from 'react';

export default function CalendarView({ appointments }) {
    const [value, setValue] = useState(new Date());

    // Дати, на які є прийоми
    const appointmentDates = appointments.map(appt =>
        new Date(appt.scheduled_time).toDateString()
    );

    const selectedAppointments = appointments.filter(appt => {
        const apptDate = new Date(appt.scheduled_time);
        return apptDate.toDateString() === value.toDateString();
    });

    return (
        <div style={{ marginTop: 30 }}>
            <h3>Календар прийомів</h3>
            <Calendar
                onChange={setValue}
                value={value}
                tileContent={({ date, view }) => {
                    if (view === 'month' && appointmentDates.includes(date.toDateString())) {
                        return <div style={{ color: 'green', fontSize: 18 }}>•</div>;
                    }
                }}
            />

            {selectedAppointments.length > 0 ? (
                <ul style={{ marginTop: 10 }}>
                    {selectedAppointments.map(appt => (
                        <li key={appt.id}>
                            {appt.scheduled_time.slice(11, 16)} — {appt.doctor.username} ({appt.patient.username})
                        </li>
                    ))}
                </ul>
            ) : (
                <p style={{ marginTop: 10 }}>На цю дату немає прийомів</p>
            )}
        </div>
    );
}

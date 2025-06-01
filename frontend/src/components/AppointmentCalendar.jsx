import React from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ukLocale from '@fullcalendar/core/locales/uk';

export default function AppointmentCalendar({ appointments, onSlotSelect }) {
    return (
        <div style={{ padding: 20 }}>
            <h3>🕒 Календар доступності лікаря</h3>
            <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                allDaySlot={false}
                selectable={true}
                selectMirror={true}
                locale={ukLocale}
                slotMinTime="09:00:00"
                slotMaxTime="17:00:00"
                slotDuration="00:30:00"
                slotLabelInterval="00:30:00"
                eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                dayHeaderContent={({ date }) => {
                    const daysUA = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
                    return daysUA[date.getDay()];
                }}
                height="auto"
                select={(info) => {
                    const day = info.start.getDay();
                    if (day === 0 || day === 6) {
                        alert('❌ Прийоми дозволені лише з понеділка по пʼятницю.');
                        return;
                    }
                    onSlotSelect(info.startStr, info.endStr);
                }}
                events={appointments.map(appt => {
                    const isTemporary = !appt.id;
                    return {
                        id: appt.id || '',
                        title: `🟥 ${appt.description || 'Без опису'}`,
                        start: appt.scheduled_time || appt.start,
                        end: appt.end_time || appt.end,
                        backgroundColor: '#f44336',
                        textColor: '#ffffff',
                        borderColor: '#c62828',
                        display: 'block',
                        editable: false,
                        extendedProps: {
                            patient: appt.patient?.patient_profile
                                ? `${appt.patient.patient_profile.last_name} ${appt.patient.patient_profile.first_name}`
                                : appt.patient?.username || appt.patient || 'Невідомо',
                            description: appt.description || 'Без опису',
                            isTemporary
                        }
                    };
                })}
                eventDidMount={({ el, event }) => {
                    if (!event.id || event.extendedProps.isTemporary) return;

                    const tooltip = document.createElement('div');
                    tooltip.innerHTML = `
                        <div><strong>Пацієнт:</strong> ${event.extendedProps.patient}</div>
                        <div><strong>Опис:</strong> ${event.extendedProps.description}</div>
                    `;
                    Object.assign(tooltip.style, {
                        position: 'absolute',
                        background: '#222',
                        color: '#fff',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        fontSize: '0.95em',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        whiteSpace: 'normal',
                        display: 'none',
                        zIndex: 1000,
                        opacity: 0,
                        transition: 'opacity 0.2s ease-in-out',
                        pointerEvents: 'none',
                        maxWidth: '280px',
                        textAlign: 'left',
                        lineHeight: '1.4'
                    });
                    document.body.appendChild(tooltip);

                    el.addEventListener('mouseenter', e => {
                        tooltip.style.left = e.pageX + 12 + 'px';
                        tooltip.style.top = e.pageY + 12 + 'px';
                        tooltip.style.display = 'block';
                        requestAnimationFrame(() => {
                            tooltip.style.opacity = 1;
                        });
                    });

                    el.addEventListener('mousemove', e => {
                        tooltip.style.left = e.pageX + 12 + 'px';
                        tooltip.style.top = e.pageY + 12 + 'px';
                    });

                    el.addEventListener('mouseleave', () => {
                        tooltip.style.opacity = 0;
                        setTimeout(() => {
                            tooltip.style.display = 'none';
                        }, 200);
                    });
                }}
            />
        </div>
    );
}

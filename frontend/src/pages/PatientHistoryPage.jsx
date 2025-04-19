import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import AppHeader from '../components/Header';
import { getUserRole } from '../api/auth';

export default function PatientHistoryPage() {
    const { id: paramId } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('access');

    const id = paramId || user?.id;

    const [appointments, setAppointments] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const role = getUserRole();
        if (role === 'PATIENT' && paramId) {
            // Пацієнт не має дивитись чужу історію
            navigate('/');
        } else {
            fetchAppointments();
        }
    }, [id]);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(`/api/appointments/?patient_id=${id}`);
            setAppointments(response.data);
        } catch (err) {
            console.error('❌ Помилка при завантаженні прийомів', err);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await axios.get(`/api/patients/${id}/history/pdf/`, {
                responseType: 'blob',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `history_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('❌ Помилка завантаження PDF', error);
            setMessage('Не вдалося завантажити PDF');
        }
    };

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>📖 Історія лікування пацієнта #{id}</h2>

                <button onClick={handleDownloadPDF} style={{ marginBottom: 20 }}>
                    📄 Завантажити PDF
                </button>

                {message && <p style={{ color: 'red' }}>{message}</p>}

                {appointments.length === 0 ? (
                    <p>Немає прийомів.</p>
                ) : (
                    <ul style={{ paddingLeft: 0 }}>
                        {appointments.map((appt) => (
                            <li key={appt.id} style={{ marginBottom: 25, listStyle: 'none' }}>
                                <b>{new Date(appt.scheduled_time).toLocaleString()}</b> — {appt.doctor?.first_name} {appt.doctor?.last_name}
                                <br />
                                <i>{appt.description}</i>

                                {appt.treatment ? (
                                    <details style={{ marginTop: 5 }}>
                                        <summary>🩺 Деталі лікування</summary>
                                        <p><strong>Діагноз:</strong> {appt.treatment.diagnosis}</p>
                                        <p><strong>Процедура:</strong> {appt.treatment.procedure}</p>
                                        <p><strong>Рекомендації:</strong> {appt.treatment.recommendations || '—'}</p>
                                    </details>
                                ) : (
                                    <p style={{ color: 'gray' }}>❌ Лікування ще не додано</p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import AppHeader from '../components/Header';

export default function PatientHistoryPage() {
    const { id } = useParams(); // ID пацієнта
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        axios.get(`/api/appointments/?patient_id=${id}`)
            .then(res => setAppointments(res.data))
            .catch(err => console.error(err));
    }, [id]);

    const handleDownloadPDF = async () => {
        const token = localStorage.getItem('access');
        try {
            const response = await fetch(`http://localhost:8000/api/patients/${id}/history/pdf/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                alert("❌ Помилка завантаження PDF");
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            alert("❌ Сталася помилка під час завантаження PDF");
            console.error(error);
        }
    };

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>Історія лікування пацієнта #{id}</h2>

                <button onClick={handleDownloadPDF}>📄 Завантажити PDF</button>

                {appointments.length === 0 ? (
                    <p>Немає прийомів.</p>
                ) : (
                    <ul>
                        {appointments.map(appt => (
                            <li key={appt.id} style={{ marginBottom: 20 }}>
                                <b>{appt.scheduled_time}</b> — {appt.doctor.username}
                                <br />
                                <p>{appt.description}</p>

                                {appt.treatment ? (
                                    <details>
                                        <summary>🩺 Лікування</summary>
                                        <p><strong>Діагноз:</strong> {appt.treatment.diagnosis}</p>
                                        <p><strong>Процедура:</strong> {appt.treatment.procedure}</p>
                                        <p><strong>Рекомендації:</strong> {appt.treatment.recommendations}</p>
                                    </details>
                                ) : (
                                    <p>❌ Лікування не додано</p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}

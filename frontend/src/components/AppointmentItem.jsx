import { useState } from 'react';
import axios from '../api/axios';
import { isPatient, isDoctor } from '../api/auth';

export default function AppointmentItem({ appointment, onUpdated }) {
    const [editing, setEditing] = useState(false);
    const [datetime, setDatetime] = useState(appointment.scheduled_time);
    const [description, setDescription] = useState(appointment.description);

    // 👇 Для лікування
    const [showTreatmentForm, setShowTreatmentForm] = useState(false);
    const [diagnosis, setDiagnosis] = useState('');
    const [procedure, setProcedure] = useState('');
    const [recommendations, setRecommendations] = useState('');

    const handleDelete = () => {
        if (window.confirm("Видалити цей прийом?")) {
            axios.delete(`/api/appointments/${appointment.id}/`)
                .then(onUpdated)
                .catch(err => console.error(err));
        }
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        axios.put(`/api/appointments/${appointment.id}/`, {
            doctor: appointment.doctor.id,
            scheduled_time: datetime,
            description: description,
        })
            .then(() => {
                setEditing(false);
                onUpdated();
            })
            .catch(err => console.error(err));
    };

    const handleAddTreatment = (e) => {
        e.preventDefault();
        axios.post('/api/treatments/', {
            appointment: appointment.id,
            diagnosis,
            procedure,
            recommendations
        })
            .then(() => {
                setDiagnosis('');
                setProcedure('');
                setRecommendations('');
                setShowTreatmentForm(false);
                onUpdated();
            })
            .catch(err => {
                alert('❌ Помилка при збереженні лікування');
                console.error(err);
            });
    };

    return (
        <li style={{ marginBottom: 20 }}>
            {!editing ? (
                <>
                    <b>{appointment.scheduled_time}</b> — {appointment.doctor.username}
                    <br />
                    <p>{appointment.description}</p>

                    {appointment.treatment ? (
                        <details>
                            <summary>🩺 Історія лікування</summary>
                            <p><strong>Діагноз:</strong> {appointment.treatment.diagnosis}</p>
                            <p><strong>Процедура:</strong> {appointment.treatment.procedure}</p>
                            <p><strong>Рекомендації:</strong> {appointment.treatment.recommendations || '—'}</p>
                        </details>
                    ) : (
                        isDoctor() && (
                            <div style={{ marginTop: 10 }}>
                                {!showTreatmentForm ? (
                                    <button onClick={() => setShowTreatmentForm(true)}>➕ Додати історію лікування</button>
                                ) : (
                                    <form onSubmit={handleAddTreatment}>
                                        <h4>Історія лікування</h4>
                                        <input
                                            placeholder="Діагноз"
                                            value={diagnosis}
                                            onChange={(e) => setDiagnosis(e.target.value)}
                                            required
                                        />
                                        <input
                                            placeholder="Процедура"
                                            value={procedure}
                                            onChange={(e) => setProcedure(e.target.value)}
                                            required
                                        />
                                        <textarea
                                            placeholder="Рекомендації"
                                            value={recommendations}
                                            onChange={(e) => setRecommendations(e.target.value)}
                                        />
                                        <br />
                                        <button type="submit">Зберегти лікування</button>
                                        <button type="button" onClick={() => setShowTreatmentForm(false)} style={{ marginLeft: 8 }}>
                                            Скасувати
                                        </button>
                                    </form>
                                )}
                            </div>
                        )
                    )}

                    {isPatient() && (
                        <div style={{ marginTop: 10 }}>
                            <button onClick={() => setEditing(true)}>Редагувати</button>
                            <button onClick={handleDelete} style={{ marginLeft: 8 }}>Скасувати</button>
                        </div>
                    )}
                </>
            ) : (
                <form onSubmit={handleUpdate}>
                    <input
                        type="datetime-local"
                        value={datetime.slice(0, 16)}
                        onChange={(e) => setDatetime(e.target.value)}
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <button type="submit">Зберегти</button>
                    <button type="button" onClick={() => setEditing(false)}>Скасувати</button>
                </form>
            )}
        </li>
    );
}

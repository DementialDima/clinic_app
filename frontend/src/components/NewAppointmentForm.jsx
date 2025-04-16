import { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function NewAppointmentForm({ onCreated }) {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [datetime, setDatetime] = useState('');
    const [description, setDescription] = useState('');

    // завантажити список лікарів
    useEffect(() => {
        axios.get('/api/doctors/')
            .then(res => setDoctors(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.post('/api/appointments/', {
            doctor_id: selectedDoctor,
            scheduled_time: datetime,
            description: description
        }).then(res => {
            alert('Прийом створено ✅');
            setSelectedDoctor('');
            setDatetime('');
            setDescription('');
            onCreated(); // оновити список прийомів
        }).catch(err => {
            alert('Помилка при створенні');
            console.error(err);
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Запис на прийом</h3>
            <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} required>
                <option value="">Оберіть лікаря</option>
                {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                        {doc.username}
                    </option>
                ))}
            </select>
            <input
                type="datetime-local"
                value={datetime}
                onChange={e => setDatetime(e.target.value)}
                required
            />
            <textarea
                placeholder="Опис"
                value={description}
                onChange={e => setDescription(e.target.value)}
            />
            <button type="submit">Записатись</button>
        </form>
    );
}

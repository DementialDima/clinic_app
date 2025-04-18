import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { getUserRole } from '../api/auth';
import AppHeader from '../components/Header';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, ResponsiveContainer
} from 'recharts';

export default function AdminStatsPage() {
    const [appointments, setAppointments] = useState([]);
    const [doctorStats, setDoctorStats] = useState([]);
    const [treatmentStats, setTreatmentStats] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (getUserRole() !== 'ADMIN') {
            navigate('/');
        } else {
            fetchAppointments();
        }
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await axios.get('/api/appointments/');
            setAppointments(res.data);
            processStats(res.data);
        } catch (err) {
            console.error('❌ Помилка при завантаженні статистики', err);
        }
    };

    const processStats = (data) => {
        // 1. Графік: кількість прийомів на лікаря
        const doctorCount = {};
        const treatmentCount = { with: 0, without: 0 };

        data.forEach(appt => {
            const name = appt.doctor?.first_name + ' ' + appt.doctor?.last_name;
            if (name in doctorCount) {
                doctorCount[name]++;
            } else {
                doctorCount[name] = 1;
            }

            if (appt.treatment) {
                treatmentCount.with++;
            } else {
                treatmentCount.without++;
            }
        });

        setDoctorStats(
            Object.entries(doctorCount).map(([name, count]) => ({ name, count }))
        );

        setTreatmentStats([
            { name: 'З лікуванням', value: treatmentCount.with },
            { name: 'Без лікування', value: treatmentCount.without },
        ]);
    };

    const COLORS = ['#82ca9d', '#ff7f7f'];

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>📊 Статистика клініки</h2>

                <h3>👨‍⚕️ Прийоми по лікарях</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={doctorStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" name="Кількість прийомів" />
                    </BarChart>
                </ResponsiveContainer>

                <h3 style={{ marginTop: 50 }}>🩺 Лікування на прийомах</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={treatmentStats}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label
                        >
                            {treatmentStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </>
    );
}

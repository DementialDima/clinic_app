import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import AppHeader from '../components/Header';
import { getUserRole } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const ROLES = ['ADMIN', 'DOCTOR', 'PATIENT'];

export default function AdminPanelPage() {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (getUserRole() !== 'ADMIN') {
            navigate('/');
        } else {
            fetchUsers();
        }
    }, []);

    const fetchUsers = () => {
        axios.get('/api/users/')
            .then(res => setUsers(res.data))
            .catch(err => console.error(err));
    };

    const handleRoleChange = (userId, newRole) => {
        axios.patch(`/api/users/${userId}/role/`, { role: newRole })
            .then(() => {
                setMessage('✅ Роль змінено!');
                fetchUsers();
            })
            .catch(() => {
                setMessage('❌ Не вдалося змінити роль.');
            });
    };

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>👨‍💼 Панель адміністратора</h2>

                {message && <p style={{ color: message.startsWith('✅') ? 'green' : 'red' }}>{message}</p>}

                <table border="1" cellPadding={6} style={{ width: '100%', marginTop: 20 }}>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Ім’я користувача</th>
                        <th>Email</th>
                        <th>Поточна роль</th>
                        <th>Змінити роль</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email || '—'}</td>
                            <td>{user.role}</td>
                            <td>
                                <select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                >
                                    {ROLES.map(role => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

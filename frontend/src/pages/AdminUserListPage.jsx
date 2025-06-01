import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import AppHeader from '../components/Header';
import { getUserRole } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const ROLES = ['ALL', 'ADMIN', 'DOCTOR', 'PATIENT'];

export default function AdminUserList() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        if (getUserRole() !== 'ADMIN') {
            navigate('/');
        } else {
            fetchUsers();
        }
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/users/');
            setUsers(res.data);
            setFilteredUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearch(value);
        filterUsers(value, roleFilter);
    };

    const handleRoleFilter = (e) => {
        const value = e.target.value;
        setRoleFilter(value);
        filterUsers(search, value);
    };

    const filterUsers = (searchTerm, role) => {
        const filtered = users.filter((user) => {
            const fullText = [
                user.username,
                user.email,
                user.role,
                user?.doctor_profile?.first_name,
                user?.doctor_profile?.last_name,
                user?.doctor_profile?.middle_name,
                user?.patient_profile?.first_name,
                user?.patient_profile?.last_name,
                user?.patient_profile?.middle_name,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            const roleMatch = role === 'ALL' || user.role === role;
            const searchMatch = fullText.includes(searchTerm);

            return roleMatch && searchMatch;
        });

        setFilteredUsers(filtered);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('❗ Ви впевнені, що хочете видалити цього користувача?')) return;

        try {
            await axios.delete(`/api/users/${userId}/`);
            fetchUsers();
        } catch (err) {
            alert('❌ Помилка при видаленні користувача');
            console.error(err);
        }
    };

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>👥 Адміністративна панель — Користувачі</h2>

                <div style={{ marginBottom: 10 }}>
                    <input
                        type="text"
                        placeholder="🔍 Пошук по всім полям..."
                        value={search}
                        onChange={handleSearch}
                        style={{ padding: 6, width: '60%', marginRight: 10 }}
                    />
                    <select value={roleFilter} onChange={handleRoleFilter}>
                        {ROLES.map((r) => (
                            <option key={r} value={r}>
                                {r === 'ALL' ? 'Усі ролі' : r}
                            </option>
                        ))}
                    </select>
                </div>

                <table border="1" cellPadding={6} style={{ width: '100%', marginTop: 10, borderCollapse: 'collapse' }}>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Ім’я</th>
                        <th>Прізвище</th>
                        <th>По-батькові</th>
                        <th>Логін</th>
                        <th>Email</th>
                        <th>Роль</th>
                        <th>Дії</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredUsers.map((user) => {
                        const profile = user.role === 'DOCTOR' ? user.doctor_profile : user.patient_profile;
                        return (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{profile?.first_name || '—'}</td>
                                <td>{profile?.last_name || '—'}</td>
                                <td>{profile?.middle_name || '—'}</td>
                                <td>{user.username}</td>
                                <td>{user.email || '—'}</td>
                                <td>{user.role}</td>
                                <td>
                                    <button onClick={() => navigate(`/admin/users/${user.id}/edit`)}>
                                        ✏️
                                    </button>
                                    <button
                                        style={{ marginLeft: 5, color: 'red' }}
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        🗑
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {filteredUsers.length === 0 && (
                        <tr>
                            <td colSpan="8">Немає користувачів за заданими критеріями</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

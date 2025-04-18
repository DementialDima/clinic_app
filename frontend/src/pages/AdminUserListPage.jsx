import { useEffect, useState } from 'react';
import axios from '../api/axios';
import AppHeader from '../components/Header';
import { getUserRole } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export default function AdminUserListPage() {
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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
            const response = await axios.get('/api/users/');
            setUsers(response.data);
            setFiltered(response.data);
        } catch (err) {
            console.error('Помилка при завантаженні користувачів', err);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearch(value);
        applyFilters(value, roleFilter);
    };

    const handleRoleChange = (e) => {
        const value = e.target.value;
        setRoleFilter(value);
        applyFilters(search, value);
    };

    const applyFilters = (searchValue, roleValue) => {
        let result = [...users];

        if (roleValue !== 'ALL') {
            result = result.filter(user => user.role === roleValue);
        }

        result = result.filter(user => {
            const profile = user.patient_profile || user.doctor_profile || {};
            return (
                user.username?.toLowerCase().includes(searchValue) ||
                user.email?.toLowerCase().includes(searchValue) ||
                user.role?.toLowerCase().includes(searchValue) ||
                profile.first_name?.toLowerCase().includes(searchValue) ||
                profile.last_name?.toLowerCase().includes(searchValue) ||
                profile.phone_number?.toLowerCase().includes(searchValue) ||
                profile.address?.toLowerCase().includes(searchValue)
            );
        });

        setFiltered(result);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        const sorted = [...filtered].sort((a, b) => {
            const aValue = getSortValue(a, key);
            const bValue = getSortValue(b, key);

            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        setFiltered(sorted);
    };

    const getSortValue = (user, key) => {
        const profile = user.patient_profile || user.doctor_profile || {};
        if (key === 'username' || key === 'email' || key === 'role') return user[key] || '';
        return profile[key] || '';
    };

    const getField = (profile, field) => profile?.[field] || '—';

    return (
        <>
            <AppHeader />
            <div style={{ padding: 20 }}>
                <h2>👥 Усі користувачі</h2>

                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <input
                        type="text"
                        placeholder="🔍 Пошук по імені, прізвищу, логіну, телефону..."
                        value={search}
                        onChange={handleSearch}
                        style={{ flexGrow: 1, padding: 8 }}
                    />
                    <select value={roleFilter} onChange={handleRoleChange} style={{ padding: 8 }}>
                        <option value="ALL">Усі ролі</option>
                        <option value="ADMIN">Адмін</option>
                        <option value="DOCTOR">Лікар</option>
                        <option value="PATIENT">Пацієнт</option>
                    </select>
                </div>

                <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr>
                        <th onClick={() => handleSort('id')}>ID</th>
                        <th onClick={() => handleSort('username')}>Логін</th>
                        <th onClick={() => handleSort('role')}>Роль</th>
                        <th onClick={() => handleSort('first_name')}>Ім’я</th>
                        <th onClick={() => handleSort('last_name')}>Прізвище</th>
                        <th onClick={() => handleSort('phone_number')}>Телефон</th>
                        <th onClick={() => handleSort('address')}>Адреса</th>
                        <th onClick={() => handleSort('email')}>Email</th>
                        <th>Дії</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map(user => {
                        const profile = user.patient_profile || user.doctor_profile || {};
                        return (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.role}</td>
                                <td>{getField(profile, 'first_name')}</td>
                                <td>{getField(profile, 'last_name')}</td>
                                <td>{getField(profile, 'phone_number')}</td>
                                <td>{getField(profile, 'address')}</td>
                                <td>{user.email || '—'}</td>
                                <td>
                                    <button onClick={() => navigate(`/admin/users/${user.id}/edit`)}>
                                        Редагувати
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan="9">Нічого не знайдено.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../api/auth';

export default function AppHeader() {
    const navigate = useNavigate();
    const role = getUserRole();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            background: '#f0f0f0',
            borderBottom: '1px solid #ccc'
        }}>
            <div style={{ fontWeight: 'bold' }}>🦷 Стоматологічна клініка</div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button onClick={() => navigate('/appointments')}>Прийоми</button>
                <button onClick={() => navigate('/profile')}>Профіль</button>

                {role === 'ADMIN' && (
                    <>
                        <button onClick={() => navigate('/admin-panel')}>Адмінка</button>
                        <button onClick={() => navigate('/admin/create-user')}>➕ Новий користувач</button>
                    </>
                )}

                <span style={{ fontStyle: 'italic' }}>Роль: {role}</span>
                <button onClick={handleLogout}>Вийти</button>
            </div>
        </header>
    );
}

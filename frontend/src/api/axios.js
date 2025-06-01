import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ➕ Додаємо токен до кожного запиту
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('access');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 🔁 Автоматичне оновлення access токена
instance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Якщо access протух і ми ще не пробували refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refresh = localStorage.getItem('refresh');
                const res = await axios.post('http://localhost:8000/auth/jwt/refresh/', {
                    refresh: refresh
                });

                const newAccess = res.data.access;
                localStorage.setItem('access', newAccess);
                originalRequest.headers.Authorization = `Bearer ${newAccess}`;

                // Повторити оригінальний запит
                return instance(originalRequest);
            } catch (refreshError) {
                console.error('❌ Не вдалося оновити токен');
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                localStorage.removeItem('role');
                localStorage.removeItem('user');
                window.location.href = '/';  // Редирект на логін
            }
        }

        return Promise.reject(error);
    }
);

export default instance;

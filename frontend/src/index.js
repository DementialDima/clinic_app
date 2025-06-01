import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@fullcalendar/bootstrap5'; // <-- ЦЕ ВСЕ, що потрібно для стилів
import 'bootstrap/dist/css/bootstrap.min.css';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

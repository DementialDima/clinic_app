import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AppointmentsPage from './pages/AppointmentsPage';
import PrivateRoute from './components/PrivateRoute';
import ProfilePage from './pages/ProfilePage';
import AdminPanelPage from './pages/AdminPanelPage';
import PatientHistoryPage from './pages/PatientHistoryPage';
import AdminCreateUserPage from './pages/AdminCreateUserPage';
import AdminEditUserPage from './pages/AdminEditUserPage';



function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route
                    path="/admin/users/:id/edit"
                    element={
                        <PrivateRoute>
                            <AdminEditUserPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/create-user"
                    element={
                        <PrivateRoute>
                            <AdminCreateUserPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/appointments"
                    element={
                        <PrivateRoute>
                            <AppointmentsPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/patients/:id/history"
                    element={
                        <PrivateRoute>
                            <PatientHistoryPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <ProfilePage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin-panel"
                    element={
                        <PrivateRoute>
                            <AdminPanelPage />
                        </PrivateRoute>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import DoctorSchedulePage from './pages/DoctorSchedulePage';

import EditTreatmentPage from './pages/EditTreatmentPage';
import LoginPage from './pages/LoginPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanelPage from './pages/AdminPanelPage';
import AdminCreateUserPage from './pages/AdminCreateUserPage';
import AdminEditUserPage from './pages/AdminEditUserPage';
import AdminUserListPage from './pages/AdminUserListPage';
import PatientHistoryPage from './pages/PatientHistoryPage';
import PrivateRoute from './components/PrivateRoute';
import AdminCreateAppointmentPage from './pages/AdminCreateAppointmentPage';
import AdminAppointmentsPage from './pages/AdminAppointmentsPage';
import TreatmentFormPage from './pages/TreatmentFormPage';
import AdminStatsPage from './pages/AdminStatsPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />

                <Route
                    path="/appointments"
                    element={
                        <PrivateRoute>
                            <AppointmentsPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/treatments/:treatmentId/edit"
                    element={
                        <PrivateRoute>
                            <EditTreatmentPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/stats"
                    element={
                        <PrivateRoute>
                            <AdminStatsPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/doctor/schedule"
                    element={
                        <PrivateRoute>
                            <DoctorSchedulePage />
                        </PrivateRoute>
                    }
                />


                <Route
                    path="/treatments/:treatmentId/edit"
                    element={
                        <PrivateRoute>
                            <EditTreatmentPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/appointments/:appointmentId/treatment"
                    element={
                        <PrivateRoute>
                            <TreatmentFormPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/appointments"
                    element={
                        <PrivateRoute>
                            <AdminAppointmentsPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/admin/appointments/create"
                    element={
                        <PrivateRoute>
                            <AdminCreateAppointmentPage />
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

                <Route
                    path="/admin/create-user"
                    element={
                        <PrivateRoute>
                            <AdminCreateUserPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/admin/users/:id/edit"
                    element={
                        <PrivateRoute>
                            <AdminEditUserPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/admin/users"
                    element={
                        <PrivateRoute>
                            <AdminUserListPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/patient/history"
                    element={
                        <PrivateRoute>
                            <PatientHistoryPage />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

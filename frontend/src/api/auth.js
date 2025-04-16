export const getUserRole = () => localStorage.getItem('role');
export const isPatient = () => getUserRole() === 'PATIENT';
export const isDoctor = () => getUserRole() === 'DOCTOR';
export const isAdmin = () => getUserRole() === 'ADMIN';

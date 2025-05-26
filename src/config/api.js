// Cambia esta IP 
export const API_HOST = '192.168.100.35';
export const API_PORT = '3000';

export const API_URL = `http://${API_HOST}:${API_PORT}`;

export const getApiUrl = (path) => `${API_URL}${path}`;

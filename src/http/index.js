import axios from "axios";

// export const API_URL = 'http://localhost:7474'
// export const API_URL = 'http://10.1.232.29:7474'
// export const API_URL = 'http://10.30.0.5:7474'
export const API_URL = 'http://10.170.30.87/:7474'

const $api = axios.create({
    withCredentials: true,
    baseURL: API_URL
})

$api.interceptors.request.use((config) => {
    if(sessionStorage.getItem('tokenAutomationProduction')!==null)
    config.headers.Authorization = `Bearer ${sessionStorage.getItem('tokenAutomationProduction')}`
    return config;
})

export default $api;
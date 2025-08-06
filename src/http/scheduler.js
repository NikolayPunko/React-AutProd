import axios from "axios";

// export const API_URL_SCHEDULER = 'http://localhost:8080'
export const API_URL_SCHEDULER = 'http://10.30.0.5:8081'

const $apiSchedule = axios.create({
    withCredentials: true,
    baseURL: API_URL_SCHEDULER
})

$apiSchedule.interceptors.request.use((config) => {
    // if(sessionStorage.getItem('tokenAutomationProduction')!==null)
    //     config.headers.Authorization = `Bearer ${sessionStorage.getItem('tokenAutomationProduction')}`
    return config;
})

export default $apiSchedule;
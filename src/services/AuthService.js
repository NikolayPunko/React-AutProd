import $api, {API_URL} from "../http";
// import {AxiosResponse} from 'axios'
// import {AuthResponse} from "../models/response/AuthResponse";


export default class AuthService {
    static async login(username, password) {
        return $api.post(`${API_URL}/api/authentication/authenticate`, {username, password})
    }

    static async getAuthorizedUserData() {
        return $api.get(`${API_URL}/api/user/profile`);
    }

}
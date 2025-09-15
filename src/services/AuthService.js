import $api, {API_URL} from "../http";


export default class AuthService {
    static async login(username, password) {
        return $api.post(`${API_URL}/api/authentication/authenticate`, {username, password})
    }

    static async getAuthorizedUserData() {
        return $api.get(`${API_URL}/api/user/profile`);
    }

    static decodeToken = (token) => {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload));
        } catch (error) {
            return null;
        }
    };

    static getUserRoles = () => {
        const token = sessionStorage.getItem('tokenAutomationProduction');
        if (!token) return [];

        const decoded = AuthService.decodeToken(token);
        return decoded?.roles || [];
    };

    static getUserRolesByToken = (token) => {
        if (!token) return [];

        const decoded = AuthService.decodeToken(token);
        console.log(decoded)
        return decoded?.roles || [];
    };



}
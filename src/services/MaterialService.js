import $api from "../http";
import {API_URL_SCHEDULER} from "../http/scheduler";

export default class MaterialService {


    static searchRecipients(query) {
        return $api.get(`${API_URL_SCHEDULER}/api/material/recipients/search`, {
            params: { query: query }
        });
    }

    static loadProducts(date, kpp) {
        return $api.get(`${API_URL_SCHEDULER}/api/material/load`, {
            params: { date, kpp }
        });
    }

    static recalcKolf(request) {
        return $api.post(`${API_URL_SCHEDULER}/api/material/recalc`, request);
    }

    static saveAll(request) {
        return $api.post(`${API_URL_SCHEDULER}/api/material/save`, request);
    }


}
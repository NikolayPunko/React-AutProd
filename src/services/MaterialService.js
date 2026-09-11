import $api from "../http";
import { API_URL_SCHEDULER } from "../http/scheduler";

export default class MaterialService {
    static searchRecipients(query) {
        return $api.get(
            `${API_URL_SCHEDULER}/api/material/recipients/search`,
            { params: { query } }
        );
    }

    static loadProducts(date, kpp) {
        return $api.get(
            `${API_URL_SCHEDULER}/api/material/load`,
            { params: { date, kpp } }
        );
    }

    static recalcKolf(request) {
        return $api.post(`${API_URL_SCHEDULER}/api/material/recalc`, request);
    }

    static saveAll(request) {
        return $api.post(`${API_URL_SCHEDULER}/api/material/save`, request);
    }

    static importSprog() {
        return $api.post(`${API_URL_SCHEDULER}/api/dbf/import/sprog`);
    }

    static importRnpp() {
        return $api.post(`${API_URL_SCHEDULER}/api/dbf/import/rnpp`);
    }

    static importPp() {
        return $api.post(`${API_URL_SCHEDULER}/api/dbf/import/pp`);
    }

    static importMt() {
        return $api.post(`${API_URL_SCHEDULER}/api/dbf/import/mt`);
    }

    static getMaterialsSettings(date, kpp) {
        return $api.get(`${API_URL_SCHEDULER}/api/material/settings`, {
            params: { date }
        });
    }

    static saveMaterialsSettings(settings) {
        return $api.put(`${API_URL_SCHEDULER}/api/material/settings`, settings);
    }
}
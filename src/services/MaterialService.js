import $api from "../http";
import {API_URL_SCHEDULER} from "../http/scheduler";

export default class MaterialService {

    // Получить список получателей (цехов)
    static getRecipients() {
        return $api.get(`${API_URL_SCHEDULER}/api/material/recipients`);
    }

    // Загрузить данные (БЕЗ СОХРАНЕНИЯ в БД)
    static loadProducts(date, kpp) {
        return $api.get(`${API_URL_SCHEDULER}/api/material/load`, {
            params: { date, kpp }
        });
    }

    // Пересчитать KOLF (БЕЗ СОХРАНЕНИЯ в БД)
    static recalcKolf(request) {
        return $api.post(`${API_URL_SCHEDULER}/api/material/recalc`, request);
    }

    // Сохранить все данные
    static saveAll(request) {
        return $api.post(`${API_URL_SCHEDULER}/api/material/save`, request);
    }
}
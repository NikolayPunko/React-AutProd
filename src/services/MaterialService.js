import $api from "../http";
import {API_URL_SCHEDULER} from "../http/scheduler";


export default class MaterialService {

    // Получить список получателей (цехов)
    static getRecipients() {
        return $api.get(`${API_URL_SCHEDULER}/api/material/recipients`);
    }

    // Загрузить продукты и материалы (POST)
    static loadProducts(date, kpp) {
        return $api.post(`${API_URL_SCHEDULER}/api/material/load`, {
            date, kpp
        });
    }

    // Обновить KOLF для материала (PUT)
    static updateKolf(kmt, kolf, date, kpp) {
        return $api.put(`${API_URL_SCHEDULER}/api/material/kolf`, {
            kmt,
            kolf,
            date,
            kpp
        });
    }

}
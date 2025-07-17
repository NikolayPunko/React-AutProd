import $api, {API_URL} from "../http";
import $apiSchedule, {API_URL_SCHEDULER} from "../http/scheduler";
import moment from "moment/moment";

export const party = []
export const hardware = []

export const planByParty = []
export const planByHardware = []


const exampleResourse = {
    id: 1,
    title: 'group 1'
}

const exampleTask = {
    id: 1,
    group: 1,
    title: 'item 1',
    start_time: moment(),
    end_time: moment().add(1, 'hour'),
    canMove: false,
    canResize: false,
    // background: 'rgb(197,57,57)',

}

export default class ScheduleService2 {

    static async parseCleaningByParty(json) {
        const filteredData = json.jobs.filter(item => {
            return item.startCleaningDateTime !== item.startProductionDateTime;
        });
        let cleaning = [];
        for (let i = 0; i < filteredData.length; i++) {
            cleaning[i] = Object.assign({}, exampleTask);
            cleaning[i].id = filteredData[i].id + 'cl';
            cleaning[i].start_time = new Date(filteredData[i].startCleaningDateTime).getTime();
            cleaning[i].end_time = new Date(filteredData[i].startProductionDateTime).getTime();
            cleaning[i].title = "Мойка";
            cleaning[i].group = filteredData[i].id;
            cleaning[i].itemProps = {
                style: {
                    background: '#f0f9ff',
                    border: '1px solid #dcdcdc',
                    whiteSpace: 'nowrap',      /* Запрет переноса строк */
                    overflow: 'hidden',          /* Скрытие выходящего за границы текста */
                    textOverflow: 'ellipsis',   /* Добавление "..." */
                    maxWidth: '100%',           /* Ограничение ширины */
                    color: "#0369a1",
                },
            };
            cleaning[i].info = { //Доп информация
                name: "Мойка",
                start: filteredData[i].startCleaningDateTime,
                end: filteredData[i].startProductionDateTime,
                line: filteredData[i].line.name,
                // quantity: json.jobs[i].quantity,
                duration: json.jobs[i].duration,
            }
        }


        return cleaning;
    }

    static async parseCleaningByHardware(json) {
        const filteredData = json.jobs.filter(item => {
            return item.startCleaningDateTime !== item.startProductionDateTime;
        });
        let cleaning = [];
        for (let i = 0; i < filteredData.length; i++) {
            cleaning[i] = Object.assign({}, exampleTask);
            cleaning[i].id = i + "cleaning";
            cleaning[i].start_time = new Date(filteredData[i].startCleaningDateTime).getTime();
            cleaning[i].end_time = new Date(filteredData[i].startProductionDateTime).getTime();
            cleaning[i].title = "Мойка";
            cleaning[i].group = filteredData[i].line.id;
            cleaning[i].itemProps = {
                style: {
                    background: '#f0f9ff',
                    border: '1px solid #dcdcdc',
                    whiteSpace: 'nowrap',      /* Запрет переноса строк */
                    overflow: 'hidden',          /* Скрытие выходящего за границы текста */
                    textOverflow: 'ellipsis',   /* Добавление "..." */
                    maxWidth: '100%',           /* Ограничение ширины */
                    color: "#0369a1",
                },
            };
            cleaning[i].info = { //Доп информация
                name: "Мойка",
                start: filteredData[i].startCleaningDateTime,
                end: filteredData[i].startProductionDateTime,
                line: filteredData[i].line.name,
                // quantity: json.jobs[i].quantity,
                duration: json.jobs[i].duration,
            }


        }
        // console.log(planByParty)
        return cleaning;
    }

    static async parseParty(json) {
        for (let i = 0; i < json.jobs.length; i++) {
            party[i] = Object.assign({}, exampleResourse);
            party[i].id = json.jobs[i].id;
            party[i].title = json.jobs[i].name + " " + json.jobs[i].id;
        }
        return party;
    }


    static async parseHardware(json) {
        for (let i = 0; i < json.lines.length; i++) {
            hardware[i] = Object.assign({}, exampleResourse);
            hardware[i].id = json.lines[i].id;
            hardware[i].title = json.lines[i].name;
        }
        return hardware;
    }

    static async parsePlanByParty(json) {
        for (let i = 0; i < json.jobs.length; i++) {
            planByParty[i] = Object.assign({}, exampleTask);
            planByParty[i].id = json.jobs[i].id;
            planByParty[i].start_time = new Date(json.jobs[i].startProductionDateTime).getTime();
            planByParty[i].end_time = new Date(json.jobs[i].endDateTime).getTime();
            planByParty[i].title = json.jobs[i].line.name;
            planByParty[i].group = json.jobs[i].id;

            planByParty[i].itemProps = {
                style: {
                    // background: '#f0f9ff',
                    // background: '#f0fdf4',
                    background: '#fffcd2',
                    // background: 'oklch(0.888 0.056 253.411)',
                    border: '1px solid #dcdcdc',
                    whiteSpace: 'nowrap',      /* Запрет переноса строк */
                    overflow: 'hidden',          /* Скрытие выходящего за границы текста */
                    textOverflow: 'ellipsis',   /* Добавление "..." */
                    maxWidth: '100%',           /* Ограничение ширины */
                    // color: "#0369a1",
                    color: "#a16207",
                }
            };
            planByParty[i].info = { //Доп информация
                name: json.jobs[i].name,
                start: json.jobs[i].startProductionDateTime,
                end: json.jobs[i].endDateTime,
                line: json.jobs[i].line.name,
                quantity: json.jobs[i].quantity,
                np: json.jobs[i].np,
                duration: json.jobs[i].duration,

                fullName: json.jobs[i].product.name,
                type: json.jobs[i].product.type,
                glaze: json.jobs[i].product.glaze,
                filling: json.jobs[i].product.filling,
                _allergen: json.jobs[i].product._allergen,
                pinned: json.jobs[i].pinned,
            }
        }

        let cleaning = await this.parseCleaningByParty(json)
        let result = [...planByParty, ...cleaning]
        return result;
    }

    static async parsePlanByHardware(json) {
        for (let i = 0; i < json.jobs.length; i++) {
            planByHardware[i] = Object.assign({}, exampleTask);
            planByHardware[i].id = json.jobs[i].id;
            planByHardware[i].start_time = new Date(json.jobs[i].startProductionDateTime).getTime();
            planByHardware[i].end_time = new Date(json.jobs[i].endDateTime).getTime();
            planByHardware[i].title = json.jobs[i].name;
            planByHardware[i].group = json.jobs[i].line.id;

            planByHardware[i].itemProps = {
                style: {
                    // background: '#f0f9ff',
                    // background: '#f0fdf4',
                    background: '#fffcd2',
                    // background: 'oklch(0.888 0.056 253.411)',
                    border: '1px solid #dcdcdc',
                    whiteSpace: 'nowrap',      /* Запрет переноса строк */
                    overflow: 'hidden',          /* Скрытие выходящего за границы текста */
                    textOverflow: 'ellipsis',   /* Добавление "..." */
                    maxWidth: '100%',           /* Ограничение ширины */
                    // color: "#0369a1",
                    color: "#a16207",
                }
            };
            planByHardware[i].info = { //Доп информация
                name: json.jobs[i].name,
                start: json.jobs[i].startProductionDateTime,
                end: json.jobs[i].endDateTime,
                line: json.jobs[i].line.name,
                quantity: json.jobs[i].quantity,
                np: json.jobs[i].np,
                duration: json.jobs[i].duration,

                fullName: json.jobs[i].product.name,
                type: json.jobs[i].product.type,
                glaze: json.jobs[i].product.glaze,
                filling: json.jobs[i].product.filling,
                _allergen: json.jobs[i].product._allergen,
                pinned: json.jobs[i].pinned,

            }
        }
        // console.log(planByHardware)
        let cleaning = await this.parseCleaningByHardware(json)
        let result = [...planByHardware, ...cleaning]
        return result;
    }

    static async getPlansId() {
        return $api.get(`${API_URL}/api/scheduler/plansId`)
    }

    static async getByPlanId(planId) {
        return $api.get(`${API_URL}/api/scheduler/` + planId)
    }

    static async assignSettings(date) {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/load`, {date})
    }

    static async getPlan() {
        return $apiSchedule.get(`${API_URL_SCHEDULER}/schedule`)
    }

    static async solve() {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/solve`, {})
    }

    static async stopSolving() {
        return $apiSchedule.post(`${API_URL_SCHEDULER}/schedule/stopSolving`, {})
    }


}
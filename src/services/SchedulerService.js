import {eventsJson2, resourse} from "../data/data";
import {useState} from "react";
import $api, {API_URL} from "../http";
import $apiScheduler ,{API_URL_SCHEDULER} from "../http/scheduler";
import $apiSchedule from "../http/scheduler";




export const party = []
export const hardware = []

export const planByParty = []
export const planByHardware = []


const exampleResourse = {
    id: "r0",
    name: "Resource0",
}

const exampleTask = {
    id: 0,
    start: "2024-12-22 12:30:00",
    end: "2024-12-23 23:30:00",
    resourceId: "r2",
    title: "Очень важная задача №2",
    resizable: false,
    movable: false,
    startResizable: false,
    bgColor: "#108EE9",
};

export default class SchedulerService {

    static async parseCleaningByParty(json) {
        // const obj = JSON.parse(json);
        const obj = json;
        const filteredData = obj.jobs.filter(item => {
            return item.startCleaningDateTime !== item.startProductionDateTime;
        });
        let cleaning = [];
        for (let i = 0; i < filteredData.length; i++) {
            cleaning[i] = Object.assign({}, exampleTask);
            cleaning[i].id = filteredData[i].id + 'cl';
            cleaning[i].start = filteredData[i].startCleaningDateTime.replace("T"," ");
            cleaning[i].end = filteredData[i].startProductionDateTime.replace("T"," ");
            cleaning[i].title = "Cleaning";
            cleaning[i].resourceId = filteredData[i].id;
            cleaning[i].bgColor = "#e3a352";
        }

        return cleaning;
    }

    static async parseCleaningByHardware(json) {
        // const obj = JSON.parse(json);
        const obj = json;
        const filteredData = obj.jobs.filter(item => {
            return item.startCleaningDateTime !== item.startProductionDateTime;
        });
        let cleaning = [];
        for (let i = 0; i < filteredData.length; i++) {
            cleaning[i] = Object.assign({}, exampleTask);
            cleaning[i].id = i+"cleaning";
            cleaning[i].start = filteredData[i].startCleaningDateTime.replace("T"," ");
            cleaning[i].end = filteredData[i].startProductionDateTime.replace("T"," ");
            cleaning[i].title = "Cleaning";
            cleaning[i].resourceId = filteredData[i].line.id;
            cleaning[i].bgColor = "#e3a352";
        }
        // console.log(planByParty)
        return cleaning;
    }

    static async parseParty(json) {
        console.log(json)
        // const obj = JSON.parse(json);
        const obj = json;
        console.log(obj)
        for (let i = 0; i < obj.jobs.length; i++) {
            party[i] =  Object.assign({}, exampleResourse);
            party[i].id = obj.jobs[i].id;
            party[i].name = obj.jobs[i].name + " " + obj.jobs[i].id;
        }
        return party;
    }


    static async parseHardware(json) {
        // const obj = JSON.parse(json);
        const obj = json;
        for (let i = 0; i < obj.lines.length; i++) {
            hardware[i] =  Object.assign({}, exampleResourse);
            hardware[i].id = obj.lines[i].id;
            hardware[i].name = obj.lines[i].name;
        }
        return hardware;
    }

    static async parsePlanByParty(json) {
        // const obj = JSON.parse(json);
        const obj = json;
        for (let i = 0; i < obj.jobs.length; i++) {
            planByParty[i] = Object.assign({}, exampleTask);
            planByParty[i].id = obj.jobs[i].id;
            planByParty[i].start = obj.jobs[i].startProductionDateTime.replace("T"," ");
            planByParty[i].end = obj.jobs[i].endDateTime.replace("T"," ");
            planByParty[i].title = obj.jobs[i].line.name;
            planByParty[i].resourceId = obj.jobs[i].id;
        }
        // console.log(planByParty)


            let x1 = Object.assign({}, exampleTask);
            x1.id = "68clean";
            x1.start = "2025-05-25T10:33:00".replace("T"," ");
            x1.end = "2025-05-25T11:01:00".replace("T"," ");
            x1.title = "Line6 68";
            x1.resourceId = "68";



        let cleaning = await this.parseCleaningByParty(json)
        let result = [...planByParty,...cleaning]
        //  result = [...cleaning, x1]
        return result ;
    }

    static async parsePlanByHardware(json) {
        // const obj = JSON.parse(json);
        const obj = json;
        for (let i = 0; i < obj.jobs.length; i++) {
            planByHardware[i] = Object.assign({}, exampleTask);
            planByHardware[i].id = obj.jobs[i].id;
            planByHardware[i].start = obj.jobs[i].startProductionDateTime.replace("T"," ");
            planByHardware[i].end = obj.jobs[i].endDateTime.replace("T"," ");
            planByHardware[i].title = obj.jobs[i].name;
            planByHardware[i].resourceId = obj.jobs[i].line.id;
        }
        // console.log(planByHardware)
        let cleaning = await this.parseCleaningByHardware(json)
        let result = [...planByHardware,...cleaning]
        return result ;
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
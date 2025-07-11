import {eventsJson2, resourse} from "../data/data";
import {useState} from "react";
import $api, {API_URL} from "../http";

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

export default class SchedulerService {  //Осталось распарсить когда мойка

    static async parseParty(json) {
        const obj = JSON.parse(json);
        console.log(obj)
        for (let i = 0; i < obj.jobs.length; i++) {
            party[i] =  Object.assign({}, exampleResourse);
            party[i].id = obj.jobs[i].id;
            party[i].name = obj.jobs[i].name;
        }
        return party;
    }

    // static async parseParty2(json) {
    //     const obj = JSON.parse(json);
    //     for (let i = 0; i < obj.Projects.length; i++) {
    //         party[i] =  Object.assign({}, exampleResourse);
    //         party[i].id = obj.Projects[i];
    //         party[i].name = obj.Projects[i];
    //     }
    //     // console.log(party)
    //     return party;
    // }

    static async parseHardware(json) {
        const obj = JSON.parse(json);
        for (let i = 0; i < obj.lines.length; i++) {
            hardware[i] =  Object.assign({}, exampleResourse);
            hardware[i].id = obj.lines[i].id;
            hardware[i].name = obj.lines[i].name;
        }
        return hardware;
    }

    // static async parseHardware2(json) {
    //     const obj = JSON.parse(json);
    //     for (let i = 0; i < obj.Resources.length; i++) {
    //         hardware[i] =  Object.assign({}, exampleResourse);
    //         hardware[i].id = obj.Resources[i];
    //         hardware[i].name = obj.Resources[i];
    //     }
    //     // console.log(hardware)
    //     return hardware;
    // }


    static async parsePlanByParty(json) {
        const obj = JSON.parse(json);
        for (let i = 0; i < obj.jobs.length; i++) {
            planByParty[i] = Object.assign({}, exampleTask);
            planByParty[i].id = i;
            planByParty[i].start = obj.jobs[i].startProductionDateTime.replace("T"," ");
            planByParty[i].end = obj.jobs[i].endDateTime.replace("T"," ");
            planByParty[i].title = obj.jobs[i].name;
            planByParty[i].resourceId = obj.jobs[i].id;
        }
        // console.log(planByParty)
        return planByParty;
    }


    static async parsePlanByParty2(json) {
        const obj = JSON.parse(json);
        for (let i = 0; i < obj.AllocationList.length; i++) {
            planByParty[i] = Object.assign({}, exampleTask);
            planByParty[i].id = i;
            planByParty[i].start = obj.AllocationList[i].StartDate.replace(""," ");
            planByParty[i].end = obj.AllocationList[i].EndDate.replace(""," ");
            planByParty[i].title = obj.AllocationList[i].JID;
            planByParty[i].resourceId = obj.AllocationList[i].PID;
        }
        // console.log(planByParty)
        return planByParty;
    }

    static async parsePlanByHardware2(json) {
        const obj = JSON.parse(json);
        for (let i = 0; i < obj.AllocationList.length; i++) {
            planByHardware[i] = Object.assign({}, exampleTask);
            planByHardware[i].id = i;
            planByHardware[i].start = obj.AllocationList[i].StartDate.replace(""," ");
            planByHardware[i].end = obj.AllocationList[i].EndDate.replace(""," ");
            planByHardware[i].title = obj.AllocationList[i].JID;
            planByHardware[i].resourceId = obj.AllocationList[i].ResourceRequirementList.length===0? "": obj.AllocationList[i].ResourceRequirementList[0];
        }
        // console.log(planByHardware)
        return planByHardware;
    }

    static async parsePlanByHardware(json) {
        const obj = JSON.parse(json);
        for (let i = 0; i < obj.jobs.length; i++) {
            planByHardware[i] = Object.assign({}, exampleTask);
            planByHardware[i].id = i;
            planByHardware[i].start = obj.jobs[i].startProductionDateTime.replace("T"," ");
            planByHardware[i].end = obj.jobs[i].endDateTime.replace("T"," ");
            planByHardware[i].title = obj.jobs[i].name;
            planByHardware[i].resourceId = obj.jobs[i].line.id;
        }
        // console.log(planByHardware)
        return planByHardware;
    }

    static async getPlansId() {
        return $api.get(`${API_URL}/api/scheduler/plansId`)
    }

    static async getByPlanId(planId) {
        return $api.get(`${API_URL}/api/scheduler/` + planId)
    }


}
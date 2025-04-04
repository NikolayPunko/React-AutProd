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

export default class SchedulerService {

    static async parseParty(json) {
        const obj = JSON.parse(json);
        for (let i = 0; i < obj.Projects.length; i++) {
        // for (let i = 0; i < 15; i++) {
            party[i] =  Object.assign({}, exampleResourse);
            party[i].id = obj.Projects[i];
            party[i].name = obj.Projects[i];
        }
        // console.log(party)
        return party;
    }

    static async parseHardware(json) {
        const obj = JSON.parse(json);
        for (let i = 0; i < obj.Resources.length; i++) {
            hardware[i] =  Object.assign({}, exampleResourse);
            hardware[i].id = obj.Resources[i];
            hardware[i].name = obj.Resources[i];
        }
        // console.log(hardware)
        return hardware;
    }

    static async parsePlanByParty(json) {
        const obj = JSON.parse(json);
        for (let i = 0; i < obj.AllocationList.length; i++) {
        // for (let i = 0; i < 15; i++) {
            planByParty[i] = Object.assign({}, exampleTask);;
            planByParty[i].id = i;
            planByParty[i].start = obj.AllocationList[i].StartDate.replace(""," ");
            planByParty[i].end = obj.AllocationList[i].EndDate.replace(""," ");
            planByParty[i].title = obj.AllocationList[i].JID;
            planByParty[i].resourceId = obj.AllocationList[i].PID;
        }
        // console.log(planByParty)
        return planByParty;
    }

    static async parsePlanByHardware(json) {
        const obj = JSON.parse(json);
        for (let i = 0; i < obj.AllocationList.length; i++) {
            planByHardware[i] = Object.assign({}, exampleTask);;
            planByHardware[i].id = i;
            planByHardware[i].start = obj.AllocationList[i].StartDate.replace(""," ");
            planByHardware[i].end = obj.AllocationList[i].EndDate.replace(""," ");
            planByHardware[i].title = obj.AllocationList[i].JID;
            planByHardware[i].resourceId = obj.AllocationList[i].ResourceRequirementList.length===0? "": obj.AllocationList[i].ResourceRequirementList[0];
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
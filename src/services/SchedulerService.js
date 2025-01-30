import {eventsJson2, resourse} from "../data/data";
import {useState} from "react";

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

    static async parseParty() {
        const obj = JSON.parse(eventsJson2);
        for (let i = 0; i < obj.Projects.length; i++) {
            party[i] =  Object.assign({}, exampleResourse);
            party[i].id = obj.Projects[i];
            party[i].name = obj.Projects[i];
        }
        // console.log(party)
        return party;
    }

    static async parseHardware() {
        const obj = JSON.parse(eventsJson2);
        for (let i = 0; i < obj.Resources.length; i++) {
            hardware[i] =  Object.assign({}, exampleResourse);
            hardware[i].id = obj.Resources[i];
            hardware[i].name = obj.Resources[i];
        }
        // console.log(hardware)
        return hardware;
    }

    static async parsePlanByParty() {
        const obj = JSON.parse(eventsJson2);
        for (let i = 0; i < obj.AllocationList.length; i++) {
            planByParty[i] = Object.assign({}, exampleTask);;
            planByParty[i].id = i;
            planByParty[i].start = obj.AllocationList[i].StartDate.replace("T"," ");
            planByParty[i].end = obj.AllocationList[i].EndDate.replace("T"," ");
            planByParty[i].title = obj.AllocationList[i].JID;
            planByParty[i].resourceId = obj.AllocationList[i].PID;
        }
        // console.log(planByParty)
        return planByParty;
    }

    static async parsePlanByHardware() {
        const obj = JSON.parse(eventsJson2);
        for (let i = 0; i < obj.AllocationList.length; i++) {
            planByHardware[i] = Object.assign({}, exampleTask);;
            planByHardware[i].id = i;
            planByHardware[i].start = obj.AllocationList[i].StartDate.replace("T"," ");
            planByHardware[i].end = obj.AllocationList[i].EndDate.replace("T"," ");
            planByHardware[i].title = obj.AllocationList[i].JID;
            planByHardware[i].resourceId = obj.AllocationList[i].ResourceRequirementList.length===0? "": obj.AllocationList[i].ResourceRequirementList[0];
        }
        // console.log(planByHardware)
        return planByHardware;
    }


}
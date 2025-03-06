export const resourse = [
    {
        id: "r0",
        name: "Resource0",
        groupOnly: true,
    },
    {
        id: "r1",
        name: "Resource1",
    },
    {
        id: "r2",
        name: "Resource2",
        parentId: "r0",
    },
    {
        id: "r3",
        name: "Resource3",
        parentId: "r4",
    },
    {
        id: "r4",
        name: "Resource4",
        parentId: "r2",
    },
];

export const resourseExample1 = [
    {
        id: "r163",
        name: "163",
    },
    {
        id: "r164",
        name: "164",
    },
    {
        id: "r165",
        name: "165",

    },
];

export const resourseExample2 = [
    {
        id: "rLine1",
        name: "Line1",
    },
    {
        id: "rLine2",
        name: "Line2",
    },
];

export const events = [
    {
        id: 1,
        start: "2024-12-23 09:45:00",
        end: "2024-12-23 12:30:00",
        resourceId: "r1",
        title: "Очень важная задача №1",
        bgColor: "#ef2e2e",
        // resizable: false,
        // movable: false,
        // startResizable: false,
    },
    {
        id: 2,
        start: "2024-12-22 12:30:00",
        end: "2024-12-23 23:30:00",
        resourceId: "r2",
        title: "Очень важная задача №2",
        resizable: false,
        movable: false,
        startResizable: false,
    },
    {
        id: 3,
        start: "2024-12-23 12:30:00",
        end: "2024-12-23 23:30:00",
        resourceId: "r3",
        title: "Очень важная задача №3",
        resizable: false,
        movable: false,
        startResizable: false,
    },
    {
        id: 4,
        start: "2024-12-23 14:30:00",
        end: "2024-12-23 23:30:00",
        resourceId: "r1",
        title: "Очень важная задача №4",
        resizable: false,
        movable: false,
        startResizable: false,
    },

];

export const events2 = [
    {
        id: 1,
        start: "2024-12-23 09:45:00",
        end: "2024-12-23 12:30:00",
        resourceId: "r1",
        title: "Очень важная задача №1",
        bgColor: "#47c034",
        // resizable: false,
        // movable: false,
        // startResizable: false,
    },
    {
        id: 2,
        start: "2024-12-22 12:30:00",
        end: "2024-12-23 23:30:00",
        resourceId: "r2",
        title: "Очень важная задача №2",
        resizable: false,
        movable: false,
        startResizable: false,
    },
    {
        id: 3,
        start: "2024-12-23 12:30:00",
        end: "2024-12-23 23:30:00",
        resourceId: "r3",
        title: "Очень важная задача №3",
        resizable: false,
        movable: false,
        startResizable: false,
    },
    {
        id: 4,
        start: "2024-12-23 14:30:00",
        end: "2024-12-23 23:30:00",
        resourceId: "r1",
        title: "Очень важная задача №4",
        resizable: false,
        movable: false,
        startResizable: false,
    },

];

export const eventsExample1 = [
    {
        id: 1,
        start: "2025-02-02 09:00:00",
        end: "2025-02-02 09:36:00",
        resourceId: "r163",
        title: "Job1",
        // bgColor: "#47c034",
        resizable: false,
        movable: false,
        startResizable: false,
    },
    {
        id: 2,
        start: "2025-02-02 09:20:00",
        end: "2025-02-02 10:12:00",
        resourceId: "r164",
        title: "Job2",
        resizable: false,
        movable: false,
        startResizable: false,
    },
    {
        id: 3,
        start: "2025-02-02 09:40:00",
        end: "2025-02-02 10:25:00",
        resourceId: "r165",
        title: "Job3",
        resizable: false,
        movable: false,
        startResizable: false,
    },

];

export const eventsExample2 = [
    {
        id: 1,
        start: "2025-02-02 09:00:00",
        end: "2025-02-02 09:36:00",
        resourceId: "rLine1",
        title: "Job1",
        // bgColor: "#47c034",
        resizable: false,
        movable: false,
        startResizable: false,
    },
    {
        id: 2,
        start: "2025-02-02 09:20:00",
        end: "2025-02-02 10:12:00",
        resourceId: "rLine2",
        title: "Job2",
        resizable: false,
        movable: false,
        startResizable: false,
    },
    {
        id: 3,
        start: "2025-02-02 09:40:00",
        end: "2025-02-02 10:25:00",
        resourceId: "rLine1",
        title: "Job3",
        resizable: false,
        movable: false,
        startResizable: false,
    },
];

export const eventsJson = [
    {
        ID: "P1570С30",
        HardConstraintsPenalty: 0,
        MediumConstraintsPenalty1: -100,
        SoftConstraintsPenalty: -767,
        Projects: [163, 164, 165],
        Resources: ["Line1", "Line2"],
        AllocationList: [
            {
                ID: "Allocation1",
                PID: 163,
                JID: "Job1",
                StartDate: "2025-02-02 09:00:00",
                EndDate: "2025-02-02 09:36:00",
                Duration: 36,
                ResourceRequirementList: ["Line1"],
                PredAllocationList: []
            },
            {
                ID: "Allocation2",
                PID: "164",
                JID: "Job1",
                StartDate: "2025-02-02 09:20:00",
                EndDate: "2025-02-02 10:12:00",
                Duration: 36,
                ResourceRequirementList: ["Line2"],
                PredAllocationList: []
            },
            {
                ID: "Allocation3",
                PID: "165",
                JID: "Job1",
                StartDate: "2025-02-02 09:40:00",
                EndDate: "2025-02-02 10:25:00",
                Duration: 36,
                ResourceRequirementList: ["Line1"],
                PredAllocationList: []
            }
        ]
    }
]

export const eventsJson2 = `{
  "ID" : "P1570C30",
  "HardConstraintsPenalty" : 0,
  "MediumConstraintsPenalty1" : -12,
  "SoftConstraintsPenalty" : -8,
  "Projects" : [ "163", "164", "165" ],
  "Resources" : [ "Line1", "Line2" ],
  "AllocationList" : [ {
    "ID" : "Allocation2",
    "PID" : "163",
    "JID" : "Job1",
    "StartDate" : "2025-02-02 00:00:00",
    "EndDate" : "2025-02-02 01:00:00",
    "Duration" : 60,
    "PredAllocationList" : [ "Allocation1" ],
    "ResourceRequirementList" : [ "Line1" ]
  }, {
    "ID" : "Allocation5",
    "PID" : "164",
    "JID" : "Job1",
    "StartDate" : "2025-03-02 00:04:00",
    "EndDate" : "2025-03-02 01:14:00",
    "Duration" : 70,
    "PredAllocationList" : [ "Allocation4" ],
    "ResourceRequirementList" : [ "Line2" ]
  }, {
    "ID" : "Allocation8",
    "PID" : "165",
    "JID" : "Job1",
    "StartDate" : "2025-03-02 01:00:00",
    "EndDate" : "2025-03-02 02:00:00",
    "Duration" : 60,
    "PredAllocationList" : [ "Allocation7" ],
    "ResourceRequirementList" : [ "Line1" ]
  } ]
}`

export const test3 = `{"ID":"P1570C30","HardConstraintsPenalty":0,"MediumConstraintsPenalty1":-180,"SoftConstraintsPenalty":-36,"Projects":["142","183","184","94","95","88","21","30","31","121"],"Resources":["Line1","Line2","Line3","Line4","Line5","Line6"],"AllocationList":[{"ID":"Allocation2","PID":"142","JID":"142,Line4","StartDate":"2025-02-02 00:00:00","EndDate":"2025-02-02 00:16:00","Duration":16,"PredAllocationList":[],"ResourceRequirementList":["Line4"]},{"ID":"Allocation5","PID":"183","JID":"183,Line5","StartDate":"2025-02-02 00:04:00","EndDate":"2025-02-02 00:30:00","Duration":26,"PredAllocationList":[],"ResourceRequirementList":["Line5"]},{"ID":"Allocation8","PID":"184","JID":"184,Line6","StartDate":"2025-02-02 00:08:00","EndDate":"2025-02-02 00:34:00","Duration":26,"PredAllocationList":[],"ResourceRequirementList":["Line6"]},{"ID":"Allocation11","PID":"94","JID":"94,Line3","StartDate":"2025-02-02 00:12:00","EndDate":"2025-02-02 00:40:00","Duration":28,"PredAllocationList":[],"ResourceRequirementList":["Line3"]},{"ID":"Allocation14","PID":"95","JID":"95,Line4","StartDate":"2025-02-02 00:16:00","EndDate":"2025-02-02 00:42:00","Duration":26,"PredAllocationList":[],"ResourceRequirementList":["Line4"]},{"ID":"Allocation17","PID":"88","JID":"88,Line5","StartDate":"2025-02-02 00:30:00","EndDate":"2025-02-02 01:30:00","Duration":60,"PredAllocationList":[],"ResourceRequirementList":["Line5"]},{"ID":"Allocation20","PID":"21","JID":"21,Line6","StartDate":"2025-02-02 00:34:00","EndDate":"2025-02-02 00:56:00","Duration":22,"PredAllocationList":[],"ResourceRequirementList":["Line6"]},{"ID":"Allocation23","PID":"30","JID":"30,Line4","StartDate":"2025-02-02 00:42:00","EndDate":"2025-02-02 01:04:00","Duration":22,"PredAllocationList":[],"ResourceRequirementList":["Line4"]},{"ID":"Allocation26","PID":"31","JID":"31,Line6","StartDate":"2025-02-02 00:56:00","EndDate":"2025-02-02 01:18:00","Duration":22,"PredAllocationList":[],"ResourceRequirementList":["Line6"]},{"ID":"Allocation29","PID":"121","JID":"121,Line1","StartDate":"2025-02-02 00:36:00","EndDate":"2025-02-02 00:57:00","Duration":21,"PredAllocationList":[],"ResourceRequirementList":["Line1"]}],"IndicmentsList":[{"Allocation":"90","MatchCount":"1","Constraint":"Total makespan","Penalty":"0hard/0medium/-90soft"},{"Allocation":"Allocation-11","MatchCount":"1","Constraint":"Total project delay","Penalty":"0hard/-40medium/0soft"},{"Allocation":"Allocation-14","MatchCount":"1","Constraint":"Total project delay","Penalty":"0hard/-42medium/0soft"},{"Allocation":"Allocation-17","MatchCount":"1","Constraint":"Total project delay","Penalty":"0hard/-90medium/0soft"},{"Allocation":"Allocation-2","MatchCount":"1","Constraint":"Total project delay","Penalty":"0hard/-16medium/0soft"},{"Allocation":"Allocation-20","MatchCount":"1","Constraint":"Total project delay","Penalty":"0hard/-56medium/0soft"},{"Allocation":"Allocation-23","MatchCount":"1","Constraint":"Total project delay","Penalty":"0hard/-64medium/0soft"},{"Allocation":"Allocation-26","MatchCount":"1","Constraint":"Total project delay","Penalty":"0hard/-78medium/0soft"},{"Allocation":"Allocation-29","MatchCount":"1","Constraint":"Total project delay","Penalty":"0hard/-57medium/0soft"},{"Allocation":"Allocation-5","MatchCount":"1","Constraint":"Total project delay","Penalty":"0hard/-30medium/0soft"},{"Allocation":"Allocation-8","MatchCount":"1","Constraint":"Total project delay","Penalty":"0hard/-34medium/0soft"}],"TotalMatch":{"initScore":0,"hardScore":0,"mediumScore":-507,"softScore":-90,"feasible":true,"zero":false,"solutionInitialized":true}}`



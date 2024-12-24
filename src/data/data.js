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

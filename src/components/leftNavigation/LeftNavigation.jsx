import React from 'react'
import {StringLeftNavigation} from "./StringLeftNavigation";

export function LeftNavigation() {

    return (
        <div className="flex flex-wrap lg:flex-col w-full">
            <StringLeftNavigation disabled={false} title="Справка по проектам" navigationPath={"/"}/>
            <StringLeftNavigation disabled={false} title="Отчеты АСУТП" navigationPath={"/"}/>
            <StringLeftNavigation disabled={false} title="Менеджмент IP адресов" navigationPath={"/"}/>
            <StringLeftNavigation disabled={false} title="Планы производства" navigationPath={"/scheduler"}/>
            <StringLeftNavigation disabled={false} title="Прослеживаемость" navigationPath={"/"}/>
            <StringLeftNavigation disabled={false} title="Диспетчеризация" navigationPath={"/"}/>
            <StringLeftNavigation disabled={false} title="Показатели KPI" navigationPath={"/"}/>


        </div>
    )
}
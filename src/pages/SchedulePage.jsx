import Scheduler, {SchedulerData, ViewType, DATE_FORMAT, CellUnit} from "react-big-scheduler-stch";
// import {Scheduler, SchedulerData, ViewType, DATE_FORMAT, CellUnit} from "react-big-schedule";

import dayjs from "dayjs";
// import "react-big-scheduler-stch/lib/css/style.css";


import "./../App.css";

import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend'
import {useEffect, useRef, useState} from "react";
import SchedulerService, {hardware, party, planByHardware, planByParty} from "../services/SchedulerService";
import Select from 'react-select';
import {CustomStyle} from "../data/styleForSelect";
import {useLocation, useNavigate} from "react-router-dom";
import ReportService from "../services/ReportService";
import {encryptData} from "../utils/Сrypto";

import moment from 'moment'
import {Timeline} from "react-calendar-timeline";
import ScheduleService2 from "../services/ScheduleService2";

function SchedulerPage() {

    const navigate = useNavigate();
    const from = '/'

    const [isDisplayByHardware, setIsDisplayByHardware] = useState(false);

    const [currentViewType, setCurrentViewType] = useState(ViewType.Day);

    const stylePartyBut = isDisplayByHardware ? "" : " bg-blue-600 text-white";
    const styleHardwareBut = isDisplayByHardware ? " bg-blue-600 text-white" : "";

    const [party, setParty] = useState([]);
    const [planByParty, setPlanByParty] = useState([]);
    const [hardware, setHardware] = useState([]);
    const [planByHardware, setPlanByHardware] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    const [isSolve, setIsSolve] = useState(false);
    const [score, setScore] = useState("-0hard/-0medium/-0soft");
    const [solverStatus, setSolverStatus] = useState("");


    //Пагинация для партий за период - день
    const [page, setPage] = useState(1);
    const maxItemPage = 23;

    // const [viewModel, setViewModel] = useState(schedulerData);
    const [renderCounter, setRenderCounter] = useState(false);

    const schedulerRef = useRef(null);

    async function assignSettings(date) {
        try {
            const response = await SchedulerService.assignSettings(date);
            return response.data;
        } catch (e) {
            console.error(e)
        }
    }

    async function fetchSolve() {
        try {
            await SchedulerService.solve();
        } catch (e) {
            console.error(e)
        }
    }

    async function fetchStopSolving() {
        try {
            await SchedulerService.stopSolving();
        } catch (e) {
            console.error(e)
        }
    }

    async function fetchPlan() {
        try {
            // setIsLoading(true);
            const response = await SchedulerService.getPlan()
            setDownloadedPlan(response.data)
            setScore(response.data.score)
            setSolverStatus(response.data.solverStatus)
            // console.log(response.data)
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if (solverStatus === "NOT_SOLVING") {
            setIsSolve(false)
        }
    }, [solverStatus])

    function displayByHardware() {
        setIsDisplayByHardware(true);

        // let currDate = viewModel.getViewDates().startDate

        // viewModel.config.dayCellWidth = 5;
        // viewModel.config.minuteStep = 1;
        //
        // let currViewType = viewModel.viewType
        // viewModel.setViewType(ViewType.Month) // нужно из-за багов
        // viewModel.setViewType(currViewType)

        // let schedulerDataOld = viewModel;

        // schedulerDataOld.setDate(currDate)
        //
        // schedulerDataOld.setResources(hardware);
        // schedulerDataOld.setEvents(planByHardware);

        // setViewModel(schedulerDataOld);
        setRenderCounter(prevState => !renderCounter);
    }

    // function checkPaginationNeeded() {
    //     return viewModel.viewType === 0 && planByParty.length + 1 > maxItemPage;
    // }


    function displayByParty() {
        setIsLoading(true)
        // let currDate = viewModel.getViewDates().startDate
        setIsDisplayByHardware(false);
        // viewModel.config.dayCellWidth = 5;
        // viewModel.config.minuteStep = 1;

        // let currViewType = viewModel.viewType
        // viewModel.setViewType(ViewType.Month)
        // viewModel.setViewType(currViewType)

        // let schedulerDataOld = viewModel;

        // schedulerDataOld.setDate(currDate);
        // schedulerDataOld.setEvents(planByParty);


        // if (checkPaginationNeeded()) {
        //     setPage(1);
        //     schedulerDataOld.setResources(party.slice(0,maxItemPage))
        // } else {
        //     schedulerDataOld.setResources(party);
        // }

        // setViewModel(schedulerDataOld);
        setRenderCounter(prevState => !renderCounter);
        setIsLoading(false)
    }

    const [selectedOption, setSelectedOption] = useState(null);
    const [options, setOptions] = useState(null);

    const [downloadedPlan, setDownloadedPlan] = useState(null);

    useEffect(() => {

        console.log(downloadedPlan)

        if (downloadedPlan) {
            ScheduleService2.parseParty(downloadedPlan).then((e) => {
                setParty(e);
                if (!isDisplayByHardware) {
                    // viewModel.viewType === 0 ? viewModel.setResources(e.slice(0, maxItemPage)) : viewModel.setResources(e)
                }
            });

            ScheduleService2.parsePlanByParty(downloadedPlan).then((e) => {
                setPlanByParty(e);
                // if (!isDisplayByHardware)
                // viewModel.setEvents(e);
            });

            ScheduleService2.parseHardware(downloadedPlan).then((e) => {
                setHardware(e);
                // if (isDisplayByHardware)
                // viewModel.setResources(e)
            });

            ScheduleService2.parsePlanByHardware(downloadedPlan).then((e) => {
                setPlanByHardware(e);
                // if (isDisplayByHardware)
                //     viewModel.setEvents(e);
            });
        }

        setRenderCounter(prevState => !renderCounter);

    }, [downloadedPlan]);

    function solve() {
        fetchSolve();
        setIsSolve(true);
    }

    useEffect(() => {
        let intervalId;

        if (isSolve) {
            intervalId = setInterval(() => {
                fetchPlan();
            }, 2000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId); // Очистка при размонтировании или изменении isSolve
        };
    }, [isSolve]); // Зависимость от isSolve


    function stopSolving() {
        setIsSolve(false)
        fetchStopSolving();
    }

    const ops1 = (schedulerData, event) => {
        alert(`You just executed ops1 to event: {id: ${event.id}, title: ${event.title}}`);
    };

    const ops2 = (schedulerData, event) => {
        alert(`You just executed ops2 to event: {id: ${event.id}, title: ${event.title}}`);
    };

    const groups = [
        {
            id: 1,
            title: 'group 1'
        }
        ,
        {id: 2, title: 'group 2'}]

    const items = [
        {
            id: 1,
            group: 1,
            title: 'item 1',
            start_time: moment(),
            end_time: moment().add(1, 'hour')
        },
        {
            id: 2,
            group: 2,
            title: 'item 2',
            start_time: moment().add(-0.5, 'hour'),
            end_time: moment().add(0.5, 'hour')
        },
        {
            id: 3,
            group: 1,
            title: 'item 3',
            start_time: moment().add(2, 'hour'),
            end_time: moment().add(3, 'hour')
        }
    ]

    const onSelectDate = (date) => {
        date = "2025-05-20";
        let result =  assignSettings(date);
        // console.log(date)
        // schedulerData.setDate(date);
        // isDisplayByHardware ? schedulerData.setEvents(planByHardware) : schedulerData.setEvents(planByParty);
        // schedulerData.setEvents(events);
        // setViewModel(schedulerData);
        setRenderCounter(prevState => !renderCounter);

    }


    return (
        <>
            {isLoading && <div
                className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0 text-center "

            >Загрузка</div>}

            <button onClick={() => {
                navigate(from, {replace: true})
            }} className="mt-2 ml-8 py-1 px-2 rounded text-blue-800  hover:bg-blue-50">Вернуться назад
            </button>

            <h1 className="font-bold text-center text-2xl mb-8">Планировщик задач</h1>

            <div className="flex flex-row justify-between my-4 px-4">
                <div className="">
                    <button onClick={displayByParty}
                            className={"border h-[32px] border-gray-300 border-r-0 rounded-l-md px-2" + stylePartyBut}>По
                        партиям
                    </button>
                    <button onClick={displayByHardware}
                            className={"border h-[32px] border-gray-300 rounded-r-md px-2" + styleHardwareBut}>По
                        оборудованию
                    </button>
                </div>


                <div className="w-auto flex flex-row" style={{position: "relative", zIndex: 20}}>


                    {!isSolve &&
                        <div onClick={solve}>
                            <button
                                className="border h-[32px] w-28 border-gray-300 rounded-md text-white px-1 bg-green-600">
                                <i className="fa-solid fa-play"></i>
                                <span className="pl-1">Решать</span>
                            </button>
                        </div>
                    }
                    {isSolve &&
                        <div onClick={stopSolving}>
                            <button
                                className="border h-[32px] w-28 border-gray-300 rounded-md text-white px-1 bg-red-600">
                                <i className="fa-solid fa-stop"></i>
                                <span className="pl-1">Остановить</span>
                            </button>
                        </div>
                    }

                    <div className="flex items-center px-2">
                        <span className="font-medium">
                            Счетчик: {score}
                        </span>
                    </div>
                    <button onClick={onSelectDate}>Отправить дату</button>

                </div>
            </div>

            <div className="px-4">
                <Timeline
                    groups={hardware || groups}
                    items={planByHardware || items}
                    defaultTimeStart={moment().add(-12, 'hour')}
                    defaultTimeEnd={moment().add(12, 'hour')}
                />
            </div>


        </>
    )

}

export default SchedulerPage
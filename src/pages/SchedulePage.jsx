import "./../App.css";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import moment from 'moment'
import {Timeline} from "react-calendar-timeline";
import ScheduleService from "../services/ScheduleService";
import SchedulerService from "../services/ScheduleService";
import "./../components/scheduler/scheduler.css"

import {ModalInfoItem} from "../components/scheduler/ModalInfoItem";
import {ModalDateSettings} from "../components/scheduler/ModalDateSettings";
import {ModalAnalyze} from "../components/scheduler/ModalAnalyze";


function SchedulerPage() {

    const navigate = useNavigate();
    const from = '/'

    const [isDisplayByHardware, setIsDisplayByHardware] = useState(true);

    const stylePartyBut = isDisplayByHardware ? " hover:bg-gray-100" : " bg-blue-800 hover:bg-blue-700 text-white";
    const styleHardwareBut = isDisplayByHardware ? " bg-blue-800 hover:bg-blue-700 text-white" : " hover:bg-gray-100";

    const [party, setParty] = useState([]);
    const [planByParty, setPlanByParty] = useState([]);
    const [hardware, setHardware] = useState([]);
    const [planByHardware, setPlanByHardware] = useState([]);

    const [groups, setGroups] = useState([]);
    const [items, setItems] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    const [isSolve, setIsSolve] = useState(false);
    const [score, setScore] = useState("-0hard/-0medium/-0soft");
    const [solverStatus, setSolverStatus] = useState("");

    const [isModalDateSettings, setIsModalDateSettings] = useState(false);
    const [isModalAnalyze, setIsModalAnalyze] = useState(false);

    const [downloadedPlan, setDownloadedPlan] = useState(null);
    const [analyzeObj, setAnalyzeObj] = useState(null);

    const [selectDate, setSelectDate] = useState(new Date().toISOString().split('T')[0])
    const [selectEndDate, setSelectEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0])

    const [idealEndDateTime, setIdealEndDateTime] = useState(() => new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().replace(/T.*/, 'T02:00'));
    const [maxEndDateTime, setMaxEndDateTime] = useState(() => new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().replace(/T.*/, 'T07:00'));

    const [startTimeLines, setStartTimeLines] = useState([
        {
            id: "1",
            name: "Line1",
            operator: null,
            startDateTime: "08:00"
        },
        {
            id: "2",
            name: "Line2",
            operator: null,
            startDateTime: "08:00"
        },
        {
            id: "3",
            name: "Line3",
            operator: null,
            startDateTime: "08:00"
        },
        {
            id: "4",
            name: "Line4",
            operator: null,
            startDateTime: "08:00"
        },
        {
            id: "5",
            name: "Line5",
            operator: null,
            startDateTime: "08:00"
        },
        {
            id: "6",
            name: "Line6",
            operator: null,
            startDateTime: "08:00"
        },
    ])


    const [timelineKey, setTimelineKey] = useState(0);



    const prepareDataForApi = () => {
        const lineStartTimes = {};

        startTimeLines.forEach(line => {
            lineStartTimes[line.id] = line.startDateTime;
        });

        return lineStartTimes;
    };

    async function assignSettings() {
        const requestData = prepareDataForApi();

        try {
            await SchedulerService.assignSettings(selectDate, selectEndDate, idealEndDateTime, maxEndDateTime, requestData );
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
        } catch (e) {
            console.error(e)
        }
    }

    async function fetchAnalyze() {
        try {
            const response = await SchedulerService.analyze()
            setAnalyzeObj(response.data)
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
        setGroups(hardware);
        setItems(planByHardware);
        setTimelineKey(prev => prev + 1); //для корректной прокрутки в начале
    }

    function displayByParty() {
        setIsDisplayByHardware(false);
        setGroups(party);
        setItems(planByParty);
        setTimelineKey(prev => prev + 1); //для корректной прокрутки в начале
    }


    useEffect(() => {

        if (downloadedPlan) {

            ScheduleService.parseHardware(downloadedPlan).then((e) => {
                setHardware(e);
                if (isDisplayByHardware)
                    setGroups(e);
            });

            ScheduleService.parsePlanByHardware(downloadedPlan).then((e) => {
                setPlanByHardware(e);
                if (isDisplayByHardware)
                    setItems(e);
            });

            ScheduleService.parseParty(downloadedPlan).then((e) => {
                setParty(e);
                if (!isDisplayByHardware) {
                    setGroups(e);
                }
            });

            ScheduleService.parsePlanByParty(downloadedPlan).then((e) => {
                setPlanByParty(e);
                if (!isDisplayByHardware)
                    setItems(e);
            });
            setTimelineKey(prev => prev + 1); //для корректной прокрутки в начале
        }


    }, [downloadedPlan]);

    async function solve() {
        await fetchSolve();
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


    async function stopSolving() {
        setIsSolve(false)
        await fetchStopSolving();
        fetchPlan();
    }

    useEffect(() => {
        assignSettings(selectDate);
        setTimelineKey(prev => prev + 1); //для корректной прокрутки в начале
    }, [selectDate])


    const [selectedItem, setSelectedItem] = useState(null);

    function onItemSelect(itemId, e, time) {
        if (isDisplayByHardware) {
            setSelectedItem(planByHardware.find(item => item.id === itemId))
        } else {
            setSelectedItem(planByParty.find(item => item.id === itemId))
        }
    }

    //Обертка для исключения в библиотеке о передаче пропсов
    const originalConsoleError = console.error;
    useEffect(() => {
        console.error = (...args) => {
            if (!args[0].includes('A props object containing a "key" prop')) {
                originalConsoleError(...args);
            }
        };
        return () => {
            console.error = originalConsoleError;
        };
    }, []);

    function onChangeSelectDate(e) {
        setSelectDate(e);
        setSelectEndDate(new Date(new Date().setDate(new Date(e).getDate() + 1)).toISOString().split('T')[0]);
        setIdealEndDateTime(new Date(new Date().setDate(new Date(e).getDate() + 1)).toISOString().replace(/T.*/, 'T02:00'));
        setMaxEndDateTime(new Date(new Date().setDate(new Date(e).getDate() + 1)).toISOString().replace(/T.*/, 'T07:00'));
    }

    function onChangeEndDate(e) {
        setSelectEndDate(e);
        setIdealEndDateTime(new Date(e).toISOString().replace(/T.*/, 'T02:00'));
        setMaxEndDateTime(new Date(e).toISOString().replace(/T.*/, 'T07:00'));
    }


    return (
        <div className="w-full">

            {selectedItem && <ModalInfoItem info={selectedItem.info} onClose={() => setSelectedItem(null)}/>}

            {isLoading &&
                <div className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0 text-center ">Загрузка</div>
            }

            <button onClick={() => {
                navigate(from, {replace: true})
            }} className="absolute ml-4 py-1 px-2 rounded text-blue-800  hover:bg-blue-50">Вернуться назад
            </button>

            <h1 className="font-bold text-center text-2xl mb-8 mt-6">Планировщик задач</h1>

            <div className="flex flex-row justify-between my-4 px-4 w-2/3">
                <div className="">
                    <button onClick={displayByParty}
                            className={"border h-[30px] border-gray-300 border-r-0 rounded-l-md px-2 shadow-inner" + stylePartyBut}>По
                        партиям
                    </button>
                    <button onClick={displayByHardware}
                            className={"border h-[30px] border-gray-300 rounded-r-md px-2 shadow-inner" + styleHardwareBut}>По
                        оборудованию
                    </button>
                </div>


                <div className="w-auto flex flex-row" style={{position: "relative", zIndex: 20}}>


                    {!isSolve &&
                        <div onClick={solve}>
                            <button
                                className="border h-[30px] w-32 border-gray-300 rounded-md text-white px-1 bg-green-600 hover:bg-green-500">
                                <i className="fa-solid fa-play"></i>
                                <span className="pl-1">Решать</span>
                            </button>
                        </div>
                    }
                    {isSolve &&
                        <div onClick={stopSolving}>
                            <button
                                className="border h-[30px] w-32 border-gray-300 rounded-md text-white px-1 bg-red-600 hover:bg-red-500">
                                <i className="fa-solid fa-stop"></i>
                                <span className="pl-1">Остановить</span>
                            </button>
                        </div>
                    }

                    <div className="flex items-center border rounded-md mx-2">
                        <span className="font-medium px-4">
                            Расчеты: {score}
                        </span>
                        <button onClick={() => {
                            fetchAnalyze();
                            setIsModalAnalyze(true);
                        }}
                                className={" h-full border-gray-300 rounded-r-md px-2 shadow-inner bg-blue-800 hover:bg-blue-700 text-white"}>
                            Подробнее
                            {/*<i className="fa-solid fa-question"></i>*/}
                        </button>
                    </div>

                </div>

                <div>
                    <button onClick={() => {
                        setIsModalDateSettings(true)
                    }}
                            className={"border h-[30px] border-gray-300 rounded-md px-2 shadow-inner bg-blue-800 hover:bg-blue-700 text-white"}>Настроить дату
                    </button>
                </div>
            </div>

            <div className="m-4 border-x-2">
                <Timeline
                    itemRenderer={customItemRenderer} // кастомный item
                    key={timelineKey} //для корректной прокрутки в начале
                    groups={groups}
                    items={items}
                    defaultTimeStart={moment(selectDate).startOf('day').add(-2, 'hour')} //период начального отображения
                    defaultTimeEnd={moment(selectDate).startOf('day').add(30, 'hour')}
                    onItemDoubleClick={onItemSelect}
                    sidebarWidth={150}
                    lineHeight={90}>
                </Timeline>


            </div>

            {isModalDateSettings && <ModalDateSettings onClose={() => {setIsModalDateSettings(false)}}
                                                       selectDate={selectDate} setDate={onChangeSelectDate}
                                                       selectEndDate={selectEndDate} setSelectEndDate={onChangeEndDate}
                                                       lines={startTimeLines} setLines={setStartTimeLines}
                                                       apply={assignSettings}
                                                       idealEndDateTime={idealEndDateTime} setIdealEndDateTime={setIdealEndDateTime}
                                                       maxEndDateTime={maxEndDateTime} setMaxEndDateTime={setMaxEndDateTime}
            />}

            {isModalAnalyze && <ModalAnalyze onClose={() => setIsModalAnalyze(false)}
                                             analyzeObj={analyzeObj}
            />}


        </div>
    )

}


const customItemRenderer = ({item, itemContext, getItemProps}) => {  //кастомный item

    return (
        <div
            key={item.id} // Ключ передаётся напрямую
            {...getItemProps({
                style: {
                    background: itemContext.selected ? "#d0ff9a" : item.itemProps.style.background,
                    border: '1px solid #aeaeae',
                    textAlign: 'start',
                    color: item.itemProps.style.color || 'black',
                    margin: 0,
                    padding: '0',

                    whiteSpace: 'nowrap',      /* Запрет переноса строк */
                    overflow: 'hidden',          /* Скрытие выходящего за границы текста */
                    textOverflow: 'ellipsis',   /* Добавление "..." */
                    maxWidth: '100%',           /* Ограничение ширины */

                },
                onMouseDown: getItemProps().onMouseDown,
                onTouchStart: getItemProps().onTouchStart
            })}
            className="rct-item"
        >
            <div className="flex px-1 justify-between font-medium text-sm text-black">
                {item.title}
            </div>
            <div className="flex flex-col justify-start text-xs">
                {item.info?.np &&
                    <span className=" px-1 rounded">№ партии: <span
                        className="text-blue-500">{item.info.np}</span></span>
                }
                {item.info?.duration &&
                    <span className=" px-1 rounded">Длительность: <span
                        className="text-pink-500">{item.info.duration} мин.</span></span>
                }
                <span className=" px-1 rounded">
                     Время: <span className="text-green-600">{moment(item.start_time).format('HH:mm')} </span>
                    - <span className="text-red-500">{moment(item.end_time).format('HH:mm')}</span>
                </span>

            </div>


        </div>
    );
};


export default SchedulerPage
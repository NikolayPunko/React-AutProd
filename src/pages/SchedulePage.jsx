import "./../App.css";
import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import moment from 'moment'
import {Timeline} from "react-calendar-timeline";
import ScheduleService2 from "../services/ScheduleService2";
import {styleInput} from "../data/styles";
import SchedulerService2 from "../services/ScheduleService2";
import "./../components/scheduler/scheduler.css"

import {ModalInfoItem} from "../components/scheduler/ModalInfoItem"; // Подключаем русскую локаль

moment.locale('ru');
moment.updateLocale('ru', {
    months: 'Январь_Февраль_Март_Апрель_Май_Июнь_Июль_Август_Сентябрь_Октябрь_Ноябрь_Декабрь'.split('_')
});


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

    const [selectedOption, setSelectedOption] = useState(null);
    const [options, setOptions] = useState(null);

    const [downloadedPlan, setDownloadedPlan] = useState(null);
    const [selectDate, setSelectDate] = useState(new Date().toISOString().split('T')[0])


    const [timelineKey, setTimelineKey] = useState(0);


    async function assignSettings(date) {
        try {
            await SchedulerService2.assignSettings(date);
        } catch (e) {
            console.error(e)
        }
    }

    async function fetchSolve() {
        try {
            await SchedulerService2.solve();
        } catch (e) {
            console.error(e)
        }
    }

    async function fetchStopSolving() {
        try {
            await SchedulerService2.stopSolving();
        } catch (e) {
            console.error(e)
        }
    }

    async function fetchPlan() {
        try {
            // setIsLoading(true);
            const response = await SchedulerService2.getPlan()
            setDownloadedPlan(response.data)
            setScore(response.data.score)
            setSolverStatus(response.data.solverStatus)
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

            ScheduleService2.parseHardware(downloadedPlan).then((e) => {
                setHardware(e);
                if (isDisplayByHardware)
                    setGroups(e);
            });

            ScheduleService2.parsePlanByHardware(downloadedPlan).then((e) => {
                setPlanByHardware(e);
                if (isDisplayByHardware)
                    setItems(e);
            });

            ScheduleService2.parseParty(downloadedPlan).then((e) => {
                setParty(e);
                if (!isDisplayByHardware) {
                    setGroups(e);
                }
            });

            ScheduleService2.parsePlanByParty(downloadedPlan).then((e) => {
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


    function stopSolving() {
        setIsSolve(false)
        fetchStopSolving();
    }

    const onSelectDate = (date) => {
        if (date) {
            setSelectDate(date);
        }
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

                    <div className="flex items-center px-4 border rounded mx-2">
                        <span className="font-medium">
                            Расчеты: {score}
                        </span>
                    </div>

                </div>
                <div>
                    <input className={styleInput + " h-[30px]"} type="date"
                           value={selectDate}
                           onChange={(e) => onSelectDate(e.target.value)}/>
                </div>
            </div>

            <div className="m-4 border-x-2">
                <Timeline
                    itemRenderer={customItemRenderer} //кастомный item
                    key={timelineKey} //для корректной прокрутки в начале
                    groups={groups}
                    items={items}
                    defaultTimeStart={moment(selectDate).startOf('day').add(-2, 'hour')} //период начального отображения
                    defaultTimeEnd={moment(selectDate).startOf('day').add(30, 'hour')}

                    // onItemSelect={onItemSelect}
                    onItemDoubleClick={onItemSelect}

                    sidebarWidth={200}
                    lineHeight={135}
                />
            </div>


        </div>
    )

}


const customItemRenderer = ({item, itemContext, getItemProps}) => {  //кастомный item
    return (
        <div
            key={item.id} // Ключ передаётся напрямую
            {...getItemProps({
                style: {
                    background: item.itemProps.style.background || '#ad37f1',
                    // border: '1px solid #ccc',
                    border: '1px solid #aeaeae',
                    // height: '100px'
                    textAlign: 'start',
                    color: item.itemProps.style.color || 'black',
                    // color: 'black',
                    margin: 0,
                    padding: '0', // Убираем внутренние отступы
                    height: '100%', // Занимаем всю высоту ячейки

                    whiteSpace: 'nowrap',      /* Запрет переноса строк */
                    overflow: 'hidden',          /* Скрытие выходящего за границы текста */
                    textOverflow: 'ellipsis',   /* Добавление "..." */
                    maxWidth: '100%',           /* Ограничение ширины */
                }
            })}
            className=""
        >
            <div className="flex px-1 justify-between font-medium text-sm text-black"> {/* Обрезаем длинный текст */}
                {item.title}
            </div>
            <div className="flex flex-col justify-start text-xs"> {/* Компактное расположение дат */}
                {item.info.np &&
                    <span className=" px-1 rounded">№ партии: <span className="text-blue-500">{item.info.np}</span></span>
                        }
                        {item.info.duration &&
                    <span className=" px-1 rounded">Длительность: <span className="text-pink-500">{item.info.duration / 60} мин.</span></span>
                        }
                        <span className=" px-1 rounded">
                  Начало: <span className="text-green-600">{moment(item.start_time).format('HH:mm')}</span>
                </span>
                <span className=" px-1 rounded">
                  Конец: <span className="text-red-500">{moment(item.end_time).format('HH:mm')}</span>
                </span>
            </div>


        </div>
    );
};


export default SchedulerPage
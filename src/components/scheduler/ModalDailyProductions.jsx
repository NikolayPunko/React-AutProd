import React, {useEffect, useState} from 'react'
import {GrayButton} from "./buttons/GrayButton";
import SchedulerService from "../../services/ScheduleService";
import moment from "moment/moment";

export function ModalDailyProductions({selectDate, onClose, setIsModalNotifyError, setMsg}) {

    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDailyProductions()
    }, [selectDate]);

    async function fetchDailyProductions() {
        setLoading(true);
        try {
            const response = await SchedulerService.getDailyProductions(selectDate)
            setData(response.data)
        } catch (e) {
            console.error(e)
            setMsg("Ошибка получения выработки по линиям: " + (e.response?.data?.message || e.message))
            setIsModalNotifyError(true)
        } finally {
            setLoading(false);
        }
    }

    const linesData = Object.values(data);

    return (
        <>
            <div
                className="fixed bg-black/50 top-0 right-0 left-0 bottom-0" style={{zIndex: 99}}
                onClick={onClose}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none" style={{zIndex: 100}}>
                <div className="w-auto min-w-[70vw] max-w-[70vw] bg-white rounded-lg p-5 px-8 pointer-events-auto">
                    <h1 className="text-xl font-medium text-start mb-2">
                        Выработка по линиям за {moment(selectDate).format('DD.MM.YYYY')}
                    </h1>
                    <hr/>

                    <div className="my-3">
                        <div
                            className="flex flex-row w-full bg-blue-800 rounded text-white justify-between sticky top-0 z-10">
                            <span className="w-[15%] py-1 px-2 font-medium text-center">Наименование</span>
                            <span className="w-[15%] py-1 px-2 font-medium text-center">Масса (кг)</span>
                            <span className="w-[70%] py-1 px-2 font-medium text-center">Snpz</span>
                        </div>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-8 font-medium">
                                Загрузка данных...
                                <i className="fa-solid text-blue-800 fa-spinner fa-spin ml-2 text-2xl"></i>
                            </div>
                        ) : linesData.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">Нет данных за выбранную дату</div>
                        ) : (
                            linesData.map((item, index) => (
                                <div key={index}
                                     className="flex flex-row justify-between py-2 border-b">
                                    <div className="w-[15%] px-2 text-center font-medium">
                                        {item.name || '-'}
                                    </div>
                                    <div className="w-[15%] px-2 text-center font-medium">
                                        {item.massa ? item.massa.toFixed(2) : '0.00'}
                                    </div>
                                    <div className="w-[70%] px-2">
                                        {item.snpz && Object.keys(item.snpz).length > 0 ? (
                                            <div className="flex flex-wrap gap-1 justify-center">
                                                {Object.entries(item.snpz).map(([key, value]) => (
                                                    <span
                                                        key={key}
                                                        className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs hover:bg-cyan-100"
                                                        title={`${key} : ${value}`}
                                                    >
                                                        <span className="text-red-700 mr-1">{key}</span>
                                                        :
                                                        <span
                                                            className="ml-1 text-blue-700">{Number(value).toFixed(2)} кг</span>
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-gray-400 text-sm text-center">Нет данных</div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex flex-row justify-end">
                        <div className="flex flex-row justify-end items-center bg-white my-2">
                            <GrayButton text={"Закрыть"} onClick={onClose}/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
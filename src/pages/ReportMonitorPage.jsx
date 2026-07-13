import {observer} from "mobx-react-lite";
import {Navigation} from "../components/Navigation";
import {LeftNavigation} from "../components/leftNavigation/LeftNavigation";
import Loading from "../components/loading/Loading";
import React, {useEffect, useState} from "react";
import {ModalNotify} from "../components/modal/ModalNotify";
import ReportService from "../services/ReportService";
import {BlueButton} from "../components/reportsConstruct/buttons/BlueButton";
import {WhiteButton} from "../components/reportsConstruct/buttons/WhiteButton";
import {parseISO} from "date-fns/parseISO";
import {format} from "date-fns/format";

function ReportMonitorPage() {

    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState(null);
    const [isModalNotify, setIsModalNotify] = useState(false);

    const [events, setEvents] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [fromDate, setFromDate] = useState(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    });
    const [toDate, setToDate] = useState(() => {
        const date = new Date();
        date.setHours(23, 59, 59, 999);
        return date;
    });

    const getReportList = () => {
        const reportMap = new Map();
        events.forEach(e => {
            const key = `${e.category}/${e.reportName}`;
            if (!reportMap.has(key)) {
                reportMap.set(key, {
                    category: e.category,
                    reportName: e.reportName,
                    count: 0
                });
            }
            reportMap.get(key).count++;
        });
        return Array.from(reportMap.values())
            .sort((a, b) => b.count - a.count);
    };

    const [reportList, setReportList] = useState([]);

    // Форматирование для input (локальное время)
    const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Форматирование для API (локальное время без сдвига)
    const formatDateForApi = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const fetchEvents = async (from, to) => {
        try {
            const response = await ReportService.getReportMonitorEvents(
                formatDateForApi(from),
                formatDateForApi(to)
            );
            setEvents(response.data);
        } catch (e) {
            setMsg(e.response?.data?.message || "Ошибка при загрузке событий");
            setIsModalNotify(true);
        }
    };

    useEffect(() => {
        fetchEvents(fromDate, toDate);
    }, []);

    useEffect(() => {
        setReportList(getReportList());
    }, [events]);

    const handleSearch = () => {
        fetchEvents(fromDate, toDate);
    };

    const handleReportSelect = (report) => {
        setSelectedReport(report);
    };

    const getFilteredEvents = () => {
        if (!selectedReport) return events;
        return events.filter(e =>
            e.category === selectedReport.category &&
            e.reportName === selectedReport.reportName
        );
    };

    const formatDateTime = (timestamp) => {
        try {
            let date = parseISO(timestamp);
            return format(date, 'dd.MM.yyyy HH:mm');
        } catch (e) {
            console.error('Error:', e);
            return timestamp;
        }
    };

    const filteredEvents = getFilteredEvents();

    return (
        <>
            <Navigation isHiddenMenu={false} isOpenMenu={false} setOpenMenu={() => {}}/>
            <div className="flex flex-row window-height bg-gray-50">
                <div className="w-[200px] py-2 border-r bg-white">
                    <LeftNavigation/>
                </div>

                <div className="flex flex-col w-full">
                    {isLoading && <Loading/>}

                    {!isLoading && (
                        <>
                            {/* Шапка */}
                            <div className="flex flex-row justify-between items-center px-8 py-4 bg-white border-b border-gray-100">
                                <div>
                                    <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                        Мониторинг отчетов
                                    </h1>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        Просмотр событий использования отчетов
                                    </p>
                                </div>
                            </div>

                            {/* Контент: таблица слева (2/3), фильтры справа (1/3) */}
                            <div className="flex flex-row flex-1 px-8 pt-6 mb-4 gap-6 overflow-hidden">

                                {/* ЛЕВАЯ КОЛОНКА (2/3) - таблица событий */}
                                <div className="w-2/3 flex flex-col gap-4">
                                    {/* Таблица событий */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1">
                                        <div className="overflow-x-auto max-h-full overflow-y-auto">
                                            <table className="w-full table-fixed">
                                                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                                                <tr>
                                                    <th className="w-1/3 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Дата и время
                                                    </th>
                                                    <th className="w-1/3 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Категория
                                                    </th>
                                                    <th className="w-1/3 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Отчет
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                {filteredEvents.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                                            Нет событий за выбранный период
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredEvents.map((event, index) => (
                                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-3 text-sm text-gray-900 whitespace-nowrap">
                                                                {formatDateTime(event.accessTime)}
                                                            </td>
                                                            <td className="px-6 py-3 text-sm text-gray-900">
                                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                                        {event.category}
                                                                    </span>
                                                            </td>
                                                            <td className="px-6 py-3 text-sm text-gray-900 truncate">
                                                                {event.reportName}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* ПРАВАЯ КОЛОНКА (1/3) - фильтры и статистика */}
                                <div className="w-1/3 flex flex-col gap-4">

                                    {/* Список отчетов */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                            <p className="text-sm font-medium text-gray-700">
                                                Отчеты ({reportList.length})
                                            </p>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            <div
                                                className={`px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 ${
                                                    !selectedReport ? 'bg-blue-50 border-l-4 border-l-blue-700' : ''
                                                }`}
                                                onClick={() => setSelectedReport(null)}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-gray-700">Все отчеты</span>
                                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                                        {events.length}
                                                    </span>
                                                </div>
                                            </div>

                                            {reportList.map((report, index) => (
                                                <div
                                                    key={index}
                                                    className={`px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 ${
                                                        selectedReport?.category === report.category &&
                                                        selectedReport?.reportName === report.reportName
                                                            ? 'bg-blue-50 border-l-4 border-l-blue-700'
                                                            : ''
                                                    }`}
                                                    onClick={() => handleReportSelect(report)}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                                {report.reportName}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {report.category}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full ml-2">
                                                            {report.count}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Фильтр по дате */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                        <div className="flex flex-col gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    С
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={formatDateForInput(fromDate)}
                                                    onChange={(e) => {
                                                        const [year, month, day, hours, minutes] = e.target.value.split(/[-T:]/).map(Number);
                                                        const date = new Date(year, month - 1, day, hours, minutes);
                                                        setFromDate(date);
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    По
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={formatDateForInput(toDate)}
                                                    onChange={(e) => {
                                                        const [year, month, day, hours, minutes] = e.target.value.split(/[-T:]/).map(Number);
                                                        const date = new Date(year, month - 1, day, hours, minutes);
                                                        setToDate(date);
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <BlueButton
                                                    text={"Показать"}
                                                    onClick={handleSearch}
                                                    className={"w-full"}
                                                />
                                                <WhiteButton
                                                    text={"Сегодня"}
                                                    onClick={() => {
                                                        const todayStart = new Date();
                                                        todayStart.setHours(0, 0, 0, 0);
                                                        const todayEnd = new Date(todayStart);
                                                        todayEnd.setHours(23, 59, 59, 999);
                                                        setFromDate(todayStart);
                                                        setToDate(todayEnd);
                                                        fetchEvents(todayStart, todayEnd);
                                                    }}
                                                    className={"w-28"}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Статистика */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-500">Запросов</p>
                                                <p className="text-2xl font-bold text-gray-900">{filteredEvents.length}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {isModalNotify && (
                        <ModalNotify title={"Результат операции"} message={msg} onClose={() => setIsModalNotify(false)}/>
                    )}
                </div>
            </div>
        </>
    );
}

export default observer(ReportMonitorPage);
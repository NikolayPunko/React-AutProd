import Scheduler, {SchedulerData, ViewType, DATE_FORMAT, CellUnit} from "react-big-scheduler-stch";
import dayjs from "dayjs";
// import "react-big-scheduler-stch/lib/css/style.css";
import moment from 'moment';


import "./../App.css";

import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend'
import {useEffect, useRef, useState} from "react";
import SchedulerService, {hardware, party, planByHardware, planByParty} from "../services/SchedulerService";
import Select from 'react-select';
import {CustomStyle} from "../data/styleForSelect";
import {useLocation, useNavigate} from "react-router-dom";

moment.updateLocale('ru', {
    week: {
        dow: 1 // Устанавливаем понедельник как первый день недели
    }
});


function TaskSchedulerPage() {

    const navigate = useNavigate();
    const from = '/'

    const [isDisplayByHardware, setIsDisplayByHardware] = useState(false);

    const [currentViewType, setCurrentViewType] = useState(ViewType.Month);

    const stylePartyBut = isDisplayByHardware ? "" : " bg-blue-600 text-white";
    const styleHardwareBut = isDisplayByHardware ? " bg-blue-600 text-white" : "";

    const [party, setParty] = useState([]);
    const [planByParty, setPlanByParty] = useState([]);
    const [hardware, setHardware] = useState([]);
    const [planByHardware, setPlanByHardware] = useState([]);

    const [isLoading, setIsLoading] = useState(false);


    //Пагинация для партий за период - день
    const [page, setPage] = useState(1);
    const maxItemPage = 23;


    const schedulerData = new SchedulerData(
        // new dayjs().format(DATE_FORMAT) ,
        new dayjs("2025-04-06"),
        currentViewType, false, false, {
            customCellWidth: '180',
            views: [
                {viewName: 'День', viewType: ViewType.Day},
                // {viewName: 'Неделя', viewType: ViewType.Week},
                {viewName: 'Неделя', viewType: ViewType.Custom1},
                {viewName: 'Месяц', viewType: ViewType.Month},
                {viewName: 'Квартал', viewType: ViewType.Quarter},
                // {viewName: 'Год', viewType: ViewType.Year},
                {viewName: 'Год', viewType: ViewType.Custom2},
            ],
            besidesWidth: window.innerWidth <= 1600 ? 100 : 350,
            schedulerContentHeight: window.innerHeight - 300

        }, {
            getCustomDateFunc: getCustomDate,
            isNonWorkingTimeFunc: isNonWorkingTime
        }
    );


    const [viewModel, setViewModel] = useState(schedulerData);
    const [renderCounter, setRenderCounter] = useState(false);

    const schedulerRef = useRef(null);


    useEffect(() => {


        // SchedulerService.parseParty(eventsJson2).then((e)=>{
        //     setParty(e);
        //     viewModel.setResources(e);
        // });
        //
        //  SchedulerService.parsePlanByParty(eventsJson2).then((e)=>{
        //      setPlanByParty(e);
        //      viewModel.setEvents(e);
        //  });
        //
        //  SchedulerService.parseHardware(eventsJson2).then((e)=>{
        //      setHardware(e);
        //  });
        //
        //  SchedulerService.parsePlanByHardware(eventsJson2).then((e)=>{
        //      setPlanByHardware(e);
        //  });


        configScheduler();
        // schedulerData.setResources(party);
        // schedulerData.setEvents(planByParty);
        setViewModel(schedulerData);
        setRenderCounter(prevState => !renderCounter);


    }, []);


    function configScheduler() {
        schedulerData.setSchedulerLocale("ru");
        schedulerData.setCalendarPopoverLocale("by_BY"); // this uses antd [List of supported locales](https://ant.design/docs/react/i18n#supported-languages)

        schedulerData.config.dayCellWidth = 20; //ширина клеток для дня
        schedulerData.config.minuteStep = 5;

        //предложить идею если по партиям только одна синяя полоска то можно делать интервал хоть 5 минут, а когда переключаем по оборудованию тогда 1 минута
        //или делать пагинацию

        //почитать про библиотеки , такие как react-window или react-virtualized, чтобы отрисовывать только те элементы, которые находятся в видимой области.

        schedulerData.config.resourceName = "Название";
        // schedulerData.config.schedulerWidth = '1450';
        // schedulerData.config.schedulerContentHeight = "300"
        // schedulerData.config.dayResourceTableWidth = '30';
        // schedulerData.config.monthResourceTableWidth = '30';
        // schedulerData.config.yearResourceTableWidth = '30';
        // schedulerData.config.weekResourceTableWidth = '30';
        // schedulerData.config.customCellWidth = '30';
        // schedulerData.config.customResourceTableWidth = '30';
        schedulerData.config.headerEnabled = true;
        schedulerData.config.calendarPopoverEnabled = true;
        schedulerData.config.scrollToSpecialDaysjsEnabled = true;
        // schedulerData.config.tableHeaderHeight = 300;

        // schedulerData.config.eventItemPopoverEnabled = false;

        // schedulerData.config.eventItemHeight = 22;
        // schedulerData.config.eventItemHeight = 40;
        // schedulerData.config.eventItemLineHeight = 50;
        // schedulerData.config.defaultEventBgColor = "#1c5eb6";
        // schedulerData.config.nonWorkingTimeHeadColor = "#000000";
        // schedulerData.config.nonWorkingTimeHeadBgColor = "#d9d9d9";
        // schedulerData.config.nonWorkingTimeBodyBgColor = "#d9d9d9";
        // schedulerData.config.summaryColor = "#d9d9d9";
        schedulerData.config.movable = false;
        schedulerData.config.creatable = false;
        // schedulerData.setLocaleMoment(moment);
        schedulerData.config.nonAgendaDayCellHeaderFormat = "HH:mm";
        // schedulerData.config.nonAgendaOtherCellHeaderFormat = "ddd|M/D";
        // schedulerData.config.checkConflict = true;
        schedulerData.scrollLeft = 2;


        // schedulerData.config.dayResourceTableWidth = 20;
        // schedulerData.config.creatable = true;
        // schedulerData.config.crossResourceMove = true;
        // schedulerData.config.creatable = true;


    }


    const prevClick = (schedulerData) => {
        schedulerData.prev();
        isDisplayByHardware ? schedulerData.setEvents(planByHardware) : schedulerData.setEvents(planByParty);
        // schedulerData.setEvents(events);
        schedulerData.config.scrollLeft = 0;
        setViewModel(schedulerData);
        setRenderCounter(prevState => !renderCounter);
    };

    const nextClick = (schedulerData) => {
        schedulerData.next();
        isDisplayByHardware ? schedulerData.setEvents(planByHardware) : schedulerData.setEvents(planByParty);
        // schedulerData.setEvents(events);
        setViewModel(schedulerData);
        setRenderCounter(prevState => !renderCounter);
    };

    const onViewChange = (schedulerData, view) => {
        schedulerData.setViewType(view.viewType);
        setCurrentViewType(view.viewType);
        schedulerData.config.customCellWidth = view.viewType === ViewType.Custom1 ? 180 : 80;
        // isDisplayByHardware ? schedulerData.setEvents(planByHardware) : schedulerData.setEvents(planByParty);

        if (isDisplayByHardware) {
            schedulerData.setEvents(planByHardware);
            schedulerData.setResources(hardware);
        } else {
            schedulerData.setEvents(planByParty)
            checkPaginationNeeded() ? viewModel.setResources(party.slice(0, maxItemPage)) : viewModel.setResources(party)
        }

        // schedulerData.setEvents(events);
        setViewModel(schedulerData);
        setRenderCounter(prevState => !renderCounter);

    }

    const onSelectDate = (schedulerData, date) => {
        schedulerData.setDate(date);
        isDisplayByHardware ? schedulerData.setEvents(planByHardware) : schedulerData.setEvents(planByParty);
        // schedulerData.setEvents(events);
        setViewModel(schedulerData);
        setRenderCounter(prevState => !renderCounter);


    }

    const eventClicked = (schedulerData, event) => {
        // alert(`You just clicked an event: {id: ${event.id}, title: ${event.title}}`);
    };

    const onScrollRight = (schedulerData, schedulerContent, maxScrollLeft) => {
        if (schedulerData.ViewTypes === ViewType.Day) {
            schedulerData.next();
            isDisplayByHardware ? schedulerData.setEvents(planByHardware) : schedulerData.setEvents(planByParty);
            // schedulerData.setEvents(events);
            setViewModel(schedulerData);

            schedulerContent.scrollLeft = maxScrollLeft - 10;
            setRenderCounter(prevState => !renderCounter);
        }
    }

    const onScrollLeft = (schedulerData, schedulerContent, maxScrollLeft) => {
        if (schedulerData.ViewTypes === ViewType.Day) {
            schedulerData.prev();
            isDisplayByHardware ? schedulerData.setEvents(planByHardware) : schedulerData.setEvents(planByParty);
            // schedulerData.setEvents(events);
            setViewModel(schedulerData);

            schedulerContent.scrollLeft = 10;
            setRenderCounter(prevState => !renderCounter);
        }
    }

    const onScrollTop = (schedulerData, schedulerContent, maxScrollTop) => {
        // console.log('onScrollTop');
    }

    const onScrollBottom = (schedulerData, schedulerContent, maxScrollTop) => {
        // console.log('onScrollBottom');
    }

    const toggleExpandFunc = (schedulerData, slotId) => {
        schedulerData.toggleExpandStatus(slotId);
        setViewModel(schedulerData);
        setRenderCounter(prevState => !renderCounter);
    }

    function isNonWorkingTime(schedulerData, time) {
        if (schedulerData.viewType === ViewType.Day) {
            // let hour = localeMoment(time).hour();
            // if (hour < 9 || hour > 18) return true;
        } else {
            let dayOfWeek = new Date(time).getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) return true;
        }

        return false;
    }

    function getViewTypeById(id){
        switch (id) {
            case 0: return ViewType.Day
            case 2: return ViewType.Month
            case 3: return ViewType.Quarter
            case 6: return ViewType.Custom1
            case 7: return ViewType.Custom2
        }
    }


    function displayByHardware() {
        setIsDisplayByHardware(true);

        let currDate = viewModel.getViewDates().startDate

        viewModel.config.dayCellWidth = 5;
        viewModel.config.minuteStep = 1;

        let currViewType = viewModel.viewType
        viewModel.setViewType(ViewType.Month) // нужно из-за багов
        viewModel.setViewType(currViewType)

        let schedulerDataOld = viewModel;

        schedulerDataOld.setDate(currDate)

        schedulerDataOld.setResources(hardware);
        schedulerDataOld.setEvents(planByHardware);

        setViewModel(schedulerDataOld);
        setRenderCounter(prevState => !renderCounter);
    }

    function checkPaginationNeeded() {
        return viewModel.viewType === 0 && planByParty.length + 1 > maxItemPage;
    }


    function displayByParty() {
        setIsLoading(true)
        let currDate = viewModel.getViewDates().startDate
        setIsDisplayByHardware(false);
        viewModel.config.dayCellWidth = 20;
        viewModel.config.minuteStep = 5;

        let currViewType = viewModel.viewType
        viewModel.setViewType(ViewType.Month)
        viewModel.setViewType(currViewType)

        let schedulerDataOld = viewModel;

        schedulerDataOld.setDate(currDate);
        schedulerDataOld.setEvents(planByParty);


        if (checkPaginationNeeded()) {
            setPage(1);
            schedulerDataOld.setResources(party.slice(0,maxItemPage))
        } else {
            schedulerDataOld.setResources(party);
        }

        setViewModel(schedulerDataOld);
        setRenderCounter(prevState => !renderCounter);
        setIsLoading(false)
    }

    function nextPage() {

        if (page === Math.ceil(planByParty.length / maxItemPage)) return;

        let schedulerDataOld = viewModel;

        let count = 0;
        let list = [];

        for (let i = page * maxItemPage; i < (page + 1) * maxItemPage; i++) {

            if(party.length === i) break;

            list[count] = party[i];
            count++;
        }
        setPage(prevState => prevState + 1)
        schedulerDataOld.setResources(list);
        setViewModel(schedulerDataOld);
        setRenderCounter(prevState => !renderCounter);

    }

    function prevPage() {

        if (page === 1) return;

        let schedulerDataOld = viewModel;

        let count = 0;
        let list = [];

        for (let i = (page - 1) * maxItemPage - maxItemPage; i < (page - 1) * maxItemPage; i++) {

            list[count] = party[i];
            count++;
        }
        setPage(prevState => prevState - 1)
        schedulerDataOld.setResources(list);
        setViewModel(schedulerDataOld);
        setRenderCounter(prevState => !renderCounter);
    }


    function getCustomDate(schedulerData, num, date = undefined) {

        if (!date) {
            date = schedulerData.startDate; // Используем текущую дату из schedulerData
        }

        const viewType = schedulerData.viewType;
        let startDate, endDate;

        if (viewType === ViewType.Custom1) {
            startDate = dayjs(date)
                .add(num, 'week')
                .startOf('week')
                .format(DATE_FORMAT);
            endDate = dayjs(startDate)
                .add(6, 'days')
                .format(DATE_FORMAT);
        } else if (viewType === ViewType.Custom2) {

            startDate = dayjs(date).add(num, 'year').startOf('year').format(DATE_FORMAT);
            endDate = dayjs(startDate).endOf('year').format(DATE_FORMAT);


        } else {
            startDate = moment(date).add(num, 'days').format(DATE_FORMAT);
            endDate = startDate;
        }

        return {
            startDate: startDate,
            endDate: endDate,
            cellUnit: CellUnit.Day
        };
    }

    const [selectedOption, setSelectedOption] = useState(null);
    const [options, setOptions] = useState(null);

    const [downloadedPlan, setDownloadedPlan] = useState(null);

    useEffect(() => {

        if (downloadedPlan) {
            SchedulerService.parseParty(downloadedPlan.data).then((e) => {
                setParty(e);
                if (!isDisplayByHardware){
                    viewModel.viewType === 0 ? viewModel.setResources(e.slice(0, maxItemPage)) : viewModel.setResources(e)
                }
            });

            SchedulerService.parsePlanByParty(downloadedPlan.data).then((e) => {
                setPlanByParty(e);
                if (!isDisplayByHardware)
                viewModel.setEvents(e);
            });

            SchedulerService.parseHardware(downloadedPlan.data).then((e) => {
                setHardware(e);
                if (isDisplayByHardware)
                    viewModel.setResources(e)
            });

            SchedulerService.parsePlanByHardware(downloadedPlan.data).then((e) => {
                setPlanByHardware(e);
                if (isDisplayByHardware)
                    viewModel.setEvents(e);
            });
        }

        setRenderCounter(prevState => !renderCounter);

    }, [downloadedPlan]);

    useEffect(() => {

        fetchPlansId();

    }, []);

    async function fetchPlanByPlanId(planId) {
        try {
            const response = await SchedulerService.getByPlanId(planId)
            console.log(response)
            setDownloadedPlan(response.data)
        } catch (e) {
            // console.log("Ошибка!")
            const error = e;
        }
    }

    async function fetchPlansId() {
        try {
            const response = await SchedulerService.getPlansId()
            convertPlansIdToOptions(response.data)
        } catch (e) {
            // console.log("Ошибка!")
            const error = e;
        }
    }

    function convertPlansIdToOptions(plansId) {
        const options = []
        for (let i = 0; i < plansId.length; i++) {
            options.push({value: plansId[i], label: plansId[i]})
        }
        setOptions(options);
    }


    function handleChangePlan(event) {
        if (event != null) {
            setSelectedOption(event);

            fetchPlanByPlanId(event.value)
        } else {
            setSelectedOption([]);
        }
    }

    let rightCustomHeader = (
        <div className="">
            <button onClick={displayByParty}
                    className={"border h-[32px] border-gray-300 border-r-0 rounded-l-md px-2" + stylePartyBut}>По
                партиям
            </button>
            <button onClick={displayByHardware}
                    className={"border h-[32px] border-gray-300 rounded-r-md px-2" + styleHardwareBut}>По оборудованию
            </button>
        </div>
    );

    let leftCustomHeader = (
        <div className="w-40" style={{position: "relative", zIndex: 20}}>
            <Select className="text-xs font-medium"
                    placeholder={"Выберите план"}
                    value={selectedOption}
                    onChange={handleChangePlan}
                    styles={CustomStyle}
                    options={options}
                    isClearable={false}
                    isSearchable={false}
            />
        </div>
    );


    return (

        <div className="">

            {isLoading && <div
                className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0 text-center "

            >Загрузка</div> }

            <button onClick={() => {
                navigate(from, {replace: true})
            }} className="mt-2 ml-8 py-1 px-2 rounded text-blue-800  hover:bg-blue-50">Вернуться назад
            </button>

            <h1 className="font-bold text-center text-2xl mb-8">Планировщик задач</h1>

            <div className="schedular-container">
                <DndProvider backend={HTML5Backend}>
                    <Scheduler
                        ref={schedulerRef}
                        schedulerData={viewModel}
                        prevClick={prevClick}
                        nextClick={nextClick}
                        onSelectDate={onSelectDate}
                        onViewChange={onViewChange}
                        eventItemClick={eventClicked}
                        onScrollLeft={onScrollLeft}
                        onScrollRight={onScrollRight}
                        onScrollTop={onScrollTop}
                        onScrollBottom={onScrollBottom}
                        // toggleExpandFunc={toggleExpandFunc}
                        rightCustomHeader={leftCustomHeader}
                        leftCustomHeader={rightCustomHeader}
                        // eventItemTemplateResolver={eventItemTemplateResolver} // Используем кастомизацию отображения
                        // eventItemPopoverTemplateResolver={}

                    />
                </DndProvider>
            </div>

            {viewModel.viewType === 0 && !isDisplayByHardware && planByParty.length>maxItemPage && <div className="flex flex-row justify-center">
                <button onClick={prevPage}
                        className="mt-2 ml-8 py-1 px-2 rounded text-blue-800  hover:bg-blue-50">Пред.
                </button>
                <span
                    className="mt-2 ml-8 py-1 px-2 rounded text-blue-800">{page}/{Math.ceil(planByParty.length / maxItemPage)}</span>
                <button onClick={nextPage}
                        className="mt-2 ml-8 py-1 px-2 rounded text-blue-800  hover:bg-blue-50">След.
                </button>
            </div> }


        </div>
    );
}

export default TaskSchedulerPage;

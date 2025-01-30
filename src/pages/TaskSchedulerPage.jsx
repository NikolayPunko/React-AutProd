import Scheduler, {SchedulerData, ViewType, DATE_FORMAT, CellUnit} from "react-big-scheduler-stch";
import dayjs from "dayjs";
// import "react-big-scheduler-stch/lib/css/style.css";
import moment from 'moment';


import "./../App.css";

import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend'
import {
    // resourse,
    // events,
    // events2,
    // resourseExample2,
    // resourseExample1,
    // eventsExample2,
    // eventsExample1
} from "./../data/data";
import {useEffect, useState} from "react";
import SchedulerService, {hardware, party, planByHardware, planByParty} from "../services/SchedulerService";

moment.updateLocale('ru', {
    week: {
        dow: 1 // Устанавливаем понедельник как первый день недели
    }
});


function TaskSchedulerPage() {

    const [isDisplayByHardware, setIsDisplayByHardware] = useState(false);

    const [currentViewType, setCurrentViewType] = useState(ViewType.Month);

    const stylePartyBut = isDisplayByHardware ? "" : " bg-blue-600 text-white";
    const styleHardwareBut = isDisplayByHardware ? " bg-blue-600 text-white" : "";

    const [party, setParty] = useState([]);
    const [planByParty, setPlanByParty] = useState([]);
    const [hardware, setHardware] = useState([]);
    const [planByHardware, setPlanByHardware] = useState([]);


    const schedulerData = new SchedulerData(
        new dayjs().format(DATE_FORMAT),
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
            // schedulerContentHeight: '100%'

        }, {
            getCustomDateFunc: getCustomDate,
            isNonWorkingTimeFunc: isNonWorkingTime
        }
    );


    const [viewModel, setViewModel] = useState(schedulerData);
    const [renderCounter, setRenderCounter] = useState(false);


    useEffect(() => {


       SchedulerService.parseParty().then((e)=>{
           setParty(e);
           viewModel.setResources(e);
       });

        SchedulerService.parsePlanByParty().then((e)=>{
            setPlanByParty(e);
            viewModel.setEvents(e);
        });

        SchedulerService.parseHardware().then((e)=>{
            setHardware(e);
        });

        SchedulerService.parsePlanByHardware().then((e)=>{
            setPlanByHardware(e);
        });



        configScheduler();
        schedulerData.setResources(party);
        schedulerData.setEvents(planByParty);
        setViewModel(schedulerData);
        setRenderCounter(prevState => !renderCounter);


    }, []);

    useEffect(() => {
        console.log("useEffect")
        let schedulerDataOld = viewModel;
        schedulerDataOld.setResources(party);
        schedulerDataOld.setEvents(planByParty);
    }, [party,planByHardware])

    function configScheduler() {
        schedulerData.setSchedulerLocale("ru");
        schedulerData.setCalendarPopoverLocale("by_BY"); // this uses antd [List of supported locales](https://ant.design/docs/react/i18n#supported-languages)
        schedulerData.setMinuteStep(10);
        // schedulerData.setEvents(events);
        schedulerData.config.resourceName = "Название";
        // schedulerData.config.schedulerWidth = '1450';
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

        // schedulerData.config.eventItemHeight = 22;
        // schedulerData.config.eventItemLineHeight = 50;
        // schedulerData.config.defaultEventBgColor = "#1c5eb6";
        // schedulerData.config.nonWorkingTimeHeadColor = "#000000";
        // schedulerData.config.nonWorkingTimeHeadBgColor = "#d9d9d9";
        // schedulerData.config.nonWorkingTimeBodyBgColor = "#d9d9d9";
        // schedulerData.config.summaryColor = "#d9d9d9";
        schedulerData.config.movable = false;
        schedulerData.config.creatable = false;
        schedulerData.config.movable = false;
        // schedulerData.setLocaleMoment(moment);
        schedulerData.config.nonAgendaDayCellHeaderFormat = "HH:mm";
        // schedulerData.config.nonAgendaOtherCellHeaderFormat = "ddd|M/D";
        // schedulerData.config.checkConflict = true;
    }

    const prevClick = (schedulerData) => {
        schedulerData.prev();
        isDisplayByHardware ? schedulerData.setEvents(planByHardware) : schedulerData.setEvents(planByParty);
        // schedulerData.setEvents(events);
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
        isDisplayByHardware ? schedulerData.setEvents(planByHardware) : schedulerData.setEvents(planByParty);
        // schedulerData.setEvents(events);
        setViewModel(schedulerData);
        setRenderCounter(prevState => !renderCounter);


    }

    const onSelectDate = (schedulerData, date) => {
        schedulerData.setDate(date);
        isDisplayByHardware ? schedulerData.setEvents(planByHardware) : schedulerData.setEvents(planByHardware);
        // schedulerData.setEvents(events);
        setViewModel(schedulerData);
        setRenderCounter(prevState => !renderCounter);

        //дописать логику когда по партиям когда по оборудоавнию
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
        console.log('onScrollTop');
    }

    const onScrollBottom = (schedulerData, schedulerContent, maxScrollTop) => {
        console.log('onScrollBottom');
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

    function displayByHardware() {
        setIsDisplayByHardware(true);


        let schedulerDataOld = viewModel;
        schedulerDataOld.setResources(hardware);
        schedulerDataOld.setEvents(planByHardware);
        setViewModel(schedulerDataOld);
        setRenderCounter(prevState => !renderCounter);
    }

    function displayByParty() {
        setIsDisplayByHardware(false);

        let schedulerDataOld = viewModel;
        schedulerDataOld.setResources(party);
        schedulerDataOld.setEvents(planByParty);
        setViewModel(schedulerDataOld);
        setRenderCounter(prevState => !renderCounter);
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

    return (

        <div className="text-center">
            <h1 className="font-bold text-2xl my-8">Планировщик задач</h1>

            <div className="schedular-container">
                <DndProvider backend={HTML5Backend}>
                    <Scheduler
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
                        // leftCustomHeader={leftCustomHeader}
                        leftCustomHeader={rightCustomHeader}
                    />
                </DndProvider>
            </div>


        </div>
    );
}

export default TaskSchedulerPage;

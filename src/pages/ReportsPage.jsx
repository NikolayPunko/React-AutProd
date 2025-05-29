import {Navigation} from "../components/Navigation";
import {LeftNavigation} from "../components/leftNavigation/LeftNavigation";
import ReportEditor from "../components/reportsConstruct/ReportEditor";
import React, {useEffect, useRef, useState} from "react";
import ReportService from "../services/ReportService";
import Loading from "../components/loading/Loading";
import {ModalNotify} from "../components/modal/ModalNotify";


function ReportsPage() {

    const childRef = useRef();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);


    const [isShowReport, setIsShowReport] = useState(false);

    const [isModalError, setIsModalError] = useState(false);

    // const [selectReport, setSelectReport] = useState(null);

    const [reportTemplate, setReportTemplate] = useState(null);

    const [reportData, setReportData] = useState(null);

    const [reportsName, setReportsName] = useState([]);


    async function fetchReportTemplate(reportName) {
        try {
            const response = await ReportService.getReportTemplateByReportName(reportName);
            setReportTemplate(response.data);

        } catch (e) {
            setReportTemplate(null);
            setIsLoading(false);
            setError(e.response.data.message);
            setIsModalError(true);
        }
    }

    async function fetchReportData(reportName) {
        try {
            const response = await ReportService.getDataByReportName(reportName);
            setReportData(response.data);

        } catch (e) {
            setReportData(null);
            setIsLoading(false);
            setError(e.response.data.message);
            setIsModalError(true);

        }
    }

    async function fetchReportsName() {
        try {
            const response = await ReportService.getReportsNameGroupCategory();
            setReportsName(response.data);
        } catch (e) {
            setError(e.response.data.message);
            setIsModalError(true);
        }
    }

    useEffect(() => {
        fetchReportsName();
    }, []);

    useEffect(() => {
        if (reportData && reportTemplate) {
            // console.log(reportData)
            // console.log(reportTemplate)


            if (childRef.current) { //вызываем метод рендера у ребенка
                childRef.current.customMethod(reportData, reportTemplate.content, reportTemplate.styles);
            }
            setTimeout(() => {
                setIsShowReport(true)
                setIsLoading(false);
            }, 1500);

        }

    }, [reportTemplate, reportData]);

    async function handleReportClick(reportName) {
        setReportTemplate(null);
        setReportData(null);

        setIsLoading(true)
        await fetchReportTemplate(reportName);
        await fetchReportData(reportName);


        // setIsShowReport(true)

    }


    return (<>


            <Navigation isHiddenMenu={false} isOpenMenu={false} setOpenMenu={() => {
            }}/>
            <div className="flex flex-row window-height">
                <div className="w-[200px] py-2 border-r-2 bg-gray-50 justify-stretch">
                    <LeftNavigation/>
                </div>
                <div className="flex flex-col w-full">

                    {isLoading && <Loading/>

                    }

                    {!isShowReport && !isLoading && <>
                        <div className="px-24 py-16">
                            <span className="text-2xl font-bold">Доступные отчеты</span>
                        </div>
                        {/*<div className="px-24 py-2">*/}
                        {/*    <div className="flex flex-col w-1/4">*/}
                        {/*        <span className="px-2 bg-blue-800 text-white rounded shadow-inner">01. Отчеты LU_MOVE</span>*/}
                        {/*          <button onClick={() => handleReportClick("")}*/}
                        {/*          className = "my-1 mx-3 px-2 text-left rounded text-blue-800  hover:bg-blue-50" > За*/}
                        {/*          текущие сутки*/}
                        {/*         </button>*/}


                        {/*        {reportsName.map((option, index) => (*/}
                        {/*            <button key={index} onClick={() => handleReportClick(option)}*/}
                        {/*                    className="my-1 mx-3 px-2 text-left rounded text-blue-800  hover:bg-blue-50">*/}
                        {/*                {option}*/}
                        {/*            </button>*/}
                        {/*        ))}*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        <div className="px-24 py-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                {reportsName.map((option, index) => (
                                    // <div key={index} className="border rounded-lg p-3">
                                    <div key={index} className=" p-3">
                                        <span className="block w-full px-2 bg-blue-800 text-white rounded shadow-inner">
                                            {index} {option.category}
                                        </span>

                                        <div className="mt-2">
                                            {option.reports.map((report, reportIndex) => (<button
                                                    key={reportIndex}
                                                    onClick={() => handleReportClick(report)}
                                                    className="block w-full my-1 px-2 text-left rounded text-blue-800 hover:bg-blue-50"
                                                >
                                                    {report}
                                                </button>))}
                                        </div>
                                    </div>))}
                            </div>
                        </div>
                    </>}


                    <div className={isShowReport && !isLoading ? 'block' : 'hidden'}>

                        <ReportEditor previewMode={true} onCloseReport={() => setIsShowReport(!isShowReport)}
                                      ref={childRef}
                        />


                    </div>

                    {isModalError &&
                        <ModalNotify title={"Ошибка"} message={error} onClose={() => setIsModalError(false)}/>}


                </div>

            </div>
        </>)
}


export default ReportsPage;
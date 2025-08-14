import {Navigation} from "../components/Navigation";
import {LeftNavigation} from "../components/leftNavigation/LeftNavigation";
import React, {useEffect, useState} from "react";
import ReportService from "../services/ReportService";
import Loading from "../components/loading/Loading";
import {ModalNotify} from "../components/modal/ModalNotify";
import {ModalParameter} from "../components/reportsConstruct/ModalParameter";
import {ViewReport} from "../components/reportsConstruct/ViewReport";


function ReportsPage() {

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);


    const [isShowReport, setIsShowReport] = useState(false);
    const [isModalError, setIsModalError] = useState(false);
    const [isModalParameter, setIsModalParameter] = useState(false);

    const [reportTemplate, setReportTemplate] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [reportsName, setReportsName] = useState([]);
    const [selectName, setSelectName] = useState("unknown")
    const [parametersMeta, setParametersMeta] = useState([]);
    const [parameters, setParameters] = useState([]);


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

    async function fetchReportData(reportName, parameters) {
        try {
            const response = await ReportService.getDataByReportName(reportName, parameters);
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

    async function fetchParametersMeta(reportName) {
        try {
            const response = await ReportService.getParametersMetaByReportName(reportName);
            setParametersMeta(response.data);
        } catch (e) {
            setError(e.response.data.message);
            setIsModalError(true);
        }
    }

    useEffect(() => {
        fetchReportsName();
    }, []);

    useEffect(() => {
        if
        (reportData && reportTemplate) {
            setIsShowReport(true)
            setTimeout(() => {
                setIsLoading(false);
            }, 3000);
        }
    }, [reportTemplate, reportData]);

    async function handleReportClick(reportName) {
        await fetchParametersMeta(reportName);
        setReportTemplate(null);
        setReportData(null);
        setSelectName(reportName);
        setIsModalParameter(true);
    }


    async function onSubmitParameters(parameters) {
        setIsModalParameter(false);
        setIsLoading(true);
        setParameters(parameters);
        await fetchReportTemplate(selectName);
        await fetchReportData(selectName, parameters);
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
                        <span className="text-2xl font-bold">Сервер отчётов АСУТП</span>
                    </div>

                    <div className="px-24 py-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {reportsName.map((option, index) => (
                                <div key={index} className="border rounded-lg p-3">
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


                {isShowReport  &&
                    <div className={isLoading? "hidden":""}>
                        <ViewReport data={reportData} dataParam={parameters} html={reportTemplate.content} css={reportTemplate.styles}
                                    onClose={() => setIsShowReport(false)} isBookOrientation={reportTemplate.bookOrientation}/>
                    </div>
                }

                {isModalError &&
                    <ModalNotify title={"Ошибка"} message={error} onClose={() => setIsModalError(false)}/>}


                {isModalParameter &&
                    <ModalParameter parameters={parametersMeta || []} onSubmit={onSubmitParameters} onClose={() => {
                        setIsModalParameter(false)
                    }}/>}

            </div>

        </div>
    </>)
}


export default ReportsPage;
import {observer} from "mobx-react-lite";
import {Navigation} from "../components/Navigation";
import {LeftNavigation} from "../components/leftNavigation/LeftNavigation";

import React, {useEffect, useRef, useState} from "react";
import {ViewReport} from "../components/reportsConstruct/ViewReport";
import ReportService from "../services/ReportService";
import {ModalNotify} from "../components/modal/ModalNotify";
import Loading from "../components/loading/Loading";


function ViewReportPage() {


    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalError, setIsModalError] = useState(false);
    const [isShowReport, setIsShowReport] = useState(false);

    const [reportTemplate, setReportTemplate] = useState({content: "", styles: ""});
    const [reportData, setReportData] = useState(null);
    const [parameters, setParameters] = useState([]);


    useEffect(() => {

        const urlParams = new URLSearchParams(window.location.search);
        const reportName = urlParams.get('name');
        const paramsJson = urlParams.get('params');
        let parameters = {};

        if (paramsJson) {
            try {
                parameters = JSON.parse(decodeURIComponent(paramsJson));
                setParameters(parameters);
            } catch (error) {
                setIsLoading(false);
                setError("Ошибка парсинга параметров");
                setIsModalError(true);
            }
        }

        viewReport(parameters, reportName);

    }, [])

    useEffect(() => {
        if (reportData && reportTemplate) {
            setIsShowReport(true)
            setTimeout(() => {
                setIsLoading(false);
            }, 1500);
        }
    }, [reportTemplate, reportData]);

    async function viewReport(parameters, reportName) {
        await fetchReportTemplate(reportName);
        await fetchReportData(reportName, parameters);
    }

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


    return (
        <>
            <Navigation isHiddenMenu={false} isOpenMenu={false} setOpenMenu={() => {
            }}/>
            <div className="flex flex-row window-height">
                <div className="w-[200px] py-2 border-r-2 bg-gray-50 justify-stretch">
                    <LeftNavigation/>
                </div>
                <div className="flex flex-col w-full ">

                    {isLoading && <Loading/>}

                    {isShowReport &&
                        <div className={isLoading? "hidden":""}>
                            <ViewReport data={reportData} dataParam={parameters} html={reportTemplate.content}
                                        css={reportTemplate.styles}
                                        isBookOrientation={reportTemplate.bookOrientation}/>
                        </div>
                    }

                </div>
            </div>

            {isModalError &&
                <ModalNotify title={"Ошибка"} message={error} onClose={() => setIsModalError(false)}/>}
        </>
    )
}

export default observer(ViewReportPage)
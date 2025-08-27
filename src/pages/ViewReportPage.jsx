import {observer} from "mobx-react-lite";
import {Navigation} from "../components/Navigation";
import {LeftNavigation} from "../components/leftNavigation/LeftNavigation";

import React, {useEffect, useRef, useState} from "react";
import {ViewReport} from "../components/reportsConstruct/ViewReport";
import ReportService from "../services/ReportService";
import {ModalNotify} from "../components/modal/ModalNotify";
import Loading from "../components/loading/Loading";
import {useNavigate} from "react-router-dom";


function ViewReportPage() {

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalError, setIsModalError] = useState(false);
    const [isShowReport, setIsShowReport] = useState(false);

    // const [reportTemplate, setReportTemplate] = useState({content: "", styles: ""});
    const [reportTemplate, setReportTemplate] = useState(undefined);
    const [reportData, setReportData] = useState(null);
    const [parameters, setParameters] = useState(undefined);


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

    function ensureArray(item) {
        if (Array.isArray(item)) {
            return item;
        }
        return item ? [item] : [];
    }

    useEffect(() => {
        if (reportData && reportTemplate) {
            setIsShowReport(true)
            setTimeout(() => {
                setIsLoading(false);
            }, 1500);
            // console.log(JSON.parse(reportTemplate.parameters))
            // console.log(parameters)
        }
    }, [reportTemplate, reportData]);

    //Добавляем параметры которые не были заданы
    function addDefaultParameters(params, paramDescriptions) {
        const result = { ...params };
        console.log(result)
        paramDescriptions.forEach(description => {
            const { key, default: defaultValue } = description;
            if (!(key in result) || result[key] === undefined || result[key] === null) {
                if(description.type === "DATE" && defaultValue === true){
                    // console.log("DATE1")
                    // console.log(defaultValue)
                    result[key] = new Date().toISOString().split('T')[0];
                } else {
                    result[key] = defaultValue;
                }
            }
        });

        return result;
    }

    async function viewReport(parameters, reportName) {
        let template = await fetchReportTemplate(reportName);
        parameters = addDefaultParameters(parameters, JSON.parse(template.parameters));
        await fetchReportData(reportName, parameters);
    }

    async function fetchReportTemplate(reportName) {
        try {
            const response = await ReportService.getReportTemplateByReportName(reportName);
            setReportTemplate(response.data);
            return response.data;
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
                                        isBookOrientation={reportTemplate.bookOrientation} onClose={() => navigate("/")}/>
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
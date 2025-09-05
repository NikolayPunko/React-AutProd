import {Navigation} from "../components/Navigation";
import {LeftNavigation} from "../components/leftNavigation/LeftNavigation";
import React, {useEffect, useState} from "react";
import ReportService from "../services/ReportService";
import Loading from "../components/loading/Loading";
import {ModalNotify} from "../components/modal/ModalNotify";
import {ModalParameter} from "../components/reportsConstruct/ModalParameter";
import {useNavigate} from "react-router-dom";
import RoleGuard from "../components/RoleGuard";


function ReportsPage() {

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isModalError, setIsModalError] = useState(false);
    const [isModalParameter, setIsModalParameter] = useState(false);

    const [reportsName, setReportsName] = useState([]);
    const [selectName, setSelectName] = useState("unknown")
    const [parametersMeta, setParametersMeta] = useState([]);


    async function fetchReportsName() {
        try {
            setIsLoading(true);
            const response = await ReportService.getReportsNameGroupCategory();
            setReportsName(response.data);
        } catch (e) {
            setError(e.response.data.message);
            setIsModalError(true);
        } finally {
            setIsLoading(false);
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


    async function handleReportClick(reportName) {
        await fetchParametersMeta(reportName);
        setSelectName(reportName);
        setIsModalParameter(true);
    }


    async function onSubmitParameters(parameters) {
        setIsModalParameter(false);
        const encodedParams = encodeURIComponent(JSON.stringify(parameters));
        const url = `/report?name=${selectName}&params=${encodedParams}`;
        navigate(url);
    }

    return (<>

        <Navigation isHiddenMenu={false} isOpenMenu={false} setOpenMenu={() => {
        }}/>
        <div className="flex flex-row window-height">
            <div className="w-[200px] py-2 border-r-2 bg-gray-50 justify-stretch">
                <LeftNavigation/>
            </div>
            <div className="flex flex-col w-full">

                {isLoading && <Loading/>}

                {!isLoading && <>
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
import $api, {API_URL} from "../http";


export default class ReportService {



    static async getReportTemplateByReportName(reportName) {
        return $api.get(`${API_URL}/api/report/` + reportName)
    }

    static async getParametersMetaByReportName(reportName) {
        return $api.get(`${API_URL}/api/report/` + reportName + `/parameters`)
    }

    static async createReportTemplate(reportName, reportCategory, dbUrl, dbUsername, dbPassword, dbDriver, sql, parametersMeta, content, styles, script, sqlMode, dataBands) {
        return $api.post(`${API_URL}/api/report/create`, {reportName, reportCategory, dbUrl, dbUsername,
            dbPassword, dbDriver, sql, parameters: JSON.stringify(parametersMeta), content, styles, script, sqlMode, dataBands: JSON.stringify(dataBands)})
    }

    static async getReportsName() {
        return $api.get(`${API_URL}/api/report/names`)
    }

    static async getReportsNameGroupCategory() {
        return $api.get(`${API_URL}/api/report/categories`)
    }

    static async getDataByReportName(reportName, parameters) {
        return $api.post(`${API_URL}/api/report/data/` + reportName, {parameters})
    }

    static async getDataForReport(reportName, reportCategory, dbUrl, dbUsername, dbPassword, dbDriver, sql, content, styles, parameters, script, sqlMode) {
        return $api.post(`${API_URL}/api/report/data`,  {
            reportTemplateDTO: {
                reportName,
                reportCategory,
                dbUrl,
                dbUsername,
                dbPassword,
                dbDriver,
                sql,
                content,
                styles,
                script,
                sqlMode,
            },
            parameters: parameters
        });
    }

    static async getDataForReport2(reportName, reportCategory, dbUrl, dbUsername, dbPassword, dbDriver, sql, parameters, content, styles) {
        return $api.post(`${API_URL}/api/report/data`, {reportName, reportCategory, dbUrl, dbUsername,
            dbPassword, dbDriver, sql, parameters, content, styles})
    }


    static convertReportsNameToSelectOpt(data){
        let options = [];
        for (let i = 0; i < data.length; i++) {
            let x = {
                value: data[i],
                label: data[i]
            }
            options[i] = x;
        }
        return options;
    }

    //Добавляем параметры которые не были заданы
    static addDefaultParameters(params, paramDescriptions) {
        const result = {...params};
        paramDescriptions.forEach(description => {
            const {key, default: defaultValue} = description;
            if (!(key in result) || result[key] === undefined || result[key] === null) {
                if (description.type === "DATE" && defaultValue === true) {
                    result[key] = new Date().toISOString().split('T')[0];
                } else {
                    result[key] = defaultValue;
                }
            }
        });

        return result;
    }

}
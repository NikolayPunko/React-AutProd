import React, {useEffect, useRef, useState} from "react";


export function ViewReport({data, html, css, onClose}) {


    const [printContent, setPrintContent] = useState("");
    const [uniqueStyles, setUniqueStyles] = useState("");
    const [fullHtml, setFullHtml] = useState("");
    const iframeRef = useRef(null);
    const [iframeScale, setIframeScale] = useState(1); // Начальный масштаб 1 (100%)

//На большом тестовом отчете не срабатывают скрипты потому что эт о еще старые элементы без data-field=true


    const [pages, setPages] = useState([
        {id: 1, content: "", styles: ""}
    ]);

    const [usedBands, setUsedBands] = useState({
        reportTitle: false,
        headerPage: false,
        footerPage: false,
        reportSummary: false,
    });

    useEffect(() => {
        render(data,html,css)
    }, [])


    // Обновление содержимого iframe при изменении данных
    useEffect(() => {
        if (iframeRef.current && printContent) {
            const fullHtml = `
                <!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="UTF-8" />
                    <style>
                        <style>
                            @page { 
                                size: A4;
                                margin: 0;
                            }
                            body, html {
                                /*font-family: Arial, 'Times New Roman', sans-serif;*/
                                margin: 0;
                                padding: 0;
                                left: 0;
                                right: 0;
                                display: flex;
                                align-items: center;
                                flex-direction: column;
                            }
                            .page-container {
                                 position: relative;
                                 page-break-after: always;
                                 height: 297mm;
                                 overflow: hidden;
                                 margin: 0;
                                 padding: 0;
                                 left: 0;
                                 right: 0;
                                 box-sizing: border-box;
                            }
                            hr {
                                margin-top: 20px;
                                margin-bottom: 20px;
                            }
                            ${uniqueStyles}
                        </style>
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
                </html>
            `;
            iframeRef.current.srcdoc = fullHtml;
            setFullHtml(fullHtml);
        }



    }, [printContent]);

    function prepareHtmlAndCss(){
        const uniqueStyles = [...new Set(pages.map(p => p.styles || ''))].join('\n');
        // console.log(pages)
        let pagesHtml = "";
        for (let i = 0; i < pages.length; i++) {
            pagesHtml += "<div class='page-container'>";
            pagesHtml += pages[i].content;
            pagesHtml += "</div> ";
            pagesHtml += "<script>\n" +
                "        document.addEventListener('DOMContentLoaded', function() {\n" +
                "            // Получаем все элементы с data-field=\"true\"\n" +
                "            const fields = document.querySelectorAll('[data-field=\"true\"]');\n" +
                "            let clickTimeout;\n" +
                "            \n" +
                "            fields.forEach(field => {\n" +
                "                // Одинарный клик - скрываем поле\n" +
                "                field.addEventListener('click', function(e) {\n" +
                "                    clearTimeout(clickTimeout);\n" +
                "                    \n" +
                "                    clickTimeout = setTimeout(() => {\n" +
                "                        this.style.visibility = 'hidden';\n" +
                "                    }, 250);\n" +
                "                });\n" +
                "            });\n" +
                "        });\n" +
                "    </script>";
        }

        // console.log(pagesHtml)
        setPrintContent(pagesHtml)
        // setUniqueStyles(uniqueStyles)
    }

    useEffect(() => {
        prepareHtmlAndCss()
    }, [pages])


    function render(data, html, css) {

        let startTime = performance.now();

        defineBands(html);
        // setOldPage([{id: 1, content: html, styles: css}])

        css = transformIDs(css);
        // setTimeout(() => {
        // editorView.setStyle(css);
        setUniqueStyles(css);
        // }, 100); // Небольшая задержка для обновления состояния

        renderDataBand(html, data.tableData, css);

        let endTime = performance.now();
        const seconds = (endTime - startTime) / 1000; // Преобразуем миллисекунды в секунды
        console.log("Рендер: " + seconds.toFixed(3))
    }

    function renderDataBand(htmlTemplate, dataArray, css) {

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlTemplate, 'text/html');

        const dataBands = doc.querySelectorAll('[data-band="true"]');

        const descriptionBands = doc.querySelectorAll('[description-band="true"]');
        descriptionBands.forEach(description => {
            description.remove();
        })

        dataBands.forEach(band => {
            const bandHtml = band.innerHTML;

            const bandId = band.getAttribute('id');
            dataArray.forEach(item => {
                if (bandId.toLowerCase().startsWith(item.tableName.toLowerCase())) {

                    item.data.forEach(tableData => {
                        let instanceHtml = bandHtml;

                        Object.keys(tableData).forEach(field => {
                            // if (field === 'datetime_field') {
                            //     console.log("true")
                            instanceHtml = instanceHtml.replaceAll(
                                `{{${field}}}`, //видимо стиль по id имеет больший приоритет
                                `<span style="color: red !important; font-weight: bold !important;">${tableData[field]}</span>`
                            );
                            // } else {
                            //     instanceHtml = instanceHtml.replaceAll(`{{${field}}}`, tableData[field]);
                            // }
                        });
                        //Возможно потом переделать чтобы css отображался нормально отображение без редактора, проосто мб сделать компонент html

                        let bandCopy = band.cloneNode()
                        bandCopy.innerHTML = instanceHtml;
                        doc.body.appendChild(bandCopy)
                    });
                }
            });

            doc.body.removeChild(band.parentNode)
        });

        const bands = doc.querySelectorAll('[band="true"]');

        bands.forEach(band => {
            doc.body.removeChild(band.parentNode)
        })


        splitIntoA4Pages(doc.body.innerHTML, css, bands).then((pagedHtml) => {
            // editorView.setComponents(pagedHtml);
            // setPrintContent(pagedHtml)
        });

        return doc.body.innerHTML;
    }

    function splitIntoA4Pages(htmlString, css, bands) {

        return new Promise((resolve) => {
            const startTime = performance.now();

            const tempContainer = createTempContainer();
            tempContainer.style.cssText = `
                        position: absolute;
                        left: -9999px;
                        width: 794px;
                        visibility: hidden;
                `;
// inline style пропадает при подстановки в конструктор, если и сработает то только со второй страницы

            const bodyContainer = tempContainer.querySelector('#body-container');
            bodyContainer.innerHTML = `<style>${css}</style>${htmlString}`;
            document.body.appendChild(tempContainer);


            const bandHeights = {
                header: getBandHeight(bands, 'pageHeader'),
                footer: getBandHeight(bands, 'pageFooter'),
                reportHeader: getBandHeight(bands, 'reportTitle'),
                reportFooter: getBandHeight(bands, 'reportSummary')
            };

            // console.log(bandHeights)


            const measureDiv = createTempContainer();
            measureDiv.style.cssText = `
                        position: absolute;
                        visibility: hidden;
                        width: 794px;
                `;
            document.body.appendChild(measureDiv);

            try {
                insertBand(tempContainer, bands, true, true);

                const maxHeight = 1123; // Высота A4
                const initialHeight = tempContainer.scrollHeight;

                if (initialHeight <= maxHeight) {
                    const result = removeStyle(tempContainer.innerHTML);
                    resolve(result);
                    let page = [{id: 1, content: result, styles: css}];
                    console.log(page)
                    setPages(page)
                    return;
                }

                //  Разбиение на страницы
                const pages = [];
                let currentPage = createPageTemplate(1, css);
                let currentPageHeight = 0;
                const childNodes = Array.from(bodyContainer.childNodes);

                for (let i = 0; i < childNodes.length; i++) {

                    const node = childNodes[i];
                    const isLastNode = i === childNodes.length - 1;

                    // Измеряем высоту узла
                    measureDiv.innerHTML = '';
                    measureDiv.appendChild(node.cloneNode(true));
                    const nodeHeight = measureDiv.offsetHeight;


                    // Рассчитываем высоту с учетом бэндов
                    const isFirstPage = currentPage.id === 1;
                    const currentBandsHeight = calculateCurrentBandsHeight(isFirstPage, isLastNode, bandHeights);
                    // console.log("BandsHeight" + currentBandsHeight)
                    // console.log("PageHeight" + currentPageHeight)
                    // console.log("nodeHeight" + nodeHeight)
                    // const totalHeight = currentPageHeight + nodeHeight + currentBandsHeight;
                    const totalHeight = currentPageHeight + nodeHeight + currentBandsHeight;

                    // Если не помещается - сохраняем текущую страницу
                    if (totalHeight > maxHeight) {
                        finalizePage(currentPage, pages, bands, false, false);

                        currentPage = createPageTemplate(pages.length + 1, css);
                        currentPageHeight = 0;

                        insertBand(currentPage.container, bands, false, false);
                    }

                    // Добавляем узел на страницу
                    currentPage.container.querySelector('#body-container').appendChild(node.cloneNode(true));
                    currentPageHeight += nodeHeight;

                    // Если это последний узел - добавляем report footer
                    if (isLastNode) {
                        insertBand(currentPage.container, bands, false, true);
                        currentPageHeight += bandHeights.reportFooter;
                    }
                }

                if (currentPage.container.querySelector('#body-container').childNodes.length > 0) {
                    finalizePage(currentPage, pages, bands, false, false);
                }

                setPages(pages);
                console.log(pages)
                // setCurrentPage(1);
                resolve(pages[0]?.content || '');

            } catch (e) {
                console.error(e)
            } finally {
                safeRemove(tempContainer);
                safeRemove(measureDiv);

                const duration = (performance.now() - startTime) / 1000;
                console.log(`Разбиение выполнено за ${duration.toFixed(3)} сек`);
            }
        });
    }

    function safeRemove(element) {
        try {
            if (element?.parentNode) {
                element.parentNode.removeChild(element);
            }
        } catch (error) {
            console.warn('Ошибка при удалении элемента:', error);
        }
    }

    function finalizePage(page, pages, bands, showReportHeader, showReportFooter) {
        if (pages.length === 0) {
            insertBand(page.container, bands, true, showReportFooter);
        } else {
            insertBand(page.container, bands, showReportHeader, showReportFooter);
        }

        page.content = page.container.innerHTML;
        pages.push(page);
        safeRemove(page.container);
    }

    function calculateCurrentBandsHeight(isFirstPage, isLastNode, bandHeights) {
        let height = 0;

        if (isFirstPage) {
            height += bandHeights.reportHeader;
        }

        height += bandHeights.header;
        height += bandHeights.footer;

        if (isLastNode) {
            height += bandHeights.reportFooter;
        }

        return height;
    }

    function createPageTemplate(id, css) {
        const container = createTempContainer();
        return {
            id,
            content: "",
            styles: css,
            container
        };
    }

    function removeStyle(htmlString) {
        let styleRegex = /<style[^>]*>[\s\S]*?<\/style>/gi;
        return htmlString.replace(styleRegex, '');
    }

    function insertBand(tempContainer, bands, addReportTitle, addReportSummary) {

        for (let i = 0; i < bands.length; i++) {

            switch (bands[i].id) {
                case 'reportTitle': {
                    if (addReportTitle) tempContainer.querySelector('#header-container').prepend(bands[i])
                    break;
                }
                case 'pageHeader': {
                    tempContainer.querySelector('#header-container').append(bands[i])
                    break;
                }
                case 'reportSummary': {
                    if (addReportSummary) tempContainer.querySelector('#footer-container').prepend(bands[i])
                    break;
                }
                case 'pageFooter': {
                    tempContainer.querySelector('#footer-container').append(bands[i])
                    break;
                }
            }
        }
    }

    function getBandHeight(bands, type) {

        let band;
        bands.forEach(node => {
            if (node.id === type) {
                band = node;
            }
        });

        if (!band) return 0;
        const temp = document.createElement('div');
        temp.style.position = 'absolute';
        temp.style.visibility = 'hidden';
        temp.appendChild(band)
        document.body.appendChild(temp);
        let height;
        if (type === 'pageFooter') {
            height = getFooterBandHeight()
        } else {
            height = temp.offsetHeight;
        }

        document.body.removeChild(temp);
        return height;
    }

    function getFooterBandHeight() {
        let footerPage = document.getElementById('pageFooter');
        if (footerPage != null) {
            return footerPage.offsetHeight
        } else {
            return 0;
        }
    }

    function createTempContainer() {
        const tempDiv = document.createElement("div");
        tempDiv.style.position = 'relative';
        tempDiv.style.height = "297mm"

        const headerContainer = document.createElement('div');
        headerContainer.id = 'header-container';
        tempDiv.appendChild(headerContainer);
        const bodyContainer = document.createElement('div');
        bodyContainer.id = 'body-container';
        tempDiv.appendChild(bodyContainer);
        const footerContainer = document.createElement('div');
        // footerContainer.style.position = 'absolute';
        // footerContainer.style.bottom = '0';
        // footerContainer.style.left = '0';
        footerContainer.id = 'footer-container';
        tempDiv.appendChild(footerContainer);

        return tempDiv;
    }

    function transformIDs(css) { //т.к. нужно применять ко всем дубликатам бэнда
        return css.replace(/(?<!:)\#([a-zA-Z_][\w-]+)/g, (match, id) => {
            return `[id^='${id}']`; // заменяем #id на [id^='id']
        });
    }

    function defineBands(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        doc.getElementById('pageHeader') ? setUsedBands(prevState => ({
            ...prevState,
            headerPage: true
        })) : setUsedBands(prevState => ({...prevState, headerPage: false}))
        doc.getElementById('reportTitle') ? setUsedBands(prevState => ({
            ...prevState,
            reportTitle: true
        })) : setUsedBands(prevState => ({...prevState, reportTitle: false}))
        doc.getElementById('reportSummary') ? setUsedBands(prevState => ({
            ...prevState,
            reportSummary: true
        })) : setUsedBands(prevState => ({...prevState, reportSummary: false}))
        doc.getElementById('pageFooter') ? setUsedBands(prevState => ({
            ...prevState,
            footerPage: true
        })) : setUsedBands(prevState => ({...prevState, footerPage: false}))
    }

    const zoomIn = () => {
        setIframeScale(prev => Math.min(prev + 0.1, 1.4));
    };

    const zoomOut = () => {
        setIframeScale(prev => Math.max(prev - 0.1, 0.6));
    };

    const printReport = () => {
        if (iframeRef.current) {
            iframeRef.current.contentWindow.print();
        }
    };

    const exportHtml = () => {
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'report.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };



    return (
        <>
            <div>
                <div className=" gjs-two-color gjs-one-bg flex flex-row justify-between py-1 gjs-pn-commands">
                    <div className="flex justify-start text-center ml-3 w-1/3">
                        <span className="gjs-pn-btn font-medium">Просмотр отчета</span>
                    </div>


                    <div className="flex justify-center text-center mr-2 w-1/3 ">
                        <span className="gjs-pn-btn hover:bg-gray-200" onClick={() => {
                            printReport()
                        }}
                              title="Экспорт PDF">
                            <i className="fa fa-file-pdf"></i>
                            </span>
                        <span className="gjs-pn-btn hover:bg-gray-200" onClick={() => {
                            exportHtml()
                        }}
                              title="Экспорт HTML">
                            <i className="fa fa-code"></i>
                            </span>
                        <span className="gjs-pn-btn hover:bg-gray-200" onClick={() => {
                            printReport()
                        }} title="Печать">
                            <i className="fa fa-print"></i>
                            </span>
                        <span className="gjs-pn-btn hover:bg-gray-200" onClick={zoomOut}
                              title="Уменьшить масштаб">
                                <i className="fa fa-magnifying-glass-minus"></i>
                            </span>
                        <span className="gjs-pn-btn hover:bg-gray-200" onClick={zoomIn}
                              title="Увеличить масштаб">
                            <i className="fa fa-magnifying-glass-plus"></i>
                        </span>

                    </div>
                    <div className="flex justify-end items-center w-1/3 mr-3 ">
                        <button className="h-[28px] px-3 rounded text-xs text-white font-medium shadow-inner bg-blue-800 hover:bg-blue-700" onClick={onClose}>Закрыть</button>
                    </div>

                </div>
                <div className="flex justify-start text-center w-1/3">
                    {/*<span className="gjs-pn-btn hover:bg-gray-200" onClick={() => switchPage(currentPage - 1)}*/}
                    {/*      title="Пред. страница">*/}
                    {/*    <i className="fa-solid fa-angle-left"></i>*/}
                    {/*    </span>*/}
                    {/*<span className="gjs-pn-btn">*/}
                    {/*   {currentPage} / {pages.length}*/}
                    {/*    </span>*/}
                    {/*<span className="gjs-pn-btn hover:bg-gray-200" onClick={() => switchPage(currentPage + 1)}*/}
                    {/*      title="След. страница">*/}
                    {/*    <i className="fa-solid fa-angle-right"></i>*/}
                    {/*    </span>*/}
                    {/*<span className="gjs-pn-btn hover:bg-gray-200" onClick={() => generatePdf(editorView)}*/}
                    {/*      title="Экспорт PDF">*/}
                    {/*    <i className="fa fa-file-pdf"></i>*/}
                    {/*    </span>*/}
                    {/*<span className="gjs-pn-btn hover:bg-gray-200" onClick={() => exportHtml(editorView)}*/}
                    {/*      title="Экспорт HTML">*/}
                    {/*    <i className="fa fa-code"></i>*/}
                    {/*    </span>*/}
                    {/*<span className="gjs-pn-btn hover:bg-gray-200" onClick={printReport} title="Печать">*/}
                    {/*    <i className="fa fa-print"></i>*/}
                    {/*    </span>*/}
                    {/*<span className="gjs-pn-btn hover:bg-gray-200" onClick={() => changeZoom(-10)}*/}
                    {/*      title="Уменьшить масштаб">*/}
                    {/*        <i className="fa fa-magnifying-glass-minus"></i>*/}
                    {/*    </span>*/}
                    {/*<span className="gjs-pn-btn hover:bg-gray-200" onClick={() => changeZoom(10)}*/}
                    {/*      title="Увеличить масштаб">*/}
                    {/*    <i className="fa fa-magnifying-glass-plus"></i>*/}
                    {/*</span>*/}
                </div>

                <div className="flex justify-center p-4 rounded-lg">
                    <iframe
                        ref={iframeRef}
                        title="report-preview"
                        style={{transform: `scale(${iframeScale})`}}
                        className="w-[215mm] h-[297mm] origin-top border shadow-lg bg-white"
                        // sandbox="allow-same-origin allow-scripts"
                    />

                </div>
            </div>
        </>
    )
}
import React, {useEffect, useRef, useState} from 'react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./../reportsConstruct/ReportEditor.css";

import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";
import jsPDF from "jspdf";
import grapesjs from "grapesjs";

import grapesjspresetwebpage from 'grapesjs-preset-webpage/dist/index.js';
// import grapesjstable from 'grapesjs-table/src/blocks.js';

import ru from 'grapesjs/locale/ru';

import htmlToPdfmake from "html-to-pdfmake"; // Импортируем html-to-pdfmake

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts"; // Импортируем шрифты для pdfmake

// Добавляем шрифт Roboto в виртуальную файловую систему pdfmake
// pdfMake.vfs = pdfFonts.pdfMake.vfs;

const ReportEditor = () => {
    const [zoom, setZoom] = useState(100);
    const [editorView, setEditorView] = useState(null);

    const editorRef = useRef(null);

    const [pages, setPages] = useState([{id: 1, content: "", styles: ""}]);
    const [currentPage, setCurrentPage] = useState(1); // Активная страница


    pdfMake.addVirtualFileSystem(pdfFonts);


    useEffect(() => {
        // Инициализация GrapesJS
        const editor = grapesjs.init({
            container: editorRef.current,
            telemetry: false,
            fromElement: true,
            height: "1200px",
            width: 'auto',
            default_locale: 'ru',
            i18n: {
                locale: 'ru', // default locale
                detectLocale: true, // by default, the editor will detect the language
                localeFallback: 'ru', // default fallback
                messages: {ru},
            },
            dragMode: 'absolute',
            storageManager: false, // Отключаем сохранение
            // panels: { defaults: [] }, // Убираем стандартные панелиnpm
            plugins: [grapesjspresetwebpage],
            canvas: {
                styles: [`
          body {
            overflow: hidden; /* 🔥 Запрещаем выход элементов за пределы */
          }
          .gjs-cv-canvas {
            width: 210mm;  /* 🔥 Устанавливаем фиксированную ширину (A4) */
            height: 297mm; /* 🔥 Устанавливаем фиксированную высоту */
            margin: auto;
            position: relative;
            overflow: hidden; /* 🔥 Запрещаем вылет элементов за границы */
          }
          
        `]
            },


            // Очищаем список устройств
            deviceManager: {
                devices: [], // Полностью убираем все предустановленные размеры
            }, // styleManager: {
            //     sectors: [
            //         // Отображаем только необходимые настройки стилей
            //     ]
            // }


        });


        setTimeout(() => {

            const canvasElement = editor.Canvas.getElement()

            // Устанавливаем размеры канваса (формат A4)
            canvasElement.style.width = '794px';
            canvasElement.style.height = '1123px';
            canvasElement.style.margin = '0';
            // canvasElement.style.padding = '20px';
            canvasElement.style.marginLeft = '15%';
            canvasElement.style.marginTop = '20px';
            canvasElement.style.backgroundColor = '#949494';
            canvasElement.style.border = '5px';
            canvasElement.style.overflow = 'hidden';


            editor.Canvas.getBody().style.width = '794px';
            editor.Canvas.getBody().style.height = '1123px';
            editor.Canvas.getBody().style.margin = '0';
            editor.Canvas.getBody().style.backgroundColor = '#9a9a9a';
            // editor.Canvas.getBody().style.padding = '20px';
            editor.Canvas.getBody().style.backgroundColor = '#ffffff';
            editor.Canvas.getBody().style.overflow = 'hidden';
            editor.Canvas.getBody().style.position = 'relative';


        }, 200);

        editor.setComponents(pages[0].content);

        editor.setStyle({
            'background-color': '#bf13d9', // Цвет фона
        });

        editor.setComponents(`<span style="text-align:center; padding: 10px; width:300px; left: 60px;
              position: absolute; top:60px; font-size: larger;font-weight: 700;">Начните создание отчета...</span>`);


        // console.log(editor.Panels.getPanels())


        // Добавляем кнопки для экспорта
        editor.Panels.addButton('options', [
            {
                id: 'zoom-',
                className: 'fa fa-magnifying-glass-minus',
                command: () => changeZoom(-10),
                attributes: {title: 'Уменьшить маштаб'},
            }, {
                id: 'zoom+',
                className: 'fa fa-magnifying-glass-plus',
                command: () => changeZoom(10),
                attributes: {title: 'Увеличить маштаб'},
            },
            // {
            //     id: 'export-excel',
            //     className: 'fa fa-file-excel',
            //     command: () => exportExcel(editor),
            //     attributes: {title: 'Экспорт Exel'},
            // }, {
            //     id: 'export-html',
            //     className: 'fa fa-code',
            //     command: () => exportHtml(editor),
            //     attributes: {title: 'Экспорт HTML'},
            // }, {
            //     id: 'export-pdf',
            //     className: 'fa fa-file-pdf',
            //     command: () => exportPDF(editor),
            //     attributes: {title: 'Экспорт PDF'},
            // },
            //
            //     {
            //         id: 'export-json',
            //         className: 'fa fa-file-export',
            //         command: () => exportToJSON(editor),
            //         attributes: {title: 'Экспорт JSON'},
            //     }, {
            //         id: 'import-json',
            //         className: 'fa fa-upload',
            //         command: () => handleImportJSON(editor),
            //         attributes: {title: 'Импорт JSON'},
            //     }, {
            //         id: 'print',
            //         className: 'fa fa-print',
            //         command: () => handlePrintReport(editor),
            //         attributes: {title: 'Печать'},
            //     },

        ]);

        addDeviceManager(editor);

        addBlocks(editor);

        editor.DataSources.add({
            id: 'my_data_source_id', records: [{id: 'id1', name: 'value1'}, {id: 'id2', name: 'value2'}]
        });


        const restrictDragToCanvas = (component) => {
            const el = component.view?.el;
            if (!el) return;

            const canvas = editor.Canvas.getBody();
            const canvasWidth = canvas.offsetWidth;
            const canvasHeight = canvas.offsetHeight;

            const style = window.getComputedStyle(el);
            let newLeft = parseInt(style.left, 10) || 0;
            let newTop = parseInt(style.top, 10) || 0;


            const elementWidth = el.offsetWidth;
            const elementHeight = el.offsetHeight;


            if (newLeft < 0) newLeft = 0;
            if (newTop < 0) newTop = 0;
            if (newLeft + elementWidth > canvasWidth) newLeft = canvasWidth - elementWidth;
            if (newTop + elementHeight > canvasHeight) newTop = canvasHeight - elementHeight;

            component.addStyle({left: `${newLeft}px`, top: `${newTop}px`});
        };

        editor.on("component:drag:end", (event => {
            restrictDragToCanvas(event.target);
        }));


        setEditorView(editor);


        document.querySelector('.gjs-pn-devices-c').querySelector('.gjs-pn-buttons').innerHTML = "" // удаляем дефолтный div с девайсами


        editor.Panels.addButton('devices-c', [// {
            //     id: 'prevPage',
            //     className: 'fa-solid fa-angle-left',
            //     command: () => switchPage(1),
            //     attributes: {title: 'Пред. страница'},
            // },
            // {
            //     id: 'currentPage',
            //     className: 'custom-page-display',
            //     attributes: {
            //         title: 'Текущая страница',
            //     },
            //     label: `${currentPage} / ${pages.length}`
            // },
            // {
            //     id: 'nextPage',
            //     className: 'fa-solid fa-angle-right',
            //     command: () => switchPage(2),
            //     attributes: {title: 'След. страница'},
            // },
            //     {
            //     id: 'export-excel',
            //     className: 'fa fa-file-excel',
            //     command: () => exportExcel(editor),
            //     attributes: {title: 'Экспорт Exel'},
            // }, {
            //     id: 'export-html',
            //     className: 'fa fa-code',
            //     command: () => exportHtml(editor),
            //     attributes: {title: 'Экспорт HTML'},
            // }, {
            //     id: 'export-pdf',
            //     className: 'fa fa-file-pdf',
            //     command: () => exportPDF(editor),
            //     attributes: {title: 'Экспорт PDF'},
            // },
            //
            //     {
            //         id: 'export-json',
            //         className: 'fa fa-file-export',
            //         command: () => exportToJSON(editor),
            //         attributes: {title: 'Экспорт JSON'},
            //     }, {
            //         id: 'import-json',
            //         className: 'fa fa-upload',
            //         command: () => handleImportJSON(editor),
            //         attributes: {title: 'Импорт JSON'},
            //     }, {
            //         id: 'print',
            //         className: 'fa fa-print',
            //         command: () => handlePrintReport(editor),
            //         attributes: {title: 'Печать'},
            //     },
        ])



        // editorRef.current = editor;
        setEditorView(editor);

        // editor.on("components:update", () => {
        //     console.log("style:update");
        //     saveCurrentPage(editor);
        // });

        // editor.on("component:add", (model) => console.log("Добавлен компонент:", model));
        // editor.on("component:remove", (model) => console.log("Удален компонент:", model));
        // editor.on("component:drag:end", (model) => console.log("Компонент перемещен:", model));
        // editor.on("components:update", () => console.log("Изменена структура всех компонентов!"));
        // editor.on("component:change:content", (model) => console.log("Изменен текст:", model));
        // editor.on("style:update", (model) => console.log("Обновлены стили компонента:", model));
        editor.on("change", (model) => console.log("Обновлены атрибуты компонента:", model));
        // editor.on("component:selected", (model) => console.log("Выбран компонент:", model));
    }, []);

    useEffect(() => {
        if (editorView) {
            const panel = editorView.Panels.getButton('devices-c', 'currentPage');
            if (panel) {
                panel.set('label', `${currentPage} / ${pages.length}`);
            }
        }
    }, [pages, currentPage]);

    useEffect(() => {
        console.log("useEffect editor")
    }, [editorView])

    const switchPage = (id) => {
        const editor = editorView
        // if (!editor) {
        //     return;
        // }
        saveCurrentPage(editor); // Сначала сохраняем текущую страницу

        setTimeout(() => {

            console.log(pages)

            const page = pages.find((p) => p.id === id);
            if (page) {
                editor.setComponents(page.content);
                editor.setStyle(page.styles);
                setCurrentPage(id);
            }
        }, 100); // Небольшая задержка для обновления состояния
    };

    const saveCurrentPage = async (editor) => {
        if (!editor) {
            return;
        }
        console.log("saveCurrentPage")
        const html = editor.getHtml();
        const css = editor.getCss();

        return new Promise((resolve) => {
            setPages((prevPages) => {
                const updatedPages = prevPages.map((page) => page.id === currentPage ? {
                    ...page,
                    content: html,
                    styles: css
                } : page);
                resolve(updatedPages);  // После обновления страницы вызываем resolve
                return updatedPages;
            });
        });
    };


    const addPage = () => {
        const editor = editorView
        saveCurrentPage(editor);

        setTimeout(() => {
            const newPage = {
                id: pages.length + 1, content: "", styles: "",
            };

            setPages((prevPages) => [...prevPages, newPage]);
            setCurrentPage(newPage.id);

            if (editor) {
                editor.setComponents("");
                editor.setStyle("");
            }
        }, 100);
    };

    const removePage = () => {
        setPages((prevPages) => {
            if (prevPages.length > 1) {
                // Создаем копию массива страниц и удаляем последнюю
                const updatedPages = [...prevPages];
                updatedPages.pop();  // Удаляем последнюю страницу

                if (currentPage === prevPages.length) {
                    switchPage(updatedPages.length);
                }
                return updatedPages;
            }

            return prevPages;
        });

    };


    const exportJSON = async () => {
        try {
            // const updatedPages = await saveCurrentPage();
            const json = JSON.stringify(pages, null, 2);
            const blob = new Blob([json], {type: "application/json"});
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "report.json";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Ошибка при сохранении и экспорте:", error);
        }
    };


    const importJSON = () => {

        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".json";
        fileInput.style.display = "none";

        fileInput.addEventListener("change", (event) => {


            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            setPages([{id: 1, content: "", styles: ""}])
            try {
                reader.onload = (e) => {
                    const importedPages = JSON.parse(e.target.result);
                    setPages(importedPages);
                    setCurrentPage(importedPages[0]?.id || 1);

                    editorView.setComponents(importedPages[0].content);
                    editorView.setStyle(importedPages[0].styles);

                };
            } catch (error) {
                alert("Ошибка загрузки JSON");
            }

            reader.readAsText(file);
        });

        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);


    };


    const updateCanvasZoom = (newZoom) => {
        if (!editorView) return;
        const frame = editorView.Canvas.getElement();
        if (frame) {
            const scaleValue = newZoom / 100; // Преобразуем проценты в scale
            frame.style.transform = `scale(${scaleValue})`;
            frame.style.transformOrigin = "0 0"; // Фиксируем точку начала
        }
    };

    const changeZoom = (value) => {
        setZoom((prevZoom) => {
            const newZoom = Math.min(Math.max(prevZoom + value, 50), 100);
            return newZoom;
        });
    };


    useEffect(() => {
        if (editorView) updateCanvasZoom(zoom);
    }, [zoom]);


    // Функция экспорта HTML
    const exportHtml = (editor) => {
        // Получаем HTML контент
        const htmlContent = editor.getHtml();

        // Получаем CSS, включая классы
        const cssContent = editor.getCss();

        // Создаем финальный HTML с добавленными стилями
        const finalHtml = `
      <html>
        <head>
          <style>
            ${cssContent} <!-- Вставляем все стили -->
          </style>
        </head>
        <body>
          ${htmlContent} <!-- Вставляем HTML контент -->
        </body>
      </html>
    `;

        // Создаем Blob и ссылку для скачивания
        const blob = new Blob([finalHtml], {type: "text/html"});
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "exported_with_css.html"; // Имя файла
        link.click();
    };

    // Функция экспорта PDF
    const exportPDF = async (editor) => {

        const htmlContent = editor.getHtml(); // Получаем HTML
        const cssContent = editor.getCss(); // Получаем CSS

        // 🔥 Создаем скрытый iframe для "украденного" окна печати
        const printFrame = document.createElement("iframe");
        printFrame.style.position = "absolute";
        printFrame.style.width = "0px";
        printFrame.style.height = "0px";
        printFrame.style.border = "none";

        document.body.appendChild(printFrame);

        const printDocument = printFrame.contentDocument || printFrame.contentWindow.document;
        printDocument.open();
        printDocument.write(`
      <html>
        <head>
          <title>Печать</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }

            @page { size: A4; margin: 0; }
            body { width: 210mm; height: 297mm; margin: 0 auto; overflow: hidden; }

            ${cssContent}
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `);
        printDocument.close();


        // Ждем загрузки контента перед печатью
        setTimeout(() => {
            printFrame.contentWindow.focus();
            printFrame.contentWindow.print(); // Открываем окно печати
            document.body.removeChild(printFrame); // Удаляем iframe после печати
        }, 1000);
    };

    // Функция экспорта Excel
    const exportExcel = (editor) => {
        const htmlContent = editor.getHtml(); // Получаем HTML контент из GrapesJS

        // Создаем рабочую книгу
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([[htmlContent]]); // Преобразуем HTML в рабочий лист
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Экспортируем в Excel
        XLSX.writeFile(wb, "report.xlsx");
    };

    const exportToJSON = (editor) => {
        const data = editor.getProjectData(); // Получаем данные редактора
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], {type: "application/json"});
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "report.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportJSON = (editor) => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".json";
        fileInput.style.display = "none";

        fileInput.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    editor.loadData(jsonData); // Загружаем JSON в редактор
                } catch (error) {
                    alert("Ошибка загрузки JSON");
                }
            };
            reader.readAsText(file);
        });

        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    };

    const handlePrintReport = (editor) => {

        const htmlContent = editor.getHtml(); // Получаем HTML
        const cssContent = editor.getCss(); // Получаем CSS

        // Создаем временный iframe
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        // Заполняем iframe контентом
        printWindow.document.write(`
     <html>
        <head>
          <title>Печать</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }

            @page { size: A4; margin: 0; }
            body { width: 210mm; height: 297mm; margin: 0 auto; overflow: hidden; }

            ${cssContent}
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `);

        // Ждём рендеринг и вызываем печать
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    const printAllPages = () => {
        console.log(pages[0].content)
        // saveCurrentPage();


        let combinedHTML = "";
        let combinedCSS = "";

        for (let i = 0; i < pages.length; i++) {
            combinedHTML += `
      
         <div class="print-page">
            ${pages[i].content}
         </div>
         `;
            combinedCSS += " " + pages[i].styles;
        }

        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
   
     <html>
        <head>
          <title>Печать</title>
          <style>
            ${combinedCSS}

            @media print {
            body {
              margin: 0;
              padding: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .print-page {
              width: 100%;
              max-width: 100%;
              height: 100vh;
              min-height: 100vh;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              align-items: flex-start;
              padding: 20px;
              margin: 0 auto;
              position: relative;
              overflow: hidden;
              page-break-after: always; /* Стабильное разбиение страниц */
              break-after: page;
            }
            .print-page:last-child {
              page-break-after: auto; /* Убираем лишний пустой лист в конце */
            }
          }
            @page { size: A4; margin: 0; }
            body { width: 210mm; height: 297mm; margin: 0 auto; overflow: hidden; }

            
          </style>
        </head>
        <body>${combinedHTML}
      </html>
      
  `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500); // Небольшая задержка для корректной загрузки
    };


    function addDeviceManager(editor) {
        // const deviceManager = editor.Devices;
        // const device1 = deviceManager.add({
        //     // Without an explicit ID, the `name` will be taken. In case of missing `name`, a random ID will be created.
        //     id: 'A4',
        //     name: 'A4',
        //     width: '110mm', // This width will be applied on the canvas frame and for the CSS media
        //     // width: '210px',
        //     // height: '297px'
        // });
        // // deviceManager.select(device1);
    }

    function addBlocks(editor) {
        editor.BlockManager.add("my-block", {
            label: "Мой блок", content: "<div style='padding:10px; background:#f3f3f3;'>Hello!</div>",
        });
        editor.BlockManager.add("h1", {
            label: "Заголовок h1", // content: "<h1 style='padding:30px; '>Заголовок h1</h1>",
            content: "<div style='padding:10px; font-size:32px; font-weight:bold '>Заголовок h1</div>",
        });
        editor.BlockManager.add("h2", {
            label: "Заголовок h2", // content: "<h1 style='padding:30px; '>Заголовок h1</h1>",
            content: "<div style='padding:10px; font-size:24px; font-weight:bold '>Заголовок h2</div>",
        });
        editor.BlockManager.add("h3", {
            label: "Заголовок h3", // content: "<h1 style='padding:30px; '>Заголовок h1</h1>",
            content: "<div style='padding:10px; font-size:19px; font-weight:bold '>Заголовок h3</div>",
        });
        editor.BlockManager.add("paragraph", {
            label: "Абзац", content: "<p style=\"font-size: 14px;\">Введите текст отчета...</p>",
        });
        editor.BlockManager.add("table", {
            label: "Таблица", content: `
                <table class="table table-bordered">
                  <thead>
                    <tr><th>Заголовок 1</th><th>Заголовок 2</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Данные 1</td><td>Данные 2</td></tr>
                  </tbody>
                </table>
              `,
        });
        editor.BlockManager.add("my-block", {
            label: "Мой блок", content: "<div style='padding:10px; background:#f3f3f3;'>Hello!</div>",
        });
    }

    return (
        <div>

            <div className=" gjs-two-color gjs-one-bg flex flex-row justify-between py-1 gjs-pn-commands">
                <div className="flex justify-start text-center ml-2 w-1/3">
                    <span className="gjs-pn-btn font-medium">Конструктор отчетов</span>
                    <span className="gjs-pn-btn">
                        <i className="fa-solid fa-pencil"></i>
                    </span>

                </div>
                <div className="flex justify-start text-center w-1/3">
                    <span className="gjs-pn-btn" onClick={() => switchPage(currentPage - 1)}
                          title="Пред. страница">
                        <i className="fa-solid fa-angle-left"></i>
                    </span>
                    <span className="gjs-pn-btn">
                       {currentPage} / {pages.length}
                    </span>
                    <span className="gjs-pn-btn" onClick={() => switchPage(currentPage + 1)}
                          title="След. страница">
                        <i className="fa-solid fa-angle-right"></i>
                    </span>
                    <span className="gjs-pn-btn" onClick={addPage} title="Добавить страницу">
                        <i className="fa-solid fa-file-circle-plus"></i>
                    </span>
                    <span className="gjs-pn-btn" onClick={removePage} title="Удалить последнюю страницу">
                        <i className="fa-solid fa-trash"></i>
                    </span>
                </div>

                <div className="flex justify-end text-center mr-2 w-1/3">
                    <span className="gjs-pn-btn" onClick={() => exportExcel(editorView)} title="Экспорт Exel">
                        <i className="fa fa-file-excel"></i>
                    </span>
                    <span className="gjs-pn-btn" onClick={() => exportHtml(editorView)} title="Экспорт HTML">
                        <i className="fa fa-code"></i>
                    </span>
                    <span className="gjs-pn-btn" onClick={() => exportPDF(editorView)} title="Экспорт PDF">
                        <i className="fa fa-file-pdf"></i>
                    </span>
                    <span className="gjs-pn-btn" onClick={exportJSON} title="Экспорт JSON">
                        <i className="fa fa-file-export"></i>
                    </span>
                    <span className="gjs-pn-btn" onClick={importJSON} title="Импорт JSON">
                        <i className="fa fa-upload"></i>
                    </span>
                    <span className="gjs-pn-btn" onClick={printAllPages} title="Печать">
                        <i className="fa fa-print"></i>
                    </span>
                </div>

            </div>
            <div id="editor" ref={editorRef}/>
        </div>
    );
};

export default ReportEditor;

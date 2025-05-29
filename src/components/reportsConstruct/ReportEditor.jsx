import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
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
import pdfFonts from "pdfmake/build/vfs_fonts";
import {CustomStyle} from "../../data/styleForSelect";
import Select from "react-select";
import Dropdown from "../dropdown/Dropdown";
import {dataReportTest} from "../../data/dataReport";
import {ModalInput} from "../modal/ModalInput";
import ReportService from "../../services/ReportService";
import {ModalNotify} from "../modal/ModalNotify";
import {ModalSelect} from "../modal/ModalSelect";
import {ModalSettingDB} from "./ModalSettingDB";
import {ModalSQL} from "./ModalSQL";
import {Parser} from "node-sql-parser";
import Loading from "../loading/Loading";
import {decryptData, encryptData} from "../../utils/Сrypto";


// Добавляем шрифт Roboto в виртуальную файловую систему pdfmake
// pdfMake.vfs = pdfFonts.pdfMake.vfs;

const ReportEditor = forwardRef(({previewMode, htmlProps, cssProps, onCloseReport}, ref) => {

        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState(null);

        const [zoom, setZoom] = useState(100);
        const [editorView, setEditorView] = useState(null);

        const editorRef = useRef(null);

        const [pages, setPages] = useState([
            {id: 1, content: "", styles: ""}
        ]);
        const [oldPages, setOldPage] = useState([]);
        const [currentPage, setCurrentPage] = useState(1); // Активная страница

        const [tablesOpt, setTablesOpt] = useState([])

        const [isPreviewMode, setIsPreviewMode] = useState(false);


        const [isModalSaveReport, setIsModalSaveReport] = useState(false);
        const [isModalNotify, setIsModalNotif] = useState(false);
        const [isModalError, setIsModalError] = useState(false);
        const [isModalDownloadReport, setIsModalDownloadReport] = useState(false);
        const [isModalSettingDB, setIsModalSettingDB] = useState(false);
        const [isModalSQL, setIsModalSQL] = useState(false);
        const [modalMsg, setModalMsg] = useState('');

        const [optReportsName, setOptReportsName] = useState([]);

        const [reportName, setReportName] = useState("");
        const [reportCategory, setReportCategory] = useState("");
        const [settingDB, setSettingDB] = useState({
            url: '',
            username: '',
            password: '',
            driverClassName: '',
        });
        const [sql, setSql] = useState("");
        const [isValidSql, setIsValidSql] = useState(true);

        let usedBands = {
            reportTitle: false,
            headerPage: false,
            footerPage: false,
            reportSummary: false,
        }


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
                dragMode: 'absolute',  //https://github.com/GrapesJS/grapesjs/issues/1936 почитать, полезные вещи
                // dragMode: 'transition',
                selectorManager: {componentFirst: true},
                storageManager: false, // Отключаем сохранение
                // panels: { defaults: [] }, // Убираем стандартные панелиnpm
                plugins: [grapesjspresetwebpage],
                pluginsOpts: {
                    blocks: [],
                },
                canvas: {
                    styles: [`
          body {
            overflow: hidden; /* 🔥 Запрещаем выход элементов за пределы */
          }
          .gjs-cv-canvas {
            width: 210mm;  /* 🔥 Устанавливаем фиксированную ширину (A4) */
            height: 297mm; /* 🔥 Устанавливаем фиксированную высоту */
            margin: auto;
           
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
                // editor.Canvas.getBody().style.width = '1123px';
                // editor.Canvas.getBody().style.height = '1587px';
                canvasElement.style.margin = '0';
                // canvasElement.style.padding = '20px';
                canvasElement.style.marginLeft = '15%';
                canvasElement.style.marginTop = '20px';
                canvasElement.style.backgroundColor = '#949494';
                canvasElement.style.border = '5px';
                canvasElement.style.overflow = 'hidden';


                editor.Canvas.getBody().style.width = '794px';
                editor.Canvas.getBody().style.height = '1123px';
                // editor.Canvas.getBody().style.width = '1123px';
                // editor.Canvas.getBody().style.height = '1587px';
                editor.Canvas.getBody().style.margin = '0';
                editor.Canvas.getBody().style.backgroundColor = '#9a9a9a';
                // editor.Canvas.getBody().style.padding = '20px';
                editor.Canvas.getBody().style.backgroundColor = '#ffffff';
                editor.Canvas.getBody().style.overflow = 'hidden';
                // editor.Canvas.getBody().style.position = 'relative';


            }, 200);

            editor.setComponents(pages[0].content);

            editor.setStyle({
                'background-color': '#ad4bbc', // Цвет фона
            });

            // editor.setComponents(`<span style="text-align:center; padding: 10px; width:300px; left: 60px;
            //   position: absolute; top:60px; font-size: larger;font-weight: 700;">Начните создание отчета...</span>`);


            // Добавляем стили для блоков
            editor.Css.addRules(`
        .report-page {
          width: 210mm;
          height: 297mm;
          padding: 20mm;
          border: 1px solid #000;
          margin-bottom: 20px;
          background: #fff;
       
          display: flex;
          flex-direction: column;
        }
        .band {
          width: 100%;
          padding: 10px;
          border: 1px dashed #000;
          margin-bottom: 10px;
          background: #f0f0f0;
          min-height: 50px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          position: relative;
        }
        .band-content {
          flex-grow: 1;
        }

        /* Стили для визуальной индикации */
        .droppable-hover {
          border: 2px solid #00ff00 !important; /* Зеленая рамка при наведении */
          background-color: rgba(0, 255, 0, 0.2);
        }
      `);

            // Добавляем блоки для перетаскивания
            const blocks = [

                {
                    id: "text-block",
                    label: "Text Block",
                    content: '<div class="band-content" style="word-wrap: break-word;">This is some text.</div>',
                    category: "Text",
                    draggable: true,
                    droppable: false,
                    //Нужно разрешить перемещать только в элементы котиорые являются бэндами!
                },


            ];

            blocks.forEach((block) => editor.BlockManager.add(block.id, block));


            //удаляем базовые блоки
            editor.BlockManager.remove('quote')
            editor.BlockManager.remove('link-block')
            editor.BlockManager.remove('text-basic')


            editor.on('component:add', component => {
                const parent = component.parent();

                if (parent && parent.getStyle()['position'] === 'relative') {
                    const style = component.getStyle();
                    style.position = 'absolute';
                    style.top = style.top || '0px';
                    style.left = style.left || '0px';
                    component.setStyle(style);
                }
            });


            // function findTargetComponentAtPoint(components, x, y, ignoreEl) {
            //     let target = null;
            //
            //     components.each(comp => {
            //
            //         const view = comp.view;
            //         if (!view || !view.el || view.el === ignoreEl) return;
            //
            //
            //         const rect = view.el.getBoundingClientRect();
            //         if (
            //             x >= rect.left &&
            //             x <= rect.right &&
            //             y >= rect.top &&
            //             y <= rect.bottom
            //         ) {
            //             target = comp;
            //             const nested = findTargetComponentAtPoint(comp.components(), x, y, ignoreEl);
            //             if (nested) target = nested;
            //         }
            //     });
            //
            //     return target;
            // }
            //
            // editor.on('component:drag:end', (model) => {
            // // editor.on('component:add', (model) => {
            //     console.log(model)
            //
            //     setTimeout(() => {
            //         console.log('component:drag:end')
            //         const view = model.target.view;
            //         if (!view || !view.el) return;
            //         console.log('прошел проверку')
            //         const el = view.el;
            //
            //
            //
            //         const rect = el.getBoundingClientRect();
            //         const x = rect.left + rect.width / 2;
            //         const y = rect.top + rect.height / 2;
            //
            //         const all = editor.DomComponents.getComponents();
            //         const target = findTargetComponentAtPoint(all, x, y, el);
            //
            //         if (target && target !== model.parent) {
            //             const parent = model.parent;
            //             // console.log(parent)
            //             // parent.remove(model.target, { temporary: true });
            //             target.append(model.target);
            //             console.log('Добавлено в нового родителя:', target);
            //         }
            //
            //     }, 0); // Небольшая задержка для обновления состояния
            //
            // });


            // editor.on('component:update', (component) => {
            //     // handleStyleChange(component);
            //     console.log('change style')
            //     console.log(component)
            //
            // });

            //для того чтобы сдвигать описание футера страницы при изменении высоты
            editor.on('component:styleUpdate:height', (component) => {
                if (component.getId() === 'pageFooter') {
                    const newHeight = parseInt(component.getStyle()['height']);
                    const targetComponent = editor.getWrapper().find('#lablePageFooter')[0];
                    if (targetComponent) {
                        targetComponent.addStyle({
                            'bottom': `${newHeight}px`,
                        });
                    }
                }
            });


            editor.on('component:drag:end', model => {


                const el = model.target.view?.el;
                const ready = el instanceof Element && typeof el.getBoundingClientRect === 'function';

                if (ready) {
                    moveComponentToTarget(model);
                } else {
                    // Ждём пока DOM появится
                    model.once('view:render', () => {
                        moveComponentToTarget(model);
                    });
                }
            });

            function moveComponentToTarget(model) {
                const modelEl = model.target.view?.el;
                if (!(modelEl instanceof Element)) {
                    console.warn('Нет DOM-элемента у перетаскиваемого компонента');
                    return;
                }

                const modelRectBefore = modelEl.getBoundingClientRect();

                const x = modelRectBefore.left + modelRectBefore.width / 2;
                const y = modelRectBefore.top + modelRectBefore.height / 2;

                const target = findTargetComponentAtPoint(editor.DomComponents.getComponents(), x, y, modelEl);

                if (target && target !== model.parent) {
                    const targetEl = target.view?.el;


                    if (targetEl) {
                        const targetRect = targetEl.getBoundingClientRect();
                        // console.log(targetEl.getAttribute('data-band'))

                        // Сохраняем положение модели до вставки
                        const modelTopBefore = modelRectBefore.top + window.scrollY;

                        if ((targetEl.getAttribute('data-band') === 'true') || (targetEl.getAttribute('band') === 'true')) {
                            console.log('true')
                            // Вставляем модель внутрь нового родителя
                            target.append(model.target);
                        }


                        //Компенсация отступа сверху при перетаскивании, потом включить и доработать
                        // // Ждём ререндер, чтобы получить новое положение
                        // requestAnimationFrame(() => { // компенсируем смещение при вложенности
                        //     const modelElAfter = model.target.view?.el;
                        //     if (!modelElAfter) return;
                        //
                        //     const modelRectAfter = modelElAfter.getBoundingClientRect();
                        //     const modelTopAfter = modelRectAfter.top + window.scrollY;
                        //
                        //     const delta = modelTopBefore - modelTopAfter;
                        //
                        //
                        //     model.target.addStyle({
                        //         // position: 'relative',
                        //         top: `${delta}px`
                        //     });
                        //
                        //     console.log(`Компенсировали смещение: ${delta}px`);
                        // });
                    }
                }
            }

            function findTargetComponentAtPoint(components, x, y, ignoreEl) {
                let target = null;

                components.each(comp => {
                    const el = comp.view?.el;
                    if (!(el instanceof Element) || el === ignoreEl) return;

                    const rect = el.getBoundingClientRect();
                    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                        target = comp;
                        const nested = findTargetComponentAtPoint(comp.components(), x, y, ignoreEl);
                        if (nested) target = nested;
                    }
                });

                return target;
            }

            // // Событие добавления компонента
            // editor.on("component:add", (model) => {
            //     // console.log("Компонент добавлен:", model);
            // });

            // Событие начала перетаскивания компонента
            editor.on("component:drag:start", (model) => {
                // console.log("Началось перетаскивание компонента:", model);
                // Убираем индикаторы с возможных контейнеров
                editor.getComponents().forEach((comp) => {
                    comp.removeClass("droppable-hover");
                });
            });

            // Обработчик события перемещения компонента
            editor.on("component:drag:stop", (model) => {
                console.log("Перетаскивание завершено:", model);
                // Убираем индикатор с контейнера
                editor.getComponents().forEach((comp) => {
                    comp.removeClass("droppable-hover");
                });

                // Проверяем, куда был вставлен компонент
                const parent = model.getParent();
                if (parent && parent.get("droppable")) {
                    parent.append(model); // Вставляем элемент внутрь родителя
                }
            });

            // Логика добавления визуального индикатора при перетаскивании
            editor.on("component:drag:start", (model) => {
                // const componentEl = model.target.view.el;
                // const canvasEl = editor.Canvas.getElement();
                //
                // // Перемещение элементов относительно канваса
                // const offsetX = componentEl.getBoundingClientRect().left - canvasEl.getBoundingClientRect().left;
                // const offsetY = componentEl.getBoundingClientRect().top - canvasEl.getBoundingClientRect().top;
                //
                //
                // console.log("Offset X:", offsetX, "Offset Y:", offsetY);
                //
                // // Показать возможность вставки в контейнер
                // editor.getComponents().forEach((component) => {
                //     const {left, top, width, height} = component.getBoundingRect();
                //     if (offsetX >= left && offsetX <= left + width && offsetY >= top && offsetY <= top + height) {
                //         component.addClass("droppable-hover");
                //     }
                // });
            });

            // Визуальная индикация, что контейнер может принимать компоненты
            editor.on("component:drag:stop", (model) => {
                editor.getComponents().forEach((comp) => {
                    comp.removeClass("droppable-hover");
                });
            });


            // Добавляем кнопки для экспорта
            editor.Panels.addButton('options', [
                {
                    id: 'zoom-',
                    className: 'fa fa-magnifying-glass-minus',
                    command: () => changeZoom(-10),
                    attributes: {title: 'Уменьшить масштаб'},
                }, {
                    id: 'zoom+',
                    className: 'fa fa-magnifying-glass-plus',
                    command: () => changeZoom(10),
                    attributes: {title: 'Увеличить масштаб'},
                },
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

            console.log(editor.Panels.getPanel('options'))


            editor.Panels.removeButton('options', 'preview');
            editor.Panels.removeButton('options', 'gjs-open-import-webpage');


            setEditorView(editor);

            editor.BlockManager.add('abs-container', {
                label: 'Контейнер',
                content: {
                    tagName: 'div',
                    type: 'default',
                    droppable: true,
                    style: {
                        position: 'relative',
                        width: '400px',
                        height: '400px',
                        border: '2px dashed #aaa',
                        margin: '20px',
                    }
                }
            });

            editor.BlockManager.add('abs-child', {
                label: 'Абсолютный блок',
                content: {
                    tagName: 'div',
                    type: 'default',
                    draggable: true,
                    droppable: true,
                    style: {
                        position: 'absolute',
                        top: '50px',
                        left: '50px',
                        width: '100px',
                        height: '100px',
                        background: '#ffc',
                        border: '1px solid #333',
                    }
                }
            });

            document.querySelector('.gjs-pn-devices-c').querySelector('.gjs-pn-buttons').innerHTML = "" // удаляем дефолтный div с девайсами

            setEditorView(editor);


            if (previewMode) {
                setIsPreviewMode(false)
            }

            setIsLoading(false);
            console.log("useEffect")
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
            console.log("useEffect - editorView")
        }, [editorView])

        // Определяем методы, которые будут доступны родителю
        useImperativeHandle(ref, () => ({
            customMethod(data, html, css) {
                enterViewMode(data, html, css);
            },
        }));

        const switchPage = (id) => {
            const editor = editorView
            // if (!editor) {
            //     return;
            // }
            saveCurrentPage(editor);

            setTimeout(() => {

                console.log(pages)

                const page = pages.find((p) => p.id === id);
                if (page) {
                    editor.setComponents(page.content);
                    editor.setStyle(page.styles);
                    setCurrentPage(id);
                }
            }, 100);
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


        const exportJSON = async () => {
            saveCurrentPage(editorView).then((updatedPages) => {

                let result = {
                    dbUrl: settingDB.url,
                    dbUsername: settingDB.username,
                    dbPassword: settingDB.password,
                    dbDriver: settingDB.driverClassName,
                    sql,
                    content: updatedPages[0].content,
                    styles: updatedPages[0].styles,
                }

                try {
                    // const updatedPages = await saveCurrentPage();
                    const json = JSON.stringify(result, null, 2);
                    const blob = new Blob([json], {type: "application/json"});
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = "report.json";
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => {

                    }, 1000);
                    document.body.removeChild(link);
                } catch (error) {
                    console.error("Ошибка при сохранении и экспорте:", error);
                }
            })

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

                        setSettingDB({
                            url: importedPages.dbUrl,
                            username: importedPages.dbUsername,
                            password: importedPages.dbPassword,
                            driverClassName: importedPages.dbDriver
                        });
                        setSql(importedPages.sql);
                        editorView.setComponents(importedPages.content);
                        editorView.setStyle(importedPages.styles);

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
                return Math.min(Math.max(prevZoom + value, 50), 120);
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

            saveCurrentPage(editorView).then((updatedPages) => {

                let combinedHTML = "";
                let combinedCSS = "";

                for (let i = 0; i < updatedPages.length; i++) {
                    combinedHTML += `
      
         <div class="print-page">
            ${updatedPages[i].content}
         </div>
         `;
                    combinedCSS += " " + updatedPages[i].styles;
                }

                // Создаем скрытый iframe для окна печати
                const printFrame = document.createElement("iframe");
                printFrame.style.position = "absolute";
                printFrame.style.width = "0px";
                printFrame.style.height = "0px";
                printFrame.style.border = "none";

                document.body.appendChild(printFrame);

                const printDocument = printFrame.contentDocument || printFrame.contentWindow.document;
                printDocument.open("", "_blank");
                printDocument.write(`
   
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
              -webkit-print-color-adjust: exact; /* Для Chrome и Safari */
              print-color-adjust: exact; /* Для Firefox */
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
              padding: 0;
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

                printDocument.close();

                setTimeout(() => {
                    printFrame.contentWindow.focus();
                    document.title = "Report"
                    printFrame.contentWindow.print();
                    document.title = "React App"
                    document.body.removeChild(printFrame);
                }, 1000);

            });
        };


        const exportExcel = (editor) => {
            const htmlContent = editor.getHtml(); // Получаем HTML контент из GrapesJS

            // Создаем рабочую книгу
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([[htmlContent]]); // Преобразуем HTML в рабочий лист
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            // Экспортируем в Excel
            XLSX.writeFile(wb, "report.xlsx");
        };

        const printAllPages = () => {

            saveCurrentPage(editorView).then((updatedPages) => {

                let combinedHTML = "";
                let combinedCSS = "";

                for (let i = 0; i < updatedPages.length; i++) {
                    combinedHTML += `
      
         <div class="print-page">
            ${updatedPages[i].content}
         </div>
         `;
                    combinedCSS += " " + updatedPages[i].styles;
                }

                // Создаем скрытый iframe для окна печати
                const printFrame = document.createElement("iframe");
                printFrame.style.position = "absolute";
                printFrame.style.width = "0px";
                printFrame.style.height = "0px";
                printFrame.style.border = "none";

                document.body.appendChild(printFrame);

                const printDocument = printFrame.contentDocument || printFrame.contentWindow.document;
                printDocument.open("", "_blank");
                printDocument.write(`
   
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
              -webkit-print-color-adjust: exact; /* Для Chrome и Safari */
              print-color-adjust: exact; /* Для Firefox */
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
              padding: 0;
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

                printDocument.close();

                setTimeout(() => {
                    printFrame.contentWindow.focus();
                    document.title = "Report"
                    printFrame.contentWindow.print();
                    document.title = "React App"
                    document.body.removeChild(printFrame);
                }, 1000);

            });

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

            editor.BlockManager.add("h1", {
                label: "<i class=\"fa-solid fa-heading\"></i>1 Заголовок h1",
                content: "<div style='padding:10px; font-size:2em; font-weight:bold '>Заголовок h1</div>",
                category: "Заголовки",
            });
            editor.BlockManager.add("h2", {
                label: "<i class=\"fa-solid fa-heading\"></i>2 Заголовок h2",
                content: "<div style='padding:10px; font-size:1.5em; font-weight:bold '>Заголовок h2</div>",
                category: "Заголовки",
            });
            editor.BlockManager.add("h3", {
                label: "<i class=\"fa-solid fa-heading\"></i>3 Заголовок h3",
                content: "<div style='padding:10px; font-size:1.17em; font-weight:bold '>Заголовок h3</div>",
                category: "Заголовки",
            });
            editor.BlockManager.add("h4", {
                label: "<i class=\"fa-solid fa-heading\"></i>4 Заголовок h4",
                content: "<div style='padding:10px; font-size:1em; font-weight:bold '>Заголовок h4</div>",
                category: "Заголовки",
            });
            editor.BlockManager.add("h5", {
                label: "<i class=\"fa-solid fa-heading\"></i>5 Заголовок h5",
                content: "<div style='padding:10px; font-size:0.83em; font-weight:bold '>Заголовок h5</div>",
                category: "Заголовки",
            });
            editor.BlockManager.add("h6", {
                label: "<i class=\"fa-solid fa-heading\"></i>6 Заголовок h6",
                content: "<div style='padding:10px; font-size:0.67em; font-weight:bold '>Заголовок h6</div>",
                category: "Заголовки",
            });

            editor.Blocks.add('line-block', {
                label: '<i class="fa-solid fa-window-minimize"></i> Горизонтальная линия',
                content: {
                    type: 'line',
                    tagName: 'div',
                    attributes: {class: 'line-block'},
                    style: {
                        'width': '100%',
                        'height': '2px',
                        'background-color': '#000',
                        'margin': '0px 0'
                    }
                },
                category: "Линии",
            });

            editor.Blocks.add('vertical-line-block', {
                label: '<i class="fa-solid fa-window-minimize fa-rotate-90"></i> Вертикальная линия',
                content: {
                    type: 'line',
                    tagName: 'div',
                    attributes: {class: 'vertical-line-block'},
                    style: {
                        'width': '2px',
                        'height': '100px',
                        'background-color': '#000',
                        'margin': '0 0px',
                        'display': 'inline-block'
                    }
                },
                category: "Линии",
            });

            editor.Blocks.add('icon-block', {
                label: '<i class="fas fa-camera"></i> Иконка', // Иконка Font Awesome
                content: {
                    type: 'text', // Тип контента
                    tagName: 'div',
                    content: 'Это блок с иконкой',
                    style: {'padding': '10px', 'border': '1px solid #ccc'}
                },
                category: 'Мои блоки', // Категория блока
                attributes: {class: 'gjs-fonts gjs-f-icon-block'}, // Атрибуты блока
                icon: '<i class="fas fa-camera"></i>', // Используйте нужный HTML-код иконки
            });


            editor.BlockManager.add("paragraph", {
                label: "Абзац", content: "<p style=\"font-size: 14px;\">Введите текст отчета...</p>",
            });
            editor.BlockManager.add("table", {
                label: "Таблица",
                content: `
                <table class="table table-bordered" style="">
<!--                  <thead>-->
<!--                    <tr><th><div>Заголовок 1</div></th><th><div>Заголовок 2</div></th></tr>-->
<!--                  </thead>-->
                  <tbody>
                    <tr>
                       <td><div>Данные 1</div></td>
                       <td><div>Данные 2</div></td>
                       <td><div>Данные 3</div></td>
                       <td><div>Данные 4</div></td>
                       <td><div>Данные 5</div></td>
                    </tr>
                  </tbody>
                </table>
              `,
                category: "Text",
                draggable: false,
                droppable: false,
            });
            editor.BlockManager.add("my-block", {
                label: "Мой блок", content: "<div style='padding:10px; background:#f3f3f3;'>Hello!</div>",
            });
        }

        function addDataBand(tableName) {

            editorView.Components.addType('data-band-block', {
                model: {
                    defaults: {
                        tagName: 'div',
                        draggable: false,
                        droppable: true,
                        highlightable: true,
                        components: `
              <div description-band="true" style="
                   background: #f8b159;
                   padding: 2px 8px;
                   font-weight: bold;
                   font-size: 14px;
                   pointer-events: none;
              ">DataBand: ${tableName}</div>
              
              <div data-band="true" id="${tableName}" style="height: 200px; width: 794px; background: #ffffff; position: relative; border: 0px dashed #f4f4f4; padding: 30px 10px 10px 10px; overflow: visible;">
                 <h2 style="position: absolute; margin-top: 10px">Record</h2>
                 <p class="data-band-field" style="position: absolute; margin-top: 50px">Select field: {{name}}</p>
                 <p class="data-band-field" style="position: absolute; margin-top: 80px">Age: {{age}}</p>
                 <p class="data-band-field" style="position: absolute; margin-top: 110px">Band</p>
              </div>
      `,
                        // script: function () {
                        //     this.querySelector('.data-band-field').addEventListener('click', function () {
                        //         alert('Будущее окно выбора поля из БД');
                        //     });
                        //     this.querySelector('.data-band-table').addEventListener('click', function () {
                        //         alert('Будущее окно выбора таблицы из БД');
                        //     });
                        // },
                    },
                },
            });

            editorView.addComponents('<div data-gjs-type="data-band-block"></div>');

        }

        function addPageHeaderBand() {
            editorView.Components.addType('pageHeader-band-block', {
                model: {
                    defaults: {
                        tagName: 'div',
                        draggable: false,
                        droppable: true,
                        highlightable: true,
                        components: `
              <div description-band="true" style="
                   background: #ededed;
                   padding: 2px 8px;
                   font-weight: bold;
                   font-size: 14px;
                   pointer-events: none;
              ">Page header</div>
              
             <div band="true" id="pageHeader" style="height: 100px; width: 794px; background: #fbfbfb; position: relative;
              border: 0px dashed #3b82f6; padding: 30px 10px 10px 10px; overflow: visible;">
            
               <h2 style="">Page header band</h2>
              
            </div>
      `,

                    },
                },
            });

            const components = editorView.getComponents();
            if (usedBands.reportSummary === false) {
                components.add('<div data-gjs-type="pageHeader-band-block"></div>', {at: 0}); // Добавляем первым элементом
                usedBands.headerPage = true;
            }

            // editorView.addComponents('<div data-gjs-type="data-band-block"></div>');
        }

        function addReportTitleBand() {
            editorView.Components.addType('reportTitle-band-block', {
                model: {
                    defaults: {
                        tagName: 'div',
                        draggable: true,
                        droppable: true,
                        highlightable: true,
                        components: `
            <div description-band="true" style="
                   background: #ededed;
                   padding: 2px 8px;
                   font-weight: bold;
                   font-size: 14px;
                   pointer-events: none;
            ">Report title</div>
              
            <div band="true" id="reportTitle" style="height: 100px; width: 794px; background: #fbfbfb; position: relative; border: 0px dashed #3b82f6; padding: 30px 10px 10px 10px; overflow: visible;">
            
               <h2 style="">Report title band</h2>
              
            </div>
      `,

                    },
                },
            });

            const components = editorView.getComponents();
            if (usedBands.reportSummary === false) {
                components.add('<div data-gjs-type="reportTitle-band-block"></div>', {at: 0}); // Добавляем первым элементом
                usedBands.reportTitle = true
                //доделать сценарий при удалении бэндов для повторного добавления
            }

            // editorView.addComponents('<div data-gjs-type="data-band-block"></div>');
        }

        function addPageFooterBand() {
            editorView.Components.addType('pageFooter-band-block', {
                model: {
                    defaults: {
                        tagName: 'div',
                        draggable: true,
                        highlightable: true,
                        components: `
<!--<div style="position: absolute; bottom: 0">-->
             <div description-band="true" id="lablePageFooter" style="
                   background: #ededed;
                   padding: 2px 8px;
                   font-weight: bold;
                   font-size: 14px;
                   pointer-events: none;
                   position: absolute;
                   bottom: 100px;
                   width: 794px;
            ">Page footer</div>
             <div band="true" id="pageFooter" style="height: 100px; width: 794px; position: absolute; bottom: 0;
              background: #fbfbfb;  border: 0px dashed #3b82f6; padding: 30px 10px 10px 10px; overflow: visible;">
            
               <h2 style="">Page footer band</h2>
              
            </div>
<!--  </div>-->
            `,

                    },
                },
            });

            const components = editorView.getComponents();
            if (usedBands.footerPage === false) {
                components.add('<div data-gjs-type="pageFooter-band-block"></div>', {at: components.length}); // Добавляем первым элементом
                usedBands.footerPage = true;
            }

        }

        function addReportSummaryBand() {
            editorView.Components.addType('reportSummary-band-block', {
                model: {
                    defaults: {
                        tagName: 'div',
                        draggable: true,
                        highlightable: true,
                        components: `
            <div description-band="true" style="
                   background: #ededed;
                   padding: 2px 8px;
                   font-weight: bold;
                   font-size: 14px;
                   pointer-events: none;
            ">Report summary</div>
             <div band="true" id="reportSummary" style="height: 100px; width: 794px; background: #fbfbfb; position: relative; border: 0px dashed #3b82f6; padding: 30px 10px 10px 10px; overflow: visible;">
            
               <h2 style="">Report summary band</h2>
              
            </div>
            `,
                    },
                },
            });

            const components = editorView.getComponents();
            if (usedBands.reportSummary === false) {
                components.add('<div data-gjs-type="reportSummary-band-block"></div>', {at: components.length}); // Добавляем первым элементом
                usedBands.reportSummary = true;
            }
        }

        function renderDataBand(htmlTemplate, dataArray, css) {

            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlTemplate, 'text/html');

            const dataBands = doc.querySelectorAll('[data-band="true"]');

            const descriptionBands = doc.querySelectorAll('[description-band="true"]');
            descriptionBands.forEach(description => {
                description.remove();
            })
            // console.log(bands)


            dataBands.forEach(band => {
                const bandHtml = band.innerHTML;

                const bandId = band.getAttribute('id');

                dataArray.forEach(item => {
                    if (bandId.toLowerCase().startsWith(item.tableName.toLowerCase())) {
                        console.log("sdf")
                        item.data.forEach(tableData => {
                            let instanceHtml = bandHtml;

                            Object.keys(tableData).forEach(field => {
                                instanceHtml = instanceHtml.replaceAll(`{{${field}}}`, tableData[field]);
                            });

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
                editorView.setComponents(pagedHtml);

            });

            return doc.body.innerHTML;
        }

        async function fetchReportData(reportName, dbUrl, dbUsername, dbPassword, dbDriver, sql, content, styles) {
            try {
                setIsLoading(true);
                const response = await ReportService.getDataForReport(reportName, dbUrl, dbUsername, encryptData(dbPassword), dbDriver, sql, content, styles);
                return response.data;
            } catch (e) {
                setError(e.response.data.message)
                setIsModalError(true);
            } finally {
                setIsLoading(false);
            }
        }


        function exitPreviewMode() {
            setIsPreviewMode(!isPreviewMode);

            setPages(oldPages);

            editorView.setComponents(oldPages[0].content);
            editorView.setStyle(oldPages[0].styles);

            document.querySelector('.gjs-pn-panels').style.display = '';
            document.querySelector('.gjs-pn-views-container').style.display = '';
            editorView.getWrapper().view.$el.css('pointer-events', '');
        }

        async function enterPreviewMode() {
            // switchPage(1)
            setIsPreviewMode(!isPreviewMode);
            const data = await fetchReportData("", settingDB.url, settingDB.username, settingDB.password, settingDB.driverClassName, sql, "", "")
            if (!data) {
                setIsPreviewMode(false);
                return
            }

            render(data, editorView.getHtml(), editorView.getCss());
            document.querySelector('.gjs-pn-panels').style.display = 'none';
            document.querySelector('.gjs-pn-views-container').style.display = 'none';
            editorView.getWrapper().view.$el.css('pointer-events', 'none');
        }

        function enterViewMode(data, html, css) {
// console.log(html)
// console.log(css)
            setIsPreviewMode(true);
            render(data, html, css);
            document.querySelector('.gjs-pn-panels').style.display = 'none';
            document.querySelector('.gjs-pn-views-container').style.display = 'none';
            editorView.getWrapper().view.$el.css('pointer-events', 'none');
        }


        function render(data, html, css) {

            defineBands(html);
            setOldPage([{id: 1, content: html, styles: css}])

            css = transformIDs(css);
            setTimeout(() => {
                // editorView.setComponents(renderedHtml);
                editorView.setStyle(css);
            }, 100); // Небольшая задержка для обновления состояния

            let renderedHtml = renderDataBand(html, data.tableData, css);

        }


        function transformIDs(css) { //т.к. нужно применять ко всем дубликатам бэнда
            // console.log(css)
            return css.replace(/(?<!:)\#([a-zA-Z_][\w-]+)/g, (match, id) => {
                return `[id^='${id}']`; // заменяем #id на [id^='id']
            });
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

        function removeStyle(htmlString) {
            let styleRegex = /<style[^>]*>[\s\S]*?<\/style>/gi;
            return htmlString.replace(styleRegex, '');
        }

        function createTempContainer() {
            const tempDiv = document.createElement("div");

            const headerContainer = document.createElement('div');
            headerContainer.id = 'header-container';
            tempDiv.appendChild(headerContainer);
            const bodyContainer = document.createElement('div');
            bodyContainer.id = 'body-container';
            tempDiv.appendChild(bodyContainer);
            const footerContainer = document.createElement('div');
            footerContainer.id = 'footer-container';
            tempDiv.appendChild(footerContainer);

            return tempDiv;
        }

        function getFooterBandHeight() {
            if (usedBands.footerPage === true) {
                var footerPage = document.getElementById('pageFooter');
                if (footerPage != null) return footerPage.offsetHeight
            } else {
                return 0;
            }
        }

        function defineBands(html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            doc.getElementById('pageHeader') ? usedBands.headerPage = true : usedBands.headerPage = false
            doc.getElementById('reportTitle') ? usedBands.reportTitle = true : usedBands.reportTitle = false
            doc.getElementById('reportSummary') ? usedBands.reportSummary = true : usedBands.reportSummary = false
            doc.getElementById('pageFooter') ? usedBands.footerPage = true : usedBands.footerPage = false

            // console.log(usedBands)
        }


        function splitIntoA4Pages(htmlString, css, bands) {
            return new Promise((resolve) => {

                const pagesBuf = [
                    {id: 1, content: "", styles: ""}
                ];
                setPages(pagesBuf);
                setCurrentPage(1);

                const tempContainer = createTempContainer();
                tempContainer.style.position = "absolute";
                tempContainer.style.left = "-9999px";
                tempContainer.style.width = "794px"; // Ширина A4
                tempContainer.querySelector('#body-container').innerHTML = `<style>${css}</style>${htmlString}`;


                document.body.appendChild(tempContainer);

                //Логика вставки бэндов в разметку
                insertBand(tempContainer, bands, true, true)

                let contentHeight = tempContainer.scrollHeight; //бэнды которые позиционируются абсолютно, не учитываются

                contentHeight = contentHeight + getFooterBandHeight(); //т.к. footerBand имеет абсолютное позиционирование

                const maxHeight = 1123; // Высота A4

                let newHtml = removeStyle(tempContainer.innerHTML) //html с бэндами

                //  Если контент помещается, просто возвращаем его
                if (contentHeight <= maxHeight) {
                    document.body.removeChild(tempContainer);
                    return resolve(newHtml);
                }

                let pageId = 0;

                // Разбиваем контент на страницы
                let firstPageHtml = "";

                const childNodes = Array.from(tempContainer.querySelector('#body-container').childNodes);





                const tempDiv = createTempContainer();


                // console.log(tempDiv)

                // console.log(childNodes)
                for (let i = 0; i < childNodes.length; i++) {

                    let isAddBand = false;
                    let isNeedReportTitle = false;
                    let isNeedReportSummary = false;


                    let node = childNodes[i];
                    tempDiv.querySelector('#body-container').appendChild(node.cloneNode(true))
                    // tempDiv.appendChild(node.cloneNode(true));


                    // headerContainer.appendChild()

                    const nodeHeight = node.scrollHeight;


                    if (pageId === 0) isNeedReportTitle = true;


                    if (i === childNodes.length - 1) {
                        isNeedReportSummary = true;

                        insertBand(tempDiv, bands, isNeedReportTitle, isNeedReportSummary);
                        pagesBuf[pageId].content = tempDiv.innerHTML;
                        pagesBuf[pageId].styles = css;
                        break;
                    }

                    if (!isAddBand) {
                        insertBand(tempDiv, bands, isNeedReportTitle, isNeedReportSummary);
                        isAddBand = true;
                        isNeedReportTitle = false;
                    }
                    if (pageId === 0) {
                        firstPageHtml = tempDiv.innerHTML;
                    }

                    let updateHeight = getFooterBandHeight() + tempDiv.scrollHeight;
                    console.log(getFooterBandHeight())

                    // Если элемент не влезает - начинаем новую страницу
                    if (updateHeight + nodeHeight > maxHeight) {
                        isAddBand = false;

                        pagesBuf[pageId].content = tempDiv.innerHTML;
                        pagesBuf[pageId].styles = css;
                        pageId++;
                        pagesBuf.push({id: pageId + 1, content: "", styles: ""});

                        tempDiv.querySelector('#body-container').innerHTML = "";
                        tempDiv.querySelector('#header-container').innerHTML = "";
                        tempDiv.querySelector('#footer-container').innerHTML = "";

                    }


                    document.body.appendChild(tempDiv);
                }


                document.body.removeChild(tempDiv);

                setPages(pagesBuf);

                document.body.removeChild(tempContainer);
                resolve(firstPageHtml);
            });
        }

        const handleSelectTableBand = (option) => {
            addDataBand(option);
        };

        function showModalSaveReport() {
            setIsModalSaveReport(!isModalSaveReport)
        }

        function showModalNotif() {
            setIsModalNotif(!isModalNotify)
        }

        function showModalDownloadReport() {
            setIsModalDownloadReport(!isModalDownloadReport)
        }

        function showModalSettingDB() {
            setIsModalSettingDB(!isModalSettingDB)
        }

        function showModalSQL() {
            setIsModalSQL(!isModalSQL)
        }

        function showModalDownloadReport() {
            setIsModalDownloadReport(!isModalDownloadReport)
        }

        async function saveReport(reportName) {
            showModalSaveReport();

            saveCurrentPage(editorView).then(async (updatedPages) => {
                try {
                    await ReportService.createReportTemplate(reportName, reportCategory,
                        settingDB.url, settingDB.username, encryptData(settingDB.password), settingDB.driverClassName, sql,
                        updatedPages[0].content, updatedPages[0].styles);
                    setModalMsg("Документ успешно отправлен!");

                } catch (error) {
                    setModalMsg("Ошибка сохранения отчета на сервер! Попробуйте еще раз.")
                } finally {
                    showModalNotif();
                }
            })
        }

        async function downloadReport(reportName) {
            try {
                const response = await ReportService.getReportTemplateByReportName(reportName);
                editorView.setComponents(response.data.content);
                editorView.setStyle(response.data.styles);
                setReportName(response.data.reportName);
                setReportCategory(response.data.reportCategory)
                setSettingDB({
                    url: response.data.dbUrl,
                    username: response.data.dbUsername,
                    password: decryptData(response.data.dbPassword),
                    driverClassName: response.data.dbDriver
                });
                setSql(response.data.sql);
            } catch (error) {
                setModalMsg("Ошибка загрузки отчета с сервера! Попробуйте еще раз.")
                showModalNotif();
            } finally {
                showModalDownloadReport();
            }
        }

        async function downloadReportsName() {
            try {
                const response = await ReportService.getReportsName();
                setOptReportsName(ReportService.convertReportsNameToSelectOpt(response.data));
                showModalDownloadReport();
            } catch (error) {
                setModalMsg("Ошибка загрузки доступных отчетов! Попробуйте позже.")
                showModalNotif();
            }
        }

        const handleChangeSettingDB = (field, value) => {
            console.log(`field changed: ${field} = ${value}`);
            setSettingDB((prev) => ({
                ...prev,
                [field]: value,
            }));
        };

        const extractTablesAndCheckSQL = () => {
            // console.log(tablesOpt)
            const tableRegex = /(?:FROM|JOIN|UPDATE|INTO)\s+([\w.]+)(?:\s|$|;|\))/gi;
            const foundTables = new Set();

            try {
                const parser = new Parser();
                sql.split(';').forEach(query => {
                    // const ast = parser.astify(query); //На валидность запроса
                    let match;
                    while ((match = tableRegex.exec(query)) !== null) {
                        const tableName = match[1]
                            .replace(/["'`]/g, '') // Удаляем кавычки
                            .split(/\s+/)[0]; // Удаляем алиасы

                        if (tableName) {
                            foundTables.add(tableName);
                        }
                    }
                });
                setTablesOpt(Array.from(foundTables).sort());
                setIsValidSql(true);
            } catch (e) {
                setTablesOpt([]);
                // setIsValidSql(false);
            }

        };


        useEffect(() => {
            extractTablesAndCheckSQL();
        }, [sql]);


        return (
            <div>
                {isLoading && <Loading/>}

                {!isLoading &&
                    <div className=" gjs-two-color gjs-one-bg flex flex-row justify-between py-1 gjs-pn-commands">
                        <div className="flex justify-start text-center ml-2 w-1/3">
                            {!isPreviewMode &&
                                <>
                                    <span className="gjs-pn-btn font-medium">Конструктор отчетов</span>
                                    <span className="gjs-pn-btn">
                            <i className="fa-solid fa-pencil"></i>
                            </span>
                                </>
                            }
                            {isPreviewMode &&
                                <>
                                    <span className="gjs-pn-btn font-medium">Просмотр отчетов</span>
                                    <span className="gjs-pn-btn">
                           <i className="fa-solid fa-eye"></i>
                            </span>
                                </>
                            }

                            {!isPreviewMode && !previewMode && <button onClick={enterPreviewMode}>Просмотр</button>}
                            {isPreviewMode && !previewMode && <button onClick={exitPreviewMode}>Конструктор</button>}

                            {previewMode && <button onClick={onCloseReport}>Закрыть отчет</button>}
                        </div>

                        {isPreviewMode && <div className="flex justify-start text-center w-1/3">
                    <span className="gjs-pn-btn hover:bg-gray-200" onClick={() => switchPage(currentPage - 1)}
                          title="Пред. страница">
                        <i className="fa-solid fa-angle-left"></i>
                        </span>
                            <span className="gjs-pn-btn">
                       {currentPage} / {pages.length}
                        </span>
                            <span className="gjs-pn-btn hover:bg-gray-200" onClick={() => switchPage(currentPage + 1)}
                                  title="След. страница">
                        <i className="fa-solid fa-angle-right"></i>
                        </span>
                            <span className="gjs-pn-btn hover:bg-gray-200" onClick={() => exportPDF(editorView)}
                                  title="Экспорт PDF">
                        <i className="fa fa-file-pdf"></i>
                        </span>
                            <span className="gjs-pn-btn hover:bg-gray-200" onClick={() => exportHtml(editorView)}
                                  title="Экспорт HTML">
                        <i className="fa fa-code"></i>
                        </span>
                            <span className="gjs-pn-btn hover:bg-gray-200" onClick={printAllPages} title="Печать">
                        <i className="fa fa-print"></i>
                        </span>
                            <span className="gjs-pn-btn hover:bg-gray-200" onClick={() => changeZoom(-10)}
                                  title="Уменьшить масштаб">
                            <i className="fa fa-magnifying-glass-minus"></i>
                        </span>
                            <span className="gjs-pn-btn hover:bg-gray-200" onClick={() => changeZoom(10)}
                                  title="Увеличить масштаб">
                        <i className="fa fa-magnifying-glass-plus"></i>
                    </span>
                        </div>}

                        <div className="flex justify-end text-center mr-2 w-1/3">

                            {!isPreviewMode &&
                                <>
                            <span className="gjs-pn-btn hover:bg-gray-200" onClick={exportJSON}
                                  title="Экспорт шаблона JSON">
                            <i className="fa fa-file-export"></i></span>
                                    <span className="gjs-pn-btn hover:bg-gray-200" onClick={importJSON}
                                          title="Импорт шаблона JSON">
                            <i className="fa fa-upload"></i></span>

                                    <span className="gjs-pn-btn hover:bg-gray-200" onClick={showModalSaveReport}
                                          title="Сохранить шаблон на сервер">
                            <i className="fa-solid fa-sd-card"></i></span>
                                    <span className="gjs-pn-btn hover:bg-gray-200" onClick={() => {
                                        downloadReportsName();
                                    }}
                                          title="Загрузить шаблон с сервера">
                           <i className="fa-solid fa-cloud-arrow-down"></i></span>
                                </>
                            }

                        </div>

                    </div>}
                {/*<div className=" gjs-two-color gjs-one-bg flex flex-row justify-start py-1 gjs-pn-commands gap-x-2">*/}
                {/*    <button onClick={() => {*/}
                {/*        addDataBand(tables[0])*/}
                {/*    }}>DataBandT1*/}
                {/*    </button>*/}
                {/*    <button onClick={() => {*/}
                {/*        addDataBand(tables[1])*/}
                {/*    }}>DataBandT2*/}
                {/*    </button>*/}
                {/*    <button onClick={addPageHeaderBand}>Заголовок стр.</button>*/}
                {/*    <button onClick={addReportTitleBand}>Заголовок отчета</button>*/}
                {/*    <button onClick={addPageFooterBand}>Подвал стр.</button>*/}
                {/*    <button onClick={addReportSummaryBand}>Подвал отчета</button>*/}

                {/*    {!isPreviewMode && <button onClick={enterPreviewMode}>Просмотр</button>}*/}
                {/*    {isPreviewMode && <button onClick={exitPreviewMode}>Редактор</button>}*/}


                {/*</div>*/}
                {!isPreviewMode &&
                    <div
                        className="pl-2 gjs-two-color gjs-one-bg flex flex-row justify-between py-1 gjs-pn-commands ">
                        <div className="flex flex-row gap-x-2">
                            <div className="p-1 hover:bg-gray-200">
                                <button onClick={addReportTitleBand}
                                        className="flex-col justify-center justify-items-center">
                                    <img src="/icons/ReportTitle.png" className="icon-band" alt="Report title"/>
                                    <span className="text-xs font-medium">Заголовок отчета</span>
                                </button>
                            </div>
                            <div className="p-1 hover:bg-gray-200">
                                <button onClick={addPageHeaderBand}
                                        className="flex-col justify-center justify-items-center">
                                    <img src="/icons/PageHeader.png" className="icon-band" alt="Page header"/>
                                    <span className="text-xs font-medium">Заголовок страницы</span>
                                </button>
                            </div>
                            <div className="p-1 hover:bg-gray-200">
                                <button onClick={addReportSummaryBand}
                                        className="flex-col justify-center justify-items-center">
                                    <img src="/icons/ReportSummary.png" className="icon-band" alt="Report Summary"/>
                                    <span className="text-xs font-medium">Подвал отчета</span>
                                </button>
                            </div>
                            <div className="p-1 hover:bg-gray-200">
                                <button onClick={addPageFooterBand}
                                        className="flex-col justify-center justify-items-center">
                                    <img src="/icons/PageFooter.png" className="icon-band" alt="Page footer"/>
                                    <span className="text-xs font-medium">Подвал страницы</span>
                                </button>
                            </div>
                            <div className="p-1 hover:bg-gray-200 flex-col justify-center justify-items-center">
                                <img src="/icons/DataBand.png" className="icon-band" alt="Data band"/>
                                <Dropdown options={tablesOpt} onSelect={handleSelectTableBand}/>
                            </div>
                        </div>
                        <div className="flex flex-row gap-x-2 pr-2">
                            <div className="hover:bg-gray-200 flex-col justify-center justify-items-center">
                                <button onClick={showModalSettingDB}
                                        className="flex flex-col justify-between justify-items-center">
                                <span className="gjs-pn-btn hover:bg-gray-200 flex justify-center ">
                                        <i className="fa-lg fa-solid fa-server pt-3"></i>
                                </span>
                                    <span className="text-xs font-medium px-1">Конфигурация БД</span>
                                </button>
                            </div>
                            <div className="hover:bg-gray-200 flex-col justify-center justify-items-center">
                                <button onClick={showModalSQL}
                                        className="flex flex-col justify-between justify-items-center">
                                <span className="gjs-pn-btn hover:bg-gray-200 flex justify-center ">
                                        <i className="fa-lg fa-solid fa-database pt-3"></i>
                                </span>
                                    <span className="text-xs font-medium px-1">SQL запрос</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-row gap-x-2 pr-2">
                        </div>


                    </div>}

                <div id="editor" ref={editorRef}/>


                {isModalSaveReport &&
                    <ModalInput title={"Сохранение отчета на сервер"} message={"modalMsg"} onClose={showModalSaveReport}
                                onAgreement={saveReport} name={reportName} onChangeName={(e) => setReportName(e.target.value)}
                                category={reportCategory} onChangeCategory={(e)=>setReportCategory(e.target.value)}
                    />
                }

                {isModalNotify &&
                    <ModalNotify title={"Результат операции"} message={modalMsg} onClose={showModalNotif}/>}

                {isModalError &&
                    <ModalNotify title={"Ошибка"} message={error} onClose={() => setIsModalError(false)}/>}

                {isModalDownloadReport &&
                    <ModalSelect title={"Загрузка отчета с сервера"} message={"modalMsg"}
                                 onClose={showModalDownloadReport}
                                 onAgreement={downloadReport} options={optReportsName}/>
                }

                {isModalSettingDB &&
                    <ModalSettingDB url={settingDB.url} username={settingDB.username}
                                    password={settingDB.password} driverClassName={settingDB.driverClassName}
                                    onChangeField={handleChangeSettingDB}
                                    onClose={showModalSettingDB}/>
                }

                {isModalSQL &&
                    <ModalSQL value={sql} isValid={isValidSql}
                              onChange={(e) => setSql(e.target.value)}
                              onClose={showModalSQL}/>
                }


            </div>
        );
    })
;

export default ReportEditor;

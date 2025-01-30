import React, {useEffect, useRef} from 'react';


import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";
import jsPDF from "jspdf";
import grapesjs from "grapesjs";

import grapesjspresetwebpage from 'grapesjs-preset-webpage/dist/index.js';
// import grapesjstable from 'grapesjs-table/src/blocks.js';


import htmlToPdfmake from "html-to-pdfmake"; // Импортируем html-to-pdfmake

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts"; // Импортируем шрифты для pdfmake

// Добавляем шрифт Roboto в виртуальную файловую систему pdfmake
// pdfMake.vfs = pdfFonts.pdfMake.vfs;

const ReportEditor = () => {
    const editorRef = useRef(null);
    pdfMake.addVirtualFileSystem(pdfFonts);
    useEffect(() => {
        // Инициализация GrapesJS
        const editor = grapesjs.init({
            container: editorRef.current,
            telemetry: false,
            fromElement: true,
            height: "1200px",
            width: 'auto',
            dragMode: 'absolute',
            storageManager: false, // Отключаем сохранение
            // panels: { defaults: [] }, // Убираем стандартные панели
            plugins: [grapesjspresetwebpage],



            // Очищаем список устройств
            deviceManager: {
                devices: [], // Полностью убираем все предустановленные размеры
            },
            // styleManager: {
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
            canvasElement.style.padding = '20px';
            canvasElement.style.marginLeft = '210px';
            canvasElement.style.marginTop = '20px';
            canvasElement.style.backgroundColor = '#949494';
            canvasElement.style.border = '5px';
            canvasElement.style.backgroundColor = '#9a9a9a';

            editor.Canvas.getBody().style.width = '794px';
            editor.Canvas.getBody().style.height = '1123px';
            editor.Canvas.getBody().style.margin = '0';
            editor.Canvas.getBody().style.border = '5px';
            editor.Canvas.getBody().style.backgroundColor = '#9a9a9a';
            // editor.Canvas.getBody().style.padding = '20px';
            editor.Canvas.getBody().style.backgroundColor = '#f1f1f1';

            const deviceButton = document.querySelector('.gjs-device-selector');
            if (deviceButton) {
                deviceButton.style.display = 'none';  // Прячем кнопку выбора устройства
            }

        }, 200);

        editor.setStyle({
            'background-color': '#bf13d9', // Цвет фона
        });
        // setTimeout(() => {
        //     const canvas = editor.Canvas.getBody();
        //     canvas.style.transform = `scale(0.1)`
        //     canvas.style.width = "794px"
        //     canvas.style.height = "1123px"
        //     canvas.style.border = "1px solid #ccc"
        //
        // }, 500);
        editor.setComponents(`<h1>gggggggg</h1><p>dddddddddd</p>`);




        // Добавляем кнопки для экспорта
        editor.Panels.addButton('options', [
            {
                id: 'export-excel',
                className: 'fa fa-file-excel-o',
                command: () => exportExcel(editor),
                attributes: {title: 'Export Excel'},
            },
            {
                id: 'export-html',
                className: 'fa fa-code',
                command: () => exportHtml(editor),
                attributes: {title: 'Export HTML'},
            },
            {
                id: 'export-pdf',
                className: 'fa fa-file-pdf-o',
                command: () => exportPDF(editor),
                attributes: {title: 'Export PDF'},
            },

        ]);

        addDeviceManager(editor);

        addBlocks(editor);

        editor.DataSources.add({
            id: 'my_data_source_id',
            records: [
                {id: 'id1', name: 'value1'},
                {id: 'id2', name: 'value2'}
            ]
        });


    }, []);

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

        // Получаем HTML контент из редактора
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



        const doc = new jsPDF('p', 'mm', 'a4'); // Инициализация jsPDF для формата A4

        // Добавляем HTML контент в PDF
        doc.html(finalHtml, {
            callback: function (doc) {
                // Сохраняем PDF
                doc.save('document.pdf');
            },
            x: 10,
            y: 10,
            width: 180, // Ширина страницы для контента
            windowWidth: 800, // Окно для расчета размеров
        });


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
            label: "Мой блок",
            content: "<div style='padding:10px; background:#f3f3f3;'>Hello!</div>",
        });
        editor.BlockManager.add("header", {
            label: "Заголовок",
            content: "<h1 style=\"text-align:center;\">Заголовок h1</h1>",
        });
        editor.BlockManager.add("paragraph", {
            label: "Абзац",
            content: "<p style=\"font-size: 14px;\">Введите текст отчета...</p>",
        });
        editor.BlockManager.add("table", {
            label: "Таблица",
            content: `
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
            label: "Мой блок",
            content: "<div style='padding:10px; background:#f3f3f3;'>Hello!</div>",
        });
    }

    return (
        <div>
            {/*<div id="blocks" style={{ width: "250px", padding: "10px", background: "#f5f5f5" }} />*/}
            <div id="editor" ref={editorRef}/>
        </div>
    );
};

export default ReportEditor;

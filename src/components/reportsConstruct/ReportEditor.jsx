import React, { useEffect, useRef } from 'react';


import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";
import jsPDF from "jspdf";
import grapesjs from "grapesjs";

import "grapesjs-preset-webpage";
import "grapesjs-table"; // Поддержка таблиц
import "grapesjs-custom-code"; // Позволяет вставлять HTML/CSS/JS

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
            fromElement: true,
            height: '90vh',
            width: 'auto',
            dragMode: 'absolute',
            storageManager: false, // Отключаем сохранение
            // panels: { defaults: [] }, // Убираем стандартные панели
            plugins: ["gjs-preset-webpage", "grapesjs-table", "gjs-custom-code"],

// Очищаем список устройств
            deviceManager: {
                devices: [], // Полностью убираем все предустановленные размеры

            },

          //   // Фиксируем размер холста (без устройств)
          //   canvas: {
          //       styles: `
          //   body {
          //     width: 100%;
          //     height: 100%;
          //     background: white;
          //     margin: auto;
          //   }
          // `,
          //   },






        });


        // setTimeout(() => {
        //     const canvas = editor.Canvas.getBody();
        //     canvas.style.transform = `scale(0.1)`
        //     canvas.style.width = "794px"
        //     canvas.style.height = "1123px"
        //     canvas.style.border = "1px solid #ccc"
        //
        // }, 500);

        editor.CssComposer.add("body", {
            width: "210mm",
            height: "297mm",
            background: "white",
            margin: "auto",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
            padding: "10mm",
        });

        // Добавляем кнопки для экспорта
        editor.Panels.addButton('options', [
            {
                id: 'export-html',
                className: 'fa fa-code',
                command: () => exportHtml(editor),
                attributes: { title: 'Export HTML' },
            },
            {
                id: 'export-pdf',
                className: 'fa fa-file-pdf-o',
                command: () => exportPDF(editor),
                attributes: { title: 'Export PDF' },
            },
            {
                id: 'export-excel',
                className: 'fa fa-file-excel-o',
                command: () => exportExcel(editor),
                attributes: { title: 'Export Excel' },
            },
        ]);

        addDeviceManager(editor);

        addBlocks(editor);


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
        const blob = new Blob([finalHtml], { type: "text/html" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "exported_with_css.html"; // Имя файла
        link.click();
    };

    // Функция экспорта PDF
    const exportPDF = async (editor) => {


        const htmlContent = editor.getHtml(); // Получаем HTML контент из GrapesJS

        // Преобразуем HTML в структуру данных для pdfmake
        const pdfContent = htmlToPdfmake(htmlContent);

        // Генерация PDF с помощью pdfmake
        const documentDefinition = {
            content: pdfContent,
            // defaultStyle: {
            //     font: 'Arial',  // Применяем шрифт Roboto по умолчанию
            // }
            pageSize: "A4", // Устанавливаем размер страницы A4
            pageMargins: [40, 60, 40, 60], // Отступы страницы (верх, левый, правый, низ)
        };

        pdfMake.createPdf(documentDefinition).download("report.pdf"); // Скачиваем PDF

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
        const deviceManager = editor.Devices;
        const device1 = deviceManager.add({
            // Without an explicit ID, the `name` will be taken. In case of missing `name`, a random ID will be created.
            id: 'A4',
            name: 'A4',
            width: '100mm', // This width will be applied on the canvas frame and for the CSS media
            // height: '3507px'
        });
        deviceManager.select(device1);
    }

    function addBlocks(editor){
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
            <div id="editor" ref={editorRef} />
        </div>
    );
};

export default ReportEditor;

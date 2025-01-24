import React, { useEffect, useRef } from 'react';



import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import grapesjs from "grapesjs";

const ReportEditor = () => {
    const editorRef = useRef(null);

    useEffect(() => {
        // Инициализация GrapesJS
        const editor = grapesjs.init({
            container: editorRef.current,
            fromElement: true,
            height: '100vh',
            width: 'auto',
            storageManager: { type: null }, // Отключаем сохранение
            panels: { defaults: [] }, // Убираем стандартные панели
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
    }, []);

    // Функция экспорта HTML
    const exportHtml = (editor) => {
        const html = editor.getHtml();
        const css = editor.getCss();
        const completeHtml = `
      <!DOCTYPE html>
      <html>
        <head><style>${css}</style></head>
        <body>${html}</body>
      </html>
    `;

        const blob = new Blob([completeHtml], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'report.html';
        link.click();
    };

    // Функция экспорта PDF
    const exportPDF = async (editor) => {
        const html = editor.getHtml();
        const css = editor.getCss();

        // Создаем временный элемент для рендера
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `<style>${css}</style>${html}`;
        document.body.appendChild(tempDiv);

        // Конвертируем в PDF
        const canvas = await html2canvas(tempDiv);
        const pdf = new jsPDF();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 190, 0);
        pdf.save('report.pdf');

        // Удаляем временный элемент
        document.body.removeChild(tempDiv);
    };

    // Функция экспорта Excel
    const exportExcel = (editor) => {

    };

    return (
        <div>
            <div id="editor" ref={editorRef} />
        </div>
    );
};

export default ReportEditor;

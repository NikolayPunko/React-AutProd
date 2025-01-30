// src/GrapesEditor.js
import React, { useEffect } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import 'grapesjs-preset-webpage';


const GrapesEditor = () => {
    useEffect(() => {
        const editor = grapesjs.init({
            container: '#gjs',
            fromElement: true,
            height: '100vh',
            width: 'auto',
            // dragMode: 'absolute',
            // storageManager: false, // Отключаем локальное сохранение
            // plugins: ["gjs-preset-webpage"], // Используем предустановленный плагин
            // panels: { defaults: [] },
        });



        // // Пример добавления пользовательского компонента
        // editor.BlockManager.add('json-text', {
        //     label: 'JSON Text',
        //     content: {
        //         type: 'text',
        //         content: '<div class="json-text">Вставьте JSON данные здесь...</div>',
        //     },
        // });
        //
        // editor.BlockManager.add("my-block", {
        //     label: "Мой блок",
        //     content: "<div style='padding:10px; background:#f3f3f3;'>Hello!</div>",
        // });
    }, []);

    return <div id="gjs"></div>;
};

export default GrapesEditor;


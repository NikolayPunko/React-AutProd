// src/GrapesEditor.js
import React, { useEffect } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

const GrapesEditor = () => {
    useEffect(() => {
        const editor = grapesjs.init({
            container: '#gjs',
            fromElement: true,
            height: '100vh',
            width: 'auto',
            dragMode: 'absolute'
        });

        // Пример добавления пользовательского компонента
        editor.BlockManager.add('json-text', {
            label: 'JSON Text',
            content: {
                type: 'text',
                content: '<div class="json-text">Вставьте JSON данные здесь...</div>',
            },
        });
    }, []);

    return <div id="gjs"></div>;
};

export default GrapesEditor;


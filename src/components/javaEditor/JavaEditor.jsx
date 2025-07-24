import React, {useRef, useState} from "react";
import {Editor, loader} from "@monaco-editor/react";
import axios from "axios";
import {styleInputWithoutRounded} from "../../data/styles";
import Select from "react-select";
import {CustomStyleWithoutRounded} from "../../data/styleForSelect";


export function JavaEditor({script, parameters, onChange, onClose, setParameters, dataBandsOpt, setDataBandsOpt}) {

    const editorRef = useRef(null);


    const updateParameter = (key, field, value) => {
        if (field === "type") {
            setParameters(parameters.map(p =>
                p.key === key ? {...p, [field]: value.value} : p
            ));
            return;
        }

        setParameters(parameters.map(p =>
            p.key === key ? {...p, [field]: value} : p
        ));
    };

    const addParameter = () => {
        setParameters([...parameters, {
            name: '',
            key: '',
            type: 'TEXT',
            default: ''
        }]);
    };

    const removeLastParameter = () => {
        setParameters(prevParameters => {
            if (prevParameters.length === 0) return prevParameters;
            return prevParameters.slice(0, -1);
        });
    };

    const addDataBand = () => {
        setDataBandsOpt([...dataBandsOpt, ""]);
    };

    const removeLastDataBand = () => {
        setDataBandsOpt(prevDataBandsOpt => {
            if (prevDataBandsOpt.length === 0) return prevDataBandsOpt;
            return prevDataBandsOpt.slice(0, -1);
        });
    };

    const handleDateBandChange = (index, newValue) => {
        setDataBandsOpt(prevData => {
            const updatedData = [...prevData];
            updatedData[index] = newValue;
            return updatedData;
        });
    };




    const options = [
        {
            value: 'TEXT',
            label: 'Текст'
        },
        {
            value: 'NUMBER',
            label: 'Число'
        },
        {
            value: 'DATE',
            label: 'Дата'
        },
        {
            value: 'BOOLEAN',
            label: 'Да/Нет'
        },
    ]

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    const [code, setCode] = useState(`// Пример Java-скрипта для отчёта
        import java.util.*;
        
        public class ReportScript {
          public static Map<String, Object> execute(Map<String, Object> params) {
            String name = (String) params.get("name");
            int age = (Integer) params.get("age");
            
            // Логика обработки...
            Map<String, Object> result = new HashMap<>();
            result.put("greeting", "Hello, " + name + "!");
            result.put("isAdult", age >= 18);
            return result;
          }
        }`
    );

    const [params, setParams] = useState({
        name: "John",
        age: 25,
    });

    const [output, setOutput] = useState("");

    const handleExecute = async () => {
        try {
            const response = await axios.post("http://localhost:8080/api/execute-script", {
                code,
                params,
            });
            setOutput(JSON.stringify(response.data, null, 2));
        } catch (error) {
            setOutput("Error: " + error.response.data.message);
        }
    };

    // Загрузка кастомной темы
    loader.init().then(monaco => {
        monaco.editor.defineTheme('my-theme', {
            base: 'vs',
            colors: { 'editor.background': '#ffffff' },
            rules: [{ token: 'keyword', foreground: '#e88c1e' }]
        });
    });


    return (
        <div className="bg-blue-6002 mb-8">

            <div className="flex flex-col">
                <div className="flex flex-row py-3 px-8">
                    <div className="flex w-5/6 text-2xl font-medium items-center text-center">Редактор
                        скрипта
                    </div>
                    <div className="flex flex-row justify-end w-1/5">
                        <button onClick={onClose} className="px-2  h-7 rounded text-sm font-medium shadow-sm border border-slate-400 hover:bg-gray-200">Конструктор
                        </button>
                    </div>

                </div>


                <div className="flex flex-row">
                    <div className="border-y-2 w-2/3">
                        <Editor
                            onMount={handleEditorDidMount}
                            height="85vh"

                            language="java"
                            theme="vs" //можно сделать кастомную тему
                            value={script}
                            onChange={(value) => onChange(value)}
                            options={{
                                fontSize: 14,
                                lineNumbers: 'on',
                                minimap: {enabled: false},
                                scrollBeyondLastLine: false,
                            }}
                        />
                    </div>
                    <div className="flex flex-col w-1/3">
                        <div className=" flex-row px-8 h-2/3">

                            <div className="flex justify-between items-center">
                                <div className="flex text-2xl text-nowrap font-medium text-start mt-2 mb-3">Параметры</div>
                                <div className="flex flex-row justify-end">
                                    <button onClick={addParameter}
                                            className=" h-[30px] text-nowrap px-2 text-sm text-white rounded shadow-inner bg-blue-800 hover:bg-blue-700">Добавить
                                        параметр
                                    </button>
                                    <button onClick={removeLastParameter}
                                            className="ml-4 text-nowrap h-[30px] px-2 text-sm text-white rounded shadow-inner bg-blue-800 hover:bg-blue-700">Удалить
                                        параметр
                                    </button>
                                </div>

                            </div>


                            <div className="flex flex-row mb-1">
                                <span className="text-sm text-center font-medium w-1/5">Название</span>
                                <span className="text-sm text-center font-medium w-1/5">Параметр</span>
                                <span className="text-sm text-center font-medium w-1/5">Тип</span>
                                <span className="text-sm text-center font-medium w-2/5">Знач. по умолчанию</span>
                            </div>

                            <div className="max-h-96 overflow-auto">
                                {parameters.map((param, index) => (
                                    <div key={index} className="flex flex-row py-0">
                                        <input className={styleInputWithoutRounded + " font-medium mr-0 w-1/5"}
                                               value={param.name}
                                               onChange={(e) => {
                                                   updateParameter(param.key, 'name', e.target.value);
                                               }}
                                               placeholder="Название параметра"
                                        />
                                        <input className={styleInputWithoutRounded + " font-medium mr-0 w-1/5"}
                                               value={param.key}
                                               onChange={(e) => updateParameter(param.key, 'key', e.target.value)}
                                               placeholder="Параметр (:param)"
                                        />

                                        <Select className="text-sm font-medium w-1/5 mr-0"
                                                placeholder={"Тип параметра"}
                                                value={{
                                                    value: param.type,
                                                    label: options.find(option => option.value === param.type)?.label || null
                                                }}
                                                onChange={(e) => updateParameter(param.key, 'type', e)}
                                                styles={CustomStyleWithoutRounded}
                                                options={options}
                                                menuPortalTarget={document.body}
                                                isClearable={false} isSearchable={false}/>


                                        {param.type === "TEXT" &&
                                            <input
                                                className={styleInputWithoutRounded + " font-medium w-2/5"}
                                                type="text"
                                                value={param.default}
                                                onChange={(e) => updateParameter(param.key, 'default', e.target.value)}
                                            />
                                        }

                                        {param.type === "NUMBER" &&
                                            <input
                                                className={styleInputWithoutRounded + " font-medium w-2/5"}
                                                type="number"
                                                value={param.default}
                                                onChange={(e) => updateParameter(param.key, 'default', e.target.value)}
                                            />
                                        }

                                        {param.type === "DATE" &&
                                            <div style={{display: 'flex', alignItems: 'center'}}
                                                 className="font-medium w-2/5">
                                                <input className={styleInputWithoutRounded + " w-[100%]"}
                                                       type="date"
                                                       value={param.default === true ? "" : param.default || ""}
                                                       onChange={(e) => updateParameter(param.key, 'default', e.target.value || "")}
                                                       style={{
                                                           paddingRight: '50%',
                                                       }}
                                                />
                                                <span className="text-xs" style={{
                                                    marginLeft: '-70px',
                                                    cursor: 'pointer',
                                                }}>
                                        Текущая
                                    </span>
                                                <input className={styleInputWithoutRounded}
                                                       type="checkbox"
                                                       checked={param.default === true}
                                                       onChange={(e) => updateParameter(param.key, 'default', e.target.checked || "")}
                                                       style={{
                                                           marginLeft: '5px',
                                                           cursor: 'pointer',
                                                       }}
                                                />

                                            </div>
                                        }

                                        {param.type === "BOOLEAN" &&
                                            <div className=" w-2/5 text-center border border-slate-400">
                                                <input
                                                    className="h-full w-[16px] cursor-pointer"
                                                    type="checkbox"
                                                    checked={param.default}
                                                    onChange={(e) => updateParameter(param.key, 'default', e.target.checked)}
                                                />
                                            </div>
                                        }

                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className=" flex-row px-8 mt-4 h-1/3">

                            <div className="flex justify-between items-center">
                                <div className="flex text-2xl font-medium text-start mt-2 mb-3">Бэнды данных</div>
                                <div className="flex flex-row justify-end">
                                    <button onClick={addDataBand}
                                            className="h-[30px] px-2 text-nowrap text-sm text-white rounded shadow-inner bg-blue-800 hover:bg-blue-700">Добавить
                                        бэнд
                                    </button>
                                    <button onClick={removeLastDataBand}
                                            className="ml-4 h-[30px] px-2 text-nowrap text-sm text-white rounded shadow-inner bg-blue-800 hover:bg-blue-700">Удалить
                                        бэнд
                                    </button>
                                </div>

                            </div>


                            <div className="flex flex-row mb-1">
                                <span className="text-sm text-center text-nowrap font-medium ">Бэнды:</span>

                            </div>

                            <div className="max-h-40 overflow-auto">
                                {dataBandsOpt.map((param, index) => (
                                    <div key={index}>
                                        <input className={styleInputWithoutRounded + " font-medium mr-0 w-full"}
                                               value={param}
                                               onChange={(e) => handleDateBandChange(index, e.target.value)}
                                               placeholder="Названия бэнда с данными"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>


            </div>


        </div>
    );


}

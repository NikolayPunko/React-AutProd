import React, {useEffect, useState} from "react";
import {styleInput, styleLabelInput} from "../../data/styles";


export function ModalParameter({parameters, reportName, onSubmit, onClose}) {

    const [values, setValues] = useState({});

    const handleChange = (key, value) => {
        setValues(prev => ({...prev, [key]: value}));
    };

    const handleSubmit = () => {
        // Проверка обязательных полей
        // const missing = parameters
        //     .filter(p => p.required && !values[p.key])
        //     .map(p => p.name);

        // if (missing.length > 0) {
        //     alert(`Заполните обязательные поля: ${missing.join(', ')}`);
        //     return;
        // }
        // console.log(values)
        onSubmit(values);
    };

    useEffect(() => {
        // console.log(parameters)
        // console.log(values)
        for (let i = 0; i < parameters.length; i++) {
            if(parameters[i].default !== null){
                setValues(prev=> ({...prev, [parameters[i].key]: parameters[i].default}))
            } else if(parameters[i].type === "BOOLEAN") {
                handleChange(parameters[i].key, false);
            }
        }
    }, [])

    useEffect(() => {
        const initialValues = {};
       parameters
            .filter(param => param.type === "DATE")
            .forEach(param => {
                initialValues[param.key] = param.default === true
                    ? new Date().toISOString().split('T')[0]
                    : param.default || '';
            });
        setValues(prevState => ({...prevState,...initialValues}));
    }, []);


    // useEffect(() => {
    //     console.log(values)
    // }, [values]);

    return (

        <>
            <div
                className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0"
                onClick={onClose}
            />
            <div
                className="w-full md:w-auto  lg:w-[700px]  p-5 z-30 rounded bg-white absolute top-1/4 left-1/2 -translate-x-1/2 px-8">
                <h1 className="text-2xl font-medium text-start mb-5">Параметры отчета</h1>

                {parameters.length === 0 &&
                    <h4>Отчет не содержит параметров</h4>
                }
                {parameters.length > 0 &&
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">

                            {parameters.filter(param => param.type === "TEXT").map(param => (
                                <div key={param.key} className=" rounded-lg p-2 flex flex-col">
                                    {/*<div key={param.key} className="border rounded-lg p-2 flex flex-col">*/}
                                    <label className={styleLabelInput}>{param.name}</label>
                                    <input
                                        className={styleInput}
                                        type="text"
                                        value={values[param.key] || param.defaultValue || ''}
                                        onChange={(e) => handleChange(param.key, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                            {parameters.filter(param => param.type === "NUMBER").map(param => (
                                <div key={param.key} className=" rounded-lg p-2 flex flex-col">
                                    <label className={styleLabelInput}>{param.name}</label>
                                    <input
                                        className={styleInput}
                                        type="number"
                                        value={values[param.key] || param.defaultValue || ''}
                                        onChange={(e) => handleChange(param.key, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                            {parameters.filter(param => param.type === "DATE").map(param => (
                                <div key={param.key} className="rounded-lg p-2 flex flex-col">
                                    <label className={styleLabelInput}>{param.name}</label>
                                    <input
                                        className={styleInput}
                                        type="date"
                                        value={values[param.key] || ''}
                                        onChange={(e) => handleChange(param.key, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {parameters.filter(param => param.type === "BOOLEAN").map(param => (
                                <div key={param.key} className=" rounded-lg p-2 inline-flex">
                                    <label className={styleLabelInput}>{param.name}</label>
                                    <input
                                        className={"hover:border-blue-800 bg-blue-800 hover:bg-blue-800 outline-blue-800 h-[20px] w-[40px] ml-2"}
                                        type="checkbox"
                                        checked={values[param.key] || param.defaultValue === false}
                                        onChange={(e) => handleChange(param.key, e.target.checked)}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                }


                <div className="flex flex-row justify-end mt-4">
                    <div className="flex flex-row w-full justify-end items-center bg-white my-2 ">
                        <button
                            onClick={onClose}
                            className="min-w-[50px] px-2 mx-2 h-7 rounded text-xs font-medium shadow-sm border border-slate-400 hover:bg-gray-200">
                            Закрыть
                        </button>
                        <button onClick={handleSubmit}
                                className="min-w-[50px] text-xs h-7 font-medium px-2 py-1 rounded text-white bg-blue-800 hover:bg-blue-700">
                            Сформировать отчет
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
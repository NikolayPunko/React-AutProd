import {styleInput, styleLabelInput} from "../../data/styles";
import Select from "react-select";
import {CustomStyle} from "../../data/styleForSelect";
import React, {useEffect, useState} from "react";

export function ModalSQL({ value, parameters, isValid, onChange, onClose, setParameters }) {




    const updateParameter = (key, field, value) => {
        if(field === "type"){
            setParameters(parameters.map(p =>
                p.key === key ? {...p, [field]: value.value} : p
            ));
            return;
        }

        setParameters(parameters.map(p =>
            p.key === key ? {...p, [field]: value} : p
        ));
    };

    const addParameter = (key) => {
        setParameters([...parameters, {
            name: '',
            key: key,
            type: 'TEXT'
        }]);
    };

    const findAndAddParameters = (inputString) => {
        const wordsStartingWithColon = inputString.match(/:\w+/g) || [];
        const keys = wordsStartingWithColon.map(word => word.substring(1));
        keys.forEach(key => {
            const keyExists = parameters.some(param => param.key === key);
            if (!keyExists) {
                addParameter(key);
            }
        });
    };

    const removeUnusedParameters = (sqlString) => {
        const usedKeys = (sqlString.match(/:\w+/g) || []).map(word => word.substring(1));
        setParameters(prevParams =>
            prevParams.filter(param => usedKeys.includes(param.key))
        );
    };

    useEffect(() => {

    }, [])


    function onChangeSql(e) {
        onChange(e);
        findAndAddParameters(e.target.value);
        removeUnusedParameters(e.target.value);

    }

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

    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0"
                onClick={onClose}
            />
            <div
                className="w-full max-w-[700px] lg:w-[700px] p-5 z-30 rounded bg-white absolute top-1/4 left-1/2 -translate-x-1/2 px-8">
                <h1 className="text-2xl font-medium text-start mb-5">Запрос SQL для данных отчета</h1>
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-2">Можно вводить несколько SQL запросов, отделенных точкой с запятой. Далее запрашиваемые данные могут быть использованы в отчете.
                    Параметры задаются с помощью символа доеточия ':parameter', затем их требуется настроить. Пример - SELECT * FROM PRODUCT WHERE ID = :id;
                    </span>

                    <div className="flex flex-col ">
                        <span className={styleLabelInput}>SQL</span>
                        <textarea
                            className={styleInput + " min-h-[200px] text-orange-700 font-medium"}
                            value={value}
                            onChange={onChangeSql}
                        />
                    </div>


                </div>
                <h1 className="text-2xl font-medium text-start mt-2 mb-5">Параметры запроса</h1>
                {parameters.map(param => (
                    <div key={param.key} className="flex flex-row py-2">
                        <input className={styleInput + " font-medium mr-2 w-1/3"}
                               value={param.name}
                               onChange={(e) => {
                                   updateParameter(param.key, 'name', e.target.value);
                                   console.log("name: "+ param.name + "=" + e.target.value)
                               }}
                               placeholder="Название параметра"
                        />
                        <input className={styleInput + " font-medium w-1/3"}
                               value={param.key}
                               onChange={(e) => updateParameter(param.key, 'key', e.target.value)}
                               placeholder="Ключ для SQL (:key)"
                        />

                        <Select className="text-sm font-medium w-1/3 ml-2"
                                placeholder={"Тип параметра"}
                                value={{value: param.type, label: options.find(option => option.value === param.type)?.label || null }}
                                onChange={(e) => updateParameter(param.key, 'type', e)}
                                styles={CustomStyle}
                                options={options}
                                isClearable={false} isSearchable={false}/>

                    </div>
                ))}
                <div className="flex flex-row justify-end mt-4">
                    <div className="flex flex-row w-full justify-between items-center bg-white my-2 ">
                        <div>
                            {!isValid &&
                                <span className="text-sm font-medium text-red-600">Некорректный SQL!</span>
                            }
                        </div>
                        <button
                            onClick={onClose}
                            className="min-w-[50px] px-2 mx-2 h-7 rounded text-xs font-medium shadow-sm border border-slate-400 hover:bg-gray-200">
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
import {styleInput, styleLabelInput} from "../../data/styles";
import Select from "react-select";
import {CustomStyle} from "../../data/styleForSelect";
import React from "react";

export function ModalSQL({ value, isValid, onChange, onClose }) {


    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0"
                onClick={onClose}
            />
            <div
                className="w-full max-w-[700px] lg:w-[700px] p-5 z-30 rounded bg-white absolute top-1/3 left-1/2 -translate-x-1/2 px-8"
            >
                <h1 className="text-2xl font-medium text-start mb-5">Запрос SQL для данных отчета</h1>
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-2">Можно вводить несколько SQL запросов, отделенных точкой с запятой. Далее запрашиваемые данные могут быть использованы в отчете.</span>
                    <div className="flex flex-col ">
                        <span className={styleLabelInput}>SQL</span>
                        <textarea
                            className={styleInput + " min-h-[200px]"}
                            value={value}
                            onChange={onChange}
                        />
                    </div>
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

            </div>
        </>
    )
}
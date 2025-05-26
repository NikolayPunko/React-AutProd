import {styleInput, styleLabelInput} from "../../data/styles";
import React from "react";

export function ModalSettingDB({ onChangeField, onClose, url, username, password, driverClassName}) {

    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-30 right-0 left-0 bottom-0"
                onClick={onClose}
            />
            <div
                className="w-full max-w-[500px] lg:w-[500px] p-5 z-30 rounded bg-white absolute top-1/3 left-1/2 -translate-x-1/2 px-8"
            >
                <h1 className="text-2xl font-medium text-start mb-6">Настройка источника данных</h1>
                <div className="flex flex-col">
                    <div className="flex flex-row items-center pb-4">
                        <span className={styleLabelInput + "w-20 mr-2"}>URL</span>
                        <input
                            className={styleInput + "w-80"}
                            value={url}
                            onChange={(e) => onChangeField('url', e.target.value)}
                        />
                    </div>
                    <div className="flex flex-row items-center pb-4">
                        <span className={styleLabelInput + "w-20 mr-2"}>Username</span>
                        <input
                            className={styleInput + "w-80"}
                            value={username}
                            onChange={(e) => onChangeField('username', e.target.value)}
                        />
                    </div>
                    <div className="flex flex-row items-center pb-4">
                        <span className={styleLabelInput + "w-20 mr-2"}>Password</span>
                        <input
                            className={styleInput + "w-80"}
                            type="password"
                            value={password}
                            onChange={(e) => onChangeField('password', e.target.value)}
                        />
                    </div>
                    <div className="flex flex-row items-center">
                        <span className={styleLabelInput + "w-20 mr-2"}>DriverClass</span>
                        <input
                            className={styleInput + "w-80"}
                            value={driverClassName}
                            onChange={(e) => onChangeField('driverClassName', e.target.value)}
                        />
                    </div>

                    <div className="flex flex-row justify-end mt-4">
                        <div className="flex flex-row justify-end items-center bg-white my-2">
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
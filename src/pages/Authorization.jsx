import React, {useContext, useEffect, useState} from 'react'

import {Context} from "../index";
import {observer} from "mobx-react-lite";
import {useLocation, useNavigate} from "react-router-dom";

function Authorization() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {store} = useContext(Context);

    const navigate = useNavigate();
    const location = useLocation()
    const from = '/'

    const [defaultInput, setDefaultInput] = useState(true);
    const [hidePassword, setHidePassword] = useState(true);


    const btnClass1 = ['px-2 w-1/2 rounded-l text-sm font-medium', defaultInput ? 'bg-blue-700 text-white' : 'hover:bg-gray-100'];
    const btnClass2 = ['px-2 w-1/2 rounded-r text-sm font-medium', defaultInput ? 'hover:bg-gray-100' : 'bg-blue-700 text-white'];

    const textMsg = defaultInput ? "Авторизация пользователя с использованием логина и пароля." : "Для авторизации необходимо привязать Вашу ЭЦП в настройках профиля (Настройки > Мой профиль) личного кабинета.";

    function login() {
        store.login(username, password).then(() => {
            if (store.isAuth) {
                navigate(from, {replace: true});
            }

        });

    }

    useEffect(() => {
        store.logout();
    }, [])


    return (
        <div
            className="w-[375px] lg:w-[640px] h-[480px] px-5 lg:px-36 absolute top-28 left-1/2 -translate-x-1/2 shadow-2xl border-2 rounded-2xl">
            <div className="h-[150px] py-14 text-center">
               <span className="text-3xl font-bold">
                   Автоматизация производства
               </span>
            </div>

            <div className="">


                <div className="py-1 text-sm text-gray-500">
                    {textMsg}
                </div>

                {defaultInput &&
                    <>
                        <div className="flex flex-col py-1">
                            <span className="text-sm">Логин</span>
                            <input
                                className="border rounded border-slate-400 px-2 text-sm h-[28px] outline-blue-700 focus-visible:outline-1  hover:border-blue-700"
                                placeholder="Введите логин"
                                onChange={event => setUsername(event.target.value)}
                                value={username}
                            />
                        </div>

                        <div className="flex flex-col py-1">
                            <span className="text-sm">Пароль</span>
                            <div className="flex flex-row">
                                <input
                                    className="w-full border rounded border-slate-400 px-2 text-sm h-[28px] outline-blue-700 focus-visible:outline-1  hover:border-blue-700 "
                                    placeholder="Введите пароль"
                                    type={hidePassword ? "password" : ""}
                                    onChange={event => setPassword(event.target.value)}
                                    value={password}
                                />
                                <div className="absolute ml-[300px] lg:ml-80 mt-1">
                                    {hidePassword &&
                                        <svg onClick={() => setHidePassword(false)} className="h-5 w-5 text-black"
                                             fill="none" viewBox="0 0 24 24"
                                             stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        </svg>
                                    }

                                    {!hidePassword &&
                                        <svg onClick={() => setHidePassword(true)} className="h-5 w-5 text-black"
                                             fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                                        </svg>}
                                </div>
                            </div>
                        </div>
                    </>
                }


                <div className="flex flex-col pt-8 items-center">

                    <button
                        className="w-[140px] h-[40px] bg-blue-800 text-white rounded shadow-inner hover:bg-blue-700"
                        onClick={login}>
                        Войти
                    </button>

                    <button className="mt-4 p-1 rounded text-blue-800  hover:bg-blue-50"
                            onClick={() => {
                                navigate(from, {replace: true})
                            }}>
                        Авторизоваться как гость
                    </button>


                </div>

            </div>
        </div>
    )
}

export default observer(Authorization);
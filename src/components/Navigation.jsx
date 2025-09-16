import React, {useContext, useEffect, useRef, useState} from 'react'
import {Link, useNavigate} from "react-router-dom";
import {arrowDown, arrowUp} from "../data/icons";
import {Context} from "../index";
import RoleGuard from "./RoleGuard";



export function Navigation(props) {
    const {store} = useContext(Context);
    const navigate = useNavigate();

    const [dropdownSettings, setDropdownSettings] = useState(false);


    const container = useRef();

    const handleClickOutside = (e) => {
        if (container.current && !container.current.contains(e.target)) {
            setDropdownSettings(false);
        }
    };

    const handleClickMenu = (e) => {
        props.setOpenMenu(!props.isOpenMenu)
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (

        <nav className=" lg:h-[50px] w-full flex justify-between  item-center border-b-2">
            <div className="flex flex-col w-9/12 lg:w-full lg:flex-row lg:justify-between bg-gray-50 items-center">

                <div className="flex flex-row justify-center h-10 w-[202px] text-center items-center  lg:text-center ">

                    <div className="">
                        <img src="/newpng.png" className="w-28" alt="Logo"/>
                    </div>


                </div>
                <div className="flex h-full flex-row  font-medium w-full px-3 text-white items-center bg-blue-800">
                    <span className="font-medium  text-white px-3 w-full">Автоматизация производства</span>

                </div>
            </div>

            <div className="flex h-10 w-3/12 lg:h-auto lg:w-auto justify-end items-center bg-blue-800">
                <div className="flex h-10  lg:h-auto lg:w-auto justify-end items-center bg-gray-50 rounded mr-4 ">
                    <div className="flex flex-row lg:px-3 ">
                        {store.isAuth &&
                            <>


                                <i className="fa-solid fa-user-tie px-2 pt-[5px]" ></i>
                                <div className="flex flex-col">



                                    <span className="font-medium text-center ">{store.user.username}</span>

                                    {/*/!* Только для админов *!/*/}
                                    {/*<RoleGuard requiredRoles={['ROLE_ADMIN']}>*/}
                                    {/*    <span className="text-xs bg-red-600">Admin</span>*/}
                                    {/*</RoleGuard>*/}
                                </div>

                            </>

                        }
                        {!store.isAuth &&
                            <>
                                <i className="fa-solid fa-user px-2 pt-[5px]"></i>
                                <span className="font-medium text-center ">Гость</span>
                            </>

                        }
                    </div>

                    <div>
                        {store.isAuth &&
                            <button className="pr-2 pt-1" onClick={() => {
                                store.logout();
                                navigate("/login");
                            }}>
                                {/*fill="#ffffff"*/}
                                <svg width="25px" height="25px" viewBox="0 0 24 24" >
                                    <g strokeWidth="0"></g>
                                    <g strokeLinecap="round" strokeLinejoin="round"></g>
                                    <g>
                                        <g>
                                            <path fill="none" d="M0 0h24v24H0z"></path>
                                            <path
                                                d="M5 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3h-2V4H6v16h12v-2h2v3a1 1 0 0 1-1 1H5zm13-6v-3h-7v-2h7V8l5 4-5 4z"></path>
                                        </g>
                                    </g>
                                </svg>
                            </button>
                        }
                        {!store.isAuth &&
                            <button className="pr-2 pt-1" onClick={() => navigate("/login")}>
                                <svg width="25px" height="25px" viewBox="0 0 24 24" >
                                    <g strokeWidth="0"></g>
                                    <g strokeLinecap="round" strokeLinejoin="round"></g>
                                    <g>
                                        <g>
                                            <path fill="none" d="M0 0h24v24H0z"></path>
                                            <path
                                                d="M5 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3h-2V4H6v16h12v-2h2v3a1 1 0 0 1-1 1H5zm13-6v-3h-7v-2h7V8l5 4-5 4z"></path>
                                        </g>
                                    </g>
                                </svg>
                            </button>
                        }
                    </div>

                </div>

            </div>

        </nav>
    )
}
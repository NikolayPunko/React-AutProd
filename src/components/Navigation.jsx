import React, {useContext, useEffect, useRef, useState} from 'react'
import {Link, useNavigate} from "react-router-dom";
import {arrowDown, arrowUp} from "../data/icons";
import {Context} from "../index";



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
        console.log(store.isAuth)
        return () => document.removeEventListener("mousedown",  handleClickOutside);
    }, []);

    return (

        <nav className=" lg:h-[50px] w-full flex justify-between bg-sky-700	 item-center ">
            <div className="flex flex-col w-9/12 lg:w-full lg:flex-row lg:justify-between items-center">

                <div className="flex h-10 w-full text-center items-center lg:w-[225px] lg:text-center ">
                    {!props.isOpenMenu && !props.isHiddenMenu &&
                        <button className="w-auto lg:hidden pl-3 pt-1" onClick={handleClickMenu}>
                            <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M4 5C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H4ZM3 12C3 11.4477 3.44772 11 4 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H4C3.44772 13 3 12.5523 3 12ZM3 18C3 17.4477 3.44772 17 4 17H20C20.5523 17 21 17.4477 21 18C21 18.5523 20.5523 19 20 19H4C3.44772 19 3 18.5523 3 18Z" fill="#ffffff"></path> </g></svg>
                        </button>
                    }

                    {props.isOpenMenu && !props.isHiddenMenu &&
                        <button className="w-auto lg:hidden pl-3 pt-1" onClick={handleClickMenu}>
                            <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" transform="rotate(90)"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M4 5C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H4ZM3 12C3 11.4477 3.44772 11 4 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H4C3.44772 13 3 12.5523 3 12ZM3 18C3 17.4477 3.44772 17 4 17H20C20.5523 17 21 17.4477 21 18C21 18.5523 20.5523 19 20 19H4C3.44772 19 3 18.5523 3 18Z" fill="#ffffff"></path> </g></svg>
                        </button>
                    }
                        <span className="font-medium text-white px-3 w-full ">Автоматизация производства</span>
                </div>
                <div className="flex h-10 lg:flex-row text-sm font-medium w-full px-3 space-x-4 text-white items-center">






                </div>
            </div>

            <div className="flex h-10 w-3/12 lg:h-auto lg:w-auto justify-end items-center">
                <div className="flex h-10 w-3/12 lg:h-auto lg:w-auto justify-end items-center">
                    <div className="flex flex-col p-1 lg:p-4 text-white">
                        {store.isAuth &&
                            <span className="text-lg text-center">{store.user.username}</span>
                        }
                        {!store.isAuth &&
                            <span className="text-lg text-center">Гость</span>
                        }
                    </div>

                    <div>
                        {store.isAuth &&
                            <button className="pr-2 text-white pt-2" onClick={()=>store.logout()}>
                                <svg width="25px" height="25px" viewBox="0 0 24 24" fill="#ffffff"><g strokeWidth="0"></g><g strokeLinecap="round" strokeLinejoin="round"></g><g> <g> <path fill="none" d="M0 0h24v24H0z"></path> <path d="M5 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3h-2V4H6v16h12v-2h2v3a1 1 0 0 1-1 1H5zm13-6v-3h-7v-2h7V8l5 4-5 4z"></path> </g> </g></svg>
                            </button>
                        }
                        {!store.isAuth &&
                            <button className="pr-2 text-white pt-2" onClick={()=>navigate("/login")}>
                                <svg width="25px" height="25px" viewBox="0 0 24 24" fill="#ffffff"><g strokeWidth="0"></g><g strokeLinecap="round" strokeLinejoin="round"></g><g> <g> <path fill="none" d="M0 0h24v24H0z"></path> <path d="M5 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3h-2V4H6v16h12v-2h2v3a1 1 0 0 1-1 1H5zm13-6v-3h-7v-2h7V8l5 4-5 4z"></path> </g> </g></svg>
                            </button>
                        }
                    </div>

                </div>

            </div>

        </nav>
    )
}
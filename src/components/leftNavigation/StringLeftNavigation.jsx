import React from 'react'
import {useNavigate} from "react-router-dom";


export function StringLeftNavigation(props){

    const navigate = useNavigate();

    return (
        <div className="flex flex-row items-center px-4 py-2 hover:bg-sky-700 hover:text-white" onClick={() => navigate(props.navigationPath)}>
            <span className="w-[25px]">
                 <svg className="h-6 w-6 text-gray-800" fill="white"  viewBox="0 0 24 24" stroke="currentColor">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
            </svg>
            </span>

            <span className="pl-3 w-auto text-sm font-medium flex-wrap">{props.title}</span>
        </div>
    )
}
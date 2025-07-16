import React from 'react'


export function ModalInfoItem({info, onClose}) {
    return (
        <>
            <div
                className="fixed bg-black/50 top-0 z-100 right-0 left-0 bottom-0" style={{zIndex: 99}}
                onClick={onClose}
            />
            <div class="fixed inset-0 flex items-center justify-center p-4 z-100 pointer-events-none"
                 style={{zIndex: 100}}>
                <div className="w-full max-w-[500px] bg-white rounded-lg p-5 px-8 pointer-events-auto">
                    <h1 className="text-xl font-medium text-start mb-2">{info.name}</h1>
                    <hr/>
                    <div className="flex flex-row">

                        <div className="flex flex-col w-1/3">
                            <span className="my-1 font-medium">Линия:</span>
                            <span className="my-1 font-medium">Начало:</span>
                            <span className="my-1 font-medium">Конец:</span>
                            {info.quantity &&
                                <span className="my-1 font-medium">Количество:</span>
                            }

                        </div>
                        <div className="flex flex-col w-2/3">
                            <span className="my-1">{info.line || ""}</span>
                            <span className="my-1">{info.start || ""}</span>
                            <span className="my-1">{info.end || ""}</span>
                            <span className="my-1">{info.quantity || ""}</span>
                        </div>


                    </div>
                    {/*<div className="flex flex-row justify-end">*/}
                    {/*    <button onClick={onClose}*/}
                    {/*            className="w-14 px-2 h-7 self-end  my-2 rounded text-sm font-medium shadow-sm border  bg-blue-800 hover:bg-blue-700 text-white">*/}
                    {/*        ОК*/}
                    {/*    </button>*/}
                    {/*</div>*/}

                </div>
            </div>
        </>
    )
}
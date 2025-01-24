import {observer} from "mobx-react-lite";


function NotFound() {
    return (
        <>
            <div className="bg-gray-100 flex flex-col h-screen justify-center items-center">
                <span className="text-9xl font-bold ">
                    404
                </span>
                <span className="text-xl font-bold mb-36">
                    Ресурс не найден!
                </span>
            </div>
        </>
    )
}

export default observer(NotFound)
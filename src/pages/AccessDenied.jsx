import {observer} from "mobx-react-lite";


function AccessDenied() {
    return (
        <>
            <div className="bg-gray-50 flex flex-col h-screen justify-center items-center">
                <span className="text-9xl font-bold ">
                    403
                </span>
                <span className="text-xl font-bold mb-36">
                    Доступ к ресурсу запрещен!
                </span>
            </div>
        </>
    )
}

export default observer(AccessDenied)
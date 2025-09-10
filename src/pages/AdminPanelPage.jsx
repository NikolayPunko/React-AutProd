import {observer} from "mobx-react-lite";
import {Navigation} from "../components/Navigation";
import {LeftNavigation} from "../components/leftNavigation/LeftNavigation";
import Loading from "../components/loading/Loading";
import React, {useEffect, useState} from "react";
import UserService from "../services/UserService";
import {ModalNotify} from "../components/modal/ModalNotify";

function AdminPanelPage() {

    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    const [isModalNotify, setIsModalNotify] = useState(false);

    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([])


    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [])


    async function fetchUsers() {
        try {
            setIsLoading(true);
            const response = await UserService.getAllUsers();
            setUsers(response.data);
        } catch (e) {
            setMsg(e.response.data.message);
            setIsModalNotify(true);
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchRoles() {
        try {
            setIsLoading(true);
            const response = await UserService.getAvailableRoles();
            setAvailableRoles(response.data.map(role => role.name));
        } catch (e) {
            setMsg(e.response.data.message);
            setIsModalNotify(true);
        } finally {
            setIsLoading(false);
        }
    }

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setSelectedRoles(user.roles.map(role => role.name));
    };

    const handleRoleToggle = (role) => {
        setSelectedRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    const handleSaveRoles = async () => {
        if (!selectedUser) return;

        try {
            setIsLoading(true);
            const response = await UserService.updateUserRoles(selectedUser.id, selectedRoles);
            setUsers(prevUsers => prevUsers.map(user =>
                user.id === response.data.id ? response.data : user
            ));
            setMsg("Роли пользователя " + selectedUser.username + " успешно обновлены");
            setSelectedUser(null);
            setSelectedRoles([]);
        } catch (e) {
            setMsg(e.response.data.message);
        } finally {
            setIsLoading(false);
            setIsModalNotify(true);
        }
    };

    function handleCloseEdit() {
        setSelectedUser(null);
        setSelectedRoles([]);
    }

    function getBgColor(role) {
        if (role === "ROLE_ADMIN") {
            return "bg-green-600"
        } else if(role === "ROLE_EDITOR"){
            return "bg-yellow-500"
        } else {
            return "bg-red-600"
        }
    }


    return (<>

        <Navigation isHiddenMenu={false} isOpenMenu={false} setOpenMenu={() => {
        }}/>
        <div className="flex flex-row window-height">
            <div className="w-[200px] py-2 border-r-2 bg-gray-50 justify-stretch">
                <LeftNavigation/>
            </div>
            <div className="flex flex-col w-full">

                {isLoading && <Loading/>}

                {!isLoading && <>

                    <div className=" px-28">
                        <div className=" py-10">
                            <span className="text-2xl font-bold">Панель администратора</span>
                        </div>


                        <div className="flex flex-row justify-between">

                            <div className="border rounded-lg p-5 bg-gray-50 w-3/4 h-[700px]">

                                <div className="text-xl font-bold text-center">Пользователи</div>

                                <div className="flex flex-row border-b mt-4 ">
                                    <div className="w-1/4  border-gray-300 py-1 px-1 font-bold text-center">Логин</div>
                                    <div className="w-1/4  border-gray-300 py-1 px-1 font-bold text-center">Тип
                                        аунтификации
                                    </div>
                                    <div className="w-1/4  border-gray-300 py-1 px-1 font-bold text-center">Роли</div>
                                    <div
                                        className="w-1/4  border-gray-300 py-1 px-1 font-bold text-center">Редактировать
                                    </div>
                                </div>

                                <div className="max-h-[580px] overflow-auto bg-blue-600">
                                    {users.map((user, index) => (
                                        <div key={index} className="flex flex-row bg-white">
                                            <div
                                                className="w-1/4 border-b border-gray-300 py-1 px-1 text-center">{user.username}</div>
                                            <div className="w-1/4 border-b border-gray-300 py-1 px-1 text-center"><span
                                                className=" rounded px-1 ">{user.authType}</span></div>
                                            <div className="w-1/4 border-b border-gray-300 py-1 px-1 text-center">
                                                {user.roles.length > 0 &&
                                                    user.roles.map((role, index) => (
                                                        <span key={index}
                                                              className={getBgColor(role.name) + " rounded px-2 text-sm font-medium text-white mr-1"}>{role.name.substring(5, role.name.length)}</span>
                                                    ))
                                                }

                                                {user.roles?.length === 0 &&
                                                    <span
                                                        className="bg-red-600 rounded px-2 text-sm font-medium text-white">{user.roles.name}</span>
                                                }

                                            </div>
                                            <div className="w-1/4 border-b border-gray-300 py-1 px-1 text-center">
                                                <button className="rounded bg-blue-800 px-2 text-white"
                                                        onClick={() => handleUserSelect(user)}>Выбрать
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </div>

                            <div className="border rounded-lg p-5 bg-gray-50 w-1/4 ml-10 ">

                                {!selectedUser &&
                                    <div className="text-lg font-bold text-center text-gray-500 h-full ">
                                        Пользователь не выбран
                                    </div>
                                }

                                {selectedUser &&
                                    <div>
                                        <div className="text-xl font-bold text-center">Редактор
                                            пользователя {selectedUser.username}</div>

                                        <div className="font-bold mt-4 px-3">Роли</div>

                                        <div className="my-4 px-10">
                                            {availableRoles.map((role, index) => (
                                                <div key={index} className="">
                                                    <input type={"checkbox"} className="w-4 h-4"
                                                           disabled={role === "ROLE_VIEWER"} //USER всегда должен быть
                                                           checked={selectedRoles.includes(role)}
                                                           onChange={() => handleRoleToggle(role)}
                                                    />
                                                    <span key={index}
                                                          className="ml-5">{role.substring(5, role.length)}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-row justify-center">
                                            <button
                                                onClick={handleCloseEdit}
                                                className="min-w-[50px] px-2 mr-2 h-7 rounded text-xs font-medium shadow-sm border border-slate-400 hover:bg-gray-200">
                                                Закрыть
                                            </button>
                                            <button
                                                onClick={handleSaveRoles}
                                                className=" px-2 h-7  rounded text-xs font-medium shadow-sm border  bg-blue-800 hover:bg-blue-700 text-white">
                                                Применить
                                            </button>
                                        </div>
                                    </div>
                                }


                            </div>


                        </div>


                    </div>


                </>}

                {isModalNotify &&
                    <ModalNotify title={"Результат операции"} message={msg} onClose={() => setIsModalNotify(false)}/>}


            </div>

        </div>
    </>)
}

export default observer(AdminPanelPage)
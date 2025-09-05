import {useContext} from "react";
import {Context} from "../index";
import {Navigate, Outlet, useLocation} from "react-router-dom";
import {observer} from "mobx-react-lite";
import AccessDenied from "../pages/AccessDenied";

const PrivateRoute = ({requiredRoles = []}) => {

    const {store} = useContext(Context);
    const location = useLocation()

    // console.log("username: " + store.user.username)
    if(store.user.username === undefined || store.user.username === ""){
        return <AccessDenied/>;
    }

    if (store.isAuthInProgress) {
        return <div>Checking auth...</div>;
    }

    const hasAccess = store.hasAnyRole(requiredRoles)

//Доделать чтобы не видно было вкладок пользователям у которых недостаточно прав
    if (store.isAuth && hasAccess) {
        return <Outlet/>
    } else {
        return <AccessDenied/>;
    }
};

export default observer(PrivateRoute);
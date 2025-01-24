import {useContext} from "react";
import {Context} from "../index";
import {Navigate, Outlet, useLocation} from "react-router-dom";
import {observer} from "mobx-react-lite";

const PrivateRoute = (props) => {

    const {store} = useContext(Context);
    const location = useLocation()

    if (store.isAuthInProgress) {
        return <div>Checking auth...</div>;
    }

    if (store.isAuth) {
        return <Outlet/>
    } else {
        return <Navigate to="/login" state={{ from: location }}/>;
    }
};

export default observer(PrivateRoute);
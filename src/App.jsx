import React, {useContext, useEffect, useState} from "react";
import {Route, Routes} from 'react-router-dom';
import ReportDesignerPage from "./pages/ReportDesignerPage";
import Authorization from "./pages/Authorization";
import {Context} from "./index";
import PrivateRoute from "./components/PrivateRoute";
import NotFound from "./pages/NotFound";
import ReportsPage from "./pages/ReportsPage";
import ViewReportPage from "./pages/ViewReportPage";
import SchedulePage from "./pages/SchedulePage";



function App() {

    const {store} = useContext(Context);

    const [isCheckAuth, setIsCheckAuth] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem('tokenAutomationProduction')) {
            store.checkAuth().then(() => setIsCheckAuth(true));
        } else {
            setIsCheckAuth(true)
        }
    }, [])


    if (isCheckAuth) {
        return (
            <>
                <Routes>

                    <Route path="/" element={<ReportsPage/>}/>
                    <Route path="/scheduler" element={<SchedulePage/>}/>
                    <Route path="/designer" element={<ReportDesignerPage/>}/>
                    <Route path="/view" element={<ViewReportPage/>}/>
                    <Route path="/" element={<PrivateRoute  />}>

                    </Route>



                    <Route path="/login" element={<Authorization/>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>

            </>
        );
    }
}

export default App;

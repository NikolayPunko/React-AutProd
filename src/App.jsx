import React from "react";
import TaskSchedulerPage from "./pages/TaskSchedulerPage";
import {Route, Routes} from 'react-router-dom';
import ReportsPage from "./pages/ReportsPage";


function App() {



    return (
        <>
            <Routes>

                <Route path="/" element={<ReportsPage/>}/>
                <Route path="/scheduler" element={<TaskSchedulerPage/>}/>


                {/*<Route path="/login" element={<Authorization/>}/>*/}
                {/*<Route path="*" element={<NotFound/>}/>*/}
            </Routes>

        </>
    );
}

export default App;

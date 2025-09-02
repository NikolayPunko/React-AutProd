import {Navigation} from "../components/Navigation";
import {LeftNavigation} from "../components/leftNavigation/LeftNavigation";
import ReportEditor from "../components/reportsConstruct/ReportEditor";
import GrapesEditor from "../components/GrapesEditor";




function ReportDesignerPage() {



    return (
        <>
            <Navigation isHiddenMenu={false} isOpenMenu={false} setOpenMenu={() => {
            }}/>
            {/*<div className="flex flex-row window-height">*/}
            <div className="flex flex-row h-dvw">
                <div className="w-[200px] py-2 border-r-2 bg-gray-50 justify-stretch">
                    <LeftNavigation/>
                </div>
                <div className="flex flex-col w-full">
                    <ReportEditor previewMode={false}/>
                </div>

            </div>
        </>
    )
}



export default ReportDesignerPage;
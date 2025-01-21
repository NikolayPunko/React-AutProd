import {Navigation} from "../components/Navigation";
import {LeftNavigation} from "../components/leftNavigation/LeftNavigation";







function ReportsPage() {



    return (
        <>


            <Navigation isHiddenMenu={false} isOpenMenu={false} setOpenMenu={() => {}}/>
            <div className="flex flex-row window-height">
                <div className="w-[200px] py-2 border-r-2 bg-gray-50 justify-stretch">
                    <LeftNavigation/>
                </div>
                <div className="flex flex-col w-full">
                    {/*<div className="flex flex-row items-center w-full py-3 border-b-2 bg-gray-50">*/}
                    {/*    <div className="inline-flex w-1/2">*/}
                    {/*        <span className="font-bold px-5 text-xl">Заказы</span>*/}

                    {/*    </div>*/}

                    {/*</div>*/}




                </div>

            </div>
        </>
    )
}

export default ReportsPage;
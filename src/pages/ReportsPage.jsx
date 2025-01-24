import {Navigation} from "../components/Navigation";
import {LeftNavigation} from "../components/leftNavigation/LeftNavigation";
import ReportEditor from "../components/reportsConstruct/ReportEditor";
import {GrapesjsReact} from "grapesjs-react";

import 'grapesjs/dist/css/grapes.min.css';
import gjspresetwebpage from 'grapesjs-preset-webpage';
import gjsblockbasic from 'grapesjs-blocks-basic'
import grapesjs from "grapesjs";
import GrapesEditor from "../components/GrapesEditor";


const jsonData = {
    title: "Отчет за месяц",
    date: "2023-10-01",
    totalSales: "10000",
    totalExpenses: "5000",
};


function ReportsPage() {

     function insertJsonData (jsonData) {
        const editor = grapesjs.getEditor();
        const components = editor.getComponents();
        components.forEach(component => {
            if (component.get('type') === 'text') {
                const content = component.get('content');
                const updatedContent = content.replace(/{{(.*?)}}/g, (match, key) => jsonData[key.trim()] || '');
                component.set('content', updatedContent);
            }
        });
    };
    return (
        <>


            <Navigation isHiddenMenu={false} isOpenMenu={false} setOpenMenu={() => {
            }}/>
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

                    <h1>Report Editor</h1>
                    {/*<GrapesjsReact*/}
                    {/*    id='grapesjs-react'*/}
                    {/*    plugins={[*/}
                    {/*        gjspresetwebpage,*/}
                    {/*        gjsblockbasic*/}
                    {/*    ]}*/}
                    {/*    storageManager={false}*/}
                    {/*    panels={null}*/}
                    {/*   */}
                    {/*/>;*/}


                    <div>
                        <h1>Конструктор отчетов</h1>
                        <GrapesEditor />

                        <button onClick={() => {
                            // const jsonData = JSON.parse(document.getElementById('json-input').value);
                            insertJsonData(jsonData);
                        }}>
                            Вставить данные
                        </button>
                    </div>




                </div>

            </div>
        </>
    )
}



export default ReportsPage;
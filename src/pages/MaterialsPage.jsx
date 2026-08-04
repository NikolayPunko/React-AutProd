import {Navigation} from "../components/Navigation";
import {LeftNavigation} from "../components/leftNavigation/LeftNavigation";
import React, {useState} from "react";
import Loading from "../components/loading/Loading";
import {ModalNotifyError} from "../components/modal/ModalNotifyError";
import {observer} from 'mobx-react-lite';
import MaterialService from "../services/MaterialService";
import {ModalNotify} from "../components/modal/ModalNotify";
import {CustomStyleMaterialSelect} from "../data/styleForSelect";
import AsyncSelect from "react-select/async";
import {BlueButton} from "../components/reportsConstruct/buttons/BlueButton";

function MaterialsPage() {


    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState("");
    const [isModalError, setIsModalError] = useState(false);
    const [isModalNotify, setIsModalNotify] = useState(false);

    const [date, setDate] = useState(() => {
        const today = new Date("2026-02-15");
        return today.toISOString().split('T')[0];
    });
    const [kpp, setKpp] = useState('');

    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [viewMode, setViewMode] = useState('products'); // 'products' | 'summary'

    const [updatingKolf, setUpdatingKolf] = useState(null);

    const [selectedKpp, setSelectedKpp] = useState(null);


    const fetchRecipients = async (inputValue, callback) => {
        if (inputValue.length < 2) {
            callback([]);
            return;
        }

        try {
            const response = await MaterialService.searchRecipients(inputValue);
            const options = response.data.map(item => ({
                value: item.kpp,
                label: item.snm || item.kpp
            }));
            callback(options);
        } catch (e) {
            callback([]);
            setIsModalError(true);
            setError(e.response?.data?.message || 'Ошибка загрузки получателей');
        }
    };

    async function loadData() {
        if (!date || !kpp) {
            setIsModalError(true);
            setError('Выберите дату и материально ответственное лицо');
            return;
        }

        try {
            setIsLoading(true);
            const response = await MaterialService.loadProducts(date, kpp);
            // Группируем материалы внутри каждого продукта
            const groupedData = (response.data || []).map(product => {
                const groupedMaterials = {};

                product.materials?.forEach(material => {
                    if (!groupedMaterials[material.kmt]) {
                        // Первое вхождение - сохраняем все поля
                        groupedMaterials[material.kmt] = {
                            ...material,
                            norm: 0,
                            normf: 0
                        };
                    }
                    // Суммируем нормы
                    groupedMaterials[material.kmt].norm += material.norm || 0;
                    groupedMaterials[material.kmt].normf += material.normf || 0;
                });

                return {
                    ...product,
                    materials: Object.values(groupedMaterials)
                };
            });

            setProducts(groupedData);
            setSelectedProduct(null);
        } catch (e) {
            setIsModalError(true);
            setError(e.response?.data?.message || 'Ошибка загрузки данных');
        } finally {
            setIsLoading(false);
        }
    }

    // Функция выбора продукта
    function handleProductSelect(product) {
        if (selectedProduct && selectedProduct.kmc === product.kmc) {
            setSelectedProduct(null);
        } else {
            setSelectedProduct(product);
        }
    }

    async function handleKolfChange(kmt, value) {
        setUpdatingKolf(kmt);

        try {
            const request = {
                date,
                kpp,
                kmt,
                kolf: value,
                data: products
            };

            const response = await MaterialService.recalcKolf(request);
            setProducts(response.data);

            // Обновляем selectedProduct, если он есть
            if (selectedProduct) {
                const updated = response.data.find(p => p.kmc === selectedProduct.kmc);
                if (updated) {
                    setSelectedProduct(updated);
                }
            }
        } catch (e) {
            setIsModalError(true);
            setError(e.response?.data?.message || 'Ошибка пересчета KOLF');
        } finally {
            setUpdatingKolf(null);
        }
    }

    async function handleSave() {

        const request = {
            date,
            kpp,
            data: products
        };

        try {
            setIsLoading(true);
            await MaterialService.saveAll(request);
            setIsModalNotify(true);
            setMsg('Данные успешно сохранены!');
        } catch (e) {
            setIsModalError(true);
            setError(e.response?.data?.message || 'Ошибка сохранения');
        } finally {
            setIsLoading(false);
        }
    }

    function getMaterialSummary() {
        if (!products.length) return [];

        const grouped = {};

        products.forEach(product => {
            product.materials?.forEach(material => {
                if (!grouped[material.kmt]) {
                    grouped[material.kmt] = {
                        kmt: material.kmt,
                        snmMt: material.snmMt || material.kmt,
                        eduMt: material.eduMt || material.kmt,
                        totalNormf: material.totalNormf || 0,
                        kolf: material.kolf || 0,
                        insurancePerc: material.insurancePerc || 0,
                        roundStep: material.roundStep || 1,
                        productCount: 0,
                        products: [],
                        trnd: material.trnd || 0,
                        order: material.order || 0
                    };
                }

                const item = grouped[material.kmt];
                item.productCount += 1;
                if (!item.products.includes(product.kmc)) {
                    item.products.push(product.kmc);
                }
                item.totalNormf = material.totalNormf || item.totalNormf;
                item.kolf = material.kolf || 0;
                item.insurancePerc = material.insurancePerc || 0;
                item.roundStep = material.roundStep || 1;
                item.trnd = material.trnd || 0;
                item.order = material.order || 0;
            });
        });

        return Object.values(grouped);
    }

    const materialSummary = getMaterialSummary();

    const renderKolfInput = (kmt, defaultKolf) => {
        const isUpdating = updatingKolf === kmt;

        return (
            <input
                type="number"
                step="0.01"
                className={`w-24 px-1.5 text-right text-sm font-semibold border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isUpdating ? 'opacity-50 bg-gray-100' : ''
                }`}
                value={defaultKolf || 0}
                onChange={(e) => {
                    const rawValue = e.target.value;
                    if (rawValue.startsWith('-')) return;
                    const newValue = rawValue === '' ? 0 : parseFloat(rawValue) || 0;
                    if (newValue < 0) return;

                    const updatedProducts = products.map(product => ({
                        ...product,
                        materials: product.materials?.map(m =>
                            m.kmt === kmt ? { ...m, kolf: newValue } : m
                        )
                    }));
                    setProducts(updatedProducts);
                    if (selectedProduct) {
                        setSelectedProduct(prev => ({
                            ...prev,
                            materials: prev.materials?.map(m =>
                                m.kmt === kmt ? { ...m, kolf: newValue } : m
                            )
                        }));
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        e.target.blur();
                    }
                }}
                onBlur={() => {
                    const material = products
                        .flatMap(p => p.materials || [])
                        .find(m => m.kmt === kmt);
                    if (material) {
                        handleKolfChange(kmt, material.kolf);
                    }
                }}
                disabled={isUpdating}
            />
        );
    };


    return (<>
        <Navigation isHiddenMenu={false} isOpenMenu={false} setOpenMenu={() => {}}/>
        <div className="flex flex-row window-height">
            <div className="w-[200px] py-2 border-r-2 bg-gray-50 justify-stretch">
                <LeftNavigation/>
            </div>
            <div className="flex flex-col w-full">

                {isLoading && <Loading/>}

                {!isLoading && <>
                    <div className="px-16 py-6">
                        <span className="text-2xl font-bold">Списание материалов в планировщике</span>
                    </div>

                    {/* Фильтры */}
                    <div className="px-24 py-2">
                        <div className="flex flex-row gap-5 items-center">
                            <div className="inline-flex items-center h-[30px] border border-gray-200 rounded-md">
                                <span
                                    className="px-3 text-[0.950rem] font-medium text-gray-600 border-r border-gray-200">
                                    Дата:
                                </span>
                                <input
                                    className="px-2 text-[0.950rem] w-36 font-medium text-gray-700 cursor-pointer focus:outline-none bg-transparent"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>

                            <div className="inline-flex items-center h-[30px] border border-gray-200 rounded-md">
                                <span
                                    className="px-3 text-[0.950rem] font-medium text-gray-600 border-r border-gray-200">
                                    МОЛ:
                                </span>
                                <AsyncSelect
                                    className="w-72"
                                    placeholder="Введите для поиска..."
                                    value={selectedKpp}
                                    onChange={(newValue) => {
                                        setSelectedKpp(newValue);
                                        setKpp(newValue ? newValue.value : '');
                                    }}
                                    loadOptions={fetchRecipients}
                                    styles={CustomStyleMaterialSelect}
                                    isSearchable={true}
                                    noOptionsMessage={() => "Ничего не найдено"}
                                    loadingMessage={() => "Загрузка..."}
                                    cacheOptions={true}
                                    defaultOptions={false}
                                />
                            </div>

                            <BlueButton onClick={loadData} text={"Загрузить"} icon={"fa-solid fa-download text-sm pt-0.5"}/>

                            <BlueButton onClick={handleSave} text={"Сохранить"}
                                        className={"bg-cyan-600 hover:bg-cyan-700"} icon={"fa-solid fa-floppy-disk text-sm pt-0.5"}/>

                        </div>
                    </div>

                    {/* Кнопки переключения режимов */}
                    <div className="px-24 py-2 flex gap-2">
                        <button
                            className={`px-4 py-1 text-sm font-medium rounded-md transition ${
                                viewMode === 'products'
                                    ? 'bg-blue-800 text-white hover:bg-blue-700'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => setViewMode('products')}
                        >
                            По продуктам
                        </button>
                        <button
                            className={`px-4 py-1 text-sm font-medium rounded-md transition ${
                                viewMode === 'summary'
                                    ? 'bg-blue-800 text-white hover:bg-blue-700'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => setViewMode('summary')}
                        >
                            По используемым материалам
                        </button>
                    </div>

                    <div className="px-24 py-2 flex flex-col gap-4 h-[calc(100vh-240px)]">

                        {viewMode === 'products' && (
                            <>
                                {/* ТАБЛИЦА ПРОДУКТОВ */}
                                <div className="flex flex-col flex-1 min-h-0">
                                    <div className="mb-1">
                                        <span className="text-sm font-semibold text-gray-700">Продукты</span>
                                        {products.length > 0 && (
                                            <span className="ml-2 text-xs text-gray-500">({products.length})</span>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-auto border border-gray-200 rounded-md">
                                        <table className="w-full border-collapse text-center">
                                            <thead className="sticky top-0">
                                            <tr className="bg-gray-100">
                                                <th className="px-4 py-1.5 text-sm font-semibold text-gray-700 border-b border-gray-200">Код</th>
                                                <th className="px-4 py-1.5 text-sm font-semibold text-gray-700 border-b border-gray-200">Товар</th>
                                                <th className="px-4 py-1.5 text-sm font-semibold text-gray-700 border-b border-gray-200">Масса,
                                                    кг
                                                </th>
                                                <th className="px-4 py-1.5 text-sm font-semibold text-gray-700 border-b border-gray-200">Единиц</th>
                                                <th className="px-4 py-1.5 text-sm font-semibold text-gray-700 border-b border-gray-200">EAN13</th>
                                                <th className="px-4 py-1.5 text-sm font-semibold text-gray-700 border-b border-gray-200">KT</th>
                                                <th className="px-4 py-1.5 text-sm font-semibold text-gray-700 border-b border-gray-200">EMK</th>
                                                <th className="px-4 py-1.5 text-sm font-semibold text-gray-700 border-b border-gray-200">Материалов</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {products.length === 0 ? (
                                                <tr>
                                                <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
                                                        Нет данных. Выберите дату и цех, нажмите "Загрузить".
                                                    </td>
                                                </tr>
                                            ) : (
                                                products.map((product) => (
                                                    <tr
                                                        key={product.kmc}
                                                        className={`border-b border-gray-200 text-sm cursor-pointer ${
                                                            selectedProduct?.kmc === product.kmc ? 'bg-blue-800 text-white' : ' text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                        onClick={() => handleProductSelect(product)}
                                                    >
                                                        <td className="px-4 py-2">
                                                            {product.kmc}
                                                        </td>
                                                        <td className="px-4 py-2 truncate max-w-[200px] text-left"
                                                            title={product.name?.trim()}>
                                                            {product.krkmc + " " + product.name?.trim()}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {product.sumMass?.toFixed(0)}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {product.sumKolev?.toFixed(0)}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {product.ean13}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {product.kt || '—'}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {product.emk !== undefined && product.emk !== null ? product.emk.toFixed(1) : '—'}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {product.materials?.length || 0}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* ТАБЛИЦА МАТЕРИАЛОВ ВЫБРАННОГО ПРОДУКТА */}
                                <div className="flex flex-col min-h-[273px] max-h-[308px]">
                                    <div className="mb-1 flex items-center justify-between">
                                        <div>
                                            <span className="text-sm font-semibold text-gray-700">Материалы</span>
                                            {selectedProduct && (
                                                <span
                                                    className="ml-2 text-xs text-gray-500">{selectedProduct.name?.trim()}</span>
                                            )}
                                            {selectedProduct?.materials?.length > 0 && (
                                                <span
                                                    className="ml-1 text-xs text-gray-500">({selectedProduct.materials.length})</span>
                                            )}
                                        </div>
                                        {/* ПОДСКАЗКА */}
                                        <div className="text-xs text-gray-500 flex items-center gap-2">
                                            <span className="flex items-center gap-1">
                                                <span className="text-yellow-400 text-sm"><i className="fa-solid fa-triangle-exclamation"></i></span>
                                                <span>— материал используется в нескольких продуктах</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-auto border border-gray-200 rounded-md">
                                        <table className="w-full border-collapse">
                                            <thead className="sticky top-0">
                                            <tr className="bg-gray-100 text-center text-sm">
                                                <th className="px-3 py-1.5 font-semibold text-gray-700 border-b border-gray-200">Код</th>
                                                <th className="px-3 w-[20%] py-1.5 font-semibold text-gray-700 border-b border-gray-200">Материал</th>
                                                <th className="px-3 py-1.5 font-semibold text-gray-700 border-b border-gray-200">Ед.
                                                    изм.
                                                </th>
                                                <th className="px-3 py-1.5 font-semibold text-gray-700 border-b border-gray-200">Норма
                                                    на тону
                                                </th>
                                                <th className="px-3 py-1.5 font-semibold text-gray-700 border-b border-gray-200">Норма
                                                    по всем продуктам
                                                </th>
                                                <th className="px-3 py-1.5 font-semibold text-gray-700 border-b border-gray-200">Остаток</th>
                                                <th className="px-3 py-1.5 font-semibold text-gray-700 border-b border-gray-200">Страховой
                                                    запас
                                                </th>
                                                <th className="px-3 py-1.5 font-semibold text-gray-700 border-b border-gray-200">Округление
                                                    до тарного места
                                                </th>
                                                <th className="px-3 py-1.5 font-semibold text-gray-700 border-b border-gray-200">Заказать</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {!selectedProduct ? (
                                                <tr>
                                                    <td colSpan={8}
                                                        className="px-3 py-8 text-center text-gray-400 text-sm">Выберите
                                                        продукт, чтобы увидеть материалы
                                                    </td>
                                                </tr>
                                            ) : selectedProduct.materials?.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8}
                                                        className="px-3 py-8 text-center text-gray-400 text-sm">Нет
                                                        материалов для этого продукта
                                                    </td>
                                                </tr>
                                            ) : (
                                                selectedProduct.materials?.map((material, index) => {
                                                    const isCommon = material.productCount > 1;
                                                    const totalNormf = typeof material.totalNormf === 'number' ? material.totalNormf : parseFloat(material.totalNormf) || 0;
                                                    const norm = typeof material.norm === 'number' ? material.norm : parseFloat(material.norm) || 0;
                                                    const order = typeof material.order === 'number' ? material.order : parseFloat(material.order) || 0;
                                                    const insurancePerc = material.insurancePerc || 0;
                                                    const roundStep = material.roundStep || 1;

                                                    return (
                                                        <tr key={`${material.kmt}-${index}`}
                                                            className={`border-b border-gray-200 text-sm text-center hover:bg-gray-50 ${isCommon ? 'bg-yellow-50' : ''}`}>
                                                            <td className="px-3 py-1.5 text-gray-700">{material.kmt}</td>
                                                            <td className="px-3 py-1.5 text-gray-700 text-left truncate max-w-[150px]"
                                                                title={material.snmMt}>
                                                                {isCommon && (
                                                                    <span
                                                                        className="mr-1 text-yellow-400 font-medium pr-1"
                                                                        title="Используется в нескольких продуктах"><i
                                                                        className="fa-solid fa-triangle-exclamation"></i></span>)}
                                                                {material.snmMt || material.kmt}
                                                            </td>
                                                            <td className="px-3 py-1.5 text-gray-700 ">{material.eduMt}</td>
                                                            <td className="px-3 py-1.5 text-gray-700 ">{norm.toFixed(2)}</td>
                                                            <td className="px-3 py-1.5 text-gray-700 ">{`${totalNormf.toFixed(2)} ${material.eduMt}`}</td>
                                                            <td className="px-3 py-1.5 text-gray-700 ">
                                                                {renderKolfInput(material.kmt, material.kolf || 0)}
                                                            </td>
                                                            <td className="px-3 py-1.5 text-gray-700 ">{insurancePerc}%</td>
                                                            <td className="px-3 py-1.5 text-gray-700 ">{roundStep}</td>
                                                            <td className="px-3 py-1.5 text-gray-700 font-bold ">
                                                                {`${order.toFixed(2)} ${material.eduMt}`}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {viewMode === 'summary' && (
                            <div className="flex flex-col flex-1 min-h-0">
                                <div className="mb-1 flex items-center justify-between">
                                    <div>
                                        <span
                                            className="text-sm font-semibold text-gray-700">Сводка по материалам</span>
                                        {materialSummary.length > 0 && (
                                            <span
                                                className="ml-2 text-xs text-gray-500">({materialSummary.length})</span>
                                        )}
                                    </div>
                                    {/* ПОДСКАЗКА */}
                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                        <span className="flex items-center gap-1">
                                            <span className="text-yellow-400 text-sm"><i className="fa-solid fa-triangle-exclamation"></i></span>
                                            <span>— материал используется в нескольких продуктах</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto border border-gray-200 rounded-md">
                                    <table className="w-full border-collapse">
                                        <thead className="sticky top-0">
                                        <tr className="bg-gray-100 text-center text-sm">
                                            <th className="px-3 py-1.5 font-semibold text-gray-700 border-b border-gray-200">Код</th>
                                            <th className="px-3 py-1.5 w-[20%] font-semibold text-gray-700 border-b border-gray-200">Материал</th>
                                            <th className="px-3 py-1.5 font-semibold text-gray-700 border-b border-gray-200">Ед.
                                                изм.
                                            </th>
                                            <th className="px-3 py-1.5 font-semibold text-gray-700 border-b border-gray-200">Продуктов</th>
                                            <th className="px-3 py-1.5 font-semibold text-gray-700 border-b border-gray-200">Норма
                                                по всем
                                            </th>
                                            <th className="px-3 py-1.5 font-semibold text-gray-700 border-b border-gray-200">Остаток</th>
                                            <th className="px-3 py-1.5 font-semibold text-gray-700 border-b border-gray-200">Страховка,
                                                %
                                            </th>
                                            <th className="px-3 py-1.5 font-semibold text-gray-700 border-b border-gray-200">Округлить
                                                до
                                            </th>
                                            <th className="px-3 py-1.5 font-semibold text-gray-700 border-b border-gray-200">Заказать</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {materialSummary.length === 0 ? (
                                            <tr>
                                                <td colSpan={8}
                                                    className="px-3 py-8 text-center text-gray-400 text-sm">Нет данных
                                                </td>
                                            </tr>
                                        ) : (
                                            materialSummary.map((item, index) => {
                                                const isCommon = item.productCount > 1;
                                                return (
                                                    <tr key={`${item.kmt}-${index}`}
                                                        className={`border-b border-gray-200 text-sm text-center hover:bg-gray-50 ${isCommon ? 'bg-yellow-50' : ''}`}>
                                                        <td className="px-3 py-1.5 text-gray-700">{item.kmt}</td>
                                                        <td className="px-3 py-1.5 text-gray-700 text-left truncate max-w-[150px]"
                                                            title={item.snmMt}>
                                                            {isCommon && (
                                                                <span className="mr-1 text-yellow-400 font-medium pr-1"
                                                                      title="Используется в нескольких продуктах"><i
                                                                    className="fa-solid fa-triangle-exclamation"></i></span>)}
                                                            {item.snmMt}
                                                        </td>
                                                        <td className="px-3 py-1.5 text-gray-700 text-center">{item.eduMt}</td>
                                                        <td className="px-3 py-1.5 text-gray-700 ">{item.productCount}</td>
                                                        <td className="px-3 py-1.5 text-gray-700 ">{`${item.totalNormf.toFixed(2)} ${item.eduMt}`}</td>
                                                        <td className="px-3 py-1.5 text-gray-700 ">
                                                            {renderKolfInput(item.kmt, item.kolf || 0)}
                                                        </td>
                                                        <td className="px-3 py-1.5 text-gray-700 ">{item.insurancePerc}%</td>
                                                        <td className="px-3 py-1.5 text-gray-700 ">{item.roundStep}</td>
                                                        <td className="px-3 py-1.5 text-gray-700 font-bold">
                                                            {`${item.order.toFixed(2)} ${item.eduMt}`}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </>}

                {isModalError &&
                    <ModalNotifyError title={"Ошибка"} message={error} onClose={() => setIsModalError(false)}/>}

                {isModalNotify &&
                    <ModalNotify title={"Результат операции"} message={msg} onClose={() => setIsModalNotify(false)}/>}
            </div>
        </div>
    </>);
}

export default observer(MaterialsPage);
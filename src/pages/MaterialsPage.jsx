import {Navigation} from "../components/Navigation";
import {LeftNavigation} from "../components/leftNavigation/LeftNavigation";
import React, {useEffect, useState, useContext} from "react";
import Loading from "../components/loading/Loading";
import {useNavigate} from "react-router-dom";
import {ModalNotifyError} from "../components/modal/ModalNotifyError";
import {Context} from '../index';
import {observer} from 'mobx-react-lite';
import MaterialService from "../services/MaterialService";

function MaterialsPage() {

    const navigate = useNavigate();
    const {store} = useContext(Context);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalError, setIsModalError] = useState(false);

    // Данные для фильтров
    const [date, setDate] = useState(() => {
        const today = new Date("2026-02-15");
        return today.toISOString().split('T')[0];
    });
    const [kpp, setKpp] = useState('');
    const [recipients, setRecipients] = useState([]);

    // Данные таблицы
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [viewMode, setViewMode] = useState('products'); // 'products' | 'summary'

    const [updatingKolf, setUpdatingKolf] = useState(null);

    // 👇 НОВОЕ: локальное состояние для значений KOLF
    const [localKolf, setLocalKolf] = useState({}); // { kmt: value }

    // Загрузка получателей
    useEffect(() => {
        fetchRecipients();
    }, []);

    async function fetchRecipients() {
        try {
            setIsLoading(true);
            const response = await MaterialService.getRecipients();
            setRecipients(response.data || []);
            if (response.data && response.data.length > 0) {
                setKpp(response.data[0].kpp);
            }
        } catch (e) {
            setIsModalError(true);
            setError(e.response?.data?.message || 'Ошибка загрузки получателей');
        } finally {
            setIsLoading(false);
        }
    }

    async function loadData() {
        if (!date || !kpp) {
            setIsModalError(true);
            setError('Выберите дату и цех');
            return;
        }

        try {
            setIsLoading(true);
            const response = await MaterialService.loadProducts(date, kpp);
            setProducts(response.data || []);
            setSelectedProduct(null);
            setLocalKolf({}); // 👈 Очищаем локальные значения при загрузке
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
        // Находим оригинальное значение
        const originalMaterial = products
            .flatMap(p => p.materials || [])
            .find(m => m.kmt === kmt);

        const originalValue = originalMaterial?.kolf || 0;

        // Если значение не изменилось - ничего не делаем
        if (value === originalValue) {
            setLocalKolf(prev => ({ ...prev, [kmt]: undefined }));
            return;
        }

        setUpdatingKolf(kmt);

        try {
            const response = await MaterialService.updateKolf(kmt, value, date, kpp);
            const updatedMaterial = response.data;

            setProducts(prevProducts =>
                prevProducts.map(product => ({
                    ...product,
                    materials: product.materials?.map(material =>
                        material.kmt === kmt
                            ? updateCommonMaterialFields(material, updatedMaterial)
                            : material
                    )
                }))
            );

            if (selectedProduct) {
                setSelectedProduct(prev => ({
                    ...prev,
                    materials: prev.materials?.map(material =>
                        material.kmt === kmt
                            ? updateCommonMaterialFields(material, updatedMaterial)
                            : material
                    )
                }));
            }

            setLocalKolf(prev => ({ ...prev, [kmt]: undefined }));

        } catch (e) {
            setIsModalError(true);
            setError(e.response?.data?.message || 'Ошибка сохранения KOLF');

            setLocalKolf(prev => ({ ...prev, [kmt]: originalValue }));
        } finally {
            setUpdatingKolf(null);
        }
    }

    // Функция для обновления только общих полей материала
    function updateCommonMaterialFields(material, updatedMaterial) {
        return {
            ...material,
            totalNormf: updatedMaterial.totalNormf ?? material.totalNormf,
            kolf: updatedMaterial.kolf ?? material.kolf,
            trnd: updatedMaterial.trnd ?? material.trnd,
            order: updatedMaterial.order ?? material.order,
            insurancePerc: updatedMaterial.insurancePerc ?? material.insurancePerc,
            roundStep: updatedMaterial.roundStep ?? material.roundStep,
            productCount: updatedMaterial.productCount ?? material.productCount
        };
    }

    const getKolfValue = (kmt, defaultKolf = 0) => {
        return localKolf[kmt] !== undefined ? localKolf[kmt] : (defaultKolf || 0);
    };

    function getMaterialSummary() {
        if (!products.length) return [];

        const grouped = {};

        products.forEach(product => {
            product.materials?.forEach(material => {
                if (!grouped[material.kmt]) {
                    grouped[material.kmt] = {
                        kmt: material.kmt,
                        snmMt: material.snmMt || material.kmt,
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

    const renderKolfInput = (kmt, defaultKolf, isSummary = false) => {
        const value = getKolfValue(kmt, defaultKolf);
        const isUpdating = updatingKolf === kmt;
        const hasChanges = localKolf[kmt] !== undefined;

        return (
            <input
                type="number"
                step="0.01"
                className={`w-20 px-1.5 py-0.5 text-right text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isUpdating ? 'opacity-50 bg-gray-100' : ''
                } ${
                    hasChanges ? 'border-yellow-400 bg-yellow-50' : ''
                }`}
                value={value}
                onChange={(e) => {
                    const rawValue = e.target.value;

                    // Полностью блокируем отрицательные значения
                    if (rawValue.startsWith('-')) {
                        return;
                    }

                    const newValue = rawValue === '' ? 0 : parseFloat(rawValue) || 0;

                    // Блокируем отрицательные числа
                    if (newValue < 0) {
                        setLocalKolf(prev => ({
                            ...prev,
                            [kmt]: 0
                        }));
                        return;
                    }

                    setLocalKolf(prev => ({
                        ...prev,
                        [kmt]: newValue
                    }));
                }}
                onKeyDown={(e) => {
                    // Блокируем клавишу минус
                    if (e.key === '-' || e.key === 'Minus') {
                        e.preventDefault();
                        return;
                    }

                    if (e.key === 'Enter') {
                        e.preventDefault();
                        e.target.blur();
                        const currentValue = getKolfValue(kmt, defaultKolf);

                        // Проверка перед сохранением
                        if (currentValue < 0) {
                            setLocalKolf(prev => ({ ...prev, [kmt]: 0 }));
                            setIsModalError(true);
                            setError('Значение KOLF не может быть отрицательным');
                            return;
                        }

                        handleKolfChange(kmt, currentValue);
                    }
                    if (e.key === 'Escape') {
                        setLocalKolf(prev => ({
                            ...prev,
                            [kmt]: defaultKolf || 0
                        }));
                        e.target.blur();
                    }
                }}
                onBlur={() => {
                    // Опционально: сохранять при потере фокуса
                    // Если хотите автосохранение - раскомментируйте:
                    const currentValue = getKolfValue(kmt, defaultKolf);
                    handleKolfChange(kmt, currentValue);
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
                                <span className="px-3 text-[0.950rem] font-medium text-gray-600 border-r border-gray-200">
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
                                <span className="px-3 text-[0.950rem] font-medium text-gray-600 border-r border-gray-200">
                                    МОЛ:
                                </span>
                                <select
                                    className="px-2 text-[0.950rem] font-medium text-gray-700 cursor-pointer focus:outline-none bg-transparent"
                                    value={kpp}
                                    onChange={(e) => setKpp(e.target.value)}
                                >
                                    <option value="">Выберите цех</option>
                                    {recipients.map((recipient) => (
                                        <option key={recipient.kpp} value={recipient.kpp}>
                                            {recipient.snm || recipient.kpp}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                className="h-[30px] px-4 bg-blue-600 hover:bg-blue-700 text-white text-[0.950rem] font-medium rounded-md transition"
                                onClick={loadData}
                            >
                                Загрузить
                            </button>

                        </div>
                    </div>

                    {/* Кнопки переключения режимов */}
                    <div className="px-24 py-2 flex gap-2">
                        <button
                            className={`px-4 py-1 text-sm font-medium rounded-md transition ${
                                viewMode === 'products'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => setViewMode('products')}
                        >
                            📦 По продуктам
                        </button>
                        <button
                            className={`px-4 py-1 text-sm font-medium rounded-md transition ${
                                viewMode === 'summary'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            onClick={() => setViewMode('summary')}
                        >
                            📊 Сводка по материалам
                        </button>
                    </div>

                    {/* ===== КОНТЕЙНЕР С ТАБЛИЦАМИ ===== */}
                    <div className="px-24 py-2 flex flex-col gap-4 h-[calc(100vh-280px)]">

                        {/* ===== РЕЖИМ: ПО ПРОДУКТАМ ===== */}
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
                                            <thead className="sticky top-0 z-10">
                                            <tr className="bg-gray-100">
                                                <th className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200">Код</th>
                                                <th className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200">KT</th>
                                                <th className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200">EMK</th>
                                                <th className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200">Продукт</th>
                                                <th className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200">Масса, кг</th>
                                                <th className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200">EAN13</th>
                                                <th className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200">Материалов</th>
                                                {/*<th className="px-4 py-2 text-sm font-semibold text-gray-700 text-center border-b border-gray-200">Действие</th>*/}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {products.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">
                                                        Нет данных. Выберите дату и цех, нажмите "Загрузить".
                                                    </td>
                                                </tr>
                                            ) : (
                                                products.map((product) => (
                                                    <tr
                                                        key={product.kmc}
                                                        className={`border-b border-gray-200 hover:bg-gray-50 ${
                                                            selectedProduct?.kmc === product.kmc ? 'bg-blue-50' : ''
                                                        }`}
                                                    >
                                                        <td className="px-4 py-2 text-sm text-gray-700 cursor-pointer" onClick={() => handleProductSelect(product)}>
                                                            {product.kmc}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-700 cursor-pointer" onClick={() => handleProductSelect(product)}>
                                                            {product.kt || '—'}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-700 cursor-pointer" onClick={() => handleProductSelect(product)}>
                                                            {product.emk !== undefined && product.emk !== null ? product.emk.toFixed(1) : '—'}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-700 truncate max-w-[200px] cursor-pointer" title={product.name?.trim()} onClick={() => handleProductSelect(product)}>
                                                            {product.name?.trim()}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-700 cursor-pointer" onClick={() => handleProductSelect(product)}>
                                                            {product.sumMass?.toFixed(1)}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-700 cursor-pointer" onClick={() => handleProductSelect(product)}>
                                                            {product.ean13}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-700 cursor-pointer" onClick={() => handleProductSelect(product)}>
                                                            {product.materials?.length || 0}
                                                        </td>
                                                        {/*<td className="px-4 py-2 text-sm text-center">*/}
                                                        {/*    <button className="text-blue-600 hover:text-blue-800 transition" onClick={() => handleProductSelect(product)}>*/}
                                                        {/*        {selectedProduct?.kmc === product.kmc ? 'Скрыть' : 'Показать'}*/}
                                                        {/*    </button>*/}
                                                        {/*</td>*/}
                                                    </tr>
                                                ))
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* ТАБЛИЦА МАТЕРИАЛОВ ВЫБРАННОГО ПРОДУКТА */}
                                <div className="flex flex-col min-h-[308px] max-h-[308px]">
                                    <div className="mb-1">
                                        <span className="text-sm font-semibold text-gray-700">Материалы</span>
                                        {selectedProduct && (
                                            <span className="ml-2 text-xs text-gray-500">{selectedProduct.name?.trim()}</span>
                                        )}
                                        {selectedProduct?.materials?.length > 0 && (
                                            <span className="ml-1 text-xs text-gray-500">({selectedProduct.materials.length})</span>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-auto border border-gray-200 rounded-md">
                                        <table className="w-full border-collapse">
                                            <thead className="sticky top-0 z-10">
                                            <tr className="bg-gray-200 text-center text-sm">
                                                <th className="px-3 py-1.5 font-semibold text-gray-700 border-b border-gray-200">Код</th>
                                                <th className="px-3 w-[30%] py-1.5 font-semibold text-gray-700 border-b border-gray-200">Материал</th>
                                                <th className="px-3 py-1.5 font-semibold text-gray-700 text-right border-b border-gray-200">Норма на тону</th>
                                                <th className="px-3 py-1.5 font-semibold text-gray-700 text-right border-b border-gray-200">Норма по всем продуктам</th>
                                                <th className="px-3 py-1.5 font-semibold text-gray-700 text-right border-b border-gray-200">Остаток</th>
                                                <th className="px-3 py-1.5 font-semibold text-gray-700 text-right border-b border-gray-200">Страховка, %</th>
                                                <th className="px-3 py-1.5 font-semibold text-gray-700 text-right border-b border-gray-200">Округлить до</th>
                                                {/*<th className="px-3 py-1.5 font-semibold text-gray-700 text-right border-b border-gray-200" title="Норма со страховкой и округлением">Норма со страховкой</th>*/}
                                                <th className="px-3 py-1.5 font-semibold text-gray-700 text-right border-b border-gray-200">Заказать</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {!selectedProduct ? (
                                                <tr><td colSpan={9} className="px-3 py-8 text-center text-gray-400 text-sm">Выберите продукт, чтобы увидеть материалы</td></tr>
                                            ) : selectedProduct.materials?.length === 0 ? (
                                                <tr><td colSpan={9} className="px-3 py-8 text-center text-gray-400 text-sm">Нет материалов для этого продукта</td></tr>
                                            ) : (
                                                selectedProduct.materials?.map((material, index) => {
                                                    const isCommon = material.productCount > 1;
                                                    const trnd = typeof material.trnd === 'number' ? material.trnd : parseFloat(material.trnd) || 0;
                                                    const totalNormf = typeof material.totalNormf === 'number' ? material.totalNormf : parseFloat(material.totalNormf) || 0;
                                                    const norm = typeof material.norm === 'number' ? material.norm : parseFloat(material.norm) || 0;
                                                    const order = typeof material.order === 'number' ? material.order : parseFloat(material.order) || 0;
                                                    const insurancePerc = material.insurancePerc || 0;
                                                    const roundStep = material.roundStep || 1;

                                                    return (
                                                        <tr key={`${material.kmt}-${index}`} className={`text-xs border-b border-gray-200 hover:bg-gray-50 ${isCommon ? 'bg-yellow-50' : ''}`}>
                                                            <td className="px-3 py-1.5 text-gray-700">{material.kmt}</td>
                                                            <td className="px-3 py-1.5 text-gray-700 truncate max-w-[150px]" title={material.snmMt}>
                                                                {isCommon && (<span className="mr-1 text-orange-500 font-medium" title="Используется в нескольких продуктах">🟡</span>)}
                                                                {material.snmMt || material.kmt}
                                                            </td>
                                                            <td className="px-3 py-1.5 text-gray-700 text-right">{norm.toFixed(2)}</td>
                                                            <td className="px-3 py-1.5 text-gray-700 text-right font-semibold">{totalNormf > 0 ? totalNormf.toFixed(2) : '—'}</td>
                                                            <td className="px-3 py-1.5 text-gray-700 text-right">
                                                                {renderKolfInput(material.kmt, material.kolf || 0)}
                                                            </td>
                                                            <td className="px-3 py-1.5 text-gray-700 text-right">{insurancePerc}%</td>
                                                            <td className="px-3 py-1.5 text-gray-700 text-right">{roundStep}</td>
                                                            {/*<td className="px-3 py-1.5 text-gray-700 text-right font-semibold text-blue-600 cursor-help" title={`Норма с учётом страховки и округления\nФормула: ceil(${totalNormf} × (1 + ${insurancePerc}%) / ${roundStep}) × ${roundStep} = ${trnd}`}>*/}
                                                            {/*    {trnd > 0 ? trnd.toFixed(2) : '—'}*/}
                                                            {/*</td>*/}
                                                            <td className="px-3 py-1.5 text-gray-700 text-right font-bold text-green-600">
                                                                {order > 0 ? order.toFixed(2) : '0'}
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

                        {/* ===== РЕЖИМ: СВОДКА ПО МАТЕРИАЛАМ ===== */}
                        {viewMode === 'summary' && (
                            <div className="flex flex-col flex-1 min-h-0">
                                <div className="mb-1">
                                    <span className="text-sm font-semibold text-gray-700">Сводка по материалам</span>
                                    {materialSummary.length > 0 && (
                                        <span className="ml-2 text-xs text-gray-500">({materialSummary.length})</span>
                                    )}
                                </div>
                                <div className="flex-1 overflow-auto border border-gray-200 rounded-md">
                                    <table className="w-full border-collapse">
                                        <thead className="sticky top-0 z-10">
                                        <tr className="bg-gray-200 text-left">
                                            <th className="px-3 py-1.5 text-xs font-semibold text-gray-700 border-b border-gray-200">Код</th>
                                            <th className="px-3 py-1.5 text-xs font-semibold text-gray-700 border-b border-gray-200">Материал</th>
                                            <th className="px-3 py-1.5 text-xs font-semibold text-gray-700 text-right border-b border-gray-200">Продуктов</th>
                                            <th className="px-3 py-1.5 text-xs font-semibold text-gray-700 text-right border-b border-gray-200">Норма по всем</th>
                                            <th className="px-3 py-1.5 text-xs font-semibold text-gray-700 text-right border-b border-gray-200">Остаток</th>
                                            <th className="px-3 py-1.5 text-xs font-semibold text-gray-700 text-right border-b border-gray-200">Страховка, %</th>
                                            <th className="px-3 py-1.5 text-xs font-semibold text-gray-700 text-right border-b border-gray-200">Округлить до</th>
                                            {/*<th className="px-3 py-1.5 text-xs font-semibold text-gray-700 text-right border-b border-gray-200">Норма со страховкой</th>*/}
                                            <th className="px-3 py-1.5 text-xs font-semibold text-gray-700 text-right border-b border-gray-200">Заказать</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {materialSummary.length === 0 ? (
                                            <tr><td colSpan={9} className="px-3 py-8 text-center text-gray-400 text-sm">Нет данных</td></tr>
                                        ) : (
                                            materialSummary.map((item, index) => {
                                                const isCommon = item.productCount > 1;
                                                return (
                                                    <tr key={`${item.kmt}-${index}`} className={`border-b border-gray-200 hover:bg-gray-50 ${isCommon ? 'bg-yellow-50' : ''}`}>
                                                        <td className="px-3 py-1.5 text-xs text-gray-700">{item.kmt}</td>
                                                        <td className="px-3 py-1.5 text-xs text-gray-700 truncate max-w-[150px]" title={item.snmMt}>
                                                            {isCommon && (<span className="mr-1 text-orange-500 font-medium" title="Используется в нескольких продуктах">🟡</span>)}
                                                            {item.snmMt}
                                                        </td>
                                                        <td className="px-3 py-1.5 text-xs text-gray-700 text-right">{item.productCount}</td>
                                                        <td className="px-3 py-1.5 text-xs text-gray-700 text-right font-semibold">{item.totalNormf > 0 ? item.totalNormf.toFixed(2) : '—'}</td>
                                                        <td className="px-3 py-1.5 text-xs text-gray-700 text-right">
                                                            {renderKolfInput(item.kmt, item.kolf || 0, true)}
                                                        </td>
                                                        <td className="px-3 py-1.5 text-xs text-gray-700 text-right">{item.insurancePerc}%</td>
                                                        <td className="px-3 py-1.5 text-xs text-gray-700 text-right">{item.roundStep}</td>
                                                        {/*<td className="px-3 py-1.5 text-xs text-gray-700 text-right font-semibold text-blue-600">{item.trnd > 0 ? item.trnd.toFixed(2) : '—'}</td>*/}
                                                        <td className="px-3 py-1.5 text-xs text-gray-700 text-right font-bold text-green-600">
                                                            {item.order > 0 ? item.order.toFixed(2) : '0'}
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

                {isModalError && <ModalNotifyError title={"Ошибка"} message={error} onClose={() => setIsModalError(false)}/>}
            </div>
        </div>
    </>);
}

export default observer(MaterialsPage);
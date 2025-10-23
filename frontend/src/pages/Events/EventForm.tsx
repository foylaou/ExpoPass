import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, MapPin, FileText, Code } from 'lucide-react';
import {useAppStore, useEventStore} from "../../store";
import type {CreateEventRequest,Event} from "../../services/Events/eventsType.ts";
import {eventsServices} from "../../services/Events/eventsServices.ts";

export const EventForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { setLoading } = useAppStore();
    const { addEvent, updateEvent, events } = useEventStore();
    const isEdit = !!id;

    const [formData, setFormData] = useState<CreateEventRequest>({
        eventName: '',
        eventCode: '',
        startDate: '',
        endDate: '',
        location: '',
        description: '',
        status: 'upcoming',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 加載展覽數據（編輯模式）
    useEffect(() => {
        if (isEdit && id) {
            const event = events.find(e => e.id === id);
            if (event) {
                setFormData({
                    eventName: event.eventName,
                    eventCode: event.eventCode,
                    startDate: event.startDate,
                    endDate: event.endDate,
                    location: event.location || '',
                    description: event.description || '',
                    status: event.status
                });
            } else {
                // 如果本地沒有找到，嘗試從 API 獲取
                void loadEvent(id);
            }
        }
    }, [id, events, isEdit]);

    const loadEvent = async (eventId: string) => {
        try {
            setLoading(true);
            const response = await eventsServices.GetEventById(eventId);

            if (response.success && response.data) {
                setFormData({
                    eventName: response.data.eventName,
                    eventCode: response.data.eventCode,
                    startDate: response.data.startDate,
                    endDate: response.data.endDate,
                    location: response.data.location || '',
                    description: response.data.description || '',
                    status: response.data.status
                });
            } else {
                throw new Error(response.message || '獲取展覽資料失敗');
            }
        } catch (error: any) {
            console.error('Failed to load event:', error);
            alert(`加載展覽資訊失敗: ${error.message}`);
            navigate('/events');
        } finally {
            setLoading(false);
        }
    };

    // 表單驗證
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.eventName.trim()) {
            newErrors.eventName = '展覽名稱是必填項';
        }

        if (!formData.eventCode.trim()) {
            newErrors.eventCode = '展覽代碼是必填項';
        } else if (!/^[A-Z0-9]+$/.test(formData.eventCode)) {
            newErrors.eventCode = '展覽代碼只能包含大寫字母和數字';
        }

        if (!formData.startDate) {
            newErrors.startDate = '開始日期是必填項';
        }

        if (!formData.endDate) {
            newErrors.endDate = '結束日期是必填項';
        }

        if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
            newErrors.endDate = '結束日期不能早於開始日期';
        }

        // 檢查展覽代碼唯一性
        if (!isEdit && events.some(e => e.eventCode === formData.eventCode)) {
            newErrors.eventCode = '展覽代碼已存在';
        }

        if (isEdit && events.some(e => e.eventCode === formData.eventCode && e.id !== id)) {
            newErrors.eventCode = '展覽代碼已存在';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 提交表單
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);
            setLoading(true);

            if (isEdit && id) {
                // 更新展覽
                const response = await eventsServices.UpdateEvent(id, formData);

                if (response.success && response.data) {
                    updateEvent(id, response.data);
                    alert('展覽更新成功！');
                    navigate('/events');
                } else {
                    throw new Error(response.message || '更新失敗');
                }
            } else {
                // 創建展覽
                const response = await eventsServices.CreateEvent(formData);

                if (response.success && response.data) {
                    addEvent(response.data);
                    alert('展覽創建成功！');
                    navigate('/events');
                } else {
                    throw new Error(response.message || '創建失敗');
                }
            }
        } catch (error: any) {
            console.error('Failed to save event:', error);

            // 處理服務器驗證錯誤
            if (error.message.includes('展覽代碼已存在') || error.message.includes('eventCode')) {
                setErrors({ eventCode: '展覽代碼已存在' });
            } else {
                alert(`${isEdit ? '更新' : '創建'}失敗：${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    // 處理輸入變化
    const handleInputChange = (field: keyof CreateEventRequest, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // 清除對應字段的錯誤
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div className="space-y-6">
            {/* 頁面頭部 */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/events')}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? '編輯展覽' : '創建展覽'}
                    </h1>
                    <p className="text-gray-600">
                        {isEdit ? '修改展覽信息' : '填寫展覽基本信息'}
                    </p>
                </div>
            </div>

            {/* 表單 */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">基本信息</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 展覽名稱 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 inline mr-2" />
                                展覽名稱 *
                            </label>
                            <input
                                type="text"
                                value={formData.eventName}
                                onChange={(e) => handleInputChange('eventName', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.eventName ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="輸入展覽名稱"
                                maxLength={200}
                            />
                            {errors.eventName && (
                                <p className="mt-1 text-sm text-red-600">{errors.eventName}</p>
                            )}
                        </div>

                        {/* 展覽代碼 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Code className="w-4 h-4 inline mr-2" />
                                展覽代碼 *
                            </label>
                            <input
                                type="text"
                                value={formData.eventCode}
                                onChange={(e) => handleInputChange('eventCode', e.target.value.toUpperCase())}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.eventCode ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="例如: TECH2024"
                                maxLength={50}
                                disabled={isEdit}
                            />
                            {errors.eventCode && (
                                <p className="mt-1 text-sm text-red-600">{errors.eventCode}</p>
                            )}
                            {isEdit ? (
                                <p className="mt-1 text-sm text-gray-500">展覽代碼在編輯時無法更改</p>
                            ) : (
                                <p className="mt-1 text-sm text-gray-500">只能包含大寫字母和數字</p>
                            )}
                        </div>

                        {/* 開始日期 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                開始日期 *
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => handleInputChange('startDate', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.startDate ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.startDate && (
                                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                            )}
                        </div>

                        {/* 結束日期 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                結束日期 *
                            </label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => handleInputChange('endDate', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.endDate ? 'border-red-300' : 'border-gray-300'
                                }`}
                                min={formData.startDate}
                            />
                            {errors.endDate && (
                                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                            )}
                        </div>

                        {/* 展覽地點 */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin className="w-4 h-4 inline mr-2" />
                                展覽地點
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="輸入展覽地點"
                                maxLength={300}
                            />
                        </div>

                        {/* 狀態 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                展覽狀態
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value as Event['status'])}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="upcoming">即將開始</option>
                                <option value="active">進行中</option>
                                <option value="ended">已結束</option>
                            </select>
                        </div>
                    </div>

                    {/* 展覽描述 */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="w-4 h-4 inline mr-2" />
                            展覽描述
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="輸入展覽描述信息..."
                        />
                    </div>
                </div>

                {/* 操作按鈕 */}
                <div className="flex items-center justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/events')}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        取消
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSubmitting ? '保存中...' : (isEdit ? '更新展覽' : '創建展覽')}
                    </button>
                </div>
            </form>

            {/* 提示信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                    <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">溫馨提示</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• 展覽名稱、代碼、日期為必填項</li>
                            <li>• 展覽代碼只能包含大寫字母和數字，且創建後無法修改</li>
                            <li>• 結束日期不能早於開始日期</li>
                            <li>• 展覽狀態可在活動進行中隨時更新</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

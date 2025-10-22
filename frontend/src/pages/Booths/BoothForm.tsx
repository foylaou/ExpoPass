//frontend/src/pages/BoothForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Building2, MapPin, Hash, Users, Calendar } from 'lucide-react';
import { useAppStore, useEventStore } from '../../store';
import {boothsServices} from "../../services/Booths/boothsServices.ts";
import type {CreateBoothsRequest, UpdateBoothsRequest} from "../../services/Booths/boothsType.ts";



// 表單資料介面
interface BoothFormData {
    boothNumber?: string;
    boothName?: string;
    location?: string;
    eventId?: string;
    company?: string;
    description?: string;
}

export const BoothForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentEvent, setLoading } = useAppStore();
    const { events } = useEventStore();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState<BoothFormData>({
        boothNumber: '',
        boothName: '',
        location: '',
        eventId: currentEvent?.id || '',
        company: '',
        description: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const locations = ['A區', 'B區', 'C區', 'A館一層', 'A館二層', 'B館一層', 'B館二層', 'C館一層', 'C館二層'];

    useEffect(() => {
        if (isEdit && id) {
            loadBooth(id);
        } else {
            generateBoothNumber();
        }
    }, [isEdit, id]);

    const loadBooth = async (boothId: string) => {
        try {
            setLoading(true);
            const response = await boothsServices.GetBoothById(boothId);

            if (response.success && response.data) {
                const booth = response.data;
                setFormData({
                    boothNumber: booth.boothNumber || '',
                    boothName: booth.boothName || '',
                    location: booth.location || '',
                    eventId: currentEvent?.id || '',
                    company: booth.company || '',
                    description: booth.description || ''
                });
            } else {
                throw new Error(response.message || '獲取攤位資料失敗');
            }
        } catch (error: any) {
            console.error('Failed to load booth:', error);
            alert(`加載攤位資訊失敗: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const generateBoothNumber = () => {
        // 生成攤位號：區域 + 編號
        const areas = ['A', 'B', 'C'];
        const area = areas[Math.floor(Math.random() * areas.length)];
        const number = Math.floor(1 + Math.random() * 99).toString().padStart(2, '0');
        const boothNumber = `${area}${number}`;
        setFormData(prev => ({ ...prev, boothNumber: boothNumber }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // 清除該字段的錯誤
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.boothNumber?.trim()) {
            newErrors.boothNumber = '請輸入攤位號';
        }

        if (!formData.boothName?.trim()) {
            newErrors.boothName = '請輸入攤位名稱';
        }

        if (!formData.location?.trim()) {
            newErrors.location = '請選擇位置';
        }

        if (!formData.eventId) {
            newErrors.eventId = '請選擇關聯活動';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            if (isEdit && id) {
                // 更新攤位
                const updateData: UpdateBoothsRequest = {
                    boothNumber: formData.boothNumber || '',
                    boothName: formData.boothName || '',
                    location: formData.location || '',
                    company: formData.company || '',
                    description: formData.description || ''
                };

                const response = await boothsServices.UpdateBoothById(id, updateData);
                if (response.success) {
                    alert('攤位資訊更新成功！');
                    navigate('/booths');
                } else {
                    throw new Error(response.message || '更新失敗');
                }
            } else {
                // 創建攤位
                const createData: CreateBoothsRequest = {
                    eventId: formData.eventId || '',
                    boothNumber: formData.boothNumber || '',
                    boothName: formData.boothName || '',
                    location: formData.location || '',
                    company: formData.company || '',
                    description: formData.description || ''
                };

                const response = await boothsServices.CreateNewBooth(createData);
                if (response.success) {
                    alert('攤位新增成功！');
                    navigate('/booths');
                } else {
                    throw new Error(response.message || '創建失敗');
                }
            }
        } catch (error: any) {
            console.error('Failed to save booth:', error);
            alert(`保存失敗: ${error.message || '未知錯誤'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm('確定要取消嗎？未保存的更改將丟失。')) {
            navigate('/booths');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* 頁面頭部 */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/booths')}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? '編輯攤位' : '添加攤位'}
                    </h1>
                    <p className="text-gray-600">
                        {isEdit ? '修改攤位信息' : '填寫攤位基本信息'}
                    </p>
                </div>
            </div>

            {/* 表單卡片 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 基本信息 */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Building2 className="w-5 h-5 mr-2 text-gray-600" />
                            基本信息
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 攤位號 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    攤位號 <span className="text-red-500">*</span>
                                </label>
                                <div className="flex">
                                    <div className="relative flex-1">
                                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            name="boothNumber"
                                            value={formData.boothNumber || ''}
                                            onChange={handleInputChange}
                                            className={`w-full pl-10 pr-3 py-2 border rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.boothNumber ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="A01"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={generateBoothNumber}
                                        className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 text-gray-700 rounded-r-md hover:bg-gray-200 transition-colors text-sm"
                                    >
                                        自動生成
                                    </button>
                                </div>
                                {errors.boothNumber && (
                                    <p className="mt-1 text-sm text-red-600">{errors.boothNumber}</p>
                                )}
                            </div>

                            {/* 攤位名稱 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    攤位名稱 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="boothName"
                                    value={formData.boothName || ''}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.boothName ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="如：科技創新攤位"
                                />
                                {errors.boothName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.boothName}</p>
                                )}
                            </div>

                            {/* 位置 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    位置 <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        name="location"
                                        value={formData.location || ''}
                                        onChange={handleInputChange}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.location ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">選擇位置</option>
                                        {locations.map(location => (
                                            <option key={location} value={location}>{location}</option>
                                        ))}
                                    </select>
                                </div>
                                {errors.location && (
                                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                                )}
                            </div>

                            {/* 關聯活動 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    關聯活動 <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        name="eventId"
                                        value={formData.eventId || ''}
                                        onChange={handleInputChange}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.eventId ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        disabled={isEdit}
                                    >
                                        <option value="">選擇活動</option>
                                        {events.map(event => (
                                            <option key={event.id} value={event.id}>{event.eventName}</option>
                                        ))}
                                    </select>
                                </div>
                                {errors.eventId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.eventId}</p>
                                )}
                                {isEdit && (
                                    <p className="mt-1 text-xs text-gray-500">編輯時無法更改關聯活動</p>
                                )}
                            </div>
                        </div>

                        {/* 參展商 */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                參展商
                            </label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company || ''}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="參展商名稱（選填）"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 描述 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            描述
                        </label>
                        <textarea
                            name="description"
                            value={formData.description || ''}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="攤位描述信息（選填）..."
                            maxLength={200}
                        />
                        <p className="text-xs text-gray-500 mt-1">{(formData.description || '').length}/200</p>
                    </div>

                    {/* 提交按鈕 */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            <span>{isSubmitting ? '保存中...' : (isEdit ? '更新' : '創建')}</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* 提示信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <Building2 className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                    <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">溫馨提示</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• 攤位號和名稱為必填項，用於識別和展示</li>
                            <li>• 位置信息便於參展者查找攤位</li>
                            <li>• 參展商和描述為選填項目</li>
                            <li>• 保存後系統將自動生成攤位專屬 QR Code</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

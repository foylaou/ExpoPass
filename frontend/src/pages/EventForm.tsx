import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, MapPin, FileText, Code } from 'lucide-react';
import { useEventStore } from '../store';
import { eventApi } from '../utils/api';
import type {Event} from '../types';

export const EventForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addEvent, updateEvent, events } = useEventStore();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    eventName: '',
    eventCode: '',
    startDate: '',
    endDate: '',
    location: '',
    description: '',
    status: 'upcoming' as Event['status']
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 加载展览数据（编辑模式）
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
        // 如果本地没有找到，尝试从 API 获取
        loadEvent(id);
      }
    }
  }, [id, events, isEdit]);

  const loadEvent = async (eventId: string) => {
    try {
      const event = await eventApi.getById(eventId);
      setFormData({
        eventName: event.eventName,
        eventCode: event.eventCode,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location || '',
        description: event.description || '',
        status: event.status
      });
    } catch (error) {
      console.error('Failed to load event:', error);
      navigate('/events');
    }
  };

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.eventName.trim()) {
      newErrors.eventName = '展览名称是必填项';
    }

    if (!formData.eventCode.trim()) {
      newErrors.eventCode = '展览代码是必填项';
    } else if (!/^[A-Z0-9]+$/.test(formData.eventCode)) {
      newErrors.eventCode = '展览代码只能包含大写字母和数字';
    }

    if (!formData.startDate) {
      newErrors.startDate = '开始日期是必填项';
    }

    if (!formData.endDate) {
      newErrors.endDate = '结束日期是必填项';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = '结束日期不能早于开始日期';
    }

    // 检查展览代码唯一性
    if (!isEdit && events.some(e => e.eventCode === formData.eventCode)) {
      newErrors.eventCode = '展览代码已存在';
    }

    if (isEdit && events.some(e => e.eventCode === formData.eventCode && e.id !== id)) {
      newErrors.eventCode = '展览代码已存在';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (isEdit && id) {
        const updatedEvent = await eventApi.update(id, formData);
        updateEvent(id, updatedEvent);
      } else {
        const newEvent = await eventApi.create(formData);
        addEvent(newEvent);
      }

      navigate('/events');
    } catch (error: any) {
      console.error('Failed to save event:', error);

      // 处理服务器验证错误
      if (error.message.includes('展览代码已存在')) {
        setErrors({ eventCode: '展览代码已存在' });
      } else {
        alert(`${isEdit ? '更新' : '创建'}失败：${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/events')}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? '编辑展览' : '创建展览'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? '修改展览信息' : '填写展览基本信息'}
          </p>
        </div>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">基本信息</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 展览名称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                展览名称 *
              </label>
              <input
                type="text"
                value={formData.eventName}
                onChange={(e) => handleInputChange('eventName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.eventName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="输入展览名称"
                maxLength={200}
              />
              {errors.eventName && (
                <p className="mt-1 text-sm text-red-600">{errors.eventName}</p>
              )}
            </div>

            {/* 展览代码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Code className="w-4 h-4 inline mr-2" />
                展览代码 *
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
              />
              {errors.eventCode && (
                <p className="mt-1 text-sm text-red-600">{errors.eventCode}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">只能包含大写字母和数字</p>
            </div>

            {/* 开始日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                开始日期 *
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

            {/* 结束日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                结束日期 *
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

            {/* 展览地点 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                展览地点
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入展览地点"
                maxLength={300}
              />
            </div>

            {/* 状态 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                展览状态
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="upcoming">即将开始</option>
                <option value="active">进行中</option>
                <option value="ended">已结束</option>
              </select>
            </div>
          </div>

          {/* 展览描述 */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              展览描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="输入展览描述信息..."
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            取消
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? '保存中...' : (isEdit ? '更新展览' : '创建展览')}
          </button>
        </div>
      </form>
    </div>
  );
};

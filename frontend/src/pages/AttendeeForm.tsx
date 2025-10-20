import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Users, Mail, Phone, Building, User, Hash } from 'lucide-react';
import { useAppStore } from '../store';
import toast from "react-hot-toast";


export const AttendeeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentEvent, setLoading } = useAppStore();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    badgeNumber: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadAttendee(id);
    } else {
      generateBadgeNumber();
    }
  }, [isEdit, id]);

  const loadAttendee = async (attendeeId: string) => {
    try {
      setLoading(true);
      // 这里应该调用真实API
      // const attendee = await attendeeApi.getById(attendeeId);

      // 模拟数据
      const mockAttendee = {
        id: attendeeId,
        name: '王小明',
        email: 'wang@example.com',
        phone: '0912-345-678',
        company: 'ABC科技公司',
        title: 'PM',
        badgeNumber: 'B001'
      };

      setFormData({
        name: mockAttendee.name,
        email: mockAttendee.email,
        phone: mockAttendee.phone || '',
        company: mockAttendee.company || '',
        title: mockAttendee.title || '',
        badgeNumber: mockAttendee.badgeNumber || ''
      });
    } catch (error) {
      console.error('Failed to load attendee:', error);
    toast.error("載入参展者資訊失敗")
    } finally {
      setLoading(false);
    }
  };

  const generateBadgeNumber = () => {
    // 生成名牌号：B + 4位随机数字
    const badgeNumber = `B${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData(prev => ({ ...prev, badgeNumber }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // 清除该字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '請輸入參展人員姓名';
    }

    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!formData.badgeNumber.trim()) {
      newErrors.badgeNumber = '请输入名牌号';
    }

    if (formData.phone && !/^[\d\-\+\(\)\s]+$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的电话号码';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!currentEvent) {
      alert('请先选择活动');
      return;
    }

    setIsSubmitting(true);

    try {
      const attendeeData = {
        ...formData,
        eventId: currentEvent.id,
        qrCodeToken: `ATT${Date.now()}` // 生成QR码令牌
      };

      if (isEdit && id) {
        // 更新参展者
        // await attendeeApi.update(id, attendeeData);
        console.log('模拟更新参展者:', attendeeData);
        alert('参展者信息更新成功！');
      } else {
        // 创建参展者
        // await attendeeApi.create(attendeeData);
        console.log('模拟创建参展者:', attendeeData);
        alert('参展者添加成功！');
      }

      navigate('/attendees');
    } catch (error: any) {
      console.error('Failed to save attendee:', error);
      alert(`保存失败: ${error.message || '未知错误'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('确定要取消吗？未保存的更改将丢失。')) {
      navigate('/attendees');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/attendees')}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? '编辑参展者' : '添加参展者'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? '修改参展者信息' : '填写参展者基本信息'}
          </p>
        </div>
      </div>

      {/* 表单卡片 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-gray-600" />
              基本信息
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 姓名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="请输入参展者姓名"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* 邮箱 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="请输入邮箱地址"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* 电话 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  电话
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="请输入电话号码"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* 名牌号 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  名牌号 <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="badgeNumber"
                      value={formData.badgeNumber}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.badgeNumber ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="请输入名牌号"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={generateBadgeNumber}
                    className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 text-sm"
                  >
                    生成
                  </button>
                </div>
                {errors.badgeNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.badgeNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* 公司信息 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-gray-600" />
              公司信息
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 公司名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  公司名称
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入公司名称"
                />
              </div>

              {/* 职位 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  职位
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入职位"
                />
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
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
              <span>{isSubmitting ? '保存中...' : (isEdit ? '更新' : '创建')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 提示信息 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Users className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">温馨提示</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 姓名和邮箱为必填项，用于生成QR码和联系</li>
              <li>• 名牌号用于现场识别，建议使用唯一编号</li>
              <li>• 电话和公司信息可选填，便于后续联系</li>
              <li>• 保存后系统将自动生成专属QR码</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

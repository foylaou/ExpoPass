import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Building2, MapPin, DollarSign, Hash, Users, Calendar } from 'lucide-react';
import { useAppStore } from '../store';


export const BoothForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentEvent, setLoading } = useAppStore();
  // const { events } = useEventStore();
  const events: Array<{id: string; name: string}> = []; // 模拟空数组，实际应使用useEventStore
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    boothNumber: '',
    boothName: '',
    location: '',
    eventId: currentEvent?.id || '',
    company: '',
    description: '',
    area: '',
    price: '',
    category: '',
    status: 'available' as 'available' | 'reserved' | 'occupied'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['科技', '艺术', '服装', '家具', '食品', '其他'];
  const locations = ['A馆一层', 'A馆二层', 'B馆一层', 'B馆二层', 'C馆一层', 'C馆二层'];

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
      // 这里应该调用真实API
      // const booth = await apiRequest('GET', `/booths/${boothId}`);

      // 模拟数据
      const mockBooth = {
        id: boothId,
        boothNumber: 'A01',
        boothName: '科技展示区A01',
        location: 'A馆一层',
        eventId: '1',
        company: 'Tech Corp',
        description: '展示最新的人工智能技术和解决方案',
        area: '36',
        price: '5000',
        category: '科技',
        status: 'occupied' as const
      };

      setFormData({
        boothNumber: mockBooth.boothNumber,
        boothName: mockBooth.boothName,
        location: mockBooth.location,
        eventId: mockBooth.eventId,
        company: mockBooth.company || '',
        description: mockBooth.description || '',
        area: mockBooth.area,
        price: mockBooth.price,
        category: mockBooth.category,
        status: mockBooth.status
      });
    } catch (error) {
      console.error('Failed to load booth:', error);
      alert('加载摊位信息失败');
    } finally {
      setLoading(false);
    }
  };

  const generateBoothNumber = () => {
    // 生成摊位号：区域 + 编号
    const areas = ['A', 'B', 'C'];
    const area = areas[Math.floor(Math.random() * areas.length)];
    const number = Math.floor(1 + Math.random() * 99).toString().padStart(2, '0');
    const boothNumber = `${area}${number}`;
    setFormData(prev => ({ ...prev, boothNumber }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // 清除该字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.boothNumber.trim()) {
      newErrors.boothNumber = '请输入摊位号';
    }

    if (!formData.boothName.trim()) {
      newErrors.boothName = '请输入摊位名称';
    }

    if (!formData.location.trim()) {
      newErrors.location = '请选择位置';
    }

    if (!formData.eventId) {
      newErrors.eventId = '请选择关联活动';
    }

    if (!formData.category) {
      newErrors.category = '请选择分类';
    }

    if (!formData.area.trim()) {
      newErrors.area = '请输入面积';
    } else if (isNaN(Number(formData.area)) || Number(formData.area) <= 0) {
      newErrors.area = '请输入有效的面积数值';
    }

    if (!formData.price.trim()) {
      newErrors.price = '请输入租金';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = '请输入有效的租金数值';
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
      const boothData = {
        ...formData,
        area: Number(formData.area),
        price: Number(formData.price),
        qrCodeToken: `BOOTH${Date.now()}` // 生成QR码令牌
      };

      if (isEdit && id) {
        // 更新摊位
        // await apiRequest('PUT', `/booths/${id}`, boothData);
        console.log('模拟更新摊位:', boothData);
        alert('摊位信息更新成功！');
      } else {
        // 创建摊位
        // await apiRequest('POST', '/booths', boothData);
        console.log('模拟创建摊位:', boothData);
        alert('摊位添加成功！');
      }

      navigate('/booths');
    } catch (error: any) {
      console.error('Failed to save booth:', error);
      alert(`保存失败: ${error.message || '未知错误'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('确定要取消吗？未保存的更改将丢失。')) {
      navigate('/booths');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/booths')}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? '编辑摊位' : '添加摊位'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? '修改摊位信息' : '填写摊位基本信息'}
          </p>
        </div>
      </div>

      {/* 表单卡片 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-gray-600" />
              基本信息
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 摊位号 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  摊位号 <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="boothNumber"
                      value={formData.boothNumber}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.boothNumber ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="如：A01"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={generateBoothNumber}
                    className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 text-sm"
                  >
                    生成
                  </button>
                </div>
                {errors.boothNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.boothNumber}</p>
                )}
              </div>

              {/* 摊位名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  摊位名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="boothName"
                  value={formData.boothName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.boothName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="摊位名称"
                />
                {errors.boothName && (
                  <p className="mt-1 text-sm text-red-600">{errors.boothName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* 分类 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分类 <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">选择分类</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
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
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.location ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">选择位置</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* 面积 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  面积(平方米) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.area ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="36"
                  min="1"
                />
                {errors.area && (
                  <p className="mt-1 text-sm text-red-600">{errors.area}</p>
                )}
              </div>

              {/* 租金 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  租金(元) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="5000"
                    min="0"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>
            </div>
          </div>

          {/* 关联信息 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-600" />
              关联信息
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 关联活动 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  关联活动 <span className="text-red-500">*</span>
                </label>
                <select
                  name="eventId"
                  value={formData.eventId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.eventId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">选择活动</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                </select>
                {errors.eventId && (
                  <p className="mt-1 text-sm text-red-600">{errors.eventId}</p>
                )}
              </div>

              {/* 状态 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  状态
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="available">可用</option>
                  <option value="reserved">已预订</option>
                  <option value="occupied">已占用</option>
                </select>
              </div>
            </div>

            {/* 参展商 */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                参展商
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="参展商名称"
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
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="摊位描述信息..."
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length}/200</p>
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
          <Building2 className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">温馨提示</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 摊位号和名称为必填项，用于识别和展示</li>
              <li>• 面积和租金用于统计和计费管理</li>
              <li>• 位置信息便于参展者查找</li>
              <li>• 保存后系统将自动生成摊位专属QR码</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

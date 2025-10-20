import { useState } from 'react';
import {
  Download,
  FileText,
  BarChart3,
  Users,
  Building2,
  Calendar,
  Filter,
  Printer,
  Mail
} from 'lucide-react';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'attendee' | 'booth' | 'scan' | 'event';
  format: 'excel' | 'pdf' | 'csv';
}

export const Reports = () => {
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'csv'>('excel');
  const [isGenerating, setIsGenerating] = useState(false);

  // 報表模板
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'attendee-list',
      name: '參展者名單',
      description: '完整的參展者信息列表，包含聯系方式和公司信息',
      icon: Users,
      category: 'attendee',
      format: 'excel'
    },
    {
      id: 'booth-list',
      name: '攤位清單',
      description: '所有攤位的詳細信息和分配狀態',
      icon: Building2,
      category: 'booth',
      format: 'excel'
    },
    {
      id: 'scan-summary',
      name: '掃描統計報表',
      description: '展覽期間的掃描統計和訪客流量分析',
      icon: BarChart3,
      category: 'scan',
      format: 'pdf'
    },
    {
      id: 'daily-report',
      name: '每日活動報告',
      description: '按日期統計的訪客數量和活動熱度',
      icon: Calendar,
      category: 'scan',
      format: 'pdf'
    },
    {
      id: 'popular-booths',
      name: '熱門攤位排行',
      description: '根據訪問量排名的攤位人氣報告',
      icon: BarChart3,
      category: 'booth',
      format: 'pdf'
    },
    {
      id: 'visitor-journey',
      name: '訪客路徑分析',
      description: '參展者的移動路徑和停留時間分析',
      icon: Users,
      category: 'scan',
      format: 'pdf'
    },
    {
      id: 'contact-export',
      name: '聯系人導出',
      description: '可導入CRM系統的聯系人信息',
      icon: Mail,
      category: 'attendee',
      format: 'csv'
    },
    {
      id: 'event-summary',
      name: '展覽總結報告',
      description: '完整的展覽活動總結和數據分析',
      icon: FileText,
      category: 'event',
      format: 'pdf'
    }
  ];

  // 按類別分組
  const groupedTemplates = reportTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, ReportTemplate[]>);

  const categoryNames = {
    attendee: '參展者報表',
    booth: '攤位報表',
    scan: '掃描分析',
    event: '展覽報表'
  };

  // 處理模板選擇
  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  // 全選/取消全選
  const toggleSelectAll = () => {
    if (selectedTemplates.length === reportTemplates.length) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates(reportTemplates.map(t => t.id));
    }
  };

  // 生成報表
  const generateReports = async () => {
    if (selectedTemplates.length === 0) {
      alert('請選擇至少一個報表模板');
      return;
    }

    setIsGenerating(true);

    try {
      // 模擬報表生成
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 模擬下載
      selectedTemplates.forEach(templateId => {
        const template = reportTemplates.find(t => t.id === templateId);
        if (template) {
          const link = document.createElement('a');
          link.href = '#'; // 這里應該是實際的下載鏈接
          link.download = `${template.name}_${new Date().toISOString().split('T')[0]}.${template.format}`;
          console.log(`下載報表: ${link.download}`);
        }
      });

      alert(`成功生成 ${selectedTemplates.length} 個報表！`);
      setSelectedTemplates([]);

    } catch (error) {
      console.error('生成報表失敗:', error);
      alert('生成報表失敗，請稍后重試');
    } finally {
      setIsGenerating(false);
    }
  };

  // 發送郵件
  const sendReportsEmail = () => {
    if (selectedTemplates.length === 0) {
      alert('請選擇要發送的報表');
      return;
    }

    const emailSubject = encodeURIComponent('展覽報表');
    const emailBody = encodeURIComponent(
      `請查收以下展覽報表：\n\n${selectedTemplates.map(id => 
        reportTemplates.find(t => t.id === id)?.name
      ).join('\n')}`
    );

    window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
  };

  return (
    <div className="space-y-6">
      {/* 頁面頭部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">報表中心</h1>
          <p className="text-gray-600">生成和導出各類數據報表</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={sendReportsEmail}
            disabled={selectedTemplates.length === 0}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Mail className="w-4 h-4 mr-2" />
            郵件發送
          </button>

          <button
            onClick={generateReports}
            disabled={selectedTemplates.length === 0 || isGenerating}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? '生成中...' : `生成報表 (${selectedTemplates.length})`}
          </button>
        </div>
      </div>

      {/* 篩選選項 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">篩選選項</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 日期范圍 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              開始日期
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              結束日期
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={dateRange.startDate}
            />
          </div>

          {/* 導出格式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              默認格式
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as typeof exportFormat)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="excel">Excel (.xlsx)</option>
              <option value="pdf">PDF (.pdf)</option>
              <option value="csv">CSV (.csv)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 全選選項 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={selectedTemplates.length === reportTemplates.length}
            onChange={toggleSelectAll}
            className="mr-3 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            全選報表模板 ({selectedTemplates.length}/{reportTemplates.length})
          </span>
        </label>
      </div>

      {/* 報表模板 */}
      {Object.entries(groupedTemplates).map(([category, templates]) => (
        <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {categoryNames[category as keyof typeof categoryNames]}
            </h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => {
                const Icon = template.icon;
                const isSelected = selectedTemplates.includes(template.id);

                return (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleTemplate(template.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTemplate(template.id)}
                          className="mr-3 rounded border-gray-300 focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isSelected ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                        </div>
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>

                        <div className="flex items-center justify-between mt-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            template.format === 'excel' ? 'bg-green-100 text-green-800' :
                            template.format === 'pdf' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {template.format.toUpperCase()}
                          </span>

                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // 預覽功能
                                alert(`預覽 ${template.name}`);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded"
                              title="預覽"
                            >
                              <FileText className="w-4 h-4" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // 打印功能
                                alert(`打印 ${template.name}`);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded"
                              title="打印"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {/* 生成進度 */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">生成報表中</h3>
              <p className="text-gray-600">請稍候，正在生成 {selectedTemplates.length} 個報表...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

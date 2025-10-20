
export const TestDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">测试仪表板</h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-600">这是一个测试页面，用来验证路由是否正常工作。</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">总参展者</h3>
            <p className="text-2xl font-bold text-blue-900">1,250</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">总摊位数</h3>
            <p className="text-2xl font-bold text-green-900">120</p>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">扫描次数</h3>
            <p className="text-2xl font-bold text-purple-900">3,450</p>
          </div>
        </div>
      </div>
    </div>
  );
};
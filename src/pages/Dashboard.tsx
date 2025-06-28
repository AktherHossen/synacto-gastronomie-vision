
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, ShoppingCart, Package, TrendingUp, Users, Receipt, Settings, Plus, LogOut } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const salesData = [
    { label: "Today's Sales", value: "€1,234.56", change: "+12.5%", trend: "up" },
    { label: "Orders Today", value: "47", change: "+8", trend: "up" },
    { label: "Average Order", value: "€26.27", change: "-2.1%", trend: "down" },
    { label: "Active Tables", value: "12/24", change: "50%", trend: "neutral" }
  ];

  const recentOrders = [
    { id: "#001", table: "Table 5", amount: "€45.80", status: "preparing", time: "14:32" },
    { id: "#002", table: "Table 2", amount: "€28.50", status: "ready", time: "14:28" },
    { id: "#003", table: "Table 8", amount: "€67.20", status: "served", time: "14:25" },
    { id: "#004", table: "Takeaway", amount: "€15.90", status: "paid", time: "14:20" }
  ];

  const navigationItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/menu', icon: Receipt, label: 'Menu' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/reports', icon: TrendingUp, label: 'Reports' },
    { path: '/staff', icon: Users, label: 'Staff' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'served': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex items-center h-16 px-6 border-b">
          <h1 className="text-xl font-bold" style={{ color: '#6B2CF5' }}>Synacto POS</h1>
        </div>
        
        <nav className="mt-6">
          <div className="px-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                  style={isActive ? { backgroundColor: '#6B2CF5' } : {}}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start text-gray-600 hover:text-gray-800"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Abmelden
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
            <p className="text-sm text-gray-600">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              className="text-white font-medium"
              style={{ backgroundColor: '#406AFF' }}
              onClick={() => navigate('/orders')}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Sales Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {salesData.map((metric, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{metric.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                  <div className={`text-sm mt-1 ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.change} from yesterday
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="font-medium text-gray-900">{order.id}</div>
                          <div className="text-sm text-gray-600">{order.table}</div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-sm text-gray-600">{order.time}</div>
                          <div className="font-medium text-gray-900">{order.amount}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/orders')}>
                    View All Orders
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Today's Summary */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start text-white" 
                    style={{ backgroundColor: '#6B2CF5' }}
                    onClick={() => navigate('/orders')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Order
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/menu')}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Add Menu Item
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/reports')}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Restaurant Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Today's Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Today's Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Sales</span>
                    <span className="font-medium">€1,234.56</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Orders</span>
                    <span className="font-medium">47</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cash Sales</span>
                    <span className="font-medium">€456.30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Card Sales</span>
                    <span className="font-medium">€778.26</span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between font-medium">
                    <span>Net Revenue</span>
                    <span style={{ color: '#6B2CF5' }}>€1,041.23</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Phone, Mail, LogOut, ChevronRight, ShoppingBag } from 'lucide-react';

const MyOrdersPage: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = React.useState(true);

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login?returnTo=/my-orders');
    }
  }, [user, loading, navigate]);

  React.useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { supabase } = await import('@/lib/supabaseClient');
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setOrders(data || []);
    }
    setLoadingOrders(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 font-sans">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl">
              👋
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">My Account</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {user.phone}
                </span>
                {user.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {user.email}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="text-slate-600 hover:text-red-600 hover:bg-red-50 border-slate-200">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Orders Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-slate-500" />
            Order History
          </h2>

          {loadingOrders ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-slate-200">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-slate-500">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No orders yet</h3>
              <p className="text-slate-500 mb-6 max-w-xs mx-auto">Looks like you haven't placed any orders yet. Start shopping to see them here!</p>
              <Button onClick={() => navigate('/')} size="lg" className="bg-primary hover:bg-primary/90">
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/order/${order.id}`)}
                  className="group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                >
                  {/* Hover Accent Line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    
                    {/* Left: Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-lg text-slate-800">Order #{order.id}</span>
                        <Badge className={`text-xs px-2 py-0.5 capitalize shadow-none ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                          order.status === 'packed' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' :
                          'bg-amber-100 text-amber-700 hover:bg-amber-100'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      
                      {/* Item Preview Text */}
                      <p className="text-sm text-slate-600 mt-3 line-clamp-1">
                        {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} • Total: <span className="font-semibold text-slate-900">₹{order.total_amount.toLocaleString()}</span>
                      </p>
                    </div>

                    {/* Right: Action Arrow */}
                    <div className="flex items-center text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
                      View Details <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;

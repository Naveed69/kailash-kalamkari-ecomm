import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, ChevronRight, ShoppingBag, LogOut } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50/50 py-8 font-sans">
      <div className="container mx-auto px-4 max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-slate-700" />
            My Orders
          </h1>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-slate-500 text-sm">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">No orders yet</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Start shopping to see your orders here!</p>
              <Button onClick={() => navigate('/')} className="bg-slate-900 hover:bg-slate-800 text-white">
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/order/${order.id}`)}
                  className="group bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                >
                  {/* Image Thumbnail (First Item) */}
                  <div className="h-16 w-16 bg-slate-100 rounded-md overflow-hidden flex-shrink-0 border border-slate-100">
                    {order.items && order.items.length > 0 ? (
                      <img 
                        src={order.items[0].image} 
                        alt="Order Item" 
                        className="h-full w-full object-cover"
                        onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900 text-sm">Order #{order.id}</span>
                      <Badge className={`text-[10px] px-1.5 py-0 capitalize shadow-none font-normal border ${
                        order.status === 'paid' ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100' :
                        order.status === 'in_packing' ? 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100' :
                        order.status === 'packed' ? 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100' :
                        order.status === 'shipped' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100' :
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100' :
                        'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100'
                      }`}>
                        {order.status === 'in_packing' ? 'Processing' : order.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-slate-600">
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 mt-2 sm:mt-0">
                    <span className="font-bold text-slate-900 text-sm">₹{order.total_amount.toLocaleString()}</span>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
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

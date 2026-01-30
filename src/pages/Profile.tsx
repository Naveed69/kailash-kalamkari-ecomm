import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Package, 
  LogOut, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const ProfilePage = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login?returnTo=/profile');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || !user) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="mb-6 shadow-sm border-slate-200 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-[#D49217] to-[#F2C94C] opacity-90" />
          <CardContent className="relative pt-0 pb-8 px-8">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6 gap-6">
              <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-slate-100 text-2xl text-slate-400">
                  <User />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {user.user_metadata?.full_name || 'Valued Customer'}
                </h2>
                <p className="text-slate-500 font-medium">Member since {new Date(user.created_at).getFullYear()}</p>
              </div>
              <Badge variant="secondary" className="mb-3 bg-green-100 text-green-700 hover:bg-green-100">
                <ShieldCheck className="w-3 h-3 mr-1" /> Verified Account
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="flex items-center gap-2 text-slate-900 font-medium">
                  <Mail className="w-4 h-4 text-[#D49217]" />
                  {user.email || 'Not provided'}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
                <div className="flex items-center gap-2 text-slate-900 font-medium">
                  <Phone className="w-4 h-4 text-[#D49217]" />
                  {user.phone || user.user_metadata?.phone || 'Not provided'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-slate-200"
            onClick={() => navigate('/my-orders')}
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">My Orders</h3>
                  <p className="text-sm text-slate-500">Track, return, or buy again</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow border-slate-200">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Saved Addresses</h3>
                  <p className="text-sm text-slate-500">Manage delivery locations</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;

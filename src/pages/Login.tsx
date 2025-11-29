import React from 'react';
import { PhoneLogin } from '@/components/auth/PhoneLogin';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Kailash Kalamkari</h1>
          <p className="text-slate-600">Welcome back! Login to continue</p>
        </div>
        
        <PhoneLogin 
          onSuccess={() => {
            // Redirect to checkout or home
            const returnTo = new URLSearchParams(window.location.search).get('returnTo');
            navigate(returnTo || '/');
          }}
        />
        
        <p className="text-center text-xs text-slate-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

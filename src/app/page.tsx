'use client';

import { useApp } from '@/lib/context';
import LoginScreen from '@/components/LoginScreen';
import Dashboard from '@/components/Dashboard';
import AdminPanel from '@/components/AdminPanel';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Aguardar um pouco para garantir hidratação completa
    const timer = setTimeout(() => {
      setIsClient(true);
      setIsLoading(false);
    }, 150);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return <HomeContent />;
}

function HomeContent() {
  const { user } = useApp();

  if (!user) {
    return <LoginScreen />;
  }

  // Se o usuário é super admin (login ADM), mostrar painel administrativo
  if (user.role === 'super_admin' && user.type === 'admin') {
    return <AdminPanel />;
  }

  // Caso contrário, mostrar dashboard normal
  return <Dashboard />;
}
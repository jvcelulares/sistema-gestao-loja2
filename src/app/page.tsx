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
    // CORREÇÃO: Aguardar hidratação completa e verificar se o DOM está pronto
    const checkReady = () => {
      if (typeof window !== 'undefined' && document.readyState === 'complete') {
        setIsClient(true);
        // Aguardar um pouco mais para garantir que tudo está estável
        setTimeout(() => {
          setIsLoading(false);
        }, 200);
      } else {
        setTimeout(checkReady, 100);
      }
    };
    
    checkReady();
  }, []);

  // Loading screen mais robusto
  if (isLoading || !isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando sistema...</p>
        </div>
      </div>
    );
  }

  return <HomeContent />;
}

function HomeContent() {
  const { user } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // CORREÇÃO: Aguardar um pouco mais para garantir estabilidade
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

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
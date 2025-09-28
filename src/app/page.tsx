'use client';

import { useApp } from '@/lib/context';
import LoginScreen from '@/components/LoginScreen';
import Dashboard from '@/components/Dashboard';
import AdminPanel from '@/components/AdminPanel';

export default function Home() {
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
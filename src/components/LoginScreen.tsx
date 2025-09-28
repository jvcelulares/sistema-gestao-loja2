'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Eye, EyeOff, Lock, User, AlertCircle, Shield } from 'lucide-react';

export default function LoginScreen() {
  const { login, loginAttempts } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState<'normal' | 'admin'>('normal');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (loginAttempts >= 5) {
      setError('Muitas tentativas de login. Tente novamente mais tarde.');
      setIsLoading(false);
      return;
    }

    const success = await login(username, password, loginType);
    
    if (!success) {
      setError(`Credenciais inválidas. Tentativas restantes: ${5 - loginAttempts - 1}`);
    }
    
    setIsLoading(false);
  };

  const isBlocked = loginAttempts >= 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/2cf7f496-b445-42ba-a46a-c1897a68cb13.jpg" 
            alt="JV Celulares Logo" 
            className="w-24 h-24 object-contain mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white mb-2">
            Sistema de Gestão
          </h1>
          <p className="text-gray-400">
            JV Celulares e Acessórios
          </p>
        </div>

        {/* Seletor de Tipo de Login */}
        <div className="mb-6">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLoginType('normal')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginType === 'normal'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Login Normal
            </button>
            <button
              type="button"
              onClick={() => setLoginType('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginType === 'admin'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              Login ADM
            </button>
          </div>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Nome de usuário
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Digite seu usuário"
                  required
                  disabled={isBlocked}
                />
              </div>
            </div>

            {/* Campo Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Digite sua senha"
                  required
                  disabled={isBlocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isBlocked}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={isLoading || isBlocked}
              className={`w-full py-3 px-4 rounded-lg font-medium focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                loginType === 'admin'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-500'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Entrando...
                </div>
              ) : isBlocked ? (
                'Bloqueado por segurança'
              ) : (
                `Entrar ${loginType === 'admin' ? 'como Administrador' : 'no Sistema'}`
              )}
            </button>
          </form>

          {/* Informações de Segurança */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p>Sistema protegido por criptografia</p>
              <p className="mt-1">Tentativas de login: {loginAttempts}/5</p>
              {loginType === 'admin' && (
                <p className="mt-2 text-red-600 font-medium">
                  Acesso administrativo - Permissões elevadas
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>© 2024 JV Celulares e Acessórios</p>
          <p>Sistema de Gestão Empresarial</p>
        </div>
      </div>
    </div>
  );
}
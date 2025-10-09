'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Eye, EyeOff, Lock, User, AlertCircle, Shield, Mail, ArrowLeft } from 'lucide-react';

export default function LoginScreen() {
  const { login, loginAttempts, dadosLoja, resetUserPassword } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState<'normal' | 'admin'>('normal');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (loginAttempts >= 5) {
      setError('Muitas tentativas de login. Tente novamente mais tarde.');
      setIsLoading(false);
      return;
    }

    console.log('🔄 Tentando login...', { username, loginType });
    const success = await login(username, password, loginType);
    
    if (!success) {
      if (loginType === 'normal') {
        setError(`Credenciais inválidas. Verifique se você está usando o e-mail e senha corretos criados pelo administrador. Tentativas restantes: ${5 - loginAttempts - 1}`);
      } else {
        setError(`Credenciais inválidas. Tentativas restantes: ${5 - loginAttempts - 1}`);
      }
    } else {
      console.log('✅ Login realizado com sucesso');
    }
    
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResetMessage('');
    setError('');

    const result = await resetUserPassword(resetEmail);
    
    if (result.success) {
      setResetMessage('E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.');
    } else {
      setError('Erro ao enviar e-mail de recuperação. Verifique o endereço informado.');
    }
    
    setIsLoading(false);
  };

  const isBlocked = loginAttempts >= 5;

  if (showResetPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            {dadosLoja?.logo ? (
              <img 
                src={dadosLoja.logo} 
                alt={`${dadosLoja.nome} Logo`} 
                className="w-24 h-24 object-contain mx-auto mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <img 
                  src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/05461a6e-4fe1-4e1b-ad89-d7559c22d517.png" 
                  alt="Gestão Phone Logo" 
                  className="w-24 h-24 object-contain"
                />
              </div>
            )}
            <h1 className="text-2xl font-bold text-white mb-2">
              Recuperar Senha
            </h1>
            <p className="text-gray-400">
              Digite seu e-mail para receber as instruções
            </p>
          </div>

          {/* Formulário de Recuperação */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* Campo Email */}
              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Digite seu e-mail"
                    required
                  />
                </div>
              </div>

              {/* Mensagem de Sucesso */}
              {resetMessage && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{resetMessage}</span>
                </div>
              )}

              {/* Mensagem de Erro */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Botões */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enviando...
                    </div>
                  ) : (
                    'Enviar E-mail de Recuperação'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetEmail('');
                    setResetMessage('');
                    setError('');
                  }}
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          {dadosLoja?.logo ? (
            <img 
              src={dadosLoja.logo} 
              alt={`${dadosLoja.nome} Logo`} 
              className="w-24 h-24 object-contain mx-auto mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/05461a6e-4fe1-4e1b-ad89-d7559c22d517.png" 
                alt="Gestão Phone Logo" 
                className="w-24 h-24 object-contain"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold text-white mb-2">
            Sistema de Gestão
          </h1>
          <p className="text-gray-400">
            {dadosLoja?.nome || 'Gestão Phone'}
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
                {loginType === 'normal' ? 'E-mail ou Nome de usuário' : 'Nome de usuário'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder={loginType === 'normal' ? 'Digite seu e-mail ou usuário' : 'Digite seu usuário'}
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

            {/* Link Esqueci Senha */}
            {loginType === 'normal' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowResetPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

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
              {loginType === 'normal' && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-xs font-medium mb-1">
                    🔄 Sincronização Automática com Supabase
                  </p>
                  <p className="text-blue-700 text-xs">
                    • Usuários criados pelo administrador podem fazer login aqui<br/>
                    • Use o e-mail e senha fornecidos pelo administrador<br/>
                    • Dados são salvos automaticamente no Supabase
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>© 2024 {dadosLoja?.nome || 'Gestão Phone'}</p>
          <p>Sistema de Gestão Empresarial</p>
        </div>
      </div>
    </div>
  );
}
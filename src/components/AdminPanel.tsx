'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { 
  Users, 
  Plus, 
  Trash2, 
  Calendar,
  Clock,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  LogOut,
  Shield,
  Mail,
  Key
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { User } from '@/lib/types';

export default function AdminPanel() {
  const { user, logout, usuarios, criarUsuario, removerUsuario } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isCreating, setIsCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState('');

  const resetForm = () => {
    setFormData({});
    setShowForm(false);
    setCreateMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateMessage('');
    
    try {
      // Calcular data de expiração
      const agora = new Date();
      const diasAcesso = parseInt(formData.tempoAcesso);
      const dataExpiracao = new Date(agora.getTime() + (diasAcesso * 24 * 60 * 60 * 1000));
      
      const novoUsuario = {
        username: formData.username,
        password: formData.password,
        role: formData.tipoUsuario === 'admin' ? 'admin' as const : 'user' as const,
        type: 'normal' as const,
        tempoAcesso: diasAcesso,
        expiresAt: dataExpiracao.toISOString(),
        dadosLoja: undefined // Usuários novos não terão dados da loja principal
      };
      
      await criarUsuario(novoUsuario);
      
      // Verificar se é um e-mail (indicando criação no Supabase)
      if (formData.username.includes('@')) {
        setCreateMessage('Usuário criado com sucesso no Supabase! O usuário pode fazer login com essas credenciais.');
      } else {
        setCreateMessage('Usuário criado com sucesso localmente!');
      }
      
      // Limpar formulário após 3 segundos
      setTimeout(() => {
        resetForm();
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setCreateMessage('Erro ao criar usuário. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  const calcularDiasRestantes = (expiresAt: string) => {
    const agora = new Date();
    const expiracao = new Date(expiresAt);
    const diferenca = expiracao.getTime() - agora.getTime();
    const dias = Math.ceil(diferenca / (1000 * 3600 * 24));
    return dias;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-gray-600">Gerenciamento de usuários e sistema</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Bem-vindo, {user?.username}</p>
                <p className="text-xs text-red-600">Super Administrador</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Sair do sistema"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                  <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {usuarios.filter(u => {
                      if (!u.expiresAt) return true;
                      return new Date() <= new Date(u.expiresAt);
                    }).length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuários Expirados</p>
                  <p className="text-2xl font-bold text-red-600">
                    {usuarios.filter(u => {
                      if (!u.expiresAt) return false;
                      return new Date() > new Date(u.expiresAt);
                    }).length}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Informações sobre Integração Supabase */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Integração com Supabase Auth</h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <p><strong>✅ Usuários com E-mail:</strong> Criados automaticamente no Supabase Auth para login seguro</p>
                  <p><strong>🔐 Autenticação:</strong> Usuários podem fazer login com e-mail e senha do Supabase</p>
                  <p><strong>🏪 Dados Independentes:</strong> Cada usuário tem seu próprio perfil de loja isolado</p>
                  <p><strong>📱 Recuperação de Senha:</strong> Disponível para usuários com e-mail cadastrado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gerenciamento de Usuários */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Gerenciamento de Usuários</h2>
                  <p className="text-gray-600">Crie e gerencie contas de usuários do sistema</p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Novo Usuário
                </button>
              </div>
            </div>

            {/* Lista de usuários */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tempo de Acesso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuarios.map(usuario => {
                    const diasRestantes = usuario.expiresAt ? calcularDiasRestantes(usuario.expiresAt) : null;
                    const isExpired = diasRestantes !== null && diasRestantes <= 0;
                    const isSupabaseUser = usuario.username.includes('@');
                    
                    return (
                      <tr key={usuario.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                {usuario.username}
                                {isSupabaseUser && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Supabase
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">ID: {usuario.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            usuario.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {usuario.role === 'admin' ? 'Administrador' : 'Usuário Comum'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(new Date(usuario.createdAt))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {usuario.tempoAcesso ? `${usuario.tempoAcesso} dias` : 'Indefinido'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isExpired ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Expirado
                            </span>
                          ) : diasRestantes !== null ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Clock className="w-3 h-3 mr-1" />
                              {diasRestantes} dias restantes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ativo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => removerUsuario(usuario.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Remover usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {usuarios.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Nenhum usuário criado ainda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal de novo usuário */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Criar Novo Usuário</h3>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail ou Nome de Usuário
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        required
                        value={formData.username || ''}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="usuario@email.com ou nome_usuario"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Use e-mail para criar no Supabase Auth (recomendado)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="password"
                        required
                        value={formData.password || ''}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Digite a senha"
                        minLength={6}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Mínimo 6 caracteres
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Usuário</label>
                    <select
                      required
                      value={formData.tipoUsuario || ''}
                      onChange={(e) => setFormData({...formData, tipoUsuario: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="user">Usuário Comum</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de Acesso</label>
                    <select
                      required
                      value={formData.tempoAcesso || ''}
                      onChange={(e) => setFormData({...formData, tempoAcesso: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Selecione o período</option>
                      <option value="1">1 dia</option>
                      <option value="7">7 dias</option>
                      <option value="15">15 dias</option>
                      <option value="30">30 dias</option>
                      <option value="90">90 dias</option>
                      <option value="365">1 ano</option>
                    </select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Integração Supabase:</p>
                        <p>• E-mail: Criado no Supabase Auth + perfil de loja independente</p>
                        <p>• Nome: Criado apenas localmente</p>
                        <p>• Cada usuário terá dados completamente isolados</p>
                      </div>
                    </div>
                  </div>

                  {/* Mensagem de Sucesso/Erro */}
                  {createMessage && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${
                      createMessage.includes('sucesso') 
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{createMessage}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      disabled={isCreating}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isCreating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Criando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Criar Usuário
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
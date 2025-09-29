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
  Shield
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { User } from '@/lib/types';

export default function AdminPanel() {
  const { user, logout, usuarios, criarUsuario, removerUsuario } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const resetForm = () => {
    setFormData({});
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      dadosLoja: undefined // Usuários novos não terão dados da JV Celulares
    };
    
    criarUsuario(novoUsuario);
    resetForm();
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
                    
                    return (
                      <tr key={usuario.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{usuario.username}</div>
                            <div className="text-sm text-gray-500">ID: {usuario.id}</div>
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
            <div className="bg-white rounded-xl max-w-md w-full">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome de Usuário</label>
                    <input
                      type="text"
                      required
                      value={formData.username || ''}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Digite o nome de usuário"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                    <input
                      type="password"
                      required
                      value={formData.password || ''}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Digite a senha"
                    />
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
                    </select>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Importante:</p>
                        <p>Cada usuário terá seu próprio perfil individual com dados exclusivos. Usuários comuns não terão acesso aos dados da JV Celulares.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Criar Usuário
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
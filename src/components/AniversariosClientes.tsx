'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { Gift, Phone, Calendar, MessageCircle, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AniversariosClientes() {
  const { clientes } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroMes, setFiltroMes] = useState('todos');

  // Calcular aniversariantes
  const aniversariantes = useMemo(() => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    
    return clientes
      .filter(cliente => cliente.dataNascimento)
      .map(cliente => {
        const dataNascimento = new Date(cliente.dataNascimento!);
        const mesAniversario = dataNascimento.getMonth();
        const diaAniversario = dataNascimento.getDate();
        
        // Calcular próximo aniversário
        const proximoAniversario = new Date(hoje.getFullYear(), mesAniversario, diaAniversario);
        if (proximoAniversario < hoje) {
          proximoAniversario.setFullYear(hoje.getFullYear() + 1);
        }
        
        const diasParaAniversario = Math.ceil((proximoAniversario.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...cliente,
          proximoAniversario,
          diasParaAniversario,
          mesAniversario,
          diaAniversario,
          idade: hoje.getFullYear() - dataNascimento.getFullYear()
        };
      })
      .filter(cliente => {
        // Filtro por busca
        const matchSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cliente.telefone.includes(searchTerm);
        
        // Filtro por mês
        let matchMes = true;
        if (filtroMes !== 'todos') {
          if (filtroMes === 'este_mes') {
            matchMes = cliente.mesAniversario === mesAtual;
          } else if (filtroMes === 'proximo_mes') {
            const proximoMes = (mesAtual + 1) % 12;
            matchMes = cliente.mesAniversario === proximoMes;
          } else if (filtroMes === 'proximos_30_dias') {
            matchMes = cliente.diasParaAniversario <= 30;
          }
        }
        
        return matchSearch && matchMes;
      })
      .sort((a, b) => a.diasParaAniversario - b.diasParaAniversario);
  }, [clientes, searchTerm, filtroMes]);

  const abrirWhatsApp = (telefone: string, nome: string) => {
    const numeroLimpo = telefone.replace(/\D/g, '');
    const mensagem = `Olá ${nome}! 🎉 A equipe da ${clientes.length > 0 ? 'nossa loja' : 'Gestão Phone'} gostaria de parabenizá-lo(a) pelo seu aniversário! Desejamos muito sucesso, saúde e felicidade! 🎂🎈`;
    const mensagemCodificada = encodeURIComponent(mensagem);
    window.open(`https://wa.me/55${numeroLimpo}?text=${mensagemCodificada}`, '_blank');
  };

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Aniversários de Clientes</h2>
          <p className="text-gray-600">Acompanhe e parabenize seus clientes nos aniversários</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Gift className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Este Mês</p>
              <p className="text-2xl font-bold text-blue-600">
                {aniversariantes.filter(c => c.mesAniversario === new Date().getMonth()).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Próximos 7 Dias</p>
              <p className="text-2xl font-bold text-green-600">
                {aniversariantes.filter(c => c.diasParaAniversario <= 7).length}
              </p>
            </div>
            <Gift className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Próximos 30 Dias</p>
              <p className="text-2xl font-bold text-orange-600">
                {aniversariantes.filter(c => c.diasParaAniversario <= 30).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cadastrados</p>
              <p className="text-2xl font-bold text-purple-600">
                {clientes.filter(c => c.dataNascimento).length}
              </p>
            </div>
            <Phone className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os períodos</option>
              <option value="este_mes">Este mês</option>
              <option value="proximo_mes">Próximo mês</option>
              <option value="proximos_30_dias">Próximos 30 dias</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Aniversariantes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Lista de Aniversariantes ({aniversariantes.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aniversário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Idade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dias Restantes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {aniversariantes.map(cliente => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{cliente.nome}</div>
                      <div className="text-sm text-gray-500">{cliente.telefone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {cliente.diaAniversario} de {meses[cliente.mesAniversario]}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(cliente.proximoAniversario)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cliente.idade} anos
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      cliente.diasParaAniversario === 0
                        ? 'bg-red-100 text-red-800'
                        : cliente.diasParaAniversario <= 7
                        ? 'bg-yellow-100 text-yellow-800'
                        : cliente.diasParaAniversario <= 30
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {cliente.diasParaAniversario === 0 
                        ? 'Hoje!' 
                        : cliente.diasParaAniversario === 1
                        ? 'Amanhã'
                        : `${cliente.diasParaAniversario} dias`
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => abrirWhatsApp(cliente.telefone, cliente.nome)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center gap-2 transition-colors"
                      title="Enviar parabéns via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Parabenizar
                    </button>
                  </td>
                </tr>
              ))}
              
              {aniversariantes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Gift className="w-12 h-12 text-gray-300" />
                      <p>Nenhum aniversariante encontrado</p>
                      <p className="text-sm">Verifique os filtros ou cadastre as datas de nascimento dos clientes</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dicas */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Gift className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Dicas para Relacionamento com Clientes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Parabenize seus clientes no aniversário para fortalecer o relacionamento</li>
              <li>• Considere oferecer descontos especiais para aniversariantes</li>
              <li>• Use o WhatsApp para enviar mensagens personalizadas</li>
              <li>• Mantenha as datas de nascimento sempre atualizadas no cadastro</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
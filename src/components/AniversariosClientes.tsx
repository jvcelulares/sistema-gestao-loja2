'use client';

import { useMemo } from 'react';
import { useApp } from '@/lib/context';
import { Calendar, Gift, Phone } from 'lucide-react';
import { AniversarianteCliente } from '@/lib/types';

export default function AniversariosClientes() {
  const { clientes } = useApp();

  const aniversariantes = useMemo(() => {
    const hoje = new Date();
    const aniversariantesProximos: AniversarianteCliente[] = [];

    clientes.forEach(cliente => {
      if (!cliente.dataNascimento) return;

      const nascimento = new Date(cliente.dataNascimento);
      const anoAtual = hoje.getFullYear();
      
      // Criar data do aniversário no ano atual
      const aniversarioEsteAno = new Date(anoAtual, nascimento.getMonth(), nascimento.getDate());
      
      // Se já passou este ano, considerar o próximo ano
      let proximoAniversario = aniversarioEsteAno;
      if (aniversarioEsteAno < hoje) {
        proximoAniversario = new Date(anoAtual + 1, nascimento.getMonth(), nascimento.getDate());
      }

      // Calcular dias até o aniversário
      const diasAte = Math.ceil((proximoAniversario.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      // Incluir apenas aniversários nos próximos 90 dias (3 meses)
      if (diasAte <= 90) {
        aniversariantesProximos.push({
          id: cliente.id,
          nome: cliente.nome,
          telefone: cliente.telefone,
          dataNascimento: cliente.dataNascimento,
          diasParaAniversario: diasAte
        });
      }
    });

    // Ordenar por dias até o aniversário
    return aniversariantesProximos.sort((a, b) => a.diasParaAniversario - b.diasParaAniversario);
  }, [clientes]);

  const abrirWhatsApp = (telefone: string, nome: string) => {
    const numeroLimpo = telefone.replace(/\D/g, '');
    const mensagem = encodeURIComponent(`Olá ${nome}! 🎉 A equipe da JV Celulares gostaria de parabenizá-lo pelo seu aniversário! Desejamos muito sucesso e felicidades! 🎂🎈`);
    window.open(`https://wa.me/55${numeroLimpo}?text=${mensagem}`, '_blank');
  };

  const formatarData = (data: string) => {
    const nascimento = new Date(data);
    return nascimento.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  };

  const getStatusAniversario = (dias: number) => {
    if (dias === 0) return { texto: 'Hoje!', cor: 'bg-red-100 text-red-800', icone: '🎉' };
    if (dias === 1) return { texto: 'Amanhã', cor: 'bg-orange-100 text-orange-800', icone: '🎂' };
    if (dias <= 7) return { texto: `Em ${dias} dias`, cor: 'bg-yellow-100 text-yellow-800', icone: '📅' };
    if (dias <= 30) return { texto: `Em ${dias} dias`, cor: 'bg-blue-100 text-blue-800', icone: '🗓️' };
    return { texto: `Em ${dias} dias`, cor: 'bg-gray-100 text-gray-800', icone: '📆' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Aniversários de Clientes</h2>
        <p className="text-gray-600">Próximos aniversários nos próximos 3 meses</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aniversários Hoje</p>
              <p className="text-2xl font-bold text-red-600">
                {aniversariantes.filter(a => a.diasParaAniversario === 0).length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <Gift className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Esta Semana</p>
              <p className="text-2xl font-bold text-orange-600">
                {aniversariantes.filter(a => a.diasParaAniversario <= 7).length}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Este Mês</p>
              <p className="text-2xl font-bold text-blue-600">
                {aniversariantes.filter(a => a.diasParaAniversario <= 30).length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de aniversariantes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Próximos Aniversários</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {aniversariantes.length > 0 ? (
            aniversariantes.map(aniversariante => {
              const status = getStatusAniversario(aniversariante.diasParaAniversario);
              
              return (
                <div key={aniversariante.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{status.icone}</div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{aniversariante.nome}</h4>
                        <p className="text-sm text-gray-500">
                          Aniversário: {formatarData(aniversariante.dataNascimento)}
                        </p>
                        <p className="text-sm text-gray-500">{aniversariante.telefone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.cor}`}>
                        {status.texto}
                      </span>
                      
                      <button
                        onClick={() => abrirWhatsApp(aniversariante.telefone, aniversariante.nome)}
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                        title="Enviar parabéns via WhatsApp"
                      >
                        <Phone className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>Nenhum aniversário nos próximos 3 meses</p>
              <p className="text-sm mt-1">Cadastre as datas de nascimento dos clientes para ver os aniversários aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
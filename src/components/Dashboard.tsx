'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Wrench, 
  BarChart3, 
  Settings,
  LogOut,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  Phone,
  MapPin,
  FileText,
  Download,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Gift,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DADOS_LOJA } from '@/lib/constants';
import { Produto, Cliente, Venda, Manutencao } from '@/lib/types';
import { generateSalePDF, generateMaintenancePDF, downloadPDF } from '@/lib/pdfGenerator';
import { exportSalesToCSV, exportMaintenancesToCSV, exportCustomersToCSV, exportProductsToCSV } from '@/lib/csvExporter';
import AniversariosClientes from '@/components/AniversariosClientes';
import Suporte from '@/components/Suporte';

type ActiveModule = 'dashboard' | 'estoque' | 'vendas' | 'clientes' | 'manutencao' | 'relatorios' | 'configuracoes' | 'aniversarios' | 'suporte';

export default function Dashboard() {
  const { user, logout, produtos, vendas, manutencoes, clientes, adicionarProduto, adicionarCliente, adicionarVenda, adicionarManutencao, atualizarProduto, removerProduto, atualizarVenda, removerVenda, atualizarManutencao, removerManutencao } = useApp();
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [dateFilter, setDateFilter] = useState('hoje');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dadosLoja, setDadosLoja] = useState(DADOS_LOJA);
  const [editandoDadosLoja, setEditandoDadosLoja] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('todos');
  const [selectedDate, setSelectedDate] = useState('');

  // Estados para formulários
  const [formData, setFormData] = useState<any>({});

  // Cálculos do dashboard com lucros
  const dashboardData = useMemo(() => {
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    // Filtrar vendas por data
    const vendasHoje = vendas.filter(venda => {
      const dataVenda = new Date(venda.createdAt);
      return dataVenda.toDateString() === hoje.toDateString();
    });
    
    const vendasSemana = vendas.filter(venda => {
      const dataVenda = new Date(venda.createdAt);
      return dataVenda >= inicioSemana;
    });
    
    const vendasMes = vendas.filter(venda => {
      const dataVenda = new Date(venda.createdAt);
      return dataVenda >= inicioMes;
    });

    // Filtrar por forma de pagamento se selecionado
    const filtrarPorPagamento = (vendasArray: Venda[]) => {
      if (paymentFilter === 'todos') return vendasArray;
      return vendasArray.filter(venda => venda.formaPagamento === paymentFilter);
    };

    const vendasHojeFiltradas = filtrarPorPagamento(vendasHoje);
    const vendasSemanaFiltradas = filtrarPorPagamento(vendasSemana);
    const vendasMesFiltradas = filtrarPorPagamento(vendasMes);
    
    // Calcular faturamento
    const faturamentoHoje = vendasHojeFiltradas.reduce((total, venda) => total + venda.total, 0);
    const faturamentoSemana = vendasSemanaFiltradas.reduce((total, venda) => total + venda.total, 0);
    const faturamentoMes = vendasMesFiltradas.reduce((total, venda) => total + venda.total, 0);
    
    // Calcular lucros (faturamento - custos)
    const calcularLucro = (vendasArray: Venda[]) => {
      return vendasArray.reduce((lucroTotal, venda) => {
        const lucroVenda = venda.itens.reduce((lucroItem, item) => {
          const produto = produtos.find(p => p.id === item.produtoId);
          if (produto) {
            const custoTotal = produto.precoCusto * item.quantidade;
            const receitaTotal = item.subtotal;
            return lucroItem + (receitaTotal - custoTotal);
          }
          return lucroItem;
        }, 0);
        return lucroTotal + lucroVenda;
      }, 0);
    };

    const lucroHoje = calcularLucro(vendasHojeFiltradas);
    const lucroSemana = calcularLucro(vendasSemanaFiltradas);
    const lucroMes = calcularLucro(vendasMesFiltradas);
    
    // Produtos com estoque baixo
    const produtosEstoqueBaixo = produtos.filter(produto => 
      produto.quantidadeEstoque <= produto.estoqueMinimo
    );
    
    // Manutenções pendentes
    const manutencoesPendentes = manutencoes.filter(manutencao => 
      manutencao.status === 'recebido' || manutencao.status === 'em_andamento'
    );

    // Vendas por data específica
    const vendasDataEspecifica = selectedDate ? vendas.filter(venda => {
      const dataVenda = new Date(venda.createdAt);
      const dataFiltro = new Date(selectedDate);
      return dataVenda.toDateString() === dataFiltro.toDateString();
    }) : [];
    
    return {
      faturamentoHoje,
      faturamentoSemana,
      faturamentoMes,
      lucroHoje,
      lucroSemana,
      lucroMes,
      vendasHoje: vendasHojeFiltradas.length,
      vendasSemana: vendasSemanaFiltradas.length,
      vendasMes: vendasMesFiltradas.length,
      produtosEstoqueBaixo,
      manutencoesPendentes,
      totalClientes: clientes.length,
      totalProdutos: produtos.length,
      vendasDataEspecifica
    };
  }, [vendas, produtos, manutencoes, clientes, paymentFilter, selectedDate]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'estoque', label: 'Estoque', icon: Package },
    { id: 'vendas', label: 'Vendas', icon: ShoppingCart },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'manutencao', label: 'Manutenção', icon: Wrench },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'aniversarios', label: 'Aniversários', icon: Gift },
    { id: 'suporte', label: 'Suporte', icon: HelpCircle },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  // Funções auxiliares
  const resetForm = () => {
    setFormData({});
    setShowForm(false);
    setEditingItem(null);
  };

  const abrirWhatsAppCliente = (telefone: string) => {
    const numeroLimpo = telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${numeroLimpo}`, '_blank');
  };

  // Função para gerar comprovante de venda em PDF
  const gerarComprovantePDF = (venda: Venda) => {
    try {
      // Converter dados da venda para o formato esperado pelo gerador de PDF
      const saleData = {
        id: venda.id,
        customerName: venda.nomeCliente,
        customerPhone: venda.telefoneCliente,
        items: venda.itens.map(item => ({
          name: item.nomeProduto,
          quantity: item.quantidade,
          price: item.precoUnitario,
        })),
        total: venda.total,
        paymentMethod: venda.formaPagamento,
        date: venda.createdAt,
        seller: venda.vendedor
      };

      const storeInfo = {
        name: dadosLoja.nome,
        cnpj: dadosLoja.cnpj,
        address: dadosLoja.endereco,
        phone: dadosLoja.telefone
      };

      const doc = generateSalePDF(saleData, storeInfo);
      downloadPDF(doc, `comprovante_venda_${venda.id}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar comprovante PDF. Tente novamente.');
    }
  };

  // Função para gerar comprovante de manutenção em PDF
  const gerarComprovanteManutencaoPDF = (manutencao: Manutencao) => {
    try {
      const maintenanceData = {
        id: manutencao.id,
        customerName: manutencao.nomeCliente,
        customerPhone: manutencao.telefoneCliente,
        deviceName: manutencao.nomeAparelho,
        deviceModel: manutencao.modeloAparelho,
        imei: manutencao.imeiAparelho,
        defect: manutencao.defeitoInformado,
        service: manutencao.descricaoServico || 'Serviço de manutenção',
        status: manutencao.status,
        price: manutencao.valorServico,
        paymentMethod: manutencao.formaPagamento,
        entryDate: manutencao.createdAt,
        deliveryDate: manutencao.dataPrevistaEntrega
      };

      const storeInfo = {
        name: dadosLoja.nome,
        cnpj: dadosLoja.cnpj,
        address: dadosLoja.endereco,
        phone: dadosLoja.telefone
      };

      const doc = generateMaintenancePDF(maintenanceData, storeInfo);
      downloadPDF(doc, `comprovante_manutencao_${manutencao.id}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF de manutenção:', error);
      alert('Erro ao gerar comprovante de manutenção PDF. Tente novamente.');
    }
  };

  // Função para exportar relatórios em CSV
  const exportarRelatorioCSV = (tipo: 'vendas' | 'manutencoes' | 'clientes' | 'produtos', periodo?: string) => {
    try {
      let dadosParaExportar: any[] = [];
      let nomeArquivo = '';

      switch (tipo) {
        case 'vendas':
          dadosParaExportar = vendas;
          if (periodo) {
            const hoje = new Date();
            let dataInicio: Date;
            
            switch (periodo) {
              case 'hoje':
                dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
                dadosParaExportar = vendas.filter(v => new Date(v.createdAt) >= dataInicio);
                nomeArquivo = `vendas_hoje_${formatDate(hoje).replace(/\//g, '-')}.csv`;
                break;
              case '7dias':
                dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
                dadosParaExportar = vendas.filter(v => new Date(v.createdAt) >= dataInicio);
                nomeArquivo = `vendas_ultimos_7_dias.csv`;
                break;
              case '15dias':
                dataInicio = new Date(hoje.getTime() - 15 * 24 * 60 * 60 * 1000);
                dadosParaExportar = vendas.filter(v => new Date(v.createdAt) >= dataInicio);
                nomeArquivo = `vendas_ultimos_15_dias.csv`;
                break;
              case '30dias':
                dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
                dadosParaExportar = vendas.filter(v => new Date(v.createdAt) >= dataInicio);
                nomeArquivo = `vendas_ultimos_30_dias.csv`;
                break;
              default:
                nomeArquivo = 'vendas_completo.csv';
            }
          } else {
            nomeArquivo = 'vendas_completo.csv';
          }
          exportSalesToCSV(dadosParaExportar, nomeArquivo);
          break;
          
        case 'manutencoes':
          exportMaintenancesToCSV(manutencoes, 'manutencoes.csv');
          break;
          
        case 'clientes':
          exportCustomersToCSV(clientes, 'clientes.csv');
          break;
          
        case 'produtos':
          exportProductsToCSV(produtos, 'produtos.csv');
          break;
      }
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    switch (activeModule) {
      case 'estoque':
        if (editingItem) {
          atualizarProduto(editingItem.id, formData);
        } else {
          const novoProduto: Produto = {
            id: Date.now().toString(),
            ...formData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          adicionarProduto(novoProduto);
        }
        break;
      case 'clientes':
        const novoCliente: Cliente = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        adicionarCliente(novoCliente);
        break;
      case 'vendas':
        if (editingItem) {
          atualizarVenda(editingItem.id, formData);
        } else {
          const novaVenda: Venda = {
            id: Date.now().toString(),
            ...formData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          adicionarVenda(novaVenda);
        }
        break;
      case 'manutencao':
        if (editingItem) {
          atualizarManutencao(editingItem.id, formData);
        } else {
          const novaManutencao: Manutencao = {
            id: Date.now().toString(),
            ...formData,
            status: 'recebido',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          adicionarManutencao(novaManutencao);
        }
        break;
    }
    
    resetForm();
  };

  const renderDashboardContent = () => (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Visão geral do seu negócio</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Filtro por forma de pagamento */}
          <select 
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="todos">Todas as formas</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="cartao_credito">Cartão de Crédito</option>
            <option value="cartao_debito">Cartão de Débito</option>
            <option value="pix">PIX</option>
          </select>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="hoje">Hoje</option>
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mês</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Faturamento {dateFilter === 'hoje' ? 'Hoje' : dateFilter === 'semana' ? 'Semana' : 'Mês'}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(dateFilter === 'hoje' ? dashboardData.faturamentoHoje : dateFilter === 'semana' ? dashboardData.faturamentoSemana : dashboardData.faturamentoMes)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lucro {dateFilter === 'hoje' ? 'Hoje' : dateFilter === 'semana' ? 'Semana' : 'Mês'}</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(dateFilter === 'hoje' ? dashboardData.lucroHoje : dateFilter === 'semana' ? dashboardData.lucroSemana : dashboardData.lucroMes)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendas {dateFilter === 'hoje' ? 'Hoje' : dateFilter === 'semana' ? 'Semana' : 'Mês'}</p>
              <p className="text-2xl font-bold text-gray-900">
                {dateFilter === 'hoje' ? dashboardData.vendasHoje : dateFilter === 'semana' ? dashboardData.vendasSemana : dashboardData.vendasMes}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.totalClientes}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Calendário de vendas e filtros de data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendário de Vendas</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar Data</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            {selectedDate && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900">
                  Vendas em {formatDate(new Date(selectedDate))}: {dashboardData.vendasDataEspecifica.length}
                </p>
                <p className="text-sm text-gray-600">
                  Total: {formatCurrency(dashboardData.vendasDataEspecifica.reduce((total, venda) => total + venda.total, 0))}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimas Vendas</h3>
          <div className="space-y-2">
            <button 
              onClick={() => setDateFilter('hoje')}
              className={`w-full text-left p-2 rounded-lg transition-colors ${dateFilter === 'hoje' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}
            >
              Vendas de hoje ({dashboardData.vendasHoje})
            </button>
            <button 
              onClick={() => setDateFilter('semana')}
              className={`w-full text-left p-2 rounded-lg transition-colors ${dateFilter === 'semana' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}
            >
              Vendas da semana ({dashboardData.vendasSemana})
            </button>
            <button 
              onClick={() => setDateFilter('mes')}
              className={`w-full text-left p-2 rounded-lg transition-colors ${dateFilter === 'mes' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}
            >
              Vendas do mês ({dashboardData.vendasMes})
            </button>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {(dashboardData.produtosEstoqueBaixo.length > 0 || dashboardData.manutencoesPendentes.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerta de Estoque Baixo */}
          {dashboardData.produtosEstoqueBaixo.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-yellow-800">Estoque Baixo</h3>
              </div>
              <div className="space-y-2">
                {dashboardData.produtosEstoqueBaixo.slice(0, 3).map(produto => (
                  <div key={produto.id} className="flex justify-between items-center text-sm">
                    <span className="text-yellow-700">{produto.nome}</span>
                    <span className="font-medium text-yellow-800">{produto.quantidadeEstoque} unidades</span>
                  </div>
                ))}
                {dashboardData.produtosEstoqueBaixo.length > 3 && (
                  <p className="text-sm text-yellow-600">
                    +{dashboardData.produtosEstoqueBaixo.length - 3} produtos com estoque baixo
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Manutenções Pendentes */}
          {dashboardData.manutencoesPendentes.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Wrench className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-800">Manutenções Pendentes</h3>
              </div>
              <div className="space-y-2">
                {dashboardData.manutencoesPendentes.slice(0, 3).map(manutencao => (
                  <div key={manutencao.id} className="flex justify-between items-center text-sm">
                    <span className="text-blue-700">{manutencao.nomeAparelho}</span>
                    <span className="font-medium text-blue-800 capitalize">{manutencao.status.replace('_', ' ')}</span>
                  </div>
                ))}
                {dashboardData.manutencoesPendentes.length > 3 && (
                  <p className="text-sm text-blue-600">
                    +{dashboardData.manutencoesPendentes.length - 3} manutenções pendentes
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gráfico de vendas (placeholder melhorado) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução de Vendas</h3>
        <div className="h-64 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">Gráfico de Evolução de Vendas</p>
            <p className="text-sm text-gray-400 mt-1">Visualização temporal das vendas será exibida aqui</p>
          </div>
        </div>
      </div>

      {/* Links Rápidos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setActiveModule('estoque')}
            className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Plus className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-700">Cadastrar Produto</span>
          </button>
          
          <button 
            onClick={() => setActiveModule('vendas')}
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Registrar Venda</span>
          </button>
          
          <button 
            onClick={() => setActiveModule('manutencao')}
            className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <Wrench className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Nova Manutenção</span>
          </button>
          
          <button 
            onClick={() => setActiveModule('relatorios')}
            className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <BarChart3 className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Ver Relatórios</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderEstoqueContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Estoque</h2>
          <p className="text-gray-600">Gerencie produtos, celulares e acessórios</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      {/* Barra de pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Pesquisar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Lista de produtos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {produtos
                .filter(produto => 
                  produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  produto.marca.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(produto => (
                <tr key={produto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                      <div className="text-sm text-gray-500">{produto.marca}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      produto.tipo === 'celular' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {produto.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${
                        produto.quantidadeEstoque <= produto.estoqueMinimo 
                          ? 'text-red-600' 
                          : 'text-gray-900'
                      }`}>
                        {produto.quantidadeEstoque}
                      </span>
                      {produto.quantidadeEstoque <= produto.estoqueMinimo && (
                        <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(produto.precoVenda)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(produto);
                          setFormData(produto);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removerProduto(produto.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingItem ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      type="text"
                      required
                      value={formData.nome || ''}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                    <input
                      type="text"
                      required
                      value={formData.marca || ''}
                      onChange={(e) => setFormData({...formData, marca: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      required
                      value={formData.tipo || ''}
                      onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="celular">Celular</option>
                      <option value="acessorio">Acessório</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                    <input
                      type="text"
                      required
                      value={formData.fornecedor || ''}
                      onChange={(e) => setFormData({...formData, fornecedor: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço de Custo</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.precoCusto || ''}
                      onChange={(e) => setFormData({...formData, precoCusto: parseFloat(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço de Venda</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.precoVenda || ''}
                      onChange={(e) => setFormData({...formData, precoVenda: parseFloat(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade em Estoque</label>
                    <input
                      type="number"
                      required
                      value={formData.quantidadeEstoque || ''}
                      onChange={(e) => setFormData({...formData, quantidadeEstoque: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo</label>
                    <input
                      type="number"
                      required
                      value={formData.estoqueMinimo || ''}
                      onChange={(e) => setFormData({...formData, estoqueMinimo: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Campos específicos para celular */}
                {formData.tipo === 'celular' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                      <input
                        type="text"
                        value={formData.modelo || ''}
                        onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Memória (GB)</label>
                      <input
                        type="text"
                        value={formData.memoria || ''}
                        onChange={(e) => setFormData({...formData, memoria: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IMEI 1</label>
                      <input
                        type="text"
                        value={formData.imei1 || ''}
                        onChange={(e) => setFormData({...formData, imei1: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IMEI 2</label>
                      <input
                        type="text"
                        value={formData.imei2 || ''}
                        onChange={(e) => setFormData({...formData, imei2: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                      <input
                        type="text"
                        value={formData.cor || ''}
                        onChange={(e) => setFormData({...formData, cor: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Condição</label>
                      <select
                        value={formData.condicao || ''}
                        onChange={(e) => setFormData({...formData, condicao: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Selecione</option>
                        <option value="novo">Novo</option>
                        <option value="seminovo">Seminovo</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    rows={3}
                    value={formData.descricao || ''}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
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
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingItem ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderVendasContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Vendas</h2>
          <p className="text-gray-600">Registre e acompanhe suas vendas</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Venda
        </button>
      </div>

      {/* Lista de vendas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produtos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendas.map(venda => (
                <tr key={venda.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(new Date(venda.createdAt))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{venda.nomeCliente}</div>
                    <div className="text-sm text-gray-500">{venda.telefoneCliente}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {venda.itens.length} item(s)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(venda.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {venda.vendedor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setEditingItem(venda);
                          setFormData(venda);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removerVenda(venda.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => gerarComprovantePDF(venda)}
                        className="text-green-600 hover:text-green-900"
                        title="Gerar comprovante PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de nova venda */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingItem ? 'Editar Venda' : 'Nova Venda'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seleção de cliente */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Cliente</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Selecionar Cliente</label>
                      <select
                        value={formData.clienteId || ''}
                        onChange={(e) => {
                          const cliente = clientes.find(c => c.id === e.target.value);
                          if (cliente) {
                            setFormData({
                              ...formData,
                              clienteId: cliente.id,
                              nomeCliente: cliente.nome,
                              telefoneCliente: cliente.telefone
                            });
                          } else {
                            setFormData({
                              ...formData,
                              clienteId: '',
                              nomeCliente: '',
                              telefoneCliente: ''
                            });
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecione um cliente ou digite manualmente</option>
                        {clientes.map(cliente => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nome} - {cliente.telefone}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
                      <input
                        type="text"
                        required
                        value={formData.nomeCliente || ''}
                        onChange={(e) => setFormData({...formData, nomeCliente: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <input
                        type="tel"
                        value={formData.telefoneCliente || ''}
                        onChange={(e) => setFormData({...formData, telefoneCliente: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Dados da venda */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
                    <select
                      required
                      value={formData.vendedor || ''}
                      onChange={(e) => setFormData({...formData, vendedor: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione o vendedor</option>
                      <option value="João">João</option>
                      <option value="Gabriel">Gabriel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                    <select
                      required
                      value={formData.formaPagamento || ''}
                      onChange={(e) => setFormData({...formData, formaPagamento: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartao_credito">Cartão de Crédito</option>
                      <option value="cartao_debito">Cartão de Débito</option>
                      <option value="pix">PIX</option>
                    </select>
                  </div>
                </div>

                {/* Produtos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
                  <select
                    value={formData.produtoId || ''}
                    onChange={(e) => {
                      const produto = produtos.find(p => p.id === e.target.value);
                      if (produto) {
                        setFormData({
                          ...formData, 
                          produtoId: produto.id,
                          nomeProduto: produto.nome,
                          precoUnitario: produto.precoVenda,
                          quantidade: 1,
                          total: produto.precoVenda,
                          itens: [{
                            produtoId: produto.id,
                            nomeProduto: produto.nome,
                            quantidade: 1,
                            precoUnitario: produto.precoVenda,
                            desconto: 0,
                            subtotal: produto.precoVenda
                          }]
                        });
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um produto</option>
                    {produtos.filter(p => p.quantidadeEstoque > 0).map(produto => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome} - {formatCurrency(produto.precoVenda)} (Estoque: {produto.quantidadeEstoque})
                      </option>
                    ))}
                  </select>
                </div>

                {formData.produtoId && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.quantidade || 1}
                        onChange={(e) => {
                          const quantidade = parseInt(e.target.value);
                          const subtotal = (formData.precoUnitario - (formData.desconto || 0)) * quantidade;
                          setFormData({
                            ...formData, 
                            quantidade,
                            total: subtotal,
                            itens: [{
                              ...formData.itens[0],
                              quantidade,
                              subtotal
                            }]
                          });
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Desconto (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.desconto || 0}
                        onChange={(e) => {
                          const desconto = parseFloat(e.target.value) || 0;
                          const subtotal = (formData.precoUnitario - desconto) * formData.quantidade;
                          setFormData({
                            ...formData, 
                            desconto,
                            total: subtotal,
                            itens: [{
                              ...formData.itens[0],
                              desconto,
                              subtotal
                            }]
                          });
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                      <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-lg font-semibold">
                        {formatCurrency(formData.total || 0)}
                      </div>
                    </div>
                  </div>
                )}

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
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingItem ? 'Atualizar Venda' : 'Finalizar Venda'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderClientesContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Clientes</h2>
          <p className="text-gray-600">Cadastre e gerencie seus clientes</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {/* Barra de pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Pesquisar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Lista de clientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cadastro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientes
                .filter(cliente => 
                  cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  cliente.telefone.includes(searchTerm) ||
                  cliente.documento.includes(searchTerm)
                )
                .map(cliente => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{cliente.nome}</div>
                      <div className="text-sm text-gray-500">{cliente.endereco}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cliente.telefone}</div>
                    <div className="text-sm text-gray-500">{cliente.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cliente.documento}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(new Date(cliente.createdAt))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => abrirWhatsAppCliente(cliente.telefone)}
                        className="text-green-600 hover:text-green-900"
                        title="Abrir WhatsApp"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de novo cliente */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Novo Cliente</h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={formData.nome || ''}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF/RG</label>
                    <input
                      type="text"
                      required
                      value={formData.documento || ''}
                      onChange={(e) => setFormData({...formData, documento: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      type="tel"
                      required
                      value={formData.telefone || ''}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                    <input
                      type="text"
                      value={formData.cep || ''}
                      onChange={(e) => setFormData({...formData, cep: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                    <input
                      type="text"
                      value={formData.endereco || ''}
                      onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                    <input
                      type="date"
                      value={formData.dataNascimento || ''}
                      onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Como conheceu a loja?</label>
                    <select
                      value={formData.comoConheceu || ''}
                      onChange={(e) => setFormData({...formData, comoConheceu: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Selecione</option>
                      <option value="indicacao">Indicação</option>
                      <option value="redes_sociais">Redes Sociais</option>
                      <option value="google">Google</option>
                      <option value="passando_na_rua">Passando na rua</option>
                      <option value="outros">Outros</option>
                    </select>
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
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Salvar Cliente
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderManutencaoContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Manutenções</h2>
          <p className="text-gray-600">Gerencie serviços e reparos</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Manutenção
        </button>
      </div>

      {/* Lista de manutenções */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aparelho</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Defeito</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {manutencoes.map(manutencao => (
                <tr key={manutencao.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{manutencao.nomeCliente}</div>
                      <div className="text-sm text-gray-500">{manutencao.telefoneCliente}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{manutencao.nomeAparelho}</div>
                      <div className="text-sm text-gray-500">{manutencao.modeloAparelho}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {manutencao.defeitoInformado}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      manutencao.status === 'concluido' 
                        ? 'bg-green-100 text-green-800' 
                        : manutencao.status === 'em_andamento'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {manutencao.status === 'recebido' && <Clock className="w-3 h-3 mr-1" />}
                      {manutencao.status === 'em_andamento' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {manutencao.status === 'concluido' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {manutencao.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(manutencao.valorServico)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setEditingItem(manutencao);
                          setFormData(manutencao);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removerManutencao(manutencao.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => gerarComprovanteManutencaoPDF(manutencao)}
                        className="text-green-600 hover:text-green-900"
                        title="Gerar comprovante PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de nova manutenção */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingItem ? 'Editar Manutenção' : 'Nova Manutenção'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Seleção de cliente */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Cliente</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Selecionar Cliente</label>
                      <select
                        value={formData.clienteId || ''}
                        onChange={(e) => {
                          const cliente = clientes.find(c => c.id === e.target.value);
                          if (cliente) {
                            setFormData({
                              ...formData,
                              clienteId: cliente.id,
                              nomeCliente: cliente.nome,
                              telefoneCliente: cliente.telefone
                            });
                          } else {
                            setFormData({
                              ...formData,
                              clienteId: '',
                              nomeCliente: '',
                              telefoneCliente: ''
                            });
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Selecione um cliente ou digite manualmente</option>
                        {clientes.map(cliente => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nome} - {cliente.telefone}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
                      <input
                        type="text"
                        required
                        value={formData.nomeCliente || ''}
                        onChange={(e) => setFormData({...formData, nomeCliente: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <input
                        type="tel"
                        required
                        value={formData.telefoneCliente || ''}
                        onChange={(e) => setFormData({...formData, telefoneCliente: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Dados do aparelho */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Dados do Aparelho</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Aparelho</label>
                      <input
                        type="text"
                        required
                        value={formData.nomeAparelho || ''}
                        onChange={(e) => setFormData({...formData, nomeAparelho: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                      <input
                        type="text"
                        required
                        value={formData.modeloAparelho || ''}
                        onChange={(e) => setFormData({...formData, modeloAparelho: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IMEI</label>
                      <input
                        type="text"
                        value={formData.imeiAparelho || ''}
                        onChange={(e) => setFormData({...formData, imeiAparelho: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chip/Cartão de Memória</label>
                      <input
                        type="text"
                        value={formData.chipCartao || ''}
                        onChange={(e) => setFormData({...formData, chipCartao: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Dados do serviço */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Defeito Informado</label>
                    <textarea
                      rows={3}
                      required
                      value={formData.defeitoInformado || ''}
                      onChange={(e) => setFormData({...formData, defeitoInformado: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Serviço</label>
                    <textarea
                      rows={3}
                      value={formData.descricaoServico || ''}
                      onChange={(e) => setFormData({...formData, descricaoServico: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Serviço</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.valorServico || ''}
                      onChange={(e) => setFormData({...formData, valorServico: parseFloat(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                    <select
                      value={formData.formaPagamento || ''}
                      onChange={(e) => setFormData({...formData, formaPagamento: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Selecione</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartao_credito">Cartão de Crédito</option>
                      <option value="cartao_debito">Cartão de Débito</option>
                      <option value="pix">PIX</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Prevista de Entrega</label>
                    <input
                      type="date"
                      value={formData.dataPrevistaEntrega || ''}
                      onChange={(e) => setFormData({...formData, dataPrevistaEntrega: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {editingItem && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={formData.status || ''}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="recebido">Recebido</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="concluido">Concluído</option>
                        <option value="entregue">Entregue</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                  )}
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
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingItem ? 'Atualizar Manutenção' : 'Salvar Manutenção'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRelatoriosContent = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h2>
        <p className="text-gray-600">Acompanhe o desempenho do seu negócio</p>
      </div>

      {/* Cards de relatórios com lucros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Vendas Diárias</h3>
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-2">
            {formatCurrency(dashboardData.faturamentoHoje)}
          </p>
          <p className="text-sm text-gray-500 mb-1">{dashboardData.vendasHoje} vendas hoje</p>
          <p className="text-sm text-green-600 font-medium">
            Lucro: {formatCurrency(dashboardData.lucroHoje)}
          </p>
          <div className="mt-4 space-y-2">
            <button 
              onClick={() => exportarRelatorioCSV('vendas', 'hoje')}
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Vendas Mensais</h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600 mb-2">
            {formatCurrency(dashboardData.faturamentoMes)}
          </p>
          <p className="text-sm text-gray-500 mb-1">{dashboardData.vendasMes} vendas este mês</p>
          <p className="text-sm text-green-600 font-medium">
            Lucro: {formatCurrency(dashboardData.lucroMes)}
          </p>
          <div className="mt-4 space-y-2">
            <button 
              onClick={() => exportarRelatorioCSV('vendas', '30dias')}
              className="w-full bg-green-50 hover:bg-green-100 text-green-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Histórico Completo</h3>
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600 mb-2">{vendas.length}</p>
          <p className="text-sm text-gray-500">Total de vendas registradas</p>
          <div className="mt-4 space-y-2">
            <button 
              onClick={() => exportarRelatorioCSV('vendas')}
              className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {/* Opções de exportação por período */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Exportar Relatórios por Período</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => exportarRelatorioCSV('vendas', 'hoje')}
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Download className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Vendas de Hoje</span>
          </button>
          
          <button 
            onClick={() => exportarRelatorioCSV('vendas', '7dias')}
            className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Download className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-700">Últimos 7 Dias</span>
          </button>
          
          <button 
            onClick={() => exportarRelatorioCSV('vendas', '15dias')}
            className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <Download className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Últimos 15 Dias</span>
          </button>
          
          <button 
            onClick={() => exportarRelatorioCSV('vendas', '30dias')}
            className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <Download className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Últimos 30 Dias</span>
          </button>
        </div>
      </div>

      {/* Outros relatórios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Outros Relatórios</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => exportarRelatorioCSV('manutencoes')}
            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <Wrench className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <div className="font-medium text-purple-700">Manutenções</div>
              <div className="text-sm text-purple-600">{manutencoes.length} registros</div>
            </div>
          </button>
          
          <button 
            onClick={() => exportarRelatorioCSV('clientes')}
            className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <Users className="w-6 h-6 text-orange-600" />
            <div className="text-left">
              <div className="font-medium text-orange-700">Clientes</div>
              <div className="text-sm text-orange-600">{clientes.length} registros</div>
            </div>
          </button>
          
          <button 
            onClick={() => exportarRelatorioCSV('produtos')}
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Package className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <div className="font-medium text-green-700">Produtos</div>
              <div className="text-sm text-green-600">{produtos.length} registros</div>
            </div>
          </button>
        </div>
      </div>

      {/* Filtros de relatório com formas de pagamento */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros Avançados</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Todos</option>
              <option value="João">João</option>
              <option value="Gabriel">Gabriel</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Todas</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="pix">PIX</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Todas</option>
              <option value="celular">Celulares</option>
              <option value="acessorio">Acessórios</option>
              <option value="manutencao">Manutenções</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Filter className="w-4 h-4" />
            Aplicar Filtros
          </button>
        </div>
      </div>

      {/* Gráfico de vendas melhorado */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução de Vendas</h3>
        <div className="h-64 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">Gráfico de Evolução de Vendas</p>
            <p className="text-sm text-gray-400 mt-1">Visualização temporal das vendas e lucros</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfiguracoes = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
        <p className="text-gray-600">Gerencie as configurações da loja</p>
      </div>

      {/* Dados da Loja */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Dados da Loja</h3>
          <button
            onClick={() => setEditandoDadosLoja(!editandoDadosLoja)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Edit className="w-4 h-4" />
            {editandoDadosLoja ? 'Cancelar' : 'Editar'}
          </button>
        </div>

        {editandoDadosLoja ? (
          <form onSubmit={(e) => {
            e.preventDefault();
            setEditandoDadosLoja(false);
            // Aqui você salvaria os dados da loja
          }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja</label>
                <input
                  type="text"
                  value={dadosLoja.nome}
                  onChange={(e) => setDadosLoja({...dadosLoja, nome: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                <input
                  type="text"
                  value={dadosLoja.cnpj}
                  onChange={(e) => setDadosLoja({...dadosLoja, cnpj: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="tel"
                  value={dadosLoja.telefone}
                  onChange={(e) => setDadosLoja({...dadosLoja, telefone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={dadosLoja.email}
                  onChange={(e) => setDadosLoja({...dadosLoja, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input
                  type="text"
                  value={dadosLoja.endereco}
                  onChange={(e) => setDadosLoja({...dadosLoja, endereco: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditandoDadosLoja(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nome da Loja</label>
                <p className="text-lg text-gray-900">{dadosLoja.nome}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">CNPJ</label>
                <p className="text-lg text-gray-900">{dadosLoja.cnpj}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Telefone</label>
                <p className="text-lg text-gray-900">{dadosLoja.telefone}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">E-mail</label>
                <p className="text-lg text-gray-900">{dadosLoja.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Endereço</label>
                <p className="text-lg text-gray-900">{dadosLoja.endereco}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Configurações do Sistema */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações do Sistema</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Alertas de Estoque Baixo</h4>
              <p className="text-sm text-gray-500">Receber notificações quando produtos estiverem com estoque baixo</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Backup Automático</h4>
              <p className="text-sm text-gray-500">Fazer backup automático dos dados diariamente</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Notificações por WhatsApp</h4>
              <p className="text-sm text-gray-500">Enviar comprovantes de venda via WhatsApp</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return renderDashboardContent();
      case 'estoque':
        return renderEstoqueContent();
      case 'vendas':
        return renderVendasContent();
      case 'clientes':
        return renderClientesContent();
      case 'manutencao':
        return renderManutencaoContent();
      case 'relatorios':
        return renderRelatoriosContent();
      case 'aniversarios':
        return <AniversariosClientes />;
      case 'suporte':
        return <Suporte />;
      case 'configuracoes':
        return renderConfiguracoes();
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/2cf7f496-b445-42ba-a46a-c1897a68cb13.jpg" 
              alt="JV Celulares Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900">JV Celulares</h1>
              <p className="text-sm text-gray-500">Sistema de Gestão</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id as ActiveModule)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive 
                      ? 'bg-green-100 text-green-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-green-700">
                  {user?.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Sair do sistema"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900 capitalize">
                {activeModule === 'dashboard' ? 'Dashboard' : 
                 activeModule === 'aniversarios' ? 'Aniversários de Clientes' :
                 activeModule === 'suporte' ? 'Suporte Técnico' :
                 activeModule}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">{formatDate(new Date())}</p>
                <p className="text-xs text-gray-500">{dadosLoja.nome}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {renderModuleContent()}
        </main>
      </div>
    </div>
  );
}
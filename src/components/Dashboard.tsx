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
  HelpCircle,
  Shield,
  Upload,
  Image,
  UserCheck
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Produto, Cliente, Venda, Manutencao, TermoGarantia, Vendedor } from '@/lib/types';
import { generateSalePDF, generateMaintenancePDF, downloadPDF } from '@/lib/pdfGenerator';
import { exportSalesToCSV, exportMaintenancesToCSV, exportCustomersToCSV, exportProductsToCSV } from '@/lib/csvExporter';
import AniversariosClientes from '@/components/AniversariosClientes';
import Suporte from '@/components/Suporte';

type ActiveModule = 'dashboard' | 'estoque' | 'vendas' | 'clientes' | 'manutencao' | 'relatorios' | 'configuracoes' | 'aniversarios' | 'suporte' | 'termos-garantia' | 'vendedores';

export default function Dashboard() {
  const { 
    user, 
    logout, 
    produtos, 
    vendas, 
    manutencoes, 
    clientes, 
    termosGarantia,
    vendedores,
    dadosLoja,
    adicionarProduto, 
    adicionarCliente, 
    adicionarVenda, 
    adicionarManutencao, 
    adicionarTermoGarantia,
    adicionarVendedor,
    atualizarProduto, 
    removerProduto, 
    atualizarVenda, 
    removerVenda, 
    atualizarManutencao, 
    removerManutencao,
    atualizarTermoGarantia,
    removerTermoGarantia,
    atualizarVendedor,
    removerVendedor,
    atualizarDadosLoja,
    atualizarCliente
  } = useApp();
  
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [dateFilter, setDateFilter] = useState('hoje');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editandoDadosLoja, setEditandoDadosLoja] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('todos');
  const [selectedDate, setSelectedDate] = useState('');
  const [tipoEstoqueFilter, setTipoEstoqueFilter] = useState('todos'); // Filtro para tipo de produto

  // Estados para formulários
  const [formData, setFormData] = useState<any>({});

  // Cálculos do dashboard com métricas separadas para vendas e manutenções
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

    // Filtrar manutenções entregues por data
    const manutencoesEntreguesHoje = manutencoes.filter(manutencao => {
      const dataEntrega = manutencao.dataEntrega ? new Date(manutencao.dataEntrega) : null;
      return manutencao.status === 'entregue' && dataEntrega && dataEntrega.toDateString() === hoje.toDateString();
    });

    const manutencoesEntreguesSemana = manutencoes.filter(manutencao => {
      const dataEntrega = manutencao.dataEntrega ? new Date(manutencao.dataEntrega) : null;
      return manutencao.status === 'entregue' && dataEntrega && dataEntrega >= inicioSemana;
    });

    const manutencoesEntreguesMes = manutencoes.filter(manutencao => {
      const dataEntrega = manutencao.dataEntrega ? new Date(manutencao.dataEntrega) : null;
      return manutencao.status === 'entregue' && dataEntrega && dataEntrega >= inicioMes;
    });

    // Filtrar por forma de pagamento se selecionado
    const filtrarPorPagamento = (vendasArray: Venda[]) => {
      if (paymentFilter === 'todos') return vendasArray;
      return vendasArray.filter(venda => venda.formaPagamento === paymentFilter);
    };

    const vendasHojeFiltradas = filtrarPorPagamento(vendasHoje);
    const vendasSemanaFiltradas = filtrarPorPagamento(vendasSemana);
    const vendasMesFiltradas = filtrarPorPagamento(vendasMes);
    
    // Calcular faturamento de vendas
    const faturamentoVendasHoje = vendasHojeFiltradas.reduce((total, venda) => total + venda.total, 0);
    const faturamentoVendasSemana = vendasSemanaFiltradas.reduce((total, venda) => total + venda.total, 0);
    const faturamentoVendasMes = vendasMesFiltradas.reduce((total, venda) => total + venda.total, 0);

    // Calcular faturamento de manutenções
    const faturamentoManutencoesHoje = manutencoesEntreguesHoje.reduce((total, manutencao) => total + manutencao.valorServico, 0);
    const faturamentoManutencoesSemana = manutencoesEntreguesSemana.reduce((total, manutencao) => total + manutencao.valorServico, 0);
    const faturamentoManutencoesMes = manutencoesEntreguesMes.reduce((total, manutencao) => total + manutencao.valorServico, 0);
    
    // Calcular lucros de vendas (faturamento - custos)
    const calcularLucroVendas = (vendasArray: Venda[]) => {
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

    // Calcular lucros de manutenções
    const calcularLucroManutencoes = (manutencoesArray: Manutencao[]) => {
      return manutencoesArray.reduce((lucroTotal, manutencao) => {
        const custoMaterial = manutencao.custoMaterial || 0;
        const lucroManutencao = manutencao.valorServico - custoMaterial;
        return lucroTotal + lucroManutencao;
      }, 0);
    };

    const lucroVendasHoje = calcularLucroVendas(vendasHojeFiltradas);
    const lucroVendasSemana = calcularLucroVendas(vendasSemanaFiltradas);
    const lucroVendasMes = calcularLucroVendas(vendasMesFiltradas);

    const lucroManutencoesHoje = calcularLucroManutencoes(manutencoesEntreguesHoje);
    const lucroManutencoesSemana = calcularLucroManutencoes(manutencoesEntreguesSemana);
    const lucroManutencoesMes = calcularLucroManutencoes(manutencoesEntreguesMes);
    
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
      // Métricas de vendas
      faturamentoVendasHoje,
      faturamentoVendasSemana,
      faturamentoVendasMes,
      lucroVendasHoje,
      lucroVendasSemana,
      lucroVendasMes,
      // Métricas de manutenções
      faturamentoManutencoesHoje,
      faturamentoManutencoesSemana,
      faturamentoManutencoesMes,
      lucroManutencoesHoje,
      lucroManutencoesSemana,
      lucroManutencoesMes,
      // Totais combinados
      faturamentoTotalHoje: faturamentoVendasHoje + faturamentoManutencoesHoje,
      faturamentoTotalSemana: faturamentoVendasSemana + faturamentoManutencoesSemana,
      faturamentoTotalMes: faturamentoVendasMes + faturamentoManutencoesMes,
      lucroTotalHoje: lucroVendasHoje + lucroManutencoesHoje,
      lucroTotalSemana: lucroVendasSemana + lucroManutencoesSemana,
      lucroTotalMes: lucroVendasMes + lucroManutencoesMes,
      // Outras métricas
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
    { id: 'vendedores', label: 'Vendedores', icon: UserCheck },
    { id: 'termos-garantia', label: 'Termos de Garantia', icon: Shield },
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

  // Função para upload de logo
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        atualizarDadosLoja({ logo: logoUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para gerar comprovante de venda em PDF - CORRIGIDA
  const gerarComprovantePDF = (venda: Venda) => {
    try {
      // Converter dados da venda para o formato esperado pelo gerador de PDF
      const saleData = {
        id: venda.id,
        customerName: venda.nomeCliente,
        customerPhone: venda.telefoneCliente || '',
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
      
      // Feedback visual para o usuário
      alert('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar comprovante PDF. Tente novamente.');
    }
  };

  // Função para gerar comprovante de manutenção em PDF - CORRIGIDA
  const gerarComprovanteManutencaoPDF = (manutencao: Manutencao) => {
    try {
      // Buscar termo de garantia se existir
      const termoGarantia = manutencao.termoGarantiaId 
        ? termosGarantia.find(t => t.id === manutencao.termoGarantiaId)
        : null;

      const maintenanceData = {
        id: manutencao.id,
        customerName: manutencao.nomeCliente,
        customerPhone: manutencao.telefoneCliente,
        deviceName: manutencao.nomeAparelho,
        deviceModel: manutencao.modeloAparelho,
        imei: manutencao.imeiAparelho || '',
        defect: manutencao.defeitoInformado,
        service: manutencao.descricaoServico || 'Serviço de manutenção',
        status: manutencao.status,
        price: manutencao.valorServico,
        paymentMethod: manutencao.formaPagamento || '',
        entryDate: manutencao.createdAt,
        deliveryDate: manutencao.dataPrevistaEntrega,
        warrantyTerm: termoGarantia ? {
          name: termoGarantia.nome,
          description: termoGarantia.descricao,
          period: termoGarantia.prazoGarantia,
          conditions: termoGarantia.condicoes
        } : null
      };

      const storeInfo = {
        name: dadosLoja.nome,
        cnpj: dadosLoja.cnpj,
        address: dadosLoja.endereco,
        phone: dadosLoja.telefone
      };

      const doc = generateMaintenancePDF(maintenanceData, storeInfo);
      downloadPDF(doc, `comprovante_manutencao_${manutencao.id}.pdf`);
      
      // Feedback visual para o usuário
      alert('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF de manutenção:', error);
      alert('Erro ao gerar comprovante de manutenção PDF. Tente novamente.');
    }
  };

  // Função para exportar relatórios em CSV - CORRIGIDA
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
      
      // Feedback visual para o usuário
      alert('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    }
  };

  // FUNÇÃO CORRIGIDA PARA LIDAR COM FORMULÁRIOS
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
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
          if (editingItem) {
            // Para edição de cliente existente
            atualizarCliente(editingItem.id, formData);
          } else {
            // Para novo cliente
            const novoCliente: Cliente = {
              id: Date.now().toString(),
              ...formData,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            adicionarCliente(novoCliente);
          }
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
            // Se status mudou para 'entregue', definir data de entrega
            if (formData.status === 'entregue' && editingItem.status !== 'entregue') {
              formData.dataEntrega = new Date().toISOString();
            }
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
        case 'termos-garantia':
          if (editingItem) {
            atualizarTermoGarantia(editingItem.id, formData);
          } else {
            const novoTermo: TermoGarantia = {
              id: Date.now().toString(),
              ...formData,
              ativo: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            adicionarTermoGarantia(novoTermo);
          }
          break;
        case 'vendedores':
          if (editingItem) {
            atualizarVendedor(editingItem.id, formData);
          } else {
            const novoVendedor: Vendedor = {
              id: Date.now().toString(),
              ...formData,
              ativo: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            adicionarVendedor(novoVendedor);
          }
          break;
      }
      
      resetForm();
      alert('Operação realizada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar. Tente novamente.');
    }
  };

  // FUNÇÃO PARA ABRIR FORMULÁRIO DE NOVA VENDA - CORRIGIDA
  const abrirFormularioNovaVenda = () => {
    setActiveModule('vendas');
    setFormData({
      nomeCliente: '',
      telefoneCliente: '',
      clienteId: '',
      vendedorId: '',
      vendedor: vendedores.length > 0 ? vendedores[0].nome : '',
      formaPagamento: 'dinheiro',
      itens: [{
        produtoId: '',
        nomeProduto: '',
        quantidade: 1,
        precoUnitario: 0,
        desconto: 0,
        subtotal: 0
      }],
      total: 0,
      termoGarantiaId: ''
    });
    setEditingItem(null);
    setShowForm(true);
  };

  // FUNÇÃO PARA ABRIR FORMULÁRIO DE NOVO CLIENTE - CORRIGIDA
  const abrirFormularioNovoCliente = () => {
    setActiveModule('clientes');
    setFormData({
      nome: '',
      documento: '',
      telefone: '',
      email: '',
      endereco: '',
      cep: '',
      dataNascimento: '',
      comoConheceu: 'indicacao'
    });
    setEditingItem(null);
    setShowForm(true);
  };

  // FUNÇÃO PARA ABRIR FORMULÁRIO DE NOVA MANUTENÇÃO - CORRIGIDA
  const abrirFormularioNovaManutencao = () => {
    setActiveModule('manutencao');
    setFormData({
      nomeCliente: '',
      telefoneCliente: '',
      clienteId: '',
      vendedorId: '', // Campo para atendente
      nomeAparelho: '',
      modeloAparelho: '',
      imeiAparelho: '',
      chipCartao: '',
      defeitoInformado: '',
      descricaoServico: '',
      valorServico: 0,
      custoMaterial: 0,
      formaPagamento: 'dinheiro',
      dataPrevistaEntrega: '',
      termoGarantiaId: ''
    });
    setEditingItem(null);
    setShowForm(true);
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

      {/* Cards de métricas principais - SEPARADAS VENDAS E MANUTENÇÕES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Faturamento Total {dateFilter === 'hoje' ? 'Hoje' : dateFilter === 'semana' ? 'Semana' : 'Mês'}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(dateFilter === 'hoje' ? dashboardData.faturamentoTotalHoje : dateFilter === 'semana' ? dashboardData.faturamentoTotalSemana : dashboardData.faturamentoTotalMes)}
              </p>
              <div className="text-xs text-gray-500 mt-1">
                Vendas: {formatCurrency(dateFilter === 'hoje' ? dashboardData.faturamentoVendasHoje : dateFilter === 'semana' ? dashboardData.faturamentoVendasSemana : dashboardData.faturamentoVendasMes)} | 
                Manutenções: {formatCurrency(dateFilter === 'hoje' ? dashboardData.faturamentoManutencoesHoje : dateFilter === 'semana' ? dashboardData.faturamentoManutencoesSemana : dashboardData.faturamentoManutencoesMes)}
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lucro Total {dateFilter === 'hoje' ? 'Hoje' : dateFilter === 'semana' ? 'Semana' : 'Mês'}</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(dateFilter === 'hoje' ? dashboardData.lucroTotalHoje : dateFilter === 'semana' ? dashboardData.lucroTotalSemana : dashboardData.lucroTotalMes)}
              </p>
              <div className="text-xs text-gray-500 mt-1">
                Vendas: {formatCurrency(dateFilter === 'hoje' ? dashboardData.lucroVendasHoje : dateFilter === 'semana' ? dashboardData.lucroVendasSemana : dashboardData.lucroVendasMes)} | 
                Manutenções: {formatCurrency(dateFilter === 'hoje' ? dashboardData.lucroManutencoesHoje : dateFilter === 'semana' ? dashboardData.lucroManutencoesSemana : dashboardData.lucroManutencoesMes)}
              </div>
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

      {/* Seção separada para métricas de manutenções */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Faturamento e Lucro - Manutenções</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Faturamento Manutenções</p>
                <p className="text-xl font-bold text-blue-900">
                  {formatCurrency(dateFilter === 'hoje' ? dashboardData.faturamentoManutencoesHoje : dateFilter === 'semana' ? dashboardData.faturamentoManutencoesSemana : dashboardData.faturamentoManutencoesMes)}
                </p>
              </div>
              <Wrench className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Lucro Manutenções</p>
                <p className="text-xl font-bold text-green-900">
                  {formatCurrency(dateFilter === 'hoje' ? dashboardData.lucroManutencoesHoje : dateFilter === 'semana' ? dashboardData.lucroManutencoesSemana : dashboardData.lucroManutencoesMes)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Manutenções Pendentes</p>
                <p className="text-xl font-bold text-orange-900">{dashboardData.manutencoesPendentes.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
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

      {/* Links Rápidos - CORRIGIDOS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => {
              setActiveModule('estoque');
              setFormData({
                nome: '',
                marca: '',
                tipo: 'celular',
                modelo: '',
                memoria: '',
                imei1: '',
                imei2: '',
                numeroSerie: '',
                cor: '',
                condicao: 'novo',
                fornecedor: '',
                precoCusto: 0,
                precoVenda: 0,
                quantidadeEstoque: 0,
                estoqueMinimo: 1,
                descricao: ''
              });
              setEditingItem(null);
              setShowForm(true);
            }}
            className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Plus className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-700">Cadastrar Produto</span>
          </button>
          
          <button 
            onClick={abrirFormularioNovaVenda}
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Registrar Venda</span>
          </button>
          
          <button 
            onClick={abrirFormularioNovaManutencao}
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

  // Renderizar conteúdo dos Vendedores
  const renderVendedoresContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendedores</h2>
          <p className="text-gray-600">Gerencie sua equipe de vendas</p>
        </div>
        
        <button
          onClick={() => {
            setFormData({
              nome: '',
              telefone: '',
              email: '',
              comissao: 0
            });
            setEditingItem(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Vendedor
        </button>
      </div>

      {/* Lista de vendedores */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comissão</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendedores.map(vendedor => (
                <tr key={vendedor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{vendedor.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vendedor.telefone}</div>
                    <div className="text-sm text-gray-500">{vendedor.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendedor.comissao ? `${vendedor.comissao}%` : 'Não definida'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      vendedor.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vendedor.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(vendedor);
                          setFormData(vendedor);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removerVendedor(vendedor.id)}
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
                  {editingItem ? 'Editar Vendedor' : 'Novo Vendedor'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={formData.nome || ''}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: João Silva"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      type="tel"
                      value={formData.telefone || ''}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(13) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="joao@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comissão (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.comissao || ''}
                      onChange={(e) => setFormData({...formData, comissao: parseFloat(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5.0"
                    />
                  </div>
                </div>

                {editingItem && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ativo"
                      checked={formData.ativo !== false}
                      onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                      Vendedor ativo
                    </label>
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

  // Renderizar conteúdo dos Termos de Garantia
  const renderTermosGarantiaContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Termos de Garantia</h2>
          <p className="text-gray-600">Gerencie os termos de garantia para vendas e manutenções</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Termo
        </button>
      </div>

      {/* Lista de termos de garantia */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aplicação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {termosGarantia.map(termo => (
                <tr key={termo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{termo.nome}</div>
                      <div className="text-sm text-gray-500">{termo.descricao}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {termo.prazoGarantia} dias
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {termo.aplicaVendas && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Vendas
                        </span>
                      )}
                      {termo.aplicaManutencoes && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Manutenções
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      termo.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {termo.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(termo);
                          setFormData(termo);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removerTermoGarantia(termo.id)}
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
                  {editingItem ? 'Editar Termo de Garantia' : 'Novo Termo de Garantia'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Termo</label>
                  <input
                    type="text"
                    required
                    value={formData.nome || ''}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Garantia Padrão Celulares"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.descricao || ''}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrição breve do termo de garantia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prazo de Garantia (dias)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.prazoGarantia || ''}
                    onChange={(e) => setFormData({...formData, prazoGarantia: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condições da Garantia</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.condicoes || ''}
                    onChange={(e) => setFormData({...formData, condicoes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descreva as condições e limitações da garantia"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Aplicar em:</label>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="aplicaVendas"
                      checked={formData.aplicaVendas || false}
                      onChange={(e) => setFormData({...formData, aplicaVendas: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="aplicaVendas" className="ml-2 block text-sm text-gray-900">
                      Vendas
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="aplicaManutencoes"
                      checked={formData.aplicaManutencoes || false}
                      onChange={(e) => setFormData({...formData, aplicaManutencoes: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="aplicaManutencoes" className="ml-2 block text-sm text-gray-900">
                      Manutenções
                    </label>
                  </div>
                </div>

                {editingItem && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ativo"
                      checked={formData.ativo !== false}
                      onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                      Termo ativo
                    </label>
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

  // RENDERIZAR CONFIGURAÇÕES - CORRIGIDO PARA CADA USUÁRIO
  const renderConfiguracoes = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações da Loja</h2>
        <p className="text-gray-600">Configure os dados da sua loja para aparecer nos comprovantes</p>
      </div>

      {/* DADOS DA LOJA - PARA TODOS OS USUÁRIOS */}
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
          }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja</label>
                <input
                  type="text"
                  value={dadosLoja.nome}
                  onChange={(e) => atualizarDadosLoja({ nome: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                <input
                  type="text"
                  value={dadosLoja.cnpj}
                  onChange={(e) => atualizarDadosLoja({ cnpj: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="tel"
                  value={dadosLoja.telefone}
                  onChange={(e) => atualizarDadosLoja({ telefone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={dadosLoja.email}
                  onChange={(e) => atualizarDadosLoja({ email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input
                  type="text"
                  value={dadosLoja.endereco}
                  onChange={(e) => atualizarDadosLoja({ endereco: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Redes Sociais</label>
                <input
                  type="text"
                  value={dadosLoja.redesSociais || ''}
                  onChange={(e) => atualizarDadosLoja({ redesSociais: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="@instagram, facebook.com/loja"
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
              <div>
                <label className="text-sm font-medium text-gray-500">Redes Sociais</label>
                <p className="text-lg text-gray-900">{dadosLoja.redesSociais || 'Não informado'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LOGO DA LOJA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo da Loja</h3>
        
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            {dadosLoja.logo ? (
              <img 
                src={dadosLoja.logo} 
                alt="Logo da Loja" 
                className="w-24 h-24 object-contain border border-gray-200 rounded-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl font-bold">GP</span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-3">
              Carregue uma logo personalizada para sua loja. A logo será exibida nos comprovantes de venda e manutenção.
            </p>
            
            <div className="flex items-center gap-3">
              <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors">
                <Upload className="w-4 h-4" />
                Carregar Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              
              {dadosLoja.logo && (
                <button
                  onClick={() => atualizarDadosLoja({ logo: undefined })}
                  className="text-red-600 hover:text-red-700 px-3 py-2 text-sm"
                >
                  Remover Logo
                </button>
              )}
            </div>
          </div>
        </div>
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

  // Renderizar outros módulos básicos
  const renderEstoqueContent = () => {
    // Filtrar produtos por tipo e busca
    const produtosFiltrados = produtos.filter(produto => {
      const matchTipo = tipoEstoqueFilter === 'todos' || produto.tipo === tipoEstoqueFilter;
      const matchBusca = searchTerm === '' || 
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.modelo?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTipo && matchBusca;
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Controle de Estoque</h2>
            <p className="text-gray-600">Gerencie seus produtos e estoque</p>
          </div>
          <button
            onClick={() => {
              setFormData({
                nome: '',
                marca: '',
                tipo: 'celular',
                modelo: '',
                memoria: '',
                imei1: '',
                imei2: '',
                numeroSerie: '',
                cor: '',
                condicao: 'novo',
                fornecedor: '',
                precoCusto: 0,
                precoVenda: 0,
                quantidadeEstoque: 0,
                estoqueMinimo: 1,
                descricao: ''
              });
              setEditingItem(null);
              setShowForm(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Produto
          </button>
        </div>

        {/* Filtros e busca */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar produtos... (ex: película iPhone 11)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={tipoEstoqueFilter}
                onChange={(e) => setTipoEstoqueFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="todos">Todos os produtos</option>
                <option value="celular">Celulares</option>
                <option value="acessorio">Acessórios</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preços</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {produtosFiltrados.map(produto => (
                  <tr key={produto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{produto.nome}</div>
                        <div className="text-sm text-gray-500">
                          {produto.marca} {produto.modelo && `- ${produto.modelo}`}
                          {produto.memoria && ` - ${produto.memoria}GB`}
                          {produto.cor && ` - ${produto.cor}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        produto.tipo === 'celular' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {produto.tipo === 'celular' ? 'Celular' : 'Acessório'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{produto.quantidadeEstoque} unidades</div>
                      <div className="text-sm text-gray-500">Mín: {produto.estoqueMinimo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">Venda: {formatCurrency(produto.precoVenda)}</div>
                      <div className="text-sm text-gray-500">Custo: {formatCurrency(produto.precoCusto)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        produto.quantidadeEstoque <= produto.estoqueMinimo
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {produto.quantidadeEstoque <= produto.estoqueMinimo ? 'Estoque Baixo' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
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

        {/* FORMULÁRIO DE PRODUTO - CORRIGIDO COM CAMPOS ESPECÍFICOS PARA CELULARES */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informações Básicas */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Informações Básicas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                        <input
                          type="text"
                          required
                          value={formData.nome || ''}
                          onChange={(e) => setFormData({...formData, nome: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Ex: iPhone 13 Pro Max"
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
                          placeholder="Ex: Apple"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                          required
                          value={formData.tipo || 'celular'}
                          onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
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
                          placeholder="Ex: Distribuidora ABC"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Campos específicos para celulares */}
                  {formData.tipo === 'celular' && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-blue-900 mb-4">Informações Específicas do Celular</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                          <input
                            type="text"
                            value={formData.modelo || ''}
                            onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: Pro Max"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">IMEI 1</label>
                          <input
                            type="text"
                            value={formData.imei1 || ''}
                            onChange={(e) => setFormData({...formData, imei1: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="15 dígitos"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">IMEI 2</label>
                          <input
                            type="text"
                            value={formData.imei2 || ''}
                            onChange={(e) => setFormData({...formData, imei2: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="15 dígitos (se dual chip)"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Número de Série</label>
                          <input
                            type="text"
                            value={formData.numeroSerie || ''}
                            onChange={(e) => setFormData({...formData, numeroSerie: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Número de série do aparelho"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                          <input
                            type="text"
                            value={formData.cor || ''}
                            onChange={(e) => setFormData({...formData, cor: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: Azul Sierra"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Memória (GB)</label>
                          <select
                            value={formData.memoria || ''}
                            onChange={(e) => setFormData({...formData, memoria: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Selecionar</option>
                            <option value="32">32 GB</option>
                            <option value="64">64 GB</option>
                            <option value="128">128 GB</option>
                            <option value="256">256 GB</option>
                            <option value="512">512 GB</option>
                            <option value="1024">1 TB</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preços e Estoque */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-green-900 mb-4">Preços e Estoque</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor de Custo</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.precoCusto || ''}
                          onChange={(e) => setFormData({...formData, precoCusto: parseFloat(e.target.value)})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor de Venda</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.precoVenda || ''}
                          onChange={(e) => setFormData({...formData, precoVenda: parseFloat(e.target.value)})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="0.00"
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
                          placeholder="0"
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
                          placeholder="1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Informações Adicionais */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Informações Adicionais</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Condição</label>
                        <select
                          value={formData.condicao || 'novo'}
                          onChange={(e) => setFormData({...formData, condicao: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="novo">Novo</option>
                          <option value="seminovo">Seminovo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data da Compra</label>
                        <input
                          type="date"
                          value={formData.dataCompra || ''}
                          onChange={(e) => setFormData({...formData, dataCompra: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                        <textarea
                          rows={3}
                          value={formData.descricao || ''}
                          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Descrição adicional do produto"
                        />
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
  };

  const renderVendasContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendas</h2>
          <p className="text-gray-600">Registre e acompanhe suas vendas</p>
        </div>
        <button
          onClick={abrirFormularioNovaVenda}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Venda
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produtos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vendas.map(venda => (
                <tr key={venda.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{venda.nomeCliente}</div>
                      <div className="text-sm text-gray-500">{venda.telefoneCliente}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {venda.itens.map(item => (
                        <div key={item.produtoId}>
                          {item.nomeProduto} (x{item.quantidade})
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDate(new Date(venda.createdAt))}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(venda.total)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {venda.formaPagamento.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => gerarComprovantePDF(venda)}
                        className="text-green-600 hover:text-green-900"
                        title="Gerar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removerVenda(venda.id)}
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

      {/* FORMULÁRIO DE VENDA - CORRIGIDO COM PRODUTOS E CLIENTES */}
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
                {/* Seção do Cliente */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Dados do Cliente</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cliente Cadastrado</label>
                      <select
                        value={formData.clienteId || ''}
                        onChange={(e) => {
                          const clienteId = e.target.value;
                          const cliente = clientes.find(c => c.id === clienteId);
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
                        <option value="">Selecionar cliente ou digitar manualmente</option>
                        {clientes.map(cliente => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nome} - {cliente.telefone}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
                      <select
                        required
                        value={formData.vendedorId || ''}
                        onChange={(e) => {
                          const vendedorId = e.target.value;
                          const vendedor = vendedores.find(v => v.id === vendedorId);
                          setFormData({
                            ...formData,
                            vendedorId: vendedorId,
                            vendedor: vendedor ? vendedor.nome : ''
                          });
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecionar vendedor</option>
                        {vendedores.filter(v => v.ativo).map(vendedor => (
                          <option key={vendedor.id} value={vendedor.id}>
                            {vendedor.nome}
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
                        placeholder="Digite o nome do cliente"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone do Cliente</label>
                      <input
                        type="tel"
                        value={formData.telefoneCliente || ''}
                        onChange={(e) => setFormData({...formData, telefoneCliente: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(13) 99999-9999"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção dos Produtos */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Produtos da Venda</h4>
                  {formData.itens && formData.itens.map((item: any, index: number) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 bg-white rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
                        <select
                          required
                          value={item.produtoId || ''}
                          onChange={(e) => {
                            const produtoId = e.target.value;
                            const produto = produtos.find(p => p.id === produtoId);
                            const novosItens = [...formData.itens];
                            if (produto) {
                              novosItens[index] = {
                                ...item,
                                produtoId: produto.id,
                                nomeProduto: produto.nome,
                                precoUnitario: produto.precoVenda,
                                subtotal: produto.precoVenda * (item.quantidade || 1)
                              };
                            }
                            setFormData({...formData, itens: novosItens});
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Selecionar produto</option>
                          {produtos.filter(p => p.quantidadeEstoque > 0).map(produto => (
                            <option key={produto.id} value={produto.id}>
                              {produto.nome} - {formatCurrency(produto.precoVenda)} (Estoque: {produto.quantidadeEstoque})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantidade || 1}
                          onChange={(e) => {
                            const quantidade = parseInt(e.target.value);
                            const novosItens = [...formData.itens];
                            novosItens[index] = {
                              ...item,
                              quantidade,
                              subtotal: (item.precoUnitario || 0) * quantidade - (item.desconto || 0)
                            };
                            setFormData({...formData, itens: novosItens});
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço Unit.</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.precoUnitario || 0}
                          onChange={(e) => {
                            const precoUnitario = parseFloat(e.target.value);
                            const novosItens = [...formData.itens];
                            novosItens[index] = {
                              ...item,
                              precoUnitario,
                              subtotal: precoUnitario * (item.quantidade || 1) - (item.desconto || 0)
                            };
                            setFormData({...formData, itens: novosItens});
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Desconto</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.desconto || 0}
                          onChange={(e) => {
                            const desconto = parseFloat(e.target.value) || 0;
                            const novosItens = [...formData.itens];
                            novosItens[index] = {
                              ...item,
                              desconto,
                              subtotal: (item.precoUnitario || 0) * (item.quantidade || 1) - desconto
                            };
                            setFormData({...formData, itens: novosItens});
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                          <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-700">
                            {formatCurrency(item.subtotal || 0)}
                          </div>
                        </div>
                        {formData.itens.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const novosItens = formData.itens.filter((_: any, i: number) => i !== index);
                              setFormData({...formData, itens: novosItens});
                            }}
                            className="ml-2 p-2 text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const novosItens = [...(formData.itens || []), {
                        produtoId: '',
                        nomeProduto: '',
                        quantidade: 1,
                        precoUnitario: 0,
                        desconto: 0,
                        subtotal: 0
                      }];
                      setFormData({...formData, itens: novosItens});
                    }}
                    className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
                  >
                    + Adicionar Produto
                  </button>
                </div>

                {/* Seção de Pagamento e Garantia */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                    <select
                      required
                      value={formData.formaPagamento || 'dinheiro'}
                      onChange={(e) => setFormData({...formData, formaPagamento: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartao_credito">Cartão de Crédito</option>
                      <option value="cartao_debito">Cartão de Débito</option>
                      <option value="pix">PIX</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Termo de Garantia</label>
                    <select
                      value={formData.termoGarantiaId || ''}
                      onChange={(e) => setFormData({...formData, termoGarantiaId: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sem garantia específica</option>
                      {termosGarantia.filter(t => t.ativo && t.aplicaVendas).map(termo => (
                        <option key={termo.id} value={termo.id}>
                          {termo.nome} ({termo.prazoGarantia} dias)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total da Venda</label>
                    <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-700 font-bold text-lg">
                      {formatCurrency(formData.itens?.reduce((total: number, item: any) => total + (item.subtotal || 0), 0) || 0)}
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
                    onClick={() => {
                      const total = formData.itens?.reduce((total: number, item: any) => total + (item.subtotal || 0), 0) || 0;
                      setFormData({...formData, total});
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
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

  const renderClientesContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
          <p className="text-gray-600">Gerencie sua base de clientes</p>
        </div>
        <button
          onClick={abrirFormularioNovoCliente}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cadastro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clientes.map(cliente => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{cliente.nome}</div>
                      <div className="text-sm text-gray-500">{cliente.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{cliente.telefone}</div>
                    <div className="text-sm text-gray-500">{cliente.endereco}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {cliente.documento}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDate(new Date(cliente.createdAt))}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirWhatsAppCliente(cliente.telefone)}
                        className="text-green-600 hover:text-green-900"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingItem(cliente);
                          setFormData(cliente);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORMULÁRIO DE CLIENTE - CORRIGIDO */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingItem ? 'Editar Cliente' : 'Novo Cliente'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={formData.nome || ''}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Documento (CPF/RG)</label>
                    <input
                      type="text"
                      required
                      value={formData.documento || ''}
                      onChange={(e) => setFormData({...formData, documento: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      type="tel"
                      required
                      value={formData.telefone || ''}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                    <input
                      type="text"
                      value={formData.endereco || ''}
                      onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                    <input
                      type="text"
                      value={formData.cep || ''}
                      onChange={(e) => setFormData({...formData, cep: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                    <input
                      type="date"
                      value={formData.dataNascimento || ''}
                      onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Como conheceu a loja?</label>
                    <select
                      value={formData.comoConheceu || 'indicacao'}
                      onChange={(e) => setFormData({...formData, comoConheceu: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
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
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
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

  const renderManutencaoContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manutenções</h2>
          <p className="text-gray-600">Controle de ordens de serviço</p>
        </div>
        <button
          onClick={abrirFormularioNovaManutencao}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Manutenção
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aparelho</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Atendente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Defeito</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {manutencoes.map(manutencao => {
                const atendente = manutencao.vendedorId ? vendedores.find(v => v.id === manutencao.vendedorId) : null;
                return (
                  <tr key={manutencao.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{manutencao.nomeCliente}</div>
                        <div className="text-sm text-gray-500">{manutencao.telefoneCliente}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{manutencao.nomeAparelho}</div>
                        <div className="text-sm text-gray-500">{manutencao.modeloAparelho}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {atendente ? atendente.nome : 'Não definido'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {manutencao.defeitoInformado}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        manutencao.status === 'recebido' ? 'bg-yellow-100 text-yellow-800' :
                        manutencao.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
                        manutencao.status === 'concluido' ? 'bg-green-100 text-green-800' :
                        manutencao.status === 'entregue' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {manutencao.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(manutencao.valorServico)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => gerarComprovanteManutencaoPDF(manutencao)}
                          className="text-green-600 hover:text-green-900"
                          title="Gerar PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
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
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORMULÁRIO DE MANUTENÇÃO - CORRIGIDO COM CLIENTES, TERMOS E ATENDENTE */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente Cadastrado</label>
                    <select
                      value={formData.clienteId || ''}
                      onChange={(e) => {
                        const clienteId = e.target.value;
                        const cliente = clientes.find(c => c.id === clienteId);
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Selecionar cliente ou digitar manualmente</option>
                      {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nome} - {cliente.telefone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Atendente</label>
                    <select
                      value={formData.vendedorId || ''}
                      onChange={(e) => setFormData({...formData, vendedorId: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Selecionar atendente</option>
                      {vendedores.filter(v => v.ativo).map(vendedor => (
                        <option key={vendedor.id} value={vendedor.id}>
                          {vendedor.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Termo de Garantia</label>
                    <select
                      value={formData.termoGarantiaId || ''}
                      onChange={(e) => setFormData({...formData, termoGarantiaId: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Sem garantia específica</option>
                      {termosGarantia.filter(t => t.ativo && t.aplicaManutencoes).map(termo => (
                        <option key={termo.id} value={termo.id}>
                          {termo.nome} ({termo.prazoGarantia} dias)
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone do Cliente</label>
                    <input
                      type="tel"
                      required
                      value={formData.telefoneCliente || ''}
                      onChange={(e) => setFormData({...formData, telefoneCliente: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Aparelho</label>
                    <input
                      type="text"
                      required
                      value={formData.nomeAparelho || ''}
                      onChange={(e) => setFormData({...formData, nomeAparelho: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo do Aparelho</label>
                    <input
                      type="text"
                      required
                      value={formData.modeloAparelho || ''}
                      onChange={(e) => setFormData({...formData, modeloAparelho: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IMEI do Aparelho</label>
                    <input
                      type="text"
                      value={formData.imeiAparelho || ''}
                      onChange={(e) => setFormData({...formData, imeiAparelho: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chip/Cartão</label>
                    <input
                      type="text"
                      value={formData.chipCartao || ''}
                      onChange={(e) => setFormData({...formData, chipCartao: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Ex: Sim, chip Vivo"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Defeito Informado</label>
                    <textarea
                      rows={3}
                      required
                      value={formData.defeitoInformado || ''}
                      onChange={(e) => setFormData({...formData, defeitoInformado: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Descreva o problema relatado pelo cliente"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Serviço</label>
                    <textarea
                      rows={3}
                      value={formData.descricaoServico || ''}
                      onChange={(e) => setFormData({...formData, descricaoServico: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Descreva o serviço a ser realizado"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custo do Material</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.custoMaterial || ''}
                      onChange={(e) => setFormData({...formData, custoMaterial: parseFloat(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                    <select
                      value={formData.formaPagamento || 'dinheiro'}
                      onChange={(e) => setFormData({...formData, formaPagamento: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  {editingItem && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={formData.status || 'recebido'}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2"
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

  const renderRelatoriosContent = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
        <p className="text-gray-600">Exporte e analise seus dados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Relatórios de Vendas</h3>
          <div className="space-y-3">
            <button
              onClick={() => exportarRelatorioCSV('vendas', 'hoje')}
              className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="font-medium text-green-700">Vendas de Hoje</div>
              <div className="text-sm text-green-600">Exportar vendas do dia atual</div>
            </button>
            <button
              onClick={() => exportarRelatorioCSV('vendas', '7dias')}
              className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="font-medium text-blue-700">Últimos 7 Dias</div>
              <div className="text-sm text-blue-600">Vendas da última semana</div>
            </button>
            <button
              onClick={() => exportarRelatorioCSV('vendas', '30dias')}
              className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="font-medium text-purple-700">Últimos 30 Dias</div>
              <div className="text-sm text-purple-600">Vendas do último mês</div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Outros Relatórios</h3>
          <div className="space-y-3">
            <button
              onClick={() => exportarRelatorioCSV('produtos')}
              className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <div className="font-medium text-orange-700">Produtos</div>
              <div className="text-sm text-orange-600">Lista completa de produtos</div>
            </button>
            <button
              onClick={() => exportarRelatorioCSV('clientes')}
              className="w-full text-left p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
            >
              <div className="font-medium text-pink-700">Clientes</div>
              <div className="text-sm text-pink-600">Base de dados de clientes</div>
            </button>
            <button
              onClick={() => exportarRelatorioCSV('manutencoes')}
              className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <div className="font-medium text-indigo-700">Manutenções</div>
              <div className="text-sm text-indigo-600">Histórico de ordens de serviço</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Função para renderizar o conteúdo do módulo ativo
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
      case 'vendedores':
        return renderVendedoresContent();
      case 'relatorios':
        return renderRelatoriosContent();
      case 'termos-garantia':
        return renderTermosGarantiaContent();
      case 'configuracoes':
        return renderConfiguracoes();
      case 'aniversarios':
        return <AniversariosClientes />;
      case 'suporte':
        return <Suporte />;
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar - Responsiva */}
      <div className="w-full md:w-64 bg-white shadow-lg border-r border-gray-200 md:min-h-screen">
        {/* Logo */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {dadosLoja?.logo ? (
              <img 
                src={dadosLoja.logo} 
                alt={`${dadosLoja.nome} Logo`} 
                className="w-8 md:w-10 h-8 md:h-10 object-contain"
              />
            ) : (
              <div className="w-8 md:w-10 h-8 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm md:text-lg font-bold">GP</span>
              </div>
            )}
            <div>
              <h1 className="text-base md:text-lg font-bold text-gray-900">{dadosLoja.nome}</h1>
              <p className="text-xs md:text-sm text-gray-500">Sistema de Gestão</p>
            </div>
          </div>
        </div>

        {/* Menu - Responsivo */}
        <nav className="p-2 md:p-4">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-1 md:gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id as ActiveModule)}
                  className={`w-full flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-lg text-left transition-colors ${
                    isActive 
                      ? 'bg-green-100 text-green-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 md:w-5 h-4 md:h-5" />
                  <span className="text-xs md:text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Info & Logout - Responsivo */}
        <div className="absolute bottom-0 left-0 right-0 md:w-64 p-2 md:p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-6 md:w-8 h-6 md:h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xs md:text-sm font-medium text-green-700">
                  {user?.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'super_admin' ? 'Super Admin' : 'Administrador'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1 md:p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Sair do sistema"
            >
              <LogOut className="w-4 md:w-5 h-4 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header - Responsivo */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg md:text-xl font-semibold text-gray-900 capitalize">
                {activeModule === 'dashboard' ? 'Dashboard' : 
                 activeModule === 'aniversarios' ? 'Aniversários de Clientes' :
                 activeModule === 'suporte' ? 'Suporte Técnico' :
                 activeModule === 'termos-garantia' ? 'Termos de Garantia' :
                 activeModule === 'vendedores' ? 'Vendedores' :
                 activeModule}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm text-gray-600">{formatDate(new Date())}</p>
                <p className="text-xs text-gray-500">{dadosLoja.nome}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content - Responsivo */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {renderModuleContent()}
        </main>
      </div>
    </div>
  );
}
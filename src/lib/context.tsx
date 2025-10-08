'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Produto, Cliente, Venda, Manutencao, TermoGarantia, DadosLoja } from './types';
import { DADOS_LOJA } from './constants';
import { 
  supabase, 
  createUserInSupabase, 
  loginUser, 
  resetPassword, 
  logoutUser, 
  getCurrentUser,
  createUserStoreProfile,
  getUserStoreProfile,
  updateUserStoreProfile
} from './supabase';

interface AppContextType {
  // Autenticação
  user: User | null;
  supabaseUser: any | null;
  login: (username: string, password: string, type?: 'normal' | 'admin') => Promise<boolean>;
  logout: () => Promise<void>;
  loginAttempts: number;
  resetUserPassword: (email: string) => Promise<{ success?: boolean; error?: any }>;
  
  // Produtos
  produtos: Produto[];
  adicionarProduto: (produto: Produto) => void;
  atualizarProduto: (id: string, produto: Partial<Produto>) => void;
  removerProduto: (id: string) => void;
  
  // Clientes
  clientes: Cliente[];
  adicionarCliente: (cliente: Cliente) => void;
  atualizarCliente: (id: string, cliente: Partial<Cliente>) => void;
  removerCliente: (id: string) => void;
  
  // Vendas
  vendas: Venda[];
  adicionarVenda: (venda: Venda) => void;
  atualizarVenda: (id: string, venda: Partial<Venda>) => void;
  removerVenda: (id: string) => void;
  
  // Manutenções
  manutencoes: Manutencao[];
  adicionarManutencao: (manutencao: Manutencao) => void;
  atualizarManutencao: (id: string, manutencao: Partial<Manutencao>) => void;
  removerManutencao: (id: string) => void;
  
  // Termos de Garantia
  termosGarantia: TermoGarantia[];
  adicionarTermoGarantia: (termo: TermoGarantia) => void;
  atualizarTermoGarantia: (id: string, termo: Partial<TermoGarantia>) => void;
  removerTermoGarantia: (id: string) => void;
  
  // Usuários (apenas para admin)
  usuarios: User[];
  criarUsuario: (usuario: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  removerUsuario: (id: string) => void;

  // Dados da Loja (configuráveis)
  dadosLoja: DadosLoja;
  atualizarDadosLoja: (dados: Partial<DadosLoja>) => Promise<void>;

  // Faturamento e lucro (para dashboard)
  faturamentoTotal: number;
  lucroTotal: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Dados iniciais para demonstração (apenas para usuário principal JV Celulares)
const produtosIniciais: Produto[] = [
  {
    id: '1',
    nome: 'iPhone 14 Pro',
    marca: 'Apple',
    tipo: 'celular',
    modelo: 'iPhone 14 Pro',
    memoria: '128GB',
    imei1: '123456789012345',
    imei2: '123456789012346',
    cor: 'Preto',
    condicao: 'novo',
    fornecedor: 'Distribuidor Apple',
    precoCusto: 4500,
    precoVenda: 5500,
    quantidadeEstoque: 3,
    estoqueMinimo: 2,
    descricao: 'iPhone 14 Pro 128GB Preto',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    nome: 'Capinha Transparente',
    marca: 'Genérica',
    tipo: 'acessorio',
    fornecedor: 'Fornecedor Local',
    precoCusto: 5,
    precoVenda: 15,
    quantidadeEstoque: 1,
    estoqueMinimo: 5,
    descricao: 'Capinha transparente universal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    nome: 'Samsung Galaxy S23',
    marca: 'Samsung',
    tipo: 'celular',
    modelo: 'Galaxy S23',
    memoria: '256GB',
    imei1: '987654321098765',
    imei2: '987654321098766',
    cor: 'Branco',
    condicao: 'novo',
    fornecedor: 'Distribuidor Samsung',
    precoCusto: 3200,
    precoVenda: 4000,
    quantidadeEstoque: 5,
    estoqueMinimo: 3,
    descricao: 'Samsung Galaxy S23 256GB Branco',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const clientesIniciais: Cliente[] = [
  {
    id: '1',
    nome: 'Maria Silva',
    documento: '123.456.789-00',
    telefone: '(13) 99999-9999',
    email: 'maria@email.com',
    endereco: 'Rua das Flores, 123',
    cep: '11000-000',
    dataNascimento: '1990-05-15',
    comoConheceu: 'indicacao',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    nome: 'João Santos',
    documento: '987.654.321-00',
    telefone: '(13) 88888-8888',
    email: 'joao@email.com',
    endereco: 'Av. Principal, 456',
    cep: '11000-001',
    dataNascimento: '1985-10-20',
    comoConheceu: 'redes_sociais',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const vendasIniciais: Venda[] = [
  {
    id: '1',
    nomeCliente: 'Maria Silva',
    telefoneCliente: '(13) 99999-9999',
    vendedor: 'João',
    formaPagamento: 'pix',
    itens: [
      {
        produtoId: '2',
        nomeProduto: 'Capinha Transparente',
        quantidade: 2,
        precoUnitario: 15,
        desconto: 5,
        subtotal: 25
      }
    ],
    total: 25,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Ontem
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '2',
    nomeCliente: 'João Santos',
    telefoneCliente: '(13) 88888-8888',
    vendedor: 'Gabriel',
    formaPagamento: 'cartao_credito',
    itens: [
      {
        produtoId: '1',
        nomeProduto: 'iPhone 14 Pro',
        quantidade: 1,
        precoUnitario: 5500,
        desconto: 0,
        subtotal: 5500
      }
    ],
    total: 5500,
    createdAt: new Date().toISOString(), // Hoje
    updatedAt: new Date().toISOString()
  }
];

const manutencoesIniciais: Manutencao[] = [
  {
    id: '1',
    nomeCliente: 'Carlos Oliveira',
    telefoneCliente: '(13) 77777-7777',
    nomeAparelho: 'iPhone 12',
    modeloAparelho: 'iPhone 12',
    imeiAparelho: '111222333444555',
    chipCartao: 'Sim, chip Vivo',
    defeitoInformado: 'Tela quebrada',
    descricaoServico: 'Troca de tela original',
    valorServico: 450,
    custoMaterial: 300,
    formaPagamento: 'dinheiro',
    dataPrevistaEntrega: new Date(Date.now() + 172800000).toISOString(), // Em 2 dias
    status: 'em_andamento',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    nomeCliente: 'Ana Costa',
    telefoneCliente: '(13) 66666-6666',
    nomeAparelho: 'Samsung A54',
    modeloAparelho: 'Galaxy A54',
    imeiAparelho: '555444333222111',
    chipCartao: 'Não',
    defeitoInformado: 'Não liga',
    descricaoServico: 'Diagnóstico e reparo da placa',
    valorServico: 200,
    custoMaterial: 80,
    formaPagamento: 'pix',
    dataPrevistaEntrega: new Date(Date.now() + 259200000).toISOString(), // Em 3 dias
    status: 'recebido',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const termosGarantiaIniciais: TermoGarantia[] = [
  {
    id: '1',
    nome: 'Garantia Padrão Celulares',
    descricao: 'Garantia padrão para celulares novos e seminovos',
    prazoGarantia: 90,
    condicoes: 'Garantia válida contra defeitos de fabricação. Não cobre danos físicos, oxidação ou mau uso.',
    aplicaVendas: true,
    aplicaManutencoes: false,
    ativo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    nome: 'Garantia Serviços de Manutenção',
    descricao: 'Garantia para serviços de reparo e manutenção',
    prazoGarantia: 30,
    condicoes: 'Garantia válida apenas para o serviço realizado. Não cobre novos defeitos ou danos.',
    aplicaVendas: false,
    aplicaManutencoes: true,
    ativo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [termosGarantia, setTermosGarantia] = useState<TermoGarantia[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [dadosLoja, setDadosLoja] = useState<DadosLoja>(DADOS_LOJA);
  const [faturamentoTotal, setFaturamentoTotal] = useState(0);
  const [lucroTotal, setLucroTotal] = useState(0);

  // Função para obter chave de localStorage específica do usuário
  const getUserStorageKey = (key: string, userId?: string) => {
    const currentUserId = userId || user?.id || supabaseUser?.id || 'default';
    return `gp-${key}-${currentUserId}`;
  };

  // Verificar sessão do Supabase ao inicializar
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { user: currentUser } = await getCurrentUser();
        
        // Se não há usuário, não faz nada (usuário não está logado)
        if (!currentUser) {
          return;
        }

        setSupabaseUser(currentUser);
        
        // Carregar perfil da loja do usuário
        const { data: storeProfile } = await getUserStoreProfile(currentUser.id);
        if (storeProfile) {
          setDadosLoja({
            nome: storeProfile.store_name || 'Gestão Phone',
            cnpj: storeProfile.cnpj || '',
            telefone: storeProfile.phone || '',
            email: storeProfile.email || '',
            endereco: storeProfile.address || '',
            logo: storeProfile.logo_url || ''
          });
        }

        // Criar usuário local baseado no Supabase
        const localUser: User = {
          id: currentUser.id,
          username: currentUser.email || 'user',
          role: 'user',
          type: 'normal',
          createdAt: currentUser.created_at || new Date().toISOString()
        };
        setUser(localUser);
      } catch (error: any) {
        // Silenciosamente ignorar erros de sessão ao inicializar
        // Não logar nada para evitar poluir o console
      }
    };

    checkSession();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setSupabaseUser(session.user);
        
        // Carregar perfil da loja do usuário
        const { data: storeProfile } = await getUserStoreProfile(session.user.id);
        if (storeProfile) {
          setDadosLoja({
            nome: storeProfile.store_name || 'Gestão Phone',
            cnpj: storeProfile.cnpj || '',
            telefone: storeProfile.phone || '',
            email: storeProfile.email || '',
            endereco: storeProfile.address || '',
            logo: storeProfile.logo_url || ''
          });
        }

        const localUser: User = {
          id: session.user.id,
          username: session.user.email || 'user',
          role: 'user',
          type: 'normal',
          createdAt: session.user.created_at || new Date().toISOString()
        };
        setUser(localUser);
      } else if (event === 'SIGNED_OUT') {
        setSupabaseUser(null);
        setUser(null);
        setDadosLoja(DADOS_LOJA);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('gp-user');
    const savedLoginAttempts = localStorage.getItem('gp-login-attempts');
    const savedUsuarios = localStorage.getItem('gp-usuarios');
    const savedDadosLoja = localStorage.getItem('gp-dados-loja');
    const savedFaturamento = localStorage.getItem('gp-faturamento-total');
    const savedLucro = localStorage.getItem('gp-lucro-total');

    if (savedLoginAttempts) {
      setLoginAttempts(parseInt(savedLoginAttempts));
    }
    if (savedUsuarios) {
      setUsuarios(JSON.parse(savedUsuarios));
    }
    if (savedFaturamento) {
      setFaturamentoTotal(parseFloat(savedFaturamento));
    }
    if (savedLucro) {
      setLucroTotal(parseFloat(savedLucro));
    }

    // Para usuários não autenticados via Supabase, usar dados locais
    if (savedUser && !supabaseUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      if (savedDadosLoja) {
        setDadosLoja(JSON.parse(savedDadosLoja));
      }
    }
  }, [supabaseUser]);

  // Carregar dados específicos do usuário quando user muda
  useEffect(() => {
    if (user) {
      // Se for o usuário principal da JV Celulares, carrega dados iniciais se não existirem
      if (user.username === 'jvcell2023') {
        const savedProdutos = localStorage.getItem(getUserStorageKey('produtos'));
        const savedClientes = localStorage.getItem(getUserStorageKey('clientes'));
        const savedVendas = localStorage.getItem(getUserStorageKey('vendas'));
        const savedManutencoes = localStorage.getItem(getUserStorageKey('manutencoes'));
        const savedTermosGarantia = localStorage.getItem(getUserStorageKey('termos-garantia'));

        setProdutos(savedProdutos ? JSON.parse(savedProdutos) : produtosIniciais);
        setClientes(savedClientes ? JSON.parse(savedClientes) : clientesIniciais);
        setVendas(savedVendas ? JSON.parse(savedVendas) : vendasIniciais);
        setManutencoes(savedManutencoes ? JSON.parse(savedManutencoes) : manutencoesIniciais);
        setTermosGarantia(savedTermosGarantia ? JSON.parse(savedTermosGarantia) : termosGarantiaIniciais);
      } else {
        // Para outros usuários, carrega dados específicos ou inicia vazio
        const savedProdutos = localStorage.getItem(getUserStorageKey('produtos'));
        const savedClientes = localStorage.getItem(getUserStorageKey('clientes'));
        const savedVendas = localStorage.getItem(getUserStorageKey('vendas'));
        const savedManutencoes = localStorage.getItem(getUserStorageKey('manutencoes'));
        const savedTermosGarantia = localStorage.getItem(getUserStorageKey('termos-garantia'));

        setProdutos(savedProdutos ? JSON.parse(savedProdutos) : []);
        setClientes(savedClientes ? JSON.parse(savedClientes) : []);
        setVendas(savedVendas ? JSON.parse(savedVendas) : []);
        setManutencoes(savedManutencoes ? JSON.parse(savedManutencoes) : []);
        setTermosGarantia(savedTermosGarantia ? JSON.parse(savedTermosGarantia) : []);
      }
    }
  }, [user]);

  // Salvar dados no localStorage
  useEffect(() => {
    if (user && !supabaseUser) {
      localStorage.setItem('gp-user', JSON.stringify(user));
    }
  }, [user, supabaseUser]);

  useEffect(() => {
    localStorage.setItem('gp-login-attempts', loginAttempts.toString());
  }, [loginAttempts]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(getUserStorageKey('produtos'), JSON.stringify(produtos));
    }
  }, [produtos, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(getUserStorageKey('clientes'), JSON.stringify(clientes));
    }
  }, [clientes, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(getUserStorageKey('vendas'), JSON.stringify(vendas));
    }
  }, [vendas, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(getUserStorageKey('manutencoes'), JSON.stringify(manutencoes));
    }
  }, [manutencoes, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(getUserStorageKey('termos-garantia'), JSON.stringify(termosGarantia));
    }
  }, [termosGarantia, user]);

  useEffect(() => {
    localStorage.setItem('gp-usuarios', JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    if (!supabaseUser) {
      localStorage.setItem('gp-dados-loja', JSON.stringify(dadosLoja));
    }
  }, [dadosLoja, supabaseUser]);

  useEffect(() => {
    localStorage.setItem('gp-faturamento-total', faturamentoTotal.toString());
  }, [faturamentoTotal]);

  useEffect(() => {
    localStorage.setItem('gp-lucro-total', lucroTotal.toString());
  }, [lucroTotal]);

  const login = async (username: string, password: string, type: 'normal' | 'admin' = 'normal'): Promise<boolean> => {
    // Primeiro, tentar login com Supabase (usando email como username)
    if (type === 'normal' && username.includes('@')) {
      const { user: supabaseUserData, error } = await loginUser(username, password);
      if (supabaseUserData && !error) {
        setSupabaseUser(supabaseUserData);
        
        // Carregar perfil da loja do usuário
        const { data: storeProfile } = await getUserStoreProfile(supabaseUserData.id);
        if (storeProfile) {
          setDadosLoja({
            nome: storeProfile.store_name || 'Gestão Phone',
            cnpj: storeProfile.cnpj || '',
            telefone: storeProfile.phone || '',
            email: storeProfile.email || '',
            endereco: storeProfile.address || '',
            logo: storeProfile.logo_url || ''
          });
        }

        const localUser: User = {
          id: supabaseUserData.id,
          username: supabaseUserData.email || 'user',
          role: 'user',
          type: 'normal',
          createdAt: supabaseUserData.created_at || new Date().toISOString()
        };
        setUser(localUser);
        setLoginAttempts(0);
        return true;
      }
    }

    // Login local (sistema antigo)
    if (type === 'normal' && username === 'jvcell2023' && password === 'Jesuscristovive') {
      const userData: User = {
        id: '1',
        username: 'jvcell2023',
        role: 'admin',
        type: 'normal',
        createdAt: new Date().toISOString()
      };
      setUser(userData);
      setLoginAttempts(0);
      return true;
    }
    
    if (type === 'admin' && username === 'JOAOADM' && password === 'JESUSADM') {
      const userData: User = {
        id: 'admin',
        username: 'JOAOADM',
        role: 'super_admin',
        type: 'admin',
        createdAt: new Date().toISOString()
      };
      setUser(userData);
      setLoginAttempts(0);
      return true;
    }

    // Verificar usuários criados pelo admin
    const usuarioEncontrado = usuarios.find(u => u.username === username && u.password === password);
    if (usuarioEncontrado && type === 'normal') {
      // Verificar se o usuário ainda está dentro do prazo de acesso
      const agora = new Date();
      const expiracao = new Date(usuarioEncontrado.expiresAt!);
      
      if (agora <= expiracao) {
        setUser(usuarioEncontrado);
        setLoginAttempts(0);
        return true;
      }
    }
    
    setLoginAttempts(prev => prev + 1);
    return false;
  };

  const logout = async () => {
    if (supabaseUser) {
      await logoutUser();
    }
    
    setUser(null);
    setSupabaseUser(null);
    setProdutos([]);
    setClientes([]);
    setVendas([]);
    setManutencoes([]);
    setTermosGarantia([]);
    setDadosLoja(DADOS_LOJA);
    localStorage.removeItem('gp-user');
  };

  const resetUserPassword = async (email: string) => {
    return await resetPassword(email);
  };

  // Funções para produtos
  const adicionarProduto = (produto: Produto) => {
    setProdutos(prev => [...prev, produto]);
  };

  const atualizarProduto = (id: string, produtoAtualizado: Partial<Produto>) => {
    setProdutos(prev => prev.map(produto => 
      produto.id === id 
        ? { ...produto, ...produtoAtualizado, updatedAt: new Date().toISOString() }
        : produto
    ));
  };

  const removerProduto = (id: string) => {
    setProdutos(prev => prev.filter(produto => produto.id !== id));
  };

  // Funções para clientes
  const adicionarCliente = (cliente: Cliente) => {
    setClientes(prev => [...prev, cliente]);
  };

  const atualizarCliente = (id: string, clienteAtualizado: Partial<Cliente>) => {
    setClientes(prev => prev.map(cliente => 
      cliente.id === id 
        ? { ...cliente, ...clienteAtualizado, updatedAt: new Date().toISOString() }
        : cliente
    ));
  };

  const removerCliente = (id: string) => {
    setClientes(prev => prev.filter(cliente => cliente.id !== id));
  };

  // Funções para vendas
  const adicionarVenda = (venda: Venda) => {
    setVendas(prev => [...prev, venda]);
    
    // Atualizar estoque dos produtos vendidos
    venda.itens.forEach(item => {
      const produto = produtos.find(p => p.id === item.produtoId);
      if (produto) {
        atualizarProduto(item.produtoId, {
          quantidadeEstoque: produto.quantidadeEstoque - item.quantidade
        });
      }
    });

    // Atualizar faturamento total
    setFaturamentoTotal(prev => prev + venda.total);
    
    // Calcular e atualizar lucro
    const lucroVenda = venda.itens.reduce((lucroItem, item) => {
      const produto = produtos.find(p => p.id === item.produtoId);
      if (produto) {
        const custoTotal = produto.precoCusto * item.quantidade;
        const receitaTotal = item.subtotal;
        return lucroItem + (receitaTotal - custoTotal);
      }
      return lucroItem;
    }, 0);
    
    setLucroTotal(prev => prev + lucroVenda);
  };

  const atualizarVenda = (id: string, vendaAtualizada: Partial<Venda>) => {
    setVendas(prev => prev.map(venda => 
      venda.id === id 
        ? { ...venda, ...vendaAtualizada, updatedAt: new Date().toISOString() }
        : venda
    ));
  };

  const removerVenda = (id: string) => {
    setVendas(prev => prev.filter(venda => venda.id !== id));
  };

  // Funções para manutenções
  const adicionarManutencao = (manutencao: Manutencao) => {
    setManutencoes(prev => [...prev, manutencao]);
  };

  const atualizarManutencao = (id: string, manutencaoAtualizada: Partial<Manutencao>) => {
    const manutencaoAnterior = manutencoes.find(m => m.id === id);
    
    setManutencoes(prev => prev.map(manutencao => 
      manutencao.id === id 
        ? { ...manutencao, ...manutencaoAtualizada, updatedAt: new Date().toISOString() }
        : manutencao
    ));

    // Se o status mudou para "entregue", atualizar faturamento e lucro
    if (manutencaoAnterior && 
        manutencaoAnterior.status !== 'entregue' && 
        manutencaoAtualizada.status === 'entregue') {
      
      const manutencaoAtualizada_completa = { ...manutencaoAnterior, ...manutencaoAtualizada };
      
      // Adicionar ao faturamento
      setFaturamentoTotal(prev => prev + manutencaoAtualizada_completa.valorServico);
      
      // Calcular e adicionar ao lucro (valor do serviço - custo do material)
      const custoMaterial = manutencaoAtualizada_completa.custoMaterial || 0;
      const lucroManutencao = manutencaoAtualizada_completa.valorServico - custoMaterial;
      setLucroTotal(prev => prev + lucroManutencao);
    }
  };

  const removerManutencao = (id: string) => {
    setManutencoes(prev => prev.filter(manutencao => manutencao.id !== id));
  };

  // Funções para termos de garantia
  const adicionarTermoGarantia = (termo: TermoGarantia) => {
    setTermosGarantia(prev => [...prev, termo]);
  };

  const atualizarTermoGarantia = (id: string, termoAtualizado: Partial<TermoGarantia>) => {
    setTermosGarantia(prev => prev.map(termo => 
      termo.id === id 
        ? { ...termo, ...termoAtualizado, updatedAt: new Date().toISOString() }
        : termo
    ));
  };

  const removerTermoGarantia = (id: string) => {
    setTermosGarantia(prev => prev.filter(termo => termo.id !== id));
  };

  // Funções para usuários (apenas admin)
  const criarUsuario = async (dadosUsuario: Omit<User, 'id' | 'createdAt'>) => {
    // Se tiver email, criar no Supabase também
    if (dadosUsuario.username.includes('@') && dadosUsuario.password) {
      const { user: supabaseUserData, error } = await createUserInSupabase(
        dadosUsuario.username, 
        dadosUsuario.password
      );
      
      if (supabaseUserData && !error) {
        // Criar perfil de loja vazio para o novo usuário
        await createUserStoreProfile(supabaseUserData.id, {});
        
        // Criar usuário local também para compatibilidade
        const novoUsuario: User = {
          ...dadosUsuario,
          id: supabaseUserData.id,
          createdAt: new Date().toISOString()
        };
        setUsuarios(prev => [...prev, novoUsuario]);
        return;
      }
    }

    // Criar usuário apenas localmente
    const novoUsuario: User = {
      ...dadosUsuario,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setUsuarios(prev => [...prev, novoUsuario]);
  };

  const removerUsuario = (id: string) => {
    setUsuarios(prev => prev.filter(usuario => usuario.id !== id));
  };

  // Função para atualizar dados da loja
  const atualizarDadosLoja = async (dados: Partial<DadosLoja>) => {
    const novosDados = { ...dadosLoja, ...dados };
    setDadosLoja(novosDados);

    // Se for usuário do Supabase, atualizar perfil no banco
    if (supabaseUser) {
      await updateUserStoreProfile(supabaseUser.id, {
        nome: novosDados.nome,
        cnpj: novosDados.cnpj,
        telefone: novosDados.telefone,
        email: novosDados.email,
        endereco: novosDados.endereco,
        logo: novosDados.logo
      });
    }
  };

  const value: AppContextType = {
    // Autenticação
    user,
    supabaseUser,
    login,
    logout,
    loginAttempts,
    resetUserPassword,
    
    // Produtos
    produtos,
    adicionarProduto,
    atualizarProduto,
    removerProduto,
    
    // Clientes
    clientes,
    adicionarCliente,
    atualizarCliente,
    removerCliente,
    
    // Vendas
    vendas,
    adicionarVenda,
    atualizarVenda,
    removerVenda,
    
    // Manutenções
    manutencoes,
    adicionarManutencao,
    atualizarManutencao,
    removerManutencao,
    
    // Termos de Garantia
    termosGarantia,
    adicionarTermoGarantia,
    atualizarTermoGarantia,
    removerTermoGarantia,
    
    // Usuários
    usuarios,
    criarUsuario,
    removerUsuario,

    // Dados da Loja
    dadosLoja,
    atualizarDadosLoja,

    // Faturamento e lucro
    faturamentoTotal,
    lucroTotal
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}
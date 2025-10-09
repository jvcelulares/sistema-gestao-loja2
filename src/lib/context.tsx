'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Produto, Cliente, Venda, Manutencao, TermoGarantia, DadosLoja, Vendedor } from './types';
import { DADOS_LOJA } from './constants';
import { 
  supabase, 
  getCurrentUser, 
  loginUser, 
  logoutUser, 
  saveStoreData, 
  loadStoreData,
  createUserStoreProfile,
  getUserStoreProfile,
  updateUserStoreProfile,
  createAdminUser,
  loadAdminUsers,
  removeAdminUser,
  createUserInSupabase,
  syncUserWithSupabase
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
  
  // Vendedores
  vendedores: Vendedor[];
  adicionarVendedor: (vendedor: Vendedor) => void;
  atualizarVendedor: (id: string, vendedor: Partial<Vendedor>) => void;
  removerVendedor: (id: string) => void;
  
  // Usuários (apenas para admin)
  usuarios: User[];
  criarUsuario: (usuario: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  removerUsuario: (id: string) => void;
  carregarUsuarios: () => Promise<void>;

  // Dados da Loja (configuráveis)
  dadosLoja: DadosLoja;
  atualizarDadosLoja: (dados: Partial<DadosLoja>) => Promise<void>;

  // Faturamento e lucro (para dashboard)
  faturamentoTotal: number;
  lucroTotal: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// CORREÇÃO: Dados da loja limpos para novos usuários
const DADOS_LOJA_LIMPOS: DadosLoja = {
  nome: '',
  cnpj: '',
  telefone: '',
  email: '',
  endereco: '',
  redesSociais: '',
  logo: ''
};

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
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [dadosLoja, setDadosLoja] = useState<DadosLoja>(DADOS_LOJA_LIMPOS);
  const [faturamentoTotal, setFaturamentoTotal] = useState(0);
  const [lucroTotal, setLucroTotal] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Verificar hidratação
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsHydrated(true);
    }
  }, []);

  // Função segura para acessar localStorage
  const safeLocalStorage = {
    getItem: (key: string) => {
      if (!isHydrated || typeof window === 'undefined') return null;
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.warn('Erro ao acessar localStorage:', error);
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      if (!isHydrated || typeof window === 'undefined') return;
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.warn('Erro ao salvar no localStorage:', error);
      }
    },
    removeItem: (key: string) => {
      if (!isHydrated || typeof window === 'undefined') return;
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Erro ao remover do localStorage:', error);
      }
    }
  };

  // Função para obter chave de localStorage específica do usuário
  const getUserStorageKey = useCallback((key: string, userId?: string) => {
    const currentUserId = userId || user?.id || 'default';
    return `gp-${key}-${currentUserId}`;
  }, [user?.id]);

  // CORREÇÃO: Função para salvar dados no Supabase com proteção robusta contra erros
  const saveDataToSupabase = useCallback(async (userId: string) => {
    if (!isHydrated || !userId) return;
    
    try {
      const storeData = {
        produtos,
        clientes,
        vendas,
        manutencoes,
        termosGarantia,
        vendedores,
        usuarios,
        dadosLoja,
        faturamentoTotal,
        lucroTotal
      };
      
      await saveStoreData(userId, storeData);
      console.log('✅ Dados salvos no Supabase com sucesso');
    } catch (error) {
      console.warn('⚠️ Erro ao salvar dados no Supabase (ignorado):', error);
      // Não propagar o erro para evitar quebrar o fluxo
    }
  }, [produtos, clientes, vendas, manutencoes, termosGarantia, vendedores, usuarios, dadosLoja, faturamentoTotal, lucroTotal, isHydrated]);

  // CORREÇÃO: Função para carregar dados do Supabase com proteção robusta contra erros
  const loadDataFromSupabase = useCallback(async (userId: string) => {
    if (!isHydrated || !userId) return false;
    
    try {
      const { data, error } = await loadStoreData(userId);
      
      if (error) {
        console.warn('⚠️ Erro ao carregar dados do Supabase (ignorado):', error);
        return false;
      }

      if (data) {
        setProdutos(data.produtos || []);
        setClientes(data.clientes || []);
        setVendas(data.vendas || []);
        setManutencoes(data.manutencoes || []);
        setTermosGarantia(data.termosGarantia || []);
        setVendedores(data.vendedores || []);
        setUsuarios(data.usuarios || []);
        setDadosLoja(data.dadosLoja || DADOS_LOJA_LIMPOS);
        setFaturamentoTotal(data.faturamentoTotal || 0);
        setLucroTotal(data.lucroTotal || 0);
        
        console.log('✅ Dados carregados do Supabase com sucesso');
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn('⚠️ Erro ao carregar dados do Supabase (ignorado):', error);
      return false;
    }
  }, [isHydrated]);

  // CORREÇÃO: Função estável para carregar usuários sem dependência circular
  const carregarUsuarios = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔄 Carregando usuários do sistema...');
      
      // Se for usuário do Supabase (admin), carregar usuários criados por ele
      if (user.type === 'supabase' && supabaseUser?.id) {
        console.log('📡 Carregando usuários do Supabase...');
        const { data: adminUsers } = await loadAdminUsers(supabaseUser.id);
        
        if (adminUsers && Array.isArray(adminUsers)) {
          const mappedUsers = adminUsers.map((profile: any) => ({
            id: profile.user_id,
            username: profile.username || profile.email,
            email: profile.email,
            password: profile.password || 'senha123', // CORREÇÃO: Garantir que senha existe
            role: profile.role || 'user',
            type: 'supabase',
            createdAt: profile.created_at,
            expiresAt: profile.subscription_expires_at,
            tempoAcesso: profile.subscription_expires_at ? 
              Math.ceil((new Date(profile.subscription_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
              null
          }));
          
          setUsuarios(mappedUsers);
          
          // Salvar também no localStorage para persistência
          if (isHydrated) {
            try {
              localStorage.setItem('gp-usuarios-supabase', JSON.stringify(mappedUsers));
            } catch (e) {
              console.warn('Erro ao salvar usuários:', e);
            }
          }
          
          console.log(`✅ ${mappedUsers.length} usuários carregados do Supabase e sincronizados`);
        } else {
          console.log('📝 Nenhum usuário encontrado no Supabase');
          setUsuarios([]);
        }
      } else {
        // Para admin local, carregar do localStorage
        console.log('💾 Carregando usuários do localStorage...');
        if (isHydrated) {
          try {
            const savedUsuarios = localStorage.getItem('gp-usuarios');
            if (savedUsuarios) {
              const parsedUsuarios = JSON.parse(savedUsuarios);
              if (Array.isArray(parsedUsuarios)) {
                setUsuarios(parsedUsuarios);
                console.log(`✅ ${parsedUsuarios.length} usuários carregados do localStorage`);
              }
            } else {
              setUsuarios([]);
            }
          } catch (e) {
            console.warn('⚠️ Erro ao carregar usuários do localStorage:', e);
            setUsuarios([]);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar usuários (ignorado):', error);
      setUsuarios([]);
    }
  }, [user?.id, user?.type, supabaseUser?.id, isHydrated]);

  // CORREÇÃO: Inicialização do contexto com proteção robusta
  useEffect(() => {
    if (!isHydrated) return;

    const initializeApp = async () => {
      try {
        // Aguardar um pouco para garantir que o DOM está pronto
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verificar se há usuário logado no Supabase
        const { data: supabaseUserData } = await getCurrentUser();
        
        if (supabaseUserData) {
          setSupabaseUser(supabaseUserData);
          
          // Carregar perfil do usuário
          const { data: profile } = await getUserStoreProfile(supabaseUserData.id);
          
          if (profile) {
            const userData: User = {
              id: supabaseUserData.id,
              username: supabaseUserData.email || '',
              email: supabaseUserData.email,
              role: profile.role === 'admin' ? 'admin' : 'user',
              type: 'supabase',
              createdAt: profile.created_at || new Date().toISOString(),
              expiresAt: profile.subscription_expires_at
            };
            
            setUser(userData);
            
            // Carregar dados da loja do perfil do usuário ou usar limpos
            if (profile.store_name || profile.store_cnpj || profile.store_phone) {
              setDadosLoja({
                nome: profile.store_name || '',
                cnpj: profile.store_cnpj || '',
                telefone: profile.store_phone || '',
                email: profile.store_email || supabaseUserData.email || '',
                endereco: profile.store_address || '',
                redesSociais: profile.store_social_media || '',
                logo: profile.store_logo || ''
              });
            } else {
              setDadosLoja(DADOS_LOJA_LIMPOS);
            }
            
            // Carregar dados da loja do Supabase
            const dataLoaded = await loadDataFromSupabase(supabaseUserData.id);
            
            // Se não conseguiu carregar do Supabase, tentar localStorage como fallback
            if (!dataLoaded) {
              try {
                const savedProdutos = safeLocalStorage.getItem(getUserStorageKey('produtos', supabaseUserData.id));
                const savedClientes = safeLocalStorage.getItem(getUserStorageKey('clientes', supabaseUserData.id));
                const savedVendas = safeLocalStorage.getItem(getUserStorageKey('vendas', supabaseUserData.id));
                const savedManutencoes = safeLocalStorage.getItem(getUserStorageKey('manutencoes', supabaseUserData.id));
                const savedTermosGarantia = safeLocalStorage.getItem(getUserStorageKey('termos-garantia', supabaseUserData.id));
                const savedVendedores = safeLocalStorage.getItem(getUserStorageKey('vendedores', supabaseUserData.id));

                if (savedProdutos) setProdutos(JSON.parse(savedProdutos));
                if (savedClientes) setClientes(JSON.parse(savedClientes));
                if (savedVendas) setVendas(JSON.parse(savedVendas));
                if (savedManutencoes) setManutencoes(JSON.parse(savedManutencoes));
                if (savedTermosGarantia) setTermosGarantia(JSON.parse(savedTermosGarantia));
                if (savedVendedores) setVendedores(JSON.parse(savedVendedores));
              } catch (e) {
                console.warn('Erro ao carregar dados do localStorage:', e);
              }
            }
          }
        } else {
          // Carregar dados do localStorage apenas no cliente
          try {
            const savedLoginAttempts = safeLocalStorage.getItem('gp-login-attempts');
            const savedUsuarios = safeLocalStorage.getItem('gp-usuarios');
            const savedDadosLoja = safeLocalStorage.getItem('gp-dados-loja');
            const savedFaturamento = safeLocalStorage.getItem('gp-faturamento-total');
            const savedLucro = safeLocalStorage.getItem('gp-lucro-total');
            const savedUser = safeLocalStorage.getItem('gp-user');

            if (savedLoginAttempts) {
              setLoginAttempts(parseInt(savedLoginAttempts) || 0);
            }
            if (savedUsuarios) {
              try {
                const parsedUsuarios = JSON.parse(savedUsuarios);
                if (Array.isArray(parsedUsuarios)) {
                  setUsuarios(parsedUsuarios);
                }
              } catch (e) {
                setUsuarios([]);
              }
            }
            if (savedFaturamento) {
              setFaturamentoTotal(parseFloat(savedFaturamento) || 0);
            }
            if (savedLucro) {
              setLucroTotal(parseFloat(savedLucro) || 0);
            }
            if (savedDadosLoja) {
              try {
                const parsedDados = JSON.parse(savedDadosLoja);
                if (parsedDados && typeof parsedDados === 'object') {
                  setDadosLoja(parsedDados);
                }
              } catch (e) {
                setDadosLoja(DADOS_LOJA_LIMPOS);
              }
            }
            if (savedUser) {
              try {
                const userData = JSON.parse(savedUser);
                if (userData && userData.id) {
                  setUser(userData);
                }
              } catch (e) {
                // Ignorar erro de parsing
              }
            }
          } catch (storageError) {
            console.warn('Erro ao acessar localStorage:', storageError);
          }
        }
      } catch (error) {
        console.warn('Erro ao inicializar app:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [isHydrated, getUserStorageKey, loadDataFromSupabase]);

  // CORREÇÃO: Carregar dados específicos do usuário quando user muda (SEM LOOP)
  useEffect(() => {
    if (!isInitialized || !user || !isHydrated) return;

    const loadUserData = async () => {
      try {
        // Se for usuário do Supabase, não carregar dados aqui para evitar loop
        if (user.type === 'supabase') {
          console.log('🔄 Usuário Supabase detectado - dados já carregados na inicialização');
          return;
        }

        // Se for o usuário principal da JV Celulares, carrega dados iniciais se não existirem
        if (user.username === 'jvcell2023') {
          const savedProdutos = safeLocalStorage.getItem(getUserStorageKey('produtos'));
          const savedClientes = safeLocalStorage.getItem(getUserStorageKey('clientes'));
          const savedVendas = safeLocalStorage.getItem(getUserStorageKey('vendas'));
          const savedManutencoes = safeLocalStorage.getItem(getUserStorageKey('manutencoes'));
          const savedTermosGarantia = safeLocalStorage.getItem(getUserStorageKey('termos-garantia'));
          const savedVendedores = safeLocalStorage.getItem(getUserStorageKey('vendedores'));

          try {
            setProdutos(savedProdutos ? JSON.parse(savedProdutos) : produtosIniciais);
            setClientes(savedClientes ? JSON.parse(savedClientes) : clientesIniciais);
            setVendas(savedVendas ? JSON.parse(savedVendas) : vendasIniciais);
            setManutencoes(savedManutencoes ? JSON.parse(savedManutencoes) : manutencoesIniciais);
            setTermosGarantia(savedTermosGarantia ? JSON.parse(savedTermosGarantia) : termosGarantiaIniciais);
            setVendedores(savedVendedores ? JSON.parse(savedVendedores) : []);
            
            setDadosLoja(DADOS_LOJA);
          } catch (parseError) {
            // Se houver erro de parsing, usar dados iniciais
            setProdutos(produtosIniciais);
            setClientes(clientesIniciais);
            setVendas(vendasIniciais);
            setManutencoes(manutencoesIniciais);
            setTermosGarantia(termosGarantiaIniciais);
            setVendedores([]);
            setDadosLoja(DADOS_LOJA);
          }
        } else {
          // Para outros usuários, carrega dados específicos ou inicia vazio COM DADOS LIMPOS
          const savedProdutos = safeLocalStorage.getItem(getUserStorageKey('produtos'));
          const savedClientes = safeLocalStorage.getItem(getUserStorageKey('clientes'));
          const savedVendas = safeLocalStorage.getItem(getUserStorageKey('vendas'));
          const savedManutencoes = safeLocalStorage.getItem(getUserStorageKey('manutencoes'));
          const savedTermosGarantia = safeLocalStorage.getItem(getUserStorageKey('termos-garantia'));
          const savedVendedores = safeLocalStorage.getItem(getUserStorageKey('vendedores'));

          try {
            setProdutos(savedProdutos ? JSON.parse(savedProdutos) : []);
            setClientes(savedClientes ? JSON.parse(savedClientes) : []);
            setVendas(savedVendas ? JSON.parse(savedVendas) : []);
            setManutencoes(savedManutencoes ? JSON.parse(savedManutencoes) : []);
            setTermosGarantia(savedTermosGarantia ? JSON.parse(savedTermosGarantia) : []);
            setVendedores(savedVendedores ? JSON.parse(savedVendedores) : []);
            
            setDadosLoja(DADOS_LOJA_LIMPOS);
          } catch (parseError) {
            // Se houver erro de parsing, iniciar com arrays vazios e dados limpos
            setProdutos([]);
            setClientes([]);
            setVendas([]);
            setManutencoes([]);
            setTermosGarantia([]);
            setVendedores([]);
            setDadosLoja(DADOS_LOJA_LIMPOS);
          }
        }
      } catch (error) {
        console.warn('Erro ao carregar dados do usuário:', error);
      }
    };

    loadUserData();
  }, [user?.id, user?.type, user?.username, isInitialized, isHydrated, getUserStorageKey]);

  // CORREÇÃO: Salvar dados no localStorage E no Supabase com proteção (SEM LOOP)
  useEffect(() => {
    if (!isInitialized || !isHydrated) return;
    
    try {
      if (user) {
        safeLocalStorage.setItem('gp-user', JSON.stringify(user));
      }
      safeLocalStorage.setItem('gp-login-attempts', loginAttempts.toString());
      
      // CORREÇÃO: Salvar usuários com persistência garantida
      if (usuarios.length > 0) {
        if (user?.type === 'supabase') {
          safeLocalStorage.setItem('gp-usuarios-supabase', JSON.stringify(usuarios));
        } else {
          safeLocalStorage.setItem('gp-usuarios', JSON.stringify(usuarios));
        }
        console.log(`💾 ${usuarios.length} usuários salvos no localStorage`);
      }
      
      safeLocalStorage.setItem('gp-dados-loja', JSON.stringify(dadosLoja));
      safeLocalStorage.setItem('gp-faturamento-total', faturamentoTotal.toString());
      safeLocalStorage.setItem('gp-lucro-total', lucroTotal.toString());
    } catch (error) {
      console.warn('Erro ao salvar dados globais:', error);
    }
  }, [user?.id, loginAttempts, usuarios, dadosLoja.nome, faturamentoTotal, lucroTotal, isInitialized, isHydrated]);

  // CORREÇÃO: Salvar dados específicos do usuário com debounce maior para evitar requests excessivos
  useEffect(() => {
    if (!isInitialized || !user || !isHydrated) return;
    
    // Debounce para evitar salvamentos excessivos
    const timeoutId = setTimeout(() => {
      try {
        safeLocalStorage.setItem(getUserStorageKey('produtos'), JSON.stringify(produtos));
        safeLocalStorage.setItem(getUserStorageKey('clientes'), JSON.stringify(clientes));
        safeLocalStorage.setItem(getUserStorageKey('vendas'), JSON.stringify(vendas));
        safeLocalStorage.setItem(getUserStorageKey('manutencoes'), JSON.stringify(manutencoes));
        safeLocalStorage.setItem(getUserStorageKey('termos-garantia'), JSON.stringify(termosGarantia));
        safeLocalStorage.setItem(getUserStorageKey('vendedores'), JSON.stringify(vendedores));
        
        // Se for usuário do Supabase, salvar também no banco com debounce ainda maior
        if (user.type === 'supabase' && supabaseUser) {
          const supabaseTimeoutId = setTimeout(() => {
            saveDataToSupabase(supabaseUser.id).catch(error => {
              console.warn('Erro ao salvar no Supabase (ignorado):', error);
            });
          }, 15000); // CORREÇÃO: Aumentar debounce para 15 segundos para evitar requests excessivos
          
          return () => clearTimeout(supabaseTimeoutId);
        }
      } catch (error) {
        console.warn('Erro ao salvar dados do usuário:', error);
      }
    }, 2000); // Debounce de 2 segundos para localStorage
    
    return () => clearTimeout(timeoutId);
  }, [produtos.length, clientes.length, vendas.length, manutencoes.length, termosGarantia.length, vendedores.length, user?.id, isInitialized, isHydrated, getUserStorageKey, saveDataToSupabase, supabaseUser]);

  const login = async (username: string, password: string, type: 'normal' | 'admin' = 'normal'): Promise<boolean> => {
    try {
      console.log('🔄 Tentando login...', { username, type });
      
      // Para login normal, SEMPRE tentar Supabase primeiro
      if (type === 'normal') {
        console.log('🔄 Tentando login no Supabase para usuário normal...');
        
        // Tentar login no Supabase
        const { data: supabaseData, error } = await loginUser(username, password);
        
        if (supabaseData && supabaseData.user && !error) {
          console.log('✅ Login no Supabase bem-sucedido para usuário normal');
          setSupabaseUser(supabaseData.user);
          
          // Verificar se o usuário tem perfil
          let profile = await getUserStoreProfile(supabaseData.user.id);
          
          if (!profile.data) {
            // Criar perfil com dados da loja limpos para novos usuários
            await createUserStoreProfile(supabaseData.user.id, {
              email: supabaseData.user.email,
              subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
              is_active: true,
              store_name: '',
              store_cnpj: '',
              store_phone: '',
              store_email: '',
              store_address: '',
              store_social_media: '',
              store_logo: ''
            });
            profile = await getUserStoreProfile(supabaseData.user.id);
          }
          
          // Verificar se a assinatura ainda está válida
          if (profile.data) {
            const now = new Date();
            const expiresAt = new Date(profile.data.subscription_expires_at);
            
            if (now > expiresAt) {
              console.error('❌ Assinatura expirada');
              return false;
            }
            
            const userData: User = {
              id: supabaseData.user.id,
              username: supabaseData.user.email || '',
              email: supabaseData.user.email,
              role: 'user',
              type: 'supabase',
              createdAt: profile.data.created_at || new Date().toISOString(),
              expiresAt: profile.data.subscription_expires_at
            };
            
            setUser(userData);
            setLoginAttempts(0);
            
            // Definir dados da loja baseado no perfil ou limpos para novos usuários
            if (profile.data.store_name || profile.data.store_cnpj || profile.data.store_phone) {
              setDadosLoja({
                nome: profile.data.store_name || '',
                cnpj: profile.data.store_cnpj || '',
                telefone: profile.data.store_phone || '',
                email: profile.data.store_email || supabaseData.user.email || '',
                endereco: profile.data.store_address || '',
                redesSociais: profile.data.store_social_media || '',
                logo: profile.data.store_logo || ''
              });
            } else {
              setDadosLoja(DADOS_LOJA_LIMPOS);
            }
            
            // Carregar dados do Supabase
            await loadDataFromSupabase(supabaseData.user.id);
            
            console.log('✅ Login realizado com sucesso via Supabase (usuário normal)');
            return true;
          }
        } else {
          console.log('⚠️ Falha no login do Supabase para usuário normal:', error?.message);
        }
        
        // Se falhou no Supabase, tentar login local (sistema antigo) apenas para usuário específico
        if (username === 'jvcell2023' && password === 'Jesuscristovive') {
          console.log('✅ Login local bem-sucedido (jvcell2023)');
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
        
        // CORREÇÃO: Verificar usuários criados pelo admin (sistema local) - BUSCA MELHORADA
        console.log('🔍 Verificando usuários criados pelo admin...');
        
        // CORREÇÃO: Carregar usuários de AMBAS as fontes e garantir persistência
        let todosUsuarios: User[] = [];
        
        // Primeiro, tentar carregar do estado atual (mais confiável)
        if (usuarios.length > 0) {
          todosUsuarios = [...usuarios];
          console.log(`📋 ${usuarios.length} usuários carregados do estado atual`);
        } else {
          // Se não há usuários no estado, carregar do localStorage
          const usuariosLocais = safeLocalStorage.getItem('gp-usuarios');
          const usuariosSupabaseStorage = safeLocalStorage.getItem('gp-usuarios-supabase');
          
          if (usuariosLocais) {
            try {
              const parsedLocais = JSON.parse(usuariosLocais);
              if (Array.isArray(parsedLocais)) {
                todosUsuarios = [...todosUsuarios, ...parsedLocais];
                console.log(`📋 ${parsedLocais.length} usuários locais carregados do localStorage`);
              }
            } catch (e) {
              console.warn('Erro ao parsear usuários locais:', e);
            }
          }
          
          if (usuariosSupabaseStorage) {
            try {
              const parsedSupabase = JSON.parse(usuariosSupabaseStorage);
              if (Array.isArray(parsedSupabase)) {
                todosUsuarios = [...todosUsuarios, ...parsedSupabase];
                console.log(`📋 ${parsedSupabase.length} usuários Supabase carregados do localStorage`);
              }
            } catch (e) {
              console.warn('Erro ao parsear usuários Supabase:', e);
            }
          }
          
          // Atualizar o estado com os usuários carregados
          if (todosUsuarios.length > 0) {
            setUsuarios(todosUsuarios);
          }
        }
        
        console.log(`🔍 Total de usuários para verificação: ${todosUsuarios.length}`);
        
        // CORREÇÃO: Busca mais flexível e robusta
        const usuarioEncontrado = todosUsuarios.find(u => {
          // Verificar se tem senha definida
          if (!u.password) {
            console.log(`⚠️ Usuário ${u.username} sem senha definida`);
            return false;
          }
          
          const matchUsername = u.username === username;
          const matchEmail = u.email === username;
          const matchPassword = u.password === password;
          
          console.log(`🔍 Verificando usuário ${u.username}:`, {
            matchUsername,
            matchEmail,
            matchPassword,
            userPassword: u.password ? '***' : 'VAZIO'
          });
          
          return (matchUsername || matchEmail) && matchPassword;
        });
        
        if (usuarioEncontrado) {
          console.log('✅ Usuário encontrado no sistema local:', usuarioEncontrado.username);
          
          // Verificar se o usuário ainda está dentro do prazo de acesso
          if (usuarioEncontrado.expiresAt) {
            const agora = new Date();
            const expiracao = new Date(usuarioEncontrado.expiresAt);
            
            if (agora <= expiracao) {
              setUser(usuarioEncontrado);
              setLoginAttempts(0);
              setDadosLoja(DADOS_LOJA_LIMPOS);
              console.log('✅ Login realizado com sucesso via sistema local');
              return true;
            } else {
              console.log('❌ Usuário local com assinatura expirada');
            }
          } else {
            // Se não tem data de expiração, permitir login
            setUser(usuarioEncontrado);
            setLoginAttempts(0);
            setDadosLoja(DADOS_LOJA_LIMPOS);
            console.log('✅ Login realizado com sucesso via sistema local (sem expiração)');
            return true;
          }
        } else {
          console.log('❌ Usuário não encontrado no sistema local');
          console.log('📋 Lista completa de usuários disponíveis:');
          todosUsuarios.forEach((u, index) => {
            console.log(`  ${index + 1}. ${u.username} (senha: ${u.password ? '***' : 'VAZIO'})`);
          });
        }
        
        console.log('❌ Credenciais inválidas para login normal');
        setLoginAttempts(prev => prev + 1);
        return false;
      }
      
      // Para login admin, manter lógica original
      if (type === 'admin') {
        // Primeiro tentar login no Supabase para admin
        const { data: supabaseData, error } = await loginUser(username, password);
        
        if (supabaseData && supabaseData.user && !error) {
          console.log('✅ Login admin no Supabase bem-sucedido');
          setSupabaseUser(supabaseData.user);
          
          // Verificar se o usuário tem perfil
          let profile = await getUserStoreProfile(supabaseData.user.id);
          
          if (!profile.data) {
            // Criar perfil com dados da loja limpos para novos admins
            await createUserStoreProfile(supabaseData.user.id, {
              email: supabaseData.user.email,
              subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
              is_active: true,
              role: 'admin',
              store_name: '',
              store_cnpj: '',
              store_phone: '',
              store_email: '',
              store_address: '',
              store_social_media: '',
              store_logo: ''
            });
            profile = await getUserStoreProfile(supabaseData.user.id);
          }
          
          // Verificar se a assinatura ainda está válida
          if (profile.data) {
            const now = new Date();
            const expiresAt = new Date(profile.data.subscription_expires_at);
            
            if (now > expiresAt) {
              console.error('Assinatura expirada');
              return false;
            }
            
            const userData: User = {
              id: supabaseData.user.id,
              username: supabaseData.user.email || '',
              email: supabaseData.user.email,
              role: 'admin',
              type: 'supabase',
              createdAt: profile.data.created_at || new Date().toISOString(),
              expiresAt: profile.data.subscription_expires_at
            };
            
            setUser(userData);
            setLoginAttempts(0);
            
            // Definir dados da loja baseado no perfil ou limpos para novos admins
            if (profile.data.store_name || profile.data.store_cnpj || profile.data.store_phone) {
              setDadosLoja({
                nome: profile.data.store_name || '',
                cnpj: profile.data.store_cnpj || '',
                telefone: profile.data.store_phone || '',
                email: profile.data.store_email || supabaseData.user.email || '',
                endereco: profile.data.store_address || '',
                redesSociais: profile.data.store_social_media || '',
                logo: profile.data.store_logo || ''
              });
            } else {
              setDadosLoja(DADOS_LOJA_LIMPOS);
            }
            
            // Carregar dados do Supabase
            await loadDataFromSupabase(supabaseData.user.id);
            
            console.log('✅ Login admin realizado com sucesso via Supabase');
            return true;
          }
        }
        
        // Se falhou no Supabase, tentar login admin local
        if (username === 'JOAOADM' && password === 'JESUSADM') {
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
      }
      
      console.log('❌ Credenciais inválidas');
      setLoginAttempts(prev => prev + 1);
      return false;
    } catch (error) {
      console.warn('❌ Erro no login:', error);
      setLoginAttempts(prev => prev + 1);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Logout do Supabase se estiver logado
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
      setVendedores([]);
      setUsuarios([]);
      setDadosLoja(DADOS_LOJA_LIMPOS);
      setFaturamentoTotal(0);
      setLucroTotal(0);
      
      safeLocalStorage.removeItem('gp-user');
    } catch (error) {
      console.warn('Erro no logout:', error);
    }
  };

  const resetUserPassword = async (email: string) => {
    try {
      // Simular reset de senha para usuários locais
      return { success: true };
    } catch (error) {
      return { error };
    }
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

  // Funções para vendedores
  const adicionarVendedor = (vendedor: Vendedor) => {
    setVendedores(prev => [...prev, vendedor]);
  };

  const atualizarVendedor = (id: string, vendedorAtualizado: Partial<Vendedor>) => {
    setVendedores(prev => prev.map(vendedor => 
      vendedor.id === id 
        ? { ...vendedor, ...vendedorAtualizado, updatedAt: new Date().toISOString() }
        : vendedor
    ));
  };

  const removerVendedor = (id: string) => {
    setVendedores(prev => prev.filter(vendedor => vendedor.id !== id));
  };

  // CORREÇÃO: Funções para usuários com persistência garantida
  const criarUsuario = async (dadosUsuario: Omit<User, 'id' | 'createdAt'>) => {
    try {
      console.log('🔄 Iniciando criação de usuário com persistência garantida...');
      
      // Se for usuário do Supabase (admin logado via Supabase), criar no Supabase
      if (user?.type === 'supabase' && supabaseUser) {
        console.log('📡 Criando usuário no Supabase via painel administrativo...');
        
        const { data, error } = await createAdminUser(supabaseUser.id, {
          email: dadosUsuario.email || dadosUsuario.username,
          password: dadosUsuario.password || 'senha123',
          username: dadosUsuario.username,
          role: dadosUsuario.role,
          subscriptionExpiresAt: dadosUsuario.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
        
        if (error) {
          console.error('❌ Erro ao criar usuário no Supabase:', error);
          throw error;
        }
        
        // Recarregar usuários para garantir sincronização
        await carregarUsuarios();
        
        console.log('✅ Usuário criado e sincronizado com Supabase com sucesso!');
        console.log('✅ O usuário pode agora fazer login no sistema normal');
        
      } else {
        // CORREÇÃO: Criar usuário local com persistência GARANTIDA
        console.log('🔄 Criando usuário local com persistência garantida...');
        
        const novoUsuario: User = {
          ...dadosUsuario,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          // CORREÇÃO: Garantir que senha seja salva
          password: dadosUsuario.password || 'senha123'
        };
        
        console.log('💾 Dados do novo usuário:', {
          username: novoUsuario.username,
          email: novoUsuario.email,
          hasPassword: !!novoUsuario.password,
          password: novoUsuario.password ? '***' : 'VAZIO'
        });
        
        // CORREÇÃO: Atualizar estado E localStorage IMEDIATAMENTE
        const novosUsuarios = [...usuarios, novoUsuario];
        setUsuarios(novosUsuarios);
        
        // CORREÇÃO: Salvar IMEDIATAMENTE no localStorage com verificação
        try {
          const usuariosParaSalvar = JSON.stringify(novosUsuarios);
          safeLocalStorage.setItem('gp-usuarios', usuariosParaSalvar);
          
          // Verificar se foi salvo corretamente
          const verificacao = safeLocalStorage.getItem('gp-usuarios');
          if (verificacao) {
            const usuariosVerificados = JSON.parse(verificacao);
            console.log('✅ Verificação: usuários salvos no localStorage:', usuariosVerificados.length);
            console.log('✅ Último usuário salvo:', {
              username: usuariosVerificados[usuariosVerificados.length - 1]?.username,
              hasPassword: !!usuariosVerificados[usuariosVerificados.length - 1]?.password
            });
          } else {
            console.error('❌ Falha na verificação: usuários não foram salvos');
          }
        } catch (error) {
          console.error('❌ Erro crítico ao salvar usuário no localStorage:', error);
          throw error;
        }
        
        // Tentar sincronizar com Supabase em background (opcional)
        try {
          const syncResult = await syncUserWithSupabase(novoUsuario);
          if (syncResult) {
            console.log('✅ Usuário também sincronizado com Supabase!');
          }
        } catch (syncError) {
          console.log('⚠️ Usuário criado localmente, mas não foi possível sincronizar com Supabase:', syncError);
        }
        
        console.log('✅ Usuário criado com sucesso e salvo localmente!');
        console.log('✅ O usuário pode agora fazer login no sistema normal');
      }
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      throw error;
    }
  };

  const removerUsuario = async (id: string) => {
    try {
      // Se for usuário do Supabase, remover do Supabase
      if (user?.type === 'supabase' && supabaseUser) {
        const { success, error } = await removeAdminUser(id);
        
        if (!success) {
          console.error('Erro ao remover usuário do Supabase:', error);
          return;
        }
        
        // Recarregar lista de usuários
        await carregarUsuarios();
      } else {
        // Remover usuário local
        const novosUsuarios = usuarios.filter(usuario => usuario.id !== id);
        setUsuarios(novosUsuarios);
        
        // Salvar no localStorage imediatamente
        safeLocalStorage.setItem('gp-usuarios', JSON.stringify(novosUsuarios));
        console.log(`✅ Usuário removido. Total restante: ${novosUsuarios.length}`);
      }
    } catch (error) {
      console.warn('Erro ao remover usuário:', error);
    }
  };

  // Função para atualizar dados da loja
  const atualizarDadosLoja = async (dados: Partial<DadosLoja>) => {
    const novosDados = { ...dadosLoja, ...dados };
    setDadosLoja(novosDados);
    
    // Se for usuário do Supabase, atualizar perfil
    if (user?.type === 'supabase' && supabaseUser) {
      await updateUserStoreProfile(supabaseUser.id, {
        store_name: novosDados.nome,
        store_cnpj: novosDados.cnpj,
        store_address: novosDados.endereco,
        store_phone: novosDados.telefone,
        store_email: novosDados.email,
        store_social_media: novosDados.redesSociais,
        store_logo: novosDados.logo
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
    
    // Vendedores
    vendedores,
    adicionarVendedor,
    atualizarVendedor,
    removerVendedor,
    
    // Usuários
    usuarios,
    criarUsuario,
    removerUsuario,
    carregarUsuarios,

    // Dados da Loja
    dadosLoja,
    atualizarDadosLoja,

    // Faturamento e lucro
    faturamentoTotal,
    lucroTotal
  };

  // Não renderizar até que a hidratação e inicialização estejam completas
  if (!isHydrated || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando sistema...</p>
        </div>
      </div>
    );
  }

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
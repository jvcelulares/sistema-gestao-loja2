export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'user' | 'super_admin';
  type?: 'normal' | 'admin';
  tempoAcesso?: number; // em dias
  expiresAt?: string;
  dadosLoja?: DadosLoja;
  createdAt: string;
}

export interface Produto {
  id: string;
  nome: string;
  marca: string;
  tipo: 'celular' | 'acessorio';
  modelo?: string;
  memoria?: string;
  imei1?: string;
  imei2?: string;
  cor?: string;
  condicao?: 'novo' | 'seminovo';
  numeroSerie?: string;
  dataCompra?: string;
  garantia?: string;
  fornecedor: string;
  precoCusto: number;
  precoVenda: number;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  descricao?: string;
  imagemUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cliente {
  id: string;
  nome: string;
  documento: string; // CPF ou RG
  telefone: string;
  email?: string;
  endereco?: string;
  cep?: string;
  dataNascimento?: string;
  comoConheceu?: 'indicacao' | 'redes_sociais' | 'google' | 'passando_na_rua' | 'outros';
  createdAt: string;
  updatedAt: string;
}

export interface ItemVenda {
  produtoId: string;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
  subtotal: number;
}

export interface Venda {
  id: string;
  nomeCliente: string;
  telefoneCliente?: string;
  clienteId?: string;
  vendedor: 'João' | 'Gabriel';
  formaPagamento: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix';
  itens: ItemVenda[];
  subtotal?: number;
  desconto?: number;
  total: number;
  lucro?: number;
  comissao?: number;
  observacoes?: string;
  termoGarantiaId?: string; // Novo campo para termo de garantia
  createdAt: string;
  updatedAt: string;
}

export interface Manutencao {
  id: string;
  nomeCliente: string;
  telefoneCliente: string;
  clienteId?: string;
  nomeAparelho: string;
  modeloAparelho: string;
  imeiAparelho?: string;
  chipCartao?: string;
  defeitoInformado: string;
  descricaoServico?: string;
  valorServico: number;
  custoMaterial?: number;
  lucro?: number;
  formaPagamento?: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix';
  dataRecebimento?: string;
  dataPrevistaEntrega?: string;
  dataEntrega?: string;
  status: 'recebido' | 'em_andamento' | 'concluido' | 'entregue' | 'cancelado';
  observacoes?: string;
  termoGarantiaId?: string; // Novo campo para termo de garantia
  createdAt: string;
  updatedAt: string;
}

// Nova interface para Termos de Garantia
export interface TermoGarantia {
  id: string;
  nome: string;
  descricao: string;
  prazoGarantia: number; // em dias
  condicoes: string;
  aplicaVendas: boolean;
  aplicaManutencoes: boolean;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DadosLoja {
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  logo?: string;
}

export interface Relatorio {
  id: string;
  tipo: 'vendas_diarias' | 'vendas_semanais' | 'vendas_mensais' | 'lucros' | 'estoque' | 'manutencoes';
  dataInicio: string;
  dataFim: string;
  dados: any;
  createdAt: string;
}

export interface AniversarianteCliente {
  id: string;
  nome: string;
  telefone: string;
  dataNascimento: string;
  diasParaAniversario: number;
}

// Interfaces para geração de PDF
export interface Sale {
  id: string;
  customerName: string;
  customerPhone?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  paymentMethod: string;
  date: string;
  seller?: string;
}

export interface Maintenance {
  id: string;
  customerName: string;
  customerPhone?: string;
  deviceName: string;
  deviceModel: string;
  imei?: string;
  defect: string;
  service: string;
  status: string;
  price: number;
  paymentMethod?: string;
  entryDate: string;
  deliveryDate?: string;
}

export interface StoreInfo {
  name: string;
  cnpj: string;
  address: string;
  phone: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  document?: string;
  cep?: string;
  birthDate?: string;
  howKnew?: string;
  createdAt: string;
}
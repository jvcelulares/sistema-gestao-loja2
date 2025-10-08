import { DadosLoja } from './types';

export const DADOS_LOJA: DadosLoja = {
  nome: 'Gestão Phone',
  cnpj: '51.475.193/0001-78',
  telefone: '(13) 99646-2348',
  email: 'contato@gestao-phone.com.br',
  endereco: 'AV ACARAU 298 GUARUJÁ VILA AUREA'
};

export const CREDENCIAIS_LOGIN = {
  username: 'jvcell2023',
  password: 'Jesuscristovive'
};

export const VENDEDORES = ['João', 'Gabriel'] as const;

export const FORMAS_PAGAMENTO = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'pix', label: 'PIX' }
] as const;

export const STATUS_MANUTENCAO = [
  { value: 'recebido', label: 'Recebido', color: 'yellow' },
  { value: 'em_andamento', label: 'Em Andamento', color: 'blue' },
  { value: 'concluido', label: 'Concluído', color: 'green' },
  { value: 'entregue', label: 'Entregue', color: 'gray' },
  { value: 'cancelado', label: 'Cancelado', color: 'red' }
] as const;

export const TIPOS_PRODUTO = [
  { value: 'celular', label: 'Celular' },
  { value: 'acessorio', label: 'Acessório' }
] as const;

export const CONDICOES_PRODUTO = [
  { value: 'novo', label: 'Novo' },
  { value: 'seminovo', label: 'Seminovo' }
] as const;

export const COMO_CONHECEU_OPCOES = [
  { value: 'indicacao', label: 'Indicação' },
  { value: 'redes_sociais', label: 'Redes Sociais' },
  { value: 'google', label: 'Google' },
  { value: 'passando_na_rua', label: 'Passando na rua' },
  { value: 'outros', label: 'Outros' }
] as const;
import { Venda, Manutencao, Cliente, Produto } from './types';

export function exportSalesToCSV(vendas: Venda[], filename: string = 'vendas.csv'): void {
  const headers = [
    'ID',
    'Data',
    'Cliente',
    'Telefone',
    'Vendedor',
    'Forma de Pagamento',
    'Total',
    'Produtos',
    'Quantidades'
  ];

  const csvContent = [
    headers.join(','),
    ...vendas.map(venda => [
      venda.id,
      new Date(venda.createdAt).toLocaleDateString('pt-BR'),
      `"${venda.nomeCliente}"`,
      venda.telefoneCliente,
      venda.vendedor,
      venda.formaPagamento,
      venda.total.toFixed(2),
      `"${venda.itens.map(item => item.nomeProduto).join('; ')}"`,
      venda.itens.map(item => item.quantidade).join('; ')
    ].join(','))
  ].join('\n');

  downloadCSV(csvContent, filename);
}

export function exportMaintenancesToCSV(manutencoes: Manutencao[], filename: string = 'manutencoes.csv'): void {
  const headers = [
    'ID',
    'Data',
    'Cliente',
    'Telefone',
    'Aparelho',
    'Modelo',
    'IMEI',
    'Defeito',
    'Serviço',
    'Status',
    'Valor',
    'Custo Material',
    'Forma de Pagamento',
    'Data Prevista Entrega'
  ];

  const csvContent = [
    headers.join(','),
    ...manutencoes.map(manutencao => [
      manutencao.id,
      new Date(manutencao.createdAt).toLocaleDateString('pt-BR'),
      `"${manutencao.nomeCliente}"`,
      manutencao.telefoneCliente,
      `"${manutencao.nomeAparelho}"`,
      `"${manutencao.modeloAparelho}"`,
      manutencao.imeiAparelho || '',
      `"${manutencao.defeitoInformado}"`,
      `"${manutencao.descricaoServico || ''}"`,
      manutencao.status,
      manutencao.valorServico.toFixed(2),
      (manutencao.custoMaterial || 0).toFixed(2),
      manutencao.formaPagamento || '',
      manutencao.dataPrevistaEntrega ? new Date(manutencao.dataPrevistaEntrega).toLocaleDateString('pt-BR') : ''
    ].join(','))
  ].join('\n');

  downloadCSV(csvContent, filename);
}

export function exportCustomersToCSV(clientes: Cliente[], filename: string = 'clientes.csv'): void {
  const headers = [
    'ID',
    'Nome',
    'Documento',
    'Telefone',
    'Email',
    'Endereço',
    'CEP',
    'Data Nascimento',
    'Como Conheceu',
    'Data Cadastro'
  ];

  const csvContent = [
    headers.join(','),
    ...clientes.map(cliente => [
      cliente.id,
      `"${cliente.nome}"`,
      cliente.documento,
      cliente.telefone,
      cliente.email || '',
      `"${cliente.endereco || ''}"`,
      cliente.cep || '',
      cliente.dataNascimento || '',
      cliente.comoConheceu || '',
      new Date(cliente.createdAt).toLocaleDateString('pt-BR')
    ].join(','))
  ].join('\n');

  downloadCSV(csvContent, filename);
}

export function exportProductsToCSV(produtos: Produto[], filename: string = 'produtos.csv'): void {
  const headers = [
    'ID',
    'Nome',
    'Marca',
    'Tipo',
    'Modelo',
    'Memória',
    'IMEI 1',
    'IMEI 2',
    'Cor',
    'Condição',
    'Fornecedor',
    'Preço Custo',
    'Preço Venda',
    'Estoque Atual',
    'Estoque Mínimo',
    'Descrição'
  ];

  const csvContent = [
    headers.join(','),
    ...produtos.map(produto => [
      produto.id,
      `"${produto.nome}"`,
      `"${produto.marca}"`,
      produto.tipo,
      `"${produto.modelo || ''}"`,
      produto.memoria || '',
      produto.imei1 || '',
      produto.imei2 || '',
      produto.cor || '',
      produto.condicao || '',
      `"${produto.fornecedor}"`,
      produto.precoCusto.toFixed(2),
      produto.precoVenda.toFixed(2),
      produto.quantidadeEstoque,
      produto.estoqueMinimo,
      `"${produto.descricao || ''}"`
    ].join(','))
  ].join('\n');

  downloadCSV(csvContent, filename);
}

function downloadCSV(content: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
import { Sale, Maintenance, Customer } from './types';

export const exportToCSV = (data: any[], filename: string, headers: string[]) => {
  // Criar cabeçalho CSV
  let csvContent = headers.join(',') + '\n';
  
  // Adicionar dados
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escapar aspas e adicionar aspas se necessário
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvContent += values.join(',') + '\n';
  });
  
  // Criar e baixar arquivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportSalesToCSV = (sales: Sale[], filename: string = 'vendas.csv') => {
  const headers = [
    'Data',
    'Cliente',
    'Telefone',
    'Produtos',
    'Quantidade Total',
    'Valor Total',
    'Forma de Pagamento',
    'Vendedor'
  ];
  
  const data = sales.map(sale => ({
    'Data': new Date(sale.date).toLocaleDateString('pt-BR'),
    'Cliente': sale.customerName,
    'Telefone': sale.customerPhone || '',
    'Produtos': sale.items.map(item => `${item.name} (${item.quantity}x)`).join('; '),
    'Quantidade Total': sale.items.reduce((sum, item) => sum + item.quantity, 0),
    'Valor Total': `R$ ${sale.total.toFixed(2)}`,
    'Forma de Pagamento': sale.paymentMethod,
    'Vendedor': sale.seller || ''
  }));
  
  exportToCSV(data, filename, headers);
};

export const exportMaintenancesToCSV = (maintenances: Maintenance[], filename: string = 'manutencoes.csv') => {
  const headers = [
    'Data de Entrada',
    'Data de Entrega',
    'Cliente',
    'Telefone',
    'Aparelho',
    'Modelo',
    'IMEI',
    'Defeito',
    'Serviço',
    'Status',
    'Valor',
    'Forma de Pagamento'
  ];
  
  const data = maintenances.map(maintenance => ({
    'Data de Entrada': new Date(maintenance.entryDate).toLocaleDateString('pt-BR'),
    'Data de Entrega': maintenance.deliveryDate ? new Date(maintenance.deliveryDate).toLocaleDateString('pt-BR') : '',
    'Cliente': maintenance.customerName,
    'Telefone': maintenance.customerPhone || '',
    'Aparelho': maintenance.deviceName,
    'Modelo': maintenance.deviceModel,
    'IMEI': maintenance.imei || '',
    'Defeito': maintenance.defect,
    'Serviço': maintenance.service,
    'Status': maintenance.status,
    'Valor': `R$ ${maintenance.price.toFixed(2)}`,
    'Forma de Pagamento': maintenance.paymentMethod || ''
  }));
  
  exportToCSV(data, filename, headers);
};

export const exportCustomersToCSV = (customers: Customer[], filename: string = 'clientes.csv') => {
  const headers = [
    'Nome',
    'Telefone',
    'Email',
    'Endereço',
    'CPF/RG',
    'CEP',
    'Data de Nascimento',
    'Como Conheceu',
    'Data de Cadastro'
  ];
  
  const data = customers.map(customer => ({
    'Nome': customer.name,
    'Telefone': customer.phone,
    'Email': customer.email || '',
    'Endereço': customer.address || '',
    'CPF/RG': customer.document || '',
    'CEP': customer.cep || '',
    'Data de Nascimento': customer.birthDate ? new Date(customer.birthDate).toLocaleDateString('pt-BR') : '',
    'Como Conheceu': customer.howKnew || '',
    'Data de Cadastro': new Date(customer.createdAt).toLocaleDateString('pt-BR')
  }));
  
  exportToCSV(data, filename, headers);
};

export const exportProductsToCSV = (products: any[], filename: string = 'produtos.csv') => {
  const headers = [
    'Nome',
    'Tipo',
    'Marca',
    'Modelo',
    'Preço de Custo',
    'Preço de Venda',
    'Quantidade em Estoque',
    'Fornecedor',
    'Descrição'
  ];
  
  const data = products.map(product => ({
    'Nome': product.name,
    'Tipo': product.type,
    'Marca': product.brand || '',
    'Modelo': product.model || '',
    'Preço de Custo': `R$ ${product.costPrice.toFixed(2)}`,
    'Preço de Venda': `R$ ${product.salePrice.toFixed(2)}`,
    'Quantidade em Estoque': product.stock,
    'Fornecedor': product.supplier || '',
    'Descrição': product.description || ''
  }));
  
  exportToCSV(data, filename, headers);
};
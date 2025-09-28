import jsPDF from 'jspdf';
import { Sale, Maintenance, StoreInfo } from './types';

export const generateSalePDF = (sale: Sale, storeInfo: StoreInfo) => {
  const doc = new jsPDF();
  
  // Configurações do documento
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;
  
  // Cabeçalho
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPROVANTE DE VENDA', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;
  
  // Dados da loja
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DA LOJA:', margin, yPosition);
  yPosition += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`${storeInfo.name}`, margin, yPosition);
  yPosition += 6;
  doc.text(`CNPJ: ${storeInfo.cnpj}`, margin, yPosition);
  yPosition += 6;
  doc.text(`${storeInfo.address}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Telefone: ${storeInfo.phone}`, margin, yPosition);
  
  yPosition += 15;
  
  // Dados do cliente
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE:', margin, yPosition);
  yPosition += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${sale.customerName}`, margin, yPosition);
  yPosition += 6;
  if (sale.customerPhone) {
    doc.text(`Telefone: ${sale.customerPhone}`, margin, yPosition);
    yPosition += 6;
  }
  
  yPosition += 10;
  
  // Produtos vendidos
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUTOS/SERVIÇOS:', margin, yPosition);
  yPosition += 8;
  
  // Cabeçalho da tabela
  doc.setFont('helvetica', 'bold');
  doc.text('Item', margin, yPosition);
  doc.text('Qtd', margin + 80, yPosition);
  doc.text('Valor Unit.', margin + 110, yPosition);
  doc.text('Total', margin + 150, yPosition);
  yPosition += 6;
  
  // Linha separadora
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;
  
  // Itens
  doc.setFont('helvetica', 'normal');
  sale.items.forEach((item) => {
    doc.text(item.name, margin, yPosition);
    doc.text(item.quantity.toString(), margin + 80, yPosition);
    doc.text(`R$ ${item.price.toFixed(2)}`, margin + 110, yPosition);
    doc.text(`R$ ${(item.price * item.quantity).toFixed(2)}`, margin + 150, yPosition);
    yPosition += 6;
  });
  
  yPosition += 10;
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL GERAL: R$ ${sale.total.toFixed(2)}`, margin, yPosition);
  yPosition += 6;
  doc.text(`FORMA DE PAGAMENTO: ${sale.paymentMethod}`, margin, yPosition);
  
  yPosition += 20;
  
  // Data
  doc.setFont('helvetica', 'normal');
  doc.text(`Data: ${new Date(sale.date).toLocaleDateString('pt-BR')}`, margin, yPosition);
  
  yPosition += 30;
  
  // Assinaturas
  doc.setFont('helvetica', 'bold');
  doc.text('ASSINATURAS:', margin, yPosition);
  yPosition += 20;
  
  doc.setFont('helvetica', 'normal');
  doc.line(margin, yPosition, margin + 70, yPosition);
  doc.text('Cliente', margin + 25, yPosition + 8);
  
  doc.line(margin + 100, yPosition, margin + 170, yPosition);
  doc.text('Loja', margin + 125, yPosition + 8);
  
  return doc;
};

export const generateMaintenancePDF = (maintenance: Maintenance, storeInfo: StoreInfo) => {
  const doc = new jsPDF();
  
  // Configurações do documento
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;
  
  // Cabeçalho
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPROVANTE DE MANUTENÇÃO', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;
  
  // Dados da loja
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DA LOJA:', margin, yPosition);
  yPosition += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`${storeInfo.name}`, margin, yPosition);
  yPosition += 6;
  doc.text(`CNPJ: ${storeInfo.cnpj}`, margin, yPosition);
  yPosition += 6;
  doc.text(`${storeInfo.address}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Telefone: ${storeInfo.phone}`, margin, yPosition);
  
  yPosition += 15;
  
  // Dados do cliente
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE:', margin, yPosition);
  yPosition += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${maintenance.customerName}`, margin, yPosition);
  yPosition += 6;
  if (maintenance.customerPhone) {
    doc.text(`Telefone: ${maintenance.customerPhone}`, margin, yPosition);
    yPosition += 6;
  }
  
  yPosition += 10;
  
  // Dados do aparelho
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO APARELHO:', margin, yPosition);
  yPosition += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Aparelho: ${maintenance.deviceName}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Modelo: ${maintenance.deviceModel}`, margin, yPosition);
  yPosition += 6;
  if (maintenance.imei) {
    doc.text(`IMEI: ${maintenance.imei}`, margin, yPosition);
    yPosition += 6;
  }
  
  yPosition += 10;
  
  // Serviço realizado
  doc.setFont('helvetica', 'bold');
  doc.text('SERVIÇO REALIZADO:', margin, yPosition);
  yPosition += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Defeito Informado: ${maintenance.defect}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Serviço: ${maintenance.service}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Status: ${maintenance.status}`, margin, yPosition);
  
  yPosition += 15;
  
  // Valor
  doc.setFont('helvetica', 'bold');
  doc.text(`VALOR DO SERVIÇO: R$ ${maintenance.price.toFixed(2)}`, margin, yPosition);
  yPosition += 6;
  if (maintenance.paymentMethod) {
    doc.text(`FORMA DE PAGAMENTO: ${maintenance.paymentMethod}`, margin, yPosition);
    yPosition += 6;
  }
  
  yPosition += 10;
  
  // Datas
  doc.setFont('helvetica', 'normal');
  doc.text(`Data de Entrada: ${new Date(maintenance.entryDate).toLocaleDateString('pt-BR')}`, margin, yPosition);
  yPosition += 6;
  if (maintenance.deliveryDate) {
    doc.text(`Data de Entrega: ${new Date(maintenance.deliveryDate).toLocaleDateString('pt-BR')}`, margin, yPosition);
    yPosition += 6;
  }
  
  yPosition += 20;
  
  // Assinaturas
  doc.setFont('helvetica', 'bold');
  doc.text('ASSINATURAS:', margin, yPosition);
  yPosition += 20;
  
  doc.setFont('helvetica', 'normal');
  doc.line(margin, yPosition, margin + 70, yPosition);
  doc.text('Cliente', margin + 25, yPosition + 8);
  
  doc.line(margin + 100, yPosition, margin + 170, yPosition);
  doc.text('Técnico/Loja', margin + 115, yPosition + 8);
  
  return doc;
};

export const downloadPDF = (doc: jsPDF, filename: string) => {
  doc.save(filename);
};
import jsPDF from 'jspdf';

export interface SaleData {
  id: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod: string;
  date: string;
  seller: string;
  warrantyTerm?: string; // Termo de garantia
}

export interface MaintenanceData {
  id: string;
  customerName: string;
  customerPhone: string;
  deviceName: string;
  deviceModel: string;
  imei: string;
  defect: string;
  service: string;
  status: string;
  price: number;
  paymentMethod: string;
  entryDate: string;
  deliveryDate?: string;
  warrantyTerm?: string; // Termo de garantia
}

export interface StoreInfo {
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email?: string;
  logo?: string;
  socialNetworks?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
}

export function generateSalePDF(saleData: SaleData, storeInfo: StoreInfo): jsPDF {
  const doc = new jsPDF();
  
  // Header com logo (se disponível)
  let yPosition = 20;
  
  if (storeInfo.logo) {
    try {
      // Adicionar logo (implementação básica)
      doc.setFontSize(16);
      doc.text('[LOGO]', 20, yPosition);
      yPosition += 15;
    } catch (error) {
      console.warn('Erro ao adicionar logo ao PDF:', error);
    }
  }
  
  // Nome da loja
  doc.setFontSize(20);
  doc.text(storeInfo.name || 'Gestão Phone', 20, yPosition);
  yPosition += 15;
  
  // Informações da loja
  doc.setFontSize(12);
  if (storeInfo.cnpj) {
    doc.text(`CNPJ: ${storeInfo.cnpj}`, 20, yPosition);
    yPosition += 10;
  }
  if (storeInfo.address) {
    doc.text(`Endereço: ${storeInfo.address}`, 20, yPosition);
    yPosition += 10;
  }
  if (storeInfo.phone) {
    doc.text(`Telefone: ${storeInfo.phone}`, 20, yPosition);
    yPosition += 10;
  }
  if (storeInfo.email) {
    doc.text(`E-mail: ${storeInfo.email}`, 20, yPosition);
    yPosition += 10;
  }
  
  // Redes sociais
  if (storeInfo.socialNetworks) {
    const { instagram, facebook, whatsapp } = storeInfo.socialNetworks;
    if (instagram) {
      doc.text(`Instagram: ${instagram}`, 20, yPosition);
      yPosition += 10;
    }
    if (facebook) {
      doc.text(`Facebook: ${facebook}`, 20, yPosition);
      yPosition += 10;
    }
    if (whatsapp) {
      doc.text(`WhatsApp: ${whatsapp}`, 20, yPosition);
      yPosition += 10;
    }
  }
  
  yPosition += 10;
  
  // Título
  doc.setFontSize(16);
  doc.text('COMPROVANTE DE VENDA', 20, yPosition);
  yPosition += 20;
  
  // Informações da venda
  doc.setFontSize(12);
  doc.text(`Venda #${saleData.id}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Data: ${new Date(saleData.date).toLocaleDateString('pt-BR')}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Cliente: ${saleData.customerName}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Telefone: ${saleData.customerPhone}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Vendedor: ${saleData.seller}`, 20, yPosition);
  yPosition += 20;
  
  // Itens
  doc.text('ITENS:', 20, yPosition);
  yPosition += 10;
  
  saleData.items.forEach((item, index) => {
    doc.text(`${index + 1}. ${item.name}`, 25, yPosition);
    yPosition += 10;
    doc.text(`Qtd: ${item.quantity}`, 25, yPosition);
    yPosition += 10;
    doc.text(`Preço: R$ ${item.price.toFixed(2)}`, 25, yPosition);
    yPosition += 10;
    doc.text(`Subtotal: R$ ${(item.quantity * item.price).toFixed(2)}`, 25, yPosition);
    yPosition += 15;
  });
  
  // Total
  doc.setFontSize(14);
  doc.text(`TOTAL: R$ ${saleData.total.toFixed(2)}`, 20, yPosition);
  yPosition += 15;
  doc.text(`Forma de Pagamento: ${saleData.paymentMethod}`, 20, yPosition);
  yPosition += 20;
  
  // Termo de garantia
  if (saleData.warrantyTerm) {
    doc.setFontSize(12);
    doc.text('GARANTIA:', 20, yPosition);
    yPosition += 10;
    doc.text(saleData.warrantyTerm, 20, yPosition, { maxWidth: 170 });
    yPosition += 20;
  }
  
  // Footer
  doc.setFontSize(10);
  doc.text('Obrigado pela preferência!', 20, yPosition);
  
  return doc;
}

export function generateMaintenancePDF(maintenanceData: MaintenanceData, storeInfo: StoreInfo): jsPDF {
  const doc = new jsPDF();
  
  // Header com logo (se disponível)
  let yPosition = 20;
  
  if (storeInfo.logo) {
    try {
      // Adicionar logo (implementação básica)
      doc.setFontSize(16);
      doc.text('[LOGO]', 20, yPosition);
      yPosition += 15;
    } catch (error) {
      console.warn('Erro ao adicionar logo ao PDF:', error);
    }
  }
  
  // Nome da loja
  doc.setFontSize(20);
  doc.text(storeInfo.name || 'Gestão Phone', 20, yPosition);
  yPosition += 15;
  
  // Informações da loja
  doc.setFontSize(12);
  if (storeInfo.cnpj) {
    doc.text(`CNPJ: ${storeInfo.cnpj}`, 20, yPosition);
    yPosition += 10;
  }
  if (storeInfo.address) {
    doc.text(`Endereço: ${storeInfo.address}`, 20, yPosition);
    yPosition += 10;
  }
  if (storeInfo.phone) {
    doc.text(`Telefone: ${storeInfo.phone}`, 20, yPosition);
    yPosition += 10;
  }
  if (storeInfo.email) {
    doc.text(`E-mail: ${storeInfo.email}`, 20, yPosition);
    yPosition += 10;
  }
  
  // Redes sociais
  if (storeInfo.socialNetworks) {
    const { instagram, facebook, whatsapp } = storeInfo.socialNetworks;
    if (instagram) {
      doc.text(`Instagram: ${instagram}`, 20, yPosition);
      yPosition += 10;
    }
    if (facebook) {
      doc.text(`Facebook: ${facebook}`, 20, yPosition);
      yPosition += 10;
    }
    if (whatsapp) {
      doc.text(`WhatsApp: ${whatsapp}`, 20, yPosition);
      yPosition += 10;
    }
  }
  
  yPosition += 10;
  
  // Título
  doc.setFontSize(16);
  doc.text('ORDEM DE SERVIÇO', 20, yPosition);
  yPosition += 20;
  
  // Informações da manutenção
  doc.setFontSize(12);
  doc.text(`OS #${maintenanceData.id}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Data de Entrada: ${new Date(maintenanceData.entryDate).toLocaleDateString('pt-BR')}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Cliente: ${maintenanceData.customerName}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Telefone: ${maintenanceData.customerPhone}`, 20, yPosition);
  yPosition += 20;
  
  // Dados do aparelho
  doc.text('DADOS DO APARELHO:', 20, yPosition);
  yPosition += 10;
  doc.text(`Aparelho: ${maintenanceData.deviceName}`, 25, yPosition);
  yPosition += 10;
  doc.text(`Modelo: ${maintenanceData.deviceModel}`, 25, yPosition);
  yPosition += 10;
  doc.text(`IMEI: ${maintenanceData.imei}`, 25, yPosition);
  yPosition += 20;
  
  // Informações do serviço
  doc.text('SERVIÇO:', 20, yPosition);
  yPosition += 10;
  doc.text(`Defeito Informado: ${maintenanceData.defect}`, 25, yPosition);
  yPosition += 10;
  doc.text(`Serviço Realizado: ${maintenanceData.service}`, 25, yPosition);
  yPosition += 10;
  doc.text(`Status: ${maintenanceData.status}`, 25, yPosition);
  yPosition += 20;
  
  // Informações de preço
  doc.setFontSize(14);
  doc.text(`VALOR: R$ ${maintenanceData.price.toFixed(2)}`, 20, yPosition);
  yPosition += 15;
  doc.text(`Forma de Pagamento: ${maintenanceData.paymentMethod}`, 20, yPosition);
  yPosition += 15;
  
  if (maintenanceData.deliveryDate) {
    doc.text(`Data de Entrega: ${new Date(maintenanceData.deliveryDate).toLocaleDateString('pt-BR')}`, 20, yPosition);
    yPosition += 15;
  }
  
  // Termo de garantia
  if (maintenanceData.warrantyTerm) {
    doc.setFontSize(12);
    doc.text('GARANTIA:', 20, yPosition);
    yPosition += 10;
    doc.text(maintenanceData.warrantyTerm, 20, yPosition, { maxWidth: 170 });
    yPosition += 15;
  }
  
  // Footer
  doc.setFontSize(10);
  doc.text('Garantia de 30 dias para o serviço realizado.', 20, yPosition);
  
  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string): void {
  try {
    doc.save(filename);
  } catch (error) {
    console.error('Erro ao baixar PDF:', error);
    // Fallback: tentar abrir em nova aba
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
  }
}
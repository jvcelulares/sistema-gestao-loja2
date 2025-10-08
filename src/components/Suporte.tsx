'use client';

import { useState } from 'react';
import { HelpCircle, MessageCircle, Phone, Mail, ExternalLink, Book, Video, FileText, CheckCircle } from 'lucide-react';

export default function Suporte() {
  const [activeTab, setActiveTab] = useState<'faq' | 'contato' | 'tutoriais' | 'atualizacoes'>('faq');

  const faqItems = [
    {
      pergunta: "Como cadastrar um novo produto?",
      resposta: "Vá até a aba 'Estoque', clique em 'Novo Produto' e preencha todas as informações necessárias como nome, marca, preço de custo, preço de venda e quantidade em estoque."
    },
    {
      pergunta: "Como gerar um comprovante de venda em PDF?",
      resposta: "Na aba 'Vendas', localize a venda desejada e clique no botão 'PDF' ao lado da venda. O comprovante será gerado automaticamente para download."
    },
    {
      pergunta: "Como alterar os dados da minha loja?",
      resposta: "Acesse 'Configurações' no menu lateral, vá até 'Dados da Loja' e clique em 'Editar'. Você pode alterar nome, CNPJ, telefone, e-mail e endereço."
    },
    {
      pergunta: "Como carregar minha própria logo?",
      resposta: "Em 'Configurações', na seção 'Logo da Loja', clique em 'Carregar Logo' e selecione sua imagem. A logo aparecerá na tela de login e em todo o sistema."
    },
    {
      pergunta: "Como criar termos de garantia?",
      resposta: "Vá até 'Termos de Garantia', clique em 'Novo Termo' e configure o nome, descrição, prazo e condições. Você pode aplicar o termo a vendas e/ou manutenções."
    },
    {
      pergunta: "Como acompanhar o estoque baixo?",
      resposta: "No Dashboard, você verá alertas automáticos quando produtos estiverem com estoque igual ou abaixo do estoque mínimo configurado."
    },
    {
      pergunta: "Como exportar relatórios?",
      resposta: "Na aba 'Relatórios', escolha o tipo de relatório desejado (vendas, produtos, clientes, manutenções) e clique em 'Exportar CSV' para baixar os dados."
    },
    {
      pergunta: "Como funciona o controle de manutenções?",
      resposta: "Cadastre a manutenção com dados do cliente e aparelho. Atualize o status conforme o andamento. Quando marcar como 'Entregue', o faturamento será atualizado automaticamente."
    }
  ];

  const tutoriais = [
    {
      titulo: "Primeiros Passos no Sistema",
      descricao: "Aprenda a configurar sua loja e fazer os primeiros cadastros",
      tipo: "video",
      duracao: "5 min"
    },
    {
      titulo: "Gerenciamento de Estoque",
      descricao: "Como cadastrar produtos e controlar o estoque",
      tipo: "video",
      duracao: "8 min"
    },
    {
      titulo: "Processo de Vendas",
      descricao: "Passo a passo para registrar vendas e gerar comprovantes",
      tipo: "video",
      duracao: "6 min"
    },
    {
      titulo: "Controle de Manutenções",
      descricao: "Como gerenciar ordens de serviço e acompanhar status",
      tipo: "video",
      duracao: "7 min"
    },
    {
      titulo: "Relatórios e Análises",
      descricao: "Extraindo insights dos seus dados de vendas",
      tipo: "documento",
      duracao: "10 min"
    },
    {
      titulo: "Personalização do Sistema",
      descricao: "Configure dados da loja, logo e termos de garantia",
      tipo: "documento",
      duracao: "4 min"
    }
  ];

  const atualizacoes = [
    {
      versao: "2.1.0",
      data: "15/01/2024",
      titulo: "Termos de Garantia e Melhorias de PDF",
      itens: [
        "Nova funcionalidade de Termos de Garantia",
        "Correção na geração de PDFs para mobile",
        "Melhorias na responsividade do sistema",
        "Otimização do dashboard com novos filtros"
      ]
    },
    {
      versao: "2.0.5",
      data: "08/01/2024",
      titulo: "Correções e Otimizações",
      itens: [
        "Correção no cálculo de lucros das manutenções",
        "Melhoria na exportação de relatórios CSV",
        "Ajustes no layout mobile",
        "Correção de bugs menores"
      ]
    },
    {
      versao: "2.0.0",
      data: "01/01/2024",
      titulo: "Grande Atualização - Gestão Phone",
      itens: [
        "Mudança de marca de JV Celulares para Gestão Phone",
        "Sistema de configuração personalizável",
        "Upload de logo personalizada",
        "Melhorias gerais de performance"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Suporte Técnico</h2>
          <p className="text-gray-600">Central de ajuda e documentação do sistema</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <HelpCircle className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'faq'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                FAQ
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('tutoriais')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tutoriais'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Book className="w-4 h-4" />
                Tutoriais
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('atualizacoes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'atualizacoes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Atualizações
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('contato')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contato'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Contato
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Perguntas Frequentes</h3>
              
              {faqItems.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <details className="group">
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                      <span className="font-medium text-gray-900">{item.pergunta}</span>
                      <HelpCircle className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-4 pb-4 text-gray-600">
                      {item.resposta}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}

          {/* Tutoriais Tab */}
          {activeTab === 'tutoriais' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tutoriais e Guias</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutoriais.map((tutorial, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {tutorial.tipo === 'video' ? (
                          <Video className="w-6 h-6 text-blue-600" />
                        ) : (
                          <FileText className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{tutorial.titulo}</h4>
                        <p className="text-sm text-gray-600 mb-2">{tutorial.descricao}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{tutorial.duracao}</span>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                            Acessar
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Atualizações Tab */}
          {activeTab === 'atualizacoes' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Atualizações</h3>
              
              {atualizacoes.map((atualizacao, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{atualizacao.titulo}</h4>
                      <p className="text-sm text-gray-500">Versão {atualizacao.versao}</p>
                    </div>
                    <span className="text-sm text-gray-500">{atualizacao.data}</span>
                  </div>
                  
                  <ul className="space-y-1">
                    {atualizacao.itens.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Contato Tab */}
          {activeTab === 'contato' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Entre em Contato</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">WhatsApp</h4>
                      <p className="text-sm text-gray-600">Suporte rápido via WhatsApp</p>
                      <button 
                        onClick={() => window.open('https://wa.me/5513996462348', '_blank')}
                        className="text-green-600 hover:text-green-700 text-sm font-medium mt-1"
                      >
                        (13) 99646-2348
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <Phone className="w-6 h-6 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Telefone</h4>
                      <p className="text-sm text-gray-600">Atendimento comercial</p>
                      <span className="text-blue-600 text-sm font-medium">(13) 99646-2348</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                    <Mail className="w-6 h-6 text-purple-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">E-mail</h4>
                      <p className="text-sm text-gray-600">Suporte técnico</p>
                      <button 
                        onClick={() => window.open('mailto:contato@gestao-phone.com.br', '_blank')}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-1"
                      >
                        contato@gestao-phone.com.br
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Horário de Atendimento</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Segunda a Sexta:</span>
                      <span>8h às 18h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sábado:</span>
                      <span>8h às 12h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domingo:</span>
                      <span>Fechado</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-2">Suporte Emergencial</h5>
                    <p className="text-sm text-gray-600">
                      Para problemas críticos que impedem o funcionamento do sistema, 
                      entre em contato via WhatsApp a qualquer horário.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dicas Rápidas */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Dicas Rápidas</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use Ctrl+F para buscar rapidamente em qualquer lista</li>
              <li>• Mantenha sempre backup dos seus dados importantes</li>
              <li>• Configure alertas de estoque baixo nas configurações</li>
              <li>• Utilize os filtros de data no dashboard para análises específicas</li>
              <li>• Exporte relatórios regularmente para acompanhar o crescimento</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
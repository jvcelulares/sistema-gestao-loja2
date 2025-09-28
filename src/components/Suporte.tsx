'use client';

import { MessageCircle, Phone, Mail, Clock, HelpCircle } from 'lucide-react';

export default function Suporte() {
  const abrirWhatsAppSuporte = () => {
    const numeroSuporte = '5513996462348';
    const mensagem = encodeURIComponent('Olá, preciso de ajuda referente ao sistema.');
    window.open(`https://wa.me/${numeroSuporte}?text=${mensagem}`, '_blank');
  };

  const abrirTelefone = () => {
    window.open('tel:+5513996462348', '_self');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Suporte Técnico</h2>
        <p className="text-gray-600">Entre em contato conosco para obter ajuda</p>
      </div>

      {/* Opções de Contato */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WhatsApp */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">WhatsApp</h3>
              <p className="text-gray-600">Atendimento rápido via WhatsApp</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>(13) 99646-2348</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Segunda a Sexta: 8h às 18h</span>
            </div>
          </div>

          <button
            onClick={abrirWhatsAppSuporte}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Abrir WhatsApp
          </button>
        </div>

        {/* Telefone */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Phone className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Telefone</h3>
              <p className="text-gray-600">Ligue diretamente para nosso suporte</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>(13) 99646-2348</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Segunda a Sexta: 8h às 18h</span>
            </div>
          </div>

          <button
            onClick={abrirTelefone}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Ligar Agora
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-3 rounded-full">
            <HelpCircle className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Perguntas Frequentes</h3>
            <p className="text-gray-600">Respostas para as dúvidas mais comuns</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Como resetar minha senha?</h4>
            <p className="text-sm text-gray-600">
              Entre em contato conosco via WhatsApp ou telefone informando seu nome de usuário. 
              Nossa equipe irá ajudá-lo a redefinir sua senha com segurança.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Como fazer backup dos meus dados?</h4>
            <p className="text-sm text-gray-600">
              O sistema faz backup automático dos seus dados. Para backups manuais ou restauração, 
              entre em contato com nosso suporte técnico.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">O sistema funciona offline?</h4>
            <p className="text-sm text-gray-600">
              O sistema funciona online e salva os dados localmente no seu navegador. 
              Para sincronização em nuvem, entre em contato conosco.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Como gerar relatórios personalizados?</h4>
            <p className="text-sm text-gray-600">
              Use os filtros disponíveis na seção de relatórios. Para relatórios mais específicos, 
              nossa equipe pode ajudá-lo a configurar filtros personalizados.
            </p>
          </div>
        </div>
      </div>

      {/* Informações de Contato */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-gray-200 p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Precisa de Ajuda Imediata?</h3>
          <p className="text-gray-600 mb-4">
            Nossa equipe está pronta para ajudá-lo com qualquer dúvida sobre o sistema
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={abrirWhatsAppSuporte}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp: (13) 99646-2348
            </button>
            
            <button
              onClick={abrirTelefone}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Telefone: (13) 99646-2348
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import bcrypt from 'bcryptjs';

// Interface para logs de login
export interface LoginLog {
  id: string;
  userId: string;
  username: string;
  ip: string;
  location: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
}

// Função para hash de senha
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Função para verificar senha
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Função para obter IP do usuário (simulado para ambiente local)
export const getUserIP = (): string => {
  // Em produção, isso seria obtido do request
  return '192.168.1.1'; // IP simulado
};

// Função para obter localização aproximada (simulado)
export const getUserLocation = async (ip: string): Promise<string> => {
  // Em produção, isso usaria uma API de geolocalização
  return 'São Paulo, SP, Brasil'; // Localização simulada
};

// Função para obter User Agent
export const getUserAgent = (): string => {
  return navigator.userAgent || 'Unknown';
};

// Função para registrar log de login
export const logLogin = (
  userId: string,
  username: string,
  success: boolean
): LoginLog => {
  const log: LoginLog = {
    id: Date.now().toString(),
    userId,
    username,
    ip: getUserIP(),
    location: 'São Paulo, SP, Brasil', // Simulado
    userAgent: getUserAgent(),
    timestamp: new Date().toISOString(),
    success
  };

  // Salvar no localStorage
  const existingLogs = JSON.parse(localStorage.getItem('jv-login-logs') || '[]');
  existingLogs.push(log);
  
  // Manter apenas os últimos 100 logs
  if (existingLogs.length > 100) {
    existingLogs.splice(0, existingLogs.length - 100);
  }
  
  localStorage.setItem('jv-login-logs', JSON.stringify(existingLogs));
  
  return log;
};

// Função para obter logs de login
export const getLoginLogs = (): LoginLog[] => {
  return JSON.parse(localStorage.getItem('jv-login-logs') || '[]');
};

// Função para obter logs de um usuário específico
export const getUserLoginLogs = (userId: string): LoginLog[] => {
  const allLogs = getLoginLogs();
  return allLogs.filter(log => log.userId === userId);
};

// Função para limpar logs antigos (mais de 30 dias)
export const cleanOldLogs = (): void => {
  const allLogs = getLoginLogs();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentLogs = allLogs.filter(log => 
    new Date(log.timestamp) > thirtyDaysAgo
  );
  
  localStorage.setItem('jv-login-logs', JSON.stringify(recentLogs));
};
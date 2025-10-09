// Funções de fallback para quando Supabase não estiver configurado
const createFallbackResponse = (data: any = null, error: any = null) => ({ data, error });

// Função para obter usuário atual
export const getCurrentUser = async () => {
  return createFallbackResponse(null, new Error('Supabase not configured'));
};

// Função para criar usuário no Supabase
export const createUserInSupabase = async (email: string, password: string) => {
  return createFallbackResponse(null, new Error('Supabase not configured'));
};

// Função para fazer login
export const loginUser = async (email: string, password: string) => {
  return createFallbackResponse(null, new Error('Supabase not configured'));
};

// Função para resetar senha
export const resetPassword = async (email: string) => {
  return { error: new Error('Supabase not configured') };
};

// Função para fazer logout
export const logoutUser = async () => {
  return { error: new Error('Supabase not configured') };
};

// Função para criar perfil de loja do usuário
export const createUserStoreProfile = async (userId: string, profileData: any) => {
  return createFallbackResponse(null, new Error('Supabase not configured'));
};

// Função para obter perfil de loja do usuário
export const getUserStoreProfile = async (userId: string) => {
  return createFallbackResponse(null, new Error('Supabase not configured'));
};

// Função para atualizar perfil de loja do usuário
export const updateUserStoreProfile = async (userId: string, profileData: any) => {
  return createFallbackResponse(null, new Error('Supabase not configured'));
};

// Função para salvar dados da loja no Supabase
export const saveStoreData = async (userId: string, storeData: any) => {
  return createFallbackResponse(null, new Error('Supabase not configured'));
};

// Função para carregar dados da loja do Supabase
export const loadStoreData = async (userId: string) => {
  return createFallbackResponse(null, new Error('Supabase not configured'));
};

// Função para criar usuário local (criado pelo admin)
export const createAdminUser = async (creatorUserId: string, userData: any) => {
  return createFallbackResponse(null, new Error('Supabase not configured'));
};

// Função para carregar usuários criados pelo admin
export const loadAdminUsers = async (creatorUserId: string) => {
  return createFallbackResponse(null, new Error('Supabase not configured'));
};

// Função para remover usuário criado pelo admin
export const removeAdminUser = async (userId: string) => {
  return { success: false, error: new Error('Supabase not configured') };
};

// Exportar supabase como null para compatibilidade
export const supabase = null;
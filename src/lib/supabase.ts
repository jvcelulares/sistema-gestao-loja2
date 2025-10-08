import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para obter usuário atual
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error: any) {
    return { user: null, error };
  }
};

// Função para criar usuário no Supabase
export const createUserInSupabase = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error: any) {
    return { user: null, error };
  }
};

// Função para fazer login
export const loginUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error: any) {
    return { user: null, error };
  }
};

// Função para resetar senha
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { error };
  }
};

// Função para fazer logout
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { error };
  }
};

// Função para criar perfil de loja do usuário
export const createUserStoreProfile = async (userId: string, profileData: any) => {
  try {
    const { data, error } = await supabase
      .from('user_store_profiles')
      .insert([
        {
          user_id: userId,
          store_name: profileData.nome || 'Gestão Phone',
          cnpj: profileData.cnpj || '',
          phone: profileData.telefone || '',
          email: profileData.email || '',
          address: profileData.endereco || '',
          logo_url: profileData.logo || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

// Função para obter perfil de loja do usuário
export const getUserStoreProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_store_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

// Função para atualizar perfil de loja do usuário
export const updateUserStoreProfile = async (userId: string, profileData: any) => {
  try {
    const { data, error } = await supabase
      .from('user_store_profiles')
      .update({
        store_name: profileData.nome,
        cnpj: profileData.cnpj,
        phone: profileData.telefone,
        email: profileData.email,
        address: profileData.endereco,
        logo_url: profileData.logo,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

// Função para salvar dados da loja no Supabase
export const saveStoreData = async (userId: string, storeData: any) => {
  try {
    const { data, error } = await supabase
      .from('store_data')
      .upsert({
        user_id: userId,
        produtos: storeData.produtos || [],
        clientes: storeData.clientes || [],
        vendas: storeData.vendas || [],
        manutencoes: storeData.manutencoes || [],
        termos_garantia: storeData.termosGarantia || [],
        faturamento_total: storeData.faturamentoTotal || 0,
        lucro_total: storeData.lucroTotal || 0,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

// Função para carregar dados da loja do Supabase
export const loadStoreData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('store_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

// Função para criar usuário local (criado pelo admin)
export const createAdminUser = async (creatorUserId: string, userData: any) => {
  try {
    const { data, error } = await supabase
      .from('admin_created_users')
      .insert([
        {
          creator_user_id: creatorUserId,
          username: userData.username,
          password_hash: userData.password, // Em produção, usar hash
          role: userData.role || 'user',
          type: userData.type || 'normal',
          expires_at: userData.expiresAt,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

// Função para carregar usuários criados pelo admin
export const loadAdminUsers = async (creatorUserId: string) => {
  try {
    const { data, error } = await supabase
      .from('admin_created_users')
      .select('*')
      .eq('creator_user_id', creatorUserId);

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

// Função para remover usuário criado pelo admin
export const removeAdminUser = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('admin_created_users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error };
  }
};
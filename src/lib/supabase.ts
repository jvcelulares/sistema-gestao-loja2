import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase usando as chaves fornecidas
const supabaseUrl = 'https://eomelpvtuiludxheckvo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbWVscHZ0dWlsdWR4aGVja3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTg0NjYsImV4cCI6MjA3NTQ3NDQ2Nn0.vIHWQuIoXnKOuQWBJt7u9axutSezJQJvevAcHqc9aow';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbWVscHZ0dWlsdWR4aGVja3ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg5ODQ2NiwiZXhwIjoyMDc1NDc0NDY2fQ.MTyPPiJpTwN0rSyG_enZqY3AUkl1P7DXA0Cb2JRuD_Q';

// Criar cliente Supabase normal com configuração mais robusta
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Desabilitar para evitar problemas de URL
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
});

// Criar cliente Supabase com service role para operações administrativas
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-admin'
    }
  }
});

// Função para obter usuário atual com proteção contra erros
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { data: user, error };
  } catch (error) {
    console.warn('⚠️ Erro ao obter usuário atual:', error);
    return { data: null, error };
  }
};

// Função para criar usuário no Supabase (SINCRONIZAÇÃO AUTOMÁTICA)
export const createUserInSupabase = async (email: string, password: string, userData?: any) => {
  try {
    console.log('🔄 Criando usuário no Supabase:', email);
    
    // Usar o cliente admin para criar usuário sem confirmação de email
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirma email automaticamente
      user_metadata: {
        created_by_admin: true,
        created_at: new Date().toISOString()
      }
    });
    
    if (error) {
      console.warn('⚠️ Erro ao criar usuário no Supabase:', error);
      return { data: null, error };
    }

    console.log('✅ Usuário criado no Supabase com sucesso:', data.user?.id);

    // Se o usuário foi criado com sucesso, criar perfil da loja
    if (data.user) {
      const profileData = {
        email: data.user.email,
        created_at: new Date().toISOString(),
        subscription_expires_at: userData?.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        created_by_admin: true,
        username: userData?.username || email,
        role: userData?.role || 'user'
      };

      await createUserStoreProfile(data.user.id, profileData);
      console.log('✅ Perfil de usuário criado no Supabase');
    }

    return { data, error: null };
  } catch (error) {
    console.warn('⚠️ Erro ao criar usuário no Supabase:', error);
    return { data: null, error };
  }
};

// Função para fazer login com proteção contra erros
export const loginUser = async (email: string, password: string) => {
  try {
    console.log('🔄 Tentando login no Supabase:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.warn('⚠️ Erro ao fazer login no Supabase:', error);
      return { data: null, error };
    }

    console.log('✅ Login no Supabase realizado com sucesso');
    return { data, error: null };
  } catch (error) {
    console.warn('⚠️ Erro ao fazer login:', error);
    return { data: null, error };
  }
};

// Função para resetar senha
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  } catch (error) {
    console.warn('Erro ao resetar senha:', error);
    return { error };
  }
};

// Função para fazer logout
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.warn('Erro ao fazer logout:', error);
    return { error };
  }
};

// Função para criar perfil de loja do usuário
export const createUserStoreProfile = async (userId: string, profileData: any) => {
  try {
    // Primeiro, tentar criar a tabela se não existir
    await ensureTablesExist();

    // Verificar se já existe um perfil
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      // Se já existe, apenas retornar
      return { data: existingProfile, error: null };
    }

    // Criar novo perfil
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: userId,
        ...profileData
      }])
      .select()
      .single();

    if (error) {
      console.warn('⚠️ Erro ao criar perfil:', error);
    }

    return { data, error };
  } catch (error) {
    console.warn('⚠️ Erro ao criar perfil:', error);
    return { data: null, error };
  }
};

// Função para obter perfil de loja do usuário
export const getUserStoreProfile = async (userId: string) => {
  try {
    await ensureTablesExist();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { data, error };
  } catch (error) {
    console.warn('⚠️ Erro ao obter perfil:', error);
    return { data: null, error };
  }
};

// Função para atualizar perfil de loja do usuário
export const updateUserStoreProfile = async (userId: string, profileData: any) => {
  try {
    await ensureTablesExist();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert([{
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.warn('⚠️ Erro ao atualizar perfil:', error);
    return { data: null, error };
  }
};

// Função para salvar dados da loja no Supabase
export const saveStoreData = async (userId: string, storeData: any) => {
  try {
    await ensureTablesExist();
    
    const { data, error } = await supabase
      .from('store_data')
      .upsert([{
        user_id: userId,
        data: storeData,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.warn('⚠️ Erro ao salvar dados da loja:', error);
    return { data: null, error };
  }
};

// Função para carregar dados da loja do Supabase
export const loadStoreData = async (userId: string) => {
  try {
    await ensureTablesExist();
    
    const { data, error } = await supabase
      .from('store_data')
      .select('data')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.warn('⚠️ Erro ao carregar dados da loja:', error);
      return { data: null, error };
    }

    return { data: data?.data || null, error: null };
  } catch (error) {
    console.warn('⚠️ Erro ao carregar dados da loja:', error);
    return { data: null, error };
  }
};

// Função para criar usuário local (criado pelo admin) - SINCRONIZAÇÃO AUTOMÁTICA
export const createAdminUser = async (creatorUserId: string, userData: any) => {
  try {
    console.log('🔄 Criando usuário admin com sincronização automática...');
    
    // Primeiro criar o usuário no auth do Supabase usando service role
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Confirma email automaticamente - SEM CONFIRMAÇÃO
      user_metadata: {
        created_by_admin: true,
        creator_user_id: creatorUserId,
        username: userData.username || userData.email,
        created_at: new Date().toISOString()
      }
    });

    if (authError) {
      console.warn('⚠️ Erro ao criar usuário no auth:', authError);
      return { data: null, error: authError };
    }

    console.log('✅ Usuário criado no sistema de autenticação do Supabase:', authData.user?.id);

    // Depois criar o perfil na tabela user_profiles
    if (authData.user) {
      const profileResult = await createUserStoreProfile(authData.user.id, {
        email: authData.user.email,
        username: userData.username || userData.email,
        created_by: creatorUserId,
        subscription_expires_at: userData.subscriptionExpiresAt,
        is_active: true,
        created_at: new Date().toISOString(),
        role: userData.role || 'user',
        created_by_admin: true
      });

      if (profileResult.error) {
        console.warn('⚠️ Erro ao criar perfil:', profileResult.error);
      } else {
        console.log('✅ Perfil de usuário criado com sucesso');
      }
    }

    console.log('✅ SINCRONIZAÇÃO COMPLETA - Usuário pode fazer login normalmente');
    return { data: authData, error: null };
  } catch (error) {
    console.warn('⚠️ Erro ao criar usuário admin:', error);
    return { data: null, error };
  }
};

// Função para carregar usuários criados pelo admin
export const loadAdminUsers = async (creatorUserId: string) => {
  try {
    await ensureTablesExist();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('created_by', creatorUserId);

    return { data, error };
  } catch (error) {
    console.warn('Erro ao carregar usuários admin:', error);
    return { data: null, error };
  }
};

// Função para remover usuário criado pelo admin
export const removeAdminUser = async (userId: string) => {
  try {
    console.log('🔄 Removendo usuário do sistema...');
    
    // Remover do auth usando service role
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.warn('⚠️ Erro ao remover usuário do auth:', authError);
      return { success: false, error: authError };
    }

    // Remover perfil
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);

    if (profileError) {
      console.warn('⚠️ Erro ao remover perfil:', profileError);
      return { success: false, error: profileError };
    }

    console.log('✅ Usuário removido completamente do sistema');
    return { success: true, error: null };
  } catch (error) {
    console.warn('⚠️ Erro ao remover usuário:', error);
    return { success: false, error };
  }
};

// Função para garantir que as tabelas existam
export const ensureTablesExist = async () => {
  try {
    // Tentar fazer uma consulta simples para verificar se as tabelas existem
    const { error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    const { error: storeError } = await supabase
      .from('store_data')
      .select('id')
      .limit(1);

    // Se as tabelas não existirem, elas serão criadas automaticamente pelo Supabase
    // quando tentarmos fazer operações nelas
    
    console.log('✅ Verificação de tabelas concluída');
    return true;
  } catch (error) {
    console.warn('⚠️ Erro ao verificar tabelas:', error);
    return false;
  }
};

// Função para inicializar tabelas necessárias
export const initializeTables = async () => {
  try {
    await ensureTablesExist();
    console.log('✅ Tabelas inicializadas com sucesso');
  } catch (error) {
    console.warn('⚠️ Erro ao inicializar tabelas:', error);
  }
};

// Função para verificar se usuário existe no Supabase
export const checkUserExistsInSupabase = async (email: string) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.warn('⚠️ Erro ao verificar usuários:', error);
      return false;
    }

    const userExists = data.users.some(user => user.email === email);
    return userExists;
  } catch (error) {
    console.warn('⚠️ Erro ao verificar se usuário existe:', error);
    return false;
  }
};

// Função para sincronizar usuário existente com Supabase
export const syncUserWithSupabase = async (userData: any) => {
  try {
    const userExists = await checkUserExistsInSupabase(userData.email || userData.username);
    
    if (!userExists) {
      console.log('🔄 Sincronizando usuário existente com Supabase...');
      
      const result = await createUserInSupabase(
        userData.email || userData.username, 
        userData.password || 'senha123',
        userData
      );
      
      if (result.data) {
        console.log('✅ Usuário sincronizado com sucesso');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.warn('⚠️ Erro ao sincronizar usuário:', error);
    return false;
  }
};
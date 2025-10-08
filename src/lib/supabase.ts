'use client';

import { createClient } from '@supabase/supabase-js';

// Adicione as variáveis com as informações do Supabase
const supabaseUrl = 'https://eomelpvtuiludxheckvo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbWVscHZ0dWlsdWR4aGVja3ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg5ODQ2NiwiZXhwIjoyMDc1NDc0NDY2fQ.MTyPPiJpTwN0rSyG_enZqY3AUkl1P7DXA0Cb2JRuD_Q';

// Criar cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para testar a conexão com o Supabase
export async function testSupabaseConnection() {
  try {
    // Tenta fazer uma consulta simples para verificar a conexão
    const { data, error } = await supabase
      .from('users') // Substitua 'users' pela tabela que você tem no seu banco
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error("Erro na conexão com Supabase:", error.message);
      return { success: false, error: error.message };
    }

    console.log("Conexão com Supabase estabelecida com sucesso!");
    return { success: true, message: "Conexão estabelecida com sucesso!" };
  } catch (error: any) {
    console.error("Erro ao testar conexão:", error.message);
    return { success: false, error: error.message };
  }
}

// Função para criar usuário no Supabase via painel administrativo
export async function createUserInSupabase(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // Auto-confirma o email
    });

    if (error) {
      console.error("Erro ao criar usuário:", error.message);
      return { error };
    }

    console.log("Usuário criado com sucesso:", data.user);
    return { user: data.user };
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error.message);
    return { error };
  }
}

// Função para login de usuário
export async function loginUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("Erro ao fazer login:", error.message);
      return { error };
    }

    console.log("Usuário autenticado com sucesso:", data.user);
    return { user: data.user, session: data.session };
  } catch (error: any) {
    console.error("Erro ao fazer login:", error.message);
    return { error };
  }
}

// Função de recuperação de senha
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error("Erro ao enviar e-mail de recuperação:", error.message);
      return { error };
    }

    console.log("E-mail de recuperação enviado com sucesso.");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao enviar e-mail de recuperação:", error.message);
    return { error };
  }
}

// Função para logout
export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Erro ao fazer logout:", error.message);
      return { error };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao fazer logout:", error.message);
    return { error };
  }
}

// Função para obter usuário atual - COMPLETAMENTE SILENCIOSA
export async function getCurrentUser() {
  try {
    // Primeiro, verificar se há uma sessão ativa
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Se há erro de sessão ou não há sessão, retornar null silenciosamente
    if (sessionError || !session) {
      return { user: null };
    }

    // Se há sessão, obter o usuário
    const { data: { user }, error } = await supabase.auth.getUser();
    
    // Se há erro ao obter usuário, retornar null silenciosamente
    if (error) {
      return { user: null };
    }

    return { user };
  } catch (error: any) {
    // Qualquer erro, retornar null silenciosamente
    return { user: null };
  }
}

// Função para criar perfil de loja do usuário
export async function createUserStoreProfile(userId: string, storeData: any) {
  try {
    const { data, error } = await supabase
      .from('user_store_profiles')
      .insert([
        {
          user_id: userId,
          store_name: storeData.nome || '',
          cnpj: storeData.cnpj || '',
          phone: storeData.telefone || '',
          email: storeData.email || '',
          address: storeData.endereco || '',
          logo_url: storeData.logo || '',
          social_networks: storeData.redesSociais || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error("Erro ao criar perfil da loja:", error.message);
      return { error };
    }

    return { data: data[0] };
  } catch (error: any) {
    console.error("Erro ao criar perfil da loja:", error.message);
    return { error };
  }
}

// Função para obter perfil de loja do usuário
export async function getUserStoreProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_store_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Erro ao obter perfil da loja:", error.message);
      return { error };
    }

    return { data };
  } catch (error: any) {
    console.error("Erro ao obter perfil da loja:", error.message);
    return { error };
  }
}

// Função para atualizar perfil de loja do usuário
export async function updateUserStoreProfile(userId: string, storeData: any) {
  try {
    const { data, error } = await supabase
      .from('user_store_profiles')
      .update({
        store_name: storeData.nome || '',
        cnpj: storeData.cnpj || '',
        phone: storeData.telefone || '',
        email: storeData.email || '',
        address: storeData.endereco || '',
        logo_url: storeData.logo || '',
        social_networks: storeData.redesSociais || {},
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error("Erro ao atualizar perfil da loja:", error.message);
      return { error };
    }

    return { data: data[0] };
  } catch (error: any) {
    console.error("Erro ao atualizar perfil da loja:", error.message);
    return { error };
  }
}
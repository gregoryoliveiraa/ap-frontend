import api from './api';
import { NotificationData } from './adminService';

// Interface para notificações do usuário
export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  created_at: string;
  action_link?: string;
  expiry_date?: string;
}

// Buscar notificações do usuário atual
export const getUserNotifications = async (): Promise<UserNotification[]> => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar notificações do usuário:', error);
    return [];
  }
};

// Marcar notificação como lida
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await api.put(`/notifications/${notificationId}/read`);
  } catch (error) {
    console.error(`Erro ao marcar notificação ${notificationId} como lida:`, error);
    throw error;
  }
};

// Marcar todas as notificações como lidas
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await api.put('/notifications/read-all');
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    throw error;
  }
};

// Excluir notificação do usuário
export const deleteUserNotification = async (notificationId: string): Promise<void> => {
  try {
    await api.delete(`/notifications/${notificationId}`);
  } catch (error) {
    console.error(`Erro ao excluir notificação ${notificationId}:`, error);
    throw error;
  }
};

// Armazenar notificações localmente para acesso offline
export const storeNotificationsLocally = (notifications: UserNotification[]): void => {
  try {
    localStorage.setItem('userNotifications', JSON.stringify(notifications));
  } catch (error) {
    console.error('Erro ao armazenar notificações localmente:', error);
  }
};

// Recuperar notificações armazenadas localmente
export const getLocalNotifications = (): UserNotification[] => {
  try {
    const notifications = localStorage.getItem('userNotifications');
    return notifications ? JSON.parse(notifications) : [];
  } catch (error) {
    console.error('Erro ao recuperar notificações locais:', error);
    return [];
  }
};

// Função para sincronizar notificações (útil para verificar após reconexão)
export const syncNotifications = async (): Promise<UserNotification[]> => {
  try {
    // Buscar notificações do servidor
    const serverNotifications = await getUserNotifications();
    
    // Atualizar cache local
    storeNotificationsLocally(serverNotifications);
    
    return serverNotifications;
  } catch (error) {
    console.error('Erro ao sincronizar notificações:', error);
    
    // Em caso de falha, retornar notificações locais
    return getLocalNotifications();
  }
}; 
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as notificationService from '../services/notificationService';
import { UserNotification } from '../services/notificationService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: UserNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Calcular notificações não lidas
  const unreadCount = notifications.filter(notif => !notif.read).length;

  // Buscar notificações quando o usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      refreshNotifications();
      
      // Definir um intervalo para verificar novas notificações a cada 2 minutos
      const interval = setInterval(() => {
        refreshNotifications();
      }, 2 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);
  
  // Função para atualizar notificações
  const refreshNotifications = async (): Promise<void> => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const userNotifications = await notificationService.getUserNotifications();
      setNotifications(userNotifications);
      
      // Armazenar notificações localmente
      notificationService.storeNotificationsLocally(userNotifications);
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
      setError('Falha ao carregar notificações');
      
      // Em caso de falha, carregar notificações do armazenamento local
      const localNotifications = notificationService.getLocalNotifications();
      setNotifications(localNotifications);
    } finally {
      setLoading(false);
    }
  };
  
  // Marcar notificação como lida
  const markAsRead = async (id: string): Promise<void> => {
    try {
      await notificationService.markNotificationAsRead(id);
      
      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      
      // Atualizar armazenamento local
      notificationService.storeNotificationsLocally(
        notifications.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error(`Erro ao marcar notificação ${id} como lida:`, err);
      setError('Falha ao marcar notificação como lida');
    }
  };
  
  // Marcar todas as notificações como lidas
  const markAllAsRead = async (): Promise<void> => {
    try {
      await notificationService.markAllNotificationsAsRead();
      
      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      // Atualizar armazenamento local
      notificationService.storeNotificationsLocally(
        notifications.map(notif => ({ ...notif, read: true }))
      );
    } catch (err) {
      console.error('Erro ao marcar todas as notificações como lidas:', err);
      setError('Falha ao marcar notificações como lidas');
    }
  };
  
  // Excluir notificação
  const deleteNotification = async (id: string): Promise<void> => {
    try {
      await notificationService.deleteUserNotification(id);
      
      // Atualizar estado local
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      
      // Atualizar armazenamento local
      notificationService.storeNotificationsLocally(
        notifications.filter(notif => notif.id !== id)
      );
    } catch (err) {
      console.error(`Erro ao excluir notificação ${id}:`, err);
      setError('Falha ao excluir notificação');
    }
  };
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}; 
import { exportBackup } from './persistenceService';

const AUTO_BACKUP_KEY = 'metalflow_auto_backup';
const AUTO_BACKUP_TIMESTAMP_KEY = 'metalflow_auto_backup_timestamp';
const AUTO_BACKUP_INTERVAL = 30 * 60 * 1000; // 30 minutos

let backupInterval = null;

export const initAutoBackup = () => {
  console.log('🔄 Auto-backup inicializado (a cada 30 minutos)');

  // Fazer backup imediatamente
  performAutoBackup();

  // Configurar intervalo automático
  if (backupInterval) clearInterval(backupInterval);
  backupInterval = setInterval(() => {
    performAutoBackup();
  }, AUTO_BACKUP_INTERVAL);

  // Fazer backup antes de sair
  window.addEventListener('beforeunload', () => {
    performAutoBackup();
  });
};

export const stopAutoBackup = () => {
  if (backupInterval) {
    clearInterval(backupInterval);
    backupInterval = null;
  }
  console.log('⏸️ Auto-backup parado');
};

export const performAutoBackup = async () => {
  try {
    const backup = await exportBackup();
    localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify(backup));
    localStorage.setItem(AUTO_BACKUP_TIMESTAMP_KEY, new Date().toISOString());

    console.log(
      `✅ Auto-backup realizado em ${new Date().toLocaleTimeString('pt-BR')} - ` +
      `${backup.data.quotations.length} orçamentos, ` +
      `${backup.data.clients.length} clientes, ` +
      `${backup.data.materials.length} materiais`
    );

    return {
      success: true,
      timestamp: new Date().toISOString(),
      backup,
    };
  } catch (error) {
    console.error('❌ Erro ao fazer auto-backup:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getLastAutoBackupTime = () => {
  const timestamp = localStorage.getItem(AUTO_BACKUP_TIMESTAMP_KEY);
  if (!timestamp) return null;

  const lastBackup = new Date(timestamp);
  const now = new Date();
  const diffMinutes = Math.floor((now - lastBackup) / 60000);

  return {
    timestamp: lastBackup,
    formattedTime: lastBackup.toLocaleString('pt-BR'),
    minutesAgo: diffMinutes,
    timeAgo: diffMinutes < 1 ? 'Agora' : `${diffMinutes}m atrás`,
  };
};

export const getAutoBackupStatus = () => {
  const backupTime = getLastAutoBackupTime();
  const autoBackup = localStorage.getItem(AUTO_BACKUP_KEY);

  return {
    hasBackup: !!autoBackup,
    lastBackup: backupTime,
    isHealthy: backupTime && backupTime.minutesAgo < 45, // Saudável se menos de 45 min
  };
};

export const checkDataIntegrity = async () => {
  try {
    const autoBackup = localStorage.getItem(AUTO_BACKUP_KEY);
    if (!autoBackup) {
      return {
        status: 'warning',
        message: 'Nenhum backup automático encontrado. Faça um backup manualmente.',
      };
    }

    const backup = JSON.parse(autoBackup);
    const stats = backup.metadata;

    return {
      status: 'ok',
      message: `✅ Dados íntegros. ${stats.totalQuotations} orçamentos, ${stats.totalClients} clientes.`,
      stats,
    };
  } catch (error) {
    return {
      status: 'error',
      message: `Erro ao validar backup: ${error.message}`,
    };
  }
};

export const manualBackupNow = performAutoBackup;

export const getBackupSummary = () => {
  const status = getAutoBackupStatus();
  const autoBackup = localStorage.getItem(AUTO_BACKUP_KEY);

  if (!autoBackup) {
    return {
      status: 'empty',
      message: '⚠️ Nenhum backup automático',
      details: null,
    };
  }

  try {
    const backup = JSON.parse(autoBackup);
    return {
      status: status.isHealthy ? 'healthy' : 'stale',
      message: status.isHealthy
        ? `✅ Backup atualizado (${status.lastBackup.timeAgo})`
        : `⚠️ Backup desatualizado (${status.lastBackup.timeAgo})`,
      details: {
        lastBackup: status.lastBackup,
        quotations: backup.data.quotations.length,
        clients: backup.data.clients.length,
        materials: backup.data.materials.length,
        users: backup.data.users.length,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      message: '❌ Erro ao ler backup',
      error: error.message,
    };
  }
};

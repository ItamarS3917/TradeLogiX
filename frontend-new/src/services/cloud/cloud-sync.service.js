import axios from 'axios';

// Cloud sync service for frontend
class CloudSyncService {
  constructor() {
    this.apiBase = '/api/cloud-sync';
    this.mcpClient = null;
  }

  // Initialize the service with MCP client
  initialize(mcpClient) {
    this.mcpClient = mcpClient;
    return this;
  }

  // Get synchronization status for a file or all files
  async getSyncStatus(filePath = null) {
    try {
      const params = filePath ? { file_path: filePath } : {};
      const response = await axios.get(`${this.apiBase}/status`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting sync status:', error);
      throw error;
    }
  }

  // Register a file for synchronization
  async registerFile(localPath, remotePath = null, syncDirection = 'bidirectional') {
    try {
      const response = await axios.post(`${this.apiBase}/register`, {
        local_path: localPath,
        remote_path: remotePath,
        sync_direction: syncDirection
      });
      return response.data;
    } catch (error) {
      console.error('Error registering file:', error);
      throw error;
    }
  }

  // Unregister a file from synchronization
  async unregisterFile(localPath, deleteRemote = false) {
    try {
      const response = await axios.post(`${this.apiBase}/unregister`, {
        local_path: localPath,
        delete_remote: deleteRemote
      });
      return response.data;
    } catch (error) {
      console.error('Error unregistering file:', error);
      throw error;
    }
  }

  // Synchronize files - all files or a specific file
  async syncFiles(localPath = null) {
    try {
      const response = await axios.post(`${this.apiBase}/sync`, {
        local_path: localPath
      });
      return response.data;
    } catch (error) {
      console.error('Error syncing files:', error);
      throw error;
    }
  }

  // Get synchronization logs
  async getSyncLogs(limit = 100, offset = 0) {
    try {
      const response = await axios.get(`${this.apiBase}/logs`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting sync logs:', error);
      throw error;
    }
  }

  // Resolve a synchronization conflict
  async resolveConflict(localPath, resolution) {
    try {
      const response = await axios.post(`${this.apiBase}/resolve-conflict`, {
        local_path: localPath,
        resolution: resolution
      });
      return response.data;
    } catch (error) {
      console.error('Error resolving conflict:', error);
      throw error;
    }
  }

  // Get synchronization configuration
  async getConfig() {
    try {
      const response = await axios.get(`${this.apiBase}/config`);
      return response.data;
    } catch (error) {
      console.error('Error getting config:', error);
      throw error;
    }
  }

  // Update synchronization configuration
  async updateConfig(config) {
    try {
      const response = await axios.post(`${this.apiBase}/config`, config);
      return response.data;
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  }
}

export const cloudSyncService = new CloudSyncService();
export default cloudSyncService;

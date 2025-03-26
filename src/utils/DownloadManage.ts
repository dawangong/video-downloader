class DownloadManager {
  private downloadTasks: Map<string, any>;

  constructor() {
    this.downloadTasks = new Map();
  }

  // 启动下载任务
  startDownload(url: string, totalParts: number) {
    if (!this.downloadTasks.has(url)) {
      this.downloadTasks.set(url, {
        url,
        totalParts,
        downloadedParts: new Set(),
        currentPartIndex: 0,
      });
    }
  }

  // 获取下载任务状态
  getDownloadStatus(url: string) {
    return this.downloadTasks.get(url) || null;
  }

  // 更新下载状态
  updateDownloadStatus(url: string, partIndex: number) {
    const task = this.downloadTasks.get(url);
    if (task) {
      task.downloadedParts.add(partIndex);
      task.currentPartIndex = partIndex + 1;
    }
  }

  // 获取重试参数：从哪个分块继续下载
  getRetryParams(url: string) {
    const task = this.downloadTasks.get(url);
    if (task) {
      return {
        retryIndex: task.currentPartIndex,
        downloadedParts: task.downloadedParts,
      };
    }
    return { retryIndex: 0, downloadedParts: new Set() };
  }

  // 重置下载任务
  resetDownload(url: string) {
    this.downloadTasks.delete(url);
  }
}

const downloadManager = new DownloadManager();

export default downloadManager;

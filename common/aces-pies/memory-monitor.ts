import { MemoryUsage, MemoryCheckpoint, MemorySummary } from './types';

// Memory monitoring utility
export class MemoryMonitor {
  private startTime: number;
  private startMemory: MemoryUsage;
  private peakMemory: MemoryUsage;
  private checkpoints: MemoryCheckpoint[];

  constructor() {
    this.startTime = Date.now();
    this.startMemory = process.memoryUsage();
    this.peakMemory = { ...this.startMemory };
    this.checkpoints = [];
  }

  // Get current memory usage
  getMemoryUsage(): {
    current: MemoryUsage;
    peak: MemoryUsage;
    start: MemoryUsage;
  } {
    const current = process.memoryUsage();

    // Update peak memory if current usage is higher
    Object.keys(current).forEach((key) => {
      const typedKey = key as keyof MemoryUsage;
      if (current[typedKey] > this.peakMemory[typedKey]) {
        this.peakMemory[typedKey] = current[typedKey];
      }
    });

    return {
      current,
      peak: this.peakMemory,
      start: this.startMemory,
    };
  }

  // Format bytes to human readable format
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Log memory usage
  logMemoryUsage(label: string = 'Current'): void {
    const usage = this.getMemoryUsage();
    const elapsed = Date.now() - this.startTime;

    console.log(
      `\n📊 ${label} Memory Usage (${(elapsed / 1000).toFixed(1)}s elapsed):`,
    );
    console.log(
      `   RSS: ${this.formatBytes(usage.current.rss)} (Peak: ${this.formatBytes(usage.peak.rss)})`,
    );
    console.log(
      `   Heap Used: ${this.formatBytes(usage.current.heapUsed)} (Peak: ${this.formatBytes(usage.peak.heapUsed)})`,
    );
    console.log(
      `   Heap Total: ${this.formatBytes(usage.current.heapTotal)} (Peak: ${this.formatBytes(usage.peak.heapTotal)})`,
    );
    console.log(
      `   External: ${this.formatBytes(usage.current.external)} (Peak: ${this.formatBytes(usage.peak.external)})`,
    );

    // Calculate memory growth
    const rssGrowth = usage.current.rss - usage.start.rss;
    const heapGrowth = usage.current.heapUsed - usage.start.heapUsed;

    console.log(
      `   RSS Growth: ${rssGrowth >= 0 ? '+' : ''}${this.formatBytes(rssGrowth)}`,
    );
    console.log(
      `   Heap Growth: ${heapGrowth >= 0 ? '+' : ''}${this.formatBytes(heapGrowth)}`,
    );
  }

  // Add a checkpoint
  checkpoint(label: string): void {
    const usage = this.getMemoryUsage();
    this.checkpoints.push({
      label,
      timestamp: Date.now(),
      memory: { ...usage.current },
    });

    console.log(`\n📍 Checkpoint: ${label}`);
    this.logMemoryUsage(label);
  }

  // Get summary
  getSummary(): MemorySummary {
    const usage = this.getMemoryUsage();
    const elapsed = Date.now() - this.startTime;

    return {
      elapsed,
      startMemory: this.startMemory,
      currentMemory: usage.current,
      peakMemory: usage.peak,
      checkpoints: this.checkpoints,
    };
  }

  // Log final summary
  logSummary(): void {
    const summary = this.getSummary();

    console.log('\n🎯 Final Memory Summary:');
    console.log(`   Total Time: ${(summary.elapsed / 1000).toFixed(1)}s`);
    console.log(
      `   RSS: ${this.formatBytes(summary.startMemory.rss)} → ${this.formatBytes(summary.currentMemory.rss)} (Peak: ${this.formatBytes(summary.peakMemory.rss)})`,
    );
    console.log(
      `   Heap: ${this.formatBytes(summary.startMemory.heapUsed)} → ${this.formatBytes(summary.currentMemory.heapUsed)} (Peak: ${this.formatBytes(summary.peakMemory.heapUsed)})`,
    );

    if (summary.checkpoints.length > 0) {
      console.log('\n📍 Checkpoints:');
      summary.checkpoints.forEach((cp, index) => {
        const timeFromStart = (cp.timestamp - this.startTime) / 1000;
        console.log(
          `   ${index + 1}. ${cp.label} (${timeFromStart.toFixed(1)}s): ${this.formatBytes(cp.memory.rss)} RSS, ${this.formatBytes(cp.memory.heapUsed)} Heap`,
        );
      });
    }
  }
}

// If run directly, create a demo
if (require.main === module) {
  const monitor = new MemoryMonitor();

  console.log('🧠 Memory Monitor Demo');
  monitor.checkpoint('Start');

  // Simulate some memory usage
  setTimeout(() => {
    const arr = new Array(1000000).fill('test');
    monitor.checkpoint('After creating large array');

    setTimeout(() => {
      arr.length = 0; // Clear array
      monitor.checkpoint('After clearing array');

      setTimeout(() => {
        monitor.logSummary();
        process.exit(0);
      }, 1000);
    }, 1000);
  }, 1000);
}

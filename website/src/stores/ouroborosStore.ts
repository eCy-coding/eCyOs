import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface FeedbackLoop {
  id: string;
  issue: string;
  patch: string;
  status: 'pending' | 'applied' | 'failed';
  timestamp: number;
}

export interface PerformanceMetric {
  timestamp: number;
  fps: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface OuroborosState {
  feedbackLoops: FeedbackLoop[];
  metrics: PerformanceMetric[];
  isAutoHealingEnabled: boolean;
  
  addFeedbackLoop: (issue: string, patch: string) => void;
  updateLoopStatus: (id: string, status: FeedbackLoop['status']) => void;
  recordMetric: (metric: Omit<PerformanceMetric, 'timestamp'>) => void;
  toggleAutoHealing: () => void;
  getAverageMetrics: () => { fps: number; memory: number; cpu: number } | null;
}

export const useOuroborosStore = create<OuroborosState>()(
  devtools(
    immer((set, get) => ({
      feedbackLoops: [],
      metrics: [],
      isAutoHealingEnabled: true,
      
      addFeedbackLoop: (issue, patch) => set((state) => {
        const loop: FeedbackLoop = {
          id: `loop-${Date.now()}`,
          issue,
          patch,
          status: 'pending',
          timestamp: Date.now(),
        };
        state.feedbackLoops.push(loop);
      }),
      
      updateLoopStatus: (id, status) => set((state) => {
        const loop = state.feedbackLoops.find(l => l.id === id);
        if (loop) loop.status = status;
      }),
      
      recordMetric: (metric) => set((state) => {
        state.metrics.push({ ...metric, timestamp: Date.now() });
        // Keep only last 1000 metrics
        if (state.metrics.length > 1000) {
          state.metrics = state.metrics.slice(-1000);
        }
      }),
      
      toggleAutoHealing: () => set((state) => {
        state.isAutoHealingEnabled = !state.isAutoHealingEnabled;
      }),
      
      getAverageMetrics: () => {
        const { metrics } = get();
        if (metrics.length === 0) return null;
        
        const sum = metrics.reduce((acc, m) => ({
          fps: acc.fps + m.fps,
          memory: acc.memory + m.memoryUsage,
          cpu: acc.cpu + m.cpuUsage,
        }), { fps: 0, memory: 0, cpu: 0 });
        
        return {
          fps: sum.fps / metrics.length,
          memory: sum.memory / metrics.length,
          cpu: sum.cpu / metrics.length,
        };
      },
    })),
    { name: 'OuroborosStore' }
  )
);

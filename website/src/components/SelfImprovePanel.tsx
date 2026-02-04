import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient'; // Assumes a Supabase client wrapper exists

interface Cycle {
  id: number;
  topic: string;
  start_time: string;
}

interface PatchLog {
  id: number;
  cycle_id: number;
  patch: string;
  success: boolean;
}

export const SelfImprovePanel: React.FC = () => {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const [patches, setPatches] = useState<PatchLog[]>([]);

  // Load improvement cycles on mount
  useEffect(() => {
    const fetchCycles = async () => {
      const { data, error } = await supabase.from('improvement_cycles').select('*');
      if (error) {
        console.error('Failed to fetch cycles:', error);
        return;
      }
      setCycles(data as Cycle[]);
    };
    fetchCycles();
  }, []);

  // Load patches when a cycle is selected
  useEffect(() => {
    if (!selectedCycle) return;
    const fetchPatches = async () => {
      const { data, error } = await supabase
        .from('patch_logs')
        .select('*')
        .eq('cycle_id', selectedCycle.id);
      if (error) {
        console.error('Failed to fetch patches:', error);
        return;
      }
      setPatches(data as PatchLog[]);
    };
    fetchPatches();
  }, [selectedCycle]);

  return (
    <div className="p-4 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg border border-white/20">
      <h2 className="text-xl font-semibold mb-4 text-white">Self‑Improvement Engine</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Cycle List */}
        <div className="overflow-y-auto max-h-64">
          <h3 className="text-lg font-medium text-white mb-2">Improvement Cycles</h3>
          <ul className="space-y-2">
            {cycles.map((c) => (
              <li
                key={c.id}
                className={`p-2 rounded cursor-pointer ${selectedCycle?.id === c.id ? 'bg-blue-600' : 'bg-white/5'} hover:bg-white/10`}
                onClick={() => setSelectedCycle(c)}
              >
                <span className="font-medium text-white">{c.topic}</span>
                <br />
                <span className="text-xs text-gray-300">{new Date(c.start_time).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Patch Log */}
        <div className="overflow-y-auto max-h-64">
          <h3 className="text-lg font-medium text-white mb-2">Patch Log</h3>
          {selectedCycle ? (
            <ul className="space-y-2">
              {patches.map((p) => (
                <li key={p.id} className="p-2 bg-white/5 rounded">
                  <pre className="text-xs whitespace-pre-wrap text-gray-200">{p.patch}</pre>
                  <span className={`text-sm ${p.success ? 'text-green-400' : 'text-red-400'}`}>
                    {p.success ? 'Applied' : 'Failed'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-300">Select a cycle to view patches.</p>
          )}
        </div>
      </div>
    </div>
  );
};

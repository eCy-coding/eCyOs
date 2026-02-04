import React, { useState, useCallback } from 'react';

// Define the API type (approximate)
declare global {
  interface Window {
    api: {
      python: {
        execute: (action: string, payload: unknown) => Promise<any>;
      }
    }
  }
}

export const CortexDashboard: React.FC = React.memo(() => {
  const [nlpResult, setNlpResult] = useState<any>(null);
  const [trendResult, setTrendResult] = useState<any>(null);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [output, setOutput] = useState<string>('');

  const handleAnalyze = useCallback(async () => {
        if (!window.api || !window.api.python) {
            setStatus('Error: Python API unavailable');
            return;
        }
        setLoading(true);
        setStatus('Analyzing Logs with NLP...');
        try {
            const result = await window.api.python.execute('ANALYZE_LOGS', { logs: ['System startup normal', 'User login'] });
            setOutput(JSON.stringify(result, null, 2));
            setStatus('Analysis Complete.');
        } catch (error: unknown) {
            setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setLoading(false);
        }
    }, []);

  const handlePredict = useCallback(async () => {
    const data = [10, 15, 20, 25, 30];
    try {
      const res = await window.api.python.execute('PREDICT_TREND', { data });
      setTrendResult(res.result);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [mathResult, setMathResult] = useState<any>(null);

  const handleMath = useCallback(async () => {
    try {
      const res = await window.api.python.execute('MATH_EXEC', { 
          library: 'scipy', 
          function: 'optimize.minimize', 
          args: ['x^2 + 10', 0] 
      });
      setMathResult(res.result);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [academicResult, setAcademicResult] = useState<any>(null);

  const handleAcademic = useCallback(async () => {
    try {
        const problem = "Optimize system ipc latency";
        // Just mock a loop trigger
        const res = await window.api.python.execute('ACADEMIC_LOOP', { problem_statement: problem });
        setAcademicResult(res.cycle);
    } catch (e) {
        console.error(e);
    }
  }, []);

  const handleAudit = useCallback(async () => {
    try {
      // Directs the Auditor to scan the source directory
      const res = await window.api.python.execute('AUDIT_CODE', { directory: 'src/orchestra' });
      setAuditResult(res.result);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [w3cResult, setW3cResult] = useState<any>(null);

  const handleW3C = useCallback(async () => {
    try {
        setW3cResult({ status: 'scanning', report_content: 'Scanning localhost...' });
        const res = await window.api.python.execute('W3C_SCAN', { base_url: 'http://localhost:3000' });
        setW3cResult(res);
    } catch (e: any) {
        console.error(e);
        setW3cResult({ status: 'error', error: e.message });
    }
  }, []);

  const [vitalsResult, setVitalsResult] = useState<any>(null);

  const handleVitals = useCallback(async () => {
      try {
          // @ts-ignore
          const res = await window.api.diagnostics.status();
          setVitalsResult(res);
      } catch (e: any) {
          console.error(e);
          setVitalsResult({ error: e.message });
      }
  }, []);

  return (
    <section aria-label="Cortex Dashboard" className="p-4 border rounded bg-gray-900 text-white mt-4">
      <h2 className="text-xl mb-4">🐍 Serpent Cortex (Python)</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* NLP Section */}
        <article className="p-3 border border-gray-700 rounded">
          <h3 className="font-bold">NLP Analyzer</h3>
          <p className="text-sm text-gray-400">Log: "Warning: High Latency..."</p>
          <button 
            onClick={handleAnalyze}
            className="mt-2 bg-blue-600 px-3 py-1 rounded hover:bg-blue-500"
          >
            Analyze Logs
          </button>
          {nlpResult && (
            <div className="mt-2 text-sm">
              <p>Health Score: <span className="font-bold text-yellow-400">{nlpResult.health_score}</span></p>
              <p>Errors: {nlpResult.error_count}</p>
            </div>
          )}
        </article>

        {/* Data Science Section */}
        <article className="p-3 border border-gray-700 rounded">
          <h3 className="font-bold">Predictive Engine</h3>
          <p className="text-sm text-gray-400">Data: [10, 15... 30]</p>
          <button 
            onClick={handlePredict}
            className="mt-2 bg-purple-600 px-3 py-1 rounded hover:bg-purple-500"
          >
            Predict Trend
          </button>
          {trendResult && (
            <div className="mt-2 text-sm">
              <p>Trend: <span className="font-bold text-green-400">{trendResult.trend}</span></p>
              <p>Next: {trendResult.next_predicted_value}</p>
            </div>
          )}
        </article>

        {/* Math Engine Section */}
        <article className="p-3 border border-gray-700 rounded bg-gray-800">
            <h3 className="font-bold">🧮 Math Engine</h3>
            <p className="text-sm text-gray-400">Lib: Scipy (Optimize)</p>
            <button 
                onClick={handleMath}
                className="mt-2 bg-pink-600 px-3 py-1 rounded hover:bg-pink-500"
            >
                Run Optimization
            </button>
            {mathResult && (
                <div className="mt-2 text-xs font-mono break-all bg-black/30 p-2 rounded">
                    {typeof mathResult === 'string' ? mathResult.slice(0, 100) : JSON.stringify(mathResult).slice(0,100)}
                </div>
            )}
        </article>

        {/* Academic Engine Section */}
        <article className="p-3 border border-gray-700 rounded bg-indigo-900/30">
             <h3 className="font-bold">🎓 The Dynamicist</h3>
             <p className="text-sm text-gray-400">Loop: Plan &rarr; Critique &rarr; Refine</p>
             <button 
                onClick={handleAcademic}
                className="mt-2 bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-500"
            >
                Run Optimization Loop
            </button>
            {academicResult && (
                <div className="mt-2 text-xs font-mono break-all bg-black/30 p-2 rounded">
                    <p className="text-green-300">Plan: {academicResult.initial_plan?.response?.slice(0, 30)}...</p>
                    <p className="text-red-300">Critique: {academicResult.critique?.response?.slice(0,30)}...</p>
                    <p className="text-blue-300">Refined: {academicResult.final_solution?.response?.slice(0,30)}...</p>
                </div>
            )}
        </article>

        {/* Audit Section */}
        <article className="p-3 border border-gray-700 rounded col-span-2 bg-gray-800">
          <h3 className="font-bold">🛡️ Universal Self-Audit</h3>
          <p className="text-sm text-gray-400">Target: src/orchestra</p>
          <button
            onClick={handleAudit}
            className="mt-2 bg-red-600 px-3 py-1 rounded hover:bg-red-500"
          >
            Run System Audit
          </button>
          {auditResult && (
             <div className="mt-2 text-sm grid grid-cols-3 gap-2">
               <p>Files: <span className="font-mono">{auditResult.files_scanned}</span></p>
               <p>Errors: <span className="font-bold text-red-400">{auditResult.errors}</span></p>
               <p>System Status: <span className="text-green-400">ACTIVE</span></p>
             </div>
          )}
        </article>
        {/* W3C Compliance Section */}
        <article className="p-3 border border-gray-700 rounded bg-green-900/20">
             <h3 className="font-bold">🌍 W3C Automator</h3>
             <p className="text-sm text-gray-400">Scan: localhost:3000</p>
             <button 
                onClick={handleW3C}
                className="mt-2 bg-green-600 px-3 py-1 rounded hover:bg-green-500"
            >
                Start Compliance Scan
            </button>
            {w3cResult && (
                <div className="mt-2 text-xs font-mono break-all bg-black/30 p-2 rounded max-h-32 overflow-y-auto">
                    {w3cResult.status === 'scanning' ? (
                        <p className="animate-pulse">Scanning routes...</p>
                    ) : (
                        <>
                            <p>Status: {w3cResult.status}</p>
                            <p>Violations: {w3cResult.total_violations}</p>
                            <div className="mt-1 border-t border-gray-600 pt-1">
                                {w3cResult.results?.map((r: any) => (
                                    <div key={r.route} className="flex justify-between">
                                        <span>{r.route}</span>
                                        <span className={r.status === 'PASS' ? 'text-green-400' : 'text-red-400'}>{r.status}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </article>

        {/* System Vitals Section */}
        <article className="p-3 border border-gray-700 rounded bg-gray-800">
             <h3 className="font-bold">🖥️ System Vitals</h3>
             <p className="text-sm text-gray-400">Perf Monitor</p>
             <button 
                onClick={handleVitals}
                className="mt-2 bg-teal-600 px-3 py-1 rounded hover:bg-teal-500"
            >
                Check Vitals
            </button>
            {vitalsResult && (
                 <div className="mt-2 text-xs font-mono">
                   <p>Brain Active: <span className={vitalsResult.brain ? "text-green-400" : "text-red-400"}>{vitalsResult.brain ? 'YES' : 'NO'}</span></p>
                   <p>Hippocampus: <span className={vitalsResult.hippocampus ? "text-green-400" : "text-red-400"}>{vitalsResult.hippocampus ? 'YES' : 'NO'}</span></p>
                   <p>Uptime: {vitalsResult.uptime ? vitalsResult.uptime.toFixed(1) : 0}s</p>
                 </div>
            )}
        </article>
      </div>
    </section>
  );
});

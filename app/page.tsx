"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [hostname, setHostname] = useState("localhost");
  const [requestId, setRequestId] = useState("REQ-0000-0000");
  const [timeString, setTimeString] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);
  const [diagVisible, setDiagVisible] = useState(false);
  const [diagLogs, setDiagLogs] = useState<string[]>([]);
  const [diagStatus, setDiagStatus] = useState<"idle" | "running" | "done">("idle");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostname(window.location.host || "localhost");
      
      const updateTime = () => {
        const d = new Date();
        setTimeString(d.toISOString().replace("T", " ").substring(0, 19) + " UTC");
      };
      updateTime();
      const interval = setInterval(updateTime, 1000);

      // Generate random Request ID
      const randStr = Math.random().toString(36).substring(2, 10).toUpperCase();
      setRequestId(`REQ-${randStr.substring(0, 4)}-${randStr.substring(4, 8)}`);

      return () => clearInterval(interval);
    }
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const diagnosticSequence = [
    { text: "Initializing diagnostic suite...", type: "info" },
    { text: "Resolving DNS configuration...", type: "info" },
    { text: "DNS lookup resolved successfully to 127.0.0.1", type: "success" },
    { text: "Pinging gateway interface...", type: "info" },
    { text: "Gateway responded in 0.8ms", type: "success" },
    { text: `Establishing TCP handshake with ${hostname}...`, type: "info" },
    { text: "Connection refused: Remote server rejected the connection", type: "error" },
    { text: "Checking web service status...", type: "info" },
    { text: "Port is closed or blocked. The service might be offline.", type: "warning" },
    { text: "Diagnostic finished. Conclusion: SERVER_NOT_FOUND", type: "conclusion" },
  ];

  const runDiagnostics = () => {
    if (diagStatus === "running") return;
    setDiagVisible(true);
    setDiagStatus("running");
    setDiagLogs([]);

    let currentStep = 0;
    const intervalTime = [200, 400, 300, 500, 300, 600, 450, 350, 400, 100];

    const runNext = () => {
      if (currentStep < diagnosticSequence.length) {
        setDiagLogs((prev) => [...prev, diagnosticSequence[currentStep].text]);
        currentStep++;
        if (currentStep < diagnosticSequence.length) {
          setTimeout(runNext, intervalTime[currentStep]);
        } else {
          setDiagStatus("done");
        }
      }
    };

    setTimeout(runNext, intervalTime[0]);
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-between p-6 md:p-12 overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-[#09090b] dark:text-zinc-50 font-sans transition-colors duration-300">
      
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="font-mono text-xs tracking-wider uppercase font-semibold text-zinc-500 dark:text-zinc-400">
            Status // Offline
          </span>
        </div>
        <div className="font-mono text-xs text-zinc-400 dark:text-zinc-500 hidden sm:block">
          {timeString || "0000-00-00 00:00:00 UTC"}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full space-y-6 py-6">
        
        {/* Error Intro */}
        <div className="space-y-4">
          <div className="font-mono text-xs tracking-wider text-rose-500 dark:text-rose-400 uppercase font-medium">
            Error Code: 404_SERVER_OFFLINE
          </div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.1]">
            Server Not Found
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg">
            The requested application or server could not be reached. The host may be undergoing maintenance, experiencing network difficulties, or is currently shut down.
          </p>
        </div>

        {/* Diagnostic Key-Value Details */}
        <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-5 bg-white/40 dark:bg-zinc-900/10 backdrop-blur-sm space-y-3 font-mono text-[11px] md:text-xs">
          <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900/50 pb-2">
            <span className="text-zinc-400 dark:text-zinc-500">Target Host</span>
            <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{hostname}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900/50 pb-2">
            <span className="text-zinc-400 dark:text-zinc-500">Request ID</span>
            <span className="text-zinc-700 dark:text-zinc-300">{requestId}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900/50 pb-2">
            <span className="text-zinc-400 dark:text-zinc-500">IP Resolution</span>
            <span className="text-zinc-700 dark:text-zinc-300">127.0.0.1</span>
          </div>
          <div className="flex justify-between pb-0">
            <span className="text-zinc-400 dark:text-zinc-500">System Log</span>
            <span className="text-red-500 dark:text-rose-400 font-medium font-mono">ERR_CONNECTION_REFUSED</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className={`flex-1 h-11 flex items-center justify-center gap-2 rounded-md font-medium text-sm transition-all duration-200 shadow-sm border border-zinc-900 dark:border-zinc-100 ${
                isRetrying
                  ? "bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-600 dark:border-zinc-800 cursor-not-allowed"
                  : "bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 cursor-pointer"
              }`}
            >
              {isRetrying ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Checking link...
                </>
              ) : (
                "Retry Connection"
              )}
            </button>
            
            <button
              onClick={runDiagnostics}
              disabled={diagStatus === "running"}
              className="h-11 px-5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 active:bg-zinc-100 dark:active:bg-zinc-900 rounded-md font-medium text-sm text-zinc-600 dark:text-zinc-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Run Diagnostics
            </button>
          </div>

          {/* Diagnostic Log Output */}
          {diagVisible && (
            <div className="w-full bg-zinc-950 border border-zinc-850 dark:border-zinc-800/80 rounded-lg p-4 font-mono text-[10px] md:text-xs text-zinc-400 space-y-1.5 overflow-hidden transition-all duration-300">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Diagnostic Output</span>
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${diagStatus === "running" ? "bg-amber-500 animate-pulse" : diagStatus === "done" ? "bg-green-500" : "bg-zinc-600"}`} />
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500">{diagStatus}</span>
                </span>
              </div>
              
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {diagLogs.map((log, idx) => {
                  let styleClass = "text-zinc-400";
                  if (log.includes("resolved successfully") || log.includes("responded in")) {
                    styleClass = "text-emerald-500 dark:text-emerald-400";
                  } else if (log.includes("refused") || log.includes("Error:")) {
                    styleClass = "text-rose-500 dark:text-rose-400";
                  } else if (log.includes("closed or blocked")) {
                    styleClass = "text-amber-500 dark:text-amber-400";
                  } else if (log.includes("Conclusion:")) {
                    styleClass = "text-zinc-200 dark:text-zinc-100 font-semibold border-t border-zinc-900 mt-2 pt-1.5";
                  }
                  
                  return (
                    <div key={idx} className={`${styleClass} leading-relaxed`}>
                      <span className="text-zinc-600 dark:text-zinc-700 mr-2 select-none">&gt;</span>
                      {log}
                    </div>
                  );
                })}
                {diagStatus === "running" && (
                  <div className="text-zinc-500 animate-pulse flex items-center">
                    <span className="text-zinc-600 dark:text-zinc-700 mr-2 select-none">&gt;</span>
                    <span className="inline-block w-1.5 h-3 bg-zinc-400 ml-0.5" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 pt-4 flex items-center justify-between text-[10px] md:text-xs text-zinc-400 dark:text-zinc-500">
        <div className="font-mono tracking-wider uppercase">
          VIJAY SINGH
        </div>
        <div>
          <a href="mailto:vijstack@gmail.com" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Support</a>
        </div>
      </footer>

    </div>
  );
}

// Network Traffic Generator Worker
// Offloads random generation to keep main thread 60FPS

interface Packet {
    id: string;
    timestamp: string;
    source: string;
    dest: string;
    protocol: string;
    size: number;
    status: 'allow' | 'block' | 'warn';
}

console.log("Network Sentinel Worker: Online");

let intervalId: ReturnType<typeof setInterval> | null = null;

self.onmessage = (e: MessageEvent) => {
    if (e.data === 'start') {
        if (!intervalId) {
            intervalId = setInterval(generateTraffic, 800);
        }
    } else if (e.data === 'stop') {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }
};

function generateTraffic() {
    const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'SSH', 'FTP'];
    const statuses: ('allow' | 'block' | 'warn')[] = ['allow', 'allow', 'allow', 'block', 'warn'];
    
    // Generate 1-3 packets per tick
    const count = Math.floor(Math.random() * 3) + 1;
    const newPackets: Packet[] = [];
    
    let totalIn = 0;
    let totalOut = 0;

    for (let i = 0; i < count; i++) {
        const size = Math.floor(Math.random() * 1500) + 64;
        const type = Math.random() > 0.5 ? 'in' : 'out';
        
        if (type === 'in') totalIn += size;
        else totalOut += size;

        newPackets.push({
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            source: `192.168.1.${Math.floor(Math.random() * 255)}`,
            dest: `10.0.0.${Math.floor(Math.random() * 255)}`,
            protocol: protocols[Math.floor(Math.random() * protocols.length)],
            size: size,
            status: statuses[Math.floor(Math.random() * statuses.length)]
        });
    }

    self.postMessage({ packets: newPackets, stats: { in: totalIn, out: totalOut } });
}

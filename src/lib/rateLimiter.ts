const requests: Record<string, { count: number; timestamp: number }> = {};
const WINDOW = 60 * 1000;
const LIMIT = 5;

export function isRateLimited(ip: string) {
    const now = Date.now();

    if (!requests[ip]) {
        requests[ip] = { count: 1, timestamp: now };
        return false;
    }

    const elapsed = now - requests[ip].timestamp;

    if (elapsed > WINDOW) {
        requests[ip] = { count: 1, timestamp: now };
        return false;
    }

    requests[ip].count++;

    return requests[ip].count > LIMIT;
}

// js/pages/realtime_sync_engine.js
// 🚀 Enterprise Sync Engine: Offline-First IndexedDB, Real-RTT Monitor & Anti-Flood Re-Sync Queue (v12.5)

/**
 * @typedef {Object} CachePayload
 * @property {number} timestamp
 * @property {any} data
 */

class RealtimeSyncEngineService {
    #dbPromise = null;
    #isSyncingQueue = false; // 🚨 THE FIX: ป้องกัน Race Condition เวลารันซิงค์ซ้อนกัน

    constructor() {
        /** @type {boolean} */
        this.isConnected = false;
        /** @type {number} */
        this.latency = 0;
        /** @type {number|null} */
        this.pingTimer = null;
        /** @type {number} */
        this.cacheTTL = 1000 * 60 * 60; // 1 hour
        /** @type {string} */
        this.dbName = 'DialysisPro_OfflineDB';
        /** @type {number} */
        this.dbVersion = 1;

        // UI Target Bindings
        this.ui = {
            widget: document.getElementById('topbar-sync-widget'),
            dot: document.getElementById('sync-dot-indicator'),
            text: document.getElementById('sync-text-indicator'),
            ping: document.getElementById('sync-ping-indicator'),
            fbBadge: document.getElementById('firebase-active-badge')
        };

        this.#initIndexedDB();
    }

    /**
     * Initialize IndexedDB for resilient offline storage
     * @private
     */
    #initIndexedDB() {
        this.#dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = request.result;
                if (!db.objectStoreNames.contains('cache_store')) {
                    db.createObjectStore('cache_store');
                }
                if (!db.objectStoreNames.contains('mutation_queue')) {
                    db.createObjectStore('mutation_queue', { keyPath: 'id', autoIncrement: true });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Public Initialization
     */
    async init() {
        if (typeof firebase === 'undefined' || typeof db === 'undefined') {
            console.error("🚨 [Sync Engine] Firebase SDK is missing. Engine halting.");
            this.#updateUI(false, "System Offline", "-- ms");
            return;
        }

        console.log("⚡ [Sync Engine] Enterprise Core Activated. Monitoring Connection & Hardware Events...");
        
        this.#setupNetworkListeners();
        this.#monitorFirebaseConnection();
    }

    /**
     * Bind Native Browser Network Events (WiFi Drop / Airplane Mode)
     * @private
     */
    #setupNetworkListeners() {
        window.addEventListener('online', () => {
            console.log("🌐 [Network] Native Online Event Detected.");
            this.#processMutationQueue();
        });

        window.addEventListener('offline', () => {
            console.warn("📡 [Network] Native Offline Event Detected.");
            this.isConnected = false;
            this.#updateUI(false, "Network Disconnected", "Offline");
        });
    }

    /**
     * Firebase .info/connected Observer
     * @private
     */
    #monitorFirebaseConnection() {
        const connectedRef = db.ref('.info/connected');

        connectedRef.on('value', (snap) => {
            const isOnline = snap.val() === true;
            this.isConnected = isOnline;

            if (isOnline) {
                this.#updateUI(true, "Live Sync Active", "measuring...");
                this.#startRealRTTMeasurement();
                this.#processMutationQueue();
            } else {
                this.#updateUI(false, "Reconnecting...", "Wait");
                this.#stopRTTMeasurement();
            }
        });
    }

    /**
     * Measures True RTT Latency using Real Firebase Realtime DB Timestamp
     * @private
     */
    #startRealRTTMeasurement() {
        this.#stopRTTMeasurement();

        const measureRTT = async () => {
            if (!this.isConnected) return;

            const startTime = performance.now();
            try {
                // Read a lightweight system node to get true Network RTT
                await db.ref('.info/serverTimeOffset').once('value');
                const endTime = performance.now();
                
                this.latency = Math.round(endTime - startTime);
                this.#renderPingUI(this.latency);
            } catch (err) {
                console.warn("⚠️ [Sync Engine] RTT Measurement Error:", err);
            }
        };

        measureRTT();
        this.pingTimer = window.setInterval(measureRTT, 15000); // Check every 15s
    }

    /**
     * @private
     */
    #stopRTTMeasurement() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }

    /**
     * Render Latency Indicator securely
     * @param {number} latency 
     * @private
     */
    #renderPingUI(latency) {
        if (!this.ui.ping) return;

        this.ui.ping.textContent = `${latency} ms`;
        if (latency < 80) {
            this.ui.ping.style.color = '#10b981'; // Green
        } else if (latency < 200) {
            this.ui.ping.style.color = '#f59e0b'; // Amber
        } else {
            this.ui.ping.style.color = '#ef4444'; // Red
        }
    }

    /**
     * Update UI Status Safe from XSS
     * @private
     */
    #updateUI(isOnline, textMsg, pingMsg) {
        if (!this.ui.widget) return;

        if (this.ui.dot) {
            this.ui.dot.className = isOnline ? 'sync-dot active' : 'sync-dot offline';
        }

        if (this.ui.text) {
            this.ui.text.textContent = textMsg;
            this.ui.text.style.color = isOnline ? '#0f172a' : '#ef4444';
        }

        if (!isOnline && this.ui.ping) {
            this.ui.ping.textContent = pingMsg;
            this.ui.ping.style.color = '#94a3b8';
        }

        if (this.ui.fbBadge) {
            this.ui.fbBadge.style.backgroundColor = isOnline ? '#10b981' : '#ef4444';
            this.ui.fbBadge.style.borderColor = isOnline ? '#059669' : '#b91c1c';
            
            // Clear and construct DOM nodes securely
            this.ui.fbBadge.textContent = '';
            const icon = document.createElement('i');
            icon.className = isOnline ? 'fa-solid fa-database me-2' : 'fa-solid fa-triangle-exclamation me-2';
            
            const label = document.createTextNode(isOnline ? ' Firebase Active' : ' Disconnected');
            this.ui.fbBadge.appendChild(icon);
            this.ui.fbBadge.appendChild(label);
        }
    }

    /**
     * Asynchronous Fast Data Fetcher with Stale-While-Revalidate Engine
     * @param {string} path - Firebase Node Path
     * @param {string} cacheKey - Unique Cache Identifier
     * @returns {Promise<any>}
     */
    async fetchFast(path, cacheKey) {
        const cachedPayload = await this.#getCacheIndexedDB(cacheKey);
        const now = Date.now();

        if (cachedPayload && (now - cachedPayload.timestamp < this.cacheTTL)) {
            // Background Revalidation if Online
            if (this.isConnected) {
                this.#revalidateBackground(path, cacheKey);
            }
            return cachedPayload.data;
        }

        // Cache miss or expired: Fetch fresh data
        try {
            const snap = await db.ref(path).once('value');
            const freshData = snap.val();
            await this.#setCacheIndexedDB(cacheKey, freshData);
            return freshData;
        } catch (error) {
            console.error(`[Sync Engine] Fetch failed for ${path}:`, error);
            if (cachedPayload) {
                console.warn(`[Sync Engine] Serving expired cache for ${cacheKey}`);
                return cachedPayload.data;
            }
            throw error;
        }
    }

    /**
     * Stale-While-Revalidate Sync
     * @private
     */
    async #revalidateBackground(path, cacheKey) {
        try {
            const snap = await db.ref(path).once('value');
            const freshData = snap.val();
            await this.#setCacheIndexedDB(cacheKey, freshData);
        } catch (err) {
            console.warn(`[Sync Engine] Background revalidation failed for ${path}:`, err);
        }
    }

    /**
     * Queue mutations when offline (Idempotent Action)
     * @param {string} path 
     * @param {string} method - 'SET' | 'UPDATE' | 'REMOVE'
     * @param {any} payload 
     */
    async enqueueMutation(path, method, payload) {
        if (this.isConnected) {
            return this.#executeFirebaseMutation(path, method, payload);
        }

        console.warn(`[Sync Engine] Offline. Enqueueing ${method} for ${path}`);
        const dbInstance = await this.#dbPromise;
        const tx = dbInstance.transaction('mutation_queue', 'readwrite');
        const store = tx.objectStore('mutation_queue');
        
        store.add({
            path,
            method,
            payload,
            timestamp: Date.now()
        });
    }

    /**
     * Process Enqueued Offline Mutations when connectivity is restored
     * @private
     */
    async #processMutationQueue() {
        if (!this.isConnected || this.#isSyncingQueue) return;
        
        this.#isSyncingQueue = true; // Lock ป้องกันรันซ้อนกัน

        try {
            const dbInstance = await this.#dbPromise;
            const tx = dbInstance.transaction('mutation_queue', 'readonly');
            const store = tx.objectStore('mutation_queue');
            
            const request = store.getAll();

            request.onsuccess = async () => {
                const items = request.result;
                if (!items || items.length === 0) {
                    this.#isSyncingQueue = false;
                    return;
                }

                console.log(`🚀 [Sync Engine] Re-syncing ${items.length} queued offline mutations...`);

                for (const item of items) {
                    try {
                        await this.#executeFirebaseMutation(item.path, item.method, item.payload);
                        
                        // ลบออกจากคิวเมื่อยิงสำเร็จ
                        const delTx = dbInstance.transaction('mutation_queue', 'readwrite');
                        delTx.objectStore('mutation_queue').delete(item.id);
                        
                        // 🚨 THE FIX: Rate Limiting (Spillway)
                        // หน่วงเวลา 50ms ระหว่างแต่ละ request ป้องกันเซิร์ฟเวอร์โดน DDoS และแอปค้าง
                        await new Promise(resolve => setTimeout(resolve, 50));
                        
                    } catch (err) {
                        console.error(`❌ [Sync Engine] Failed to sync mutation ID ${item.id}:`, err);
                    }
                }
                
                this.#isSyncingQueue = false; // ปลด Lock
            };
            
            request.onerror = () => {
                console.error("[Sync Engine] Failed to read mutation queue");
                this.#isSyncingQueue = false;
            };
        } catch (error) {
            this.#isSyncingQueue = false;
        }
    }

    /**
     * @private
     */
    async #executeFirebaseMutation(path, method, payload) {
        const ref = db.ref(path);
        if (method === 'SET') return ref.set(payload);
        if (method === 'UPDATE') return ref.update(payload);
        if (method === 'REMOVE') return ref.remove();
        throw new Error(`Unsupported method ${method}`);
    }

    // --- IndexedDB Cache Helpers ---

    async #getCacheIndexedDB(key) {
        try {
            const dbInstance = await this.#dbPromise;
            return new Promise((resolve) => {
                const tx = dbInstance.transaction('cache_store', 'readonly');
                const store = tx.objectStore('cache_store');
                const req = store.get(key);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            });
        } catch {
            return null;
        }
    }

    async #setCacheIndexedDB(key, data) {
        try {
            const dbInstance = await this.#dbPromise;
            const tx = dbInstance.transaction('cache_store', 'readwrite');
            const store = tx.objectStore('cache_store');
            store.put({ timestamp: Date.now(), data }, key);
        } catch (e) {
            console.warn("Could not save to IndexedDB Cache", e);
        }
    }
}

const RealtimeSyncEngine = new RealtimeSyncEngineService();
window.RealtimeSyncEngine = RealtimeSyncEngine;

document.addEventListener('DOMContentLoaded', () => {
    window.RealtimeSyncEngine.init();
});
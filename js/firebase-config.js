// js/firebase-config.js
// 🚀 Enterprise Firebase Configuration: Zero-Trust Security, Resilient Auth & Observability (V2.0)

const firebaseConfig = {
    apiKey: "AIzaSyA2cDFLnQJv-j9-1M8NVA1ajeTqJRmZugk",
    authDomain: "dialysis-cloud-os-72adb.firebaseapp.com",
    databaseURL: "https://dialysis-cloud-os-72adb-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "dialysis-cloud-os-72adb",
    storageBucket: "dialysis-cloud-os-72adb.firebasestorage.app",
    messagingSenderId: "639213311268",
    appId: "1:639213311268:web:05a6b4c59830f767970fb1",
    measurementId: "G-FN9JM8MC4B"
};

class FirebaseEnterpriseCore {
    constructor() {
        this.db = null;
        this.auth = null;
        
        // ผูก Context เพื่อป้องกัน Context Loss ใน Event Listeners
        this.init = this.init.bind(this);
    }

    /**
     * Bootstraps Firebase Services Safely
     */
    async init() {
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }

            this.db = firebase.database();
            this.auth = firebase.auth();

            // 🌐 Expose to Global Object (ตาม Architecture ของโปรเจกต์)
            window.db = this.db;
            window.auth = this.auth;

            // 📡 เปิดใช้งาน Network Topology Monitor
            this.#monitorNetworkResilience();

            // 🔐 เปิดใช้งานระบบ Auth ขั้นสูง
            await this.#initializeSecureAuth();

            console.log("%c🚀 [Firebase Core] System Online & Architecture Secured.", "color: #10b981; font-weight: bold; font-size: 12px;");
        } catch (error) {
            console.error("🚨 [Firebase Core] Initialization Fatal Error:", error);
        }
    }

    /**
     * จัดการระบบ Session & Anonymous Fallback อย่างรัดกุม
     */
    async #initializeSecureAuth() {
        try {
            // 1. บังคับ Persistence ให้ติดอยู่กับ Local Storage เสมอ
            await this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
            
            // 2. ดักฟัง State การเปลี่ยนแปลง
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    const authType = user.isAnonymous ? "🟡 GUEST (Anonymous)" : "🟢 STAFF (Authenticated)";
                    console.log(`[Firebase Auth] Session Restored | Mode: ${authType} | UID: ${user.uid}`);
                } else {
                    console.warn("⚠️ [Firebase Auth] No Session Found. Initiating Anonymous Fallback...");
                    
                    // 🚨 SECURITY CRITICAL: คลินิกควรจำกัด Rule ใน Realtime DB ให้ Account นี้อ่านได้เฉพาะ System Config
                    try {
                        const userCredential = await this.auth.signInAnonymously();
                        console.log(`[Firebase Auth] Guest Access Granted | UID: ${userCredential.user.uid}`);
                    } catch (signInError) {
                        console.error("🔴 [Firebase Auth] Anonymous Login Failed (Possible Network Issue):", signInError.message);
                    }
                }
            });
        } catch (error) {
            console.error("🔴 [Firebase Persistence] Setup Failed:", error.message);
        }
    }

    /**
     * ดักฟังการเชื่อมต่อของ WebSockets ระหว่าง Client และ Firebase Servers
     */
    #monitorNetworkResilience() {
        const connectedRef = this.db.ref('.info/connected');
        
        connectedRef.on('value', (snap) => {
            const isOnline = snap.val() === true;
            if (isOnline) {
                console.log("%c🌐 [Network] Realtime Database WebSockets Connected.", "color: #3b82f6; font-weight: bold;");
                // สามารถใส่ Trigger ให้หน้าจอซิงค์ข้อมูลที่ค้างอยู่ตรงนี้ได้
            } else {
                console.warn("📡 [Network] Realtime Database Disconnected. Waiting for reconnection...");
                // สามารถ Trigger UI แจ้งพยาบาลว่ากำลัง Offline
            }
        });
    }
}

// 🌐 Auto-Initialize & Expose Core Engine
window.FirebaseCore = new FirebaseEnterpriseCore();
document.addEventListener("DOMContentLoaded", () => { window.FirebaseCore.init(); });
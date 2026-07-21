# local_agent.py
# 🚀 Enterprise Thai Smartcard Agent: Flawless UI & APDU Fault Tolerance Edition

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import base64
import logging
import asyncio
import os
import sys
import threading
import time
import subprocess
import random
import ctypes
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any

# กระตุ้นให้ Windows CMD รองรับสี ANSI
os.system('')

# =========================================================
# 🎨 UI & STYLING CONSTANTS
# =========================================================
class CLIColor:
    MAGENTA = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    WHITE = '\033[97m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

logging.basicConfig(level=logging.WARNING, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# =========================================================
# 🧠 STATE MANAGEMENT (SINGLETON & EVENT QUEUE)
# =========================================================
class AgentState:
    def __init__(self):
        self.start_time: float = time.time()
        self.app_version: str = "6.0.0 (INSTALLER EDITION)"
        self.is_shutdown_intentional: bool = False
        self.shutdown_event: threading.Event = threading.Event()
        self.shutdown_event.set()
        self.smartcard_available: bool = False
        self.is_restarted: bool = "--restarted" in sys.argv
        self.auto_open_web: bool = True
        
        self.logs = [
            "Kernel Boot Successful",
            "System Mutex Established",
            "Uvicorn Threads Running"
        ]
        
        try:
            from smartcard.System import readers
            self.smartcard_available = True
            self.add_log("PySCard Engine Mounted")
        except ImportError:
            self.smartcard_available = False
            self.add_log("WARN: PySCard Missing")

    @property
    def uptime(self) -> str:
        elapsed = int(time.time() - self.start_time)
        return f"{elapsed // 3600:02d}H {(elapsed % 3600) // 60:02d}M {elapsed % 60:02d}S"

    def add_log(self, msg: str):
        ts = time.strftime("%H:%M:%S")
        self.logs.append(f"[{ts}] {msg}")
        if len(self.logs) > 3:
            self.logs.pop(0)

STATE = AgentState()

# =========================================================
# 🛡️ SYSTEM PROTECTOR
# =========================================================
class SystemProtector:
    MUTEX_NAME = "Global\\DIALYSIS_PRO_AGENT_MUTEX"

    @staticmethod
    def enforce_single_instance():
        mutex = ctypes.windll.kernel32.CreateMutexW(None, False, SystemProtector.MUTEX_NAME)
        if ctypes.windll.kernel32.GetLastError() == 183: 
            return None, False 
        return mutex, True 

    @staticmethod
    def apply_kernel_security():
        if os.name != 'nt': return
        os.system('title DIALYSIS PRO - ENTERPRISE AGENT')
        try:
            handle = ctypes.windll.kernel32.GetStdHandle(-10)
            mode = ctypes.c_uint32()
            ctypes.windll.kernel32.GetConsoleMode(handle, ctypes.byref(mode))
            mode.value &= ~0x0040
            ctypes.windll.kernel32.SetConsoleMode(handle, mode)
            
            hwnd = ctypes.windll.kernel32.GetConsoleWindow()
            if hwnd:
                hmenu = ctypes.windll.user32.GetSystemMenu(hwnd, False)
                if hmenu: ctypes.windll.user32.DeleteMenu(hmenu, 0xF060, 0)
        except Exception: pass

        @ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_uint)
        def ctrl_handler(ctrl_type):
            if ctrl_type == 2 and not STATE.is_shutdown_intentional:
                print(f"\n\a{CLIColor.RED}╔══════════════════════════════════════════════════════════╗{CLIColor.RESET}")
                print(f"{CLIColor.RED}║ 🚨 [SECURITY BREACH]: ปฏิเสธการปิด! สร้างร่างโคลน...     ║{CLIColor.RESET}")
                print(f"{CLIColor.RED}╚══════════════════════════════════════════════════════════╝{CLIColor.RESET}")
                if getattr(sys, 'frozen', False): subprocess.Popen([sys.executable, "--restarted"])
                else: subprocess.Popen([sys.executable, sys.argv[0], "--restarted"], creationflags=subprocess.CREATE_NEW_CONSOLE)
                return False
            return False

        SystemProtector._ctrl_handler = ctrl_handler
        ctypes.windll.kernel32.SetConsoleCtrlHandler(SystemProtector._ctrl_handler, True)

# =========================================================
# 🪪 SMARTCARD ENGINE (RESILIENT I/O EDITION)
# =========================================================
class ThaiSmartCardReader:
    def __init__(self):
        self.SELECT_APPLET = [0x00, 0xA4, 0x04, 0x00, 0x08, 0xA0, 0x00, 0x00, 0x00, 0x54, 0x48, 0x00, 0x01]
        self.CMD_CID       = [0x80, 0xb0, 0x00, 0x04, 0x02, 0x00, 0x0d]
        self.CMD_TH_NAME   = [0x80, 0xb0, 0x00, 0x11, 0x02, 0x00, 0x64]
        self.CMD_EN_NAME   = [0x80, 0xb0, 0x00, 0x75, 0x02, 0x00, 0x64] 
        self.CMD_DOB       = [0x80, 0xb0, 0x00, 0xD9, 0x02, 0x00, 0x08]
        self.CMD_GENDER    = [0x80, 0xb0, 0x00, 0xE1, 0x02, 0x00, 0x01]
        self.CMD_ADDR      = [0x80, 0xb0, 0x15, 0x79, 0x02, 0x00, 0x64]
        self.CMD_ISSUE     = [0x80, 0xb0, 0x01, 0x67, 0x02, 0x00, 0x08]
        self.CMD_EXPIRE    = [0x80, 0xb0, 0x01, 0x6F, 0x02, 0x00, 0x08]
        self.CMD_ISSUER    = [0x80, 0xb0, 0x00, 0xF6, 0x02, 0x00, 0x64]
        self.CMD_RELIGION  = [0x80, 0xb0, 0x01, 0x67, 0x02, 0x00, 0x12] 

    def _transmit_with_retry(self, conn, cmd, retries=3, delay=0.05):
        for attempt in range(retries):
            try:
                res, sw1, sw2 = conn.transmit(cmd)
                if sw1 == 0x61: 
                    res, sw1, sw2 = conn.transmit([0x00, 0xC0, 0x00, 0x00, sw2])
                if sw1 == 0x90 or sw1 == 0x61:
                    return bytes(res)
            except Exception as e:
                time.sleep(delay) 
        return None

    def read_card(self, read_photo: bool = True) -> Dict[str, Any]:
        if not STATE.smartcard_available: return {"error": "ไลบรารีระบบอ่านบัตร (pyscard) ยังไม่ถูกติดตั้ง"}
        from smartcard.System import readers
        conn = None
        try:
            rlist = readers()
            if not rlist: return {"error": "❌ ไม่พบเครื่องอ่านบัตร"}
            
            conn = rlist[0].createConnection()
            conn.connect()
            
            res, sw1, sw2 = conn.transmit(self.SELECT_APPLET)
            if sw1 not in [0x90, 0x61]: return {"error": "❌ บัตรประชาชนไม่ตอบสนอง หรือเสียบผิดด้าน"}
            
            sys.stdout.write(f"\r{CLIColor.YELLOW} ⚡ [HARDWARE] กำลังถอดรหัส APDU Payload...{CLIColor.RESET}                    ")
            sys.stdout.flush()

            def get_data_safe(cmd):
                raw_bytes = self._transmit_with_retry(conn, cmd)
                if raw_bytes:
                    return raw_bytes.decode('tis-620', errors='ignore').strip().replace('\x00', '').replace('#', ' ')
                return ""

            cid = get_data_safe(self.CMD_CID).replace(' ', '')
            th_parts = get_data_safe(self.CMD_TH_NAME).split()
            en_parts = get_data_safe(self.CMD_EN_NAME).split()
            dob_raw = get_data_safe(self.CMD_DOB).replace(' ', '')
            gender_raw = get_data_safe(self.CMD_GENDER)
            gender_str = "ชาย" if gender_raw == "1" else "หญิง" if gender_raw == "2" else "ไม่ระบุ"
            
            rel_raw = get_data_safe(self.CMD_RELIGION)
            rel_str = "ไม่ระบุ" 
            if "พุทธ" in rel_raw: rel_str = "พุทธ"
            elif "อิสลาม" in rel_raw: rel_str = "อิสลาม"
            elif "คริสต์" in rel_raw: rel_str = "คริสต์"

            photo_b64 = ""
            if read_photo:
                sys.stdout.write(f"\r{CLIColor.CYAN} 📸 [HARDWARE] กำลังดึงรูปภาพจากชิป (Downloading Photo)...{CLIColor.RESET}       ")
                sys.stdout.flush()
                photo_data = bytearray()
                
                for i in range(21):
                    offset = 379 + (i * 254)
                    cmd_photo = [0x80, 0xb0, (offset >> 8) & 0xFF, offset & 0xFF, 0x02, 0x00, 0xFE]
                    res_bytes = self._transmit_with_retry(conn, cmd_photo, retries=4, delay=0.1) 
                    if res_bytes:
                        photo_data.extend(res_bytes)
                    else:
                        break 
                        
                if photo_data: 
                    photo_b64 = base64.b64encode(bytes(photo_data)).decode('utf-8')
            
            STATE.add_log(f"Card Sync OK: {cid[:4]}XXXXXXX")
            BootloaderUI.draw_main_dashboard(synced=True)
            print(f"{CLIColor.GREEN} >_ SUCCESS: อ่านข้อมูลบัตรสมบูรณ์ (CID: {cid[:4]}XXXXXXX){CLIColor.RESET}")
            
            return {
                "success": True, "cid": cid, "gender": gender_str,
                "title_th": th_parts[0] if th_parts else "", "fname_th": th_parts[1] if len(th_parts) > 1 else "", "lname_th": th_parts[-1] if len(th_parts) > 2 else "",
                "fname_en": en_parts[1] if len(en_parts) > 1 else "", "lname_en": en_parts[-1] if len(en_parts) > 2 else "",
                "dob": dob_raw, "dob_th": f"{dob_raw[6:8]}/{dob_raw[4:6]}/{dob_raw[0:4]}" if len(dob_raw) >= 8 else "",
                "address": get_data_safe(self.CMD_ADDR), "issue_date": get_data_safe(self.CMD_ISSUE).replace(' ', ''), 
                "expire_date": get_data_safe(self.CMD_EXPIRE).replace(' ', ''), "issuer": get_data_safe(self.CMD_ISSUER), 
                "religion": rel_str, "photo_base64": photo_b64
            }
        except Exception as e: 
            STATE.add_log(f"Reader Error: {str(e)[:15]}")
            return {"error": f"❌ เครื่องอ่านบัตรขัดข้อง: {str(e)}"}
        finally:
            if conn:
                try: conn.disconnect()
                except Exception: pass

# =========================================================
# 🪟 WINDOW ORCHESTRATOR
# =========================================================
class WindowOrchestrator:
    @staticmethod
    def get_default_browser():
        if os.name != 'nt': return None
        import winreg
        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\Shell\Associations\UrlAssociations\http\UserChoice") as key:
                prog_id, _ = winreg.QueryValueEx(key, "ProgId")
            with winreg.OpenKey(winreg.HKEY_CLASSES_ROOT, rf"{prog_id}\shell\open\command") as key:
                cmd, _ = winreg.QueryValueEx(key, "")
            if cmd.startswith('"'): return cmd.split('"')[1]
            return cmd.split()[0]
        except Exception: return None

    @staticmethod
    def launch_ui(html_path: str):
        if not STATE.auto_open_web or STATE.is_restarted: return
        try:
            app_data = os.getenv('LOCALAPPDATA', 'C:\\')
            profile_dir = os.path.join(app_data, "DialysisPro_Agent_Profile")
            browser_path = WindowOrchestrator.get_default_browser()
            
            if not browser_path:
                import winreg
                try:
                    with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe") as key:
                        browser_path, _ = winreg.QueryValueEx(key, "")
                except Exception: browser_path = "chrome.exe"
            
            is_chromium = any(b in browser_path.lower() for b in ['chrome', 'msedge', 'brave', 'opera', 'vivaldi', 'yandex'])
            file_uri = f"file:///{html_path.replace(os.sep, '/')}"

            if is_chromium:
                flags = [browser_path, f'--app={file_uri}', '--start-maximized', '--new-window', f'--user-data-dir={profile_dir}']
                startup_info = subprocess.STARTUPINFO()
                startup_info.dwFlags |= subprocess.STARTF_USESHOWWINDOW
                startup_info.wShowWindow = 3 
                subprocess.Popen(flags, creationflags=0x00000008, startupinfo=startup_info)
            else:
                import webbrowser
                webbrowser.open(file_uri)
                
        except Exception as e:
            logger.error(f"UI Launch Error: {e}")

# =========================================================
# 🌐 FASTAPI SERVER ROUTING
# =========================================================
app = FastAPI(title="Dialysis Pro Smartcard Agent")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
thread_pool = ThreadPoolExecutor(max_workers=4)

@app.get("/health")
def health_check(v: str = None):
    if v and v != STATE.app_version:
        STATE.app_version = v
        STATE.add_log(f"UI Sync OK v{v[:5]}")
        BootloaderUI.draw_main_dashboard(synced=True)
    if not STATE.shutdown_event.is_set():
        STATE.shutdown_event.set() 
        BootloaderUI.draw_main_dashboard(synced=True)
    return {"status": "online", "version": STATE.app_version, "smartcard_lib": STATE.smartcard_available}

@app.get("/read-card")
async def read_card_endpoint():
    try:
        reader = ThaiSmartCardReader()
        loop = asyncio.get_running_loop()
        data = await loop.run_in_executor(thread_pool, reader.read_card, True)
        if "error" in data: return JSONResponse(status_code=400, content={"status": "error", "error": data["error"]})
        return JSONResponse(status_code=200, content={"status": "success", "data": data})
    except Exception: return JSONResponse(status_code=500, content={"status": "error", "error": "ระบบขัดข้องภายใน"})

@app.post("/shutdown")
async def shutdown_server(request: Request):
    STATE.shutdown_event.clear() 
    def wait_and_kill():
        is_cancelled = STATE.shutdown_event.wait(3.0)
        if not is_cancelled:
            STATE.is_shutdown_intentional = True
            if global_mutex: ctypes.windll.kernel32.ReleaseMutex(global_mutex)
            os._exit(0) 
    threading.Thread(target=wait_and_kill, daemon=True).start()
    return {"status": "waiting_for_reconnect"}

# =========================================================
# 🎬 BOOTLOADER UI
# =========================================================
class BootloaderUI:
    @staticmethod
    def draw_hacker_sequence():
        print(f"{CLIColor.GREEN}")
        for _ in range(12):
            hex_line = " ".join([f"{random.randint(0, 255):02X}" for _ in range(16)])
            print(f"  0x{random.randint(0x10000, 0xFFFFF):05X}   {hex_line}   [{''.join([chr(random.randint(33, 126)) for _ in range(8)])}]")
            time.sleep(0.015)
        print(f"{CLIColor.RESET}")

    @staticmethod
    def format_header(left_title, right_title):
        l_pad = " " * (38 - len(left_title))
        r_pad = " " * (41 - len(right_title))
        l_str = f"  {CLIColor.BOLD}{left_title}{CLIColor.RESET}{l_pad}  "
        r_str = f"  {CLIColor.BOLD}{right_title}{CLIColor.RESET}{r_pad}  "
        return f"{CLIColor.BLUE}║{CLIColor.RESET}{l_str}{CLIColor.BLUE}║{CLIColor.RESET}{r_str}{CLIColor.BLUE}║{CLIColor.RESET}"

    @staticmethod
    def format_divider():
        l_str = f"  {'-' * 38}  "
        r_str = f"  {'-' * 41}  "
        return f"{CLIColor.BLUE}║{CLIColor.RESET}{CLIColor.WHITE}{l_str}{CLIColor.BLUE}║{CLIColor.RESET}{CLIColor.WHITE}{r_str}{CLIColor.BLUE}║{CLIColor.RESET}"

    @staticmethod
    def format_row(left_lbl, left_val, right_lbl, right_val, left_color="", right_color=""):
        l_val_str = str(left_val)[:24]
        r_val_str = str(right_val)[:27]
        l_display = f"  {left_lbl:<11} : {left_color}{l_val_str:<24}{CLIColor.RESET}  "
        r_display = f"  {right_lbl:<11} : {right_color}{r_val_str:<27}{CLIColor.RESET}  "
        return f"{CLIColor.BLUE}║{CLIColor.RESET}{l_display}{CLIColor.BLUE}║{CLIColor.RESET}{r_display}{CLIColor.BLUE}║{CLIColor.RESET}"

    @staticmethod
    def format_log_row(left_lbl, left_val, log_msg, left_color=""):
        l_val_str = str(left_val)[:24]
        l_display = f"  {left_lbl:<11} : {left_color}{l_val_str:<24}{CLIColor.RESET}  "
        log_str = str(log_msg)[:39]
        r_display = f"  > {log_str:<39}  "
        return f"{CLIColor.BLUE}║{CLIColor.RESET}{l_display}{CLIColor.BLUE}║{CLIColor.RESET}{r_display}{CLIColor.BLUE}║{CLIColor.RESET}"

    @staticmethod
    def draw_main_dashboard(synced=False):
        os.system('cls' if os.name == 'nt' else 'clear') 
        
        hw_val = "[ ONLINE ] READY" if STATE.smartcard_available else "MISSING (PySCard)"
        hw_col = CLIColor.GREEN if STATE.smartcard_available else CLIColor.RED
        reader_val = "Generic Smartcard 0" if STATE.smartcard_available else "Driver missing"
        
        if synced:
            net_val, net_col = "[ CONNECTED ] SECURE", CLIColor.GREEN
            sync_val, sync_col = "[ ACTIVE ] REAL-TIME", CLIColor.GREEN
            ver_val, ver_col = STATE.app_version[:24], CLIColor.MAGENTA
        else:
            net_val, net_col = "WAITING FOR HOST...", CLIColor.YELLOW
            sync_val, sync_col = "PENDING (Standby)", CLIColor.YELLOW
            ver_val, ver_col = "WAITING FOR DATA...", CLIColor.YELLOW

        print(f"{CLIColor.CYAN}{CLIColor.BOLD}")
        print(f"  ██████╗ ██╗ █████╗ ██╗  ██╗   ██╗███████╗██╗███████╗    ██████╗ ██████╗  ██████╗ ")
        print(f"  ██╔══██╗██║██╔══██╗██║  ╚██╗ ██╔╝██╔════╝██║██╔════╝    ██╔══██╗██╔══██╗██╔═══██╗")
        print(f"{CLIColor.WHITE}  ██║  ██║██║███████║██║   ╚████╔╝ ███████╗██║███████╗    ██████╔╝██████╔╝██║   ██║{CLIColor.CYAN}")
        print(f"{CLIColor.WHITE}  ██║  ██║██║██╔══██║██║    ╚██╔╝  ╚════██║██║╚════██║    ██╔═══╝ ██╔══██╗██║   ██║{CLIColor.CYAN}")
        print(f"  ██████╔╝██║██║  ██║███████╗██║   ███████║██║███████║    ██║     ██║  ██║╚██████╔╝")
        print(f"  ╚═════╝ ╚═╝╚═╝  ╚═╝╚══════╝╚═╝   ╚══════╝╚═╝╚══════╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝ {CLIColor.RESET}")
        print(f"{CLIColor.BOLD}                     [ CLOUD EMR & SMARTCARD GATEWAY v6.0.0 ]{CLIColor.RESET}\n")

        print(f"{CLIColor.BLUE}╠══════════════════════════════════════════╦═════════════════════════════════════════════╣{CLIColor.RESET}")
        print(BootloaderUI.format_header("█ SYSTEM TELEMETRY", "█ NETWORK & SECURITY"))
        print(BootloaderUI.format_divider())
        print(BootloaderUI.format_row("CPU THREADS", "4 Active Worker(s)", "ENDPOINT", "http://127.0.0.1:8000"))
        print(BootloaderUI.format_row("OS KERNEL", "Windows NT (Enterprise)", "STATUS", net_val, "", net_col))
        print(BootloaderUI.format_row("UPTIME", STATE.uptime, "SYNC ROLE", sync_val, CLIColor.CYAN, sync_col))
        print(BootloaderUI.format_row("VERSION", ver_val, "CORS", "STRICT / ENFORCED", ver_col, ""))

        print(f"{CLIColor.BLUE}╠══════════════════════════════════════════╬═════════════════════════════════════════════╣{CLIColor.RESET}")
        print(BootloaderUI.format_header("█ HARDWARE DIAGNOSTICS", "█ EVENT QUEUE & LOGS"))
        print(BootloaderUI.format_divider())

        log1 = STATE.logs[0] if len(STATE.logs) > 0 else ""
        log2 = STATE.logs[1] if len(STATE.logs) > 1 else ""
        log3 = STATE.logs[2] if len(STATE.logs) > 2 else ""

        print(BootloaderUI.format_log_row("MODULE", "PySCard Smartcard API", log1, CLIColor.CYAN))
        print(BootloaderUI.format_log_row("STATUS", hw_val, log2, hw_col))
        print(BootloaderUI.format_log_row("READER", reader_val, log3, CLIColor.CYAN))
        print(f"{CLIColor.BLUE}╚══════════════════════════════════════════╩═════════════════════════════════════════════╝{CLIColor.RESET}")

        print(f"\n{CLIColor.YELLOW}  ⚠️  DO NOT CLOSE THIS WINDOW (Minimize to Taskbar or Close via Web){CLIColor.RESET}")
        print(f"{CLIColor.CYAN}{CLIColor.BOLD}\n >_ LIVE TERMINAL FEED:{CLIColor.RESET}\n")

    @staticmethod
    def run():
        if not STATE.is_restarted:
            os.system('cls' if os.name == 'nt' else 'clear') 
            BootloaderUI.draw_hacker_sequence()
            time.sleep(0.2)
            os.system('cls' if os.name == 'nt' else 'clear') 
            
            print(f"{CLIColor.CYAN}{CLIColor.BOLD}\n  [ DIALYSIS PRO KERNEL BOOTSTRAP ]\n{CLIColor.RESET}")
            for name, dll in [("Initializing Memory", "kernel32"), ("Mounting Cryptography", "bcrypt"), ("Loading Interface", "winscard"), ("Starting Server", "uvicorn")]:
                sys.stdout.write(f"\r  {CLIColor.WHITE}>> {name:<25} {CLIColor.GREEN}[ OK ] {dll}{CLIColor.RESET}   \n")
                time.sleep(0.1)
            time.sleep(0.3)

        SystemProtector.apply_kernel_security()
        BootloaderUI.draw_main_dashboard(synced=False)

# =========================================================
# 🚀 1. THE FIX: ฟังก์ชันดึง Path ครอบจักรวาล (PyInstaller Compatible)
# =========================================================
def get_resource_path(relative_path):
    """ ค้นหาไฟล์ Asset ไม่ว่าจะรันแบบ .py ปกติ หรือแพ็คเป็น .exe ผ่าน PyInstaller """
    try:
        # PyInstaller จะสร้างโฟลเดอร์ Temp (MEIPASS) และเก็บไฟล์ไว้ในนั้น
        base_path = sys._MEIPASS
    except Exception:
        # ถ้ารันแบบปกติ (Dev Mode) ให้ใช้ Path ปัจจุบัน
        base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, relative_path)


# =========================================================
# 🚀 THE ENTRY POINT
# =========================================================
if __name__ == "__main__":
    global_mutex, is_primary = SystemProtector.enforce_single_instance()
    
    # 🚨 THE FIX: ใช้ get_resource_path เพื่อรับประกันว่าเจอ index.html แน่นอน 100%
    html_file = get_resource_path("index.html")

    if not is_primary:
        WindowOrchestrator.launch_ui(html_file)
        time.sleep(1) 
        sys.exit(0)

    try:
        BootloaderUI.run()
        WindowOrchestrator.launch_ui(html_file)
        
        time.sleep(0.1)
        uvicorn.run(app, host="127.0.0.1", port=8000, log_level="critical", access_log=False)
        
    except Exception as fatal_error:
        print(f"\n{CLIColor.RED}💥 FATAL ERROR: {str(fatal_error)}{CLIColor.RESET}")
        if global_mutex: ctypes.windll.kernel32.ReleaseMutex(global_mutex)
        input(f"{CLIColor.YELLOW}Press ENTER to exit...{CLIColor.RESET}")
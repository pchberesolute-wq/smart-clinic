// js/pages/inventory.js
// 🚀 Enterprise Inventory Module: Total Computed, Dynamic Export Engine & Atomic Writes (v9.8 FULL)

class InventoryPageComponent {
    constructor() {
        this.allItems = [];
        this.savedCategories = []; 
        this.savedUnits = [];       
        this.medItems = []; 
        this.firebaseListeners = [];
        this.searchTimeout = null;
    }

    get html() {
        return `
            <style>
                .table-premium th { color: var(--text-muted); font-weight: 700; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; padding: 14px 10px; border-bottom: 2px solid var(--border-color); }
                .table-premium td { padding: 14px 10px; vertical-align: middle; border-bottom: 1px solid var(--border-color); transition: background 0.2s; }
                
                .btn-action-icon { width: 36px; height: 36px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 10px; transition: all 0.2s ease; border: none; }
                .btn-action-icon i { font-size: 15px; }
                
                .safe-icon { font-family: 'Font Awesome 6 Free', 'FontAwesome', sans-serif !important; font-weight: 900 !important; font-style: normal !important; }

                html[data-bs-theme="dark"] body .table .btn-action-icon.btn-primary,
                body .table .btn-action-icon.btn-primary { 
                    background-color: #3b82f6 !important; border: 1px solid #3b82f6 !important; color: #ffffff !important; 
                    opacity: 1 !important; filter: none !important; box-shadow: 0 4px 6px rgba(0,0,0,0.2) !important;
                }
                html[data-bs-theme="dark"] body .table .btn-action-icon.btn-primary:hover,
                body .table .btn-action-icon.btn-primary:hover { 
                    background-color: #2563eb !important; transform: translateY(-3px) !important; filter: brightness(1.2) !important; 
                }

                html[data-bs-theme="dark"] body .table .btn-action-icon.btn-warning,
                body .table .btn-action-icon.btn-warning { 
                    background-color: #f59e0b !important; border: 1px solid #f59e0b !important; color: #0f172a !important; 
                    opacity: 1 !important; filter: none !important; box-shadow: 0 4px 6px rgba(0,0,0,0.2) !important;
                }
                html[data-bs-theme="dark"] body .table .btn-action-icon.btn-warning:hover,
                body .table .btn-action-icon.btn-warning:hover { 
                    background-color: #d97706 !important; transform: translateY(-3px) !important; filter: brightness(1.2) !important; 
                }

                html[data-bs-theme="dark"] body .table .btn-action-icon.btn-danger,
                body .table .btn-action-icon.btn-danger { 
                    background-color: #ef4444 !important; border: 1px solid #ef4444 !important; color: #ffffff !important; 
                    opacity: 1 !important; filter: none !important; box-shadow: 0 4px 6px rgba(0,0,0,0.2) !important;
                }
                html[data-bs-theme="dark"] body .table .btn-action-icon.btn-danger:hover,
                body .table .btn-action-icon.btn-danger:hover { 
                    background-color: #dc2626 !important; transform: translateY(-3px) !important; filter: brightness(1.2) !important; 
                }
            </style>

            <div class="page-header mb-4 fade-in-up">
                <div>
                    <h2 class="page-title text-primary" style="font-size: 28px;"><i class="fa-solid fa-boxes-stacked me-2"></i> ฐานข้อมูลคลังพัสดุ</h2>
                    <p class="text-muted mt-1 mb-0">จัดการรายการพัสดุ รหัสสินค้า บาร์โค้ด และจัดลำดับการแสดงผลเพื่อรองรับระบบ Smart PO</p>
                </div>
                <div class="d-flex gap-2 mt-3 mt-md-0 flex-wrap justify-content-md-end">
                    <button class="btn btn-dark text-white fw-bold shadow-sm rounded-pill px-3 card-hover-float" onclick="App.pages.inventory.printAllBarcodes()" title="พิมพ์บาร์โค้ดของพัสดุทั้งหมดในระบบ">
                        <i class="fa-solid fa-print me-1 text-warning safe-icon"></i> พิมพ์บาร์โค้ดทั้งหมด
                    </button>
                    
                    <button class="btn btn-outline-secondary fw-bold shadow-sm rounded-pill px-3 card-hover-float" onclick="App.pages.inventory.openOptionsModal()" title="จัดการตัวเลือกหมวดหมู่และหน่วยนับ">
                        <i class="fa-solid fa-tags me-1 safe-icon"></i> จัดการหมวดหมู่/หน่วยนับ
                    </button>
                    
                    <button class="btn btn-outline-primary fw-bold shadow-sm rounded-pill px-4 card-hover-float" onclick="App.switchPage('stock_manage')">
                        <i class="fa-solid fa-truck-ramp-box me-2 safe-icon"></i> ไปหน้าเบิกจ่าย / โอนย้าย
                    </button>

                    <button class="btn btn-premium-primary fw-bold shadow-sm rounded-pill px-4 card-hover-float" onclick="App.pages.inventory.openItemModal()">
                        <i class="fa-solid fa-plus me-2 safe-icon"></i> ลงทะเบียนพัสดุใหม่
                    </button>
                </div>
            </div>

            <div class="row g-4 mb-4 fade-in-up" style="animation-delay: 0.1s;">
                <div class="col-md-4">
                    <div class="modern-panel h-100 p-4 position-relative overflow-hidden shadow-sm" style="border-top: 4px solid var(--primary); border-radius: 20px; background-color: var(--bg-surface); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                        <div style="position: absolute; top: -10px; right: -10px; opacity: 0.04; font-size: 100px; pointer-events: none; color: var(--text-dark);"><i class="fa-solid fa-cubes"></i></div>
                        <div class="d-flex align-items-center position-relative z-1">
                            <div class="text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 60px; height: 60px; font-size: 24px; background: var(--bg-body); border: 1px solid var(--border-color);"><i class="fa-solid fa-cubes"></i></div>
                            <div>
                                <h2 class="fw-bold mb-0" id="stat-total" style="color: var(--text-dark);"><i class="fas fa-spinner fa-spin fs-4"></i></h2>
                                <p class="text-muted fw-bold mb-0 small text-uppercase">รายการพัสดุทั้งหมด</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="modern-panel h-100 p-4 position-relative overflow-hidden shadow-sm" style="border-top: 4px solid var(--warning); border-radius: 20px; background-color: var(--bg-surface); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                        <div style="position: absolute; top: -10px; right: -10px; opacity: 0.04; font-size: 100px; pointer-events: none; color: var(--warning);"><i class="fa-solid fa-warehouse"></i></div>
                        <div class="d-flex align-items-center position-relative z-1">
                            <div class="text-warning rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 60px; height: 60px; font-size: 24px; background: var(--bg-body); border: 1px solid var(--border-color);"><i class="fa-solid fa-warehouse"></i></div>
                            <div>
                                <h2 class="fw-bold text-warning mb-0" id="stat-low-main"><i class="fas fa-spinner fa-spin fs-4"></i></h2>
                                <p class="text-warning fw-bold mb-0 small text-uppercase">เตือน: สต๊อกใหญ่ใกล้หมด</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="modern-panel h-100 p-4 position-relative overflow-hidden shadow-sm" style="border-top: 4px solid var(--danger); border-radius: 20px; background-color: var(--bg-surface); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                        <div style="position: absolute; top: -10px; right: -10px; opacity: 0.04; font-size: 100px; pointer-events: none; color: var(--danger);"><i class="fa-solid fa-cart-flatbed"></i></div>
                        <div class="d-flex align-items-center position-relative z-1">
                            <div class="text-danger rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 60px; height: 60px; font-size: 24px; background: var(--bg-body); border: 1px solid var(--border-color);"><i class="fa-solid fa-cart-flatbed"></i></div>
                            <div>
                                <h2 class="fw-bold text-danger mb-0" id="stat-low-sub"><i class="fas fa-spinner fa-spin fs-4"></i></h2>
                                <p class="text-danger fw-bold mb-0 small text-uppercase">เตือน: สต๊อกย่อยใกล้หมด</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modern-panel shadow-sm p-4 position-relative overflow-hidden fade-in-up" style="border-radius: 20px; background-color: var(--bg-surface); border: 1px solid var(--border-color); animation-delay: 0.2s;">
                <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 250px; pointer-events: none; color: var(--text-dark);"><i class="fa-solid fa-boxes-stacked"></i></div>
                
                <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 position-relative z-1">
                    <h5 class="fw-bold mb-0" style="color: var(--text-dark);"><i class="fa-solid fa-box-open text-primary me-2"></i> รายการพัสดุคงเหลือในระบบ</h5>
                    
                    <div class="d-flex gap-2 align-items-center flex-wrap">
                        <div class="search-box-modern shadow-sm" style="width: 300px; max-width: 100%; border-radius: 12px; background-color: var(--bg-body); border: 1px solid var(--border-color); padding: 10px 15px; display: flex; align-items: center;">
                            <i class="fa-solid fa-search text-primary safe-icon"></i>
                            <input type="text" id="inv-search" class="fw-bold border-0 bg-transparent ms-2 w-100" style="outline:none; color: var(--text-dark);" placeholder="ค้นหาชื่อ, รหัสสินค้า, บาร์โค้ด...">
                        </div>
                        
                        <!-- 🚨 THE FIX 2: ชุดปุ่ม Export (Print / PDF / Excel) -->
                        <div class="btn-group shadow-sm ms-md-2" role="group">
                            <button class="btn fw-bold px-3 py-2" onclick="App.pages.inventory.printTable()" style="background-color: var(--bg-body); color: var(--text-dark); border: 1px solid var(--border-color);" title="พิมพ์ตาราง">
                                <i class="fa-solid fa-print text-primary"></i> พิมพ์
                            </button>
                            <button class="btn btn-danger fw-bold px-3 py-2" onclick="App.pages.inventory.exportPDF()" title="ดาวน์โหลดเป็น PDF">
                                <i class="fa-solid fa-file-pdf"></i> PDF
                            </button>
                            <button class="btn btn-success fw-bold px-3 py-2" onclick="App.pages.inventory.exportExcel()" title="ดาวน์โหลดเป็น Excel">
                                <i class="fa-solid fa-file-excel"></i> Excel
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="table-responsive rounded-3 border position-relative z-1 shadow-sm" style="border-color: var(--border-color) !important;">
                    <table class="table table-premium w-100 mb-0" id="inv-main-table">
                        <thead style="background-color: var(--bg-body);">
                            <tr>
                                <th class="text-center text-primary" style="width: 5%;">ลำดับ</th>
                                <th class="text-center" style="width: 12%;"><i class="fa-solid fa-hashtag me-1 safe-icon"></i> รหัสสินค้า</th>
                                <th style="width: 12%;"><i class="fa-solid fa-barcode me-1 safe-icon"></i> บาร์โค้ด</th>
                                <th style="width: 22%;"><i class="fa-solid fa-box me-1 safe-icon"></i> ชื่อรายการพัสดุ</th>
                                <th class="text-center text-primary" style="width: 9%;">ตั้งต้นเบิก<br><small>(/สัปดาห์)</small></th>
                                <th class="text-center text-primary" style="width: 8%; border-radius: 8px 0 0 0;">📦 ใหญ่</th>
                                <th class="text-center text-info" style="width: 8%;">🛒 เล็ก</th>
                                <!-- 🚨 THE FIX 1: เพิ่มคอลัมน์รวมสุทธิ -->
                                <th class="text-center text-success" style="width: 8%; border-radius: 0 8px 0 0;"><i class="fa-solid fa-equals me-1"></i> รวมสุทธิ</th>
                                <th class="text-center" style="width: 6%;">หน่วย</th>
                                <th class="text-center d-print-none" style="width: 10%;"><i class="fa-solid fa-gears me-1 safe-icon"></i> จัดการ</th>
                            </tr>
                        </thead>
                        <tbody id="inv-table-body">
                            <tr><td colspan="10" class="text-center py-5 text-muted"><i class="fas fa-spinner fa-spin fa-2x mb-3 text-primary"></i><br>กำลังดึงข้อมูลคลังพัสดุ...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    init() {
        if (typeof db === 'undefined') return;

        this.#bindEvents();
        this.#fetchMasterOptions();
        this.#fetchMedsList(); 
        this.#fetchInventoryItems();
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        console.log("🧹 [Inventory] Cleaned up listeners.");
    }

    #bindEvents() {
        const searchInput = document.getElementById('inv-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    const term = e.target.value.toLowerCase().trim();
                    const filtered = this.allItems.filter(i => 
                        (i.name || "").toLowerCase().includes(term) || 
                        (i.barcode || "").toLowerCase().includes(term) || 
                        (i.item_code || "").toLowerCase().includes(term) || 
                        (i.category || "").toLowerCase().includes(term)
                    );
                    this.renderTable(filtered);
                }, 300);
            });
        }
    }

    #fetchMasterOptions() {
        const cbOptions = db.ref('inventory_database_v2/options').on('value', snap => {
            const data = snap.val();
            if(data) {
                this.savedCategories = data.categories || [];
                this.savedUnits = data.units || [];
            } else {
                this.savedCategories = ["น้ำยาฟอกไต", "เวชภัณฑ์ฟอกไต", "เข็มและไซริงค์", "ยา"];
                this.savedUnits = ["แกลลอน", "กล่อง", "ชิ้น", "ขวด", "แพ็ค"];
                db.ref('inventory_database_v2/options').set({categories: this.savedCategories, units: this.savedUnits});
            }
            if(document.getElementById('swal-cat-container') && window.renderInvOptions) window.renderInvOptions();
        });
        this.firebaseListeners.push({ path: 'inventory_database_v2/options', callback: cbOptions });
    }

    #fetchMedsList() {
        const cbMeds = db.ref('clinic_meds_list_v2').on('value', snap => {
            const data = snap.val();
            this.medItems = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
            if(this.allItems.length > 0) {
                this.renderTable(this.allItems);
            }
        });
        this.firebaseListeners.push({ path: 'clinic_meds_list_v2', callback: cbMeds });
    }

    #fetchInventoryItems() {
        const cbItems = db.ref('inventory_database_v2/items').on('value', snap => {
            const data = snap.val();
            let rawItems = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => ({ firebaseKey: k, ...data[k] }))) : [];
            this.allItems = rawItems.filter(item => item !== null);
            
            this.allItems.sort((a, b) => {
                let orderA = a.order !== undefined && a.order !== null && a.order !== "" ? Number(a.order) : 999;
                let orderB = b.order !== undefined && b.order !== null && b.order !== "" ? Number(b.order) : 999;
                return orderA - orderB;
            });
            
            if(!document.getElementById('inv-table-body')) return;
            this.updateStats();

            const searchBox = document.getElementById('inv-search');
            if (searchBox && searchBox.value.trim() !== "") {
                searchBox.dispatchEvent(new Event('input')); 
            } else { 
                this.renderTable(this.allItems); 
            }
        });
        this.firebaseListeners.push({ path: 'inventory_database_v2/items', callback: cbItems });
    }

    updateStats() {
        let total = this.allItems.length;
        let lowMain = 0; let lowSub = 0;
        this.allItems.forEach(i => {
            let qMain = i.qty_main !== undefined ? Number(i.qty_main) : (Number(i.qty) || 0);
            let qSub = Number(i.qty_sub) || 0;
            let mMain = Number(i.min_main) || 0;
            let mSub = Number(i.min_sub) || 0;
            if (qMain <= mMain) lowMain++;
            if (qSub <= mSub) lowSub++;
        });
        if (document.getElementById('stat-total')) document.getElementById('stat-total').innerText = total;
        if (document.getElementById('stat-low-main')) document.getElementById('stat-low-main').innerText = lowMain;
        if (document.getElementById('stat-low-sub')) document.getElementById('stat-low-sub').innerText = lowSub;
    }

    renderTable(itemsList) {
        const tbody = document.getElementById('inv-table-body');
        if (!tbody) return;
        
        if (itemsList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" class="text-center py-5 text-muted"><i class="fa-solid fa-box-open fa-3x mb-3" style="opacity:0.3;"></i><br>ไม่พบรายการพัสดุ</td></tr>`;
            return;
        }

        let html = "";
        itemsList.forEach(i => {
            let qMain = i.qty_main !== undefined ? Number(i.qty_main) : (Number(i.qty) || 0);
            let qSub = Number(i.qty_sub) || 0;
            let mMain = Number(i.min_main) || 0;
            let mSub = Number(i.min_sub) || 0;
            let bReq = Number(i.base_req) || 0; 
            let orderVal = (i.order !== undefined && i.order !== null && i.order !== "" && i.order !== 999) ? i.order : '-';
            
            // 🚨 THE FIX 1: คำนวณยอดรวมสุทธิ
            let qTotal = qMain + qSub;
            let mTotal = mMain + mSub;

            let mainHtml = `<span class="fw-bold" style="font-size: 15px;">${qMain}</span>`;
            if (qMain <= 0) mainHtml = `<span class="badge bg-danger px-2 py-1 shadow-sm rounded-pill">หมดสต๊อก (${qMain})</span>`;
            else if (qMain <= mMain) mainHtml = `<span class="badge bg-warning text-dark px-2 py-1 shadow-sm rounded-pill">ใกล้หมด (${qMain})</span>`;

            let subHtml = `<span class="fw-bold" style="font-size: 15px;">${qSub}</span>`;
            if (qSub <= 0) subHtml = `<span class="badge bg-danger px-2 py-1 shadow-sm rounded-pill">หมดสต๊อก (${qSub})</span>`;
            else if (qSub <= mSub) subHtml = `<span class="badge bg-warning text-dark px-2 py-1 shadow-sm rounded-pill">ใกล้หมด (${qSub})</span>`;

            // 🚨 THE FIX 1: การแสดงผลยอดรวมสุทธิ (Total Balance Badge)
            let totalHtml = `<span class="fw-bold fs-5 text-success">${qTotal}</span>`;
            if (qTotal <= 0) totalHtml = `<span class="badge bg-danger px-3 py-2 shadow-sm rounded-pill" style="font-size:13px;">หมดเกลี้ยง (0)</span>`;
            else if (qTotal <= mTotal) totalHtml = `<span class="badge bg-warning text-dark px-3 py-2 shadow-sm rounded-pill" style="font-size:13px;">ต่ำกว่าเกณฑ์ (${qTotal})</span>`;

            const safeName = this.#escapeHTML(i.name);
            const safeCategory = this.#escapeHTML(i.category || 'ทั่วไป');
            const safeUnit = this.#escapeHTML(i.unit || '-');
            const safeItemCode = this.#escapeHTML(i.item_code || '-');
            const safeBarcode = this.#escapeHTML(i.barcode || '-');

            const isLinkedMed = this.medItems.some(m => (typeof m === 'object' ? m.name : m) === i.name);
            const linkBadge = isLinkedMed 
                ? `<span class="badge ms-2 px-2 shadow-sm" style="background: rgba(139,92,246,0.1); color: #8b5cf6; border: 1px solid rgba(139,92,246,0.2); font-size: 10px;" title="เชื่อมโยงกับฐานข้อมูลยา (ตั้งค่าแพทย์) เรียบร้อย"><i class="fa-solid fa-link"></i> ลิงก์ยา</span>` 
                : '';

            html += `
            <tr class="align-middle card-hover-float" style="cursor: default;">
                <td class="text-center fw-bold text-secondary" style="font-size: 15px;">${orderVal}</td>
                <td class="text-center"><span class="badge border shadow-sm px-2 py-1 text-primary" style="font-family: monospace; font-size:13px; border-radius:6px; background: var(--bg-body); border-color: var(--primary) !important;">${safeItemCode}</span></td>
                <td><span class="badge border shadow-sm px-2 py-1" style="font-family: monospace; font-size:12px; border-radius:6px; background: var(--bg-body); color: var(--text-dark); border-color: var(--border-color) !important;"><i class="fa-solid fa-barcode text-secondary me-1 safe-icon"></i> ${safeBarcode}</span></td>
                
                <td><div class="fw-bold d-flex align-items-center" style="font-size:14.5px; color: var(--text-dark);">${safeName} ${linkBadge}</div><div class="small text-muted mt-1"><i class="fa-solid fa-tag me-1 text-secondary safe-icon"></i> ${safeCategory}</div></td>
                
                <td class="text-center text-primary fw-bold fs-6">${bReq > 0 ? bReq : '-'}</td>
                <td class="text-center border-start" style="border-color: var(--border-color) !important; color: var(--text-dark);">${mainHtml}</td>
                <td class="text-center border-end" style="border-color: var(--border-color) !important; color: var(--text-dark);">${subHtml}</td>
                
                <!-- 🚨 THE FIX 1: Column รวมสุทธิ -->
                <td class="text-center border-end" style="border-color: var(--border-color) !important;">${totalHtml}</td>
                
                <td class="text-center text-muted small fw-bold">${safeUnit}</td>
                <td class="text-center d-print-none">
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-action-icon btn-primary" onclick="App.pages.inventory.printBarcode('${i.id}')" title="พิมพ์สติ๊กเกอร์บาร์โค้ด"><i class="fa-solid fa-barcode safe-icon"></i></button>
                        <button class="btn btn-action-icon btn-warning" onclick="App.pages.inventory.openItemModal('${i.id}')" title="แก้ไข"><i class="fa-solid fa-pen safe-icon"></i></button>
                        <button class="btn btn-action-icon btn-danger" onclick="App.pages.inventory.deleteItem('${i.firebaseKey || i.id}', '${safeName}')" title="ลบพัสดุ"><i class="fa-solid fa-trash safe-icon"></i></button>
                    </div>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    }

    openOptionsModal() { 
        window.renderInvOptions = () => {
            let catHtml = this.savedCategories.length === 0 ? '<div class="text-muted small mt-2">ไม่มีข้อมูล</div>' : this.savedCategories.map((c, i) => `
                <span class="badge m-1 fs-6 border py-2 px-3 shadow-sm rounded-pill text-primary" style="background: var(--bg-body); border-color: var(--primary) !important;">${this.#escapeHTML(c)} <i class="fa-solid fa-times ms-2 text-danger safe-icon" style="cursor:pointer;" onclick="App.pages.inventory.removeOption('cat', ${i})"></i></span>
            `).join('');
            
            let unitHtml = this.savedUnits.length === 0 ? '<div class="text-muted small mt-2">ไม่มีข้อมูล</div>' : this.savedUnits.map((u, i) => `
                <span class="badge m-1 fs-6 border py-2 px-3 shadow-sm rounded-pill text-info" style="background: var(--bg-body); border-color: var(--info) !important;">${this.#escapeHTML(u)} <i class="fa-solid fa-times ms-2 text-danger safe-icon" style="cursor:pointer;" onclick="App.pages.inventory.removeOption('unit', ${i})"></i></span>
            `).join('');

            const catEl = document.getElementById('swal-cat-container');
            const unitEl = document.getElementById('swal-unit-container');
            if(catEl) catEl.innerHTML = catHtml;
            if(unitEl) unitEl.innerHTML = unitHtml;
        };

        Swal.fire({
            title: '<h4 class="fw-bold mb-0" style="color: var(--text-dark);"><i class="fa-solid fa-tags text-primary me-2 safe-icon"></i>ตั้งค่าหมวดหมู่ และ หน่วยนับ</h4>',
            width: 700,
            html: `
                <div class="row text-start mt-3" style="font-family:'Sarabun';">
                    <div class="col-md-6 border-end" style="border-color: var(--border-color) !important;">
                        <h6 class="fw-bold text-primary mb-3"><i class="fa-solid fa-folder-tree me-1 safe-icon"></i> หมวดหมู่พัสดุ</h6>
                        <div class="input-group mb-3 shadow-sm" style="border-radius:8px; overflow:hidden;">
                            <input type="text" id="new-cat-input" class="form-control" placeholder="พิมพ์หมวดหมู่ใหม่..." onkeypress="if(event.key==='Enter') App.pages.inventory.addOption('cat')" style="border: 1px solid var(--border-color); background: var(--bg-body); color: var(--text-dark);">
                            <button class="btn btn-primary fw-bold" onclick="App.pages.inventory.addOption('cat')">เพิ่ม</button>
                        </div>
                        <div id="swal-cat-container" class="p-3 border" style="min-height: 150px; border-radius: 12px; background: var(--bg-surface); border-color: var(--border-color) !important;"></div>
                    </div>
                    <div class="col-md-6">
                        <h6 class="fw-bold text-info mb-3"><i class="fa-solid fa-ruler me-1 safe-icon"></i> หน่วยนับ</h6>
                        <div class="input-group mb-3 shadow-sm" style="border-radius:8px; overflow:hidden;">
                            <input type="text" id="new-unit-input" class="form-control" placeholder="พิมพ์หน่วยนับใหม่..." onkeypress="if(event.key==='Enter') App.pages.inventory.addOption('unit')" style="border: 1px solid var(--border-color); background: var(--bg-body); color: var(--text-dark);">
                            <button class="btn btn-info text-white fw-bold" onclick="App.pages.inventory.addOption('unit')">เพิ่ม</button>
                        </div>
                        <div id="swal-unit-container" class="p-3 border" style="min-height: 150px; border-radius: 12px; background: var(--bg-surface); border-color: var(--border-color) !important;"></div>
                    </div>
                </div>
            `,
            showConfirmButton: false, showCloseButton: true, didOpen: () => { window.renderInvOptions(); }, customClass: { popup: 'premium-alert' }
        });
    }

    addOption(type) {
        let input = document.getElementById(type === 'cat' ? 'new-cat-input' : 'new-unit-input');
        let val = input.value.trim();
        if(!val) return;
        if(type === 'cat') { if(!this.savedCategories.includes(val)) this.savedCategories.push(val); } 
        else { if(!this.savedUnits.includes(val)) this.savedUnits.push(val); }
        input.value = ''; this.#saveOptionsToDB();
    }

    removeOption(type, index) {
        if(type === 'cat') this.savedCategories.splice(index, 1); else this.savedUnits.splice(index, 1);
        this.#saveOptionsToDB();
    }

    #saveOptionsToDB() { 
        db.ref('inventory_database_v2/options').update({ categories: this.savedCategories, units: this.savedUnits }); 
    }

    generateRandomBarcode() { 
        const input = document.getElementById('swal-inv-barcode');
        if(input) input.value = `INV${Math.floor(10000000 + Math.random() * 90000000)}`; 
    }

    openItemModal(itemId = null) {
        let isEdit = !!itemId;
        let item = isEdit ? this.allItems.find(i => i.id === itemId) : {};
        window.InventoryGenBarcode = this.generateRandomBarcode;

        let qMain = item.qty_main !== undefined ? item.qty_main : (item.qty || 0);
        let qSub = item.qty_sub || 0;
        let mMain = item.min_main || 5;
        let mSub = item.min_sub || 2;
        let bReq = item.base_req || 0; 
        let orderVal = (item.order !== undefined && item.order !== null && item.order !== "" && item.order !== 999) ? item.order : ''; 

        let catOptions = this.savedCategories.map(c => `<option value="${this.#escapeHTML(c)}"></option>`).join('');
        let unitOptions = this.savedUnits.map(u => `<option value="${this.#escapeHTML(u)}"></option>`).join('');

        let medOptions = '';
        if (this.medItems && this.medItems.length > 0) {
            this.medItems.forEach(m => {
                let mName = typeof m === 'object' ? m.name : m;
                medOptions += `<option value="${this.#escapeHTML(mName)}">ดึงจากตั้งค่าแพทย์</option>`;
            });
        }

        Swal.fire({
            title: `<h4 class="text-primary fw-bold mb-0"><i class="fa-solid ${isEdit?'fa-user-pen':'fa-user-plus'} me-2"></i>${isEdit ? 'แก้ไขข้อมูลพัสดุ' : 'ลงทะเบียนพัสดุใหม่'}</h4>`,
            html: `
                <div class="text-start px-2 mt-3" style="font-family:'Sarabun';">
                    
                    <div class="row g-3 mb-3">
                        <div class="col-4">
                            <label class="form-label fw-bold text-secondary small">รหัสสินค้า</label>
                            <input type="text" id="swal-inv-item-code" class="form-control fw-bold shadow-sm input-modern" placeholder="เช่น ATK001" value="${this.#escapeHTML(item.item_code || '')}">
                        </div>
                        <div class="col-5">
                            <label class="form-label fw-bold text-secondary small">บาร์โค้ด</label>
                            ${!isEdit ? `
                            <div class="input-group shadow-sm" style="border-radius:8px; overflow:hidden;">
                                <input type="text" id="swal-inv-barcode" class="form-control fw-bold input-modern" placeholder="ยิงบาร์โค้ด" value="" style="border-right: none;">
                                <button class="btn btn-primary fw-bold px-2" type="button" onclick="window.InventoryGenBarcode()" title="สุ่ม" style="border: 1px solid var(--primary);"><i class="fa-solid fa-shuffle safe-icon"></i></button>
                            </div>
                            ` : `
                            <input type="text" id="swal-inv-barcode" class="form-control fw-bold shadow-sm input-modern" value="${this.#escapeHTML(item.barcode || '')}" readonly style="opacity: 0.7; cursor: not-allowed;">
                            `}
                        </div>
                        <div class="col-3">
                            <label class="form-label fw-bold text-primary small">ลำดับ</label>
                            <input type="number" id="swal-inv-order" class="form-control fw-bold text-center text-primary shadow-sm input-modern" placeholder="เช่น 1" value="${orderVal}" style="border-color: var(--primary) !important;">
                        </div>
                    </div>

                    <label class="form-label fw-bold text-secondary small mb-1">ชื่อรายการพัสดุ <span class="text-danger">*</span> <span class="text-primary" style="font-size: 11px;">(พิมพ์เพื่อดึงยาจากหน้าตั้งค่าแพทย์ได้)</span></label>
                    <input type="text" id="swal-inv-name" list="inv-meds-list" class="form-control form-control-lg fw-bold shadow-sm mb-3 input-modern text-dark" value="${this.#escapeHTML(item.name || '')}" placeholder="คลิกเพื่อเลือกจากรายชื่อยา หรือ พิมพ์ชื่อใหม่..." style="cursor: pointer;">
                    <datalist id="inv-meds-list">${medOptions}</datalist>

                    <div class="row g-3 mb-4">
                        <div class="col-6">
                            <label class="form-label fw-bold text-secondary small">หมวดหมู่</label>
                            <input list="inv-cat-list" id="swal-inv-category" class="form-control fw-bold shadow-sm input-modern" value="${this.#escapeHTML(item.category || '')}" placeholder="เลือกหรือพิมพ์ใหม่...">
                            <datalist id="inv-cat-list">${catOptions}</datalist>
                        </div>
                        <div class="col-6">
                            <label class="form-label fw-bold text-secondary small">หน่วยนับ</label>
                            <input list="inv-unit-list" id="swal-inv-unit" class="form-control fw-bold shadow-sm input-modern" value="${this.#escapeHTML(item.unit || 'ชิ้น')}" placeholder="เช่น กล่อง, ถุง...">
                            <datalist id="inv-unit-list">${unitOptions}</datalist>
                        </div>
                    </div>

                    <div class="p-3 rounded-4 shadow-sm mb-3 border" style="background-color: var(--bg-body); border-color: var(--border-color) !important;">
                        <h6 class="fw-bold text-primary mb-2"><i class="fa-solid fa-bullseye me-2 safe-icon"></i>ตั้งค่ายอดตั้งต้นเบิก (Smart PO)</h6>
                        <label class="form-label fw-bold text-secondary small mb-2">คาดการณ์ใช้พัสดุชิ้นนี้กี่ชิ้น / สัปดาห์:</label>
                        <input type="number" id="swal-inv-base-req" class="form-control fw-bold text-primary shadow-sm input-modern" value="${bReq}" placeholder="ระบุเป็นจำนวนเต็ม" min="0" style="border-color: var(--primary) !important;">
                    </div>

                    <div class="p-3 rounded-4 shadow-sm border" style="background-color: var(--bg-body); border-color: var(--border-color) !important;">
                        <h6 class="fw-bold text-secondary mb-3"><i class="fa-solid fa-boxes-stacked me-2 safe-icon"></i>จุดสั่งซื้อเผื่อฉุกเฉิน (Min-Stock)</h6>
                        <div class="row g-3">
                            <div class="col-6">
                                <label class="form-label fw-bold text-secondary small">สต๊อกใหญ่เตือนเมื่อต่ำกว่า:</label>
                                <input type="number" id="swal-inv-min-main" class="form-control fw-bold text-center shadow-sm input-modern" value="${mMain}">
                            </div>
                            <div class="col-6">
                                <label class="form-label fw-bold text-secondary small">สต๊อกเล็กเตือนเมื่อต่ำกว่า:</label>
                                <input type="number" id="swal-inv-min-sub" class="form-control fw-bold text-center shadow-sm input-modern" value="${mSub}">
                            </div>
                        </div>
                    </div>

                    ${!isEdit ? `
                    <div class="mt-3 p-3 rounded-4 border shadow-sm" style="background-color: var(--bg-body); border-color: var(--success) !important;">
                        <h6 class="fw-bold text-success mb-2"><i class="fa-solid fa-boxes-packing me-2 safe-icon"></i>ยอดยกมาเริ่มต้น (Initial Stock)</h6>
                        <div class="row g-3">
                            <div class="col-6">
                                <label class="form-label fw-bold text-success small">จำนวนใน สต๊อกใหญ่</label>
                                <input type="number" id="swal-inv-qty-main" class="form-control fw-bold text-success text-center shadow-sm input-modern" value="${qMain}" style="border-color: var(--success) !important;">
                            </div>
                            <div class="col-6">
                                <label class="form-label fw-bold text-success small">จำนวนใน สต๊อกเล็ก</label>
                                <input type="number" id="swal-inv-qty-sub" class="form-control fw-bold text-success text-center shadow-sm input-modern" value="${qSub}" style="border-color: var(--success) !important;">
                            </div>
                        </div>
                    </div>
                    ` : `<input type="hidden" id="swal-inv-qty-main" value="${qMain}"><input type="hidden" id="swal-inv-qty-sub" value="${qSub}">`}
                </div>
            `,
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึกข้อมูล', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#10b981', width: 600, customClass: { popup: 'premium-alert' },
            preConfirm: () => {
                const name = document.getElementById('swal-inv-name').value.trim();
                const barcode = document.getElementById('swal-inv-barcode').value.trim();
                const itemCode = document.getElementById('swal-inv-item-code').value.trim(); 
                let orderInput = document.getElementById('swal-inv-order').value.trim();
                
                if (!name || !barcode) { Swal.showValidationMessage('กรุณาระบุบาร์โค้ด และ ชื่อพัสดุ'); return false; }
                const isDuplicate = this.allItems.some(i => i.barcode === barcode && i.id !== itemId);
                if (isDuplicate) { Swal.showValidationMessage('รหัสบาร์โค้ดนี้ถูกใช้งานแล้ว กรุณาใช้รหัสอื่น'); return false; }

                return {
                    id: itemId || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9)),
                    item_code: itemCode,
                    barcode: barcode, name: name, category: document.getElementById('swal-inv-category').value || 'ทั่วไป', unit: document.getElementById('swal-inv-unit').value || 'ชิ้น',
                    order: orderInput ? Number(orderInput) : 999,
                    base_req: Number(document.getElementById('swal-inv-base-req').value), qty_main: Number(document.getElementById('swal-inv-qty-main').value), qty_sub: Number(document.getElementById('swal-inv-qty-sub').value),
                    min_main: Number(document.getElementById('swal-inv-min-main').value), min_sub: Number(document.getElementById('swal-inv-min-sub').value),
                    qty: Number(document.getElementById('swal-inv-qty-main').value), last_update: new Date().toISOString()
                };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'กำลังบันทึกข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                
                let newItem = result.value; 
                try {
                    if (isEdit && item.firebaseKey) {
                        await db.ref(`inventory_database_v2/items/${item.firebaseKey}`).update(newItem);
                    } else {
                        await db.ref('inventory_database_v2/items').push(newItem);
                        await db.ref('inventory_database_v2/transactions').push({ 
                            timestamp: new Date().toISOString(), 
                            mode: 'new_register', 
                            itemName: newItem.name, 
                            qty: newItem.qty_main + newItem.qty_sub, 
                            user: App.currentUser ? App.currentUser.name : 'Admin' 
                        });
                    }
                    Swal.fire({title: 'สำเร็จ', text: 'ข้อมูลพัสดุอัปเดตเรียบร้อย', icon: 'success', timer: 1500, showConfirmButton: false, customClass: { popup: 'premium-alert' }});
                } catch (err) {
                    Swal.fire({title:'ข้อผิดพลาด', text:err.message, icon:'error', customClass: { popup: 'premium-alert' }});
                }
            }
        });
    }

    deleteItem(firebaseKeyOrId, itemName) {
        if (!firebaseKeyOrId) return;

        Swal.fire({ 
            title: 'ยืนยันการลบ?', 
            html: `ต้องการลบ <b>${itemName}</b> ออกจากระบบใช่หรือไม่?<br><small class="text-danger">การลบอาจส่งผลให้ประวัติเก่าที่เคยเบิกพัสดุนี้อ้างอิงชื่อไม่ได้</small>`, 
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonColor: '#ef4444', 
            confirmButtonText: '<i class="fa-solid fa-trash"></i> ยืนยันการลบ', 
            cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'premium-alert' }
        }).then(async (res) => { 
            if(res.isConfirmed) {
                Swal.fire({ title: 'กำลังลบข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                try {
                    let refToDelete = db.ref(`inventory_database_v2/items/${firebaseKeyOrId}`);
                    let snap = await refToDelete.once('value');
                    
                    if (!snap.exists()) {
                        const itemsSnap = await db.ref('inventory_database_v2/items').orderByChild('id').equalTo(firebaseKeyOrId).once('value');
                        if (itemsSnap.exists()) {
                            itemsSnap.forEach(child => {
                                refToDelete = db.ref(`inventory_database_v2/items/${child.key}`);
                            });
                        }
                    }

                    await refToDelete.remove();
                    Swal.fire({title:'ลบสำเร็จ', icon:'success', timer:1200, showConfirmButton:false, customClass: { popup: 'premium-alert' }});
                } catch (err) {
                    Swal.fire({title:'ข้อผิดพลาด', text:err.message, icon:'error', customClass: { popup: 'premium-alert' }});
                }
            } 
        });
    }

    printBarcode(itemId) { 
        const item = this.allItems.find(i => i.id === itemId);
        if (!item) return;
        const printWindow = window.open('', '_blank', 'width=800,height=450');
        
        const html = `
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <title>Label - ${this.#escapeHTML(item.name)}</title>
            <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;600;700&display=swap" rel="stylesheet">
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
            <style>
                body { font-family: 'Prompt', sans-serif; background: #f8fafc; display: flex; flex-direction: column; align-items: center; padding: 40px 20px; margin: 0; } 
                .control-panel { margin-bottom: 40px; display: flex; gap: 15px; justify-content: center; } 
                button { font-family: 'Prompt', sans-serif; padding: 12px 24px; font-size: 16px; font-weight: 600; border-radius: 10px; cursor: pointer; border: none; transition: 0.2s; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); } 
                .btn-save { background: #10b981; color: white; } 
                .btn-save:hover { background: #059669; transform: translateY(-2px); } 
                .btn-print { background: #4361ee; color: white; } 
                .btn-print:hover { background: #3730a3; transform: translateY(-2px); } 
                
                .label-box { 
                    width: 520px; height: 100px; background: #ffffff; 
                    display: flex; align-items: center; justify-content: space-between; 
                    padding: 0 15px; box-sizing: border-box; box-shadow: 0 10px 25px rgba(0,0,0,0.08); 
                    position: relative; border: 1px dashed #cbd5e1; border-radius: 8px;
                } 
                .label-info { flex: 1; text-align: left; overflow: hidden; padding-right: 10px; min-width: 0; } 
                
                .item-name { 
                    font-size: 16px; font-weight: 700; color: #0f172a; line-height: 1.3; margin-bottom: 4px; 
                    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; white-space: normal; overflow: hidden; text-overflow: ellipsis;
                } 
                
                .item-cat { font-size: 11px; color: #64748b; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } 
                .barcode-wrap { display: flex; align-items: center; justify-content: center; height: 100%; flex-shrink: 0; background: #fff; } 
                svg { max-width: 100%; height: auto; display: block; } 
                
                @media print { 
                    body { background: #fff; padding: 0; margin: 0; display: block; align-items: flex-start; } 
                    .control-panel { display: none; } 
                    .label-box { box-shadow: none; margin: 0; width: 520px !important; height: 100px !important; page-break-inside: avoid; border: 1px dashed #94a3b8; } 
                    @page { size: auto; margin: 5mm; } 
                }
            </style>
        </head>
        <body>
            <div class="control-panel">
                <button class="btn-save" onclick="downloadLabel()">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg> บันทึกรูปภาพ (PNG)
                </button>
                <button class="btn-print" onclick="window.print()">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg> พิมพ์ป้ายสติ๊กเกอร์
                </button>
            </div>
            
            <div id="label-export" class="label-box">
                <div class="label-info">
                    <div class="item-name">${this.#escapeHTML(item.name)}</div>
                    <div class="item-cat">รหัส: ${this.#escapeHTML(item.item_code || '-')} | บาร์โค้ด: ${this.#escapeHTML(item.barcode || '-')}</div>
                </div>
                <div class="barcode-wrap">
                    <svg id="barcode-canvas"></svg>
                </div>
            </div>
            
            <script> 
                JsBarcode("#barcode-canvas", "${item.barcode}", { format: "CODE128", width: 2.2, height: 50, displayValue: true, fontSize: 16, fontOptions: "bold", textMargin: 4, margin: 0 }); 
                function downloadLabel() { 
                    const label = document.getElementById('label-export'); 
                    const originalShadow = label.style.boxShadow; 
                    const originalBorder = label.style.border;
                    label.style.boxShadow = 'none'; 
                    label.style.border = 'none';
                    html2canvas(label, { scale: 3, backgroundColor: "#ffffff", width: 520, height: 100 }).then(canvas => { 
                        let link = document.createElement('a'); 
                        link.download = 'Barcode_${item.name.replace(/\s+/g, '_')}.png'; 
                        link.href = canvas.toDataURL('image/png'); 
                        link.click(); 
                        label.style.boxShadow = originalShadow; 
                        label.style.border = originalBorder;
                    }); 
                } 
            </script>
        </body>
        </html>`;
        
        printWindow.document.write(html); 
        printWindow.document.close();
    }

    printAllBarcodes() {
        if (!this.allItems || this.allItems.length === 0) {
            if (typeof Swal !== 'undefined') {
                Swal.fire('ไม่มีข้อมูล', 'ไม่พบรายการพัสดุสำหรับพิมพ์บาร์โค้ดในระบบ', 'warning');
            }
            return;
        }

        const printWindow = window.open('', '_blank');
        
        let labelsHtml = '';
        let scriptsHtml = '';

        const sortedItems = [...this.allItems].sort((a, b) => {
            let orderA = a.order !== undefined && a.order !== null && a.order !== "" ? Number(a.order) : 999;
            let orderB = b.order !== undefined && b.order !== null && b.order !== "" ? Number(b.order) : 999;
            return orderA - orderB;
        });

        sortedItems.forEach((item, index) => {
            if (!item.barcode) return; 

            const safeName = this.#escapeHTML(item.name);
            const safeItemCode = this.#escapeHTML(item.item_code || '-');
            const safeBarcode = this.#escapeHTML(item.barcode);
            const canvasId = `barcode-canvas-all-${index}`;

            labelsHtml += `
                <div class="label-box">
                    <div class="label-info">
                        <div class="item-name">${safeName}</div>
                        <div class="item-cat">รหัส: ${safeItemCode} | บาร์โค้ด: ${safeBarcode}</div>
                    </div>
                    <div class="barcode-wrap">
                        <svg id="${canvasId}"></svg>
                    </div>
                </div>
            `;

            scriptsHtml += `
                try {
                    JsBarcode("#${canvasId}", "${safeBarcode}", { 
                        format: "CODE128", width: 2.2, height: 50, displayValue: true, fontSize: 16, fontOptions: "bold", textMargin: 4, margin: 0 
                    });
                } catch(e) { console.error("Error barcode:", e); }
            `;
        });

        const html = `
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <title>พิมพ์บาร์โค้ดพัสดุทั้งหมด - DIALYSIS PRO</title>
            <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;600;700&display=swap" rel="stylesheet">
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
            <style>
                body { 
                    font-family: 'Prompt', sans-serif; background: #f8fafc; margin: 0; padding: 20px;
                    -webkit-print-color-adjust: exact; print-color-adjust: exact;
                }
                .control-panel { margin-bottom: 30px; text-align: center; }
                .btn-print { 
                    font-family: 'Prompt', sans-serif; padding: 12px 24px; font-size: 16px; font-weight: 600; 
                    border-radius: 10px; cursor: pointer; border: none; background: #4361ee; color: white;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: inline-flex; align-items: center; gap: 8px;
                }
                
                .page-container {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px; 
                    width: 100%;
                    max-width: 297mm;
                    margin: 0 auto;
                    box-sizing: border-box;
                }
                
                .label-box { 
                    width: 100%; height: 100px;
                    background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 8px;
                    display: flex; align-items: center; justify-content: space-between; 
                    padding: 0 15px; box-sizing: border-box; 
                    page-break-inside: avoid; 
                } 
                .label-info { flex: 1; text-align: left; overflow: hidden; padding-right: 10px; min-width: 0; } 
                
                .item-name { 
                    font-size: 16px; font-weight: 700; color: #0f172a; line-height: 1.3; margin-bottom: 4px;
                    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; white-space: normal; overflow: hidden; text-overflow: ellipsis;
                } 
                
                .item-cat { font-size: 11px; color: #64748b; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } 
                .barcode-wrap { display: flex; align-items: center; justify-content: center; height: 100%; background: #fff; flex-shrink: 0; } 
                svg { max-width: 100%; height: auto; display: block; } 
                
                @media print { 
                    body { background: #fff; padding: 0; margin: 0; } 
                    .control-panel { display: none; } 
                    .page-container { max-width: 100%; gap: 10px; }
                    .label-box { border: 1px dashed #94a3b8; width: 100% !important; } 
                    @page { size: A4 landscape; margin: 5mm 8mm; } 
                }
            </style>
        </head>
        <body>
            <div class="control-panel">
                <button class="btn-print" onclick="window.print()">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg> พิมพ์สติ๊กเกอร์ทั้งหมด
                </button>
            </div>
            <div class="page-container">${labelsHtml}</div>
            <script> 
                window.onload = function() {
                    ${scriptsHtml}
                };
            </script>
        </body>
        </html>`;
        
        printWindow.document.write(html); 
        printWindow.document.close();
    }

    // 🚨 THE FIX: อัปเกรดหน้าตาเอกสารสั่งพิมพ์ (Print Report) ให้สวยงามระดับ Enterprise
    printTable() {
        if(this.allItems.length === 0) { 
            Swal.fire('ไม่มีข้อมูล', 'ไม่มีข้อมูลในตารางสำหรับพิมพ์', 'warning'); return; 
        }

        const printWindow = window.open('', '_blank');
        
        let tableRows = '';
        const currentSearch = document.getElementById('inv-search') ? document.getElementById('inv-search').value.toLowerCase().trim() : '';
        const itemsToPrint = currentSearch === '' ? this.allItems : this.allItems.filter(i => 
            (i.name || "").toLowerCase().includes(currentSearch) || 
            (i.barcode || "").toLowerCase().includes(currentSearch) || 
            (i.item_code || "").toLowerCase().includes(currentSearch) || 
            (i.category || "").toLowerCase().includes(currentSearch)
        );

        itemsToPrint.forEach(i => {
            let qMain = i.qty_main !== undefined ? Number(i.qty_main) : (Number(i.qty) || 0);
            let qSub = Number(i.qty_sub) || 0;
            let qTotal = qMain + qSub;
            let orderVal = (i.order !== undefined && i.order !== null && i.order !== "" && i.order !== 999) ? i.order : '-';
            
            // วาดแถวตาราง พร้อมแนบคลาสคุมความกว้าง
            tableRows += `
                <tr>
                    <td class="col-no">${orderVal}</td>
                    <td class="col-code">${this.#escapeHTML(i.item_code || '-')}</td>
                    <td class="col-name">${this.#escapeHTML(i.name)}</td>
                    <td class="col-num">${qMain}</td>
                    <td class="col-num">${qSub}</td>
                    <td class="col-total">${qTotal}</td>
                    <td class="col-unit">${this.#escapeHTML(i.unit || '-')}</td>
                </tr>
            `;
        });

        // HTML & CSS ระดับพรีเมียมสำหรับหน้า Print
        const html = `
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <title>รายงานยอดคงเหลือคลังพัสดุ</title>
            <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@600;700&family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                /* บังคับเบราว์เซอร์ให้พิมพ์สีพื้นหลัง (สำคัญมาก) */
                * { 
                    box-sizing: border-box; 
                    -webkit-print-color-adjust: exact !important; 
                    print-color-adjust: exact !important; 
                }
                
                @page { size: A4 portrait; margin: 12mm 15mm; }
                
                body { 
                    font-family: 'Sarabun', sans-serif; 
                    padding: 0; margin: 0; 
                    color: #1e293b; 
                    background: #f8fafc;
                }
                
                .report-container {
                    background: #fff;
                    padding: 20px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                    max-width: 210mm;
                    margin: 0 auto;
                }

                .header { 
                    text-align: center; 
                    margin-bottom: 25px; 
                    padding-bottom: 15px;
                    border-bottom: 3px solid #3b82f6; /* เส้นคาดหัวรายงานสีน้ำเงิน */
                }
                
                .header h2 { 
                    margin: 0 0 8px 0; 
                    font-size: 24px; 
                    font-family: 'Prompt', sans-serif;
                    color: #0f172a;
                    text-transform: uppercase;
                }
                
                .header p { 
                    margin: 0; 
                    font-size: 14px; 
                    color: #64748b; 
                    font-weight: 600;
                }

                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    font-size: 13px; 
                }
                
                th, td { 
                    border: 1px solid #cbd5e1; 
                    padding: 8px 6px; 
                }
                
                th { 
                    background-color: #f1f5f9; 
                    color: #334155;
                    font-family: 'Prompt', sans-serif;
                    font-weight: 700; 
                    text-align: center; 
                    font-size: 14px;
                }
                
                /* จัดลายม้าลายให้อ่านง่าย */
                tbody tr:nth-child(even) { background-color: #f8fafc; }
                
                /* จัดสัดส่วนคอลัมน์ให้เป๊ะ */
                .col-no { width: 7%; text-align: center; color: #64748b; }
                .col-code { width: 15%; text-align: center; font-family: monospace; font-size: 12px; color: #475569; }
                .col-name { width: 36%; text-align: left; padding-left: 12px !important; font-weight: 600; color: #0f172a; }
                .col-num { width: 10%; text-align: center; }
                .col-total { width: 12%; text-align: center; font-weight: bold; background-color: #f0fdf4 !important; color: #15803d !important; font-size: 14px; border-left: 2px solid #bbf7d0; border-right: 2px solid #bbf7d0; }
                .col-unit { width: 10%; text-align: center; color: #64748b; }

                /* ปุ่มกดพิมพ์ (ซ่อนตอนพิมพ์จริง) */
                .print-btn-wrapper { text-align: center; margin-bottom: 20px; }
                .btn-print {
                    background: #3b82f6; color: #fff; border: none; padding: 12px 30px; 
                    font-size: 16px; font-family: 'Prompt', sans-serif; font-weight: bold; 
                    border-radius: 50px; cursor: pointer; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
                    transition: all 0.2s;
                }
                .btn-print:hover { background: #2563eb; transform: translateY(-2px); }

                @media print {
                    body { background: #fff; }
                    .report-container { box-shadow: none; padding: 0; }
                    .print-btn-wrapper { display: none !important; }
                }
            </style>
        </head>
        <body>
            <div class="print-btn-wrapper">
                <button class="btn-print" onclick="window.print()">🖨️ สั่งพิมพ์รายงาน</button>
            </div>
            
            <div class="report-container">
                <div class="header">
                    <h2>รายงานยอดคงเหลือคลังพัสดุ</h2>
                    <p>ข้อมูล ณ วันที่: ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th class="col-no">ลำดับ</th>
                            <th class="col-code">รหัสสินค้า</th>
                            <th class="col-name">ชื่อรายการพัสดุ</th>
                            <th class="col-num">สต๊อกใหญ่</th>
                            <th class="col-num">สต๊อกเล็ก</th>
                            <th class="col-total">รวมสุทธิ</th>
                            <th class="col-unit">หน่วย</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>
            
            <script>
                // สั่งเปิดหน้าต่าง Print อัตโนมัติหลังจากโหลดฟอนต์เสร็จ
                window.onload = function() { setTimeout(() => window.print(), 800); }
            </script>
        </body>
        </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
    }

    async exportPDF() {
        if(this.allItems.length === 0) { 
            Swal.fire('ไม่มีข้อมูล', 'ไม่มีข้อมูลในตารางสำหรับโหลด PDF', 'warning'); return; 
        }

        Swal.fire({ 
            title: 'กำลังสร้างไฟล์ PDF...', 
            html: 'ระบบกำลังประมวลผลฟอนต์ภาษาไทยและจัดหน้ากระดาษ<br>กรุณารอสักครู่...', 
            allowOutsideClick: false, 
            didOpen: () => Swal.showLoading(),
            customClass: { popup: 'premium-alert' }
        });

        // 1. นำเข้า Library ที่จำเป็นสำหรับการถ่ายภาพความละเอียดสูง
        if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
            await Promise.all([
                new Promise(r => { let s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; s.onload=r; document.head.appendChild(s); }),
                new Promise(r => { let s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; s.onload=r; document.head.appendChild(s); })
            ]);
        }

        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('portrait', 'mm', 'a4');

            // 2. ดึงข้อมูลที่ค้นหาอยู่ ณ ปัจจุบัน
            const currentSearch = document.getElementById('inv-search') ? document.getElementById('inv-search').value.toLowerCase().trim() : '';
            const itemsToExport = currentSearch === '' ? this.allItems : this.allItems.filter(i => 
                (i.name || "").toLowerCase().includes(currentSearch) || 
                (i.barcode || "").toLowerCase().includes(currentSearch) || 
                (i.item_code || "").toLowerCase().includes(currentSearch) || 
                (i.category || "").toLowerCase().includes(currentSearch)
            );

            // 3. กำหนดจำนวนบรรทัดต่อ 1 หน้า A4
            const ROWS_PER_PAGE = 25; 
            let chunks = [];
            for (let i = 0; i < itemsToExport.length; i += ROWS_PER_PAGE) {
                chunks.push(itemsToExport.slice(i, i + ROWS_PER_PAGE));
            }

            // 4. สร้าง Container ล่องหนเพื่อจัดหน้าแบบ HTML
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.top = '-9999px';
            container.style.left = '0';
            container.style.width = '210mm';
            container.style.backgroundColor = '#ffffff';
            document.body.appendChild(container);

            const reportDate = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            // 5. วนลูปวาดตารางทีละหน้ากระดาษ
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const isFirstPage = (i === 0);

                let tableRowsHtml = '';
                chunk.forEach((item) => {
                    let qMain = item.qty_main !== undefined ? Number(item.qty_main) : (Number(item.qty) || 0);
                    let qSub = Number(item.qty_sub) || 0;
                    let qTotal = qMain + qSub;
                    let orderVal = (item.order !== undefined && item.order !== null && item.order !== "" && item.order !== 999) ? item.order : '-';

                    tableRowsHtml += `
                    <tr style="height: 32px; background-color: #ffffff;">
                        <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; color: #1e293b; font-size: 13px;">${orderVal}</td>
                        <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; color: #1e293b; font-size: 13px;">${this.#escapeHTML(item.item_code || '-')}</td>
                        <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: left; color: #1e293b; font-size: 13px; font-weight: bold; padding-left: 10px;">${this.#escapeHTML(item.name)}</td>
                        <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; color: #1e293b; font-size: 14px;">${qMain}</td>
                        <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; color: #1e293b; font-size: 14px;">${qSub}</td>
                        <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; color: #15803d; font-size: 15px; font-weight: bold; background: #f0fdf4;">${qTotal}</td>
                        <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; color: #1e293b; font-size: 13px;">${this.#escapeHTML(item.unit || '-')}</td>
                    </tr>`;
                });

                // ใส่หัวกระดาษเฉพาะหน้าแรก
                const documentHeaderHtml = isFirstPage ? `
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 22px; font-weight: bold; color: #0f172a; margin-bottom: 5px;">รายงานยอดคงเหลือคลังพัสดุ</div>
                        <div style="font-size: 14px; color: #64748b;">ข้อมูล ณ วันที่: ${reportDate}</div>
                    </div>
                ` : `<div style="height: 20px;"></div>`;

                const pageHtml = `
                    <div class="pdf-page-chunk" style="width: 210mm; height: 297mm; padding: 15mm; box-sizing: border-box; background: #fff; position: relative; font-family: 'Sarabun', sans-serif; color: #000;">
                        ${documentHeaderHtml}

                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            <thead>
                                <tr style="background-color: #e2e8f0;">
                                    <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-size: 13px; font-weight: bold; width: 8%; color: #334155;">ลำดับ</th>
                                    <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-size: 13px; font-weight: bold; width: 15%; color: #334155;">รหัสสินค้า</th>
                                    <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-size: 13px; font-weight: bold; width: 35%; color: #334155;">ชื่อรายการพัสดุ</th>
                                    <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-size: 13px; font-weight: bold; width: 10%; color: #334155;">สต๊อกใหญ่</th>
                                    <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-size: 13px; font-weight: bold; width: 10%; color: #334155;">สต๊อกเล็ก</th>
                                    <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-size: 13px; font-weight: bold; width: 12%; color: #15803d;">รวมสุทธิ</th>
                                    <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-size: 13px; font-weight: bold; width: 10%; color: #334155;">หน่วย</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRowsHtml}
                            </tbody>
                        </table>

                        <div style="position: absolute; bottom: 15mm; right: 15mm; font-size: 12px; color: #94a3b8; font-family: 'Prompt', sans-serif;">
                            หน้า ${i+1}/${chunks.length}
                        </div>
                    </div>
                `;

                container.innerHTML = pageHtml;

                // 6. ถ่ายภาพหน้า HTML นี้
                await document.fonts.ready;
                const canvas = await html2canvas(container.querySelector('.pdf-page-chunk'), { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
                const imgData = canvas.toDataURL('image/jpeg', 1.0);

                // 7. นำภาพแปะลง PDF
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
            }

            // ลบขยะและโหลดไฟล์ลงเครื่อง
            container.remove();
            pdf.save(`Inventory_Report_${new Date().getTime()}.pdf`);
            Swal.fire({title:'ดาวน์โหลด PDF สำเร็จ!', icon:'success', timer:1500, showConfirmButton: false});

        } catch (e) {
            console.error(e);
            Swal.fire('Error', 'เกิดข้อผิดพลาดในการสร้าง PDF: ' + e.message, 'error');
        }
    }

    async exportExcel() {
        if(this.allItems.length === 0) { 
            Swal.fire('ไม่มีข้อมูล', 'ไม่มีข้อมูลในตารางสำหรับโหลด Excel', 'warning'); return; 
        }
        Swal.fire({ title: 'กำลังเขียนไฟล์ Excel...', didOpen: () => Swal.showLoading() });

        const loadExcelJSEngine = () => {
            return new Promise((resolve) => {
                if (typeof ExcelJS !== 'undefined') return resolve();
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js';
                script.onload = () => resolve();
                document.head.appendChild(script);
            });
        };

        loadExcelJSEngine().then(async () => {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('ยอดคงเหลือ', { views: [{ showGridLines: false }] });

            worksheet.mergeCells('A1:G1'); 
            const titleRow = worksheet.getRow(1);
            titleRow.getCell(1).value = "รายงานยอดคงเหลือคลังพัสดุ"; 
            titleRow.getCell(1).font = { name: 'Tahoma', size: 16, bold: true }; 
            titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }; 
            titleRow.height = 30;

            worksheet.columns = [
                { width: 10 }, { width: 15 }, { width: 40 }, 
                { width: 12 }, { width: 12 }, { width: 12 }, { width: 10 }
            ];
            
            const headers = ["ลำดับ", "รหัสสินค้า", "ชื่อรายการพัสดุ", "สต๊อกใหญ่", "สต๊อกเล็ก", "รวมสุทธิ", "หน่วย"];
            const headerRow = worksheet.getRow(3); 
            headerRow.values = headers; 
            headerRow.height = 25;
            
            const thinBorder = { 
                top: { style: 'thin' }, left: { style: 'thin' }, 
                bottom: { style: 'thin' }, right: { style: 'thin' } 
            };

            for (let c = 1; c <= 7; c++) { 
                const cell = headerRow.getCell(c); 
                cell.font = { name: 'Tahoma', size: 11, bold: true }; 
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }; 
                cell.border = thinBorder; 
                cell.alignment = { horizontal: 'center', vertical: 'middle' }; 
            }

            const currentSearch = document.getElementById('inv-search') ? document.getElementById('inv-search').value.toLowerCase().trim() : '';
            const itemsToExport = currentSearch === '' ? this.allItems : this.allItems.filter(i => 
                (i.name || "").toLowerCase().includes(currentSearch) || 
                (i.barcode || "").toLowerCase().includes(currentSearch) || 
                (i.item_code || "").toLowerCase().includes(currentSearch) || 
                (i.category || "").toLowerCase().includes(currentSearch)
            );

            let currentRowNum = 4;
            itemsToExport.forEach((i) => {
                let qMain = i.qty_main !== undefined ? Number(i.qty_main) : (Number(i.qty) || 0);
                let qSub = Number(i.qty_sub) || 0;
                let qTotal = qMain + qSub;
                let orderVal = (i.order !== undefined && i.order !== null && i.order !== "" && i.order !== 999) ? Number(i.order) : '';
                
                const row = worksheet.getRow(currentRowNum);
                row.values = [ orderVal, i.item_code || '', i.name, qMain, qSub, qTotal, i.unit || '' ]; 
                row.height = 22; 
                
                for (let c = 1; c <= 7; c++) { 
                    const cell = row.getCell(c); 
                    cell.font = { name: 'Tahoma', size: 11 }; 
                    cell.border = thinBorder; 
                    if (c === 3) cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }; 
                    else cell.alignment = { horizontal: 'center', vertical: 'middle' }; 
                    
                    if (c === 6) cell.font = { name: 'Tahoma', size: 11, bold: true, color: { argb: 'FF15803D' } }; // เน้นสียอดรวม
                }
                currentRowNum++;
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a'); 
            link.href = url; 
            link.download = `คลังพัสดุ_${new Date().getTime()}.xlsx`; 
            document.body.appendChild(link); 
            link.click(); 
            document.body.removeChild(link); 
            window.URL.revokeObjectURL(url); 
            Swal.close();
        });
    }

    #escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}

const InventoryPage = new InventoryPageComponent();
window.InventoryPage = InventoryPage;
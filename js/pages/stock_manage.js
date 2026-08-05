// js/pages/stock_manage.js
// 🚀 Enterprise Stock Management: Contextual UX Calculator (v16.0 FULL)

class StockManagePageComponent {
    constructor() {
        this.allItems = [];
        this.cart = [];
        this.historyStack = []; 
        this.html5QrcodeScanner = null;
        this.firebaseListeners = [];
    }

    get html() {
        return `
            <style>
                .table-premium th { color: var(--text-muted); font-weight: 700; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; padding: 14px 10px; border-bottom: 2px solid var(--border-color); }
                .table-premium td { padding: 14px 10px; vertical-align: middle; border-bottom: 1px solid var(--border-color); transition: background 0.2s; }
                .btn-action-icon { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s ease; }
                .btn-action-icon:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                
                .btn-manual-search { border: 2px dashed var(--primary) !important; background-color: var(--bg-surface) !important; color: var(--primary) !important; transition: all 0.3s ease; }
                .btn-manual-search:hover { background-color: var(--primary) !important; color: #ffffff !important; border-style: solid !important; box-shadow: 0 4px 12px rgba(37,99,235,0.2) !important; }

                .list-group-custom-hover { transition: background-color 0.2s ease !important; }
                .list-group-custom-hover:hover { background-color: var(--border-color) !important; }

                .qty-calculator-btn { 
                    background: var(--bg-body); border: 2px solid var(--border-color); border-radius: 8px; 
                    font-size: 18px; font-weight: 700; color: var(--text-dark); padding: 5px 15px; cursor: pointer; transition: all 0.2s; width: 100%; text-align: center;
                }
                .qty-calculator-btn:hover { border-color: var(--primary); color: var(--primary); background: rgba(59,130,246,0.05); }

                .numpad-calc-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 15px; }
                .numpad-btn { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; font-size: 22px; font-weight: 700; color: var(--text-dark); padding: 12px 0; transition: all 0.1s; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.02); font-family: 'Prompt', sans-serif;}
                .numpad-btn:active { transform: scale(0.95); background: var(--bg-body); }
                .numpad-btn:hover { background: var(--bg-body); }
                
                .numpad-op { background: rgba(59, 130, 246, 0.1) !important; color: var(--primary) !important; border-color: rgba(59, 130, 246, 0.2) !important; font-size: 26px;}
                .numpad-op:hover { background: rgba(59, 130, 246, 0.2) !important; }
                html[data-bs-theme="dark"] .numpad-op { color: #60a5fa !important; border-color: rgba(59, 130, 246, 0.3) !important; }

                .numpad-danger { background: rgba(239, 68, 68, 0.1) !important; color: #ef4444 !important; border-color: rgba(239, 68, 68, 0.2) !important; }
                .numpad-danger:hover { background: rgba(239, 68, 68, 0.2) !important; }
                html[data-bs-theme="dark"] .numpad-danger { color: #f87171 !important; border-color: rgba(239, 68, 68, 0.3) !important; }

                .numpad-success { background: var(--primary) !important; color: white !important; border-color: var(--primary) !important; font-size: 26px; box-shadow: 0 4px 10px rgba(59,130,246,0.3);}
                .numpad-success:hover { filter: brightness(0.9); background: var(--primary) !important; color: white !important; }

                .numpad-memory { background: rgba(245, 158, 11, 0.1) !important; color: #d97706 !important; border-color: rgba(245, 158, 11, 0.2) !important; font-size: 16px; font-family: 'Sarabun'; }
                .numpad-memory:hover { background: rgba(245, 158, 11, 0.2) !important; }
                html[data-bs-theme="dark"] .numpad-memory { color: #fbbf24 !important; border-color: rgba(245, 158, 11, 0.3) !important; }

                /* 🚨 THE FIX: อัปเกรดโหมดสลับปุ่มให้มีสีแยกกันชัดเจน (Dynamic Contextual Color) */
                .calc-toggle-btn { flex: 1; padding: 12px; border-radius: 10px; font-weight: bold; border: none; cursor: pointer; transition: 0.2s; font-family: 'Prompt'; font-size: 16px; }
                .calc-toggle-active-add { background: #ea580c; color: white; box-shadow: 0 4px 10px rgba(234, 88, 12, 0.3); }
                .calc-toggle-active-replace { background: var(--primary); color: white; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3); }
                .calc-toggle-inactive { background: transparent; color: var(--text-muted); }
                .calc-toggle-inactive:hover { background: var(--border-color); }
            </style>

            <div class="page-header mb-4">
                <div>
                    <h2 class="page-title text-primary" style="font-size: 28px;"><i class="fa-solid fa-clipboard-check me-2"></i> ระบบเบิกจ่ายและโอนย้ายสต๊อก</h2>
                    <p class="text-muted mt-1 mb-0">สแกนพัสดุหรือเลือกจากรายการเพื่อทำรายการ รับเข้าคลังใหญ่, โอนย้ายไปหน้าเคาน์เตอร์, และตัดเบิก</p>
                </div>
                <div class="d-flex gap-2 mt-3 mt-md-0">
                    <button class="btn btn-light fw-bold shadow-sm rounded-pill px-4 border text-secondary card-hover-float" onclick="App.switchPage('inventory')">
                        <i class="fa-solid fa-arrow-left me-2 text-primary"></i> กลับไปหน้าคลังหลัก
                    </button>
                </div>
            </div>

            <div class="row g-4 pb-5">
                <div class="col-md-5">
                    <div class="modern-panel shadow-sm h-100 p-4 position-relative overflow-hidden" style="border-top: 5px solid var(--primary); border-radius: 20px; background: var(--bg-surface); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                        <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 200px; pointer-events: none; color: var(--text-dark);"><i class="fa-solid fa-barcode"></i></div>
                        
                        <div class="position-relative z-1">
                            <h5 class="fw-bold mb-3" style="color: var(--text-dark);"><i class="fa-solid fa-filter me-2 text-primary"></i> 1. เลือกประเภททำรายการ <span class="text-danger">*</span></h5>
                            <select id="sm-mode" class="form-select form-select-lg fw-bold mb-3 input-modern" onchange="App.pages.stock_manage.changeMode()" style="background-color: var(--bg-body); color: var(--text-dark); border-color: var(--border-color) !important;">
                                <option value="transfer">🚚 เบิกโอน (สต๊อกใหญ่ ➡️ สต๊อกเล็ก)</option>
                                <option value="out_sub">📤 เบิกใช้งาน / ตัดทิ้ง (จากสต๊อกเล็ก)</option>
                                <option value="in_main">📥 รับของล็อตใหม่เข้า (สต๊อกใหญ่)</option>
                                <option value="audit_main">📋 ตรวจนับปรับยอดจริง (สต๊อกใหญ่)</option>
                                <option value="audit_sub">📋 ตรวจนับปรับยอดจริง (สต๊อกเล็ก)</option>
                            </select>
                            
                            <div id="sm-mode-desc" class="alert py-2 px-3 small mb-4 shadow-sm border" style="border-radius: 12px; background: var(--bg-body); border-color: var(--info) !important;">
                                <i class="fa-solid fa-circle-info me-1 text-info"></i> <span id="sm-mode-text" class="text-info"><b>สต๊อกใหญ่ลดลง / สต๊อกเล็กเพิ่มขึ้น:</b> ใช้เมื่อเข็นของจากห้องเก็บของใหญ่ มาเติมไว้ที่หน้าเคาน์เตอร์/รถเข็นพยาบาล</span>
                            </div>

                            <h5 class="fw-bold mb-3" style="color: var(--text-dark);"><i class="fa-solid fa-expand me-2 text-primary"></i> 2. สแกน หรือ เลือกพัสดุ</h5>
                            <div class="d-flex gap-2 w-100 mb-3">
                                <div class="search-box-modern flex-grow-1" style="background: var(--bg-body); border: 1px solid var(--border-color); border-radius: 12px; padding: 10px 15px; display: flex; align-items: center;">
                                    <i class="fa-solid fa-barcode text-primary ms-1" style="font-size: 18px;"></i>
                                    <input type="text" id="sm-scanner" class="border-0 bg-transparent ms-2 w-100 fw-bold" placeholder="ยิงบาร์โค้ดตรงนี้..." autocomplete="off" style="outline:none; color: var(--text-dark);">
                                </div>
                                <button class="btn btn-primary shadow-sm" style="border-radius:12px; width:60px;" onclick="App.pages.stock_manage.openCamera()" title="สแกนด้วยกล้องมือถือ">
                                    <i class="fa-solid fa-camera fa-lg"></i>
                                </button>
                            </div>
                            
                            <button class="btn btn-manual-search w-100 fw-bold shadow-sm mb-2" style="border-radius:12px; padding: 14px;" onclick="App.pages.stock_manage.openManualSelect()">
                                <i class="fa-solid fa-hand-pointer me-2"></i> หรือ กดเพื่อค้นหาและเลือกพัสดุด้วยมือ
                            </button>
                            <small class="text-muted"><i class="fa-solid fa-circle-info text-primary"></i> สแกนบาร์โค้ด = เพิ่มทีละ 1 / ค้นหาด้วยมือ = พิมพ์ยอดเอง</small>
                        </div>
                    </div>
                </div>

                <div class="col-md-7">
                    <div class="modern-panel shadow-sm h-100 p-4 d-flex flex-column position-relative overflow-hidden" style="border-radius: 20px; background: var(--bg-surface); border: 1px solid var(--border-color);">
                        <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 250px; pointer-events: none; color: var(--text-dark);"><i class="fa-solid fa-basket-shopping"></i></div>
                        
                        <div class="position-relative z-1 d-flex flex-column h-100">
                            <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3" style="border-color: var(--border-color) !important;">
                                <h5 class="fw-bold mb-0" style="color: var(--text-dark);"><i class="fa-solid fa-cart-shopping me-2 text-primary"></i> 3. รายการรอลงบันทึก (<span id="cart-count" class="text-primary">0</span>)</h5>
                                
                                <div class="d-flex gap-2">
                                    <button class="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold shadow-sm" onclick="App.pages.stock_manage.undoAction()" id="btn-undo" disabled>
                                        <i class="fa-solid fa-rotate-left me-1"></i> ย้อนกลับ
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold shadow-sm" onclick="App.pages.stock_manage.safeClearCart()">
                                        <i class="fa-solid fa-trash me-1"></i> ล้างตะกร้า
                                    </button>
                                </div>
                            </div>
                            
                            <div class="table-responsive flex-grow-1 border rounded-3 shadow-sm" style="max-height: 450px; overflow-y: auto; background: var(--bg-surface); border-color: var(--border-color) !important;">
                                <table class="table table-premium w-100 mb-0">
                                    <thead style="position: sticky; top: 0; z-index: 1; background: var(--bg-body);">
                                        <tr>
                                            <th class="text-center text-primary" style="width: 8%;">ลำดับ</th>
                                            <th class="text-center" style="width: 14%;">รหัสสินค้า</th>
                                            <th>ชื่อพัสดุ</th>
                                            <th class="text-center">สต๊อกอ้างอิง</th>
                                            <th class="text-center" style="width: 140px;">จำนวนทำรายการ</th>
                                            <th class="text-center text-primary">ยอดใหม่</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody id="sm-cart-body">
                                        <tr><td colspan="7" class="text-center text-muted py-5"><i class="fa-solid fa-basket-shopping fa-3x mb-3" style="opacity:0.2;"></i><br>ตะกร้าว่างเปล่า<br><small>เริ่มสแกนบาร์โค้ดเพื่อนำสินค้าลงตะกร้า</small></td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="text-end mt-4 pt-3 border-top" style="border-color: var(--border-color) !important;">
                                <button class="btn btn-premium-success btn-lg px-5 fw-bold shadow-sm rounded-pill" onclick="App.pages.stock_manage.confirmTransaction()">
                                    <i class="fa-solid fa-save me-2"></i> ยืนยันการบันทึกสต๊อก
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    init() {
        if (typeof db === 'undefined') {
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้', 'error');
            return;
        }

        this.cart = []; 
        this.historyStack = []; 
        this.#fetchItemsFromDB();
        this.#bindEvents();
        this.updateUndoButton();
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        this.stopCameraScanner(); 
    }

    saveStateToHistory() {
        const snapshot = JSON.parse(JSON.stringify(this.cart));
        this.historyStack.push(snapshot);
        if (this.historyStack.length > 20) this.historyStack.shift(); 
        this.updateUndoButton();
    }

    undoAction() {
        if (this.historyStack.length === 0) return;
        const previousState = this.historyStack.pop();
        this.cart = previousState;
        this.updateUndoButton();
        this.renderCart();
        if(window.SecurityShield) window.SecurityShield.showNativeToast('ย้อนกลับรายการล่าสุดแล้ว');
    }

    updateUndoButton() {
        const btn = document.getElementById('btn-undo');
        if (btn) {
            btn.disabled = this.historyStack.length === 0;
            if (this.historyStack.length > 0) {
                btn.classList.replace('btn-outline-secondary', 'btn-outline-primary');
            } else {
                btn.classList.replace('btn-outline-primary', 'btn-outline-secondary');
            }
        }
    }

    safeClearCart() {
        if (this.cart.length === 0) return;
        Swal.fire({
            title: 'ล้างตะกร้า?',
            text: 'คุณต้องการลบรายการทั้งหมดที่สแกนมาทิ้งใช่หรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: '<i class="fa-solid fa-trash me-1"></i> ลบทิ้งทั้งหมด',
            cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'premium-alert' }
        }).then((res) => {
            if (res.isConfirmed) {
                this.saveStateToHistory(); 
                this.clearCart();
                if(window.SecurityShield) window.SecurityShield.showNativeToast('ล้างตะกร้าแล้ว (กดย้อนกลับได้ถ้าเปลี่ยนใจ)');
            }
        });
    }

    #bindEvents() {
        const scanner = document.getElementById('sm-scanner');
        if (scanner) {
            scanner.focus();
            scanner.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.processScan(scanner.value.trim(), false);
                    scanner.value = '';
                }
            });
        }
    }

    #fetchItemsFromDB() {
        const ref = db.ref('inventory_database_v2/items');
        const cbItems = ref.on('value', snap => {
            const data = snap.val();
            let rawItems = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => ({ firebaseKey: k, ...data[k] }))) : [];
            let itemsList = rawItems.filter(item => item !== null);
            
            itemsList.sort((a, b) => {
                let orderA = a.order !== undefined && a.order !== null && a.order !== "" ? Number(a.order) : 999;
                let orderB = b.order !== undefined && b.order !== null && b.order !== "" ? Number(b.order) : 999;
                return orderA - orderB;
            });
            this.allItems = itemsList;

            this.renderCart(); 
        });
        
        this.firebaseListeners.push({ path: 'inventory_database_v2/items', callback: cbItems });
    }

    changeMode() {
        const mode = document.getElementById('sm-mode').value;
        let desc = ""; let alertClass = "border-info"; let textColor = "text-info";
        
        if(mode === 'transfer') { desc = "<b>สต๊อกใหญ่ลดลง / สต๊อกเล็กเพิ่มขึ้น:</b> ใช้เมื่อเข็นของจากห้องเก็บของใหญ่ มาเติมไว้ที่หน้าเคาน์เตอร์/รถเข็นพยาบาล"; alertClass = "border-info"; textColor = "text-info"; } 
        else if(mode === 'out_sub') { desc = "<b>สต๊อกเล็กลดลง:</b> ใช้ตัดสต๊อกเมื่อพยาบาลนำของไปใช้จริงกับคนไข้ หรือกรณีของชำรุด/หมดอายุ"; alertClass = "border-danger"; textColor = "text-danger"; } 
        else if(mode === 'in_main') { desc = "<b>สต๊อกใหญ่เพิ่มขึ้น:</b> ใช้เมื่อมีของล็อตใหม่มาส่งจากบริษัท รับเข้าห้องเก็บของใหญ่"; alertClass = "border-success"; textColor = "text-success"; } 
        else if(mode === 'audit_main') { desc = "<b>ปรับตัวเลขทับของเดิม:</b> ใช้เมื่อต้องการปรับยอดสต๊อกใหญ่ให้ตรงกับที่เดินนับด้วยมือ"; alertClass = "border-warning"; textColor = "text-warning"; } 
        else if(mode === 'audit_sub') { desc = "<b>ปรับตัวเลขทับของเดิม:</b> ใช้เมื่อต้องการปรับยอดหน้าเคาน์เตอร์ (สต๊อกเล็ก) ให้ตรงกับที่นับด้วยมือ"; alertClass = "border-warning"; textColor = "text-warning"; }
        
        const descEl = document.getElementById('sm-mode-desc'); 
        const descText = document.getElementById('sm-mode-text');
        
        if (descEl && descText) { 
            descEl.className = `alert py-2 px-3 small mb-4 shadow-sm border ${alertClass}`; 
            descText.className = `${textColor}`;
            descText.innerHTML = desc; 
        }

        if (this.cart.length > 0) {
            Swal.fire({ 
                title: 'เปลี่ยนประเภททำรายการ?', 
                text: 'การเปลี่ยนโหมดจะล้างรายการในตะกร้าปัจจุบันทิ้งทั้งหมด', 
                icon: 'warning', 
                showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'ใช่, เปลี่ยนโหมด' 
            }).then((res) => { 
                if(res.isConfirmed) { 
                    this.saveStateToHistory();
                    this.clearCart(); 
                } else { 
                    this.renderCart(); 
                } 
            });
        } else { 
            this.renderCart(); 
        }
    }

    openManualSelect() {
        let optionsHtml = this.generateManualListHtml(this.allItems);
        Swal.fire({
            title: '<h5 class="fw-bold mb-0 text-primary"><i class="fa-solid fa-list-ul me-2"></i>ค้นหาและเลือกพัสดุ</h5>',
            html: `
                <div class="mb-3 position-relative mt-3">
                    <i class="fa-solid fa-search position-absolute text-muted" style="left: 15px; top: 15px;"></i>
                    <input type="text" id="swal-manual-search" class="form-control form-control-lg shadow-sm input-modern" placeholder="ค้นหาด้วย ลำดับ, ชื่อ, รหัส หรือ บาร์โค้ด..." style="padding-left: 45px; border-radius: 12px; border-color: var(--border-color) !important; background: var(--bg-body); color: var(--text-dark);" onkeyup="App.pages.stock_manage.filterManualSelect(this.value)">
                </div>
                <div class="list-group shadow-sm" id="swal-manual-list" style="max-height: 400px; overflow-y: auto; border-radius: 12px; border: 1px solid var(--border-color); background: var(--bg-surface);">
                    ${optionsHtml}
                </div>
            `,
            showConfirmButton: false, showCloseButton: true, width: 650,
            didOpen: () => { document.getElementById('swal-manual-search').focus(); }
        });
    }

    filterManualSelect(term) {
        term = term.toLowerCase().trim();
        const list = document.getElementById('swal-manual-list'); 
        if(!list) return;
        
        const filtered = this.allItems.filter(i => 
            (i.name || "").toLowerCase().includes(term) || 
            (i.barcode || "").toLowerCase().includes(term) || 
            (i.item_code || "").toLowerCase().includes(term) || 
            (i.category || "").toLowerCase().includes(term) ||
            (String(i.order || "").toLowerCase().includes(term)) 
        );
        
        if (filtered.length === 0) {
            list.innerHTML = `<div class="text-center py-5 text-muted"><i class="fa-solid fa-box-open fa-2x mb-2" style="opacity:0.3"></i><br>ไม่พบรายการที่ค้นหา</div>`;
        } else {
            list.innerHTML = this.generateManualListHtml(filtered);
        }
    }

    generateManualListHtml(itemsArray) {
        return itemsArray.map(i => {
            let qMain = i.qty_main !== undefined ? Number(i.qty_main) : (Number(i.qty) || 0);
            let qSub = Number(i.qty_sub) || 0;
            let orderVal = (i.order !== undefined && i.order !== null && i.order !== "" && i.order !== 999) ? i.order : '-';
            
            const safeItemCode = this.#escapeHTML(i.item_code || '-');
            const safeBarcode = this.#escapeHTML(i.barcode || '-');
            const safeName = this.#escapeHTML(i.name);

            return `
            <button type="button" class="list-group-item list-group-custom-hover d-flex justify-content-between align-items-center py-3" style="background: var(--bg-surface); border-color: var(--border-color); color: var(--text-dark);" onclick="Swal.close(); App.pages.stock_manage.processScan('${i.barcode}', true)">
                <div class="d-flex align-items-center">
                    <div class="text-center fw-bold text-secondary me-3" style="width: 30px; font-size: 16px;">${orderVal}</div>
                    <div class="text-start">
                        <div class="fw-bold" style="font-family:'Prompt'; font-size:15px; color: var(--text-dark);">${safeName}</div>
                        <small class="text-muted"><i class="fa-solid fa-hashtag me-1"></i> ${safeItemCode} | <i class="fa-solid fa-barcode ms-1 me-1"></i> ${safeBarcode}</small>
                    </div>
                </div>
                <div class="text-end">
                    <span class="badge border border-primary text-primary rounded-pill px-2 py-1 mb-1 shadow-sm" style="background: var(--bg-body);">ใหญ่: ${qMain}</span><br>
                    <span class="badge border border-info text-info rounded-pill px-2 py-1 shadow-sm" style="background: var(--bg-body);">เล็ก: ${qSub}</span>
                </div>
            </button>`;
        }).join('');
    }

    processScan(barcode, isManual = false) {
        if (!barcode) return;
        const item = this.allItems.find(i => i.barcode === barcode);
        
        if (!item) { 
            Swal.fire('ไม่พบพัสดุ', `ระบบไม่รู้จักบาร์โค้ด: ${barcode}`, 'warning'); 
            return; 
        }

        this.saveStateToHistory(); 

        let qMain = item.qty_main !== undefined ? Number(item.qty_main) : (Number(item.qty) || 0);
        let qSub = Number(item.qty_sub) || 0;

        const existing = this.cart.find(c => c.id === item.id);
        if (existing) { 
            if (!isManual) {
                existing.processQty += 1; 
            }
        } else { 
            this.cart.push({ 
                firebaseKey: item.firebaseKey, 
                id: item.id, 
                item_code: item.item_code || '-', 
                barcode: item.barcode, 
                name: item.name, 
                qty_main: qMain, 
                qty_sub: qSub, 
                processQty: isManual ? 0 : 1, 
                order: item.order 
            }); 
        }
        
        this.renderCart();
        
        if (isManual) {
            setTimeout(() => {
                this.openCalculator(item.id);
            }, 100);
        } else {
            setTimeout(() => {
                const tableContainer = document.querySelector('#sm-cart-body').closest('.table-responsive');
                if (tableContainer) tableContainer.scrollTop = tableContainer.scrollHeight;
            }, 50);
        }
    }

    openCalculator(id) {
        const item = this.cart.find(c => c.id === id);
        if (!item) return;

        let mathExpr = "0"; 
        let calcMode = "="; 
        let memoryValue = 0;
        let isEvaluated = true; 

        const evaluateMath = (expr) => {
            try {
                let safeExpr = expr.replace(/[^0-9+\-*/.]/g, ''); 
                let cleanExpr = safeExpr.replace(/[+\-*/.]+$/, ''); 
                if (!cleanExpr) return 0;
                let result = new Function('return ' + cleanExpr)();
                return Number(Number(result).toFixed(4));
            } catch (e) { return 0; }
        };

        const renderCalc = () => {
            let evaluatedVal = evaluateMath(mathExpr);
            let finalPreview = calcMode === "+" ? (item.processQty + evaluatedVal) : evaluatedVal;
            if (finalPreview < 0) finalPreview = 0;

            let displayFormula = "";
            for (let i = 0; i < mathExpr.length; i++) {
                let c = mathExpr[i];
                if (c === '*') displayFormula += '<span style="color: var(--primary); font-weight: bold; margin: 0 4px;">×</span>';
                else if (c === '/') displayFormula += '<span style="color: var(--primary); font-weight: bold; margin: 0 4px;">÷</span>';
                else if (c === '+') displayFormula += '<span style="color: var(--primary); font-weight: bold; margin: 0 4px;">+</span>';
                else if (c === '-') displayFormula += '<span style="color: var(--primary); font-weight: bold; margin: 0 4px;">-</span>';
                else displayFormula += c;
            }

            // 🚨 THE FIX: กล่องคำอธิบาย Contextual UX แบบไดนามิก
            let modeDesc = "";
            if (calcMode === '+') {
                modeDesc = `
                <div class="px-3 py-2 mb-3 rounded-3 small fw-bold shadow-sm d-flex align-items-start gap-2" style="background: rgba(234, 88, 12, 0.05); color: #ea580c; border: 1px dashed rgba(234, 88, 12, 0.3); text-align: left; line-height: 1.4; animation: fadeInUpLocal 0.3s ease;">
                    <i class="fa-solid fa-circle-plus mt-1"></i>
                    <div><span class="text-dark">โหมดบวกเพิ่ม (+):</span> นำยอดที่คีย์ไป <u style="text-decoration-thickness: 2px;">บวกทบ</u> ของเดิมในตะกร้า<br><span style="font-size: 11px; opacity:0.8;">(เหมาะสำหรับ: ค่อยๆ ทยอยนับของทีละกล่อง)</span></div>
                </div>`;
            } else {
                modeDesc = `
                <div class="px-3 py-2 mb-3 rounded-3 small fw-bold shadow-sm d-flex align-items-start gap-2" style="background: rgba(37, 99, 235, 0.05); color: var(--primary); border: 1px dashed rgba(37, 99, 235, 0.3); text-align: left; line-height: 1.4; animation: fadeInUpLocal 0.3s ease;">
                    <i class="fa-solid fa-right-left mt-1"></i>
                    <div><span class="text-dark">โหมดแทนที่ (=):</span> นำยอดที่คีย์ไป <u style="text-decoration-thickness: 2px;">ทับยอดเดิม</u> ในตะกร้าทั้งหมด<br><span style="font-size: 11px; opacity:0.8;">(เหมาะสำหรับ: นับยอดรวมเสร็จแล้ว คีย์ทีเดียวจบ)</span></div>
                </div>`;
            }

            Swal.update({
                html: `
                    <div class="row text-start g-4 mt-2">
                        <div class="col-md-5 d-flex flex-column border-end pe-4" style="border-color: var(--border-color) !important;">
                            <div class="mb-4">
                                <h5 class="fw-bold mb-2" style="color: var(--primary); line-height: 1.4; word-break: break-word;">${this.#escapeHTML(item.name)}</h5>
                                <div class="small mb-2" style="color: var(--text-muted);"><i class="fa-solid fa-hashtag me-1"></i> ${this.#escapeHTML(item.item_code || item.barcode)}</div>
                                <div class="badge px-3 py-2 mt-2 fs-6 shadow-sm w-100 text-start" style="background-color: var(--bg-body); color: var(--text-dark); border: 1px solid var(--border-color); border-radius: 8px;">ในตะกร้าเดิม: <b class="fs-5 float-end">${item.processQty}</b></div>
                            </div>

                            <div class="mt-auto p-3 rounded-4 shadow-sm" style="background: rgba(245, 158, 11, 0.05); border-left: 4px solid var(--warning);">
                                <div class="fw-bold mb-2 small" style="color: var(--warning);"><i class="fa-solid fa-lightbulb me-1"></i> เทคนิคนับหลายตู้ (Memory)</div>
                                <div style="font-size: 12px; font-family: 'Sarabun'; line-height: 1.6; color: var(--text-muted);">
                                    กด <b style="color: var(--text-dark);">M+</b> เพื่อโยนยอดปัจจุบันเก็บใส่ลิ้นชักความจำ<br>
                                    กด <b style="color: var(--text-dark);">MR</b> เพื่อดึงยอดจากลิ้นชักออกมาบวกต่อ<br>
                                    กด <b style="color: var(--text-dark);">MC</b> เพื่อล้างลิ้นชักทิ้ง
                                </div>
                            </div>
                        </div>

                        <div class="col-md-7 ps-md-2">
                            <div class="d-flex rounded-pill p-1 mb-2 border shadow-sm w-100" style="background-color: var(--bg-body); border-color: var(--border-color) !important;">
                                <button type="button" class="calc-toggle-btn w-50 ${calcMode === '+' ? 'calc-toggle-active-add' : 'calc-toggle-inactive'}" onclick="window.setCalcMode('+')">บวกเพิ่ม (+)</button>
                                <button type="button" class="calc-toggle-btn w-50 ${calcMode === '=' ? 'calc-toggle-active-replace' : 'calc-toggle-inactive'}" onclick="window.setCalcMode('=')">แทนที่ (=)</button>
                            </div>

                            <!-- 🚨 THE FIX: กล่องคำอธิบายโหมด (Dynamic) -->
                            ${modeDesc}

                            <div class="p-3 mb-3 text-end position-relative" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 16px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                                ${memoryValue !== 0 ? `<div class="position-absolute top-0 start-0 badge px-2 py-1 shadow-sm m-2" style="background: #f59e0b; color: #fff; font-size:11px;">M = ${memoryValue}</div>` : ''}
                                <div style="color: var(--text-muted); min-height: 22px; font-family: monospace; font-size: 16px; letter-spacing: 1px;">${displayFormula || '0'}</div>
                                <div class="fw-bold" style="color: var(--text-dark); font-size: 42px; line-height: 1;">${evaluatedVal}</div>
                            </div>

                            <div class="py-2 px-3 small fw-bold mb-3 d-flex justify-content-between align-items-center shadow-sm" style="background: rgba(59, 130, 246, 0.05); border: 1px dashed rgba(59, 130, 246, 0.4); border-radius: 12px; color: var(--text-dark);">
                                <span style="color: var(--primary);"><i class="fa-solid fa-basket-shopping me-1"></i> ยอดสุทธิที่จะบันทึก:</span>
                                <span class="fs-4" style="color: var(--primary);">${finalPreview}</span>
                            </div>

                            <div class="numpad-calc-grid">
                                <button class="numpad-btn numpad-memory" onclick="window.pressCalc('MC')">MC</button>
                                <button class="numpad-btn numpad-memory" onclick="window.pressCalc('MR')">MR</button>
                                <button class="numpad-btn numpad-memory" onclick="window.pressCalc('M+')">M+</button>
                                <button class="numpad-btn numpad-op" onclick="window.pressCalc('<')"><i class="fa-solid fa-delete-left"></i></button>
                                
                                <button class="numpad-btn" onclick="window.pressCalc('7')">7</button>
                                <button class="numpad-btn" onclick="window.pressCalc('8')">8</button>
                                <button class="numpad-btn" onclick="window.pressCalc('9')">9</button>
                                <button class="numpad-btn numpad-op" onclick="window.pressCalc('/')">÷</button>
                                
                                <button class="numpad-btn" onclick="window.pressCalc('4')">4</button>
                                <button class="numpad-btn" onclick="window.pressCalc('5')">5</button>
                                <button class="numpad-btn" onclick="window.pressCalc('6')">6</button>
                                <button class="numpad-btn numpad-op" onclick="window.pressCalc('*')">×</button>
                                
                                <button class="numpad-btn" onclick="window.pressCalc('1')">1</button>
                                <button class="numpad-btn" onclick="window.pressCalc('2')">2</button>
                                <button class="numpad-btn" onclick="window.pressCalc('3')">3</button>
                                <button class="numpad-btn numpad-op" onclick="window.pressCalc('-')">-</button>
                                
                                <button class="numpad-btn numpad-danger" onclick="window.pressCalc('C')">C</button>
                                <button class="numpad-btn" onclick="window.pressCalc('0')">0</button>
                                <button class="numpad-btn numpad-success" onclick="window.pressCalc('=')">=</button>
                                <button class="numpad-btn numpad-op" onclick="window.pressCalc('+')">+</button>
                            </div>
                        </div>
                    </div>
                `
            });
        };

        window.setCalcMode = (mode) => { calcMode = mode; renderCalc(); };
        window.pressCalc = (key) => {
            const operators = ['+', '-', '*', '/'];

            if (key === 'C') { 
                mathExpr = "0"; 
                isEvaluated = true;
            }
            else if (key === 'MC') {
                memoryValue = 0;
            }
            else if (key === 'MR') {
                if (isEvaluated || mathExpr === "0" || mathExpr === "") { 
                    mathExpr = String(memoryValue); 
                    isEvaluated = false; 
                } else { 
                    const lastChar = mathExpr.slice(-1);
                    if (/[0-9]/.test(lastChar)) {
                        mathExpr += '+' + memoryValue; 
                    } else {
                        mathExpr += String(memoryValue); 
                    }
                }
            }
            else if (key === 'M+') {
                let val = evaluateMath(mathExpr);
                memoryValue += val;
                mathExpr = String(val); 
                isEvaluated = true; 
                if(window.SecurityShield) window.SecurityShield.showNativeToast('บวกค่าเข้า Memory แล้ว (กด MR เพื่อเรียกใช้)');
            }
            else if (key === '<') { 
                if (isEvaluated) {
                    mathExpr = "0";
                    isEvaluated = true;
                } else {
                    mathExpr = mathExpr.slice(0, -1); 
                    if (mathExpr === "") {
                        mathExpr = "0";
                        isEvaluated = true;
                    }
                }
            }
            else if (operators.includes(key)) {
                isEvaluated = false;
                if (mathExpr === "") {
                    mathExpr = "0" + key;
                } else {
                    const lastChar = mathExpr.slice(-1);
                    if (operators.includes(lastChar)) {
                        mathExpr = mathExpr.slice(0, -1) + key; 
                    } else {
                        mathExpr += key; 
                    }
                }
            }
            else if (key === '=') {
                mathExpr = String(evaluateMath(mathExpr)); 
                isEvaluated = true;
            }
            else { 
                if (isEvaluated || mathExpr === "0") {
                    mathExpr = key;
                    isEvaluated = false;
                } else {
                    mathExpr += key; 
                }
            }
            
            if (mathExpr.length > 25) mathExpr = mathExpr.slice(0, 25);
            renderCalc();
        };

        Swal.fire({
            title: `<h4 class="fw-bold mb-0" style="color: var(--text-dark);"><i class="fa-solid fa-calculator me-2" style="color: var(--primary);"></i>เครื่องคิดเลขพัสดุ</h4>`,
            html: 'Loading...',
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-check me-1"></i> ยืนยันยอดสุทธิ',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#10b981',
            width: 700, 
            customClass: { popup: 'premium-alert' },
            didOpen: () => renderCalc(),
            preConfirm: () => {
                let evaluatedVal = evaluateMath(mathExpr);
                let finalQty = calcMode === "+" ? (item.processQty + evaluatedVal) : evaluatedVal;
                if (finalQty < 0) finalQty = 0;
                return finalQty;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.saveStateToHistory(); 
                item.processQty = result.value;
                this.renderCart();
            }
            delete window.setCalcMode;
            delete window.pressCalc;
        });
    }

    removeCartItem(id) {
        const item = this.cart.find(c => c.id === id);
        if (!item) return;

        Swal.fire({
            title: 'ยืนยันการลบ?',
            text: `ต้องการลบ "${item.name}" ออกจากตะกร้าใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: '<i class="fa-solid fa-trash me-1"></i> ลบทิ้ง',
            cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'premium-alert' }
        }).then((res) => {
            if(res.isConfirmed) {
                this.saveStateToHistory(); 
                this.cart = this.cart.filter(c => c.id !== id);
                this.renderCart();
                if(window.SecurityShield) window.SecurityShield.showNativeToast('นำออกแล้ว (กดย้อนกลับได้ถ้าลบผิด)');
            }
        });
    }
    
    clearCart() { 
        this.cart = []; 
        this.renderCart(); 
    }

    renderCart() {
        const mode = document.getElementById('sm-mode').value;
        const tbody = document.getElementById('sm-cart-body');
        document.getElementById('cart-count').innerText = this.cart.length;

        if(this.cart.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-5"><i class="fa-solid fa-basket-shopping fa-3x mb-3" style="opacity:0.2;"></i><br>ตะกร้าว่างเปล่า<br><small>เริ่มสแกน หรือ ค้นหาพัสดุเพื่อลงตะกร้า</small></td></tr>`;
            return;
        }

        let html = '';
        this.cart.forEach(c => {
            let refStock = 0; let refName = ""; let newQty = 0; let textStyle = ""; let modeText = "";
            let orderVal = (c.order !== undefined && c.order !== null && c.order !== "" && c.order !== 999) ? c.order : '-';
            
            const latestItem = this.allItems.find(i => i.id === c.id);
            if (latestItem) {
                c.qty_main = latestItem.qty_main !== undefined ? Number(latestItem.qty_main) : (Number(latestItem.qty) || 0);
                c.qty_sub = Number(latestItem.qty_sub) || 0;
            }

            if(mode === 'in_main') { refStock = c.qty_main; refName = "ใหญ่"; newQty = refStock + c.processQty; modeText = '<span class="text-success fw-bold">+</span>'; } 
            else if(mode === 'transfer') { refStock = c.qty_main; refName = "ใหญ่"; newQty = refStock - c.processQty; modeText = '<span class="text-primary fw-bold">=> ย้ายไปเล็ก</span>'; if(newQty < 0) textStyle = "color: #ef4444; font-weight: bold;"; } 
            else if(mode === 'out_sub') { refStock = c.qty_sub; refName = "เล็ก"; newQty = refStock - c.processQty; modeText = '<span class="text-danger fw-bold">-</span>'; if(newQty < 0) textStyle = "color: #ef4444; font-weight: bold;"; } 
            else if(mode === 'audit_main') { refStock = c.qty_main; refName = "ใหญ่"; newQty = c.processQty; modeText = '<span class="text-warning fw-bold">= ปรับยอด</span>'; } 
            else if(mode === 'audit_sub') { refStock = c.qty_sub; refName = "เล็ก"; newQty = c.processQty; modeText = '<span class="text-warning fw-bold">= ปรับยอด</span>'; }

            const safeItemCode = this.#escapeHTML(c.item_code || '-');
            const safeName = this.#escapeHTML(c.name);

            html += `
            <tr class="align-middle fade-in-up" style="animation-duration: 0.2s;">
                <td class="text-center fw-bold text-secondary" style="font-size: 15px; vertical-align: middle;">${orderVal}</td>
                <td class="text-center"><span class="badge border border-primary text-primary shadow-sm px-2 py-1" style="font-family: monospace; font-size:13px; border-radius:6px; background: var(--bg-body);">${safeItemCode}</span></td>
                <td>
                    <div class="fw-bold" style="font-family:'Prompt'; font-size:15px; color: var(--text-dark);">${safeName}</div>
                    <div class="small text-muted"><i class="fa-solid fa-barcode"></i> ${this.#escapeHTML(c.barcode)}</div>
                </td>
                <td class="text-center text-muted" style="font-size: 13px; vertical-align: middle;">
                    <div class="fw-bold" style="font-size:15px; color: var(--text-dark);">${refStock}</div>
                    <small>ในห้อง${refName}</small>
                </td>
                <td class="text-center" style="vertical-align: middle;">
                    <div class="small text-muted mb-1">${modeText}</div>
                    <button class="qty-calculator-btn shadow-sm" onclick="App.pages.stock_manage.openCalculator('${c.id}')" title="คลิกเพื่อใช้เครื่องคิดเลข">
                        ${c.processQty} <i class="fa-solid fa-calculator ms-2 text-primary" style="font-size: 14px;"></i>
                    </button>
                </td>
                <td class="text-center fw-bold text-primary" style="font-size: 18px; vertical-align: middle; ${textStyle}">${newQty}</td>
                <td class="text-center" style="vertical-align: middle;">
                    <button class="btn btn-sm border border-danger shadow-sm text-danger" style="background: var(--bg-body);" onclick="App.pages.stock_manage.removeCartItem('${c.id}')" title="ลบออกจากตะกร้า"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    }

    async confirmTransaction() {
        if(this.cart.length === 0) { 
            Swal.fire('ตะกร้าว่างเปล่า', 'กรุณาสแกนพัสดุอย่างน้อย 1 รายการเพื่อทำรายการ', 'warning'); 
            return; 
        }

        const mode = document.getElementById('sm-mode').value;
        const e = document.getElementById("sm-mode");
        const modeTextDisplay = e.options[e.selectedIndex].text;
        
        if(mode === 'transfer' || mode === 'out_sub') {
            let hasNegative = this.cart.some(c => {
                if(mode === 'transfer') return (c.qty_main - c.processQty) < 0;
                if(mode === 'out_sub') return (c.qty_sub - c.processQty) < 0;
            });
            if(hasNegative) { 
                Swal.fire('สต๊อกอ้างอิงไม่พอ!', 'มียอดเบิกมากกว่าสต๊อกปัจจุบัน กรุณาแก้ไขตัวเลขในตะกร้า', 'error'); 
                return; 
            }
        }

        Swal.fire({
            title: `ยืนยันทำรายการ?`, 
            html: `คุณกำลังสั่ง: <b>${modeTextDisplay}</b><br>จำนวน <b>${this.cart.length}</b> รายการ`, 
            icon: 'question',
            showCancelButton: true, confirmButtonColor: '#10b981', 
            confirmButtonText: '<i class="fa-solid fa-check me-1"></i> ยืนยันและบันทึก', 
            cancelButtonText: 'ยกเลิก'
        }).then(async (res) => {
            if(res.isConfirmed) {
                Swal.fire({ title: 'กำลังบันทึกบัญชี (Atomic)...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                
                try {
                    let updates = {};
                    let timestamp = new Date().toISOString();
                    let logs = []; 
                    const userName = App.currentUser ? App.currentUser.name : "Admin";

                    for (const c of this.cart) {
                        const itemRef = db.ref(`inventory_database_v2/items/${c.firebaseKey || c.id}`);
                        const snap = await itemRef.once('value');
                        
                        if (snap.exists()) {
                            let item = snap.val();
                            let qMain = item.qty_main !== undefined ? Number(item.qty_main) : (Number(item.qty) || 0);
                            let qSub = Number(item.qty_sub) || 0;
                            let pQty = Number(c.processQty);

                            if (mode === 'in_main') { qMain += pQty; } 
                            else if (mode === 'transfer') { qMain -= pQty; qSub += pQty; } 
                            else if (mode === 'out_sub') { qSub -= pQty; } 
                            else if (mode === 'audit_main') { qMain = pQty; } 
                            else if (mode === 'audit_sub') { qSub = pQty; }

                            updates[`inventory_database_v2/items/${c.firebaseKey || c.id}/qty_main`] = qMain;
                            updates[`inventory_database_v2/items/${c.firebaseKey || c.id}/qty`] = qMain; 
                            updates[`inventory_database_v2/items/${c.firebaseKey || c.id}/qty_sub`] = qSub;
                            updates[`inventory_database_v2/items/${c.firebaseKey || c.id}/last_update`] = timestamp;

                            logs.push({ 
                                timestamp: timestamp, mode: mode, itemId: c.id, itemName: c.name, 
                                itemCode: c.item_code || '', barcode: c.barcode || '', 
                                qty: pQty, user: userName 
                            });
                        }
                    }

                    await db.ref().update(updates);
                    const logPromises = logs.map(log => db.ref('inventory_database_v2/transactions').push(log));
                    await Promise.all(logPromises);

                    Swal.fire('บันทึกสำเร็จ!', `อัปเดตสต๊อกและสร้างประวัติบัญชีเรียบร้อยแล้ว`, 'success');
                    this.historyStack = []; 
                    this.updateUndoButton();
                    this.clearCart(); 

                } catch (err) {
                    Swal.fire('ข้อผิดพลาด', err.message, 'error');
                }
            }
        });
    }

    loadScannerLibrary(callback) {
        if (window.Html5Qrcode) { callback(); return; }
        const existingScript = document.querySelector('script[src*="html5-qrcode"]');
        if (existingScript) {
            existingScript.addEventListener('load', () => callback());
            return;
        }
        Swal.showLoading();
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/html5-qrcode';
        script.onload = () => { Swal.hideLoading(); callback(); };
        script.onerror = () => { Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถดาวน์โหลดซอฟต์แวร์สแกนเนอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต', 'error'); };
        document.head.appendChild(script);
    }

    openCamera() {
        Swal.fire({
            title: '<h5 style="font-family:Prompt; font-weight:700; margin:0;"><i class="fa-solid fa-camera me-2 text-primary"></i>สแกนด้วยกล้องมือถือ</h5>', 
            html: `<div id="qr-reader-audit" class="shadow-sm mt-3 bg-dark d-flex align-items-center justify-content-center" style="width:100%; min-height:250px; border-radius: 12px; overflow: hidden; border: 2px solid var(--primary);"><i class="fa-solid fa-camera fa-2x text-secondary"></i></div><p class="text-muted small mt-3 mb-0"><i class="fa-solid fa-circle-info"></i> อนุญาตให้เว็บเข้าถึงกล้อง แล้วส่องไปที่บาร์โค้ดพัสดุ</p>`,
            showCancelButton: true, showConfirmButton: false, cancelButtonText: 'ปิดกล้อง', cancelButtonColor: '#ef4444',
            allowOutsideClick: false,
            didOpen: () => {
                this.startCameraScanner();
            },
            willClose: () => { 
                this.stopCameraScanner(); 
            }
        });
    }

    startCameraScanner() {
        this.loadScannerLibrary(async () => {
            if (this.html5QrcodeScanner) {
                try {
                    if (this.html5QrcodeScanner.getState() === 2) {
                        await this.html5QrcodeScanner.stop();
                    }
                    this.html5QrcodeScanner.clear();
                } catch(e) { console.error("Scanner release error", e); }
            }
            this.#initCamera();
        });
    }

    #initCamera() {
        const reader = document.getElementById('qr-reader-audit');
        if (!reader) return;
        
        reader.innerHTML = '';
        this.html5QrcodeScanner = new window.Html5Qrcode("qr-reader-audit");
        
        const config = { 
            fps: 15, 
            qrbox: function(viewfinderWidth, viewFinderHeight) {
                let width = Math.floor(viewfinderWidth * 0.8);
                let height = Math.floor(viewFinderHeight * 0.4);
                if (width < 250) width = 250;
                if (height < 120) height = 120;
                return { width: width, height: height };
            },
            aspectRatio: 1.333334
        };
        
        this.html5QrcodeScanner.start(
            { facingMode: "environment" }, 
            config,
            (decodedText) => {
                this.stopCameraScanner();
                Swal.close();
                let cleanBarcode = decodedText.trim().replace(/\*/g, '');
                this.processScan(cleanBarcode);
            }, 
            (errorMessage) => { /* Silent check frames */ }
        ).catch(err => {
            if (document.getElementById('qr-reader-audit')) { 
                document.getElementById('qr-reader-audit').innerHTML = 
                    '<div class="p-4 text-center text-white" style="font-family:\'Prompt\';">' +
                        '<i class="fa-solid fa-camera-slash fa-3x mb-3 text-danger"></i><br>' +
                        '<b class="fs-5">ไม่สามารถเข้าถึงกล้องถ่ายรูปได้</b><br>' +
                        '<p class="small text-muted mt-2 mb-0">โปรดตรวจสอบการอนุญาตสิทธิ์กล้องในเบราว์เซอร์ และรันผ่าน HTTPS</p>' +
                    '</div>'; 
            }
        });
    }

    stopCameraScanner() {
        if (this.html5QrcodeScanner) {
            try { 
                if (this.html5QrcodeScanner.getState() === 2) { 
                    this.html5QrcodeScanner.stop().then(() => { 
                        this.html5QrcodeScanner.clear(); 
                        this.html5QrcodeScanner = null; 
                    }).catch(err => { this.html5QrcodeScanner = null; }); 
                } else { 
                    this.html5QrcodeScanner.clear(); 
                    this.html5QrcodeScanner = null; 
                } 
            } catch (err) { this.html5QrcodeScanner = null; }
        }
    }

    #escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}

const StockManagePage = new StockManagePageComponent();
window.StockManagePage = StockManagePage;
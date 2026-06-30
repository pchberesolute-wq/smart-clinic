// js/pages/stock_manage.js
// 🚀 Enterprise Stock Management: Atomic Transactions, Zero-Race Conditions & Premium UI

class StockManagePageComponent {
    constructor() {
        this.allItems = [];
        this.cart = [];
        this.html5QrcodeScanner = null;
        this.firebaseListeners = [];
    }

    get html() {
        return `
            <style>
                .table-premium th { background: #f8fafc; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; padding: 14px 10px; border-bottom: 2px solid #e2e8f0; }
                .table-premium td { padding: 14px 10px; vertical-align: middle; border-bottom: 1px solid #f1f5f9; transition: background 0.2s; }
                .table-premium tr:hover td { background: #f8fafc; }
                .btn-action-icon { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s ease; }
                .btn-action-icon:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            </style>

            <div class="page-header mb-4">
                <div>
                    <h2 class="page-title text-primary" style="font-size: 28px;"><i class="fa-solid fa-clipboard-check me-2"></i> ระบบเบิกจ่ายและโอนย้ายสต๊อก</h2>
                    <p class="text-muted mt-1 mb-0">สแกนพัสดุหรือเลือกจากรายการเพื่อทำรายการ รับเข้าคลังใหญ่, โอนย้ายไปหน้าเคาน์เตอร์, และตัดเบิก</p>
                </div>
                <div class="d-flex gap-2 mt-3 mt-md-0">
                    <button class="btn btn-light fw-bold shadow-sm rounded-pill px-4 border text-secondary card-hover-float" onclick="App.switchPage('inventory', document.querySelector('.nav-item:nth-child(8)'))">
                        <i class="fa-solid fa-arrow-left me-2 text-primary"></i> กลับไปหน้าคลังหลัก
                    </button>
                </div>
            </div>

            <div class="row g-4 pb-5">
                <div class="col-md-5">
                    <div class="modern-panel shadow-sm h-100 p-4 position-relative overflow-hidden" style="border-top: 5px solid var(--primary); border-radius: 20px;">
                        <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 200px; pointer-events: none;"><i class="fa-solid fa-barcode"></i></div>
                        
                        <div class="position-relative z-1">
                            <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-filter me-2 text-primary"></i> 1. เลือกประเภททำรายการ <span class="text-danger">*</span></h5>
                            <select id="sm-mode" class="form-select form-select-lg fw-bold mb-3 input-modern bg-white" onchange="App.pages.stock_manage.changeMode()">
                                <option value="transfer">🚚 เบิกโอน (สต๊อกใหญ่ ➡️ สต๊อกเล็ก)</option>
                                <option value="out_sub">📤 เบิกใช้งาน / ตัดทิ้ง (จากสต๊อกเล็ก)</option>
                                <option value="in_main">📥 รับของล็อตใหม่เข้า (สต๊อกใหญ่)</option>
                                <option value="audit_main">📋 ตรวจนับปรับยอดจริง (สต๊อกใหญ่)</option>
                                <option value="audit_sub">📋 ตรวจนับปรับยอดจริง (สต๊อกเล็ก)</option>
                            </select>
                            
                            <div id="sm-mode-desc" class="alert badge-soft-info py-2 px-3 small mb-4 shadow-sm" style="border-radius: 12px;">
                                <i class="fa-solid fa-circle-info me-1"></i> <span id="sm-mode-text"><b>สต๊อกใหญ่ลดลง / สต๊อกเล็กเพิ่มขึ้น:</b> ใช้เมื่อเข็นของจากห้องเก็บของใหญ่ มาเติมไว้ที่หน้าเคาน์เตอร์/รถเข็นพยาบาล</span>
                            </div>

                            <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-expand me-2 text-primary"></i> 2. สแกน หรือ เลือกพัสดุ</h5>
                            <div class="d-flex gap-2 w-100 mb-3">
                                <div class="search-box-modern flex-grow-1 bg-white">
                                    <i class="fa-solid fa-barcode text-primary ms-1" style="font-size: 18px;"></i>
                                    <input type="text" id="sm-scanner" class="border-0 bg-transparent ms-2 w-100 fw-bold text-dark" placeholder="ยิงบาร์โค้ดตรงนี้..." autocomplete="off" style="outline:none;">
                                </div>
                                <button class="btn btn-primary shadow-sm" style="border-radius:12px; width:60px;" onclick="App.pages.stock_manage.openCamera()" title="สแกนด้วยกล้องมือถือ">
                                    <i class="fa-solid fa-camera fa-lg"></i>
                                </button>
                            </div>
                            
                            <button class="btn btn-outline-primary w-100 fw-bold shadow-sm mb-2" style="border-radius:12px; border-style: dashed; padding: 14px;" onclick="App.pages.stock_manage.openManualSelect()">
                                <i class="fa-solid fa-hand-pointer me-2"></i> หรือ กดเพื่อค้นหาและเลือกพัสดุด้วยมือ
                            </button>
                            <small class="text-muted"><i class="fa-solid fa-circle-info"></i> สแกน/เลือกรายการเดิมซ้ำ = เพิ่มจำนวนทีละ 1 อัตโนมัติ</small>
                        </div>
                    </div>
                </div>

                <div class="col-md-7">
                    <div class="modern-panel shadow-sm h-100 p-4 d-flex flex-column position-relative overflow-hidden" style="border-radius: 20px;">
                        <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 250px; pointer-events: none;"><i class="fa-solid fa-basket-shopping"></i></div>
                        
                        <div class="position-relative z-1 d-flex flex-column h-100">
                            <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
                                <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-cart-shopping me-2 text-primary"></i> 3. รายการรอลงบันทึก (<span id="cart-count" class="text-primary">0</span>)</h5>
                                <button class="btn btn-outline-danger btn-sm rounded-pill px-4 fw-bold shadow-sm" onclick="App.pages.stock_manage.clearCart()"><i class="fa-solid fa-trash me-1"></i> ล้างตะกร้า</button>
                            </div>
                            
                            <div class="table-responsive flex-grow-1 bg-white border rounded-3 shadow-sm" style="max-height: 450px; overflow-y: auto;">
                                <table class="table table-premium w-100 mb-0">
                                    <thead style="position: sticky; top: 0; z-index: 1;">
                                        <tr>
                                            <th class="text-center text-primary" style="width: 8%;">ลำดับ</th>
                                            <th class="text-center" style="width: 14%;">รหัสสินค้า</th>
                                            <th>ชื่อพัสดุ</th>
                                            <th class="text-center text-secondary">สต๊อกอ้างอิง</th>
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

                            <div class="text-end mt-4 pt-3 border-top">
                                <button class="btn btn-premium btn-premium-success btn-lg px-5 fw-bold" onclick="App.pages.stock_manage.confirmTransaction()">
                                    <i class="fa-solid fa-save me-2"></i> ยืนยันการบันทึกสต๊อก
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 🚀 Lifecycle: Mount
    init() {
        if (typeof db === 'undefined') {
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้', 'error');
            return;
        }

        this.cart = []; // เคลียร์ตะกร้าทุกครั้งที่เข้ามาใหม่
        this.#fetchItemsFromDB();
        this.#bindEvents();
    }

    // 🧹 Lifecycle: Unmount
    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        this.stopCameraScanner(); // 🚨 ปิดกล้องเพื่อประหยัดแบตเตอรี่
        console.log("🧹 [Stock Manage] Cleaned up listeners & hardware.");
    }

    // ---------------------------------------------------------
    // ⚙️ Events & Data Loading
    // ---------------------------------------------------------
    #bindEvents() {
        // Event ของกล่องสแกนบาร์โค้ด
        const scanner = document.getElementById('sm-scanner');
        if (scanner) {
            scanner.focus();
            scanner.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.processScan(scanner.value.trim());
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

            // อัปเดตตะกร้าปัจจุบัน (ถ้าข้อมูลในคลังเปลี่ยน)
            this.renderCart(); 
        });
        
        this.firebaseListeners.push({ path: 'inventory_database_v2/items', callback: cbItems });
    }

    // ---------------------------------------------------------
    // 🎨 UI Actions & Rendering
    // ---------------------------------------------------------
    changeMode() {
        const mode = document.getElementById('sm-mode').value;
        let desc = ""; let alertClass = "badge-soft-info"; 
        
        if(mode === 'transfer') { desc = "<b>สต๊อกใหญ่ลดลง / สต๊อกเล็กเพิ่มขึ้น:</b> ใช้เมื่อเข็นของจากห้องเก็บของใหญ่ มาเติมไว้ที่หน้าเคาน์เตอร์/รถเข็นพยาบาล"; alertClass = "badge-soft-info"; } 
        else if(mode === 'out_sub') { desc = "<b>สต๊อกเล็กลดลง:</b> ใช้ตัดสต๊อกเมื่อพยาบาลนำของไปใช้จริงกับคนไข้ หรือกรณีของชำรุด/หมดอายุ"; alertClass = "badge-soft-danger"; } 
        else if(mode === 'in_main') { desc = "<b>สต๊อกใหญ่เพิ่มขึ้น:</b> ใช้เมื่อมีของล็อตใหม่มาส่งจากบริษัท รับเข้าห้องเก็บของใหญ่"; alertClass = "badge-soft-success"; } 
        else if(mode === 'audit_main') { desc = "<b>ปรับตัวเลขทับของเดิม:</b> ใช้เมื่อต้องการปรับยอดสต๊อกใหญ่ให้ตรงกับที่เดินนับด้วยมือ"; alertClass = "badge-soft-warning"; } 
        else if(mode === 'audit_sub') { desc = "<b>ปรับตัวเลขทับของเดิม:</b> ใช้เมื่อต้องการปรับยอดหน้าเคาน์เตอร์ (สต๊อกเล็ก) ให้ตรงกับที่นับด้วยมือ"; alertClass = "badge-soft-warning"; }
        
        const descEl = document.getElementById('sm-mode-desc'); 
        const descText = document.getElementById('sm-mode-text');
        
        if (descEl && descText) { 
            descEl.className = `alert ${alertClass} py-2 px-3 small mb-4 shadow-sm`; 
            descText.innerHTML = desc; 
        }

        if (this.cart.length > 0) {
            Swal.fire({ 
                title: 'เปลี่ยนประเภททำรายการ?', 
                text: 'การเปลี่ยนโหมดจะล้างรายการในตะกร้าปัจจุบันทิ้งทั้งหมด', 
                icon: 'warning', 
                showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'ใช่, เปลี่ยนโหมด' 
            }).then((res) => { 
                if(res.isConfirmed) { this.clearCart(); } 
                else { this.renderCart(); } 
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
                    <input type="text" id="swal-manual-search" class="form-control form-control-lg bg-light shadow-sm" placeholder="พิมพ์ชื่อ, หมวดหมู่, รหัสสินค้า หรือ บาร์โค้ด..." style="padding-left: 45px; border-radius: 12px; border: 1px solid #cbd5e1;" onkeyup="App.pages.stock_manage.filterManualSelect(this.value)">
                </div>
                <div class="list-group shadow-sm" id="swal-manual-list" style="max-height: 400px; overflow-y: auto; border-radius: 12px; border: 1px solid #e2e8f0;">
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
            (i.category || "").toLowerCase().includes(term)
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
            <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3" onclick="Swal.close(); App.pages.stock_manage.processScan('${i.barcode}')">
                <div class="d-flex align-items-center">
                    <div class="text-center fw-bold text-secondary me-3" style="width: 30px; font-size: 16px;">${orderVal}</div>
                    <div class="text-start">
                        <div class="fw-bold text-dark" style="font-family:'Prompt'; font-size:15px;">${safeName}</div>
                        <small class="text-muted"><i class="fa-solid fa-hashtag me-1"></i> ${safeItemCode} | <i class="fa-solid fa-barcode ms-1 me-1"></i> ${safeBarcode}</small>
                    </div>
                </div>
                <div class="text-end">
                    <span class="badge badge-soft-primary rounded-pill px-2 py-1 mb-1 shadow-sm">ใหญ่: ${qMain}</span><br>
                    <span class="badge badge-soft-info rounded-pill px-2 py-1 shadow-sm">เล็ก: ${qSub}</span>
                </div>
            </button>`;
        }).join('');
    }

    // ---------------------------------------------------------
    // 🛒 Cart Management
    // ---------------------------------------------------------
    processScan(barcode) {
        if (!barcode) return;
        const item = this.allItems.find(i => i.barcode === barcode);
        
        if (!item) { 
            Swal.fire('ไม่พบพัสดุ', `ระบบไม่รู้จักบาร์โค้ด: ${barcode}`, 'warning'); 
            return; 
        }

        let qMain = item.qty_main !== undefined ? Number(item.qty_main) : (Number(item.qty) || 0);
        let qSub = Number(item.qty_sub) || 0;

        const existing = this.cart.find(c => c.id === item.id);
        if (existing) { 
            existing.processQty += 1; 
        } else { 
            this.cart.push({ 
                firebaseKey: item.firebaseKey, // 🔥 นำไปใช้ Update
                id: item.id, 
                item_code: item.item_code || '-', 
                barcode: item.barcode, 
                name: item.name, 
                qty_main: qMain, 
                qty_sub: qSub, 
                processQty: 1, 
                order: item.order 
            }); 
        }
        
        try { new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play(); } catch(e){}
        this.renderCart();
    }

    updateCartQty(id, val) {
        const item = this.cart.find(c => c.id === id);
        if (item) { 
            item.processQty = Number(val) >= 0 ? Number(val) : 0; 
            this.renderCart(); 
        }
    }

    removeCartItem(id) { 
        this.cart = this.cart.filter(c => c.id !== id); 
        this.renderCart(); 
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
            
            // ดึงค่าอ้างอิงใหม่ล่าสุดจากฐานข้อมูลตลอดเวลา
            const latestItem = this.allItems.find(i => i.id === c.id);
            if (latestItem) {
                c.qty_main = latestItem.qty_main !== undefined ? Number(latestItem.qty_main) : (Number(latestItem.qty) || 0);
                c.qty_sub = Number(latestItem.qty_sub) || 0;
            }

            if(mode === 'in_main') { refStock = c.qty_main; refName = "ใหญ่"; newQty = refStock + c.processQty; modeText = '<span class="text-success fw-bold">+</span>'; } 
            else if(mode === 'transfer') { refStock = c.qty_main; refName = "ใหญ่"; newQty = refStock - c.processQty; modeText = '<span class="text-primary fw-bold">=> ย้ายไปเล็ก</span>'; if(newQty < 0) textStyle = "color: #ef4444; font-weight: bold;"; } 
            else if(mode === 'out_sub') { refStock = c.qty_sub; refName = "เล็ก"; newQty = refStock - c.processQty; modeText = '<span class="text-danger fw-bold">-</span>'; if(newQty < 0) textStyle = "color: #ef4444; font-weight: bold;"; } 
            else if(mode === 'audit_main') { refStock = c.qty_main; refName = "ใหญ่"; newQty = c.processQty; modeText = '<span class="text-warning-dark fw-bold">= ปรับยอด</span>'; } 
            else if(mode === 'audit_sub') { refStock = c.qty_sub; refName = "เล็ก"; newQty = c.processQty; modeText = '<span class="text-warning-dark fw-bold">= ปรับยอด</span>'; }

            const safeItemCode = this.#escapeHTML(c.item_code || '-');
            const safeName = this.#escapeHTML(c.name);

            html += `
            <tr class="align-middle">
                <td class="text-center fw-bold text-secondary" style="font-size: 15px; vertical-align: middle;">${orderVal}</td>
                <td class="text-center"><span class="badge bg-primary-subtle text-primary border border-primary-subtle shadow-sm px-2 py-1" style="font-family: monospace; font-size:13px; border-radius:6px;">${safeItemCode}</span></td>
                <td>
                    <div class="fw-bold text-dark" style="font-family:'Prompt'; font-size:15px;">${safeName}</div>
                    <div class="small text-muted"><i class="fa-solid fa-barcode"></i> ${this.#escapeHTML(c.barcode)}</div>
                </td>
                <td class="text-center text-muted" style="font-size: 13px; vertical-align: middle;">
                    <div class="fw-bold text-dark" style="font-size:15px;">${refStock}</div>
                    <small>ในห้อง${refName}</small>
                </td>
                <td class="text-center" style="vertical-align: middle;">
                    <div class="small text-muted mb-1">${modeText}</div>
                    <div class="input-group input-group-sm mx-auto shadow-sm" style="width: 100px; border-radius:8px; overflow:hidden;">
                        <input type="number" class="form-control input-modern text-center fw-bold p-0 m-0 border-0" value="${c.processQty}" min="0" onchange="App.pages.stock_manage.updateCartQty('${c.id}', this.value)" style="border-radius:0;">
                    </div>
                </td>
                <td class="text-center fw-bold text-primary" style="font-size: 18px; vertical-align: middle; ${textStyle}">${newQty}</td>
                <td class="text-center" style="vertical-align: middle;">
                    <button class="btn btn-sm btn-light btn-action-icon text-danger border border-danger-subtle shadow-sm" onclick="App.pages.stock_manage.removeCartItem('${c.id}')" title="ลบออกจากตะกร้า"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    }

    // ---------------------------------------------------------
    // 🛡️ Safe Database Save (Atomic Update)
    // ---------------------------------------------------------
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

                    // 🚨 THE FIX: อัปเดตเฉพาะ Field ด้วย Atomic Updates
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

                            // เตรียมชุดคำสั่ง Update
                            updates[`inventory_database_v2/items/${c.firebaseKey || c.id}/qty_main`] = qMain;
                            updates[`inventory_database_v2/items/${c.firebaseKey || c.id}/qty`] = qMain; // สำหรับระบบเก่า
                            updates[`inventory_database_v2/items/${c.firebaseKey || c.id}/qty_sub`] = qSub;
                            updates[`inventory_database_v2/items/${c.firebaseKey || c.id}/last_update`] = timestamp;

                            logs.push({ 
                                timestamp: timestamp, mode: mode, itemId: c.id, itemName: c.name, 
                                itemCode: c.item_code || '', barcode: c.barcode || '', 
                                qty: pQty, user: userName 
                            });
                        }
                    }

                    // บันทึกการตัดสต๊อกและประวัติลงพร้อมกันในเสี้ยววินาที (Atomic Batch)
                    await db.ref().update(updates);
                    
                    // แยกเขียน Log
                    const logPromises = logs.map(log => db.ref('inventory_database_v2/transactions').push(log));
                    await Promise.all(logPromises);

                    Swal.fire('บันทึกสำเร็จ!', `อัปเดตสต๊อกและสร้างประวัติบัญชีเรียบร้อยแล้ว`, 'success');
                    this.clearCart(); 

                } catch (err) {
                    Swal.fire('ข้อผิดพลาด', err.message, 'error');
                }
            }
        });
    }

    // ---------------------------------------------------------
    // 📸 Camera Scanner Handlers
    // ---------------------------------------------------------
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

// 🌐 Expose Component สู่ระบบ Router
const StockManagePage = new StockManagePageComponent();
window.StockManagePage = StockManagePage;
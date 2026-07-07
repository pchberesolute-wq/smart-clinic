// js/pages/stock_history.js
// 🚀 Enterprise Stock History Module: Pagination, FinOps Queries & Theme Native Ready

class StockHistoryPageComponent {
    constructor() {
        this.state = {
            allLogs: [],
            filteredLogs: [],
            inventoryItems: [],
            currentPage: 1,
            itemsPerPage: 30,
            currentLimit: 500,
            selectedDate: '', 
            hasCleanedUp: false
        };
        this.firebaseListeners = [];
    }

    get html() {
        return `
            <style>
                .table-premium th { color: var(--text-muted); font-weight: 700; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; padding: 16px; border-bottom: 2px solid var(--border-color); }
                .table-premium td { padding: 16px; vertical-align: middle; border-bottom: 1px solid var(--border-color); transition: background 0.2s; }
                .date-filter-wrapper { position: relative; display: flex; align-items: center; background-color: var(--bg-surface); border-radius: 50px; padding: 6px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid var(--border-color); cursor: pointer; transition: all 0.2s; }
                .date-filter-wrapper:hover { border-color: var(--primary); box-shadow: 0 4px 6px -1px rgba(37,99,235,0.1); }
                .date-filter-input { position: absolute; opacity: 0; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer; z-index: 10; }
                .date-clear-btn { position: relative; z-index: 20; border: none; background: transparent; color: #ef4444; margin-left: 10px; cursor: pointer; display: none; }
                
                /* 🚨 THE FIX: ยันต์เกราะเพชรป้องกันไอคอนโดนฟอนต์อื่นกลืนกลายเป็นสี่เหลี่ยม 🚨 */
                .safe-icon { font-family: 'Font Awesome 6 Free', 'FontAwesome', sans-serif !important; font-weight: 900 !important; font-style: normal !important; }
            </style>

            <div class="page-header mb-4">
                <div>
                    <h2 class="page-title text-primary" style="font-size: 28px;"><i class="fa-solid fa-clock-rotate-left me-2"></i> ประวัติทำรายการสต๊อก</h2>
                    <p class="text-muted mt-1 mb-0">ตรวจสอบความเคลื่อนไหว (Log) ของคลังพัสดุ ดึงข้อมูลรหัสสินค้า และบาร์โค้ดมาแสดงผลย้อนหลัง</p>
                </div>
                <div class="d-flex gap-2 mt-3 mt-md-0 flex-wrap">
                    <button class="btn btn-premium-danger px-4 shadow-sm rounded-pill fw-bold" onclick="App.pages.stock_history.deleteAllHistory()">
                        <i class="fa-solid fa-dumpster-fire me-1"></i> ล้างประวัติทั้งหมด
                    </button>
                    <button class="btn btn-outline-secondary fw-bold shadow-sm rounded-pill px-4" onclick="App.switchPage('inventory')">
                        <i class="fa-solid fa-arrow-left me-2 text-primary"></i> กลับไปหน้าคลังหลัก
                    </button>
                </div>
            </div>

            <div class="modern-panel shadow-sm p-4 position-relative overflow-hidden" style="border-top: 5px solid var(--primary); border-radius: 20px; background-color: var(--bg-surface); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 250px; pointer-events: none; color: var(--text-dark);"><i class="fa-solid fa-list-check"></i></div>
                
                <div class="row align-items-center mb-4 g-3 position-relative z-1">
                    <div class="col-md-3">
                        <h5 class="fw-bold mb-0" style="color: var(--text-dark);"><i class="fa-solid fa-timeline text-primary me-2"></i> รายการเคลื่อนไหว</h5>
                        <div class="small text-muted mt-1 fw-bold" id="sh-record-count">กำลังโหลดข้อมูล...</div>
                    </div>
                    
                    <div class="col-md-9 d-flex justify-content-md-end gap-3 flex-wrap align-items-center">
                        <div class="date-filter-wrapper">
                            <input type="date" id="sh-date-filter" class="date-filter-input" onchange="App.pages.stock_history.onDateFilterChange(this.value)" onfocus="this.showPicker && this.showPicker()">
                            <!-- 🚨 เติมคลาส safe-icon -->
                            <i class="fa-solid fa-calendar-day text-primary me-2 position-relative safe-icon" style="z-index: 1;"></i>
                            <span id="sh-date-display" class="fw-bold position-relative" style="font-family:'Prompt'; z-index: 1; font-size: 14px; color: var(--text-dark);">ค้นหาตามวันที่...</span>
                            <button id="sh-date-clear" class="date-clear-btn" onclick="App.pages.stock_history.clearDateFilter()"><i class="fa-solid fa-circle-xmark safe-icon"></i></button>
                        </div>

                        <div class="search-box-modern shadow-sm" style="width: 180px; background-color: var(--bg-body); border: 1px solid var(--border-color); padding: 6px 15px; border-radius: 50px;">
                            <!-- 🚨 THE FIX: เติมคลาส safe-icon ป้องกันสี่เหลี่ยมกากบาท -->
                            <i class="fa-solid fa-list-ol text-muted me-2 safe-icon"></i>
                            <select id="sh-limit-select" class="form-select fw-bold border-0 bg-transparent p-0 m-0 w-100 d-inline-block" onchange="App.pages.stock_history.changeLimit(this.value)" style="outline:none; box-shadow:none; color: var(--text-dark);">
                                <option value="100">100 ล่าสุด</option><option value="500" selected>500 ล่าสุด</option><option value="1000">1,000 ล่าสุด</option><option value="999999">ทั้งหมด</option>
                            </select>
                        </div>

                        <div class="search-box-modern shadow-sm" style="width: 250px; background-color: var(--bg-body); border: 1px solid var(--border-color); padding: 8px 15px; border-radius: 50px; display: flex; align-items: center;">
                            <!-- 🚨 เติมคลาส safe-icon -->
                            <i class="fa-solid fa-search text-primary safe-icon"></i>
                            <input type="text" id="sh-search" class="border-0 bg-transparent ms-2 w-100 fw-bold" placeholder="ค้นหาชื่อ, รหัส, บาร์โค้ด..." onkeyup="App.pages.stock_history.filterData()" style="outline:none; color: var(--text-dark);">
                        </div>
                    </div>
                </div>
                
                <div class="table-responsive rounded-3 border position-relative z-1 shadow-sm" style="min-height: 400px; border-color: var(--border-color) !important; background-color: var(--bg-surface);">
                    <table class="table table-premium w-100 mb-0">
                        <thead style="background-color: var(--bg-body);">
                            <tr>
                                <th class="text-center text-primary" style="width: 90px;"><i class="fa-solid fa-sort me-1 safe-icon"></i> ลำดับ</th>
                                <th style="width: 160px;"><i class="fa-regular fa-calendar-days me-2 safe-icon"></i> วันที่-เวลา</th>
                                <th style="width: 200px;"><i class="fa-solid fa-tag me-2 safe-icon"></i> ประเภทรายการ</th>
                                <th style="width: 280px;"><i class="fa-solid fa-box me-2 safe-icon"></i> รายการพัสดุที่ถูกแก้ไข</th>
                                <th><i class="fa-solid fa-file-lines me-2 safe-icon"></i> รายละเอียด / จำนวนสุทธิ</th>
                                <th class="text-center" style="width: 150px;"><i class="fa-solid fa-user-pen me-2 safe-icon"></i> ผู้บันทึก</th>
                            </tr>
                        </thead>
                        <tbody id="sh-table-body"><tr><td colspan="6" class="text-center py-5 text-muted"><i class="fas fa-spinner fa-spin fa-2x mb-3 text-primary"></i><br>กำลังดึงข้อมูลประวัติ...</td></tr></tbody>
                    </table>
                </div>

                <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top flex-wrap gap-3 position-relative z-1" style="border-color: var(--border-color) !important;">
                    <div class="text-muted small fw-bold d-flex align-items-center">
                        แสดงหน้าละ 
                        <select class="form-select input-modern form-select-sm mx-2 fw-bold text-primary shadow-sm p-1 px-3" style="width: 80px; border-color: var(--border-color) !important;" onchange="App.pages.stock_history.changeItemsPerPage(this.value)">
                            <option value="20">20</option><option value="30" selected>30</option><option value="50">50</option><option value="100">100</option>
                        </select> รายการ
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <button id="sh-btn-prev" class="btn btn-outline-primary fw-bold px-4 rounded-pill shadow-sm" style="background-color: var(--bg-surface);" onclick="App.pages.stock_history.changePage(-1)"><i class="fa-solid fa-chevron-left me-1 safe-icon"></i> ก่อนหน้า</button>
                        <div class="badge border border-primary text-primary px-4 py-2 fs-6 shadow-sm rounded-pill" style="background-color: var(--bg-body);" id="sh-page-info">หน้า 1 / 1</div>
                        <button id="sh-btn-next" class="btn btn-outline-primary fw-bold px-4 rounded-pill shadow-sm" style="background-color: var(--bg-surface);" onclick="App.pages.stock_history.changePage(1)">ถัดไป <i class="fa-solid fa-chevron-right ms-1 safe-icon"></i></button>
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
        
        this.state.selectedDate = ''; 
        this.updateDateDisplay('');

        this.#loadData();
    }

    // 🧹 Lifecycle: Unmount
    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        console.log("🧹 [Stock History] Cleaned up listeners.");
    }

    // ---------------------------------------------------------
    // 📡 Data Fetching
    // ---------------------------------------------------------
    #loadData() {
        document.getElementById('sh-table-body').innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted"><i class="fas fa-spinner fa-spin fa-2x mb-3 text-primary"></i><br>กำลังโหลดข้อมูล...</td></tr>`;
        
        db.ref('inventory_database_v2/items').once('value').then(itemSnap => {
            const itemData = itemSnap.val();
            let rawItems = itemData ? (Array.isArray(itemData) ? itemData : Object.keys(itemData).map(k => itemData[k])) : [];
            this.state.inventoryItems = rawItems.filter(Boolean);

            const refTrans = db.ref('inventory_database_v2/transactions').orderByChild('timestamp').limitToLast(this.state.currentLimit);
            const cbTrans = refTrans.on('value', snap => {
                const data = snap.val();
                let rawLogs = data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : [];
                this.state.allLogs = rawLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                this.filterData();
            });

            this.firebaseListeners.push({ path: 'inventory_database_v2/transactions', callback: cbTrans });
        }).catch(err => {
            console.error("Load Inventory Items Error:", err);
            document.getElementById('sh-table-body').innerHTML = `<tr><td colspan="6" class="text-center py-5 text-danger"><i class="fas fa-exclamation-triangle fa-2x mb-3"></i><br>เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>`;
        });
    }

    // ---------------------------------------------------------
    // 🗑️ Data Mutation
    // ---------------------------------------------------------
    deleteAllHistory() {
        if(this.state.allLogs.length === 0) return;
        Swal.fire({
            title: '<span class="text-danger"><i class="fa-solid fa-triangle-exclamation fa-beat"></i> เตือนภัยระดับสูงสุด!</span>',
            html: `<div class="text-start" style="font-family:'Sarabun';"><p>คุณกำลังจะลบ <b>"ประวัติทั้งหมด"</b></p><label class="fw-bold mt-2">โปรดพิมพ์คำว่า <span class="text-danger">"ยืนยัน"</span> เพื่อดำเนินการ:</label></div>`,
            input: 'text', inputAttributes: { autocapitalize: 'off', placeholder: 'พิมพ์ ยืนยัน', class: 'form-control input-modern text-center fw-bold mt-2 text-danger' },
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-bomb me-1"></i> ล้างประวัติ', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#ef4444',
            preConfirm: (val) => { if (val !== "ยืนยัน") { Swal.showValidationMessage('พิมพ์ ยืนยัน ให้ถูกต้อง'); return false; } return true; }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'กำลังลบข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                db.ref('inventory_database_v2/transactions').remove().then(() => { 
                    this.state.allLogs = []; 
                    this.state.filteredLogs = []; 
                    this.#renderTable(); 
                    Swal.fire('สำเร็จ', 'ลบทิ้งเรียบร้อย', 'success'); 
                }).catch(err => {
                    Swal.fire('เกิดข้อผิดพลาด', err.message, 'error');
                });
            }
        });
    }

    // ---------------------------------------------------------
    // 🎛️ Filtering & UI Actions
    // ---------------------------------------------------------
    onDateFilterChange(dateVal) {
        this.state.selectedDate = dateVal;
        this.updateDateDisplay(dateVal);
        this.filterData();
    }

    clearDateFilter() {
        this.state.selectedDate = '';
        const dateFilterEl = document.getElementById('sh-date-filter');
        if(dateFilterEl) dateFilterEl.value = '';
        this.updateDateDisplay('');
        this.filterData();
    }

    updateDateDisplay(dateStr) {
        const display = document.getElementById('sh-date-display');
        const clearBtn = document.getElementById('sh-date-clear');
        if(!display) return;

        if (!dateStr) {
            display.innerHTML = 'ค้นหาตามวันที่...';
            display.classList.remove('text-primary');
            if(clearBtn) clearBtn.style.display = 'none';
        } else {
            const dObj = new Date(dateStr);
            const thaiDate = `${String(dObj.getDate()).padStart(2,'0')}/${String(dObj.getMonth() + 1).padStart(2,'0')}/${dObj.getFullYear() + 543}`;
            display.innerHTML = `วันที่ <b class="text-primary">${thaiDate}</b>`;
            if(clearBtn) clearBtn.style.display = 'inline-block';
        }
    }

    filterData() {
        const searchInput = document.getElementById('sh-search');
        const term = (searchInput ? searchInput.value : "").toLowerCase();
        
        this.state.filteredLogs = this.state.allLogs.filter(log => {
            let matchText = true;
            let matchDate = true;

            if(term) {
                matchText = (log.itemName || "").toLowerCase().includes(term) || 
                            (log.note || "").toLowerCase().includes(term) || 
                            (log.itemCode || "").toLowerCase().includes(term) || 
                            (log.barcode || "").toLowerCase().includes(term);
            }

            if(this.state.selectedDate) {
                let logDate = new Date(log.timestamp).toISOString().split('T')[0];
                matchDate = (logDate === this.state.selectedDate);
            }

            return matchText && matchDate;
        });

        this.state.currentPage = 1; 
        this.#renderTable();
    }

    changeLimit(val) { 
        this.state.currentLimit = Number(val); 
        this.#loadData(); 
    }
    
    changeItemsPerPage(val) { 
        this.state.itemsPerPage = Number(val); 
        this.state.currentPage = 1; 
        this.#renderTable(); 
    }
    
    changePage(direction) {
        const totalPages = Math.ceil(this.state.filteredLogs.length / this.state.itemsPerPage) || 1;
        this.state.currentPage += direction;
        if(this.state.currentPage < 1) this.state.currentPage = 1;
        if(this.state.currentPage > totalPages) this.state.currentPage = totalPages;
        this.#renderTable();
    }

    #renderTable() {
        const tbody = document.getElementById('sh-table-body');
        if (!tbody) return;

        const totalItems = this.state.filteredLogs.length;
        const countEl = document.getElementById('sh-record-count');
        if(countEl) countEl.innerHTML = `พบข้อมูล <b style="color: var(--text-dark);">${totalItems}</b> รายการ (จากทั้งหมด ${this.state.allLogs.length} รายการที่โหลดมา)`;

        if (totalItems === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted"><i class="fa-solid fa-clock-rotate-left fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่พบประวัติการทำรายการ</td></tr>`;
            const pageInfo = document.getElementById('sh-page-info');
            if(pageInfo) pageInfo.innerText = `หน้า 1 / 1`; 
            
            const btnPrev = document.getElementById('sh-btn-prev');
            const btnNext = document.getElementById('sh-btn-next');
            if(btnPrev) btnPrev.disabled = true;
            if(btnNext) btnNext.disabled = true;
            return;
        }

        const startIndex = (this.state.currentPage - 1) * this.state.itemsPerPage;
        const endIndex = startIndex + this.state.itemsPerPage;
        const paginatedItems = this.state.filteredLogs.slice(startIndex, endIndex);

        const totalPages = Math.ceil(totalItems / this.state.itemsPerPage);
        
        const pageInfo = document.getElementById('sh-page-info');
        if(pageInfo) pageInfo.innerText = `หน้า ${this.state.currentPage} / ${totalPages}`;
        
        const btnPrev = document.getElementById('sh-btn-prev');
        const btnNext = document.getElementById('sh-btn-next');
        if(btnPrev) btnPrev.disabled = this.state.currentPage === 1;
        if(btnNext) btnNext.disabled = this.state.currentPage === totalPages;

        let html = "";
        paginatedItems.forEach((log) => {
            const d = new Date(log.timestamp);
            const dateStr = d.toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'2-digit' });
            const timeStr = d.toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' });

            const matchedItem = this.state.inventoryItems.find(i => i.id === log.itemId);
            let itemOrderVal = (matchedItem && matchedItem.order !== undefined && matchedItem.order !== null && matchedItem.order !== "" && matchedItem.order !== 999) ? matchedItem.order : '-';
            let finalItemCode = log.itemCode || (matchedItem ? matchedItem.item_code : '-');
            let finalBarcode = log.barcode || (matchedItem ? matchedItem.barcode : '-');

            let modeHtml = `<span class="badge bg-secondary">ไม่ระบุ</span>`;
            let detailHtml = ''; 

            if(log.mode === 'in_main') {
                modeHtml = `<span class="badge border border-success text-success px-3 py-1 shadow-sm rounded-pill" style="background: var(--bg-body);"><i class="fa-solid fa-arrow-down me-1 safe-icon"></i> รับของเข้า (ใหญ่)</span>`;
                detailHtml = `บวกเพิ่ม <b>${log.qty}</b> เข้าสต๊อกใหญ่`;
            }
            else if(log.mode === 'transfer') {
                modeHtml = `<span class="badge border border-primary text-primary px-3 py-1 shadow-sm rounded-pill" style="background: var(--bg-body);"><i class="fa-solid fa-truck-ramp-box me-1 safe-icon"></i> โอนย้าย (ใหญ่ ➡️ เล็ก)</span>`;
                detailHtml = `หัก <b>${log.qty}</b> จากสต๊อกใหญ่ ไปเพิ่มในสต๊อกเล็ก`;
            }
            else if(log.mode === 'out_sub') {
                modeHtml = `<span class="badge border border-danger text-danger px-3 py-1 shadow-sm rounded-pill" style="background: var(--bg-body);"><i class="fa-solid fa-arrow-up-right-from-square me-1 safe-icon"></i> เบิกใช้งานจริง (เล็ก)</span>`;
                detailHtml = `เบิกตัดยอด <b>${log.qty}</b> จากสต๊อกหน้าเคาน์เตอร์ <br><small class="text-muted"><i class="fa-solid fa-tag safe-icon"></i> ${this.#escapeHTML(log.note || 'ไม่มีหมายเหตุ')}</small>`;
            }
            else if(log.mode === 'audit_main') {
                modeHtml = `<span class="badge border border-warning text-warning px-3 py-1 shadow-sm rounded-pill" style="background: var(--bg-body);"><i class="fa-solid fa-clipboard-check me-1 safe-icon"></i> ปรับยอดจริง (ใหญ่)</span>`;
                detailHtml = `ระบบถูกบังคับอัปเดตยอดคงเหลือ <b>สต๊อกใหญ่</b> เป็น <b class="text-warning">${log.qty}</b>`;
            }
            else if(log.mode === 'audit_sub') {
                modeHtml = `<span class="badge border border-warning text-warning px-3 py-1 shadow-sm rounded-pill" style="background: var(--bg-body);"><i class="fa-solid fa-clipboard-check me-1 safe-icon"></i> ปรับยอดจริง (เล็ก)</span>`;
                detailHtml = `ระบบถูกบังคับอัปเดตยอดคงเหลือ <b>สต๊อกหน้าเคาน์เตอร์</b> เป็น <b class="text-warning">${log.qty}</b>`;
            }
            else if(log.mode === 'new_register') {
                modeHtml = `<span class="badge border border-info text-info px-3 py-1 shadow-sm rounded-pill" style="background: var(--bg-body);"><i class="fa-solid fa-plus me-1 safe-icon"></i> ลงทะเบียนพัสดุใหม่</span>`;
                detailHtml = `สร้างพัสดุชิ้นนี้ขึ้นมาครั้งแรก โดยมียอดยกมาเริ่มต้น <b class="text-info">${log.qty}</b>`;
            }
            else if(log.mode === 'in_sub_restore') {
                modeHtml = `<span class="badge border border-success text-success px-3 py-1 shadow-sm rounded-pill" style="background: var(--bg-body);"><i class="fa-solid fa-rotate-left me-1 safe-icon"></i> ดึงของคืน (เล็ก)</span>`;
                detailHtml = `ดึงของคืนกลับเข้าสต๊อกเคาน์เตอร์ <b>${log.qty}</b> หน่วย <br><small class="text-muted"><i class="fa-solid fa-tag safe-icon"></i> ${this.#escapeHTML(log.note || 'การยกเลิก Flowsheet')}</small>`;
            }

            const safeItemName = this.#escapeHTML(log.itemName || 'ไม่ทราบชื่อ');

            html += `
            <tr class="align-middle card-hover-float" style="cursor:default;">
                <td class="text-center fw-bold" style="font-size: 15px; color: var(--text-dark);">${itemOrderVal}</td>
                <td>
                    <span class="badge border shadow-sm px-2 py-1" style="background-color: var(--bg-body); border-color: var(--border-color) !important; color: var(--text-dark);"><i class="fa-regular fa-calendar me-1 text-primary safe-icon"></i> ${dateStr}</span><br>
                    <span class="small fw-bold text-muted mt-1 d-inline-block"><i class="fa-regular fa-clock me-1 safe-icon"></i> ${timeStr} น.</span>
                </td>
                <td>${modeHtml}</td>
                <td>
                    <div class="fw-bold" style="font-family:'Prompt'; font-size:14.5px; color: var(--text-dark);">${safeItemName}</div>
                    <div class="mt-1 d-flex gap-2 flex-wrap">
                        <span class="badge border border-primary text-primary" style="font-family: monospace; font-size:11px; background-color: var(--bg-body);">รหัส: ${this.#escapeHTML(finalItemCode)}</span>
                        <span class="badge border shadow-sm text-secondary" style="font-family: monospace; font-size:11px; background-color: var(--bg-body); border-color: var(--border-color) !important;"><i class="fa-solid fa-barcode safe-icon"></i> ${this.#escapeHTML(finalBarcode)}</span>
                    </div>
                </td>
                <td>
                    <div class="p-2 border rounded-3 shadow-sm" style="font-size: 13px; line-height: 1.4; background-color: var(--bg-body); border-color: var(--border-color) !important; color: var(--text-dark);">
                        ${detailHtml}
                    </div>
                </td>
                
                <td class="text-center text-muted small fw-bold"><i class="fa-solid fa-user-nurse me-1 text-primary safe-icon"></i> ${this.#escapeHTML(log.user || 'Admin')}</td>
            </tr>`;
        });
        tbody.innerHTML = html;
    }

    // 🛡️ Helpers
    #escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}

// 🌐 Expose Component สู่ระบบ Router
const StockHistoryPage = new StockHistoryPageComponent();
window.StockHistoryPage = StockHistoryPage;
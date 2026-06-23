// js/pages/stock_history.js
// 🚀 โมดูลประวัติการเข้า-ออกสต๊อก (Fixed Item Code Display & Search, Audit Logs & 5-Year Purge)

const StockHistoryPage = {
    allLogs: [], filteredLogs: [], inventoryItems: [], currentPage: 1, itemsPerPage: 30, currentLimit: 500, hasCleanedUp: false,
    selectedDate: '', // เก็บค่าวันที่ต้องการค้นหา (ว่าง = ดูทั้งหมด)

    html: `
        <style>
            .table-premium th { background: #f8fafc; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; padding: 16px; border-bottom: 2px solid #e2e8f0; }
            .table-premium td { padding: 16px; vertical-align: middle; border-bottom: 1px solid #f1f5f9; transition: background 0.2s; }
            .table-premium tr:hover td { background: #f8fafc; }
            .date-filter-wrapper { position: relative; display: flex; align-items: center; background: #fff; border-radius: 50px; padding: 6px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #cbd5e1; cursor: pointer; transition: all 0.2s; }
            .date-filter-wrapper:hover { border-color: var(--primary); box-shadow: 0 4px 6px -1px rgba(37,99,235,0.1); }
            .date-filter-input { position: absolute; opacity: 0; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer; z-index: 10; }
            .date-clear-btn { position: relative; z-index: 20; border: none; background: transparent; color: #ef4444; margin-left: 10px; cursor: pointer; display: none; }
        </style>

        <div class="page-header mb-4">
            <div>
                <h2 class="page-title text-primary" style="font-size: 28px;"><i class="fa-solid fa-clock-rotate-left me-2"></i> ประวัติทำรายการสต๊อก</h2>
                <p class="text-muted mt-1 mb-0">ตรวจสอบความเคลื่อนไหว (Log) ของคลังพัสดุ ดึงข้อมูลรหัสสินค้า และบาร์โค้ดมาแสดงผลย้อนหลัง</p>
            </div>
            <div class="d-flex gap-2 mt-3 mt-md-0 flex-wrap">
                <button class="btn btn-premium btn-premium-danger px-4" onclick="StockHistoryPage.deleteAllHistory()">
                    <i class="fa-solid fa-dumpster-fire me-1"></i> ล้างประวัติทั้งหมด
                </button>
                <button class="btn btn-light fw-bold shadow-sm rounded-pill px-4 border text-secondary card-hover-float" onclick="App.switchPage('inventory', document.querySelector('.nav-item:nth-child(8)'))">
                    <i class="fa-solid fa-arrow-left me-2 text-primary"></i> กลับไปหน้าคลังหลัก
                </button>
            </div>
        </div>

        <div class="modern-panel shadow-sm p-4 position-relative overflow-hidden" style="border-top: 5px solid var(--primary); border-radius: 20px;">
            <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 250px; pointer-events: none;"><i class="fa-solid fa-list-check"></i></div>
            
            <div class="row align-items-center mb-4 g-3 position-relative z-1">
                <div class="col-md-3">
                    <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-timeline text-primary me-2"></i> รายการเคลื่อนไหว</h5>
                    <div class="small text-muted mt-1 fw-bold" id="sh-record-count">กำลังโหลดข้อมูล...</div>
                </div>
                
                <div class="col-md-9 d-flex justify-content-md-end gap-3 flex-wrap align-items-center">
                    <div class="date-filter-wrapper">
                        <input type="date" id="sh-date-filter" class="date-filter-input" onchange="StockHistoryPage.onDateFilterChange(this.value)" onfocus="this.showPicker && this.showPicker()">
                        <i class="fa-solid fa-calendar-day text-primary me-2 position-relative" style="z-index: 1;"></i>
                        <span id="sh-date-display" class="fw-bold text-dark position-relative" style="font-family:'Prompt'; z-index: 1; font-size: 14px;">ค้นหาตามวันที่...</span>
                        <button id="sh-date-clear" class="date-clear-btn" onclick="StockHistoryPage.clearDateFilter()"><i class="fa-solid fa-circle-xmark"></i></button>
                    </div>

                    <div class="search-box-modern shadow-sm" style="width: 180px;">
                        <i class="fa-solid fa-list-ol text-muted me-2"></i>
                        <select id="sh-limit-select" class="form-select fw-bold text-dark border-0 bg-transparent p-0 m-0 w-100" onchange="StockHistoryPage.changeLimit(this.value)" style="outline:none; box-shadow:none;">
                            <option value="100">100 ล่าสุด</option><option value="500" selected>500 ล่าสุด</option><option value="1000">1,000 ล่าสุด</option><option value="999999">ทั้งหมด</option>
                        </select>
                    </div>

                    <div class="search-box-modern shadow-sm bg-white" style="width: 250px;">
                        <i class="fa-solid fa-search text-primary"></i>
                        <input type="text" id="sh-search" class="border-0 bg-transparent ms-2 w-100 fw-bold text-dark" placeholder="ค้นหาชื่อ, รหัส, บาร์โค้ด..." onkeyup="StockHistoryPage.filterData()" style="outline:none;">
                    </div>
                </div>
            </div>
            
            <div class="table-responsive bg-white rounded-3 border border-light position-relative z-1" style="min-height: 400px;">
                <table class="table table-premium w-100 mb-0">
                    <thead>
                        <tr>
                            <th class="text-center text-primary" style="width: 90px;"><i class="fa-solid fa-sort me-1"></i> ลำดับ</th>
                            <th style="width: 160px;"><i class="fa-regular fa-calendar-days me-2"></i> วันที่-เวลา</th>
                            <th style="width: 200px;"><i class="fa-solid fa-tag me-2"></i> ประเภทรายการ</th>
                            <th style="width: 280px;"><i class="fa-solid fa-box me-2"></i> รายการพัสดุที่ถูกแก้ไข</th>
                            <th><i class="fa-solid fa-file-lines me-2"></i> รายละเอียด / จำนวนสุทธิ</th>
                            <th class="text-center" style="width: 150px;"><i class="fa-solid fa-user-pen me-2"></i> ผู้บันทึก</th>
                        </tr>
                    </thead>
                    <tbody id="sh-table-body"><tr><td colspan="6" class="text-center py-5 text-muted"><i class="fas fa-spinner fa-spin fa-2x mb-3 text-primary"></i><br>กำลังดึงข้อมูลประวัติ...</td></tr></tbody>
                </table>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top flex-wrap gap-3 position-relative z-1">
                <div class="text-muted small fw-bold d-flex align-items-center">
                    แสดงหน้าละ 
                    <select class="form-select input-modern form-select-sm mx-2 fw-bold text-primary shadow-sm p-1 px-3 border-0 bg-light" style="width: 80px;" onchange="StockHistoryPage.changeItemsPerPage(this.value)">
                        <option value="20">20</option><option value="30" selected>30</option><option value="50">50</option><option value="100">100</option>
                    </select> รายการ
                </div>
                <div class="d-flex align-items-center gap-2">
                    <button id="sh-btn-prev" class="btn btn-outline-primary fw-bold px-4 rounded-pill shadow-sm bg-white" onclick="StockHistoryPage.changePage(-1)"><i class="fa-solid fa-chevron-left me-1"></i> ก่อนหน้า</button>
                    <div class="badge badge-soft-primary px-4 py-2 fs-6 shadow-sm rounded-pill" id="sh-page-info">หน้า 1 / 1</div>
                    <button id="sh-btn-next" class="btn btn-outline-primary fw-bold px-4 rounded-pill shadow-sm bg-white" onclick="StockHistoryPage.changePage(1)">ถัดไป <i class="fa-solid fa-chevron-right ms-1"></i></button>
                </div>
            </div>
        </div>
    `,

    init: function() {
        if (typeof db === 'undefined') return;
        
        if (!this.hasCleanedUp) this.autoCleanUpOldRecords();

        this.selectedDate = ''; // รีเซ็ตการค้นหาวันที่ทุกครั้งที่เข้ามา
        this.updateDateDisplay('');

        this.loadData();
    },

    autoCleanUpOldRecords: function() {
        this.hasCleanedUp = true;
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);
        const cutoffIso = cutoffDate.toISOString();

        db.ref('inventory_database_v2/transactions')
          .orderByChild('timestamp')
          .endAt(cutoffIso)
          .once('value').then(snap => {
              if (snap.exists()) {
                  let updates = {};
                  let count = 0;
                  snap.forEach(child => { updates[child.key] = null; count++; });
                  db.ref('inventory_database_v2/transactions').update(updates);
                  console.log(`♻️ Auto-Purged ${count} old inventory logs.`);
              }
          });
    },

    loadData: function() {
        document.getElementById('sh-table-body').innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted"><i class="fas fa-spinner fa-spin fa-2x mb-3 text-primary"></i><br>กำลังโหลดข้อมูล...</td></tr>`;
        
        // โหลดข้อมูล Inventory Items ก่อน เพื่อเอามา Map ค่าย้อนหลัง (กรณี Log เก่าไม่มี Item Code)
        db.ref('inventory_database_v2/items').once('value').then(itemSnap => {
            const itemData = itemSnap.val();
            let rawItems = itemData ? (Array.isArray(itemData) ? itemData : Object.keys(itemData).map(k => itemData[k])) : [];
            this.inventoryItems = rawItems.filter(Boolean);

            db.ref('inventory_database_v2/transactions').off();
            db.ref('inventory_database_v2/transactions')
              .orderByChild('timestamp')
              .limitToLast(this.currentLimit)
              .on('value', snap => {
                const data = snap.val();
                let rawLogs = data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : [];
                this.allLogs = rawLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                this.filterData();
            });
        });
    },

    deleteAllHistory: function() {
        if(this.allLogs.length === 0) return;
        Swal.fire({
            title: '<span class="text-danger"><i class="fa-solid fa-triangle-exclamation fa-beat"></i> เตือนภัยระดับสูงสุด!</span>',
            html: `<div class="text-start" style="font-family:'Sarabun';"><p>คุณกำลังจะลบ <b>"ประวัติทั้งหมด"</b></p><label class="fw-bold mt-2">โปรดพิมพ์คำว่า <span class="text-danger">"ยืนยัน"</span> เพื่อดำเนินการ:</label></div>`,
            input: 'text', inputAttributes: { autocapitalize: 'off', placeholder: 'พิมพ์ ยืนยัน', class: 'form-control input-modern text-center fw-bold mt-2 text-danger' },
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-bomb me-1"></i> ล้างประวัติ', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#ef4444',
            preConfirm: (val) => { if (val !== "ยืนยัน") { Swal.showValidationMessage('พิมพ์ ยืนยัน ให้ถูกต้อง'); return false; } return true; }
        }).then((result) => {
            if (result.isConfirmed) {
                db.ref('inventory_database_v2/transactions').remove().then(() => { this.allLogs = []; this.filteredLogs = []; this.renderTable(); Swal.fire('สำเร็จ', 'ลบทิ้งเรียบร้อย', 'success'); });
            }
        });
    },

    // 🌟 ระบบจัดการ UI ปฏิทินภาษาไทย (Date Masking)
    onDateFilterChange: function(dateVal) {
        this.selectedDate = dateVal;
        this.updateDateDisplay(dateVal);
        this.filterData();
    },

    clearDateFilter: function() {
        this.selectedDate = '';
        document.getElementById('sh-date-filter').value = '';
        this.updateDateDisplay('');
        this.filterData();
    },

    updateDateDisplay: function(dateStr) {
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
    },

    // 🚨 ฟิลเตอร์ข้อมูลแบบ Multi-Condition (รองรับรหัสสินค้าและบาร์โค้ด)
    filterData: function() {
        const term = (document.getElementById('sh-search').value || "").toLowerCase();
        
        this.filteredLogs = this.allLogs.filter(log => {
            let matchText = true;
            let matchDate = true;

            if(term) {
                // ค้นหาจากชื่อ, หมายเหตุ, รหัสสินค้า, หรือ บาร์โค้ด
                matchText = (log.itemName || "").toLowerCase().includes(term) || 
                            (log.note || "").toLowerCase().includes(term) || 
                            (log.itemCode || "").toLowerCase().includes(term) || 
                            (log.barcode || "").toLowerCase().includes(term);
            }

            if(this.selectedDate) {
                let logDate = new Date(log.timestamp).toISOString().split('T')[0];
                matchDate = (logDate === this.selectedDate);
            }

            return matchText && matchDate;
        });

        this.currentPage = 1; 
        this.renderTable();
    },

    changeLimit: function(val) { this.currentLimit = Number(val); this.loadData(); },
    changeItemsPerPage: function(val) { this.itemsPerPage = Number(val); this.currentPage = 1; this.renderTable(); },
    changePage: function(direction) {
        const totalPages = Math.ceil(this.filteredLogs.length / this.itemsPerPage) || 1;
        this.currentPage += direction;
        if(this.currentPage < 1) this.currentPage = 1;
        if(this.currentPage > totalPages) this.currentPage = totalPages;
        this.renderTable();
    },

    renderTable: function() {
        const tbody = document.getElementById('sh-table-body');
        if (!tbody) return;

        const totalItems = this.filteredLogs.length;
        document.getElementById('sh-record-count').innerHTML = `พบข้อมูล <b>${totalItems}</b> รายการ (จากทั้งหมด ${this.allLogs.length} รายการที่โหลดมา)`;

        if (totalItems === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted"><i class="fa-solid fa-clock-rotate-left fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่พบประวัติการทำรายการ</td></tr>`;
            document.getElementById('sh-page-info').innerText = `หน้า 1 / 1`; return;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedItems = this.filteredLogs.slice(startIndex, endIndex);

        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        document.getElementById('sh-page-info').innerText = `หน้า ${this.currentPage} / ${totalPages}`;
        document.getElementById('sh-btn-prev').disabled = this.currentPage === 1;
        document.getElementById('sh-btn-next').disabled = this.currentPage === totalPages;

        let html = "";
        paginatedItems.forEach((log) => {
            const d = new Date(log.timestamp);
            const dateStr = d.toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'2-digit' });
            const timeStr = d.toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' });

            // 🚨 แมปข้อมูลจากฐานหลัก (กรณี Log เก่าไม่มี Item Code)
            const matchedItem = this.inventoryItems.find(i => i.id === log.itemId);
            let itemOrderVal = (matchedItem && matchedItem.order !== undefined && matchedItem.order !== null && matchedItem.order !== "" && matchedItem.order !== 999) ? matchedItem.order : '-';
            let finalItemCode = log.itemCode || (matchedItem ? matchedItem.item_code : '-');
            let finalBarcode = log.barcode || (matchedItem ? matchedItem.barcode : '-');

            let modeHtml = `<span class="badge bg-secondary">ไม่ระบุ</span>`;
            let detailHtml = ''; 

            if(log.mode === 'in_main') {
                modeHtml = `<span class="badge badge-soft-success px-3 py-1 shadow-sm rounded-pill"><i class="fa-solid fa-arrow-down me-1"></i> รับของเข้า (ใหญ่)</span>`;
                detailHtml = `บวกเพิ่ม <b>${log.qty}</b> เข้าสต๊อกใหญ่`;
            }
            else if(log.mode === 'transfer') {
                modeHtml = `<span class="badge badge-soft-primary px-3 py-1 shadow-sm rounded-pill"><i class="fa-solid fa-truck-ramp-box me-1"></i> โอนย้าย (ใหญ่ ➡️ เล็ก)</span>`;
                detailHtml = `หัก <b>${log.qty}</b> จากสต๊อกใหญ่ ไปเพิ่มในสต๊อกเล็ก`;
            }
            else if(log.mode === 'out_sub') {
                modeHtml = `<span class="badge badge-soft-danger px-3 py-1 shadow-sm rounded-pill"><i class="fa-solid fa-arrow-up-right-from-square me-1"></i> เบิกใช้งานจริง (เล็ก)</span>`;
                detailHtml = `เบิกตัดยอด <b>${log.qty}</b> จากสต๊อกหน้าเคาน์เตอร์ <br><small class="text-muted"><i class="fa-solid fa-tag"></i> ${log.note || 'ไม่มีหมายเหตุ'}</small>`;
            }
            else if(log.mode === 'audit_main') {
                modeHtml = `<span class="badge badge-soft-warning px-3 py-1 shadow-sm rounded-pill"><i class="fa-solid fa-clipboard-check me-1"></i> ปรับยอดจริง (ใหญ่)</span>`;
                detailHtml = `ระบบถูกบังคับอัปเดตยอดคงเหลือ <b class="text-dark">สต๊อกใหญ่</b> เป็น <b class="text-warning-dark">${log.qty}</b>`;
            }
            else if(log.mode === 'audit_sub') {
                modeHtml = `<span class="badge badge-soft-warning px-3 py-1 shadow-sm rounded-pill"><i class="fa-solid fa-clipboard-check me-1"></i> ปรับยอดจริง (เล็ก)</span>`;
                detailHtml = `ระบบถูกบังคับอัปเดตยอดคงเหลือ <b class="text-dark">สต๊อกหน้าเคาน์เตอร์</b> เป็น <b class="text-warning-dark">${log.qty}</b>`;
            }
            else if(log.mode === 'new_register') {
                modeHtml = `<span class="badge badge-soft-info px-3 py-1 shadow-sm rounded-pill"><i class="fa-solid fa-plus me-1"></i> ลงทะเบียนพัสดุใหม่</span>`;
                detailHtml = `สร้างพัสดุชิ้นนี้ขึ้นมาครั้งแรก โดยมียอดยกมาเริ่มต้น <b class="text-info">${log.qty}</b>`;
            }
            else if(log.mode === 'in_sub_restore') {
                modeHtml = `<span class="badge badge-soft-success px-3 py-1 shadow-sm rounded-pill"><i class="fa-solid fa-rotate-left me-1"></i> ดึงของคืน (เล็ก)</span>`;
                detailHtml = `ดึงของคืนกลับเข้าสต๊อกเคาน์เตอร์ <b>${log.qty}</b> หน่วย <br><small class="text-muted"><i class="fa-solid fa-tag"></i> ${log.note || 'การยกเลิก Flowsheet'}</small>`;
            }

            html += `
            <tr class="align-middle card-hover-float" style="cursor:default;">
                <td class="text-center fw-bold text-dark" style="font-size: 15px;">${itemOrderVal}</td>
                <td>
                    <span class="badge bg-light border text-dark shadow-sm px-2 py-1"><i class="fa-regular fa-calendar me-1 text-primary"></i> ${dateStr}</span><br>
                    <span class="small fw-bold text-muted mt-1 d-inline-block"><i class="fa-regular fa-clock me-1"></i> ${timeStr} น.</span>
                </td>
                <td>${modeHtml}</td>
                <td>
                    <div class="fw-bold text-dark" style="font-family:'Prompt'; font-size:14.5px;">${log.itemName || 'ไม่ทราบชื่อ'}</div>
                    <div class="mt-1 d-flex gap-2 flex-wrap">
                        <span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-family: monospace; font-size:11px;">รหัส: ${finalItemCode}</span>
                        <span class="badge bg-light text-secondary border shadow-sm" style="font-family: monospace; font-size:11px;"><i class="fa-solid fa-barcode"></i> ${finalBarcode}</span>
                    </div>
                </td>
                <td>
                    <div class="p-2 bg-light border rounded-3 shadow-sm text-dark" style="font-size: 13px; line-height: 1.4;">
                        ${detailHtml}
                    </div>
                </td>
                
                <td class="text-center text-muted small fw-bold"><i class="fa-solid fa-user-nurse me-1 text-primary"></i> ${log.user || 'Admin'}</td>
            </tr>`;
        });
        tbody.innerHTML = html;
    }
};
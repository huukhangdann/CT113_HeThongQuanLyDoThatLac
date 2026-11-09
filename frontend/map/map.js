/**
 * BẢN ĐỒ TƯƠNG TÁC 3 CẤP ĐỘ - CTU LOST & FOUND
 * Cấp 1: Ảnh sơ đồ thực tế CTU Khu II + Điểm có độ tương thích cao nhất màu ĐỎ
 * Click vào bất kỳ điểm nào: Hiển thị ngay Popup danh sách đồ vật sắp xếp theo độ tương thích giảm dần
 * Hỗ trợ chuyển tiếp sang Cấp 2 (Mặt đứng 2D) & Cấp 3 (Mặt bằng phòng học)
 */

(function () {
  "use strict";

  function getMapImagePath() {
    if (window.location.pathname.includes("/pages/")) {
      return "../map/ctu-campus-map.png";
    }
    return "./ctu-campus-map.png";
  }

  function getClaimLink(itemId) {
    if (window.location.pathname.includes("/pages/")) {
      return `claim.html?id=${itemId}&from=${encodeURIComponent("match-detail.html?level=room&room=p204")}`;
    }
    return `../pages/claim.html?id=${itemId}&from=../map/index.html`;
  }

  function getRoomTypeLabel(type) {
    switch (type) {
      case "class": return "Phòng học";
      case "lab": return "Phòng Lab";
      case "hall": return "Khu vực chung";
      case "stairs": return "Lối đi / Thang";
      case "office": return "Văn phòng";
      default: return "";
    }
  }

  // Thu thập toàn bộ đồ vật trong tòa nhà và gắn độ tương thích (compatibility score)
  function getBuildingItems(building) {
    const items = [];
    if (building.floors) {
      building.floors.forEach(f => {
        if (f.rooms) {
          f.rooms.forEach(r => {
            if (r.hasItem && r.item) {
              let score = r.item.matchScore;
              if (!score) {
                // Điểm mẫu khớp nối cho từng món đồ
                if (r.item.id === "find-1" || (r.item.title && r.item.title.includes("Ví da màu đen"))) score = 98;
                else if (r.item.id === "find-2" || (r.item.title && r.item.title.includes("Ví da nam màu nâu"))) score = 95;
                else if (r.item.id === "find-3" || (r.item.title && r.item.title.includes("Thẻ sinh viên"))) score = 91;
                else if (r.item.id === "find-4" || (r.item.title && r.item.title.includes("AirPods"))) score = 86;
                else if (building.id === "tv") score = 84;
                else if (building.id === "b1") score = 79;
                else if (building.id === "c2") score = 75;
                else if (building.id === "rua") score = 70;
                else score = 72;
              }
              items.push({
                ...r.item,
                floorName: f.name,
                roomName: r.name,
                matchScore: score
              });
            }
          });
        }
      });
    }
    // Sắp xếp thứ tự độ tương thích giảm dần (highest to lowest)
    items.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    return items;
  }

  function initMap(containerId = "map-viewport-container") {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!window.campusData) {
      console.error("campusData chưa được tải!");
      return;
    }

    const data = window.campusData;

    // Tìm tòa nhà có độ tương thích cao nhất trên toàn trường
    function findHighestMatchBuilding(buildings) {
      let highestBuilding = null;
      let maxScore = -1;
      buildings.forEach(b => {
        const items = getBuildingItems(b);
        if (items.length > 0) {
          const topScore = items[0].matchScore || 0;
          if (topScore > maxScore) {
            maxScore = topScore;
            highestBuilding = b;
          }
        }
      });
      return { building: highestBuilding || buildings.find(b => b.id === 'c1'), maxScore };
    }

    // ==========================================
    // RENDER CẤP 1: CAMPUS MAP
    // ==========================================
    function renderCampus() {
      const buildings = data.buildings;
      const totalItems = buildings.reduce((s, b) => s + b.totalItems, 0);
      const { building: highestMatchBuilding, maxScore } = findHighestMatchBuilding(buildings);

      const infoBarContent = `<span>Điểm có <strong>độ ghép nối cao nhất: <span class="text-rose-600 font-bold">${highestMatchBuilding ? (highestMatchBuilding.shortName || highestMatchBuilding.name) : 'Khoa CNTT&TT'} (${maxScore}% Khớp)</span></strong> — <em>Click vào tòa nhà để mở popup danh sách đồ tương thích</em></span>`;

      const legendContent = `
        <div class="legend-item">
          <div class="legend-dot-red"></div>
          <span><strong>Độ ghép nối cao nhất (${maxScore}%)</strong></span>
        </div>
        <div class="legend-item">
          <div class="legend-dot-yellow"></div>
          <span>Các điểm có đồ thất lạc khác</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot-gray"></div>
          <span>Chưa có báo nhặt</span>
        </div>
      `;

      container.innerHTML = `
        <div class="map-viewport-wrapper relative">
          <!-- Breadcrumb -->
          <div class="map-breadcrumb">
            <span class="current">📍 ${data.campusName}</span>
          </div>

          <!-- Info Bar -->
          <div class="map-info-bar">
            <span class="material-symbols-outlined">info</span>
            ${infoBarContent}
          </div>

          <!-- Khung ảnh bản đồ thực tế -->
          <div class="campus-map-wrapper relative">
            <img src="${getMapImagePath()}" alt="Sơ đồ Khu II ĐHCT" class="campus-map-img" />

            <!-- Lớp phủ chấm định vị -->
            <div class="campus-pins-overlay">
              ${buildings.map(b => renderPin(b, highestMatchBuilding)).join("")}
            </div>
          </div>

          <!-- Chú thích -->
          <div class="map-legend">
            ${legendContent}
          </div>

          <!-- POPUP DANH SÁCH ĐỒ VẬT SẮP XẾP THEO ĐỘ TƯƠNG THÍCH GIẢM DẦN -->
          <div id="map-building-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
            <div class="bg-white dark:bg-[#18191c] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
              <div class="flex items-start justify-between border-b border-stone-200 dark:border-stone-800 pb-3 shrink-0">
                <div class="flex items-center gap-2.5">
                  <div id="modal-building-badge" class="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold">
                    <span class="material-symbols-outlined text-[20px]">apartment</span>
                  </div>
                  <div>
                    <h3 id="modal-building-name" class="font-bold text-base text-[#1b1c1c] dark:text-white"></h3>
                    <p id="modal-building-sub" class="text-xs text-[#797675] dark:text-stone-400"></p>
                  </div>
                </div>
                <button type="button" id="modal-close-btn" class="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-lg">
                  <span class="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <!-- Danh sách đồ vật sắp xếp giảm dần -->
              <div id="modal-items-list" class="space-y-3 overflow-y-auto flex-1 pr-1"></div>

              <!-- Footer action -->
              <div class="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-800 shrink-0">
                <button type="button" id="modal-drilldown-btn" class="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 text-[#35483d] dark:text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer">
                  <span class="material-symbols-outlined text-[16px]">layers</span>
                  <span>Xem sơ đồ phân tầng (2D)</span>
                </button>
                <button type="button" id="modal-ok-close-btn" class="px-4 py-2 rounded-xl bg-[#35483d] hover:bg-[#28372e] text-white text-xs font-bold transition-colors cursor-pointer">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Gắn sự kiện click vào pin để mở modal danh sách đồ
      container.querySelectorAll(".campus-pin").forEach(pin => {
        pin.addEventListener("click", () => {
          const id = pin.dataset.id;
          const b = buildings.find(x => x.id === id);
          if (b) {
            openBuildingModal(b);
          }
        });
      });
    }

    function renderPin(b, highestMatchBuilding) {
      const hasItems = b.totalItems > 0;
      const isHighest = highestMatchBuilding && b.id === highestMatchBuilding.id;

      if (isHighest) {
        // TÒA NHÀ CÓ ĐỘ GHÉP NỐI CAO NHẤT: MÀU ĐỎ NỔI BẬT
        return `
          <div class="campus-pin pin-target-red" style="left: ${b.pctX}%; top: ${b.pctY}%; z-index: 35;" data-id="${b.id}" title="${b.name}">
            <div class="campus-pin-pulse"></div>
            <div class="campus-pin-badge">${b.totalItems || "!"}</div>
            <div class="campus-pin-label" style="background: rgba(186, 26, 26, 0.95); font-weight: 700;">🔴 ${b.shortName || b.code}</div>
            <div class="campus-pin-tooltip">
              <div class="tt-name" style="color: #dc2626;">🔴 ${b.name}</div>
              <div class="tt-count">Độ tương thích cao nhất (${b.totalItems} đồ) — Click xem danh sách</div>
            </div>
          </div>
        `;
      } else if (hasItems) {
        // CÁC ĐIỂM CÓ ĐỒ KHÁC: SÁNG VÀNG
        return `
          <div class="campus-pin pin-yellow" style="left: ${b.pctX}%; top: ${b.pctY}%;" data-id="${b.id}" title="${b.name}">
            <div class="campus-pin-pulse"></div>
            <div class="campus-pin-badge">${b.totalItems}</div>
            <div class="campus-pin-label">${b.shortName || b.code}</div>
            <div class="campus-pin-tooltip">
              <div class="tt-name">${b.name}</div>
              <div class="tt-count">🟡 ${b.totalItems} đồ nhặt được — Click xem danh sách</div>
            </div>
          </div>
        `;
      } else {
        // CHƯA CÓ BÁO NHẶT: CHẤM XÁM
        return `
          <div class="campus-pin pin-empty" style="left: ${b.pctX}%; top: ${b.pctY}%;" data-id="${b.id}">
            <div class="campus-pin-badge"></div>
            <div class="campus-pin-label">${b.shortName || b.code}</div>
            <div class="campus-pin-tooltip">
              <div class="tt-name">${b.name}</div>
              <div class="tt-count" style="color: #727873;">Chưa có báo nhặt</div>
            </div>
          </div>
        `;
      }
    }

    // Modal hiển thị danh sách đồ vật sắp xếp theo độ tương thích giảm dần
    function openBuildingModal(building) {
      const modal = document.getElementById("map-building-modal");
      if (!modal) return;

      const nameEl = document.getElementById("modal-building-name");
      const subEl = document.getElementById("modal-building-sub");
      const listEl = document.getElementById("modal-items-list");
      const drillBtn = document.getElementById("modal-drilldown-btn");

      const items = getBuildingItems(building);

      nameEl.textContent = building.name;
      subEl.textContent = items.length > 0 
        ? `Tìm thấy ${items.length} món đồ đối chiếu (Sắp xếp theo độ tương thích giảm dần)`
        : `Hiện chưa có bài đăng nhặt đồ nào tại tòa nhà này.`;

      if (items.length === 0) {
        listEl.innerHTML = `
          <div class="p-8 text-center text-[#797675] dark:text-stone-400 space-y-2">
            <span class="material-symbols-outlined text-4xl text-stone-300 dark:text-stone-600">inventory_2</span>
            <p class="text-xs">Chưa có thông tin đồ thất lạc tại vị trí này.</p>
          </div>
        `;
        if (drillBtn) drillBtn.style.display = "none";
      } else {
        if (drillBtn) drillBtn.style.display = "inline-flex";
        listEl.innerHTML = items.map(item => `
          <div class="flex items-center gap-3 p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-[#35483d] dark:hover:border-emerald-500 bg-[#fcf9f8] dark:bg-stone-800/40 transition-all shadow-2xs group">
            <img src="${item.image || 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=300&q=80'}" alt="${item.title}" class="w-14 h-14 rounded-lg object-cover shrink-0 border border-stone-200 dark:border-stone-700">
            <div class="flex-1 min-w-0 space-y-0.5">
              <div class="flex items-center justify-between gap-1.5">
                <h4 class="font-bold text-xs sm:text-sm text-[#1b1c1c] dark:text-white truncate">${item.title}</h4>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${(item.matchScore >= 90) ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'}">
                  ${item.matchScore}% Khớp
                </span>
              </div>
              <p class="text-[11px] text-[#797675] dark:text-stone-400">${item.floorName} • ${item.roomName}</p>
              <p class="text-[10px] text-[#797675] dark:text-stone-400 flex items-center gap-1">
                <span class="material-symbols-outlined text-[13px]">schedule</span>
                <span>${item.time || 'Hôm nay, 09:30'}</span>
              </p>
            </div>
            <a href="${getClaimLink(item.id)}" class="px-3 py-1.5 rounded-lg bg-[#35483d] hover:bg-[#28372e] text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1">
              <span>Xem chi tiết</span>
              <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
            </a>
          </div>
        `).join("");
      }

      modal.classList.remove("hidden");

      // Đóng modal
      const closeFn = () => modal.classList.add("hidden");
      document.getElementById("modal-close-btn").onclick = closeFn;
      document.getElementById("modal-ok-close-btn").onclick = closeFn;
      modal.onclick = (e) => { if (e.target === modal) closeFn(); };

      if (drillBtn) {
        drillBtn.onclick = () => {
          closeFn();
          if (building.floors && building.floors.length > 0) {
            renderBuilding(building);
          }
        };
      }
    }

    // ==========================================
    // RENDER CẤP 2: MẶT ĐỨNG 2D
    // ==========================================
    function renderBuilding(building) {
      const sortedFloors = [...building.floors].sort((a, b) => b.floorNumber - a.floorNumber);
      const allFloors = [];
      for (let i = building.totalFloors; i >= 1; i--) {
        const existing = sortedFloors.find(f => f.floorNumber === i);
        allFloors.push(existing || { floorNumber: i, name: `Tầng ${i}`, itemsCount: 0, rooms: [] });
      }

      container.innerHTML = `
        <div class="map-viewport-wrapper">
          <!-- Breadcrumb -->
          <div class="map-breadcrumb">
            <a href="#" id="bc-to-campus">${data.campusName}</a>
            <span class="sep">›</span>
            <span class="current">${building.shortName || building.code}</span>
          </div>

          <!-- Toolbar -->
          <div class="map-toolbar">
            <button class="map-back-btn" id="btn-back-campus">
              <span class="material-symbols-outlined">arrow_back</span>
              Quay lại sơ đồ trường
            </button>
            <div class="map-toolbar-info">
              <span class="map-toolbar-title">${building.name}</span>
              <span class="map-toolbar-sub">${building.totalItems} bài đăng nhặt đồ</span>
            </div>
          </div>

          <!-- Info Bar -->
          <div class="map-info-bar">
            <span class="material-symbols-outlined">layers</span>
            <span>Mặt đứng ${building.totalFloors} tầng — <strong>Click vào tầng có chấm đỏ</strong> để xem chi tiết phòng học</span>
          </div>

          <!-- Khối chữ nhật 2D phân tầng gạch ngang -->
          <div class="elevation-container">
            <div class="elevation-rect-building">
              ${allFloors.map(f => renderFloorRow(f)).join("")}
            </div>
          </div>
        </div>
      `;

      document.getElementById("btn-back-campus").addEventListener("click", renderCampus);
      document.getElementById("bc-to-campus").addEventListener("click", (e) => {
        e.preventDefault();
        renderCampus();
      });

      container.querySelectorAll(".elevation-floor-row.has-items").forEach(el => {
        el.addEventListener("click", () => {
          const floorNum = parseInt(el.dataset.floor, 10);
          const floor = building.floors.find(f => f.floorNumber === floorNum);
          if (floor) {
            renderFloorPlan(building, floor);
          }
        });
      });
    }

    function renderFloorRow(floor) {
      const hasItems = floor.itemsCount > 0;
      const itemRooms = floor.rooms ? floor.rooms.filter(r => r.hasItem) : [];

      return `
        <div class="elevation-floor-row ${hasItems ? "has-items" : ""}" data-floor="${floor.floorNumber}">
          <div class="floor-col-label">
            <span>${floor.name}</span>
          </div>
          <div class="floor-col-status">
            ${hasItems ? `
              <div class="floor-red-dot"></div>
              <span class="floor-items-text">${floor.itemsCount} đồ nhặt</span>
              <span class="floor-rooms-tag">${itemRooms.map(r => r.name).join(", ")}</span>
              <span class="material-symbols-outlined floor-action-arrow">chevron_right</span>
            ` : `
              <span class="floor-empty-text">Không có báo nhặt</span>
            `}
          </div>
        </div>
      `;
    }

    // ==========================================
    // RENDER CẤP 3: SƠ ĐỒ MẶT BẰNG PHÒNG HỌC (GRID)
    // ==========================================
    function renderFloorPlan(building, floor) {
      const rooms = floor.rooms || [];
      const itemRooms = rooms.filter(r => r.hasItem);

      container.innerHTML = `
        <div class="map-viewport-wrapper">
          <!-- Breadcrumb -->
          <div class="map-breadcrumb">
            <a href="#" id="bc-to-campus-2">${data.campusName}</a>
            <span class="sep">›</span>
            <a href="#" id="bc-to-building">${building.shortName || building.code}</a>
            <span class="sep">›</span>
            <span class="current">${floor.name}</span>
          </div>

          <!-- Toolbar -->
          <div class="map-toolbar">
            <button class="map-back-btn" id="btn-back-building">
              <span class="material-symbols-outlined">arrow_back</span>
              Quay lại ${building.shortName || building.code}
            </button>
            <div class="map-toolbar-info">
              <span class="map-toolbar-title">${building.shortName} — ${floor.name}</span>
              <span class="map-toolbar-sub">${floor.itemsCount} đồ nhặt</span>
            </div>
          </div>

          <!-- Info Bar -->
          <div class="map-info-bar">
            <span class="material-symbols-outlined">meeting_room</span>
            <span>Sơ đồ mặt bằng phòng học — <strong>Click vào phòng có chấm đỏ</strong> để xem chi tiết món đồ nhặt được</span>
          </div>

          <!-- Grid phòng học -->
          <div class="floorplan-container">
            <div class="floorplan-wrapper">
              <div class="floorplan-header">
                <span class="floorplan-title">Mặt bằng ${floor.name}</span>
                <span class="text-xs text-[#727873]">Tìm thấy ${itemRooms.length} vị trí có đồ thất lạc</span>
              </div>

              <div class="rooms-grid">
                ${rooms.map(r => renderRoomCell(r)).join("")}
              </div>
            </div>
          </div>
        </div>

        <div id="item-popover" class="item-popover-overlay"></div>
      `;

      document.getElementById("btn-back-building").addEventListener("click", () => renderBuilding(building));
      document.getElementById("bc-to-building").addEventListener("click", (e) => {
        e.preventDefault();
        renderBuilding(building);
      });
      document.getElementById("bc-to-campus-2").addEventListener("click", (e) => {
        e.preventDefault();
        renderCampus();
      });

      container.querySelectorAll(".room-cell.has-item").forEach(cell => {
        cell.addEventListener("click", () => {
          const roomId = cell.dataset.roomId;
          const room = rooms.find(r => r.id === roomId);
          if (room && room.item) {
            showItemPopover(room.item);
          }
        });
      });
    }

    function renderRoomCell(room) {
      const hasItem = room.hasItem && room.item;
      const typeClass = room.type ? `type-${room.type}` : "";
      const colStyle = room.col ? `grid-column: ${room.col};` : "";
      const rowStyle = room.row ? `grid-row: ${room.row};` : "";

      return `
        <div class="room-cell ${typeClass} ${hasItem ? "has-item" : ""}"
             style="${colStyle} ${rowStyle}"
             data-room-id="${room.id}">
          <div class="room-header">
            <span class="room-name">${room.name}</span>
            <span class="room-type-tag">${getRoomTypeLabel(room.type)}</span>
          </div>
          ${hasItem ? `
            <div class="room-item-pin">
              <span class="pin-dot-blink"></span>
              <span>Có đồ nhặt</span>
            </div>
          ` : ""}
        </div>
      `;
    }

    function showItemPopover(item) {
      const popover = document.getElementById("item-popover");
      if (!popover) return;

      popover.innerHTML = `
        <div class="item-popover-card">
          <img src="${item.image}" alt="${item.title}" class="popover-image" />
          <div class="popover-body">
            <span class="popover-badge">${item.category}</span>
            <h4 class="popover-title">${item.title}</h4>
            <div class="popover-info-list">
              <div class="popover-info-item">
                <span class="material-symbols-outlined">location_on</span>
                <span>${item.location}</span>
              </div>
              <div class="popover-info-item">
                <span class="material-symbols-outlined">schedule</span>
                <span>${item.time}</span>
              </div>
              <div class="popover-info-item">
                <span class="material-symbols-outlined">verified</span>
                <span>Trạng thái: <strong>${item.status}</strong></span>
              </div>
            </div>
            <div class="popover-actions">
              <button class="popover-close-btn" id="popover-close-btn">Đóng</button>
              <a href="${getClaimLink(item.id)}" class="popover-detail-btn">
                <span>Xem chi tiết bài đăng</span>
                <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      `;

      popover.classList.add("visible");

      document.getElementById("popover-close-btn").addEventListener("click", () => {
        popover.classList.remove("visible");
      });
      popover.addEventListener("click", (e) => {
        if (e.target === popover) {
          popover.classList.remove("visible");
        }
      });
    }

    // Kiểm tra URL query params để điều hướng trực tiếp cấp độ bản đồ
    const urlParams = new URLSearchParams(window.location.search);
    const targetLevel = urlParams.get('level');
    const targetRoomId = (urlParams.get('room') || 'p204').toLowerCase();

    if (targetLevel === 'room' || targetLevel === '3') {
      let foundBuilding = null;
      let foundFloor = null;

      for (const b of data.buildings) {
        if (b.floors) {
          for (const f of b.floors) {
            if (f.rooms && f.rooms.some(r => r.id.toLowerCase().includes(targetRoomId) || r.name.toLowerCase().includes(targetRoomId))) {
              foundBuilding = b;
              foundFloor = f;
              break;
            }
          }
        }
        if (foundBuilding) break;
      }

      if (!foundBuilding) {
        foundBuilding = data.buildings.find(b => b.id === 'c1');
        foundFloor = foundBuilding ? foundBuilding.floors.find(f => f.floorNumber === 2) : null;
      }

      if (foundBuilding && foundFloor) {
        renderFloorPlan(foundBuilding, foundFloor);
        return;
      }
    }

    renderCampus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initMap());
  } else {
    initMap();
  }

  window.initCampusMap = initMap;
})();

/**
 * BẢN ĐỒ TƯƠNG TÁC 3 CẤP ĐỘ - CTU LOST & FOUND
 * Cấp 1: Ảnh sơ đồ thực tế CTU Khu II + Chấm đỏ định vị
 * Cấp 2: Mặt đứng 2D tối giản (Hình chữ nhật phân tầng bằng gạch ngang)
 * Cấp 3: Sơ đồ phòng học (Grid layout + Popover chi tiết món đồ)
 *
 * Hoạt động độc lập cho cả map/index.html và nhúng vào pages/find.html
 */

(function () {
  "use strict";

  // Đường dẫn ảnh bản đồ và trang claim tùy theo vị trí chạy
  function getMapImagePath() {
    if (window.location.pathname.includes("/pages/")) {
      return "../map/ctu-campus-map.png";
    }
    return "./ctu-campus-map.png";
  }

  function getClaimLink(itemId) {
    if (window.location.pathname.includes("/pages/")) {
      return `claim.html?id=${itemId}&from=find.html`;
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

  // Khởi tạo bản đồ vào container
  function initMap(containerId = "map-viewport-container") {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!window.campusData) {
      console.error("campusData chưa được tải!");
      return;
    }

    const data = window.campusData;

    // ==========================================
    // RENDER CẤP 1: CAMPUS MAP (ẢNH THỰC TẾ + CHẤM ĐỎ)
    // ==========================================
    function renderCampus() {
      const buildings = data.buildings;
      const totalItems = buildings.reduce((s, b) => s + b.totalItems, 0);

      container.innerHTML = `
        <div class="map-viewport-wrapper">
          <!-- Breadcrumb -->
          <div class="map-breadcrumb">
            <span class="current">📍 ${data.campusName}</span>
          </div>

          <!-- Info Bar -->
          <div class="map-info-bar">
            <span class="material-symbols-outlined">info</span>
            <span>Tổng cộng <strong>${totalItems} bài đăng nhặt đồ</strong> tại ${buildings.filter(b => b.totalItems > 0).length} tòa nhà — <em>Click vào chấm đỏ trên bản đồ để xem chi tiết từng tầng</em></span>
          </div>

          <!-- Khung ảnh bản đồ thực tế -->
          <div class="campus-map-wrapper">
            <img src="${getMapImagePath()}" alt="Sơ đồ Khu II ĐHCT" class="campus-map-img" />

            <!-- Lớp phủ chấm đỏ -->
            <div class="campus-pins-overlay">
              ${buildings.map(b => renderPin(b)).join("")}
            </div>
          </div>

          <!-- Chú thích -->
          <div class="map-legend">
            <div class="legend-item">
              <div class="legend-dot-red"></div>
              <span>Có đồ nhặt được (Click để xem)</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot-gray"></div>
              <span>Chưa có báo nhặt</span>
            </div>
          </div>
        </div>
      `;

      // Gắn sự kiện click vào pin
      container.querySelectorAll(".campus-pin").forEach(pin => {
        pin.addEventListener("click", () => {
          const id = pin.dataset.id;
          const b = buildings.find(x => x.id === id);
          if (b && b.totalItems > 0 && b.floors && b.floors.length > 0) {
            renderBuilding(b);
          }
        });
      });
    }

    function renderPin(b) {
      const hasItems = b.totalItems > 0;
      if (hasItems) {
        return `
          <div class="campus-pin" style="left: ${b.pctX}%; top: ${b.pctY}%;" data-id="${b.id}" title="${b.name}">
            <div class="campus-pin-pulse"></div>
            <div class="campus-pin-badge">${b.totalItems}</div>
            <div class="campus-pin-label">${b.shortName || b.code}</div>
            <div class="campus-pin-tooltip">
              <div class="tt-name">${b.name}</div>
              <div class="tt-count">🔴 ${b.totalItems} đồ nhặt được — Click để xem</div>
            </div>
          </div>
        `;
      } else {
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

    // ==========================================
    // RENDER CẤP 2: MẶT ĐỨNG 2D HÌNH CHỮ NHẬT PHÂN TẦNG
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

      // Gắn sự kiện quay lại
      document.getElementById("btn-back-campus").addEventListener("click", renderCampus);
      document.getElementById("bc-to-campus").addEventListener("click", (e) => {
        e.preventDefault();
        renderCampus();
      });

      // Gắn sự kiện click vào tầng có đồ
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

        <!-- Popover container -->
        <div id="item-popover" class="item-popover-overlay"></div>
      `;

      // Gắn sự kiện quay lại
      document.getElementById("btn-back-building").addEventListener("click", () => renderBuilding(building));
      document.getElementById("bc-to-building").addEventListener("click", (e) => {
        e.preventDefault();
        renderBuilding(building);
      });
      document.getElementById("bc-to-campus-2").addEventListener("click", (e) => {
        e.preventDefault();
        renderCampus();
      });

      // Gắn sự kiện click phòng có đồ
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

    // ==========================================
    // POPOVER CHI TIẾT MÓN ĐỒ
    // ==========================================
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

      // Đóng popover
      document.getElementById("popover-close-btn").addEventListener("click", () => {
        popover.classList.remove("visible");
      });
      popover.addEventListener("click", (e) => {
        if (e.target === popover) {
          popover.classList.remove("visible");
        }
      });
    }

    // Bắt đầu từ Cấp 1
    renderCampus();
  }

  // Tự động khởi chạy nếu container đã có sẵn trên trang
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initMap());
  } else {
    initMap();
  }

  // Export để trang khác có thể gọi thủ công
  window.initCampusMap = initMap;
})();

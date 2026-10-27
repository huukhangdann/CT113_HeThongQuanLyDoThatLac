class AppHeader extends HTMLElement {
  connectedCallback() {
    const currentPath =
      window.location.pathname.split("/").pop() || "index.html";

    const getLinkClass = (pageNames) => {
      const pages = Array.isArray(pageNames) ? pageNames : [pageNames];
      const isActive =
        pages.includes(currentPath) ||
        (currentPath === "" && pages.includes("index.html"));

      if (isActive) {
        return "flex items-center h-full text-sm font-semibold text-[#1b1c1b] border-b-2 border-[#1f3227]";
      }
      return "flex items-center h-full text-sm font-medium text-[#777771] hover:text-[#1b1c1b] transition-colors";
    };

    // Kiểm tra trạng thái đăng nhập từ localStorage
    const isLoggedIn = localStorage.getItem("ctu_user_logged_in") !== "false";

    const userClusterHtml = isLoggedIn
      ? `
        <span class="hidden sm:inline-block px-3 py-1 bg-stone-200/60 text-stone-700 rounded-md text-xs font-medium">SV Khu II</span>

        <!-- Khung chứa Icon Chuông & Dropdown Popover (Relative Anchor) -->
        <div class="relative flex items-center">
          <!-- Nút Chuông Thông báo -->
          <button id="notif-bell-btn" type="button" aria-label="Thông báo" class="w-9 h-9 rounded-full bg-stone-200/60 hover:bg-stone-200 text-[#1f3227] flex items-center justify-center relative transition-all duration-200 cursor-pointer focus:outline-none" title="Thông báo">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            <!-- Badge chấm đỏ chưa đọc -->
            <span id="notif-badge" class="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#ba1a1a] ring-2 ring-[#F7F6F2]"></span>
          </button>

          <!-- DROPDOWN POPUP THÔNG BÁO -->
          <div id="notif-dropdown" class="hidden absolute top-full mt-2.5 w-[360px] sm:w-[410px] z-50 bg-white rounded-2xl border border-[#e7e1df] shadow-2xl transition-all duration-200 right-0 sm:-right-24 text-left">
            <!-- 1. Header Dropdown -->
            <div class="px-5 pt-4 pb-2 flex items-center justify-between bg-white relative rounded-t-2xl border-b border-[#f0edec]">
              <h3 class="font-extrabold text-[#1b1c1c] text-xl tracking-tight">
                Thông báo mới
              </h3>
              <div class="relative">
                <button id="notif-header-options-btn" aria-label="Tùy chọn thông báo" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f0edec] text-[#4a4746] transition-colors focus:outline-none cursor-pointer" type="button">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
                  </svg>
                </button>
                <!-- Menu tùy chọn header -->
                <div id="notif-header-menu" class="hidden absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-[#e7e1df] py-1.5 z-50">
                  <button id="notif-mark-all-read-btn" type="button" class="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#1b1c1c] hover:bg-[#f6f3f2] flex items-center gap-2.5 transition-colors cursor-pointer">
                    <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    <span>Đánh dấu tất cả là đã đọc</span>
                  </button>
                  <button id="notif-delete-all-btn" type="button" class="w-full px-3.5 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer">
                    <svg class="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    <span>Xóa tất cả</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- 2. Danh sách thông báo -->
            <div id="notif-list-container" class="flex flex-col bg-white py-1 max-h-[380px] overflow-y-auto">
              <!-- Render động -->
            </div>

            <!-- 3. Footer của Popup -->
            <div class="p-4 pt-2 bg-white text-center rounded-b-2xl border-t border-[#f0edec]">
              <a href="notifications.html" class="w-full py-2.5 px-4 bg-[#f0edec] hover:bg-[#e7e1df] text-[#1b1c1c] text-sm font-semibold rounded-xl text-center transition-colors block shadow-sm">
                Xem các thông báo trước đó
              </a>
            </div>
          </div>
        </div>

        <!-- User Avatar & Popup Dropdown -->
        <div class="relative flex items-center">
          <button id="user-menu-btn" type="button" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-200/60 hover:bg-stone-200 text-[#1b1c1c] text-sm font-medium cursor-pointer transition-colors" title="Tài khoản: Đặng Hữu Khang">
            <span class="material-symbols-outlined text-[22px] text-[#35483d]">account_circle</span>
            <span>Đặng Hữu Khang</span>
          </button>

          <div id="user-menu-dropdown" class="hidden absolute right-0 top-full mt-2 w-[280px] z-50 bg-white rounded-xl border border-[#e7e1df] shadow-xl overflow-hidden text-left">
            <div class="p-4 bg-gray-50/50 border-b border-[#e7e1df]">
              <h3 class="font-bold text-base text-[#1b1c1c]">Đặng Hữu Khang</h3>
              <p class="text-sm font-medium text-[#797675] mt-0.5">MSSV: B2404990</p>
            </div>
            <div class="p-2 border-b border-[#e7e1df]">
              <div class="flex items-center gap-3 p-2 text-sm text-[#4a4746] rounded-md">
                <svg class="w-4 h-4 text-[#797675] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                <span class="truncate">khangb2404990@student.ctu.edu.vn</span>
              </div>
              <div class="flex items-center gap-3 p-2 text-sm text-[#4a4746] rounded-md">
                <svg class="w-4 h-4 text-[#797675] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                <span>093 9715 761</span>
              </div>
            </div>
            <div class="p-2">
              <a href="login.html" id="switch-account-btn" class="w-full flex items-center gap-3 p-2 text-sm text-[#1b1c1c] font-medium rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                <svg class="w-4 h-4 text-[#797675] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                <span>Chuyển tài khoản</span>
              </a>
              <a href="login.html" id="logout-btn" class="w-full flex items-center gap-3 p-2 text-sm text-red-600 font-medium rounded-md hover:bg-red-50 transition-colors cursor-pointer">
                <svg class="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                <span>Đăng xuất</span>
              </a>
            </div>
          </div>
        </div>
      `
      : `
        <!-- Trạng thái chưa đăng nhập / đã đăng xuất -->
        <a href="login.html" class="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1f3227] hover:bg-[#35483d] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer">
          <span class="material-symbols-outlined text-[18px]">login</span>
          <span>Đăng nhập</span>
        </a>
      `;

    this.innerHTML = `
      <header class="sticky top-0 z-50 bg-[#F7F6F2]/90 backdrop-blur-md border-b border-[#E6E4DE]">
        <div class="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 flex items-center justify-between h-16 md:h-20">
          
          <!-- Logo Brand -->
          <a href="index.html" class="flex items-center gap-2.5 group">
            <div class="w-8 h-8 flex items-center justify-center text-[#1f3227] transition-transform group-hover:scale-105">
              <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18C5 19.94 8.13 22 12 22C15.87 22 19 19.94 19 17.18V13.18L12 17L5 13.18Z"></path>
              </svg>
            </div>
            <span class="text-lg md:text-xl font-bold text-[#1b1c1b] tracking-tight">CTU Lost & Found</span>
          </a>

          <!-- Navigation Links -->
          <nav class="hidden md:flex items-center gap-8 h-full">
            <a href="index.html" class="${getLinkClass("index.html")}">Trang chủ</a>
            <a href="find.html" class="${getLinkClass("find.html")}">Tìm đồ</a>
            <a href="post.html" class="${getLinkClass(["post.html", "post-lost.html", "post-found.html"])}">Đăng tin</a>
            
            <!-- THÔNG BÁO: Active khi ở trang notifications.html hoặc requests.html -->
            <a href="notifications.html" class="${getLinkClass(["notifications.html", "requests.html"])}">Thông báo</a>
          </nav>

          <!-- User Info & Action Cluster -->
          <div class="flex items-center gap-3">
            ${userClusterHtml}
          </div>

        </div>
      </header>
    `;

    // ==========================================
    // NOTIFICATION DROPDOWN DATA & LOGIC
    // ==========================================
    const defaultNotifs = [
      {
        id: 1,
        title: "Yêu cầu xác minh quyền sở hữu",
        time: "10 phút trước",
        desc: 'Nguyễn Văn A đã gửi câu trả lời xác nhận chiếc ví da màu nâu tại Tòa C1: "Ví của mình hiệu Leonardo da bò sáp".',
        isUnread: true,
        type: "verification",
        link: "requests.html"
      },
      {
        id: 2,
        title: "Khớp đồ thất lạc mới (99%)",
        time: "25 phút trước",
        desc: 'Phát hiện bài đăng nhặt được "Bóp cầm tay màu nâu kèm thẻ sinh viên CTU" trùng khớp đặc điểm tin báo mất của bạn.',
        isUnread: true,
        type: "match",
        link: "match-detail.html"
      },
      {
        id: 3,
        title: "Đã tiếp nhận bàn giao tại PCTSV",
        time: "2 giờ trước",
        desc: 'Đồ vật "Ví da nam màu nâu - Tòa C1" đã được bàn giao an toàn và niêm phong bảo quản tại Phòng Công tác Sinh viên (Khu II).',
        isUnread: false,
        type: "handover",
        link: "notifications.html"
      }
    ];

    const getStoredNotifs = () => {
      try {
        const stored = localStorage.getItem("ctu_notifications_data");
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Lỗi đọc dữ liệu thông báo:", e);
      }
      return defaultNotifs;
    };

    const saveNotifs = (data) => {
      localStorage.setItem("ctu_notifications_data", JSON.stringify(data));
    };

    let notifications = getStoredNotifs();

    const notifBadge = this.querySelector("#notif-badge");
    const notifListContainer = this.querySelector("#notif-list-container");
    const notifHeaderMenu = this.querySelector("#notif-header-menu");
    const notifBellBtn = this.querySelector("#notif-bell-btn");
    const notifDropdown = this.querySelector("#notif-dropdown");
    const notifHeaderOptionsBtn = this.querySelector("#notif-header-options-btn");
    const markAllReadBtn = this.querySelector("#notif-mark-all-read-btn");
    const deleteAllBtn = this.querySelector("#notif-delete-all-btn");

    const updateBadge = () => {
      const hasUnread = notifications.some((n) => n.isUnread);
      if (notifBadge) {
        if (hasUnread) {
          notifBadge.classList.remove("hidden");
        } else {
          notifBadge.classList.add("hidden");
        }
      }
    };

    const renderNotifications = () => {
      if (!notifListContainer) return;
      updateBadge();

      if (notifications.length === 0) {
        notifListContainer.innerHTML = `
          <div class="py-8 px-5 text-center">
            <div class="w-12 h-12 mx-auto rounded-full bg-[#f0edec] text-[#797675] flex items-center justify-center mb-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </div>
            <p class="text-sm font-semibold text-[#1b1c1c]">Không có thông báo mới</p>
            <p class="text-xs text-[#797675] mt-0.5">Bạn đã xem hết các thông báo gần đây</p>
            <button id="notif-reset-demo-btn" type="button" class="mt-3 text-xs text-[#35483d] font-semibold underline hover:text-[#1f3227] cursor-pointer">
              Khôi phục 3 thông báo mẫu
            </button>
          </div>
        `;

        const resetBtn = notifListContainer.querySelector("#notif-reset-demo-btn");
        if (resetBtn) {
          resetBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            notifications = JSON.parse(JSON.stringify(defaultNotifs));
            saveNotifs(notifications);
            renderNotifications();
          });
        }
        return;
      }

      notifListContainer.innerHTML = notifications.map((item, index) => {
        let iconHtml = "";
        if (item.type === "verification") {
          iconHtml = `
            <div class="w-9 h-9 bg-emerald-50 text-[#35483d] border border-emerald-200/80 flex items-center justify-center rounded-full">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </div>
          `;
        } else if (item.type === "match") {
          iconHtml = `
            <div class="w-9 h-9 bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center rounded-full">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </div>
          `;
        } else {
          iconHtml = `
            <div class="w-9 h-9 bg-neutral-100 text-[#797675] border border-[#e7e1df] flex items-center justify-center rounded-full">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </div>
          `;
        }

        const isLastItem = index === notifications.length - 1;
        const menuPositionClass = isLastItem ? "bottom-full mb-1 right-0" : "top-full mt-1 right-0";

        return `
          <div class="group flex items-center gap-3 px-5 py-3 hover:bg-[#f6f3f2] transition-colors cursor-pointer relative notif-row" data-id="${item.id}" data-link="${item.link}">
            <div class="relative flex-shrink-0">
              ${iconHtml}
            </div>
            <div class="flex-1 min-w-0 pr-1 notif-content-area">
              <div class="flex items-center justify-between gap-1 mb-0.5">
                <h4 class="${item.isUnread ? 'font-bold text-[#1b1c1c]' : 'font-semibold text-[#4a4746]'} text-xs truncate">
                  ${item.title}
                </h4>
                <span class="text-[11px] text-[#797675] whitespace-nowrap">
                  ${item.time}
                </span>
              </div>
              <div class="relative flex items-center overflow-hidden w-full h-5 text-xs text-[#4a4746] mt-0.5">
                <span class="whitespace-nowrap overflow-hidden text-ellipsis block w-full pr-6">
                  ${item.desc}
                </span>
              </div>
            </div>
            
            <!-- Right side: Blue unread dot & Hover 3-dots action button -->
            <div class="flex-shrink-0 relative w-8 h-8 flex items-center justify-center">
              <span class="w-3 h-3 rounded-full bg-[#1877F2] ${item.isUnread ? 'block' : 'hidden'} group-hover:opacity-0 transition-opacity"></span>
              <button aria-label="Tùy chọn thông báo" class="notif-item-options-btn absolute inset-0 w-8 h-8 rounded-full bg-white shadow-sm border border-[#e7e1df] hover:bg-[#f0edec] flex items-center justify-center text-[#4a4746] opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none cursor-pointer" type="button" data-id="${item.id}">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
                </svg>
              </button>

              <!-- Dropdown Menu của từng hàng thông báo -->
              <div class="notif-item-menu hidden absolute ${menuPositionClass} w-48 bg-white rounded-xl shadow-xl border border-[#e7e1df] py-1.5 z-40" data-id="${item.id}">
                <button type="button" class="notif-toggle-read-btn w-full px-3.5 py-2 text-left text-xs font-semibold text-[#1b1c1c] hover:bg-[#f6f3f2] flex items-center gap-2.5 transition-colors cursor-pointer" data-id="${item.id}">
                  ${item.isUnread ? `
                    <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                    <span>Đánh dấu là đã đọc</span>
                  ` : `
                    <span class="w-3.5 h-3.5 rounded-full bg-[#1877F2] flex-shrink-0"></span>
                    <span>Đánh dấu là chưa đọc</span>
                  `}
                </button>
                <button type="button" class="notif-delete-item-btn w-full px-3.5 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer" data-id="${item.id}">
                  <svg class="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                  <span>Xóa thông báo</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join("");

      attachItemEvents();
    };

    const attachItemEvents = () => {
      // 1. Khi click vào nút ... của từng item
      const itemOptionBtns = notifListContainer.querySelectorAll(".notif-item-options-btn");
      itemOptionBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = Number(btn.dataset.id);
          const menu = notifListContainer.querySelector(`.notif-item-menu[data-id="${id}"]`);
          
          notifListContainer.querySelectorAll(".notif-item-menu").forEach((m) => {
            if (m !== menu) m.classList.add("hidden");
          });
          if (notifHeaderMenu) notifHeaderMenu.classList.add("hidden");

          if (menu) {
            menu.classList.toggle("hidden");
          }
        });
      });

      // 2. Toggle đọc / chưa đọc
      const toggleReadBtns = notifListContainer.querySelectorAll(".notif-toggle-read-btn");
      toggleReadBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = Number(btn.dataset.id);
          const target = notifications.find((n) => n.id === id);
          if (target) {
            target.isUnread = !target.isUnread;
            saveNotifs(notifications);
            renderNotifications();
          }
        });
      });

      // 3. Xóa từng item
      const deleteItemBtns = notifListContainer.querySelectorAll(".notif-delete-item-btn");
      deleteItemBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = Number(btn.dataset.id);
          notifications = notifications.filter((n) => n.id !== id);
          saveNotifs(notifications);
          renderNotifications();
        });
      });

      // 4. Click vào hàng để chuyển trang và tự động đánh dấu đã đọc
      const rows = notifListContainer.querySelectorAll(".notif-row");
      rows.forEach((row) => {
        row.addEventListener("click", (e) => {
          if (e.target.closest(".notif-item-options-btn") || e.target.closest(".notif-item-menu")) {
            return;
          }
          const id = Number(row.dataset.id);
          const link = row.dataset.link;
          const target = notifications.find((n) => n.id === id);
          if (target && target.isUnread) {
            target.isUnread = false;
            saveNotifs(notifications);
          }
          if (link) {
            window.location.href = link;
          }
        });
      });
    };

    // Header options menu
    if (notifHeaderOptionsBtn && notifHeaderMenu) {
      notifHeaderOptionsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (notifListContainer) {
          notifListContainer.querySelectorAll(".notif-item-menu").forEach((m) => m.classList.add("hidden"));
        }
        notifHeaderMenu.classList.toggle("hidden");
      });
    }

    if (markAllReadBtn) {
      markAllReadBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        notifications.forEach((n) => { n.isUnread = false; });
        saveNotifs(notifications);
        if (notifHeaderMenu) notifHeaderMenu.classList.add("hidden");
        renderNotifications();
      });
    }

    if (deleteAllBtn) {
      deleteAllBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        notifications = [];
        saveNotifs(notifications);
        if (notifHeaderMenu) notifHeaderMenu.classList.add("hidden");
        renderNotifications();
      });
    }

    const userMenuBtn = this.querySelector("#user-menu-btn");
    const userMenuDropdown = this.querySelector("#user-menu-dropdown");

    if (userMenuBtn && userMenuDropdown) {
      userMenuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (notifDropdown) {
          notifDropdown.classList.add("hidden");
          if (notifBellBtn) notifBellBtn.classList.remove("ring-2", "ring-[#35483d]/20", "border-[#35483d]/40", "bg-[#f0edec]");
        }
        userMenuDropdown.classList.toggle("hidden");
      });
    }

    const logoutBtn = this.querySelector("#logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.setItem("ctu_user_logged_in", "false");
      });
    }

    const switchAccountBtn = this.querySelector("#switch-account-btn");
    if (switchAccountBtn) {
      switchAccountBtn.addEventListener("click", () => {
        localStorage.setItem("ctu_user_logged_in", "false");
      });
    }

    // Toggle Bell Dropdown
    if (notifBellBtn && notifDropdown) {
      notifBellBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isHidden = notifDropdown.classList.contains("hidden");

        if (userMenuDropdown) {
          userMenuDropdown.classList.add("hidden");
        }

        if (notifHeaderMenu) notifHeaderMenu.classList.add("hidden");
        if (notifListContainer) {
          notifListContainer.querySelectorAll(".notif-item-menu").forEach((m) => m.classList.add("hidden"));
        }

        if (isHidden) {
          notifDropdown.classList.remove("hidden");
          notifBellBtn.classList.add("ring-2", "ring-[#35483d]/20", "border-[#35483d]/40", "bg-[#f0edec]");
        } else {
          notifDropdown.classList.add("hidden");
          notifBellBtn.classList.remove("ring-2", "ring-[#35483d]/20", "border-[#35483d]/40", "bg-[#f0edec]");
        }
      });
    }

    // Khởi tạo hiển thị thông báo
    renderNotifications();

    document.addEventListener("click", (e) => {
      if (!this.contains(e.target)) {
        if (userMenuDropdown) userMenuDropdown.classList.add("hidden");
        if (notifDropdown) {
          notifDropdown.classList.add("hidden");
          if (notifBellBtn) notifBellBtn.classList.remove("ring-2", "ring-[#35483d]/20", "border-[#35483d]/40", "bg-[#f0edec]");
        }
        if (notifHeaderMenu) notifHeaderMenu.classList.add("hidden");
        if (notifListContainer) {
          notifListContainer.querySelectorAll(".notif-item-menu").forEach((m) => m.classList.add("hidden"));
        }
      } else {
        if (!e.target.closest(".notif-item-options-btn") && !e.target.closest(".notif-item-menu")) {
          if (notifListContainer) {
            notifListContainer.querySelectorAll(".notif-item-menu").forEach((m) => m.classList.add("hidden"));
          }
        }
        if (!e.target.closest("#notif-header-options-btn") && !e.target.closest("#notif-header-menu")) {
          if (notifHeaderMenu) notifHeaderMenu.classList.add("hidden");
        }
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (userMenuDropdown) userMenuDropdown.classList.add("hidden");
        if (notifDropdown) {
          notifDropdown.classList.add("hidden");
          if (notifBellBtn) notifBellBtn.classList.remove("ring-2", "ring-[#35483d]/20", "border-[#35483d]/40", "bg-[#f0edec]");
        }
        if (notifHeaderMenu) notifHeaderMenu.classList.add("hidden");
        if (notifListContainer) {
          notifListContainer.querySelectorAll(".notif-item-menu").forEach((m) => m.classList.add("hidden"));
        }
      }
    });
  }
}

class AppFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="w-full bg-[#35483d] text-[#fcf9f8] border-t border-[#35483d]/80 mt-auto">
        <div class="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-1">
            <h2 class="text-base font-bold text-white tracking-tight">CTU Lost & Found</h2>
            <p class="text-xs text-white/70">© 2024 Đại học Cần Thơ – CTU Lost & Found. Phát triển vì cộng đồng sinh viên CTU.</p>
          </div>

          <div class="flex flex-col items-start md:items-end gap-2 text-xs">
            <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
              <a href="#" class="text-white/80 hover:text-white transition-colors">Quy chế hoạt động</a>
              <a href="#" class="text-white/80 hover:text-white transition-colors">Hướng dẫn nhận lại đồ</a>
              <a href="#" class="text-white/80 hover:text-white transition-colors">Bảo mật thông tin</a>
            </div>
            <span class="text-white/80 hover:text-white transition-colors cursor-pointer">Hỗ trợ Đoàn Thanh niên – Hội Sinh viên</span>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define("app-header", AppHeader);
customElements.define("app-footer", AppFooter);

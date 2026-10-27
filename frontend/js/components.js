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

    // 10. Sau khi ở trạng thái đăng xuất chỉ có thể truy cập trang chủ còn nếu cố click vào các trang khác hay card, đăng tin thì lập tức nhảy sang trang đăng nhập
    const allowedGuestPages = ["index.html", "login.html", "register.html", ""];
    if (!isLoggedIn && !allowedGuestPages.includes(currentPath)) {
      window.location.href = "login.html";
      return;
    }

    const userClusterHtml = isLoggedIn
      ? `
       

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
          <div id="notif-dropdown" class="hidden absolute top-full mt-2 w-[360px] sm:w-[420px] z-50 bg-white rounded-2xl border border-[#e7e1df] shadow-2xl transition-all duration-300 right-0 sm:-right-24 text-left flex flex-col">
            <!-- Mũi tên liên kết trực tiếp với icon chuông -->
            <div id="notif-arrow" class="absolute -top-2 right-3.5 sm:right-[107px] w-3.5 h-2 pointer-events-none z-20">
              <svg class="w-full h-full block" viewBox="0 0 14 8" fill="none">
                <path d="M0 8 L7 1 L14 8" fill="#ffffff" stroke="#e7e1df" stroke-width="1.2" stroke-linejoin="round" />
              </svg>
            </div>

            <!-- 1. Header Dropdown -->
            <div class="px-5 pt-4 pb-2.5 flex items-center justify-between bg-white relative rounded-t-2xl border-b border-[#f0edec] shrink-0">
              <div class="flex items-center gap-2">
                <h3 id="notif-header-title" class="font-extrabold text-[#1b1c1c] text-xl tracking-tight">
                  Thông báo
                </h3>
              </div>
              <div class="flex items-center gap-1.5">
                <!-- Nút thu gọn dạng icon khi đang mở rộng full height -->
                <button id="notif-collapse-btn" aria-label="Thu gọn" class="hidden w-8 h-8 rounded-full hover:bg-[#f0edec] text-[#4a4746] items-center justify-center transition-colors focus:outline-none cursor-pointer" type="button" title="Thu gọn danh sách">
                  <span class="material-symbols-outlined text-[20px]">unfold_less</span>
                </button>

                <!-- Nút đóng popup -->
                <button id="notif-close-btn" aria-label="Đóng" class="hidden w-8 h-8 rounded-full hover:bg-[#f0edec] text-[#4a4746] items-center justify-center transition-colors focus:outline-none cursor-pointer" type="button" title="Đóng thông báo">
                  <span class="material-symbols-outlined text-[20px]">close</span>
                </button>

                <div class="relative">
                  <button id="notif-header-options-btn" aria-label="Tùy chọn thông báo" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f0edec] text-[#4a4746] transition-colors focus:outline-none cursor-pointer" type="button" title="Tùy chọn">
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
            </div>

            <!-- Filter tabs (Ảnh 1: Tất cả / Chưa đọc) -->
            <div id="notif-filter-bar" class="hidden px-5 py-2.5 flex items-center gap-2 bg-white border-b border-[#f0edec] shrink-0">
              <button type="button" id="notif-filter-all-btn" class="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#35483d] text-white transition-all cursor-pointer">
                Tất cả
              </button>
              <button type="button" id="notif-filter-unread-btn" class="px-3.5 py-1 rounded-full text-xs font-medium text-[#797675] hover:text-[#1b1c1c] hover:bg-[#f0edec] transition-all cursor-pointer">
                Chưa đọc
              </button>
            </div>

            <!-- 2. Danh sách thông báo (Cuộn riêng lẻ mượt mà) -->
            <div id="notif-list-container" class="flex flex-col bg-white py-1 max-h-[380px] overflow-y-auto">
              <!-- Render động -->
            </div>

            <!-- 3. Footer của Popup -->
            <div id="notif-footer" class="p-3 bg-white text-center rounded-b-2xl border-t border-[#f0edec] shrink-0">
              <button type="button" id="notif-expand-btn" class="w-full py-2.5 px-4 bg-[#f0edec] hover:bg-[#e7e1df] text-[#1b1c1c] text-sm font-semibold rounded-xl text-center transition-colors block shadow-sm cursor-pointer">
                Xem các thông báo trước đó
              </button>
              <button type="button" id="notif-collapse-bottom-btn" class="hidden w-full py-2 px-3 text-xs font-semibold text-[#797675] hover:text-[#1b1c1c] hover:bg-[#f6f3f2] rounded-lg text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <span class="material-symbols-outlined text-[16px]">unfold_less</span>
                <span>Thu gọn thông báo</span>
              </button>
            </div>
          </div>
        </div>

        <!-- User Avatar & Popup Dropdown -->
        <div class="relative flex items-center">
          <button id="user-menu-btn" type="button" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-200/60 hover:bg-stone-200 text-[#1b1c1c] text-sm font-medium cursor-pointer transition-colors" title="Tài khoản: Đặng Hữu Khang">
            <span class="material-symbols-outlined text-[22px] text-[#35483d]">account_circle</span>
            <span>Đặng Hữu Khang</span>
          </button>

          <div id="user-menu-dropdown" class="hidden absolute right-0 top-full mt-2 w-[280px] z-50 bg-white rounded-xl border border-[#e7e1df] shadow-xl text-left">
            <!-- Mũi tên liên kết với nút tài khoản người dùng -->
            <div class="absolute -top-2 right-[76px] w-3.5 h-2 pointer-events-none z-20">
              <svg class="w-full h-full block" viewBox="0 0 14 8" fill="none">
                <path d="M0 8 L7 1 L14 8" fill="#f9fafb" stroke="#e7e1df" stroke-width="1.2" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="p-4 bg-gray-50/50 border-b border-[#e7e1df] rounded-t-xl">
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

    const isHomePage =
      currentPath === "index.html" ||
      currentPath === "" ||
      window.location.pathname.endsWith("/pages/") ||
      window.location.pathname === "/";
    const headerBorderClass = isHomePage ? "" : "border-b border-[#E6E4DE]";

    this.innerHTML = `
      <header class="sticky top-0 z-50 bg-[#F7F6F2] ${headerBorderClass}">
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
            <a href="${isLoggedIn ? 'find.html' : 'login.html'}" class="${getLinkClass("find.html")}">Tìm đồ</a>
            <a href="${isLoggedIn ? 'post.html' : 'login.html'}" class="${getLinkClass(["post.html", "post-lost.html", "post-found.html"])}">Đăng tin</a>
            
            <!-- THÔNG BÁO: Active khi ở trang notifications.html, requests.html, match-detail.html, request-detail.html hoặc claim.html -->
            <a href="${isLoggedIn ? 'notifications.html' : 'login.html'}" class="${getLinkClass(["notifications.html", "requests.html", "match-detail.html", "request-detail.html", "claim.html"])}">Thông báo</a>
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
        link: "requests.html",
        section: "new"
      },
      {
        id: 2,
        title: "Khớp đồ thất lạc mới (99%)",
        time: "25 phút trước",
        desc: 'Phát hiện bài đăng nhặt được "Bóp cầm tay màu nâu kèm thẻ sinh viên CTU" trùng khớp đặc điểm tin báo mất của bạn.',
        isUnread: true,
        type: "match",
        link: "match-detail.html",
        section: "new"
      },
      {
        id: 3,
        title: "Đã tiếp nhận bàn giao tại PCTSV",
        time: "2 giờ trước",
        desc: 'Đồ vật "Ví da nam màu nâu - Tòa C1" đã được bàn giao an toàn và niêm phong bảo quản tại Phòng Công tác Sinh viên (Khu II).',
        isUnread: false,
        type: "handover",
        link: "notifications.html",
        section: "new"
      },
      {
        id: 4,
        title: "Xác nhận ghép nối thành công",
        time: "Hôm qua, 16:30",
        desc: 'Bạn đã xác nhận quyền sở hữu cho bạn Trần Thị B đối với "Thẻ sinh viên B211xxxx". Đồ vật sẵn sàng để nhận tại PCTSV.',
        isUnread: false,
        type: "verification",
        link: "requests.html",
        section: "earlier"
      },
      {
        id: 5,
        title: "Khớp đồ thất lạc mới (85%)",
        time: "2 ngày trước",
        desc: 'Phát hiện bài đăng nhặt được "Balo laptop bỏ quên có ví da nâu bên trong" tại Phòng máy Lab 02 - Nhà C1.',
        isUnread: false,
        type: "match",
        link: "match-detail.html",
        section: "earlier"
      },
      {
        id: 6,
        title: "Cập nhật bài đăng thành công",
        time: "3 ngày trước",
        desc: 'Tin báo mất "Chìa khóa xe Honda Smartkey" của bạn đã được cập nhật vị trí nghi mất tại Khuôn viên Bãi xe Cổng A.',
        isUnread: false,
        type: "system",
        link: "notifications.html",
        section: "earlier"
      },
      {
        id: 7,
        title: "Khớp đồ thất lạc mới (80%)",
        time: "4 ngày trước",
        desc: 'Phát hiện bài đăng nhặt được "Ví đựng thẻ da bò màu nâu nhạt" tại Bãi giữ xe Tòa C1.',
        isUnread: true,
        type: "match",
        link: "match-detail.html",
        section: "earlier"
      },
      {
        id: 8,
        title: "Đồ vật đã được nhận lại an toàn",
        time: "5 ngày trước",
        desc: 'Sinh viên Lê Hoàng C đã nhận lại tài sản "Tai nghe Bluetooth" tại Văn phòng Đoàn Thanh niên.',
        isUnread: false,
        type: "handover",
        link: "notifications.html",
        section: "earlier"
      },
      {
        id: 9,
        title: "Cảnh báo bảo mật hệ thống",
        time: "1 tuần trước",
        desc: 'Ghi nhận lượt đăng nhập thành công vào tài khoản CTU của bạn từ trình duyệt Chrome trên Windows.',
        isUnread: false,
        type: "system",
        link: "#",
        section: "earlier"
      },
      {
        id: 10,
        title: "Chào mừng đến với CTU Lost & Found",
        time: "2 tuần trước",
        desc: 'Hệ thống kết nối và hỗ trợ tìm kiếm tài sản thất lạc chính thức dành cho sinh viên và cán bộ Trường Đại học Cần Thơ.',
        isUnread: false,
        type: "system",
        link: "index.html",
        section: "earlier"
      }
    ];

    const getStoredNotifs = () => {
      try {
        const stored = localStorage.getItem("ctu_notifications_data_v2");
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Lỗi đọc dữ liệu thông báo:", e);
      }
      return defaultNotifs;
    };

    const saveNotifs = (data) => {
      localStorage.setItem("ctu_notifications_data_v2", JSON.stringify(data));
    };

    let notifications = getStoredNotifs();
    let isExpanded = false;
    let currentFilter = "all"; // "all" | "unread"

    const notifBadge = this.querySelector("#notif-badge");
    const notifListContainer = this.querySelector("#notif-list-container");
    const notifHeaderMenu = this.querySelector("#notif-header-menu");
    const notifBellBtn = this.querySelector("#notif-bell-btn");
    const notifDropdown = this.querySelector("#notif-dropdown");
    const notifArrow = this.querySelector("#notif-arrow");
    const notifCollapseBtn = this.querySelector("#notif-collapse-btn");
    const notifCloseBtn = this.querySelector("#notif-close-btn");
    const notifHeaderOptionsBtn = this.querySelector("#notif-header-options-btn");
    const notifFilterBar = this.querySelector("#notif-filter-bar");
    const filterAllBtn = this.querySelector("#notif-filter-all-btn");
    const filterUnreadBtn = this.querySelector("#notif-filter-unread-btn");
    const notifExpandBtn = this.querySelector("#notif-expand-btn");
    const notifCollapseBottomBtn = this.querySelector("#notif-collapse-bottom-btn");
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

    const compactClasses = "absolute top-full mt-2 w-[360px] sm:w-[420px] z-50 bg-white rounded-2xl border border-[#e7e1df] shadow-2xl transition-all duration-200 right-0 sm:-right-24 text-left flex flex-col";
    const expandedClasses = "fixed top-16 md:top-20 right-2 sm:right-6 md:right-8 lg:right-12 bottom-4 w-[380px] sm:w-[440px] max-w-[calc(100vw-20px)] h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] z-50 bg-white rounded-2xl border border-[#e7e1df] shadow-2xl transition-all duration-200 text-left flex flex-col overflow-hidden";

    const setExpandedMode = (expanded) => {
      isExpanded = expanded;
      if (!notifDropdown) return;

      const isHidden = notifDropdown.classList.contains("hidden");

      if (isExpanded) {
        // Sổ xuống hết full height bên phải theo minh họa Ảnh 1 & Ảnh 2, cuộn độc lập
        notifDropdown.className = expandedClasses + (isHidden ? " hidden" : "");
        if (notifArrow) notifArrow.classList.add("hidden");
        if (notifCollapseBtn) {
          notifCollapseBtn.classList.remove("hidden");
          notifCollapseBtn.classList.add("flex");
        }
        if (notifCloseBtn) {
          notifCloseBtn.classList.remove("hidden");
          notifCloseBtn.classList.add("flex");
        }
        if (notifFilterBar) {
          notifFilterBar.classList.remove("hidden");
          notifFilterBar.classList.add("flex");
        }
        if (notifExpandBtn) notifExpandBtn.classList.add("hidden");
        if (notifCollapseBottomBtn) {
          notifCollapseBottomBtn.classList.remove("hidden");
          notifCollapseBottomBtn.classList.add("flex");
        }
        if (notifListContainer) {
          notifListContainer.classList.remove("max-h-[380px]");
          notifListContainer.classList.add("flex-1", "min-h-0");
        }
      } else {
        // Trở về dạng popup popover nhỏ gọn ban đầu
        notifDropdown.className = compactClasses + (isHidden ? " hidden" : "");
        if (notifArrow) notifArrow.classList.remove("hidden");
        if (notifCollapseBtn) {
          notifCollapseBtn.classList.add("hidden");
          notifCollapseBtn.classList.remove("flex");
        }
        if (notifCloseBtn) {
          notifCloseBtn.classList.add("hidden");
          notifCloseBtn.classList.remove("flex");
        }
        if (notifFilterBar) {
          notifFilterBar.classList.add("hidden");
          notifFilterBar.classList.remove("flex");
        }
        if (notifExpandBtn) notifExpandBtn.classList.remove("hidden");
        if (notifCollapseBottomBtn) {
          notifCollapseBottomBtn.classList.add("hidden");
          notifCollapseBottomBtn.classList.remove("flex");
        }
        if (notifListContainer) {
          notifListContainer.classList.add("max-h-[380px]");
          notifListContainer.classList.remove("flex-1", "min-h-0");
        }
      }
      renderNotifications();
    };

    const renderItemHtml = (item, index, totalCount) => {
      let iconHtml = "";
      if (item.type === "verification") {
        iconHtml = `
          <div class="w-10 h-10 bg-emerald-50 text-[#35483d] border border-emerald-200/80 flex items-center justify-center rounded-full flex-shrink-0 shadow-xs">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
          </div>
        `;
      } else if (item.type === "match") {
        iconHtml = `
          <div class="w-10 h-10 bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center rounded-full flex-shrink-0 shadow-xs">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
          </div>
        `;
      } else if (item.type === "handover") {
        iconHtml = `
          <div class="w-10 h-10 bg-blue-50 text-blue-800 border border-blue-200/80 flex items-center justify-center rounded-full flex-shrink-0 shadow-xs">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
          </div>
        `;
      } else {
        iconHtml = `
          <div class="w-10 h-10 bg-neutral-100 text-[#797675] border border-[#e7e1df] flex items-center justify-center rounded-full flex-shrink-0 shadow-xs">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
          </div>
        `;
      }

      const isLastItem = index === totalCount - 1;
      const menuPositionClass = isLastItem ? "bottom-full mb-1 right-0" : "top-full mt-1 right-0";

      return `
        <div class="group flex items-start gap-3 px-5 py-3.5 hover:bg-[#f6f3f2] transition-colors cursor-pointer relative notif-row border-b border-[#f0edec]/70 last:border-b-0" data-id="${item.id}" data-link="${item.link}">
          <div class="relative flex-shrink-0 mt-0.5">
            ${iconHtml}
          </div>
          <div class="flex-1 min-w-0 pr-1 notif-content-area">
            <div class="flex items-start justify-between gap-1 mb-0.5">
              <h4 class="${item.isUnread ? 'font-bold text-[#1b1c1c]' : 'font-semibold text-[#4a4746]'} text-xs leading-snug line-clamp-1">
                ${item.title}
              </h4>
            </div>
            <p class="text-xs ${item.isUnread ? 'text-[#1b1c1c] font-medium' : 'text-[#797675]'} leading-relaxed line-clamp-2 mt-0.5">
              ${item.desc}
            </p>
            <span class="text-[11px] text-[#797675] block mt-1">
              ${item.time}
            </span>
          </div>
          
          <!-- Cột phải: Dấu chấm xanh chưa đọc & nút 3 chấm hover (Giống Facebook ảnh 1) -->
          <div class="flex-shrink-0 relative w-7 h-7 flex items-center justify-center self-center">
            <span class="w-2.5 h-2.5 rounded-full bg-[#1877F2] ${item.isUnread ? 'block' : 'hidden'} group-hover:opacity-0 transition-opacity"></span>
            <button aria-label="Tùy chọn thông báo" class="notif-item-options-btn absolute inset-0 w-7 h-7 rounded-full bg-white shadow-sm border border-[#e7e1df] hover:bg-[#f0edec] flex items-center justify-center text-[#4a4746] opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none cursor-pointer" type="button" data-id="${item.id}">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
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
    };

    const renderNotifications = () => {
      if (!notifListContainer) return;
      updateBadge();

      if (notifications.length === 0) {
        notifListContainer.innerHTML = `
          <div class="py-12 px-5 text-center">
            <div class="w-12 h-12 mx-auto rounded-full bg-[#f0edec] text-[#797675] flex items-center justify-center mb-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </div>
            <p class="text-sm font-semibold text-[#1b1c1c]">Không có thông báo nào</p>
            <p class="text-xs text-[#797675] mt-0.5">Bạn đã xem hết các thông báo gần đây</p>
            <button id="notif-reset-demo-btn" type="button" class="mt-3 text-xs text-[#35483d] font-semibold underline hover:text-[#1f3227] cursor-pointer">
              Khôi phục danh sách thông báo mẫu
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

      // Xử lý render theo chế độ Compact hoặc Mở Rộng
      if (!isExpanded) {
        // Chế độ Compact: Chỉ hiển thị 3 thông báo mới nhất
        const compactItems = notifications.slice(0, 3);
        notifListContainer.innerHTML = compactItems.map((item, idx) => renderItemHtml(item, idx, compactItems.length)).join("");
      } else {
        // Chế độ Mở Rộng (Sổ xuống hết kiểu Facebook ảnh 1):
        if (currentFilter === "unread") {
          const unreadItems = notifications.filter(n => n.isUnread);
          if (unreadItems.length === 0) {
            notifListContainer.innerHTML = `
              <div class="py-12 px-5 text-center">
                <span class="material-symbols-outlined text-3xl text-emerald-600 mb-1">done_all</span>
                <p class="text-sm font-semibold text-[#1b1c1c]">Tuyệt vời!</p>
                <p class="text-xs text-[#797675] mt-0.5">Bạn không có thông báo chưa đọc nào</p>
              </div>
            `;
          } else {
            notifListContainer.innerHTML = `
              <div class="px-5 pt-3 pb-1 flex items-center justify-between bg-stone-50/60 border-b border-[#f0edec]">
                <span class="text-xs font-bold text-[#1b1c1c] uppercase tracking-wider">Chưa đọc (${unreadItems.length})</span>
              </div>
              ${unreadItems.map((item, idx) => renderItemHtml(item, idx, unreadItems.length)).join("")}
            `;
          }
        } else {
          // Lọc Tất cả: Chia 2 khu vực "Mới nhất" và "Trước đó" đúng chuẩn ảnh 1 & ảnh 2
          const newItems = notifications.filter(n => n.section === "new");
          const earlierItems = notifications.filter(n => n.section === "earlier");

          let html = "";
          if (newItems.length > 0) {
            html += `
              <div class="px-5 pt-3 pb-1.5 flex items-center justify-between bg-stone-50/60 border-b border-[#f0edec]">
                <span class="text-xs font-bold text-[#1b1c1c] uppercase tracking-wider">Mới nhất</span>
              </div>
              ${newItems.map((item, idx) => renderItemHtml(item, idx, newItems.length)).join("")}
            `;
          }

          if (earlierItems.length > 0) {
            html += `
              <div class="px-5 pt-4 pb-1.5 flex items-center justify-between bg-stone-50/60 border-y border-[#f0edec]">
                <span class="text-xs font-bold text-[#4a4746] uppercase tracking-wider">Trước đó</span>
                <span class="text-[11px] font-medium text-[#797675]">${earlierItems.length} Bài đăng</span>
              </div>
              ${earlierItems.map((item, idx) => renderItemHtml(item, idx, earlierItems.length)).join("")}
            `;
          }

          notifListContainer.innerHTML = html;
        }
      }

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
          if (link && link !== "#") {
            window.location.href = link;
          }
        });
      });
    };

    // Sự kiện nút Xem các thông báo trước đó -> Mở rộng sổ xuống hết dạng panel full-height bên phải
    if (notifExpandBtn) {
      notifExpandBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        setExpandedMode(true);
        if (notifDropdown) notifDropdown.classList.remove("hidden");
        if (notifBellBtn) {
          notifBellBtn.classList.add("ring-2", "ring-[#35483d]/20", "border-[#35483d]/40", "bg-[#f0edec]");
        }
      });
    }

    // Sự kiện nút Thu gọn panel
    if (notifCollapseBtn) {
      notifCollapseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        setExpandedMode(false);
      });
    }
    if (notifCollapseBottomBtn) {
      notifCollapseBottomBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        setExpandedMode(false);
      });
    }

    // Nút đóng popup hoàn toàn
    if (notifCloseBtn) {
      notifCloseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (notifDropdown) notifDropdown.classList.add("hidden");
        if (notifBellBtn) {
          notifBellBtn.classList.remove("ring-2", "ring-[#35483d]/20", "border-[#35483d]/40", "bg-[#f0edec]");
        }
        setExpandedMode(false);
      });
    }

    // Sự kiện filter Tất cả / Chưa đọc (Ảnh 1)
    if (filterAllBtn && filterUnreadBtn) {
      filterAllBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentFilter = "all";
        filterAllBtn.className = "px-3.5 py-1 rounded-full text-xs font-semibold bg-[#35483d] text-white transition-all cursor-pointer";
        filterUnreadBtn.className = "px-3.5 py-1 rounded-full text-xs font-medium text-[#797675] hover:text-[#1b1c1c] hover:bg-[#f0edec] transition-all cursor-pointer";
        renderNotifications();
      });

      filterUnreadBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentFilter = "unread";
        filterUnreadBtn.className = "px-3.5 py-1 rounded-full text-xs font-semibold bg-[#35483d] text-white transition-all cursor-pointer";
        filterAllBtn.className = "px-3.5 py-1 rounded-full text-xs font-medium text-[#797675] hover:text-[#1b1c1c] hover:bg-[#f0edec] transition-all cursor-pointer";
        renderNotifications();
      });
    }

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
        const isHidden = userMenuDropdown.classList.contains("hidden");
        if (isHidden) {
          userMenuDropdown.classList.remove("hidden");
          userMenuBtn.classList.add("ring-2", "ring-[#35483d]/20", "bg-stone-200");
        } else {
          userMenuDropdown.classList.add("hidden");
          userMenuBtn.classList.remove("ring-2", "ring-[#35483d]/20", "bg-stone-200");
        }
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
          if (userMenuBtn) userMenuBtn.classList.remove("ring-2", "ring-[#35483d]/20", "bg-stone-200");
        }

        if (notifHeaderMenu) notifHeaderMenu.classList.add("hidden");
        if (notifListContainer) {
          notifListContainer.querySelectorAll(".notif-item-menu").forEach((m) => m.classList.add("hidden"));
        }

        if (isHidden) {
          // Khi bấm vào chuông để mở, khởi tạo ở chế độ compact
          setExpandedMode(false);
          notifDropdown.classList.remove("hidden");
          notifBellBtn.classList.add("ring-2", "ring-[#35483d]/20", "border-[#35483d]/40", "bg-[#f0edec]");
        } else {
          // Khi bấm vào chuông để đóng
          notifDropdown.classList.add("hidden");
          notifBellBtn.classList.remove("ring-2", "ring-[#35483d]/20", "border-[#35483d]/40", "bg-[#f0edec]");
          setExpandedMode(false);
        }
      });
    }

    // Khởi tạo hiển thị thông báo
    renderNotifications();

    document.addEventListener("click", (e) => {
      if (!this.contains(e.target)) {
        if (userMenuDropdown) {
          userMenuDropdown.classList.add("hidden");
          if (userMenuBtn) userMenuBtn.classList.remove("ring-2", "ring-[#35483d]/20", "bg-stone-200");
        }
        if (notifDropdown) {
          notifDropdown.classList.add("hidden");
          if (notifBellBtn) notifBellBtn.classList.remove("ring-2", "ring-[#35483d]/20", "border-[#35483d]/40", "bg-[#f0edec]");
          setExpandedMode(false);
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
          setExpandedMode(false);
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

// 7. Ở các ô nhập liệu khi click vào ô thì bắt đầu cho nhập (ví dụ ngày và giờ)
if (typeof window !== "undefined") {
  const initDatePickers = () => {
    document.querySelectorAll('input[type="date"], input[type="time"]').forEach(input => {
      input.style.cursor = 'pointer';
      if (!input.dataset.hasPickerHandler) {
        input.dataset.hasPickerHandler = "true";
        input.addEventListener('click', function () {
          if (typeof this.showPicker === 'function') {
            try { this.showPicker(); } catch (e) { }
          }
        });
      }
    });
  };
  document.addEventListener("DOMContentLoaded", initDatePickers);
  window.addEventListener("load", initDatePickers);
  setTimeout(initDatePickers, 500);
}

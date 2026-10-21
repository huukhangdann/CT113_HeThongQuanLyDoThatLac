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

          <!-- User Info & Notification Bell -->
          <div class="flex items-center gap-3">
            <!-- Nút chuông thông báo chuyển hướng trực tiếp -->
            <a href="notifications.html" class="relative p-2 rounded-full hover:bg-stone-200/60 text-stone-600 transition-colors" title="Thông báo">
              <span class="material-symbols-outlined text-[22px]">notifications</span>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-[#F7F6F2]"></span>
            </a>

            <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-200/60 hover:bg-stone-200 text-[#1b1c1c] text-sm font-medium cursor-pointer transition-colors">
              <span class="material-symbols-outlined text-[22px] text-[#35483d]">account_circle</span>
              <span>Nguyễn Văn A</span>
            </div>
          </div>

        </div>
      </header>
    `;
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

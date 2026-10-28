// Khởi tạo Theme ngay lập tức để tránh nhấp nháy giao diện (FOUC)
(function initTheme() {
  try {
    const rawData = localStorage.getItem("ctu_theme_data");
    let theme = null;
    if (rawData) {
      try {
        theme = JSON.parse(rawData);
      } catch (e) {}
    }

    if (theme) {
      if (theme.isLight) {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
      }

      const root = document.documentElement;
      if (theme.top) root.style.setProperty("--theme-bg-header", theme.top);
      if (theme.headerBorder) root.style.setProperty("--theme-header-border", theme.headerBorder);
      if (theme.headerText) root.style.setProperty("--theme-header-text", theme.headerText);
      if (theme.headerIcon) root.style.setProperty("--theme-header-icon", theme.headerIcon);
      if (theme.headerNavText) root.style.setProperty("--theme-header-nav-text", theme.headerNavText);
      if (theme.headerNavActiveBorder) root.style.setProperty("--theme-header-nav-active-border", theme.headerNavActiveBorder);
      if (theme.headerBtnBg) root.style.setProperty("--theme-header-btn-bg", theme.headerBtnBg);
      if (theme.headerBtnText) root.style.setProperty("--theme-header-btn-text", theme.headerBtnText);

      if (theme.pageBg) root.style.setProperty("--theme-bg-page", theme.pageBg);
      if (theme.cardBg) root.style.setProperty("--theme-bg-card", theme.cardBg);

      if (theme.accent) root.style.setProperty("--theme-accent", theme.accent);
      if (theme.accentHover) root.style.setProperty("--theme-accent-hover", theme.accentHover);
      if (theme.accentRing) root.style.setProperty("--theme-accent-ring", theme.accentRing);
      if (theme.hue) {
        root.style.setProperty("--theme-custom-hue", theme.hue);
        root.style.setProperty("--slider-thumb-color", `hsl(${theme.hue}, 65%, 45%)`);
      }
    } else {
      // Mặc định ban đầu của CTU: Header sáng ngà #F7F6F2, nền #F7F6F2, accent xanh rêu #1f3227
      document.documentElement.classList.remove("dark");
      const root = document.documentElement;
      root.style.setProperty("--theme-bg-header", "#f7f6f2");
      root.style.setProperty("--theme-header-border", "#e6e4de");
      root.style.setProperty("--theme-header-text", "#1b1c1b");
      root.style.setProperty("--theme-header-icon", "#1f3227");
      root.style.setProperty("--theme-header-nav-text", "#777771");
      root.style.setProperty("--theme-header-nav-active-border", "#1f3227");
      root.style.setProperty("--theme-header-btn-bg", "rgba(231, 229, 228, 0.6)");
      root.style.setProperty("--theme-header-btn-text", "#1f3227");
      root.style.setProperty("--theme-bg-page", "#f7f6f2");
      root.style.setProperty("--theme-bg-card", "#ffffff");
      root.style.setProperty("--theme-accent", "#1f3227");
      root.style.setProperty("--theme-accent-hover", "#142018");
      root.style.setProperty("--theme-accent-ring", "rgba(31, 50, 39, 0.25)");
    }
  } catch (e) {
    console.warn("Theme init error:", e);
  }
})();


(() => {
  const API_BASE_URL = "http://localhost:3000";
  const PAGE_SIZE = 8;
  const state = { page: 1, totalPages: 0, controller: null, requestId: 0 };

  const elements = {
    searchInput: document.getElementById("search-input"),
    category: document.getElementById("filter-category"),
    time: document.getElementById("filter-time"),
    dateRange: document.getElementById("custom-date-range"),
    dateFrom: document.getElementById("filter-date-from"),
    dateTo: document.getElementById("filter-date-to"),
    color: document.getElementById("filter-color"),
    building: document.getElementById("loc-faculty"),
    floor: document.getElementById("loc-floor"),
    room: document.getElementById("loc-room"),
    sort: document.getElementById("sort-results"),
    results: document.getElementById("view-results"),
    grid: document.getElementById("search-results-grid"),
    count: document.getElementById("results-count"),
    pagination: document.getElementById("pagination-controls"),
    loading: document.getElementById("view-loading"),
    empty: document.getElementById("view-empty"),
    apiError: document.getElementById("search-api-error"),
    inputError: document.getElementById("input-error-msg"),
    inputErrorText: document.getElementById("error-text")
  };

  const escapeHtml = value => String(value || "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);

  const formatDate = timestamp => {
    const date = new Date(timestamp);
    if (!timestamp || !Number.isFinite(date.getTime())) return "Chưa cập nhật thời gian";
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  };

  const getImageUrl = value => {
    if (!value) return "";
    try {
      const url = new URL(value, `${API_BASE_URL}/`);
      if (url.hostname === "example.com" || url.hostname === "www.example.com") return "";
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  };

  const getDetailUrl = itemId => {
    const url = new URL("claim.html", window.location.href);
    url.searchParams.set("id", `find-${itemId}`);
    url.searchParams.set("from", "find.html");
    return url.href;
  };

  const renderCard = item => {
    const detailUrl = getDetailUrl(item.id);
    const imageUrl = getImageUrl(item.imageUrl);
    const imageMarkup = imageUrl
      ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.title)}" class="w-full h-full object-cover" loading="lazy" />`
      : `<div class="w-full h-full flex items-center justify-center text-[#727873]"><span class="material-symbols-outlined text-5xl">image</span></div>`;

    const article = document.createElement("article");
    article.className = "group bg-white rounded-xl border border-[#e7e1df] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:scale-[1.02] hover:border-[#35483d]/40 transition-all duration-300 ease-out flex flex-col cursor-pointer transform";
    article.innerHTML = `
      <a href="${escapeHtml(detailUrl)}" class="relative aspect-4/3 bg-[#f6f3f2] overflow-hidden block" aria-label="Xem ${escapeHtml(item.title)}">
        ${imageMarkup}
      </a>
      <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 class="font-bold text-base text-[#1b1c1b] group-hover:text-[#35483d] transition-colors leading-snug mb-2 truncate" title="${escapeHtml(item.title)}">
            ${escapeHtml(item.title || "Chưa có tiêu đề")}
          </h3>
          <p class="text-[11px] font-medium text-[#35483d] mb-2 truncate">${escapeHtml(item.category)}</p>
          <div class="flex items-center gap-1.5 text-xs text-[#727873] mb-1.5">
            <span class="material-symbols-outlined text-[16px] text-[#35483d] shrink-0">location_on</span>
            <span class="truncate" title="${escapeHtml(item.location)}">${escapeHtml(item.location || "Chưa cập nhật địa điểm")}</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-[#727873]">
            <span class="material-symbols-outlined text-[16px] shrink-0">schedule</span>
            <span>${escapeHtml(formatDate(item.foundAt))}</span>
          </div>
        </div>
        <div class="pt-4 mt-4 border-t border-[#f1edea] flex items-center justify-between gap-2 text-xs">
          <span class="text-[#727873] font-medium truncate">${escapeHtml(item.status)}</span>
          <span class="font-semibold text-[#35483d] group-hover:translate-x-0.5 transition-transform shrink-0">Xem chi tiết →</span>
        </div>
      </div>
    `;
    article.addEventListener("click", event => {
      if (!event.target.closest("a")) window.location.href = detailUrl;
    });
    return article;
  };

  const setInputError = message => {
    if (!elements.inputError || !elements.inputErrorText) return;
    elements.inputErrorText.textContent = message;
    elements.inputError.classList.toggle("hidden", !message);
    elements.inputError.classList.toggle("flex", Boolean(message));
  };

  const setLoading = isLoading => {
    elements.loading?.classList.toggle("hidden", !isLoading);
    elements.results?.classList.toggle("hidden", isLoading);
    elements.empty?.classList.add("hidden");
  };

  const updateDateRangeVisibility = () => {
    elements.dateRange?.classList.toggle("hidden", elements.time?.value !== "custom");
  };

  const collectFilters = () => {
    const params = new URLSearchParams();
    const keyword = elements.searchInput?.value.trim();
    if (keyword) params.set("keyword", keyword);

    const category = elements.category?.value || "all";
    if (category !== "all") params.set("category", category);

    const time = elements.time?.value || "all";
    params.set("time", time);
    if (time === "custom") {
      const from = elements.dateFrom?.value || "";
      const to = elements.dateTo?.value || "";
      if (!from || !to) {
        throw new Error("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.");
      }
      if (from > to) throw new Error("Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.");
      params.set("from", from);
      params.set("to", to);
    }

    const selectedColors = [];
    const primaryColor = elements.color?.value || "";
    if (/^#[0-9a-f]{6}$/i.test(primaryColor)) selectedColors.push(primaryColor);
    document.querySelectorAll("#filter-sec-colors-container .sec-hex-val").forEach(element => {
      const color = element.textContent.trim();
      if (/^#[0-9a-f]{6}$/i.test(color)) selectedColors.push(color);
    });
    [...new Set(selectedColors.map(color => color.toUpperCase()))]
      .forEach(color => params.append("color", color));

    const building = elements.building?.value || "";
    const floor = elements.floor?.value || "";
    const room = elements.room?.value || "";
    if (building) params.set("building", building);
    if (floor) params.set("floor", floor);
    if (room) params.set("room", room);

    params.set("sort", elements.sort?.value === "oldest" ? "oldest" : "newest");
    params.set("page", String(state.page));
    params.set("pageSize", String(PAGE_SIZE));
    return params;
  };

  const renderPagination = (page, totalPages) => {
    if (!elements.pagination) return;
    elements.pagination.replaceChildren();

    const previous = document.createElement("button");
    previous.type = "button";
    previous.textContent = "Trước";
    previous.disabled = page <= 1;
    previous.className = "px-3 py-1.5 rounded border border-[#e7e1df] text-[#727873] disabled:opacity-50 disabled:cursor-not-allowed";
    previous.addEventListener("click", () => loadResults(page - 1));

    const pageLabel = document.createElement("span");
    pageLabel.className = "px-2 text-[#727873]";
    pageLabel.textContent = `Trang ${page} / ${totalPages}`;

    const next = document.createElement("button");
    next.type = "button";
    next.textContent = "Sau";
    next.disabled = page >= totalPages;
    next.className = "px-3 py-1.5 rounded border border-[#e7e1df] text-[#727873] disabled:opacity-50 disabled:cursor-not-allowed";
    next.addEventListener("click", () => loadResults(page + 1));

    elements.pagination.append(previous, pageLabel, next);
  };

  const renderResults = result => {
    if (!elements.grid) return;
    elements.grid.replaceChildren(...result.items.map(renderCard));
    elements.count.innerHTML = `Hiển thị <strong>${result.total ? (result.page - 1) * result.pageSize + 1 : 0} - ${Math.min(result.page * result.pageSize, result.total)}</strong> trong số <strong>${result.total}</strong> kết quả tìm kiếm`;

    if (result.total === 0) {
      elements.results.classList.add("hidden");
      elements.empty?.classList.remove("hidden");
      return;
    }

    elements.empty?.classList.add("hidden");
    elements.results.classList.remove("hidden");
    renderPagination(result.page, result.totalPages);
  };

  const loadResults = async page => {
    state.page = page;
    const requestId = ++state.requestId;
    state.controller?.abort();
    state.controller = new AbortController();
    if (elements.apiError) {
      elements.apiError.textContent = "";
      elements.apiError.classList.add("hidden");
    }
    setLoading(true);

    try {
      const params = collectFilters();
      const response = await fetch(`${API_BASE_URL}/api/found/search?${params}`, {
        signal: state.controller.signal
      });
      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("Máy chủ trả về dữ liệu không hợp lệ.");
      }
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể tải kết quả tìm kiếm.");
      }

      if (requestId !== state.requestId) return;
      state.totalPages = result.totalPages;
      renderResults(result);
    } catch (error) {
      if (error.name === "AbortError" || requestId !== state.requestId) return;
      setLoading(false);
      if (elements.apiError) {
        elements.apiError.textContent = error.message || "Không thể kết nối tới máy chủ.";
        elements.apiError.classList.remove("hidden");
      }
      elements.results?.classList.remove("hidden");
      elements.grid?.replaceChildren();
      if (elements.count) elements.count.textContent = "";
      elements.pagination?.replaceChildren();
    } finally {
      if (requestId === state.requestId) {
        elements.loading?.classList.add("hidden");
      }
    }
  };

  window.performFoundSearch = () => {
    updateDateRangeVisibility();
    setInputError("");
    try {
      collectFilters();
      loadResults(1);
    } catch (error) {
      setInputError(error.message);
    }
  };
  window.handleSearch = event => {
    event.preventDefault();
    window.performFoundSearch();
  };

  elements.sort?.addEventListener("change", () => loadResults(1));
  elements.time?.addEventListener("change", updateDateRangeVisibility);
  elements.dateFrom?.addEventListener("change", () => {
    if (elements.dateTo) elements.dateTo.min = elements.dateFrom.value;
  });
  elements.dateTo?.addEventListener("change", () => {
    if (elements.dateFrom) elements.dateFrom.max = elements.dateTo.value;
  });
  updateDateRangeVisibility();
  loadResults(1);
})();

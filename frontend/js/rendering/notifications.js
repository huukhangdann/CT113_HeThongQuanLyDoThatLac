/**
 * notifications.js — Render động trang Thông báo Kết quả Ghép nối (notifications.html)
 * Dành cho người dùng đã ĐĂNG TIN BÁO MẤT — xem kết quả ghép nối AI & trạng thái xử lý
 *
 * Sections:
 *   1. #lost-items-matched-container  — Những món đồ thất lạc của tôi (có kết quả ghép nối ≥ 0.90)
 *   2. #in-progress-container         — Những món đồ đang xử lý (trạng thái TT_03: Đang xác minh)
 *   3. #completed-items-container     — Những món đồ đã nhận lại (trạng thái TT_04: Đã trao trả)
 */

const API_BASE = 'http://localhost:3000';

/* ─────────────────────────── Helpers ─────────────────────────── */

function notif_getCurrentUserId() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        return user.ND_id || user.mssv || null;
    } catch {
        return null;
    }
}

function notif_escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function notif_formatTimeAgo(timestamp) {
    if (!timestamp) return '';
    const diff = Date.now() - Number(timestamp);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks} tuần trước`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} tháng trước`;
    return `${Math.floor(months / 12)} năm trước`;
}

function notif_getFullImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

/* ─────────────────────── Section 1: Ghép nối ─────────────────────── */

function renderLostItemCard(item) {
    const imgUrl = notif_getFullImageUrl(item.imageUrl);
    const imgHtml = imgUrl
        ? `<img class="w-full h-full object-cover" alt="${notif_escapeHtml(item.title)}" src="${imgUrl}" onerror="this.style.display='none'" />`
        : `<div class="w-full h-full flex items-center justify-center"><span class="material-symbols-outlined text-4xl text-stone-400">image_not_supported</span></div>`;

    const badgeHtml = item.matchCount > 0
        ? `<div class="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#ba1a1a] text-white font-bold text-xs flex items-center justify-center shadow-md">${item.matchCount}</div>`
        : '';

    return `
    <article
      class="relative bg-white rounded-2xl border border-[#E6E4DE] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden h-full flex flex-col justify-between hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:scale-[1.02] transition-all duration-300 ease-out cursor-pointer"
      onclick="window.location.href='match-detail.html?bmId=${notif_escapeHtml(item.bmId)}'">
      <div>
        <div class="relative h-32 w-full overflow-hidden bg-stone-800">
          ${imgHtml}
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>
        ${badgeHtml}
        <div class="px-5 pb-4">
          <div class="w-12 h-12 rounded-full border-2 border-white bg-[#f6f3f2] shadow-sm -mt-6 ml-1 z-10 flex items-center justify-center text-[#1f3227] relative">
            <span class="material-symbols-outlined text-xl">manage_search</span>
          </div>
          <div class="mt-3">
            <h2 class="text-base font-bold text-[#1b1c1c] line-clamp-2 min-h-[2.75rem]">${notif_escapeHtml(item.title)}</h2>
            <p class="mt-1 text-sm font-medium text-[#1f3227] flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm">hub</span>
              Có ${item.matchCount} kết quả ghép nối mới
            </p>
            <p class="mt-1 text-xs text-[#777771]">${notif_formatTimeAgo(item.postedAt)}</p>
          </div>
        </div>
      </div>
      <div>
        <div class="border-t border-[#E6E4DE]"></div>
        <div class="px-5 py-3 flex items-center justify-between text-[#777771]">
          <div class="flex items-center gap-2.5">
            <span class="text-xs text-warm-gray font-medium">Đang tìm kiếm</span>
            <div class="w-[1px] h-3.5 bg-[#E6E4DE]"></div>
            <div class="action-buttons-group">
              <button type="button"
                class="action-pill-btn edit-pill-btn"
                onclick="event.stopPropagation(); window.location.href='post-lost.html?mode=edit&id=${notif_escapeHtml(item.bmId)}';"
                title="Chỉnh sửa bài đăng">
                <span class="material-symbols-outlined text-[17px]">edit</span>
                <span class="action-pill-label">Chỉnh sửa</span>
              </button>
              <button type="button"
                class="action-pill-btn delete-pill-btn"
                onclick="event.stopPropagation(); notif_confirmDeleteLostItem('${notif_escapeHtml(item.bmId)}', this)"
                title="Xóa thông báo">
                <span class="material-symbols-outlined text-[17px]">delete</span>
                <span class="action-pill-label">Xóa thông báo</span>
              </button>
            </div>
          </div>
          <div>
            <a href="match-detail.html?bmId=${notif_escapeHtml(item.bmId)}"
              class="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1f3227] hover:text-[#2a3a31] transition-colors py-1"
              onclick="event.stopPropagation()">
              <span class="text-[13px] font-semibold">Xem chi tiết</span>
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>
    </article>`;
}

function notif_confirmDeleteLostItem(bmId, btn) {
    if (!confirm('Bạn có chắc muốn xóa thông báo báo mất này không?')) return;
    const card = btn.closest('article');
    if (card) {
        card.style.transition = 'opacity 0.3s, transform 0.3s';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => card.remove(), 300);
    }
}
window.notif_confirmDeleteLostItem = notif_confirmDeleteLostItem;

async function loadLostItemMatches(ndId) {
    const container = document.getElementById('lost-items-matched-container');
    if (!container) return;

    // Hiện skeleton loading
    container.innerHTML = `
      <div class="col-span-full flex items-center justify-center py-12 gap-3 text-[#777771]">
        <span class="material-symbols-outlined text-3xl animate-spin">progress_activity</span>
        <span class="text-sm">Đang tải kết quả ghép nối...</span>
      </div>`;

    if (!ndId) {
        container.innerHTML = `
          <div class="col-span-full p-10 text-center text-sm text-[#777771]">
            Vui lòng đăng nhập để xem kết quả ghép nối của bạn.
          </div>`;
        return;
    }

    try {
        const url = `${API_BASE}/api/verification-requests/matches?ndId=${encodeURIComponent(ndId)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success || !Array.isArray(json.data)) {
            throw new Error(json.message || 'Phản hồi kết quả ghép nối không hợp lệ.');
        }
        const items = Array.isArray(json.data) ? json.data : [];

        if (items.length === 0) {
            container.innerHTML = `
              <div class="col-span-full p-10 text-center text-sm text-[#777771]">
                <span class="material-symbols-outlined text-4xl block mb-2">manage_search</span>
                Bạn chưa có bài đăng báo mất nào hoặc hệ thống chưa tìm thấy kết quả ghép nối phù hợp.
              </div>`;
            return;
        }

        container.innerHTML = items.map(renderLostItemCard).join('');
    } catch (err) {
        console.error('[notifications.js] loadLostItemMatches error:', err);
        container.innerHTML = `
          <div class="col-span-full p-8 text-center text-sm text-rose-600 bg-rose-50 rounded-xl border border-rose-200">
            <span class="material-symbols-outlined text-3xl block mb-2">error</span>
            Không thể tải dữ liệu. Hãy kiểm tra kết nối hoặc thử lại sau.
          </div>`;
    }
}

/* ─────────────────────── Section 2: Đang xử lý ─────────────────────── */

function renderInProgressCard(item) {
    const imgUrl = notif_getFullImageUrl(item.imageUrl);
    const imgHtml = imgUrl
        ? `<img class="w-full h-full object-cover" alt="${notif_escapeHtml(item.title)}" src="${imgUrl}" onerror="this.style.display='none'" />`
        : `<div class="w-full h-full flex items-center justify-center"><span class="material-symbols-outlined text-4xl text-stone-400">image_not_supported</span></div>`;

    const cardId = `inprog-${notif_escapeHtml(item.id || item.bnId || Date.now())}`;
    const title = notif_escapeHtml(item.title || 'Món đồ đang xác minh');
    const bnId = notif_escapeHtml(item.id || item.bnId || '');
    const imgSafe = notif_escapeHtml(imgUrl || '');

    return `
    <article id="${cardId}"
      class="relative bg-white dark:bg-[#18191c] rounded-2xl border border-[#e7e1df] dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden h-full flex flex-col justify-between hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:scale-[1.02] transition-all duration-300 ease-out">
      <div>
        <div class="relative h-32 w-full overflow-hidden bg-stone-800">
          ${imgHtml}
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>
        <div class="px-5 pb-4">
          <div class="w-12 h-12 rounded-full border-2 border-white dark:border-stone-800 bg-[#f6f3f2] dark:bg-stone-800 shadow-sm -mt-6 ml-1 z-10 flex items-center justify-center text-[#1f3227] dark:text-emerald-400 relative">
            <span class="material-symbols-outlined text-xl">handshake</span>
          </div>
          <div class="mt-3 space-y-1">
            <h3 class="text-base font-bold text-[#1b1c1c] dark:text-white line-clamp-2 min-h-[2.75rem]">${title}</h3>
            <p class="mt-1 text-xs text-[#777771] dark:text-stone-400 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[15px] text-[#777771]">schedule</span>
              <span>Đang trong giai đoạn xác minh và chuẩn bị trao trả</span>
            </p>
            <p class="mt-0.5 text-xs text-amber-600 font-medium flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px]">pending</span>
              Đang xác minh
            </p>
          </div>
        </div>
      </div>
      <div>
        <div class="border-t border-[#E6E4DE] dark:border-stone-800"></div>
        <div class="p-4 flex items-center justify-between gap-2.5">
          <button type="button"
            onclick="notif_openCancelHandover('${cardId}', '${title}', '${bnId}')"
            class="px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-[#4a4746] dark:text-stone-300 transition-colors flex items-center gap-1 cursor-pointer">
            <span class="material-symbols-outlined text-[16px]">close</span>
            <span>Hủy</span>
          </button>
          <button type="button"
            onclick="notif_confirmHandoverSuccess('${cardId}', '${title}', '${imgSafe}', '${bnId}')"
            class="flex-1 px-4 py-2.5 rounded-xl bg-[#35483d] hover:bg-[#28372e] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer">
            <span class="material-symbols-outlined text-[16px]">verified</span>
            <span>Xác nhận</span>
          </button>
        </div>
      </div>
    </article>`;
}

async function loadInProgressItems(ndId) {
    const container = document.getElementById('in-progress-container');
    if (!container) return;
    container.replaceChildren();

    if (!ndId) {
        container.innerHTML = '<div class="col-span-full p-6 text-center text-xs text-[#777771]">Vui lòng đăng nhập để xem thông tin.</div>';
        return;
    }

    try {
        const url = `${API_BASE}/api/verification-requests/overview?ndId=${encodeURIComponent(ndId)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success || !json.data) {
            throw new Error(json.message || 'Phản hồi trạng thái xử lý không hợp lệ.');
        }
        const data = json.data || {};

        // Lấy các bài đăng báo nhặt đang ở trạng thái TT_03 (Đang xác minh)
        // Từ overview, lấy phần verifying (mảng các foundItem với requests)
        const verifyingItems = Array.isArray(data.verifying) ? data.verifying : [];

        if (verifyingItems.length === 0) {
            container.innerHTML = `
              <div class="col-span-3 p-6 text-center text-xs text-[#777771] bg-white rounded-xl border border-stone-200">
                Hiện không có món đồ nào đang trong quá trình trao trả.
              </div>`;
            return;
        }

        container.innerHTML = verifyingItems.map(item => renderInProgressCard({
            id: item.id || item.bnId,
            title: item.title,
            imageUrl: item.imageUrl || '',
            bnId: item.id || item.bnId
        })).join('');
    } catch (err) {
        console.error('[notifications.js] loadInProgressItems error:', err);
        container.innerHTML = `
          <div class="col-span-3 p-6 text-center text-xs text-rose-600 bg-rose-50 rounded-xl border border-rose-200">
            Không thể tải dữ liệu. Hãy kiểm tra kết nối hoặc thử lại sau.
          </div>`;
    }
}

/* ─────────────────────── Section 3: Đã nhận lại ─────────────────────── */

function renderCompletedCard(item, uniqueKey) {
    const imgUrl = notif_getFullImageUrl(item.imageUrl);
    const imgHtml = imgUrl
        ? `<img class="w-full h-full object-cover" alt="${notif_escapeHtml(item.title)}" src="${imgUrl}" onerror="this.style.display='none'" />`
        : `<div class="w-full h-full flex items-center justify-center"><span class="material-symbols-outlined text-4xl text-stone-400">image_not_supported</span></div>`;

    const uid = `notif-done-${uniqueKey}`;
    const title = notif_escapeHtml(item.title || 'Món đồ đã nhận lại');
    const storage = notif_escapeHtml(item.storage || '');
    const timeText = item.completedAt ? notif_formatTimeAgo(item.completedAt) : (item.postedAt ? notif_formatTimeAgo(item.postedAt) : '');

    return `
    <article
      class="relative bg-white dark:bg-[#18191c] rounded-2xl border border-[#E6E4DE] dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-visible h-full flex flex-col justify-between hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out cursor-default completed-item-card">
      <div>
        <div class="relative h-32 w-full overflow-hidden rounded-t-2xl bg-stone-800">
          ${imgHtml}
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>
        <div class="px-5 pb-4">
          <div class="w-12 h-12 rounded-full border-2 border-white bg-emerald-50 shadow-sm -mt-6 ml-1 z-10 flex items-center justify-center text-emerald-700 relative">
            <span class="material-symbols-outlined text-xl">verified</span>
          </div>
          <div class="mt-3">
            <h2 class="text-base font-bold text-[#1b1c1c] dark:text-white line-clamp-2 min-h-[2.75rem]">${title}</h2>
            <p class="mt-1 text-sm font-medium text-emerald-700 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm">verified</span>
              Đã nhận lại${storage ? ` tại ${storage}` : ' thành công'}
            </p>
            ${timeText ? `<p class="mt-1 text-xs text-[#777771]">Hoàn tất ${timeText}</p>` : ''}
          </div>
        </div>
      </div>

      <!-- Khối Giao diện Gửi Lời Cảm Ơn -->
      <div id="thank-section-${uid}"
        class="border-t border-[#E6E4DE] dark:border-stone-800 p-4 bg-[#fcfbfa] dark:bg-stone-900/40"
        onclick="event.stopPropagation()">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-[#1f3227] dark:text-emerald-400 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-rose-500">favorite</span>
            <span>Gửi lời cảm ơn đến người nhặt:</span>
          </span>
        </div>
        <div class="space-y-2">
          <select data-searchable="false"
            onchange="handleSelectPredefinedThanks(this, 'thank-input-${uid}')"
            class="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-[#1b1c1c] dark:text-white outline-none focus:border-[#35483d]">
            <option value="">-- Chọn nhanh lời cảm ơn mẫu --</option>
            <option value="Cảm ơn bạn rất nhiều vì đã nhặt được và trao trả lại cho mình! Chúc bạn luôn may mắn và học tốt!">Cảm ơn bạn rất nhiều vì đã nhặt được và trao trả lại cho mình!</option>
            <option value="Biết ơn tấm lòng tốt của bạn thật nhiều! Mình rất vui vì đã nhận lại được món đồ.">Biết ơn tấm lòng tốt của bạn thật nhiều!</option>
            <option value="Cảm ơn bạn và hệ thống CTU Lost & Found đã kết nối trao trả thành công! Chúc bạn một ngày tốt lành!">Cảm ơn bạn và CTU Lost & Found đã hỗ trợ trao trả!</option>
            <option value="Món đồ này có ý nghĩa rất lớn với mình, chân thành cảm ơn bạn nhiều lắm!">Món đồ này có ý nghĩa rất lớn với mình, chân thành cảm ơn bạn!</option>
          </select>
          <div class="flex items-center gap-1.5">
            <input type="text" id="thank-input-${uid}"
              placeholder="Hoặc tự nhập lời cảm ơn tại đây..."
              class="flex-1 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-800 text-[#1b1c1c] dark:text-white outline-none focus:border-[#35483d]"
              onkeydown="if(event.key==='Enter') sendThankYou('thank-input-${uid}', 'thank-section-${uid}')" />
            <button type="button"
              onclick="sendThankYou('thank-input-${uid}', 'thank-section-${uid}')"
              class="px-3.5 py-2 rounded-lg bg-[#35483d] hover:bg-[#28372e] text-white text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs">
              <span class="material-symbols-outlined text-[15px]">send</span>
              <span>Gửi</span>
            </button>
          </div>
        </div>
      </div>

      <div>
        <div class="border-t border-[#E6E4DE] dark:border-stone-800"></div>
        <div class="px-5 py-3 flex items-center justify-between text-[#777771] min-h-[48px]">
          <span class="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded font-semibold">Đã nhận lại</span>
        </div>
      </div>
    </article>`;
}

async function loadCompletedItems(ndId) {
    const container = document.getElementById('completed-items-container');
    if (!container) return;
    container.replaceChildren();

    if (!ndId) {
        container.innerHTML = '<div class="col-span-full p-6 text-center text-xs text-[#777771]">Vui lòng đăng nhập để xem thông tin.</div>';
        return;
    }

    try {
        const url = `${API_BASE}/api/verification-requests/overview?ndId=${encodeURIComponent(ndId)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success || !json.data) {
            throw new Error(json.message || 'Phản hồi trạng thái trao trả không hợp lệ.');
        }
        const data = json.data || {};

        // Lấy các bài đăng báo nhặt ở trạng thái TT_04 (Đã trao trả)
        const completedItems = Array.isArray(data.returned) ? data.returned : [];

        if (completedItems.length === 0) {
            container.innerHTML = `
              <div class="col-span-full p-6 text-center text-xs text-[#777771] bg-white rounded-xl border border-stone-200">
                Chưa có món đồ nào được xác nhận trao trả.
              </div>`;
            return;
        }

        const fragment = document.createDocumentFragment();
        completedItems.forEach((item, idx) => {
            const div = document.createElement('div');
            div.innerHTML = renderCompletedCard({
                id: item.id || item.bnId,
                title: item.title,
                imageUrl: item.imageUrl || '',
                storage: item.storage || '',
                completedAt: item.completedAt || item.postedAt
            }, `api-${idx}-${item.id || idx}`);
            if (div.firstElementChild) fragment.appendChild(div.firstElementChild);
        });
        container.replaceChildren(fragment);
    } catch (err) {
        console.error('[notifications.js] loadCompletedItems error:', err);
        container.innerHTML = `
          <div class="col-span-full p-6 text-center text-xs text-rose-600 bg-rose-50 rounded-xl border border-rose-200">
            Không thể tải dữ liệu. Hãy kiểm tra kết nối hoặc thử lại sau.
          </div>`;
    }
}

/* ─────────────────────── Hủy / Xác nhận trao trả ─────────────────────── */

// Các hàm này gọi lại modal có sẵn trong notifications.html
function notif_openCancelHandover(cardId, itemTitle, bnId) {
    // Lưu bnId vào modal để gọi API sau
    const modal = document.getElementById('modal-cancel-handover');
    if (modal) {
        modal.dataset.bnId = bnId;
        modal.dataset.cardId = cardId;
    }
    if (typeof openCancelHandoverModal === 'function') {
        openCancelHandoverModal(cardId, itemTitle);
    }
}
window.notif_openCancelHandover = notif_openCancelHandover;

async function notif_confirmHandoverSuccess(cardId, itemTitle, photoUrl, bnId) {
    // Gọi API confirm-handover
    if (bnId) {
        try {
            await fetch(`${API_BASE}/api/verification-requests/confirm-handover`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bnId })
            });
        } catch (err) {
            console.warn('[notifications.js] confirm-handover API error:', err);
        }
    }
    // Gọi hàm UI gốc từ HTML
    if (typeof confirmHandoverSuccess === 'function') {
        confirmHandoverSuccess(cardId, itemTitle, photoUrl);
    }
}
window.notif_confirmHandoverSuccess = notif_confirmHandoverSuccess;

/* ─────────────────────── Init Page ─────────────────────── */

async function initNotificationsPage() {
    if (!window.location.pathname.includes('notifications.html')) return;

    const ndId = notif_getCurrentUserId();

    // Load tất cả 3 sections song song
    await Promise.all([
        loadLostItemMatches(ndId),
        loadInProgressItems(ndId),
        loadCompletedItems(ndId)
    ]);
}

document.addEventListener('DOMContentLoaded', () => {
    initNotificationsPage();
});

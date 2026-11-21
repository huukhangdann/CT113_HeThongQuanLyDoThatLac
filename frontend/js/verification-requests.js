/**
 * Module quản lý và điều phối các yêu cầu xác minh nhận đồ
 * Sử dụng cho requests.html và request-detail.html
 */

const API_BASE = 'http://localhost:3000';

// Hàm helper escape html an toàn
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Lấy ID người dùng hiện tại
function getCurrentUserId() {
  try {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.ND_id) return user.ND_id;
    }
    const legacyId = localStorage.getItem('ctu_user_id');
    if (legacyId) return legacyId;
  } catch (e) {
    console.warn('[User Auth] Không thể parse currentUser từ localStorage', e);
  }
  return '';
}

// Định dạng thời gian tương đối hoặc ngày giờ
function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Gần đây';
  const diff = Date.now() - Number(timestamp);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(Number(timestamp)).toLocaleDateString('vi-VN');
}

// Hiển thị toast thông báo đẹp mắt
function showAppToast(title, message, type = 'success') {
  let toast = document.getElementById('appToastFloating');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToastFloating';
    toast.className = 'fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 max-w-md bg-white dark:bg-[#18191c] border p-4 rounded-xl shadow-xl flex items-start gap-3 pointer-events-none';
    document.body.appendChild(toast);
  }

  const isSuccess = type === 'success';
  const isWarning = type === 'warning';
  const iconColor = isSuccess ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' : (isWarning ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' : 'text-rose-600 bg-rose-50 dark:bg-rose-950/40');
  const borderColor = isSuccess ? 'border-emerald-200 dark:border-emerald-800' : (isWarning ? 'border-amber-200 dark:border-amber-800' : 'border-rose-200 dark:border-rose-800');
  const iconName = isSuccess ? 'check_circle' : (isWarning ? 'warning' : 'error');

  toast.className = `fixed bottom-6 right-6 z-50 transform translate-y-0 opacity-100 transition-all duration-300 max-w-md bg-white dark:bg-[#18191c] border ${borderColor} p-4 rounded-xl shadow-xl flex items-start gap-3 pointer-events-auto`;
  toast.innerHTML = `
    <div class="w-8 h-8 rounded-lg ${iconColor} flex items-center justify-center flex-shrink-0">
      <span class="material-symbols-outlined text-xl">${iconName}</span>
    </div>
    <div class="flex-1">
      <h4 class="font-bold text-sm text-[#1b1c1c] dark:text-white">${escapeHtml(title)}</h4>
      <p class="text-xs text-[#4a4746] dark:text-stone-300 mt-0.5">${escapeHtml(message)}</p>
    </div>
  `;

  setTimeout(() => {
    toast.className = 'fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 max-w-md bg-white dark:bg-[#18191c] border p-4 rounded-xl shadow-xl flex items-start gap-3 pointer-events-none';
  }, 4000);
}

// =========================================================================
// 1. TRANG REQUESTS.HTML (DANH SÁCH BÀI ĐĂNG BÁO NHẶT VÀ PHÂN ĐOẠN)
// =========================================================================
async function initRequestsPage() {
  const currentNdId = getCurrentUserId();
  const sections = Array.from(document.querySelectorAll('main > section.grid'));
  const loadingMarkup = '<div class="col-span-full p-6 text-center text-xs text-[#777771]">Đang tải dữ liệu...</div>';
  sections.forEach(section => {
    section.innerHTML = loadingMarkup;
  });

  if (!currentNdId) {
    sections.forEach(section => {
      section.innerHTML = '<div class="col-span-full p-6 text-center text-xs text-[#777771]">Vui lòng đăng nhập để xem dữ liệu.</div>';
    });
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/verification-requests/overview?ndId=${encodeURIComponent(currentNdId)}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (!result || !result.success || !result.data) {
      throw new Error(result?.message || 'Không thể tải dữ liệu yêu cầu ghép nối.');
    }

    const holdingItems = Array.isArray(result.data.holdingItems) ? result.data.holdingItems : [];
    const inProgressItems = Array.isArray(result.data.inProgressItems) ? result.data.inProgressItems : [];
    const completedItems = Array.isArray(result.data.completedItems) ? result.data.completedItems : [];
    const expiredItems = Array.isArray(result.data.expiredItems) ? result.data.expiredItems : [];

    // A. Render Phân đoạn 1: "Những món đồ nhặt được" (Đang giữ hộ / Chờ xác nhận)
    const holdingSection = document.querySelector('main > section.grid:first-of-type');
    if (holdingSection && holdingItems.length > 0) {
      holdingSection.innerHTML = holdingItems.map(item => {
        const reqCount = item.requestCount || 0;
        const badgeMarkup = reqCount > 0
          ? `<div class="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#ba1a1a] text-white font-bold text-xs flex items-center justify-center shadow-md animate-pulse">
               ${reqCount}
             </div>`
          : '';

        return `
          <article class="relative bg-white dark:bg-[#18191c] rounded-2xl border border-[#E6E4DE] dark:border-stone-800 shadow-sm overflow-hidden h-full flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
                   onclick="window.location.href='request-detail.html?id=${encodeURIComponent(item.id)}'">
            <div>
              <div class="relative h-32 w-full overflow-hidden bg-stone-800">
                ${renderRequestImage(item.imageUrl, item.title)}
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
              ${badgeMarkup}
              <div class="px-5 pb-4">
                <div class="w-12 h-12 rounded-full border-2 border-white dark:border-stone-800 bg-[#f6f3f2] dark:bg-stone-800 shadow-sm -mt-6 ml-1 z-10 flex items-center justify-center text-[#1f3227] dark:text-emerald-400 relative">
                  <span class="material-symbols-outlined text-xl">inventory_2</span>
                </div>
                <div class="mt-3">
                  <h2 class="text-base font-bold text-[#1b1c1c] dark:text-white line-clamp-2 min-h-[2.75rem]">
                    ${escapeHtml(item.title)}
                  </h2>
                  <p class="mt-1 text-sm font-medium text-[#1f3227] dark:text-emerald-400 flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm">hub</span>
                    ${reqCount > 0 ? `Có ${reqCount} yêu cầu xác nhận ghép nối` : 'Chưa có yêu cầu xác minh mới'}
                  </p>
                  <p class="mt-1 text-xs text-[#777771]">${formatTimeAgo(item.postedAt)}</p>
                </div>
              </div>
            </div>
            <div>
              <div class="border-t border-[#E6E4DE] dark:border-stone-800"></div>
              <div class="px-5 py-3 flex items-center justify-between text-[#777771]">
                <div class="flex items-center gap-2.5">
                  <span class="text-xs text-warm-gray font-medium">${escapeHtml(item.statusName || 'Đang giữ hộ')}</span>
                </div>
                <div class="flex items-center gap-3">
                  <a href="request-detail.html?id=${encodeURIComponent(item.id)}"
                     class="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1f3227] dark:text-emerald-400 hover:text-[#2a3a31] transition-colors py-1">
                    <span class="text-[13px] font-semibold">Xem chi tiết</span>
                    <span class="material-symbols-outlined text-sm">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>
          </article>
        `;
      }).join('');
    } else if (holdingSection) {
      holdingSection.innerHTML = '<div class="col-span-full p-6 text-center text-xs text-[#777771] bg-white rounded-xl border border-stone-200">Bạn chưa có món đồ nào đang chờ xác nhận.</div>';
    }

    // B. Render Phân đoạn 2: "Những món đồ đang xử lý" (TT_03: Đang xác minh)
    const inProgressContainer = document.getElementById('in-progress-container');
    if (inProgressContainer && inProgressItems) {
      if (inProgressItems.length === 0) {
        inProgressContainer.innerHTML = '<div class="col-span-1 md:col-span-2 lg:col-span-3 p-6 text-center text-xs text-[#777771] bg-white dark:bg-[#18191c] rounded-xl border border-stone-200 dark:border-stone-800">Hiện không có món đồ nào đang trong quá trình trao trả. Khi bạn chấp nhận yêu cầu của một sinh viên, món đồ sẽ hiển thị ở đây.</div>';
      } else {
        inProgressContainer.innerHTML = inProgressItems.map(item => {
          const photoUrl = getFullImageUrl(item.imageUrl);

          const receiver = item.acceptedRequest || {};
          const receiverName = receiver.studentName || 'Sinh viên đã xác minh';
          const receiverMssv = receiver.studentMssv ? ` (${receiver.studentMssv})` : '';
          const receiverPhone = receiver.phone ? ` • SĐT: ${receiver.phone}` : '';
          const messageText = receiver.message ? `Lời nhắn: "${receiver.message}"` : 'Đang hẹn gặp trao trả trực tiếp ngoài đời';

          return `
            <article id="card-inprog-${escapeHtml(item.id)}" class="relative bg-white dark:bg-[#18191c] rounded-2xl border border-[#e7e1df] dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden h-full flex flex-col justify-between hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:scale-[1.02] transition-all duration-300 ease-out">
              <div>
                <div class="relative h-32 w-full overflow-hidden bg-stone-800">
                  ${renderRequestImage(item.imageUrl, item.title)}
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                <div class="px-5 pb-4">
                  <div class="w-12 h-12 rounded-full border-2 border-white dark:border-stone-800 bg-[#f6f3f2] dark:bg-stone-800 shadow-sm -mt-6 ml-1 z-10 flex items-center justify-center text-[#1f3227] dark:text-emerald-400 relative">
                    <span class="material-symbols-outlined text-xl">handshake</span>
                  </div>
                  <div class="mt-3 space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                        Đang xác minh
                      </span>
                      <span class="text-[11px] text-[#777771]">${formatTimeAgo(item.postedAt)}</span>
                    </div>
                    <h3 class="text-base font-bold text-[#1b1c1c] dark:text-white line-clamp-2 min-h-[2.75rem]">
                      ${escapeHtml(item.title)}
                    </h3>
                    <p class="text-xs text-[#797675] dark:text-stone-400">
                      <strong class="text-[#1b1c1c] dark:text-stone-200">Chủ sở hữu:</strong> ${escapeHtml(receiverName)}${escapeHtml(receiverMssv)}${escapeHtml(receiverPhone)}
                    </p>
                    <div class="flex items-center gap-2 text-xs text-[#4a4746] dark:text-stone-300 bg-stone-50 dark:bg-stone-800/60 px-3 py-2 rounded-lg border border-stone-200/70 dark:border-stone-700/60">
                      <span class="material-symbols-outlined text-stone-500 text-[18px]">schedule</span>
                      <span class="line-clamp-2">${escapeHtml(messageText)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div class="border-t border-[#E6E4DE] dark:border-stone-800"></div>
                <div class="p-4 flex items-center justify-between gap-2.5">
                  <button type="button" onclick="handleCancelHandoverAction('${escapeHtml(item.id)}', '${escapeHtml(item.title)}')" class="px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-[#4a4746] dark:text-stone-300 transition-colors flex items-center gap-1 cursor-pointer">
                    <span class="material-symbols-outlined text-[16px]">close</span>
                    <span>Hủy</span>
                  </button>
                  <button type="button" onclick="handleConfirmHandoverAction('${escapeHtml(item.id)}', '${escapeHtml(item.title)}', '${escapeHtml(photoUrl)}')" class="flex-1 px-4 py-2.5 rounded-xl bg-[#35483d] hover:bg-[#28372e] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                    <span class="material-symbols-outlined text-[16px]">verified</span>
                    <span>Xác nhận trao trả</span>
                  </button>
                </div>
              </div>
            </article>
          `;
        }).join('');
      }
    }

    // C. Render Phân đoạn 3: "Những món đồ nhặt được đã trao trả thành công" (TT_04)
    if (completedItems.length > 0) {
      const allSections = document.querySelectorAll('main > section.grid');
      const completedSection = allSections[2]; // Section thứ 3
      if (completedSection) {
        completedSection.innerHTML = completedItems.map(item => {
          return `
            <article class="relative bg-white dark:bg-[#18191c] rounded-2xl border border-[#E6E4DE] dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden h-full flex flex-col justify-between hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out">
              <div>
                <div class="relative h-32 w-full overflow-hidden bg-stone-800">
                  ${renderRequestImage(item.imageUrl, item.title)}
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                <div class="absolute top-3 right-3 w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                  <span class="material-symbols-outlined text-[16px] font-bold">check</span>
                </div>
                <div class="px-5 pb-4">
                  <div class="w-12 h-12 rounded-full border-2 border-white dark:border-stone-800 bg-emerald-50 dark:bg-stone-800 shadow-sm -mt-6 ml-1 z-10 flex items-center justify-center text-emerald-700 dark:text-emerald-400 relative">
                    <span class="material-symbols-outlined text-xl">task_alt</span>
                  </div>
                  <div class="mt-3">
                    <h2 class="text-base font-bold text-[#1b1c1c] dark:text-white line-clamp-2 min-h-[2.75rem]">
                      ${escapeHtml(item.title)}
                    </h2>
                    <p class="mt-1 text-sm font-medium text-emerald-700 flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-sm">verified</span>
                      Đã bàn giao cho chủ nhân thành công
                    </p>
                    <p class="mt-1 text-xs text-[#777771]">Hoàn tất trên hệ thống</p>
                  </div>
                </div>
              </div>
              <div>
                <div class="border-t border-[#E6E4DE] dark:border-stone-800"></div>
                <div class="px-5 py-3 flex items-center justify-between text-[#777771]">
                  <span class="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">check_circle</span>
                    Đã trao trả
                  </span>
                </div>
              </div>
            </article>
          `;
        }).join('');
      }
    } else {
      const completedSection = document.querySelectorAll('main > section.grid')[2];
      if (completedSection) {
        completedSection.innerHTML = '<div class="col-span-full p-6 text-center text-xs text-[#777771] bg-white rounded-xl border border-stone-200">Chưa có món đồ nào được xác nhận trao trả.</div>';
      }
    }

    // D. Render Phân đoạn 4: "Những món đồ nhặt được quá hạn" (TT_05: Đã được ẩn)
    if (expiredItems.length > 0) {
      const allSections = document.querySelectorAll('main > section.grid');
      const expiredSection = allSections[3]; // Section thứ 4
      if (expiredSection) {
        expiredSection.innerHTML = expiredItems.map(item => {
          return `
            <article class="relative bg-[#fbf9f8] rounded-2xl border border-[#d8d4d1] shadow-none overflow-hidden h-full flex flex-col justify-between grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <div>
                <div class="relative h-32 w-full overflow-hidden bg-stone-700">
                  ${renderRequestImage(item.imageUrl, item.title)}
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                <div class="px-5 pb-4">
                  <div class="w-12 h-12 rounded-full border-2 border-white bg-neutral-200 shadow-sm -mt-6 ml-1 z-10 flex items-center justify-center text-neutral-700 relative">
                    <span class="material-symbols-outlined text-xl">history_toggle_off</span>
                  </div>
                  <div class="mt-3">
                    <h2 class="text-base font-bold text-[#1b1c1c]">
                      ${escapeHtml(item.title)}
                    </h2>
                    <p class="mt-1 text-sm font-medium text-neutral-600 flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-sm">schedule</span>
                      Đã quá hạn lưu giữ hơn 30 ngày (Đã được ẩn)
                    </p>
                    <p class="mt-1 text-xs text-[#777771]">${formatTimeAgo(item.postedAt)}</p>
                  </div>
                </div>
              </div>
              <div>
                <div class="border-t border-[#E6E4DE]"></div>
                <div class="px-5 py-3 flex items-center justify-between text-[#777771]">
                  <span class="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Đã được ẩn</span>
                  <button type="button" onclick="showAppToast('Thông báo', 'Bài đăng này đã quá hạn xác minh 30 ngày và tự động ẩn theo quy định.', 'warning')"
                          class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1f3227] hover:text-white bg-[#e8e4e1] hover:bg-[#35483d] px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                    <span class="material-symbols-outlined text-[16px]">visibility_off</span>
                    <span>Đã ẩn</span>
                  </button>
                </div>
              </div>
            </article>
          `;
        }).join('');
      }
    } else {
      const expiredSection = document.querySelectorAll('main > section.grid')[3];
      if (expiredSection) {
        expiredSection.innerHTML = '<div class="col-span-full p-6 text-center text-xs text-[#777771] bg-white rounded-xl border border-stone-200">Chưa có bài đăng nào hết hạn.</div>';
      }
    }

  } catch (error) {
    console.error('[Verification Requests Overview Error]:', error);
    sections.forEach(section => {
      section.innerHTML = '<div class="col-span-full p-6 text-center text-xs text-rose-600 bg-rose-50 rounded-xl border border-rose-200">Không thể tải dữ liệu. Vui lòng thử lại sau.</div>';
    });
  }
}

// Xử lý nút Xác nhận hoàn tất trao trả trên requests.html
async function handleConfirmHandoverAction(bnId, title, photoUrl) {
  try {
    const res = await fetch(`${API_BASE}/api/verification-requests/confirm-handover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bnId })
    });

    const result = await res.json();
    if (res.ok && result.success) {
      showAppToast('Xác nhận thành công!', `Đã hoàn tất trao trả món đồ "${title}". Cả hai bên đã xác nhận hoàn tất trên hệ thống.`);
      // Reload lại danh sách sau 1 giây
      setTimeout(() => initRequestsPage(), 1200);
    } else {
      showAppToast('Lỗi', result.message || 'Không thể xác nhận hoàn tất trao trả.', 'warning');
    }
  } catch (err) {
    showAppToast('Lỗi mạng', 'Không thể kết nối đến máy chủ.', 'warning');
  }
}

// Xử lý nút Hủy trao trả trên requests.html
let pendingCancelBnId = null;
function handleCancelHandoverAction(bnId, title) {
  pendingCancelBnId = bnId;
  const modal = document.getElementById('modal-cancel-handover');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

// Helper lấy URL ảnh hoàn chỉnh
function getFullImageUrl(url) {
  if (!url) return '';
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

function renderRequestImage(url, alt) {
  const imageUrl = getFullImageUrl(url);
  return imageUrl
    ? `<img class="w-full h-full object-cover" alt="${escapeHtml(alt)}" src="${escapeHtml(imageUrl)}" />`
    : '<div class="w-full h-full flex items-center justify-center text-stone-400"><span class="material-symbols-outlined text-4xl">image_not_supported</span></div>';
}

// Chuyển ảnh chính khi click vào thumbnail
function selectDetailThumbnail(idx, imgUrl) {
  const heroImg = document.getElementById('mainHeroImage');
  if (heroImg) {
    heroImg.src = getFullImageUrl(imgUrl);
  }
  const buttons = document.querySelectorAll('#thumbnailsContainer button');
  buttons.forEach((btn, i) => {
    if (i === idx) {
      btn.className = "thumb-btn relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-[#35483d] p-0.5 bg-white transition-all cursor-pointer shadow-sm hover:opacity-90";
    } else {
      btn.className = "thumb-btn relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-transparent hover:border-[#35483d]/50 p-0.5 bg-white transition-all cursor-pointer shadow-sm hover:opacity-90";
    }
  });
}
window.selectDetailThumbnail = selectDetailThumbnail;
window.selectThumbnail = selectDetailThumbnail;

// =========================================================================
// 2. TRANG REQUEST-DETAIL.HTML (CHI TIẾT BÀI ĐĂNG & DUYỆT YÊU CẦU XÁC MINH)
// =========================================================================
let currentDetailBnId = '';
let currentAcceptYcId = '';
let currentAcceptStudentName = '';
let currentAcceptMssv = '';

async function initRequestDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  let bnId = urlParams.get('id') || 'BN_001';
  if (bnId.startsWith('find-')) bnId = bnId.slice(5);
  currentDetailBnId = bnId;

  try {
    const response = await fetch(`${API_BASE}/api/verification-requests/item/${encodeURIComponent(bnId)}`);
    if (!response.ok) return;
    const result = await response.json();
    if (!result || !result.success || !result.data) return;

    const { foundItem, requests } = result.data;

    // 1. Cập nhật thông tin bài đăng ở cột trái
    if (foundItem) {
      const heroImg = document.getElementById('mainHeroImage');
      if (heroImg && foundItem.imageUrl) {
        heroImg.src = getFullImageUrl(foundItem.imageUrl);
      }

      // Xử lý thumbnails và số lượng ảnh
      const rawThumbs = Array.isArray(foundItem.thumbnails) && foundItem.thumbnails.length > 0
        ? foundItem.thumbnails
        : (foundItem.imageUrl ? [foundItem.imageUrl] : []);
      const thumbs = [...new Set(rawThumbs)];

      const thumbsContainer = document.getElementById('thumbnailsContainer');
      const imageCountText = document.getElementById('imageCountText');

      if (imageCountText) {
        imageCountText.textContent = `${thumbs.length} hình ảnh`;
      }

      if (thumbsContainer) {
        if (thumbs.length > 1) {
          thumbsContainer.classList.remove('hidden');
          thumbsContainer.className = `grid grid-cols-${Math.min(thumbs.length, 4)} gap-3 mt-4`;
          thumbsContainer.innerHTML = thumbs.map((url, idx) => {
            const fullUrl = getFullImageUrl(url);
            const activeBorder = idx === 0 ? 'border-[#35483d]' : 'border-transparent hover:border-[#35483d]/50';
            return `
              <button type="button"
                class="thumb-btn relative aspect-[4/3] rounded-lg overflow-hidden border-2 ${activeBorder} p-0.5 bg-white transition-all cursor-pointer shadow-sm hover:opacity-90"
                onclick="selectDetailThumbnail(${idx}, '${escapeHtml(fullUrl)}')"
                title="Ảnh ${idx + 1}">
                <img alt="Ảnh ${idx + 1}" class="w-full h-full object-cover rounded" src="${escapeHtml(fullUrl)}" />
              </button>
            `;
          }).join('');
        } else {
          // Chỉ có 1 ảnh: ẩn toàn bộ vùng thumbnail bên dưới
          thumbsContainer.innerHTML = '';
          thumbsContainer.classList.add('hidden');
        }
      }

      const titleEl = document.getElementById('itemDetailTitle') || document.querySelector('h1.font-bold.text-2xl');
      if (titleEl && foundItem.title) {
        titleEl.textContent = foundItem.title;
      }

      const locEl = document.getElementById('locationText');
      if (locEl && foundItem.locationText) {
        locEl.textContent = foundItem.locationText;
      }

      const foundTimeEl = document.getElementById('foundTimeText');
      if (foundTimeEl && foundItem.foundAt) {
        const foundDate = new Date(Number(foundItem.foundAt));
        foundTimeEl.textContent = `${formatTimeAgo(foundItem.foundAt)} (${foundDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})`;
      }

      const postedTimeEl = document.getElementById('postedTimeText');
      if (postedTimeEl && foundItem.postedAt) {
        postedTimeEl.textContent = formatTimeAgo(foundItem.postedAt);
      }

      const storageEl = document.getElementById('storageText');
      if (storageEl && foundItem.storage) {
        storageEl.textContent = foundItem.storage;
      }

      const descEl = document.getElementById('descriptionText');
      if (descEl && foundItem.description) {
        descEl.textContent = `"${foundItem.description}"`;
      }

      // Cập nhật câu hỏi xác minh ở cột phải
      const questionEl = document.querySelector('.mb-4.flex.items-start.gap-2\\.5 p.text-sm.font-semibold');
      if (questionEl && foundItem.question) {
        questionEl.textContent = foundItem.question;
      }
    }

    // 2. Render danh sách yêu cầu xác minh ở cột phải
    const requestContainer = document.querySelector('.flex.flex-col.gap-4.overflow-y-auto');
    if (requestContainer && requests) {
      if (requests.length === 0) {
        requestContainer.innerHTML = `
          <div class="p-8 text-center bg-[#fcf9f8] dark:bg-stone-800/40 rounded-xl border border-dashed border-[#e7e1df] dark:border-stone-700">
            <span class="material-symbols-outlined text-3xl text-stone-400 mb-2">inbox</span>
            <p class="text-sm font-semibold text-[#1b1c1c] dark:text-white">Chưa có yêu cầu xác minh nào</p>
            <p class="text-xs text-[#797675] mt-1">Khi các bạn sinh viên điền form xác minh quyền sở hữu, danh sách sẽ hiển thị tại đây để bạn đối chiếu và chấp nhận.</p>
          </div>
        `;
      } else {
        requestContainer.innerHTML = requests.map(req => {
          const initials = (req.studentName || 'SV')
            .split(' ')
            .map(w => w[0])
            .slice(-2)
            .join('')
            .toUpperCase();

          const isAccepted = req.isAccepted || req.status === 'DaChapNhan';
          const buttonMarkup = isAccepted
            ? `<button type="button" disabled class="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-default flex items-center gap-1.5 shadow-sm">
                 <span class="material-symbols-outlined text-[16px]">check_circle</span>
                 <span>Đã chấp nhận</span>
               </button>`
            : `<button type="button" onclick="triggerAcceptFlow('${escapeHtml(req.id)}', '${escapeHtml(req.studentName)}', '${escapeHtml(req.studentMssv)}', '${escapeHtml(req.answer)}')"
                       class="accept-btn bg-[#35483d] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#28372e] transition-colors whitespace-nowrap cursor-pointer shadow-sm">
                 Chấp nhận
               </button>`;

          return `
            <div class="flex flex-row items-center gap-4 p-4 border border-[#e7e1df] dark:border-stone-700 rounded-xl bg-white dark:bg-[#18191c] shadow-sm hover:border-[#35483d] transition-all">
              <div class="w-14 h-14 rounded-xl bg-[#f0edec] dark:bg-stone-800 text-[#35483d] dark:text-emerald-400 font-bold text-lg flex items-center justify-center flex-shrink-0 border border-[#e7e1df] dark:border-stone-700">
                ${escapeHtml(initials)}
              </div>
              <div class="flex-1 min-w-0 flex flex-col gap-1">
                <div class="font-semibold text-[#1b1c1c] dark:text-white truncate">
                  ${escapeHtml(req.studentName)} <span class="text-xs font-normal text-[#797675]">(MSSV: ${escapeHtml(req.studentMssv || 'B2xxxxxx')})</span>
                </div>
                <div class="text-sm text-[#4a4746] dark:text-stone-300 leading-snug">
                  ${escapeHtml(req.answer)}
                </div>
                ${req.phone ? `<div class="text-xs text-[#797675] flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">call</span> SĐT/Zalo: ${escapeHtml(req.phone)}</div>` : ''}
              </div>
              <div class="flex-shrink-0">
                ${buttonMarkup}
              </div>
            </div>
          `;
        }).join('');
      }
    }

  } catch (error) {
    console.error('[Request Detail Page Error]:', error);
  }
}

// Kích hoạt Modal chấp nhận yêu cầu
function triggerAcceptFlow(ycId, studentName, mssv, proof) {
  currentAcceptYcId = ycId;
  currentAcceptStudentName = studentName;
  currentAcceptMssv = mssv;

  const modal = document.getElementById('modal-confirm-accept');
  const studentEl = document.getElementById('modal-accept-student');
  const mssvEl = document.getElementById('modal-accept-mssv');
  const proofEl = document.getElementById('modal-accept-proof');

  if (studentEl) studentEl.textContent = studentName;
  if (mssvEl) mssvEl.textContent = mssv;
  if (proofEl) proofEl.textContent = `"${proof}"`;

  if (modal) {
    modal.classList.remove('hidden');
  }
}

// Gắn sự kiện xác nhận chấp nhận yêu cầu trong modal
function setupDetailModalListeners() {
  const submitBtn = document.getElementById('btn-confirm-accept-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      if (!currentAcceptYcId || !currentDetailBnId) return;

      const modal = document.getElementById('modal-confirm-accept');
      if (modal) modal.classList.add('hidden');

      try {
        const response = await fetch(`${API_BASE}/api/verification-requests/accept`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ycId: currentAcceptYcId,
            bnId: currentDetailBnId
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showAppToast(
            'Ghép nối thành công!',
            `Đã chấp nhận yêu cầu của ${currentAcceptStudentName}. Bài đăng đã chuyển sang trạng thái "Đang xác minh" và chuyển xuống mục "Những món đồ đang xử lý".`
          );

          // Tự động chuyển về trang requests.html sau 1.5s
          setTimeout(() => {
            window.location.href = 'requests.html#in-progress-heading';
          }, 1500);
        } else {
          showAppToast('Lỗi', result.message || 'Không thể chấp nhận yêu cầu.', 'warning');
        }
      } catch (err) {
        showAppToast('Lỗi kết nối', 'Không thể gửi yêu cầu xác nhận tới máy chủ.', 'warning');
      }
    });
  }
}

// Khởi chạy tự động khi trang được load
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (path.includes('requests.html')) {
    initRequestsPage();
  } else if (path.includes('request-detail.html')) {
    initRequestDetailPage();
    setupDetailModalListeners();
  }
});

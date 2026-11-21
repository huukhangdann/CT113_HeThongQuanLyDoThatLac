(() => {
    const API_BASE = 'http://localhost:3000';
    const PAGE_SIZE = 50;
    const BATCH_SIZE = 6;
    const grid = document.getElementById('recent-posts-grid');
    const sortSelect = document.getElementById('home-sort-select');
    const loadMoreButton = document.getElementById('btn-load-more');
    const loadMoreText = document.getElementById('btn-load-more-text');
    if (!grid) return;

    let posts = [];
    let visibleCount = 0;

    const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);

    const fullImageUrl = value => {
        if (!value) return '';
        try {
            return new URL(value, `${API_BASE}/`).href;
        } catch {
            return '';
        }
    };

    const formatDate = timestamp => {
        if (!timestamp) return 'Chưa cập nhật thời gian';
        return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })
            .format(new Date(timestamp));
    };

    const getSortedPosts = () => {
        const sorted = [...posts];
        switch (sortSelect?.value) {
            case 'oldest':
                return sorted.reverse();
            case 'az':
                return sorted.sort((left, right) => left.title.localeCompare(right.title, 'vi'));
            case 'za':
                return sorted.sort((left, right) => right.title.localeCompare(left.title, 'vi'));
            default:
                return sorted;
        }
    };

    const renderPosts = () => {
        const visiblePosts = getSortedPosts().slice(0, visibleCount);
        grid.innerHTML = visiblePosts.map(item => {
            const imageUrl = fullImageUrl(item.imageUrl);
            const imageMarkup = imageUrl
                ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.title)}" class="w-full h-full object-cover" loading="lazy" />`
                : `<div class="w-full h-full flex items-center justify-center text-[#777771]"><span class="material-symbols-outlined text-5xl">image</span></div>`;
            const detailUrl = `claim.html?id=${encodeURIComponent(item.id)}&from=index.html`;

            return `
                <article class="group bg-stone-50 hover:bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:scale-[1.02] transition-all duration-300 ease-out cursor-pointer flex flex-col" data-post-id="${escapeHtml(item.id)}">
                    <a href="${detailUrl}" class="h-48 sm:h-52 md:h-60 bg-stone-200 overflow-hidden shrink-0 block">
                        ${imageMarkup}
                    </a>
                    <div class="p-4 flex flex-col flex-1 justify-between">
                        <div>
                            <h3 class="font-semibold text-sm text-soft-black group-hover:text-deep-sage transition-colors truncate">${escapeHtml(item.title || 'Chưa có tiêu đề')}</h3>
                            <p class="flex items-center gap-1.5 text-warm-gray text-xs mt-2.5 truncate">
                                <span class="material-symbols-outlined text-sm shrink-0">location_on</span>
                                ${escapeHtml(item.location || 'Chưa cập nhật địa điểm')}
                            </p>
                            <p class="flex items-center gap-1.5 text-warm-gray text-xs mt-1.5">
                                <span class="material-symbols-outlined text-sm shrink-0">schedule</span>
                                ${escapeHtml(formatDate(item.postedAt))}
                            </p>
                        </div>
                        <div class="pt-2.5 mt-3 border-t border-stone-border/70 flex items-center justify-between text-xs">
                            <span class="text-warm-gray font-medium">${escapeHtml(item.status || 'Chưa cập nhật')}</span>
                            <a href="${detailUrl}" class="font-medium text-deep-sage flex items-center gap-1">
                                <span>Xem chi tiết</span>
                                <span class="material-symbols-outlined text-sm">arrow_forward</span>
                            </a>
                        </div>
                    </div>
                </article>`;
        }).join('');

        if (loadMoreButton) {
            loadMoreButton.hidden = visibleCount >= posts.length;
            if (loadMoreText) loadMoreText.textContent = 'Xem thêm';
        }
    };

    grid.replaceChildren();
    if (loadMoreButton) loadMoreButton.hidden = true;
    grid.innerHTML = '<p class="col-span-full py-8 text-center text-sm text-[#777771]">Đang tải bài đăng gần đây...</p>';

    fetch(`${API_BASE}/api/found/search?sort=newest&page=1&pageSize=${PAGE_SIZE}`)
        .then(async response => {
            const result = await response.json();
            if (!response.ok || !result.success || !Array.isArray(result.items)) {
                throw new Error(result.message || 'Không thể tải bài đăng gần đây.');
            }
            posts = result.items;
            visibleCount = Math.min(BATCH_SIZE, posts.length);
            if (sortSelect) sortSelect.addEventListener('change', renderPosts);
            if (loadMoreButton) {
                loadMoreButton.addEventListener('click', () => {
                    visibleCount = Math.min(visibleCount + BATCH_SIZE, posts.length);
                    renderPosts();
                });
            }
            if (posts.length === 0) {
                grid.innerHTML = '<p class="col-span-full py-8 text-center text-sm text-[#777771]">Chưa có bài đăng báo nhặt nào.</p>';
                return;
            }
            renderPosts();
        })
        .catch(error => {
            console.error('[Recent Posts] Không thể tải bài đăng:', error);
            grid.innerHTML = `<p class="col-span-full py-8 text-center text-sm text-rose-600">${escapeHtml(error.message || 'Không thể tải bài đăng gần đây.')}</p>`;
        });
})();

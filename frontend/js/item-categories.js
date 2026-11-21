(() => {
    const API_BASE = 'http://localhost:3000';

    window.itemCategoriesReady = new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', async () => {
            const select = document.getElementById('item-category');
            if (!select) {
                resolve(false);
                return;
            }

            select.disabled = true;
            select.replaceChildren(new Option('Đang tải danh mục...', ''));

            try {
                const response = await fetch(`${API_BASE}/api/found/categories`);
                const result = await response.json();
                if (!response.ok || !result.success || !Array.isArray(result.data)) {
                    throw new Error(result.message || 'Không thể tải danh mục loại đồ.');
                }

                const placeholder = new Option('-- Chọn loại đồ vật --', '');
                placeholder.disabled = true;
                placeholder.selected = true;
                select.replaceChildren(placeholder);
                result.data.forEach(category => {
                    select.add(new Option(category.name, category.id));
                });
                select.disabled = false;
                resolve(true);
            } catch (error) {
                console.error('[Item Categories] Không thể tải danh mục:', error);
                select.replaceChildren(new Option('Không tải được danh mục - thử tải lại trang', ''));
                resolve(false);
            }
        }, { once: true });
    });
})();

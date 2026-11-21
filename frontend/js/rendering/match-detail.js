(() => {
    const API_BASE = 'http://localhost:3000';
    const mapData = window.campusData;
    const mapContainer = document.getElementById('map-viewport-container');
    const params = new URLSearchParams(window.location.search);
    const bmId = params.get('bmId') || '';

    const clearSampleItems = () => {
        (mapData?.buildings || []).forEach(building => {
            building.totalItems = 0;
            building.matchedItemsCount = 0;
            building.highestMatchScore = 0;
            (building.floors || []).forEach(floor => {
                floor.itemsCount = 0;
                (floor.rooms || []).forEach(room => {
                    delete room.hasItem;
                    delete room.item;
                });
            });
        });
    };

    const getCurrentUserId = () => {
        try {
            return JSON.parse(localStorage.getItem('currentUser') || '{}').ND_id || '';
        } catch (error) {
            console.error('[Match Detail] Không thể đọc người dùng hiện tại:', error);
            return '';
        }
    };

    const fullImageUrl = value => {
        if (!value) return '';
        try {
            return new URL(value, `${API_BASE}/`).href;
        } catch {
            return '';
        }
    };

    const clearResultItemRecords = () => {
        (mapData?.buildings || []).forEach(building => {
            building.totalItems = 0;
            building.matchedItemsCount = 0;
            building.highestMatchScore = 0;
            (building.floors || []).forEach(floor => {
                floor.itemsCount = 0;
                floor.rooms = (floor.rooms || []).filter(room => !String(room.id || '').startsWith('result-'));
            });
        });
    };

    const normalizeBuildingId = value => String(value || '')
        .toLowerCase()
        .replace(/^toa[_-]?/, '')
        .replace(/[^a-z0-9]/g, '');

    const getFloorForItem = (building, item) => {
        const rawFloorNumber = item.floorNumber === null || item.floorNumber === undefined || item.floorNumber === ''
            ? NaN
            : Number(item.floorNumber);
        const isGroundFloor = rawFloorNumber === 0;
        const floorNumber = Number.isFinite(rawFloorNumber) ? (isGroundFloor ? 1 : rawFloorNumber) : 1;
        let floor = building.floors.find(candidate => candidate.floorNumber === floorNumber);
        if (!floor) {
            floor = {
                floorNumber,
                name: item.floorName || (isGroundFloor ? 'Tầng 1 (trệt)' : `Tầng ${floorNumber}`),
                itemsCount: 0,
                rooms: []
            };
            building.floors.push(floor);
            building.totalFloors = Math.max(building.totalFloors || 0, floorNumber);
        }
        return floor;
    };

    const addItemToMap = (item, isMatched) => {
        if (!item) return false;
        const building = mapData.buildings.find(candidate =>
            normalizeBuildingId(candidate.id) === normalizeBuildingId(item.buildingId)
            || normalizeBuildingId(candidate.code) === normalizeBuildingId(item.buildingId)
        );
        if (!building) return false;

        const floor = getFloorForItem(building, item);
        const roomName = item.roomName
            || String(item.locationText || item.location || '').split(' - ').pop()
            || building.name;
        const roomId = `result-${String(item.id).replace(/[^a-z0-9_-]/gi, '-')}`;
        floor.rooms.push({
            id: roomId,
            name: roomName,
            type: 'class',
            col: (floor.rooms.length % 3) + 1,
            row: Math.floor(floor.rooms.length / 3) + 1,
            hasItem: true,
            item: {
                id: item.id,
                title: item.title,
                category: item.category || 'Đồ vật',
                time: item.foundAt ? new Date(item.foundAt).toLocaleString('vi-VN') : '',
                location: item.locationText || item.location || '',
                status: item.status || 'Đang giữ đồ',
                image: fullImageUrl(item.imageUrl),
                matchScore: isMatched ? Number(item.scorePercent) || 0 : 0,
                isMatched
            }
        });
        floor.itemsCount += 1;
        building.totalItems += 1;
        if (isMatched) {
            building.matchedItemsCount += 1;
            building.highestMatchScore = Math.max(building.highestMatchScore, Number(item.scorePercent) || 0);
        }
        return true;
    };

    const renderMatchedItemsOnMap = (matches, foundItems) => {
        clearResultItemRecords();
        let mappedMatchedItems = 0;
        let mappedFoundItems = 0;
        const matchedIds = new Set();

        matches.forEach(match => {
            const item = match.foundItem;
            if (!item) return;
            matchedIds.add(String(item.id));
            if (addItemToMap({ ...item, scorePercent: match.scorePercent }, true)) mappedMatchedItems += 1;
        });

        foundItems
            .filter(item => !matchedIds.has(String(item.id)) && !['TT_04', 'TT_05'].includes(item.statusId))
            .forEach(item => {
                if (addItemToMap(item, false)) mappedFoundItems += 1;
            });

        if (!mappedMatchedItems && !mappedFoundItems) {
            if (mapContainer) {
                mapContainer.innerHTML = '<p class="p-8 text-center text-sm text-[#777771]">Chưa có vị trí tòa nhà cho các bài đăng đã ghép nối.</p>';
            }
            return;
        }
        if (window.initCampusMap) window.initCampusMap();
        else if (mapContainer) {
            mapContainer.innerHTML = '<p class="p-8 text-center text-sm text-rose-600">Không tải được bản đồ kết quả ghép nối.</p>';
        }

        if (!mappedMatchedItems && mapContainer) {
            mapContainer.insertAdjacentHTML('afterbegin', '<p class="px-4 py-3 text-center text-xs text-amber-700 bg-amber-50">Chưa có vị trí bản đồ cho kết quả ghép nối; các điểm vàng là bài nhặt khác.</p>');
        }
    };

    const loadFoundItems = async () => {
        const foundItems = [];
        let page = 1;
        let totalPages = 1;

        while (page <= totalPages) {
            const response = await fetch(`${API_BASE}/api/found/search?sort=newest&page=${page}&pageSize=50`);
            const result = await response.json();
            if (!response.ok || !result.success || !Array.isArray(result.items)) {
                throw new Error(result.message || 'Không thể tải các bài đăng nhặt khác.');
            }
            foundItems.push(...result.items);
            totalPages = Number(result.totalPages) || 1;
            page += 1;
        }

        return foundItems;
    };

    clearSampleItems();

    document.addEventListener('DOMContentLoaded', async () => {
        const title = document.getElementById('lostItemMatchTitle');
        const description = document.getElementById('lostItemMatchDescription');
        const image = document.getElementById('lostItemMatchImage');
        if (mapContainer) {
            mapContainer.innerHTML = '<p class="p-8 text-center text-sm text-[#777771]">Đang tải bản đồ kết quả ghép nối...</p>';
        }

        try {
            const ndId = getCurrentUserId();
            if (!ndId) {
                if (title) title.textContent = 'Vui lòng đăng nhập để xem kết quả ghép nối';
                if (description) description.textContent = 'Đăng nhập bằng tài khoản của bạn để xem thông tin bài đăng và bản đồ.';
                if (mapContainer) mapContainer.innerHTML = '';
                return;
            }
            const query = `?ndId=${encodeURIComponent(ndId)}`;
            const response = await fetch(`${API_BASE}/api/verification-requests/matches${query}`);
            const result = await response.json();
            if (!response.ok || !result.success || !Array.isArray(result.data)) {
                throw new Error(result.message || 'Không thể tải kết quả ghép nối.');
            }

            const lostItem = result.data.find(item => item.bmId === bmId);
            if (!lostItem) {
                if (title) title.textContent = 'Không tìm thấy bài đăng báo mất';
                if (description) description.textContent = 'Bài đăng không còn kết quả ghép nối phù hợp.';
                if (mapContainer) mapContainer.innerHTML = '<p class="p-8 text-center text-sm text-[#777771]">Không có vị trí ghép nối để hiển thị.</p>';
                return;
            }

            if (title) title.textContent = lostItem.title;
            if (description) description.textContent = lostItem.description || 'Thông tin bài đăng báo mất.';
            if (image) {
                const imageUrl = fullImageUrl(lostItem.imageUrl);
                if (imageUrl) {
                    image.src = imageUrl;
                    image.classList.remove('hidden');
                } else {
                    image.removeAttribute('src');
                    image.classList.add('hidden');
                }
                image.alt = lostItem.title;
            }
            let foundItems = [];
            let foundItemsError = false;
            try {
                foundItems = await loadFoundItems();
            } catch (error) {
                foundItemsError = true;
                console.error('[Match Detail] Không thể tải các bài đăng nhặt ở vị trí khác:', error);
            }
            renderMatchedItemsOnMap(lostItem.matchedItems || [], foundItems);
            if (foundItemsError && mapContainer) {
                mapContainer.insertAdjacentHTML('afterbegin', '<p role="alert" class="px-4 py-3 text-center text-xs text-rose-600 bg-rose-50">Không thể tải các bài đăng nhặt ở vị trí khác; hiện chỉ có thể xem kết quả ghép nối.</p>');
            }
        } catch (error) {
            console.error('[Match Detail] Không thể tải kết quả ghép nối:', error);
            if (title) title.textContent = 'Không thể tải kết quả ghép nối';
            if (description) description.textContent = error.message || 'Vui lòng thử lại sau.';
            if (mapContainer) mapContainer.innerHTML = '<p class="p-8 text-center text-sm text-rose-600">Không thể tải bản đồ kết quả ghép nối.</p>';
        }
    }, { once: true });
})();

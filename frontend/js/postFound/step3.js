document.addEventListener('DOMContentLoaded', () => {
    const locFaculty = document.getElementById('loc-faculty');
    const locFloor = document.getElementById('loc-floor');
    const locRoom = document.getElementById('loc-room');
    const itemLocationHidden = document.getElementById('item-location');

    const btnNextStep3 = document.getElementById('btn-next-step-3');
    const btnBackStep3 = document.getElementById('btn-back-step-3');

    if (btnNextStep3) {
        btnNextStep3.addEventListener('click', () => {
            const buildingId = locFaculty ? locFaculty.value : "";
            const floorId = locFloor ? locFloor.value : "";
            const roomId = locRoom ? locRoom.value : "";
            const buildingName = locFaculty?.selectedOptions[0]?.textContent.trim() || "";
            const floorName = locFloor?.selectedOptions[0]?.textContent.trim() || "";
            const roomName = locRoom?.selectedOptions[0]?.textContent.trim() || "";
            const itemDate = document.getElementById('item-date').value;
            const itemTime = document.getElementById('item-time').value;
            const itemCustody = document.getElementById('item-custody').value;

            if (!buildingId || !floorId || !roomId || !itemDate || !itemTime || !itemCustody) {
                alert("Vui lòng điền đầy đủ tất cả các trường bắt buộc có dấu (*) ở Bước 3!");
                return;
            }

            const timeNhatTimestamp = new Date(`${itemDate}T${itemTime}`).getTime();

            if (typeof window.foundFormState !== 'undefined') {
                window.foundFormState.step3Data = {
                    faculty: buildingName,
                    floor: floorName,
                    room: roomName,
                    buildingId,
                    floorId,
                    roomId,
                    fullLocation: itemLocationHidden ? itemLocationHidden.value : "",
                    itemDate: itemDate,
                    itemTime: itemTime,
                    timeNhatTimestamp: timeNhatTimestamp,
                    custody: itemCustody
                };
                console.log("[Step 3] Đã lưu dữ liệu vào state tổng:", window.foundFormState);
            }

        });
    }

    // Xử lý nút Quay lại Bước 2
    if (btnBackStep3) {
        btnBackStep3.addEventListener('click', () => {
            document.getElementById('step-panel-3').classList.add('hidden');
            document.getElementById('step-panel-2').classList.remove('hidden');
        });
    }
});
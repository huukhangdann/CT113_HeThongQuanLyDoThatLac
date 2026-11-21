
import { populateStep2WithAIData } from "./step2AutoFill.js";
document.addEventListener('DOMContentLoaded', () => {
    // 1. OBJECT STATE TỔNG (Lưu toàn bộ dữ liệu xuyên suốt các step của form báo nhặt)
    window.foundFormState = {
        images: [],       // Mảng chứa các file ảnh gốc (File objects)
        aiData: null,     // Dữ liệu JSON do AI phân tích nháp trả về
        step2Data: {},    // Tiêu đề, loại đồ vật, màu sắc, mô tả
        step3Data: {},    // Địa điểm nhặt, thời gian
        step4Data: {}     // Câu hỏi xác minh, thông tin liên hệ
    };

    let selectedImageFiles = window.foundFormState.images;

    const fileUploadInput = document.getElementById('file-upload-input');
    const dropZone = document.getElementById('drop-zone');
    const imageSlots = document.querySelectorAll('.image-slot');
    const btnNextStep1 = document.getElementById('btn-next-step-1');

    // Mở hộp thoại chọn file khi click vào vùng Drag & Drop
    if (dropZone && fileUploadInput) {
        dropZone.addEventListener('click', () => fileUploadInput.click());
    }

    // Mở hộp thoại chọn file khi click vào từng slot ảnh
    imageSlots.forEach(slot => {
        slot.addEventListener('click', () => fileUploadInput.click());
    });

    // Hàm cập nhật giao diện xem trước 4 slot ảnh
    function updateImagePreviews() {
        imageSlots.forEach((slot, index) => {
            const file = selectedImageFiles[index];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    slot.innerHTML = `
                        <img src="${e.target.result}" class="w-full h-full object-cover rounded-xl" alt="Preview">
                        <button type="button" class="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors remove-img-btn cursor-pointer" data-index="${index}" title="Xóa ảnh">
                            <span class="material-symbols-outlined text-[14px]">close</span>
                        </button>
                    `;
                    // Gắn sự kiện xóa ảnh
                    slot.querySelector('.remove-img-btn').addEventListener('click', (ev) => {
                        ev.stopPropagation();
                        selectedImageFiles.splice(index, 1);
                        updateImagePreviews();
                    });
                };
                reader.readAsDataURL(file);
            } else {
                slot.innerHTML = `
                    <span class="material-symbols-outlined text-2xl">add_photo_alternate</span>
                    <span class="text-xs font-medium">Thêm ảnh ${index + 1}</span>
                `;
            }
        });
    }

    const handleFiles = (files) => {
        const selectedFiles = Array.from(files);
        const validFiles = selectedFiles.filter(file =>
            file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
        );

        if (validFiles.length !== selectedFiles.length) {
            alert("Chỉ nhận ảnh hợp lệ có dung lượng tối đa 5MB.");
        }

        const remainingSlots = 4 - selectedImageFiles.length;
        if (validFiles.length > remainingSlots) {
            alert("Chỉ được tải lên tối đa 4 hình ảnh.");
        }

        selectedImageFiles.push(...validFiles.slice(0, remainingSlots));
        updateImagePreviews();
        if (fileUploadInput) fileUploadInput.value = '';
    };

    if (fileUploadInput) {
        fileUploadInput.addEventListener('change', (event) => {
            if (event.target.files) handleFiles(event.target.files);
        });
    }

    if (dropZone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, event => {
                event.preventDefault();
                dropZone.classList.add('border-[#1f3227]', 'bg-[#eef5f0]');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, event => {
                event.preventDefault();
                dropZone.classList.remove('border-[#1f3227]', 'bg-[#eef5f0]');
            });
        });

        dropZone.addEventListener('drop', event => {
            if (event.dataTransfer && event.dataTransfer.files) {
                handleFiles(event.dataTransfer.files);
            }
        });
    }

    // 2. XÃ LÝ SỰ KIỆN BẤM NÚT "TIẾP TỤC SANG BƯỚC 2" & GỌI AI PHÂN TÍCH NHÁP
    if (btnNextStep1) {
        btnNextStep1.addEventListener('click', async () => {
            // Kiểm tra bắt buộc phải có ít nhất 1 hình ảnh
            if (selectedImageFiles.length === 0) {
                alert("Vui lòng tải lên ít nhất một hình ảnh đồ vật nhặt được trước khi tiếp tục!");
                return;
            }

            // Lưu mảng ảnh vào state tổng
            window.foundFormState.images = selectedImageFiles;

            // Đổi trạng thái nút bấm thành Loading để người dùng biết AI đang xử lý
            const originalButtonText = btnNextStep1.innerHTML;
            btnNextStep1.disabled = true;
            btnNextStep1.innerHTML = `
                <span class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                <span>AI đang phân tích ảnh...</span>
            `;

            try {
                // Đóng gói mảng ảnh vào FormData để gọi endpoint /api/ai/analyze-draft
                const formData = new FormData();
                selectedImageFiles.forEach(file => {
                    formData.append('images', file);
                });

                console.log("[Step 1] Đang gửi ảnh xuống endpoint phân tích nháp...");

                const response = await fetch('http://localhost:3000/api/analysis/analyze-draft', {
                    method: 'POST',
                    body: formData // Gửi dạng multipart/form-data
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    if (!await window.itemCategoriesReady) {
                        throw new Error("Không thể tải danh mục loại đồ. Vui lòng tải lại trang.");
                    }

                    // Lưu kết quả JSON do AI trả về vào state tổng
                    window.foundFormState.aiData = result.data;
                    console.log("[Step 1] AI phân tích thành công:", result.data);
                    populateStep2WithAIData(result.data)
                    // TODO: Chuyển giao diện từ Step 1 sang Step 2 ở đây
                    // Ví dụ:
                    // document.getElementById('step-panel-1').classList.add('hidden');
                    // document.getElementById('step-panel-2').classList.remove('hidden');
                    // autoFillStep2Form(result.data); // Hàm tự động điền dữ liệu vào form Bước 2

                    // alert("AI đã phân tích xong hình ảnh! Chuyển sang Bước 2 nhé 🎉");

                } else {
                    alert(`AI phân tích thất bại: ${result.message || "Lỗi không xác định"}`);
                }

            } catch (error) {
                console.error("[Step 1 Error] Lỗi kết nối AI:", error);
                alert("Không thể kết nối đến server phân tích AI! Kiểm tra lại server backend.");
            } finally {
                // Khôi phục trạng thái nút bấm
                btnNextStep1.disabled = false;
                btnNextStep1.innerHTML = originalButtonText;
            }
        });
    }
});
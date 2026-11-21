document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("lost-post-form");
    const submitButton = document.getElementById("btn-submit-post");
    const successModal = document.getElementById("success-modal");
    const fileUploadInput = document.getElementById("file-upload-input");
    const dropZone = document.getElementById("drop-zone");
    const imageSlots = document.querySelectorAll(".image-slot");
    const selectedImageFiles = [];

    window.lostFormState = { images: selectedImageFiles };

    const renderImageSlots = () => {
        imageSlots.forEach((slot, index) => {
            const file = selectedImageFiles[index];
            if (!file) {
                slot.innerHTML = `
                    <span class="material-symbols-outlined text-2xl">add_photo_alternate</span>
                    <span class="text-xs font-medium">Thêm ảnh ${index + 1}</span>
                `;
                return;
            }

            slot.innerHTML = `
                <img class="w-full h-full object-cover rounded-xl" alt="Ảnh ${index + 1}" />
                <button type="button" class="remove-photo-btn absolute top-1 right-1 w-6 h-6 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer" title="Xóa ảnh">
                    <span class="material-symbols-outlined text-[13px]">close</span>
                </button>
            `;

            const reader = new FileReader();
            reader.onload = () => {
                if (selectedImageFiles[index] === file) {
                    slot.querySelector("img").src = reader.result;
                }
            };
            reader.readAsDataURL(file);

            slot.querySelector(".remove-photo-btn").addEventListener("click", event => {
                event.stopPropagation();
                selectedImageFiles.splice(index, 1);
                renderImageSlots();
            });
        });
    };

    const handleFiles = files => {
        const selectedFiles = Array.from(files);
        const validFiles = selectedFiles.filter(file =>
            file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
        );

        if (validFiles.length !== selectedFiles.length) {
            alert("Chỉ nhận ảnh hợp lệ có dung lượng tối đa 5MB.");
        }

        const remainingSlots = 4 - selectedImageFiles.length;
        if (validFiles.length > remainingSlots) {
            alert("Chỉ được tải lên tối đa 4 hình ảnh.");
        }

        selectedImageFiles.push(...validFiles.slice(0, remainingSlots));
        renderImageSlots();
        fileUploadInput.value = "";
    };

    if (dropZone && fileUploadInput) {
        dropZone.addEventListener("click", () => fileUploadInput.click());

        ["dragenter", "dragover"].forEach(eventName => {
            dropZone.addEventListener(eventName, event => {
                event.preventDefault();
                dropZone.classList.add("border-[#b45309]", "bg-amber-50/50");
            });
        });

        ["dragleave", "drop"].forEach(eventName => {
            dropZone.addEventListener(eventName, event => {
                event.preventDefault();
                dropZone.classList.remove("border-[#b45309]", "bg-amber-50/50");
            });
        });

        dropZone.addEventListener("drop", event => {
            if (event.dataTransfer) handleFiles(event.dataTransfer.files);
        });

        fileUploadInput.addEventListener("change", event => {
            if (event.target.files) handleFiles(event.target.files);
        });

        imageSlots.forEach(slot => {
            slot.addEventListener("click", () => {
                const index = Number.parseInt(slot.dataset.index, 10);
                if (!selectedImageFiles[index]) fileUploadInput.click();
            });
        });
    }

    const readCurrentUser = () => {
        const currentUserJson = localStorage.getItem("currentUser");
        if (!currentUserJson) return null;

        const currentUser = JSON.parse(currentUserJson);
        return currentUser && typeof currentUser === "object" ? currentUser : null;
    };

    try {
        const currentUser = readCurrentUser();
        const nameInput = document.getElementById("contact-name");
        const emailInput = document.getElementById("contact-email");
        const phoneInput = document.getElementById("contact-phone");

        if (currentUser) {
            if (nameInput && !nameInput.value) nameInput.value = currentUser.ND_HoTen || "";
            if (emailInput && !emailInput.value) emailInput.value = currentUser.ND_email || "";
            if (phoneInput && !phoneInput.value) phoneInput.value = currentUser.ND_SDT || "";
        }
    } catch (error) {
        console.error("[Lost post] Không thể đọc thông tin người dùng:", error);
    }

    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (submitButton.disabled) return;

        if (!await window.itemCategoriesReady) {
            alert("Không thể tải danh mục loại đồ. Vui lòng tải lại trang.");
            return;
        }

        let currentUser;
        try {
            currentUser = readCurrentUser();
        } catch (error) {
            console.error("[Lost post] currentUser trong localStorage không hợp lệ:", error);
            alert("Thông tin đăng nhập bị lỗi. Vui lòng đăng nhập lại.");
            return;
        }

        if (!currentUser || !currentUser.ND_id) {
            alert("Vui lòng đăng nhập trước khi đăng tin báo mất.");
            window.location.href = "/pages/login.html";
            return;
        }

        const category = document.getElementById("item-category");
        const title = document.getElementById("item-title");
        const description = document.getElementById("item-description");
        const primaryColor = document.getElementById("primary-color");
        const dateInput = document.getElementById("item-date");
        const timeInput = document.getElementById("item-time");
        const phoneInput = document.getElementById("contact-phone");
        const nameInput = document.getElementById("contact-name");
        const emailInput = document.getElementById("contact-email");
        const locationInput = document.getElementById("item-location");

        const cleanPhone = phoneInput.value.trim().replace(/\s+/g, "");
        if (!category.value || !title.value.trim() || !primaryColor.value) {
            alert("Vui lòng nhập tên đồ vật, loại đồ vật và màu sắc chủ đạo.");
            return;
        }
        if (!/^[0-9]{10,11}$/.test(cleanPhone)) {
            alert("Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số.");
            phoneInput.focus();
            return;
        }

        const timeLost = new Date(`${dateInput.value}T${timeInput.value || "00:00"}`).getTime();
        if (!Number.isFinite(timeLost)) {
            alert("Ngày hoặc giờ mất không hợp lệ.");
            return;
        }

        const secondaryColors = Array.from(
            document.querySelectorAll("#sec-colors-container .sec-hex-val")
        )
            .map(element => element.textContent.trim())
            .filter(color => /^#[0-9a-f]{6}$/i.test(color));
        const location = locationInput.value.trim();
        const detailParts = [
            `Tên đồ vật: ${title.value.trim()}`,
            location ? `Địa điểm nghi mất: ${location}` : "",
            description.value.trim() ? `Mô tả: ${description.value.trim()}` : "",
            `Số điện thoại liên hệ: ${cleanPhone}`,
            nameInput.value.trim() ? `Tên liên hệ: ${nameInput.value.trim()}` : "",
            emailInput.value.trim() ? `Email liên hệ: ${emailInput.value.trim()}` : ""
        ].filter(Boolean);

        const requestBody = new FormData();
        requestBody.append("bmId", `BM_${Date.now()}`);
        requestBody.append("timeMat", String(timeLost));
        requestBody.append("moTa", detailParts.join(" - "));
        requestBody.append("mauChuDao", primaryColor.value);
        requestBody.append("mauPhu1", secondaryColors[0] || "");
        requestBody.append("mauPhu2", secondaryColors[1] || "");
        requestBody.append("mauPhu3", secondaryColors[2] || "");
        requestBody.append("ndId", currentUser.ND_id);
        requestBody.append("doId", "DD_001");
        requestBody.append("ldId", category.value);
        requestBody.append("locationText", location);
        selectedImageFiles.forEach(image => requestBody.append("images", image, image.name));

        const originalButtonContent = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <span class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            <span>Đang gửi tin...</span>
        `;

        try {
            const response = await fetch("http://localhost:3000/api/lost/create-with-images", {
                method: "POST",
                body: requestBody
            });
            let result;
            try {
                result = await response.json();
            } catch {
                throw new Error("Máy chủ trả về phản hồi không hợp lệ.");
            }

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Không thể đăng tin báo mất.");
            }

            const modalTitle = successModal?.querySelector("#modal-title");
            const modalMessage = successModal?.querySelector("p");
            if (modalTitle) modalTitle.textContent = "Đã gửi tin báo mất!";
            if (modalMessage) {
                modalMessage.textContent = `Tin ${result.data.BM_id} đã được lưu cùng ${result.uploadedImagesCount ?? selectedImageFiles.length} hình ảnh.`;
            }
            if (successModal) {
                successModal.classList.remove("hidden");
            } else {
                alert("Đăng tin báo mất thành công.");
            }
        } catch (error) {
            console.error("[Lost post] Gửi bài báo mất thất bại:", error);
            alert(`Đăng tin thất bại: ${error.message}`);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonContent;
        }
    });
});

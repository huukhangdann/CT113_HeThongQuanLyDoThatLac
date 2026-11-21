document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("found-post-form");
    const submitButton = document.getElementById("btn-submit-post");
    const successModal = document.getElementById("success-modal");
    const titleInput = document.getElementById("item-title");
    const categorySelect = document.getElementById("item-category");
    const descriptionInput = document.getElementById("item-description");
    const primaryColorInput = document.getElementById("primary-color");
    const dateInput = document.getElementById("item-date");
    const timeInput = document.getElementById("item-time");
    const custodySelect = document.getElementById("item-custody");
    const buildingSelect = document.getElementById("loc-faculty");
    const floorSelect = document.getElementById("loc-floor");
    const roomSelect = document.getElementById("loc-room");
    const phoneInput = document.getElementById("contact-phone");
    const nameInput = document.getElementById("contact-name");
    const emailInput = document.getElementById("contact-email");

    const readCurrentUser = () => {
        const currentUserJson = localStorage.getItem("currentUser");
        if (!currentUserJson) return null;

        const currentUser = JSON.parse(currentUserJson);
        return currentUser && typeof currentUser === "object" ? currentUser : null;
    };

    try {
        const currentUser = readCurrentUser();
        if (currentUser) {
            if (nameInput && !nameInput.value) nameInput.value = currentUser.ND_HoTen || "";
            if (emailInput && !emailInput.value) emailInput.value = currentUser.ND_email || "";
            if (phoneInput && !phoneInput.value) phoneInput.value = currentUser.ND_SDT || "";
        }
    } catch (error) {
        console.error("[Found Step 4] Không thể đọc currentUser:", error);
    }

    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (submitButton?.disabled) return;

        let currentUser;
        try {
            currentUser = readCurrentUser();
        } catch (error) {
            console.error("[Found Step 4] currentUser trong localStorage không hợp lệ:", error);
            alert("Thông tin đăng nhập bị lỗi. Vui lòng đăng nhập lại.");
            return;
        }

        if (!currentUser || !currentUser.ND_id) {
            alert("Vui lòng đăng nhập trước khi đăng tin nhặt đồ.");
            window.location.href = "/pages/login.html";
            return;
        }

        const images = window.foundFormState?.images || [];
        if (!images.length || images.length > 4) {
            alert("Vui lòng chọn từ 1 đến 4 hình ảnh hợp lệ.");
            return;
        }

        const selectedQuestionType = document.querySelector('input[name="question_type"]:checked')?.value;
        const question = selectedQuestionType === "custom"
            ? document.getElementById("custom-question-input")?.value.trim()
            : document.getElementById("preset-question-select")?.value.trim();
        const cleanPhone = phoneInput?.value.trim().replace(/\s+/g, "") || "";

        if (!question) {
            alert("Vui lòng chọn hoặc nhập câu hỏi xác minh.");
            return;
        }
        if (!/^[0-9]{10,11}$/.test(cleanPhone)) {
            alert("Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số.");
            phoneInput?.focus();
            return;
        }
        if (!buildingSelect?.value || !floorSelect?.value || !roomSelect?.value) {
            alert("Vui lòng chọn đầy đủ tòa nhà, tầng và phòng.");
            return;
        }

        const timeNhat = new Date(`${dateInput.value}T${timeInput.value}`).getTime();
        if (!Number.isFinite(timeNhat)) {
            alert("Ngày hoặc giờ nhặt không hợp lệ.");
            return;
        }

        const secondaryColors = Array.from(
            document.querySelectorAll("#sec-colors-container .sec-hex-val")
        )
            .map(element => element.textContent.trim())
            .filter(color => /^#[0-9a-f]{6}$/i.test(color));
        const locationText = document.getElementById("item-location")?.value || "";
        const contactName = nameInput?.value.trim() || currentUser.ND_HoTen || "";
        const contactEmail = emailInput?.value.trim() || currentUser.ND_email || "";

        const payload = {
            tieuDe: titleInput.value.trim(),
            timeNhat,
            moTa: descriptionInput.value.trim(),
            cauHoiXacMinh: question,
            mauChuDao: primaryColorInput.value,
            mauPhu1: secondaryColors[0] || "",
            mauPhu2: secondaryColors[1] || "",
            mauPhu3: secondaryColors[2] || "",
            ndId: currentUser.ND_id,
            ldId: categorySelect.value,
            toaId: buildingSelect.value,
            tangId: floorSelect.value,
            phongId: roomSelect.value,
            roomName: roomSelect.selectedOptions[0].textContent.trim(),
            locationText,
            noiLuuGiu: custodySelect.value,
            contactName,
            contactEmail,
            contactPhone: cleanPhone
        };

        window.foundFormState = window.foundFormState || {};
        window.foundFormState.step4Data = {
            question,
            contactName,
            contactEmail,
            contactPhone: cleanPhone
        };

        const requestBody = new FormData();
        requestBody.append("data", JSON.stringify(payload));
        images.forEach(image => requestBody.append("images", image, image.name));

        const originalButtonContent = submitButton?.innerHTML || "";
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Đang gửi tin...";
        }

        try {
            const response = await fetch("http://localhost:3000/api/found/create", {
                method: "POST",
                body: requestBody
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Không thể đăng tin nhặt đồ.");
            }

            const modalTitle = successModal?.querySelector("#modal-title");
            const modalMessage = successModal?.querySelector("p");
            if (modalTitle) modalTitle.textContent = "Đăng tin thành công!";
            if (modalMessage) {
                modalMessage.textContent = `Tin ${result.data.BN_id} đã được lưu cùng ${result.uploadedImagesCount || images.length} hình ảnh.`;
            }
            if (successModal) {
                successModal.classList.remove("hidden");
            } else {
                alert("Đăng tin nhặt đồ thành công.");
            }
        } catch (error) {
            console.error("[Found Step 4] Gửi bài báo nhặt thất bại:", error);
            alert(`Đăng tin thất bại: ${error.message}`);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonContent;
            }
        }
    });
});

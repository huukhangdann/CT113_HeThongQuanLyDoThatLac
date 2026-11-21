/**
 * Fill AI analysis into step 2 using the same category and color controls as manual entry.
 * @param {Object} aiData AI analysis result
 */
export const populateStep2WithAIData = aiData => {
    if (!aiData) return;

    const categorySelect = document.getElementById('item-category');
    if (categorySelect && aiData.type_id) {
        const typeId = String(aiData.type_id).trim().toUpperCase();
        const categoryOption = Array.from(categorySelect.options).find(
            option => option.value.toUpperCase() === typeId
        );
        if (categoryOption) {
            categorySelect.value = categoryOption.value;
            categorySelect.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            console.warn(`[Step 2 AutoFill] Không tìm thấy mã loại đồ ${typeId} trong danh mục.`);
        }
    }

    const resetButton = document.getElementById('color-reset-btn');
    const primaryColorInput = document.getElementById('primary-color-input');
    const addSecondaryColorButton = document.getElementById('add-sec-color-btn');
    const secondaryColors = Array.isArray(aiData.color?.secondary)
        ? aiData.color.secondary
            .filter(hex => /^#[0-9a-f]{6}$/i.test(hex))
            .slice(0, 3)
        : [];
    const primaryHex = aiData.color?.primary;

    if (resetButton) resetButton.click();
    if (primaryColorInput && /^#[0-9a-f]{6}$/i.test(primaryHex || '')) {
        primaryColorInput.value = primaryHex;
        primaryColorInput.dispatchEvent(new Event('input', { bubbles: true }));

        secondaryColors.forEach(hex => {
            addSecondaryColorButton?.click();
            const colorInputs = document.querySelectorAll('#sec-colors-container .sec-input');
            const colorInput = colorInputs[colorInputs.length - 1];
            if (colorInput) {
                colorInput.value = hex;
                colorInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    }

    const titleInput = document.getElementById('item-title');
    if (titleInput && aiData.title) titleInput.value = aiData.title;

    const descriptionInput = document.getElementById('item-description');
    if (descriptionInput && aiData.des) {
        descriptionInput.value = aiData.des;
        const characterCounter = document.getElementById('char-counter');
        if (characterCounter) characterCounter.textContent = `${aiData.des.length}/500 ký tự`;
    }
};

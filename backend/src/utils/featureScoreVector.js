const normalizeText = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd');

const hexToRgb = value => {
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(value || ''));
    if (!match) return null;
    return match.slice(1).map(channel => Number.parseInt(channel, 16));
};

const colorSimilarity = (first, second) => {
    const firstRgb = hexToRgb(first);
    const secondRgb = hexToRgb(second);
    if (!firstRgb || !secondRgb) return 0;

    const distance = Math.sqrt(firstRgb.reduce(
        (sum, channel, index) => sum + (channel - secondRgb[index]) ** 2,
        0
    ));
    return Math.max(0, 1 - distance / Math.sqrt(3 * 255 ** 2));
};

const FeatureScoreVector = (found, loss) => {
    const locationScores = [0.3, 0.6, 1];
    let locationScore = 0;
    for (let index = 0; index < found.location.length; index += 1) {
        if (normalizeText(found.location[index]) !== normalizeText(loss.location[index])) break;
        locationScore = locationScores[index];
    }

    const timeDifferenceHours = Math.abs(found.time - loss.time) / (1000 * 60 * 60);
    const timeScore = 1 / (1 + Math.exp(0.1 * (timeDifferenceHours - 48)));
    const primaryColorScore = colorSimilarity(found.colorprimary, loss.colorprimary);
    const foundSecondary = found.colorsecondary || [];
    const lossSecondary = loss.colorsecondary || [];
    const secondaryColorScore = foundSecondary.length && lossSecondary.length
        ? foundSecondary.reduce((sum, color) => sum + Math.max(
            ...lossSecondary.map(otherColor => colorSimilarity(color, otherColor))
        ), 0) / foundSecondary.length
        : 0.5;
    const colorScore = 0.7 * primaryColorScore + 0.3 * secondaryColorScore;

    const foundWords = new Set(normalizeText(found.description).match(/[\p{L}\p{N}]+/gu) || []);
    const lossWords = new Set(normalizeText(loss.description).match(/[\p{L}\p{N}]+/gu) || []);
    const union = new Set([...foundWords, ...lossWords]);
    const intersectionCount = [...foundWords].filter(word => lossWords.has(word)).length;
    const descriptionScore = union.size ? intersectionCount / union.size : 0;

    return [locationScore, timeScore, colorScore, descriptionScore];
};

module.exports = { FeatureScoreVector };

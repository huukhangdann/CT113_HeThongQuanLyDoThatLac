/**
 * CTU Lost & Found - Mascot Component
 * Tác giả: Tích hợp dựa trên nilbuild/page-mascot (https://github.com/nilbuild/page-mascot)
 * Chế độ: Thuần nhân vật Ballerina đơn lập, tràn viền trong suốt
 */

(function () {
  "use strict";

  // Danh sách các hướng nhìn trong sprite sheet 3x3
  const DIRECTIONS = [
    "up-left",
    "up",
    "up-right",
    "left",
    "center",
    "right",
    "down-left",
    "down",
    "down-right",
  ];

  // Danh sách các biểu cảm trong sprite sheet 3x3
  const REACTIONS = [
    "blink",
    "heart",
    "sparkle",
    "surprised",
    "wink",
    "bashful",
    "sleepy",
    "dizzy",
    "delighted",
  ];

  // Thứ tự các hướng theo chiều kim đồng hồ tương ứng với góc Math.atan2
  const CLOCKWISE = [
    "right",
    "down-right",
    "down",
    "down-left",
    "left",
    "up-left",
    "up",
    "up-right",
  ];

  const SECTOR = (Math.PI * 2) / CLOCKWISE.length;
  const HYSTERESIS = 0.12;
  const DEAD_ZONE = 70; // Bán kính vùng đệm ở giữa (px) để mascot nhìn thẳng

  const PAYOFFS = ["heart", "sparkle", "delighted", "wink"];
  const BOOP_PAYOFF = 120;
  const BOOP_END = 600;
  const SQUASH_MS = 420;
  const DIZZY_AFTER = 4;
  const DIZZY_WINDOW = 1600;
  const DIZZY_END = 1100;

  // Keyframe nén dãn đàn hồi (squash & stretch)
  const SQUASH_KEYFRAMES = [
    { transform: "scale(1, 1)", easing: "ease-in" },
    { transform: "scale(1.10, 0.86)", offset: 0.18, easing: "ease-out" },
    { transform: "scale(0.95, 1.08)", offset: 0.45, easing: "ease-in-out" },
    { transform: "scale(1.03, 0.97)", offset: 0.72, easing: "ease-in-out" },
    { transform: "scale(1, 1)" },
  ];

  function wrapAngle(angle) {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
  }

  function getCellPosition(index) {
    const col = index % 3;
    const row = Math.floor(index / 3);
    return `${col * 50}% ${row * 50}%`;
  }

  class CTUMascot {
    constructor(container, options = {}) {
      this.container =
        typeof container === "string"
          ? document.querySelector(container)
          : container;

      if (!this.container) return;

      this.options = Object.assign(
        {
          character: "owl",
          basePath: "../mascot/assets/",
        },
        options
      );

      this.direction = "center";
      this.reaction = null;
      this.timers = [];
      this.boops = { count: 0, at: 0 };
      this.destroyed = false;

      this.init();
    }

    init() {
      this.render();
      this.bindPointerTracking();
    }

    getAssetUrl(type) {
      return `${this.options.basePath}${this.options.character}-${type}.webp`;
    }

    render() {
      // Chỉ render thuần túy nhân vật Owl, không khung viền, không chữ, không nút đổi
      this.container.innerHTML = `
        <div class="ctu-mascot-standalone">
          <button type="button" class="ctu-mascot-btn" aria-label="Owl Mascot" title="Chạm vào mình nhé!">
            <span class="ctu-mascot-squash">
              <span class="ctu-mascot-layer ctu-mascot-layer-directions" style="background-image: url('${this.getAssetUrl("directions")}'); background-position: ${getCellPosition(DIRECTIONS.indexOf("center"))}; opacity: 1;"></span>
              <span class="ctu-mascot-layer ctu-mascot-layer-reactions" style="background-image: url('${this.getAssetUrl("reactions")}'); background-position: ${getCellPosition(REACTIONS.indexOf("blink"))}; opacity: 0;"></span>
            </span>
          </button>
        </div>
      `;

      this.buttonEl = this.container.querySelector(".ctu-mascot-btn");
      this.squashEl = this.container.querySelector(".ctu-mascot-squash");
      this.directionsLayer = this.container.querySelector(
        ".ctu-mascot-layer-directions"
      );
      this.reactionsLayer = this.container.querySelector(
        ".ctu-mascot-layer-reactions"
      );

      // Bắt sự kiện chạm / click vào Ballerina
      this.buttonEl.addEventListener("click", () => this.boop());
    }

    // Engine tính toán góc quay nhìn theo con trỏ chuột
    bindPointerTracking() {
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        return;
      }

      let sector = -1;
      let pointer = null;

      const aim = () => {
        if (!this.buttonEl || !pointer || this.destroyed) return;

        const box = this.buttonEl.getBoundingClientRect();
        const dx = pointer.x - (box.left + box.width / 2);
        const dy = pointer.y - (box.top + box.height / 2);

        // Vùng đệm ở giữa: nhìn thẳng vào tâm (tỷ lệ tự nhiên theo kích thước)
        const currentDeadZone = Math.max(70, box.width * 0.22);
        if (Math.hypot(dx, dy) < currentDeadZone) {
          sector = -1;
          this.setDirection("center");
          return;
        }

        const angle = Math.atan2(dy, dx);
        if (
          sector !== -1 &&
          Math.abs(wrapAngle(angle - sector * SECTOR)) < SECTOR / 2 + HYSTERESIS
        ) {
          return;
        }

        sector =
          (Math.round(angle / SECTOR) + CLOCKWISE.length) % CLOCKWISE.length;
        this.setDirection(CLOCKWISE[sector]);
      };

      this.onPointerMove = (e) => {
        pointer = { x: e.clientX, y: e.clientY };
        aim();
      };

      this.onScroll = () => aim();

      window.addEventListener("pointermove", this.onPointerMove, {
        passive: true,
      });
      window.addEventListener("scroll", this.onScroll, { passive: true });
    }

    setDirection(directionName) {
      if (this.direction === directionName) return;
      this.direction = directionName;

      if (!this.reaction && this.directionsLayer) {
        const idx = DIRECTIONS.indexOf(directionName);
        this.directionsLayer.style.backgroundPosition = getCellPosition(idx);
      }
    }

    setReaction(reactionName) {
      this.reaction = reactionName;

      if (reactionName) {
        const idx = REACTIONS.indexOf(reactionName);
        this.reactionsLayer.style.backgroundPosition = getCellPosition(
          idx >= 0 ? idx : 0
        );
        this.reactionsLayer.style.opacity = "1";
        this.directionsLayer.style.opacity = "0";
      } else {
        this.reactionsLayer.style.opacity = "0";
        this.directionsLayer.style.opacity = "1";
        const idx = DIRECTIONS.indexOf(this.direction);
        this.directionsLayer.style.backgroundPosition = getCellPosition(idx);
      }
    }

    // Hiệu ứng click chạm (boop)
    boop() {
      this.timers.forEach(clearTimeout);
      this.timers = [];

      const later = (ms, nextReaction) => {
        this.timers.push(
          setTimeout(() => this.setReaction(nextReaction), ms)
        );
      };

      const now = Date.now();
      this.boops.count =
        now - this.boops.at < DIZZY_WINDOW ? this.boops.count + 1 : 1;
      this.boops.at = now;

      // Click liên tục nhiều lần: chóng mặt (dizzy)
      if (this.boops.count >= DIZZY_AFTER) {
        this.boops.count = 0;
        this.setReaction("dizzy");
        later(DIZZY_END, null);
      } else {
        // Click thông thường: chớp mắt rồi đổi biểu cảm vui tươi
        this.setReaction("blink");
        const payoff = PAYOFFS[(this.boops.count - 1) % PAYOFFS.length];
        later(BOOP_PAYOFF, payoff);
        later(BOOP_END, null);
      }

      // Hiệu ứng nảy đàn hồi (squash & stretch)
      if (
        this.squashEl &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        this.squashEl.animate(SQUASH_KEYFRAMES, {
          duration: SQUASH_MS,
          easing: "linear",
        });
      }
    }

    destroy() {
      this.destroyed = true;
      this.timers.forEach(clearTimeout);
      window.removeEventListener("pointermove", this.onPointerMove);
      window.removeEventListener("scroll", this.onScroll);
      if (this.container) this.container.innerHTML = "";
    }
  }

  // Khởi tạo toàn cục độc lập
  window.CTUMascot = CTUMascot;

  // Tự động gắn vào container nếu có phần tử #ctu-mascot-app
  document.addEventListener("DOMContentLoaded", () => {
    const defaultMount = document.getElementById("ctu-mascot-app");
    if (defaultMount) {
      new CTUMascot(defaultMount);
    }
  });
})();

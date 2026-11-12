export default class Input {
  constructor() {
    this.keys = new Set();
    this.touch = { left: false, right: false, jump: false };
    this.jumpQueued = false;

    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowup", " ", "w", "a", "d"].includes(key)) {
        event.preventDefault();
      }
      if (!this.keys.has(key) && [" ", "w", "arrowup"].includes(key)) {
        this.jumpQueued = true;
      }
      this.keys.add(key);
    });

    window.addEventListener("keyup", (event) => {
      this.keys.delete(event.key.toLowerCase());
    });

    window.addEventListener("blur", () => this.clear());

    document.querySelectorAll("[data-control]").forEach((button) => {
      const action = button.dataset.control;
      const press = (event) => {
        event.preventDefault();
        if (action === "jump" && !this.touch.jump) this.jumpQueued = true;
        this.touch[action] = true;
      };
      const release = (event) => {
        event.preventDefault();
        this.touch[action] = false;
      };
      button.addEventListener("pointerdown", press);
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("pointerleave", release);
      button.addEventListener("contextmenu", (event) => event.preventDefault());
    });
  }

  get horizontal() {
    const left = this.keys.has("a") || this.keys.has("arrowleft") || this.touch.left;
    const right = this.keys.has("d") || this.keys.has("arrowright") || this.touch.right;
    return (right ? 1 : 0) - (left ? 1 : 0);
  }

  consumeJump() {
    const result = this.jumpQueued;
    this.jumpQueued = false;
    return result;
  }

  clear() {
    this.keys.clear();
    this.touch.left = this.touch.right = this.touch.jump = false;
    this.jumpQueued = false;
  }
}

export const keys = {};

export const mouse = {
  x: 0,
  y: 0,
  down: false
};

export function setupInput(canvas) {
  window.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;
  });

  window.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
  });

  canvas.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  canvas.addEventListener("mousedown", () => {
    mouse.down = true;
  });

  window.addEventListener("mouseup", () => {
    mouse.down = false;
  });
}
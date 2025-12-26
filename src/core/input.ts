const down = new Set<string>();
let shooting = false;
window.addEventListener("keydown", (e) => {
  down.add(e.code);
});

window.addEventListener("keyup", (e) => {
  down.delete(e.code);
});

window.addEventListener("mousedown", () => {
  shooting = true;
});
window.addEventListener("mouseup", () => {
  shooting = false;
});

export const isKeyDown = (key: string) => {
  return down.has(key);
};

export const getMovementAxis = () => {
  let x = 0;
  let z = 0;
  if (isKeyDown("KeyW") || isKeyDown("ArrowUp")) z -= 1;
  if (isKeyDown("KeyS") || isKeyDown("ArrowDown")) z += 1;
  if (isKeyDown("KeyA") || isKeyDown("ArrowLeft")) x -= 1;
  if (isKeyDown("KeyD") || isKeyDown("ArrowRight")) x += 1;

  const hypot = Math.hypot(x, z);
  if (hypot !== 0) {
    x /= hypot;
    z /= hypot;
  }
  return { x, z };
};

export const isJumping = () => {
  return isKeyDown("Space");
};
export const isPetPressed = () => {
  return isKeyDown("KeyP");
};

export const isShooting = () => {
  return shooting;
};

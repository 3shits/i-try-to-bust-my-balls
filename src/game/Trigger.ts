import { Vector3, Box3 } from "three";

export class Trigger {
  box: Box3;
  triggered = false;
  onTrigger: () => void;

  constructor(center: Vector3, size: Vector3, onTrigger: () => void) {
    const half = size.clone().multiplyScalar(0.5);
    this.box = new Box3(center.clone().sub(half), center.clone().add(half));
    this.onTrigger = onTrigger;
  }

  update(point: Vector3) {
    if (this.triggered) return;
    if (this.box.containsPoint(point)) {
      this.triggered = true;
      this.onTrigger();
    }
  }
  dispose() {
    this.triggered = true;
  }
}

import { Vector3, Box3, Object3D } from "three";

export class HitTrigger {
  box: Box3;
  triggered = false;
  onTrigger: () => void;
  object: Object3D;
  constructor(onTrigger: () => void, object: Object3D) {
    this.object = object;
    this.box = new Box3().setFromObject(object);

    this.onTrigger = onTrigger;
  }

  update(point: Vector3) {
    this.box.setFromObject(this.object);
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

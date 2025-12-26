import { Box3, Object3D } from "three";

export class BoxTrigger {
  box: Box3;
  triggered = false;
  onTrigger: () => void;
  object: Object3D;
  constructor(onTrigger: () => void, object: Object3D) {
    this.object = object;
    this.box = new Box3().setFromObject(object);

    this.onTrigger = onTrigger;
  }

  update(target: Box3) {
    this.box.setFromObject(this.object);
    if (this.triggered) return;
    if (target.containsBox(this.box)) {
      this.triggered = true;
      this.onTrigger();
      
    }
  }
  dispose() {
    this.triggered = true;
  }
}

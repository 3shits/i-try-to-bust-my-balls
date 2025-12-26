import { Object3D, Scene, Vector3 } from "three";
import type { GLTF } from "three/examples/jsm/Addons.js";
import { loadGLTF } from "../core/assets";

import { HitTrigger } from "./HitTrigger";

export class CheeseMissile {
  model!: GLTF;
  cheese!: Object3D;
  startPos!: Vector3;
  endPos!: Vector3;
  hitTrigger!: HitTrigger;
  loaded = false;
  scene: Scene;
  finished = false;
  speed = 35;
  reloadSpeed = 2;
  constructor(scene: Scene) {
    this.scene = scene;
  }
  async load() {
    this.model = await loadGLTF("/models/cheese.glb");
    this.cheese = this.model.scene;
    this.cheese.scale.set(1, 1, 1);
    this.cheese.rotation.y = Math.PI / 2;
  }

  spawn(startPos: Vector3, endPos: Vector3) {
    this.finished = false;
    this.startPos = startPos;
    this.endPos = endPos;
    this.cheese.position.set(this.startPos.x, this.startPos.y, this.startPos.z);
    this.scene.add(this.cheese);

    this.hitTrigger = new HitTrigger(() => {
      console.log("Hit mkc");
    }, this.cheese);

    this.loaded = true;
  }

  getFinished() {
    return this.finished;
  }

  update(dt: number, playerPos: Vector3) {
    if (!this.loaded) return;
    if (this.cheese.position.clone().distanceTo(this.endPos) > 0.5) {
      //this.cheese.position.lerp(this.endPos, dt * this.speed);
      this.cheese.position.lerp(
        this.endPos,
        (dt * this.speed) / this.cheese.position.clone().distanceTo(this.endPos)
      );

      this.finished = false;
    } else this.finished = true;

    this.hitTrigger.update(playerPos);
  }
}

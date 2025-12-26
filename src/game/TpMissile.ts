import { Box3, MathUtils, Vector3, type Object3D, type Scene } from "three";
import type { GLTF } from "three/examples/jsm/Addons.js";
import { loadGLTF } from "../core/assets";
import { isShooting } from "../core/input";
import { BoxTrigger } from "./BoxTrigger";

export class TpMissile {
  model!: GLTF;
  tp!: Object3D;
  hit!: BoxTrigger;
  shooting = false;
  endPos = new Vector3();
  loaded = false;
  scene: Scene;
  t = 0;
  height = 3;
  speed = 1;
  count = 0;
  constructor(scene: Scene) {
    this.scene = scene;
  }
  async load(playerPos: Vector3) {
    this.model = await loadGLTF("models/tp.glb");
    this.tp = this.model.scene;
    this.tp.position.set(playerPos.x, playerPos.y + 0.5, playerPos.z - 0.5);
    this.hit = new BoxTrigger(() => console.log("Mor bara"), this.tp);
    this.loaded = true;
  }

  update(dt: number, bossPos: Vector3, playerPos: Vector3, bossBox: Box3) {
    if (!this.loaded) return;

    this.endPos.copy(bossPos);
    if (this.tp) {
      if (isShooting()) {
        this.shooting = true;
        this.scene.add(this.tp);
      }

      if (this.shooting) {
        this.t += dt * this.speed;
        this.t = MathUtils.clamp(this.t, 0, 1);
        this.tp.position.x = MathUtils.lerp(
          this.tp.position.x,
          this.endPos.x,
          this.t
        );
        this.tp.position.z = MathUtils.lerp(
          this.tp.position.z,
          this.endPos.z,
          this.t
        );
        this.tp.position.y =
          MathUtils.lerp(this.tp.position.y, this.endPos.y, this.t) +
          4 * this.height * this.t * (1 - this.t);

        this.hit.update(bossBox);
        const center = new Vector3();
        this.hit.box.getCenter(center);
        // console.log(center);
      } else {
        this.tp.position.lerp(playerPos, 0.5);
      }

      if (this.tp.position.distanceTo(this.endPos) < 1) {
        this.t = 0;
        this.shooting = false;
        this.scene.remove(this.tp);
        this.tp.position.set(playerPos.x, playerPos.y + 0.5, playerPos.z - 0.5);
        this.count += 1;
        this.hit.triggered = false;
      }
    }
  }
}

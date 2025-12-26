import { Group } from "three";
import { loadGLTF } from "../../core/assets";
import { BaseScene } from "./BaseScene";
import { Lights } from "../Lights";

export class ForestScene extends BaseScene {
  private environment = new Group();
  lights!: Lights;
  getEnvironment(): Group {
    return this.environment;
  }
  async load() {
    const forest = await loadGLTF("models/forest.glb");
    forest.scene.scale.set(4, 4, 4);
    this.environment.add(forest.scene);
    const waterfall = await loadGLTF("models/waterfall.glb");
    waterfall.scene.position.set(-86, -16, -20);
    waterfall.scene.rotation.y = -Math.PI;
    waterfall.scene.scale.set(2, 2, 2);
    this.environment.add(waterfall.scene);
    this.lights = new Lights();
    this.lights.load();
    this.environment.add(this.lights.light);
  }

  start() {}

  update() {}

  dispose() {
    this.lights.light.clear();
    this.world.remove(this.environment);
    this.environment.clear();
  }
}

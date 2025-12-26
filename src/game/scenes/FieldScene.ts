import { AmbientLight, DirectionalLight, Group } from "three";
import { BaseScene } from "./BaseScene";
import { loadGLTF } from "../../core/assets";

export class FieldScene extends BaseScene {
  private environment = new Group();

  getEnvironment(): Group {
    return this.environment;
  }
  async load() {
    const island = await loadGLTF("models/final-island.glb");
    island.scene.scale.set(5, 5, 5);
    this.environment.add(island.scene);
    const toilet = await loadGLTF("models/Toilet.glb");
    toilet.scene.position.set(13, 31, 53.5);
    toilet.scene.scale.set(0.3, 0.3, 0.3);
    toilet.scene.rotation.y = Math.PI / 2 + 0.2;
    this.environment.add(toilet.scene);
    const ambient = new AmbientLight(0xffffff, 0.6);
    this.environment.add(ambient);
    const dir = new DirectionalLight(0xffffff, 0.5);
    dir.position.set(10, 20, 10);
    this.environment.add(dir);
  }
  start() {}
  update() {}
  dispose() {}
}

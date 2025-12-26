import { Group, AmbientLight, DirectionalLight } from "three";

export class Lights {
  light = new Group();

  getLights() {
    return this.light;
  }

  load() {
    const ambient = new AmbientLight(0xffffff, 1);
    this.light.add(ambient);
    const dir = new DirectionalLight(0xffffff, 1);
    dir.position.set(10, 20, 10);
    this.light.add(dir);
  }
}

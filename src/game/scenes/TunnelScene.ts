import {
  Group,
  PlaneGeometry,
  MeshBasicMaterial,
  DoubleSide,
  Mesh,
  AmbientLight,
  DirectionalLight,
} from "three";
import { loadGLTF } from "../../core/assets";
import { BaseScene } from "./BaseScene";
import { Lights } from "../Lights";

const tpModel = await loadGLTF("models/tp.glb");

export class TunnelScene extends BaseScene {
  tp = tpModel.scene;
  private environment = new Group();
  lights!: Lights;
  getTP() {
    return this.tp;
  }
  getEnvironment(): Group {
    return this.environment;
  }
  async load() {
    const tunnels = await Promise.all([
      loadGLTF("models/tunnel2.glb"),
      loadGLTF("models/tunnel2.glb"),
      loadGLTF("models/tunnel2.glb"),
      loadGLTF("models/tunnel2.glb"),
      loadGLTF("models/tunnel2.glb"),
    ]);
    tunnels.map((t, ind) => {
      t.scene.scale.set(10, 10, 10);
      t.scene.position.z += ind * 38;
      this.environment.add(t.scene);
    });

    const planeGeometry = new PlaneGeometry(30, 190);
    const planeMaterial = new MeshBasicMaterial({
      color: 0x666666,
      side: DoubleSide,
    });
    const plane = new Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, -4.5, 75);
    this.environment.add(plane);

    const island = await loadGLTF("models/island.glb");
    island.scene.scale.set(10, 10, 10);
    island.scene.position.y = -3.5;
    island.scene.position.z = 180;
    this.environment.add(island.scene);

    const islands = await Promise.all([
      loadGLTF("models/island.glb"),
      loadGLTF("models/island.glb"),
      loadGLTF("models/island.glb"),
    ]);

    islands.map((i, ind) => {
      i.scene.scale.set(3, 3, 3);
      i.scene.position.x += (ind % 2 == 0 ? 1 : -1) * 8;
      i.scene.position.y = -3.5;
      i.scene.position.z = 210;
      i.scene.position.z += ind * 10;
      this.environment.add(i.scene);
    });

    const tpIsland = await loadGLTF("models/small-island.glb");
    tpIsland.scene.scale.set(15, 15, 15);
    tpIsland.scene.rotation.y = -Math.PI / 2;
    tpIsland.scene.position.y = -8;
    tpIsland.scene.position.z = 260;
    this.environment.add(tpIsland.scene);
    this.tp.position.z = 260;
    this.tp.position.y = 5;
    const ambient = new AmbientLight(0xffffff, 0.6);
    this.environment.add(ambient);
    const dir = new DirectionalLight(0xffffff, 0.5);
    dir.position.set(10, 20, 10);
    this.environment.add(dir);
  }

  start() {
    this.world.add(this.environment);
  }

  update() {}
  dispose() {
    this.world.remove(this.environment);
    this.environment.clear();
  }
}

import type { Group, Scene } from "three";

export abstract class BaseScene {
  protected world: Scene;
  constructor(world: Scene) {
    this.world = world;
  }

  abstract getEnvironment():Group;
  abstract load(): Promise<void>;
  abstract start(): void;
  abstract update(dt: number): void;
  abstract dispose(): void;
}

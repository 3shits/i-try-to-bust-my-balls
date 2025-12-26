import type { Group, Scene, Vector3 } from "three";

export abstract class Level {
  public playerPos: Vector3;
  protected scene: Scene;
  constructor(playerPos: Vector3, scene: Scene) {
    this.playerPos = playerPos;
    this.scene = scene;
  }

  abstract getGravitySource(): number;
  abstract getEnvironment(): Group;
  abstract load(): Promise<void>;
  abstract update(dt: number): void;
  abstract end(): void;
}

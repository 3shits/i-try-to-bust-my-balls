import { Group, Raycaster, Vector3 } from "three";

export const getGroundRaycast = (environment: Group, sourceY: number) => {
  const down = new Vector3(0, -1, 0);
  const ray = new Raycaster();
  return function getHeightAtRay(x: number, z: number) {
    let source = new Vector3(x, sourceY, z);
    ray.set(source, down);
    const hits = ray.intersectObject(environment, true);
    if (!hits || hits.length === 0) return -Infinity;
    return hits[0].point.y;
  };
};

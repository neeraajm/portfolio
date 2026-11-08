import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

interface MergeStaticOptions {
  /** Objects (and their descendants) that must keep their own transform/mesh. */
  exclude?: ReadonlySet<THREE.Object3D>;
  /** Optional suffix appended to the merged mesh names for debugging. */
  name?: string;
}

const isExcluded = (object: THREE.Object3D, exclude: ReadonlySet<THREE.Object3D>) => {
  let current: THREE.Object3D | null = object;
  while (current) {
    if (exclude.has(current)) return true;
    current = current.parent;
  }
  return false;
};

const attributeSignature = (geometry: THREE.BufferGeometry) => {
  const attributes = Object.keys(geometry.attributes).sort().join("|");
  return `${geometry.index ? "indexed" : "non-indexed"}:${attributes}`;
};

interface MergeBucket {
  material: THREE.Material;
  isLine: boolean;
  signature: string;
  objects: THREE.Object3D[];
  geometries: THREE.BufferGeometry[];
}

/**
 * Collapses every static mesh/line in a subtree into one draw call per
 * material. Transforms are baked relative to `root`, so the merged result
 * renders identically while removing hundreds of per-object submissions.
 *
 * Dynamic objects (animated transforms, raycast targets, etc.) can be kept
 * intact through `exclude`.
 */
export function mergeStaticMeshes(root: THREE.Object3D, options: MergeStaticOptions = {}) {
  const exclude = options.exclude ?? new Set<THREE.Object3D>();
  const ancestors = new Set<THREE.Object3D>();
  root.traverseAncestors((ancestor) => ancestors.add(ancestor));

  root.updateMatrixWorld(true);
  const rootInverse = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map<string, MergeBucket>();

  root.traverse((object) => {
    if (object === root || ancestors.has(object) || isExcluded(object, exclude)) return;

    const candidate = object as THREE.Mesh & THREE.LineSegments;
    const isMesh = (object as THREE.Mesh).isMesh === true;
    const isLine = (object as THREE.LineSegments).isLineSegments === true;
    if (!isMesh && !isLine) return;
    if ((object as THREE.InstancedMesh).isInstancedMesh) return;
    if ((object as THREE.SkinnedMesh).isSkinnedMesh) return;
    if (object.visible === false) return;

    const material = candidate.material;
    if (!material || Array.isArray(material)) return;

    const geometry = candidate.geometry.clone();
    const relativeMatrix = new THREE.Matrix4().multiplyMatrices(
      rootInverse,
      object.matrixWorld
    );
    geometry.applyMatrix4(relativeMatrix);

    const signature = attributeSignature(geometry);
    const key = `${material.uuid}:${isLine ? "line" : "mesh"}:${signature}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        material,
        isLine,
        signature,
        objects: [],
        geometries: [],
      };
      buckets.set(key, bucket);
    }
    bucket.objects.push(object);
    bucket.geometries.push(geometry);
  });

  buckets.forEach((bucket) => {
    if (bucket.geometries.length === 0) return;
    const mergedGeometry = mergeGeometries(bucket.geometries, false);
    bucket.geometries.forEach((geometry) => geometry.dispose());
    if (!mergedGeometry) return;

    const mergedObject = bucket.isLine
      ? new THREE.LineSegments(mergedGeometry, bucket.material)
      : new THREE.Mesh(mergedGeometry, bucket.material);
    mergedObject.name = `${root.name || "group"}${options.name ? `-${options.name}` : ""}-merged-${bucket.material.name || bucket.material.type}`;
    // Materials keep their own side/frustum settings; skip per-object shadow work.
    mergedObject.castShadow = false;
    mergedObject.receiveShadow = false;
    root.add(mergedObject);

    bucket.objects.forEach((object) => {
      object.removeFromParent();
    });
  });
}

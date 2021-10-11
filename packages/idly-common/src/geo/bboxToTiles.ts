import { BBox } from '@turf/helpers';

import { mercator } from '../geo/sphericalMercator';
import { Tile } from './Tile';

/**
 * @DESC gets all the xyz[] which the given longLat intersects with
 */
export function bboxToTiles(bbox: BBox, z: number): Tile[] {
  const xyzs: Tile[] = [];
  const intZ = Math.ceil(z);
  const { minX, minY, maxX, maxY } = bboxToXY(bbox, intZ);
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      xyzs.push({ x, y, z: intZ });
    }
  }
  return xyzs;
}

function bboxToXY(
  bbox: BBox,
  zoom: number
): { minX: number; minY: number; maxX: number; maxY: number } {
  /**
   * zoom needs to be an integer
   */
  if (zoom < 0) {
    throw new Error('zooms can only be positive number');
  }
  zoom = ~~zoom;
  return mercator.xyz(bbox, zoom);
}

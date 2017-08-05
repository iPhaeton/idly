import { Geometries } from 'osm/entities/constants';
import { Entity } from 'osm/entities/entities';
import { Node } from 'osm/entities/node';
import { Relation } from 'osm/entities/relation';
import { Way } from 'osm/entities/way';
import { AreaKeys } from 'osm/presets/presets';

export function getGeometry(
  entity: Entity,
  areaKeys: AreaKeys,
  parentWays: any = {}
): Geometries {
  if (entity instanceof Node) {
    return isPoi(entity, parentWays) ? Geometries.POINT : Geometries.VERTEX;
  } else if (entity instanceof Way) {
    return isArea(entity, areaKeys) ? Geometries.AREA : Geometries.LINE;
  } else if (entity instanceof Relation) {
    return isMultipolygon(entity) ? Geometries.AREA : Geometries.RELATION;
  } else {
    throw new Error('unknown type of entity');
  }
}

function isPoi(entity: Node, parentWays: any) {
  return !parentWays[entity.id] || parentWays[entity.id].length === 0;
}

export function isArea(entity: Way, areaKeys: AreaKeys) {
  if (entity.tags.get('area') === 'yes') return true;

  if (!isClosed(entity) || entity.tags.get('area') === 'no') return false;
  const keys = entity.tags.keySeq();
  let found = false;
  entity.tags.forEach((v, key) => {
    if (areaKeys.has(key) && !areaKeys.get(key).has(v)) {
      found = true;
      return false;
    }
  });
  return found;
}

function isMultipolygon(entity: Relation) {
  return false;
}

export function isOnAddressLine(entity: Entity) {
  return false;
  //   return resolver.transient(this, 'isOnAddressLine', function() {
  //     return (
  //       resolver.parentWays(this).filter(function(parent) {
  //         return (
  //           parent.tags.hasOwnProperty('addr:interpolation') &&
  //           parent.geometry(resolver) === 'line'
  //         );
  //       }).length > 0
  //     );
  //   });
}

function isClosed(entity: Way) {
  return entity.nodes.size > 1 && entity.nodes.first() === entity.nodes.last();
}

import { weakCache } from 'idly-common/lib/misc';
import { quadkeyToTile } from 'idly-common/lib/misc/quadkeyToTile';
import { fetchTileXml } from '../helpers/helpers';
import { Store, TileUrlConfig } from './index';

export type MapStore = Store['map'];

export const entities = (tileUrlConfig?: TileUrlConfig) => weakCache((quadkeys: MapStore['quadkeys']) => {
  return Promise.all(
    quadkeys.map(quadkeyToTile).map((t, index) =>
      fetchTileXml(t.x, t.y, t.z, tileUrlConfig).then(r => ({
        quadkey: quadkeys[index],
        entities: r,
      }))
    )
  );
});

export const visibleGlLayers: (
  l: MapStore['layers']
) => Array<MapStore['layers'][0]['layer']> = weakCache(
  (layers: MapStore['layers']) =>
    layers
      .filter(r => !r.hide)
      .sort((a, b) => a.priority - b.priority)
      .map(r => r.layer)
);

export const fcLookup: (
  fc: MapStore['featureCollection']
) => Map<string, MapStore['featureCollection']['features']> = weakCache(fc =>
  fc.features.reduce((pre: Map<string, any>, cur: any) => {
    if (cur.properties) {
      if (pre.has(cur.properties.id)) {
        pre.get(cur.properties.id).push(cur);
      } else {
        pre.set(cur.properties.id, [cur]);
      }
    }
    return pre;
  }, new Map())
);

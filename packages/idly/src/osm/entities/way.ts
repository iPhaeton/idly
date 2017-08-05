import { List, Record } from 'immutable';
import { ITags, tagsFactory } from 'osm/entities/helpers/tags';

import { Geometries } from 'osm/entities/constants';
import { Properties, propertiesGen } from 'osm/entities/helpers/properties';

type Id = string;
type Version = number;
type Visible = boolean;

const wayBaseRecord = Record({
  id: 'w-0',
  type: 'way',
  tags: tagsFactory(),
  properties: propertiesGen(),
  nodes: List(),
  geometry: Geometries.LINE
});

export class Way extends wayBaseRecord {
  readonly id: Id;
  readonly type: string;
  readonly tags: ITags;
  readonly properties: Properties;
  readonly nodes: List<string>;
  readonly geometry: Geometries.LINE | Geometries.AREA;
  public set(k: string, v: any): Way {
    return super.set(k, v) as Way;
  }
}

export function wayFactory(obj: {
  id: Id;
  tags?: ITags;
  properties?: Properties;
  nodes?: List<string>;
  geometry?: Geometries.LINE | Geometries.AREA;
}) {
  return new Way(obj);
}

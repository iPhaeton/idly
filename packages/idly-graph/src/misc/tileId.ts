import { Tile } from 'idly-common/lib/geo/tile';

export let tileId = ({ x, y, z }: Tile) => `${x}-${y}-${z}`;

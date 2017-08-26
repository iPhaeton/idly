import { Set } from 'immutable';
import * as MapboxInspect from 'mapbox-gl-inspect';
import * as React from 'react';
import { connect } from 'react-redux';
import { selectEntitiesAction } from '../select/store/select.actions';
import { workerFetchMap } from '../worker/main';

import { Entities } from 'osm/entities/entities';
import { Node } from 'osm/entities/node';
import { Relation } from 'osm/entities/relation';
import { Way } from 'osm/entities/way';

import { IRootStateType, observe, store } from 'common/store';

import { attachToWindow } from 'utils/attach_to_window';

import { Draw } from 'draw/draw';

import { SOURCES, ZOOM } from 'map/constants';
import { SourceLayered } from 'map/layers/layers';
import { mapboxglSetup } from 'map/mapboxglSetup';
import { Source } from 'map/source';
import { getOSMTiles, updateSource } from 'map/store/map.actions';
import {
  removeLayer as removeLayerX,
  updateLayer as updateLayerX
} from 'map/style';
import { ILayerSpec } from 'map/utils/layerFactory';
import { dirtyPopup } from 'map/utils/map.popup';

import { BBox } from 'idly-common/lib/geo/bbox';
import * as R from 'ramda';

type Entity = Node | Way | Relation;

export type DirtyMapAccessType = (map: any) => void;
/**
 * The job of map module is to handle
 * the rendering of map. It also means
 * all the styling of layers would be done
 * here.
 * The only argument it takes is G(the current snapshot
 * of the graph) and computes the rest
 * in its internal state.
 */

interface IPropsType {
  entities: Entities;
  modifiedEntities: Entities;
  updateSource: (
    data: Entities,
    dirtyMapAccess: (map: any) => void,
    sourceId: string
  ) => void;
  getOSMTiles: (xys: number[][], zoom: number) => void;
}

const win: any = window;

class MapComp extends React.PureComponent<IPropsType, {}> {
  static defaultProps = {
    entities: Set()
  };
  state = {
    mapLoaded: false,
    sourceLayered: SourceLayered
  };

  private map;
  private jsonqueue: string;
  private mapRenderTask: any;
  private fetchTileTask: any;
  dispatchTiles = () => {
    const zoom = this.map.getZoom();
    if (zoom < ZOOM) return;
    const lonLat = this.map.getBounds();
    const bbox: BBox = [
      lonLat.getWest(),
      lonLat.getSouth(),
      lonLat.getEast(),
      lonLat.getNorth()
    ];
    workerFetchMap({ bbox, zoom }).then(r =>
      this.onWorkerDone(r.featureCollection)
    );
  };
  componentDidMount() {
    this.map = mapboxglSetup('map-container');
    attachToWindow('map', this.map);

    attachToWindow('popup', () => dirtyPopup(this.map));
    attachToWindow('MapboxInspect', MapboxInspect);
    attachToWindow('hideLayer', name => {
      window.ggg = this.state.sourceLayered[0].filter(
        f => f.displayName === name
      );
      this.setState({
        sourceLayered: [
          this.state.sourceLayered[0].filter(f => f.displayName !== name),
          this.state.sourceLayered[1].filter(f => f.displayName !== name)
        ]
      });
    });
    attachToWindow('appendLayer', name => {
      this.setState({
        sourceLayered: [
          this.state.sourceLayered[0].concat(window.ggg),
          this.state.sourceLayered[1].filter(f => f.displayName !== name)
        ]
      });
    });

    this.map.on('click', e => {
      const bbox = [
        [e.point.x - 4, e.point.y - 4],
        [e.point.x + 4, e.point.y + 4]
      ];
      const select: string[] = R.compose(
        R.take(1),
        R.reject(R.isNil),
        R.map(R.path(['properties', 'id']))
      )(this.map.queryRenderedFeatures(bbox));
      store.dispatch(selectEntitiesAction(select));
    });
    this.map.on('load', () => {
      this.setState({ mapLoaded: true });
    });
    this.map.on('moveend', () => {
      this.fetchTileTask = win.requestIdleCallback(this.dispatchTiles, {
        timeout: 2500
      });
    });
    this.map.on('movestart', () => {
      if (this.fetchTileTask) {
        win.cancelIdleCallback(this.fetchTileTask);
        this.fetchTileTask = null;
      }
    });
  }
  onWorkerDone = data => {
    console.time('parse1');
    if (!data.startsWith('{"type":"FeatureCollection","features":')) {
      return;
    }
    if (data === this.jsonqueue) {
      console.log('repeat string');
      return;
    }
    this.jsonqueue = data;
    // this.map.getSource('virgin').setData(turf.featureCollection(parsed));
    if (this.mapRenderTask) {
      console.log('canceled');
      win.cancelIdleCallback(this.mapRenderTask);
      this.mapRenderTask = null;
    }
    this.mapRenderTask = win.requestIdleCallback(this.parsePending, {
      timeout: 300
    });
    // console.timeEnd('magic');
  };
  parsePending = () => {
    if (this.jsonqueue) {
      console.time('acparse');
      // var parse = JSON.stringify(JSON.parse(this.jsonqueue));
      console.timeEnd('acparse');

      this.map.getSource('virgin').setData(this.jsonqueue);
      console.timeEnd('parse1');
    }
  };
  updateLayer = (layerSpec: ILayerSpec) => {
    updateLayerX(layerSpec);
    // let newLayer = layerSpec.toJS();
    // newLayer = R.reject(R.isNil, newLayer);
    // this.map.addLayer(newLayer);
  };
  removeLayer = (layerId: string) => {
    removeLayerX(layerId);
  };

  dirtyMapAccess = mapCb => this.state.mapLoaded && mapCb(this.map);
  render() {
    return (
      <div>
        <div id="map-container" style={{ height: '50vh', width: '50vw' }} />
        {this.state.mapLoaded &&
          <div>
            {/* <Draw dirtyMapAccess={this.dirtyMapAccess} /> */}
            {SOURCES.map((s, k) =>
              <Source
                key={k}
                sourceName={s.source}
                dirtyMapAccess={this.dirtyMapAccess}
                updateSource={this.props.updateSource}
                entities={this.props[s.data]}>
                {this.state.sourceLayered[k].map(L =>
                  <L
                    entities={this.props[s.data]}
                    updateLayer={this.updateLayer}
                    removeLayer={this.removeLayer}
                  />
                )}
              </Source>
            )}
          </div>}
      </div>
    );
  }
}

export const Map = connect<any, any, any>(
  (state: IRootStateType, props) => ({
    entities: Set(),
    modifiedEntities: Set()
  }),
  { updateSource, getOSMTiles }
)(MapComp);

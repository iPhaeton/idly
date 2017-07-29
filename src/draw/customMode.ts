import { List } from 'immutable';
import * as R from 'ramda';

import { store } from 'common/store';
import { NodeFeature } from 'map/utils/nodeToFeat';

import { sanitizeDrawFeatures } from 'draw/draw.utils';
import { selectFeatures } from 'draw/store/draw.actions';
import { SOURCES } from 'map/map';

const NodeMangler: any = {};

// class NodeMangler {

// }
NodeMangler.onSetup = function(opts) {
  // console.log('setu[,', opts);
  const state = {};

  setTimeout(() => {
    this.map.doubleClickZoom.disable();
  }, 0);
  if (opts.wasSelected) {
    // this.clearSelectedFeatures();
    console.log('nodemanger/opts.wasselected', opts);
    const featuresThatWereSelected: List<NodeFeature> = List(
      R.uniqBy((a: any) => a.id, opts.wasSelectedFeatures).map(f => ({
        type: f.type,
        id: f.properties.id,
        geometry: {
          type: f.type,
          coordinates: f.coordinates
        },
        properties: f.properties
      }))
    );
    store.dispatch(selectFeatures(List(), featuresThatWereSelected));
    if (opts.event) {
      setTimeout(() => this.onClick(null, opts.event), 0);
    }
  }
  // if (!opts.feature) {
  //   throw new Error('You must provide a featureId to enter direct_select mode');
  // }
  // state.count = opts.count || 0;
  return state;
};

// Whenever a user clicks on the map, Draw will call `onClick`
NodeMangler.onClick = function(state, e) {
  console.log(e);
  // `this.newFeature` takes geojson and makes a DrawFeature
  // this.featuresAt(
  //   null,
  //   [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]],
  //   'click'
  // );
  const bbox = [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]];
  const featuresToSelect: List<NodeFeature> = List(
    this.map
      .queryRenderedFeatures(bbox, {
        layers: SOURCES.map(s => s.layer)
      })
      .map(f => ({
        ...f,
        id: f.properties.id,
        geometry: f.geometry
      }))

    // .map(sanitizeDrawFeatures)
  );
  // debugger;
  // console.log(featuresToSelect);
  if (featuresToSelect.size === 0) return;
  const points = featuresToSelect.map(f => this.newFeature(f));
  points.forEach(point => this.addFeature(point));
  this.changeMode('simple_select', {
    featureIds: featuresToSelect.toArray().map(f => f.properties.id)
  });
  store.dispatch(selectFeatures(featuresToSelect, List()));
  // console.log(points);
};

NodeMangler.onMouseUp = function(state, e) {
  console.log('mouseu[p', e);
  // `this.newFeature` takes geojson and makes a DrawFeature
  // this.featuresAt(
  //   null,
  //   [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]],
  //   'click'
  // );
  console.log('mouseup');
};

NodeMangler.onDrag = function(state, e) {
  console.log('dragging,', state, e);
  // this.setSelectedCoordinates
};

NodeMangler.onStop = function(state, e) {
  console.log('onStp[', state, e);
};

NodeMangler.toDisplayFeatures = function(state, geojson, display) {
  console.log('toDisplayFeatures', state, geojson);
  display(geojson);
};

export { NodeMangler };

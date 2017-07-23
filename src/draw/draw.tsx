import MapboxDraw = require('@mapbox/mapbox-gl-draw');
import { setupDraw } from 'draw/draw_setup';
import * as React from 'react';
import { connect } from 'react-redux';
import { selectFeatures } from 'store/draw/draw.actions';
import { IRootStateType } from 'store/index';
import { attachToWindow } from 'utils/attach_to_window';

interface IPropsType {
  map: any;
  selectedFeatures: any;
  selectFeatures: (features) => void;
  dirtyMapAccess;
}
class DrawComp extends React.PureComponent<IPropsType, {}> {
  private draw;
  constructor(props: IPropsType) {
    super(props);
    this.draw = setupDraw();
    attachToWindow('draw', this.draw);
  }
  componentDidMount() {
    this.props.dirtyMapAccess(map => {
      if (!map) return;
      map.addControl(this.draw);
      map.on('click', this.handleClick);
      map.on('draw.selectionchange', this.drawSelectionChange);
    });
  }
  drawSelectionChange = () => {};
  componentWillUnMount() {
    this.props.dirtyMapAccess(map => {
      if (!map) return;
      map.off('click', this.handleClick);
    });
  }
  componentWillReceiveProps(nextProps: IPropsType) {
    this.renderSelectedFeature(nextProps.selectedFeatures);
  }
  renderSelectedFeature = features => {
    if (this.draw && Array.isArray(features) && features.length > 0) {
      const f = features[0];
      f.id = 'x' + f.id;
      f.properties.id = f.id;
      this.draw.add(f);

      this.draw.changeMode(`simple_select`, {
        featureIds: [f.id]
      });
    }
  };
  handleClick = (e: any) => {
    this.props.dirtyMapAccess(map => {
      // set bbox as 5px reactangle area around clicked point
      const bbox = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5]
      ];
      const features = map.queryRenderedFeatures(bbox, {
        layers: ['park-volcanoes']
      });
      if (Array.isArray(features) && features.length > 0) {
        const f = features[0];
        this.props.selectFeatures([f]);
      }
    });
  };
  render() {
    return null;
  }
}

export const Draw = connect<any, any, any>(
  (state: IRootStateType, props) => ({
    selectedFeatures: state.draw.selectedFeatures
  }),
  { selectFeatures }
)(DrawComp);

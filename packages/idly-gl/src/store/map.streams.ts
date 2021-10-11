import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { map as rxMap } from 'rxjs/operators/map';
import { switchMap } from 'rxjs/operators/switchMap';
import { Subject } from 'rxjs/Subject';
import { MainTabs, Store, TileUrlConfig } from '../store/index';
import { entities, visibleGlLayers } from '../store/map.derived';
import {
  makeBoundsAndZoom$,
  makeClick$,
  makeNearestEntity$,
  makeQuadkeys$,
} from '../streams';
import { workerOperations } from '../worker';
import { Actions } from './Actions';

export function mapStreams(
  map: Observable<Store['map']>,
  destroy: Subject<void>,
  actions: Actions,
  gl: any,
  tileUrlConfig?: TileUrlConfig,
) {
  const entitiesFn = entities(tileUrlConfig);

  // useful for updating the FC whenever quadkeys change
  // the reason its not derived property is because
  // if a user modifies an entity, we might need to
  // update the fc but not the quadkey.
  // the reason we dont pipe  modifyFc in this stream
  // is because if someone from outside changes the quadkeys
  // we might want to fetch fc for that. Putting it here
  // couples it to only fetch FC whenever map move ends.
  map
    .pipe(
      rxMap(({ quadkeys }) => quadkeys),
      distinctUntilChanged(),
      switchMap(quadkeys => fromPromise(entitiesFn(quadkeys))),
      switchMap(e => fromPromise(workerOperations.getQuadkey(e)))
    )
    .subscribe(r => actions.modifyFC(r), e => console.error(e));

  makeQuadkeys$(gl, destroy).subscribe(
    r => actions.modifyQuadkeys(r),
    e => console.error(e)
  );

  makeNearestEntity$(
    gl,
    destroy,
    map.pipe(
      rxMap(({ layers }) => layers),
      distinctUntilChanged(),
      rxMap(layers => {
        return visibleGlLayers(layers.filter(l => l.selectable)).map(l => l.id);
      })
    )
  ).subscribe(
    ({ data: ids, point }) => {
      if (ids.length > 1 && ids.every(e => e.charAt(0) === 'r')) {
        actions.addEntitySelectorPopup({ ids, lnglat: point.lngLat });
        actions.modifyMainTab(MainTabs.Tree);
        return;
      }
      actions.removeEntitySelectorPopup();
      actions.modifyHoverId(ids[0]);
    },
    e => console.error(e)
  );

  makeClick$(gl, destroy).subscribe(
    () => actions.selectId(),
    e => console.error(e)
  );

  makeBoundsAndZoom$(gl, destroy).subscribe(r => {
    actions.modifyZoom(r);
  });
}

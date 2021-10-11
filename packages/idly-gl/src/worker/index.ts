import Operations, { WorkerType } from 'idly-worker/lib/index';
// tslint:disable-next-line:no-var-requires
const PromiseWorker = require('promise-worker');

// @ts-ignore
import * as MyWorker from './worker.worker';

export let workerOperations: WorkerType;

export const createWorkerOperations = () => {
  // @ts-ignore
  const worker = new MyWorker();

  const promiseWorker = new PromiseWorker(worker);

  workerOperations = Operations(promiseWorker);
};

createWorkerOperations();

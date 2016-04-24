/* eslint no-param-reassign: ["error", { "props": false }] */

import Rx from 'rx';

function createObservable(object, handlerName) {
  return Rx.Observable.create(observer => {
    if (object.observers === undefined) {
      object.observers = [];
      object[handlerName] = (event) => {
        object.observers.forEach(obs => {
          obs.onNext(event);
        });
      };
    }

    object.observers.push(observer);

    return Rx.Disposable.create(() => {
      object.observers = object.observers.filter(x => x !== observer);
    });
  });
}

export function midimessageAsObservable(input) {
  return createObservable(input, 'onmidimessage');
}

export function statechangeAsObservable(midi) {
  return createObservable(midi, 'onstatechange');
}

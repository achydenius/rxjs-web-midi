import Rx from 'rx';

export function midimessageAsObservable(input) {
    return Rx.Observable.create((observer) => {
        if (input.observers === undefined) {
            input.observers = [];
            input.onmidimessage = function(event) {
                input.observers.forEach((observer) => {
                    observer.onNext(event);
                });
            }
        }

        input.observers.push(observer);

        return Rx.Disposable.create(() => {
            input.observers = input.observers.filter((x) => {
                return x !== observer;
            });
        });
    });
}

import assert from 'assert';
import { midimessageAsObservable, statechangeAsObservable } from '../lib/rxjs-web-midi';
import Rx from 'rx';

const createMidiAccessMock = () => ({
  statechange: function stateChange(data) {
    this.onstatechange(data);
  },
});

const createMidiInputMock = () => ({
  midimessage: function midiMessage(data) {
    this.onmidimessage(data);
  },
});

const testMultipleSubscribers = (mock, func, observable) => {
  const scheduler = new Rx.TestScheduler();
  const observers = [
    scheduler.createObserver(),
    scheduler.createObserver(),
  ];

  scheduler.scheduleAbsolute(0, () => {
    observable.subscribe(observers[0]);
    observable.subscribe(observers[1]);
  });
  scheduler.scheduleAbsolute(50, () => {
    mock[func](1);
  });
  scheduler.scheduleAbsolute(100, () => {
    mock[func](2);
  });
  scheduler.start();

  const expected = [
    Rx.ReactiveTest.onNext(50, 1),
    Rx.ReactiveTest.onNext(100, 2),
  ];

  assert.deepEqual(expected, observers[0].messages);
  assert.deepEqual(expected, observers[1].messages);
};

const testDisposing = (mock, func, observable) => {
  const scheduler = new Rx.TestScheduler();
  const observers = [
    scheduler.createObserver(),
    scheduler.createObserver(),
  ];
  const subscriptions = [];

  scheduler.scheduleAbsolute(0, () => {
    subscriptions[0] = observable.subscribe(observers[0]);
    subscriptions[1] = observable.subscribe(observers[1]);
  });
  scheduler.scheduleAbsolute(50, () => mock[func](1));
  scheduler.scheduleAbsolute(100, () => subscriptions[0].dispose());
  scheduler.scheduleAbsolute(150, () => mock[func](2));
  scheduler.start();

  const expectedFirst = [
    Rx.ReactiveTest.onNext(50, 1),
  ];
  const expectedSecond = [
    Rx.ReactiveTest.onNext(50, 1),
    Rx.ReactiveTest.onNext(150, 2),
  ];

  assert.deepEqual(expectedFirst, observers[0].messages);
  assert.deepEqual(expectedSecond, observers[1].messages);
};

describe('statechangeAsObservable', () => {
  it('should return an Observable', () => {
    assert(statechangeAsObservable(createMidiAccessMock()) instanceof Rx.Observable);
  });

  it('should send events to multiple subscribers', () => {
    const midi = createMidiAccessMock();
    const observable = statechangeAsObservable(midi);
    testMultipleSubscribers(midi, 'statechange', observable);
  });

  it('should stop sending events to disposed subscribers', () => {
    const midi = createMidiAccessMock();
    const observable = statechangeAsObservable(midi);
    testDisposing(midi, 'statechange', observable);
  });
});

describe('midimessageAsObservable', () => {
  it('should return an Observable', () => {
    assert(midimessageAsObservable(createMidiInputMock()) instanceof Rx.Observable);
  });

  it('should send messages to multiple subscribers', () => {
    const input = createMidiInputMock();
    const observable = midimessageAsObservable(input);
    testMultipleSubscribers(input, 'midimessage', observable);
  });

  it('should stop sending messages to disposed subscribers', () => {
    const input = createMidiInputMock();
    const observable = midimessageAsObservable(input);
    testDisposing(input, 'midimessage', observable);
  });
});

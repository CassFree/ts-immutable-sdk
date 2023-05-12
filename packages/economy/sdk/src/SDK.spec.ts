/**
 * @jest-environment jsdom
 */

import { Subject } from 'rxjs';

import { Configuration, SDK } from './SDK';
import { EconomyCustomEventTypes, EventData, EventType } from './types';

type SDKMockEventType = EventType<
'test',
EventData<'test-status', { foo?: 'bar' }>
>;
export class SDKMock extends SDK<SDKMockEventType> {
  // TODO: fix this TS error commented out constructor for now
  // constructor(config: Configuration) {
  //   super(config);
  // }

  // TODO: remove eslint disable once implemented
  // eslint-disable-next-line class-methods-use-this
  connect(): void {
    // ...
  }

  // TODO: looks like making this method static fixes ts errors
  // @ts-ignore
  public override get isClientSide(): boolean {
    // @ts-ignore
    return super.isClientSide;
  }
}

describe('SDK Class', () => {
  let sdkMock: SDKMock;
  const eventHandlerFn = jest.fn();
  const configInput: Configuration = { env: 'production' };

  beforeEach(() => {
    sdkMock = new SDKMock(configInput);
  });

  afterEach(() => {
    sdkMock.disconnect();
    jest.resetAllMocks();
  });

  describe('bootstrap', () => {
    it('should instantiate with provided configuration', () => {
      expect(sdkMock.getConfig()).toEqual(configInput);
    });

    it('should call connect() method during instantiation', () => {
      const connectFn = jest.fn();
      class TestSDKMock extends SDKMock {
        // TODO: fix this eslint error
        // eslint-disable-next-line class-methods-use-this
        override connect() {
          connectFn();
        }
      }

      const testSDKMock = new TestSDKMock({ env: 'dev' });
      expect(connectFn).toHaveBeenCalled();

      testSDKMock.disconnect();
    });
  });

  describe('events', () => {
    it('should emit events to subscribers', () => {
      const event: SDKMockEventType = {
        action: 'test',
        status: 'test-status',
      };

      sdkMock.subscribe(eventHandlerFn);
      // TODO: fix this TS error
      // @ts-ignore
      sdkMock.events$$.next(event);
      expect(eventHandlerFn).toHaveBeenCalledWith(event);
    });

    it('should unsubscribe from events', () => {
      const eventsSubject = new Subject<SDKMockEventType>();
      // TODO: fix this TS error
      // @ts-ignore
      sdkMock.events$$ = eventsSubject;

      sdkMock.subscribe(eventHandlerFn);

      eventsSubject.next({ action: 'test', status: 'test-status' });
      expect(eventHandlerFn).toHaveBeenCalledTimes(1);

      sdkMock.disconnect();
      eventsSubject.next({ action: 'test', status: 'test-status' });
      expect(eventHandlerFn).not.toHaveBeenCalledTimes(2);
    });

    it('emitNativeEvent should dispatch CustomEvent on client side', () => {
      const dispatchEventSpy = jest.spyOn(document, 'dispatchEvent');
      const detail: SDKMockEventType = {
        action: 'test',
        status: 'test-status',
        foo: 'bar',
      };

      // TODO: fix this TS error
      // @ts-ignore
      sdkMock.emitNativeEvent(detail);

      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe(
        EconomyCustomEventTypes.DEFAULT,
      );
      expect((dispatchEventSpy.mock.calls[0][0] as CustomEvent).detail).toEqual(
        detail,
      );

      dispatchEventSpy.mockRestore();
    });

    it('emitNativeEvent should not dispatch CustomEvent on server side', () => {
      const dispatchEventSpy = jest.spyOn(document, 'dispatchEvent');
      const detail: SDKMockEventType = {
        action: 'test',
        status: 'test-status',
        foo: 'bar',
      };

      const isClientSideMock = jest.spyOn(sdkMock, 'isClientSide', 'get');
      isClientSideMock.mockReturnValue(false);

      // TODO: fix this TS error
      // @ts-ignore
      sdkMock.emitNativeEvent(detail);

      expect(dispatchEventSpy).toHaveBeenCalledTimes(0);

      isClientSideMock.mockRestore();
      dispatchEventSpy.mockRestore();
    });
  });

  describe('events handler utility', () => {
    it('should return a function', () => {
      // TODO: fix this TS error
      // @ts-ignore
      const handler = sdkMock.getEmitEventHandler();
      expect(typeof handler).toBe('function');
    });

    it('should emit an event when the returned handler is invoked', () => {
      const eventsSubject = new Subject<SDKMockEventType>();
      // TODO: fix this TS error
      // @ts-ignore
      sdkMock.events$$ = eventsSubject;

      sdkMock.subscribe(eventHandlerFn);

      // TODO: fix this TS error
      // @ts-ignore
      const emitHandler = sdkMock.getEmitEventHandler();
      emitHandler({
        action: 'test',
        status: 'test-status',
      });

      expect(eventHandlerFn).toHaveBeenCalledTimes(1);
      expect(eventHandlerFn).toHaveBeenCalledWith({
        action: 'test',
        status: 'test-status',
      });
    });
  });

  describe('utilities', () => {
    it('should log the arguments passed to it', () => {
      const consoleLogFn = jest.spyOn(console, 'log');

      sdkMock.log('test message');
      expect(consoleLogFn).toHaveBeenCalledWith('SDKMock:', 'test message');

      consoleLogFn.mockRestore();
    });

    it('should return false if not running in a browser environment', () => {
      const oldWindow = window;
      // @ts-ignore
      delete global.window;

      expect(sdkMock.isClientSide).toBe(false);

      global.window = oldWindow;
    });
  });
});

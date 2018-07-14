import createRequestEngine, { requestConsts } from '../index';

beforeEach(() => {
  window.fetch.resetMocks();
});

describe('configuration', () => {
  let requestEngine;

  describe('request methods', () => {
    beforeEach(() => {
      requestEngine = createRequestEngine();
    });

    it('should send request with specified method (get)', () => {
      requestEngine.request({
        method: requestConsts.METHOD.GET,
        endpoint: '/',
      });
      expect(window.fetch.mock.calls[0][1].method).toBe('get');
    });

    it('should send request with specified method (post)', () => {
      requestEngine.request({
        method: requestConsts.METHOD.POST,
        endpoint: '/',
      });
      expect(window.fetch.mock.calls[0][1].method).toBe('post');
    });

    it('should send request with specified method (put)', () => {
      requestEngine.request({
        method: requestConsts.METHOD.PUT,
        endpoint: '/',
      });
      expect(window.fetch.mock.calls[0][1].method).toBe('put');
    });

    it('should send request with specified method (patch)', () => {
      requestEngine.request({
        method: requestConsts.METHOD.PATCH,
        endpoint: '/',
      });
      expect(window.fetch.mock.calls[0][1].method).toBe('patch');
    });

    it('should send request with specified method (delete)', () => {
      requestEngine.request({
        method: requestConsts.METHOD.DELETE,
        endpoint: '/',
      });
      expect(window.fetch.mock.calls[0][1].method).toBe('delete');
    });

    it('should send request with specified method (head)', () => {
      requestEngine.request({
        method: requestConsts.METHOD.HEAD,
        endpoint: '/',
      });
      expect(window.fetch.mock.calls[0][1].method).toBe('head');
    });

    it('should send request with specified method (options)', () => {
      requestEngine.request({
        method: requestConsts.METHOD.OPTIONS,
        endpoint: '/',
      });
      expect(window.fetch.mock.calls[0][1].method).toBe('options');
    });
  });

  describe('request endpoint', () => {
    beforeEach(() => {
      requestEngine = createRequestEngine();
    });

    it('should send request to specified endpoint', () => {
      requestEngine.request({
        endpoint: '/test',
      });
      expect(window.fetch.mock.calls[0][0]).toBe('/test');
    });

    it('should resolve endpoint with request params, if endpoint option is function', () => {
      requestEngine.request({
        endpoint: ({ method }) => `/${method}/test`,
        method: requestConsts.METHOD.GET,
      });
      expect(window.fetch.mock.calls[0][0]).toBe(
        `/${requestConsts.METHOD.GET}/test`,
      );
    });
  });

  describe('plugins', () => {
    let pluginA;
    let pluginB;
    beforeEach(() => {
      pluginA = jest.fn(next => params =>
        next({
          ...params,
          lastPluginCalled: 'A',
          isPluginACalled: true,
        }),
      );
      pluginB = jest.fn(next => params =>
        next({
          ...params,
          lastPluginCalled: 'B',
          isPluginBCalled: true,
        }),
      );
      requestEngine = createRequestEngine({
        plugins: [pluginA, pluginB],
      });
    });

    it('should be chained at engine creation', () => {
      expect(pluginA.mock.calls).toHaveLength(1);
      expect(pluginB.mock.calls).toHaveLength(1);
    });

    it('should be composed in order that specified in configuration', () => {
      requestEngine.request({ endpoint: '/' });
      expect(window.fetch.mock.calls[0][1]).toEqual(
        expect.objectContaining({
          isPluginACalled: true,
          isPluginBCalled: true,
          lastPluginCalled: 'B',
        }),
      );
    });
  });
});

describe('fetch presets', () => {
  it('should carry preset params', () => {
    const presetParam = 'presetParam';
    const requestEngine = createRequestEngine();
    const requestPreset = requestEngine.preset({ presetParam });
    requestPreset.request({ endpoint: '/' });
    const requestParams = window.fetch.mock.calls[0][1];
    expect(requestParams).toEqual(expect.objectContaining({ presetParam }));
  });
  it('should chain preset calls', () => {
    const presetParam1 = 'presetParam1';
    const presetParam2 = 'presetParam2';
    const requestEngine = createRequestEngine();
    const requestPreset = requestEngine
      .preset({ presetParam1 })
      .preset({ presetParam2 });
    requestPreset.request({ endpoint: '/' });
    const requestParams = window.fetch.mock.calls[0][1];
    expect(requestParams).toEqual(
      expect.objectContaining({ presetParam1, presetParam2 }),
    );
  });
  it('should shallow merge with request params', () => {
    const presetParam = 'presetParam';
    const sharedParamFromPreset = {
      value: 'sharedParamFromPreset',
      shouldBeDeeplyMerged: false,
    };
    const sharedParamFromRequest = { value: 'sharedParamFromRequest' };
    const requestParam = 'requestParam';
    const requestEngine = createRequestEngine();
    const requestPreset = requestEngine.preset({
      presetParam,
      sharedParam: sharedParamFromPreset,
    });
    requestPreset.request({
      requestParam,
      sharedParam: sharedParamFromRequest,
      endpoint: '/',
    });
    const requestParams = window.fetch.mock.calls[0][1];
    expect(requestParams).toEqual(
      expect.objectContaining({
        presetParam,
        sharedParam: sharedParamFromRequest,
        requestParam,
      }),
    );
  });
  it('should especially shallow merge preset headers and request headers configurations', () => {
    const presetHeader = 'presetParam';
    const sharedHeaderFromPreset = 'sharedHeaderFromPreset';
    const sharedHeaderFromRequest = 'sharedHeaderFromRequest';
    const requestHeader = 'requestHeader';
    const requestEngine = createRequestEngine();
    const requestPreset = requestEngine.preset({
      headers: {
        presetHeader,
        sharedHeader: sharedHeaderFromPreset,
      },
    });
    requestPreset.request({
      endpoint: '/',
      headers: {
        requestHeader,
        sharedHeader: sharedHeaderFromRequest,
      },
    });
    const requestHeaders = window.fetch.mock.calls[0][1];
    expect(requestHeaders).toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({
          presetHeader,
          sharedHeader: sharedHeaderFromRequest,
          requestHeader,
        }),
      }),
    );
  });
  it('should not shallow merge other deep objects in configuration configurations', () => {
    const presetDeepParam = 'presetParam';
    const sharedDeepParamFromPreset = 'sharedDeepParamFromPreset';
    const sharedDeepParamFromRequest = 'sharedDeepParamFromRequest';
    const requestDeepParam = 'requestDeepParam';
    const requestEngine = createRequestEngine();
    const requestPreset = requestEngine.preset({
      deepParams: {
        presetDeepParam,
        sharedDeepParam: sharedDeepParamFromPreset,
      },
    });
    requestPreset.request({
      endpoint: '/',
      deepParams: {
        requestDeepParam,
        sharedDeepParam: sharedDeepParamFromRequest,
      },
    });
    const requestDeepParams = window.fetch.mock.calls[0][1];
    expect(requestDeepParams.deepParams.presetDeepParam).toBeUndefined();
  });
});

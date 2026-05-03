/**
 * 📊 Performance Monitor Global
 * Rastreia erros, timeouts, performance e uso geral da página
 */

export class PerformanceMonitor {
  static instance = null;

  constructor() {
    this.data = {
      navigation: [],
      clicks: [],
      requests: [],
      errors: [],
      warnings: [],
      metrics: {
        pageLoadTime: 0,
        firstPaint: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        timeToInteractive: 0,
        layoutShifts: 0,
        fps: 60,
        memory: {}
      },
      actions: [],
      timeouts: [],
      unresponsiveOperations: []
    };

    this.startTime = performance.now();
    this.actionStack = [];
    this.operationTimeouts = new Map();
    this.intervals = []; // Store interval IDs for cleanup

    this.init();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }

  init() {
    try {
      // Medir Web Vitals
      this.measureWebVitals();

      // Interceptar console
      this.interceptConsole();

      // Rastrear erros globais
      this.trackErrors();

      // Rastrear cliques
      this.trackClicks();

      // Rastrear navegação (router)
      this.trackNavigation();

      // Rastrear fetch/XHR
      this.trackRequests();

      // Medir FPS
      this.measureFPS();

      // Medir memory
      this.measureMemory();

      // Detectar operações travadas
      this.detectHangOperations();

      console.log('✅ Performance Monitor iniciado');
      console.log('📊 Dados acessíveis em window.perfMonitor.getData()');
    } catch (error) {
      console.error('❌ Erro ao inicializar Performance Monitor:', error);
    }
  }

  // ─────── Web Vitals ───────
  measureWebVitals() {
    // Page Load Time
    window.addEventListener('load', () => {
      const loadTime = performance.now() - this.startTime;
      this.data.metrics.pageLoadTime = Math.round(loadTime);
      this.log(`📄 Page Load: ${this.data.metrics.pageLoadTime}ms`);
    });

    // First Paint
    if (window.performance && window.performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          this.data.metrics.firstPaint = Math.round(entry.startTime);
        } else if (entry.name === 'first-contentful-paint') {
          this.data.metrics.firstContentfulPaint = Math.round(entry.startTime);
        }
      });

      // Largest Contentful Paint
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.data.metrics.largestContentfulPaint = Math.round(lastEntry.renderTime || lastEntry.loadTime);
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {}

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.data.metrics.layoutShifts = Math.round(clsValue * 1000) / 1000;
          }
        }
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {}
    }
  }

  // ─────── Console Interception ───────
  interceptConsole() {
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;

    console.log = (...args) => {
      origLog.apply(console, args);
      this.log(args.join(' '));
    };

    console.warn = (...args) => {
      origWarn.apply(console, args);
      this.warn(args.join(' '));
    };

    console.error = (...args) => {
      origError.apply(console, args);
      this.error(args.join(' '));
    };
  }

  // ─────── Error Tracking ───────
  trackErrors() {
    window.addEventListener('error', (event) => {
      const error = {
        type: 'error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toLocaleTimeString(),
        stack: event.error?.stack || ''
      };
      this.data.errors.push(error);
      this.logToErrorMapper(event.message, 'error', event.error?.stack);
      this.log(`❌ ERROR: ${event.message}`);
    });

    window.addEventListener('unhandledrejection', (event) => {
      const error = {
        type: 'unhandledRejection',
        message: String(event.reason),
        timestamp: new Date().toLocaleTimeString()
      };
      this.data.errors.push(error);
      this.logToErrorMapper(String(event.reason), 'error', event.reason?.stack);
      this.log(`❌ UNHANDLED REJECTION: ${event.reason}`);
    });
  }

  logToErrorMapper(message, type, stack = '') {
    try {
      if (window.ErrorMapper && window.errorMapper) {
        window.errorMapper.mapError(message, type, stack);
      }
    } catch (e) {
      // Silent fail - não quebrar se ErrorMapper não existir
    }
  }

  // ─────── Click Tracking ───────
  trackClicks() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-testid], button, a, [role="button"]');
      if (target) {
        const click = {
          element: target.textContent?.slice(0, 50) || target.className,
          selector: target.id || target.className,
          timestamp: new Date().toLocaleTimeString()
        };
        this.data.clicks.push(click);
        if (this.data.clicks.length > 100) this.data.clicks.shift();
      }
    });
  }

  // ─────── Navigation Tracking ───────
  trackNavigation() {
    // Para React Router, usar window.addEventListener('popstate')
    window.addEventListener('popstate', (e) => {
      this.logNavigation(window.location.pathname);
    });

    // Monkey-patch history
    const origPushState = window.history.pushState;
    window.history.pushState = (...args) => {
      origPushState.apply(window.history, args);
      this.logNavigation(args[2] || window.location.pathname);
      return null;
    };
  }

  logNavigation(path) {
    const nav = {
      path,
      timestamp: new Date().toLocaleTimeString()
    };
    this.data.navigation.push(nav);
    this.log(`📍 Navigation: ${path}`);
  }

  // ─────── Request Tracking ───────
  trackRequests() {
    const origFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];

      try {
        const response = await origFetch.apply(window, args);
        const duration = performance.now() - startTime;

        const request = {
          method: args[1]?.method || 'GET',
          url: String(url).slice(0, 100),
          status: response.status,
          duration: Math.round(duration),
          timestamp: new Date().toLocaleTimeString()
        };

        this.data.requests.push(request);
        if (this.data.requests.length > 100) this.data.requests.shift();

        if (duration > 3000) {
          this.warn(`⚠️ SLOW REQUEST: ${url} (${Math.round(duration)}ms)`);
        }

        if (response.status >= 400) {
          this.error(`❌ REQUEST ERROR: ${url} (${response.status})`);
        }

        return response;
      } catch (err) {
        const duration = performance.now() - startTime;
        this.error(`❌ FETCH FAILED: ${url} (${err.message})`);
        throw err;
      }
    };
  }

  // ─────── FPS Measurement ───────
  measureFPS() {
    let lastTime = performance.now();
    let frameCount = 0;

    const measureFrame = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        this.data.metrics.fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;

        if (this.data.metrics.fps < 30) {
          this.warn(`⚠️ LOW FPS: ${this.data.metrics.fps}fps`);
        }
      }

      requestAnimationFrame(measureFrame);
    };

    requestAnimationFrame(measureFrame);
  }

  // ─────── Memory Measurement ───────
  measureMemory() {
    const intervalId = setInterval(() => {
      if (performance.memory) {
        this.data.metrics.memory = {
          usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576),
          totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576),
          jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        };

        // Alertar se memory > 200MB
        if (this.data.metrics.memory.usedJSHeapSize > 200) {
          this.warn(`⚠️ HIGH MEMORY: ${this.data.metrics.memory.usedJSHeapSize}MB`);
        }
      }
    }, 5000); // A cada 5 segundos

    this.intervals.push(intervalId);
  }

  // ─────── Detect Hang Operations ───────
  detectHangOperations() {
    const intervalId = setInterval(() => {
      const now = performance.now();
      for (const [id, { startTime, name }] of this.operationTimeouts) {
        const duration = now - startTime;
        if (duration > 5000) { // Mais de 5 segundos
          if (!this.data.timeouts.find(t => t.operationId === id)) {
            this.data.timeouts.push({
              operationId: id,
              operation: name,
              duration: Math.round(duration),
              timestamp: new Date().toLocaleTimeString()
            });
            this.error(`❌ TIMEOUT: ${name} (${Math.round(duration)}ms)`);
          }
        }
      }
    }, 1000);

    this.intervals.push(intervalId);
  }

  // ─────── Cleanup ───────
  destroy() {
    this.intervals.forEach(id => clearInterval(id));
    this.intervals = [];
    this.operationTimeouts.clear();
    this.data = {
      navigation: [],
      clicks: [],
      requests: [],
      errors: [],
      warnings: [],
      metrics: {},
      actions: [],
      timeouts: [],
      unresponsiveOperations: []
    };
    console.log('✅ PerformanceMonitor cleaned up');
  }

  // ─────── Public API ───────
  startOperation(operationName) {
    const operationId = `${operationName}-${Date.now()}`;
    this.operationTimeouts.set(operationId, {
      startTime: performance.now(),
      name: operationName
    });
    this.log(`⏳ START: ${operationName}`);
    return operationId;
  }

  endOperation(operationId) {
    const op = this.operationTimeouts.get(operationId);
    if (op) {
      const duration = performance.now() - op.startTime;
      this.operationTimeouts.delete(operationId);
      this.log(`✅ END: ${op.name} (${Math.round(duration)}ms)`);
      return Math.round(duration);
    }
  }

  log(message) {
    this.data.actions.push({
      type: 'log',
      message,
      timestamp: new Date().toLocaleTimeString()
    });
    if (this.data.actions.length > 200) this.data.actions.shift();
  }

  warn(message) {
    this.data.warnings.push({
      message,
      timestamp: new Date().toLocaleTimeString()
    });
    this.logToErrorMapper(message, 'warning');
    if (this.data.warnings.length > 100) this.data.warnings.shift();
  }

  error(message) {
    this.data.errors.push({
      message,
      timestamp: new Date().toLocaleTimeString()
    });
    if (this.data.errors.length > 100) this.data.errors.shift();
  }

  getData() {
    return this.data;
  }

  getReport() {
    return {
      timestamp: new Date().toISOString(),
      totalErrors: this.data.errors.length,
      totalWarnings: this.data.warnings.length,
      totalRequests: this.data.requests.length,
      totalClicks: this.data.clicks.length,
      totalNavigations: this.data.navigation.length,
      metrics: this.data.metrics,
      slowRequests: this.data.requests.filter(r => r.duration > 1000),
      failedRequests: this.data.requests.filter(r => r.status >= 400),
      recentErrors: this.data.errors.slice(-10),
      recentWarnings: this.data.warnings.slice(-10)
    };
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.PerformanceMonitor = PerformanceMonitor;
  window.perfMonitor = PerformanceMonitor.getInstance();
}

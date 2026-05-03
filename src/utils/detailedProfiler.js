/**
 * Profiler Detalhado - Rastreia cada etapa
 * Útil para debugar gargalos
 */

const steps = {};

export class DetailedProfiler {
  static startSession(sessionName) {
    steps[sessionName] = {
      name: sessionName,
      startTime: performance.now(),
      stages: [],
      markers: []
    };
    console.log(`🔍 [${sessionName}] Sessão iniciada`);
  }

  static mark(sessionName, stageName) {
    if (!steps[sessionName]) {
      console.warn(`❌ Sessão ${sessionName} não encontrada`);
      return;
    }

    const now = performance.now();
    const session = steps[sessionName];

    if (session.markers.length === 0) {
      session.markers.push({
        name: 'start',
        time: session.startTime,
        duration: 0
      });
    }

    const lastMarker = session.markers[session.markers.length - 1];
    const duration = now - lastMarker.time;

    session.markers.push({
      name: stageName,
      time: now,
      duration: duration,
      totalDuration: now - session.startTime
    });

    const color = duration > 500 ? '🔴' : duration > 200 ? '🟠' : '🟢';
    console.log(
      `${color} [${sessionName}] ${stageName}: ${Math.round(duration)}ms (total: ${Math.round(now - session.startTime)}ms)`
    );
  }

  static endSession(sessionName) {
    if (!steps[sessionName]) {
      console.warn(`❌ Sessão ${sessionName} não encontrada`);
      return;
    }

    const session = steps[sessionName];
    const totalDuration = performance.now() - session.startTime;

    console.log('\n' + '═'.repeat(60));
    console.log(`📊 RELATÓRIO: ${sessionName}`);
    console.log('═'.repeat(60));

    session.markers.forEach((marker, idx) => {
      if (idx === 0) return;
      const prev = session.markers[idx - 1];
      const color = marker.duration > 500 ? '🔴' : marker.duration > 200 ? '🟠' : '🟢';
      console.log(
        `${color} ${marker.name.padEnd(30)} | ${String(Math.round(marker.duration)).padStart(5)}ms | Total: ${Math.round(marker.totalDuration)}ms`
      );
    });

    console.log('─'.repeat(60));

    // Encontrar stage mais lento
    const slowest = session.markers.reduce((max, current) => {
      return current.duration > max.duration ? current : max;
    });

    console.log(
      `⚠️  Stage mais lento: ${slowest.name} (${Math.round(slowest.duration)}ms)`
    );

    console.log(`✅ Total: ${Math.round(totalDuration)}ms`);
    console.log('═'.repeat(60) + '\n');

    // Salvar para análise
    return {
      name: sessionName,
      totalDuration,
      markers: session.markers,
      slowest: slowest.name,
      slowestDuration: slowest.duration
    };
  }

  static getSession(sessionName) {
    return steps[sessionName];
  }

  static getAllSessions() {
    return Object.values(steps);
  }

  static clearSession(sessionName) {
    delete steps[sessionName];
  }

  static clearAll() {
    Object.keys(steps).forEach(key => delete steps[key]);
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.DetailedProfiler = DetailedProfiler;
}

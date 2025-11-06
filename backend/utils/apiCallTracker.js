// API Call Tracker to monitor Gemini API usage
class ApiCallTracker {
  constructor() {
    this.calls = [];
    this.startTime = Date.now();
  }

  logCall(source, details = {}) {
    const call = {
      timestamp: new Date().toISOString(),
      timeSinceStart: Date.now() - this.startTime,
      source,
      details
    };
    
    this.calls.push(call);
    
    // Count calls in last minute
    const oneMinuteAgo = Date.now() - 60000;
    const recentCalls = this.calls.filter(c => 
      new Date(c.timestamp).getTime() > oneMinuteAgo
    );
    
    console.log(`\n🔔 API CALL TRACKER:`);
    console.log(`   Source: ${source}`);
    console.log(`   Total calls since start: ${this.calls.length}`);
    console.log(`   Calls in last minute: ${recentCalls.length}`);
    console.log(`   Time since start: ${Math.round((Date.now() - this.startTime) / 1000)}s`);
    
    if (recentCalls.length > 10) {
      console.log(`   ⚠️  WARNING: ${recentCalls.length} calls in last minute - approaching rate limit!`);
    }
    
    if (details) {
      console.log(`   Details:`, JSON.stringify(details, null, 2));
    }
    console.log('');
  }

  getStats() {
    const oneMinuteAgo = Date.now() - 60000;
    const recentCalls = this.calls.filter(c => 
      new Date(c.timestamp).getTime() > oneMinuteAgo
    );

    return {
      totalCalls: this.calls.length,
      callsLastMinute: recentCalls.length,
      uptime: Math.round((Date.now() - this.startTime) / 1000),
      callsBySource: this.calls.reduce((acc, call) => {
        acc[call.source] = (acc[call.source] || 0) + 1;
        return acc;
      }, {}),
      recentCallTimestamps: recentCalls.map(c => ({
        time: c.timestamp,
        source: c.source
      }))
    };
  }

  reset() {
    this.calls = [];
    this.startTime = Date.now();
    console.log('📊 API Call Tracker reset');
  }
}

// Export singleton instance
export const apiCallTracker = new ApiCallTracker();

// clientPool.mjs — Client Rotator & Cooldown Manager (shared network module).
// Handles per-client rate-limits (429 Too Many Requests), rotates through
// available healthy buckets, enforces cooldown penalties, and retries requests
// without dropping payloads. (Provided design; filename .mjs so Node treats it
// as ESM inside this tools/ directory which has no package.json.)

export class ClientPool {
  /**
   * @param {Array<{id: string, weight?: number}>} clients - List of client bucket identifiers
   * @param {Object} options - Configuration options
   * @param {number} options.defaultCooldownMs - Cooldown duration after a 429 (default: 30 seconds)
   */
  constructor(clients, { defaultCooldownMs = 30000 } = {}) {
    this.clients = clients.map(c => typeof c === 'string' ? { id: c } : c);
    this.defaultCooldownMs = defaultCooldownMs;

    // Track state per client: { availableAt: timestamp }
    this.state = new Map();
    this.currentIndex = 0;

    this.clients.forEach(c => {
      this.state.set(c.id, { availableAt: 0, consecutiveErrors: 0 });
    });
  }

  /**
   * Retrieves the next available client that is not currently in a cooldown window.
   */
  _getAvailableClient() {
    const now = Date.now();
    const totalClients = this.clients.length;

    // Scan starting from the current index to maintain fair distribution
    for (let i = 0; i < totalClients; i++) {
      const index = (this.currentIndex + i) % totalClients;
      const client = this.clients[index];
      const clientState = this.state.get(client.id);

      if (now >= clientState.availableAt) {
        this.currentIndex = (index + 1) % totalClients; // Advance pointer for next call
        return client;
      }
    }

    // Edge case: All clients are cooling down. Find the one recovering the soonest.
    let soonestClient = this.clients[0];
    let minAvailableAt = this.state.get(soonestClient.id).availableAt;

    for (const client of this.clients) {
      const time = this.state.get(client.id).availableAt;
      if (time < minAvailableAt) {
        minAvailableAt = time;
        soonestClient = client;
      }
    }

    return soonestClient;
  }

  /**
   * Marks a client as rate-limited, triggering a cooldown block.
   */
  markRateLimited(clientId, customCooldownMs) {
    const cooldown = customCooldownMs || this.defaultCooldownMs;
    const clientState = this.state.get(clientId);
    if (clientState) {
      clientState.consecutiveErrors++;
      // Optional: Exponential backoff based on consecutive 429 hits
      const scaledCooldown = cooldown * Math.min(clientState.consecutiveErrors, 4);
      clientState.availableAt = Date.now() + scaledCooldown;
      console.warn(`[ClientPool] Bucket '${clientId}' hit 429. Cooling down for ${scaledCooldown / 1000}s.`);
    }
  }

  /**
   * Marks a client request successful, resetting error penalties.
   */
  markSuccess(clientId) {
    const clientState = this.state.get(clientId);
    if (clientState) {
      clientState.consecutiveErrors = 0;
      clientState.availableAt = 0;
    }
  }

  /**
   * Executes a fetch request with automatic client rotation and 429 retry fallback.
   *
   * @param {string|Function} urlFactory - URL string or a function taking the client object: (client) => URL
   * @param {RequestInit} fetchOptions - Standard fetch options
   * @param {number} maxRetries - Maximum rotation attempts before giving up
   */
  async fetchWithRotation(urlFactory, fetchOptions = {}, maxRetries = this.clients.length) {
    let attempts = 0;

    while (attempts < maxRetries) {
      const client = this._getAvailableClient();
      const url = typeof urlFactory === 'function' ? urlFactory(client) : urlFactory;

      // Inject client-specific headers/query parameters if required
      const headers = new Headers(fetchOptions.headers || {});
      headers.set('X-Client-Bucket', client.id);

      try {
        const response = await fetch(url, { ...fetchOptions, headers });

        if (response.status === 429) {
          // Check for Retry-After header (seconds or HTTP date)
          let retryAfterMs = undefined;
          const retryHeader = response.headers.get('Retry-After');
          if (retryHeader) {
            const seconds = parseInt(retryHeader, 10);
            if (!isNaN(seconds)) retryAfterMs = seconds * 1000;
          }

          this.markRateLimited(client.id, retryAfterMs);
          attempts++;
          continue; // Try next client bucket
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        this.markSuccess(client.id);
        return { response, client };

      } catch (error) {
        // Network or transmission errors can also trigger soft rotation if desired
        attempts++;
        if (attempts >= maxRetries) throw error;
      }
    }

    throw new Error('[ClientPool] All client buckets exhausted due to rate limits (429).');
  }
}

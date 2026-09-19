import { Response } from 'express';
import { AppServerEvent, AppEventType } from '../types.js';

class EventService {
  private clients: Set<Response> = new Set();

  /**
   * Register a new SSE client
   */
  public addClient(res: Response): void {
    this.clients.add(res);

    // Initial greeting / handshake
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString(), payload: { clientCount: this.clients.size } })}\n\n`);

    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  /**
   * Broadcast an event to all connected clients
   */
  public broadcast(type: AppEventType, payload: unknown, options?: { centreId?: string; procurementId?: string; farmerId?: string }): void {
    const event: AppServerEvent = {
      type,
      centreId: options?.centreId,
      procurementId: options?.procurementId,
      farmerId: options?.farmerId,
      payload,
      timestamp: new Date().toISOString()
    };

    const message = `data: ${JSON.stringify(event)}\n\n`;

    for (const client of this.clients) {
      try {
        client.write(message);
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }

  /**
   * Get active connection count
   */
  public getClientCount(): number {
    return this.clients.size;
  }
}

export const eventService = new EventService();

import { supabase } from '../supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface PresencePayload {
  [key: string]: unknown;
}

export class RealtimeService {
  /**
   * Helper to subscribe to a realtime channel and listen to postgres or broadcast events.
   */
  subscribe(
    channelName: string,
    event: string,
    callback: (payload: Record<string, unknown>) => void
  ): RealtimeChannel {
    const uniqueChannelName = `${channelName}_${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase.channel(uniqueChannelName);

    channel
      .on('broadcast', { event }, (payload) => {
        callback(payload as Record<string, unknown>);
      })
      .subscribe();

    return channel;
  }

  /**
   * Helper to unsubscribe from an active realtime channel.
   */
  async unsubscribe(channel: RealtimeChannel): Promise<string> {
    return await supabase.removeChannel(channel);
  }

  /**
   * Helper to register presence state on a realtime channel.
   */
  async presence(
    channel: RealtimeChannel,
    state: PresencePayload
  ): Promise<string> {
    return await channel.track(state);
  }

  /**
   * Helper to broadcast a message to a realtime channel.
   */
  async broadcast(
    channel: RealtimeChannel,
    event: string,
    payload: Record<string, unknown>
  ): Promise<string> {
    return await channel.send({
      type: 'broadcast',
      event,
      payload,
    });
  }
}

export const realtimeService = new RealtimeService();

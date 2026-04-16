import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabCommunicationService {
  private channel = new BroadcastChannel('tab_channel');
  // Use ReplaySubject(1) so late subscribers get the last emitted message
  public data$ = new ReplaySubject<any>(1);

  constructor() {
    // Relay BroadcastChannel messages to subscribers
    this.channel.onmessage = (event) => {
      this.data$.next(event.data);
    };

    // Also listen for storage events so tabs that initialize after a message
    // was sent can pick up the last message. We store the last message in
    // localStorage under `tab_channel_last` when sending.
    window.addEventListener('storage', (ev: StorageEvent) => {
      if (ev.key === 'tab_channel_last' && ev.newValue) {
        try {
          const parsed = JSON.parse(ev.newValue);
          if (parsed && parsed.data) {
            this.data$.next(parsed.data);
          }
        } catch (e) {
          // ignore malformed data
        }
      }
    });

    // If there's a last message stored from another tab, emit it so late
    // subscribers (e.g. a freshly opened tab) receive the most recent payload.
    try {
      const last = localStorage.getItem('tab_channel_last');
      if (last) {
        const parsed = JSON.parse(last);
        if (parsed && parsed.data) {
          // emit asynchronously to allow subscribers to attach in ngOnInit
          setTimeout(() => this.data$.next(parsed.data), 0);
        }
      }
    } catch (e) {
      // ignore JSON errors
    }
  }

  send(data: any) {
    // persist the last message (with timestamp) so new tabs can read it
    try {
      const payload = { ts: Date.now(), data };
      localStorage.setItem('tab_channel_last', JSON.stringify(payload));
    } catch (e) {
      // ignore storage errors (e.g., quota)
    }
    this.channel.postMessage(data);
  }
}

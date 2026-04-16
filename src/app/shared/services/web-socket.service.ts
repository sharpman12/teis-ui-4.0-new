import { Injectable } from '@angular/core';
import { Client, IMessage, Stomp } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { Constants } from '../components/constants';
import { BehaviorSubject } from 'rxjs';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  // private stompClient: Client;
  private ws: WebSocket;
  currentUser: any = null;
  loginUserName: string = '';

  private webSocketResSubject = new BehaviorSubject<any>(null);
  webSocketResponse$ = this.webSocketResSubject.asObservable();

  constructor(
    private messageService: MessageService,
  ) {
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER) || '{}');
    this.loginUserName = localStorage.getItem(Constants.USERNAME);
    // this.connect();
  }

  connect() {
    const url = new URL(environment.webSocketBaseUrl);
    const host = url.hostname; // e.g., "localhost" or "example.com"
    const port = url.port;     // e.g., "4200" or "" (if default)
    /* Creating a new WebSocket connection to a specific URL. */
    this.ws = new WebSocket(`wss://${host}:${port}/client/ws/updates/${this.loginUserName}`);
    // this.ws = new WebSocket(`wss://wpg02xvfx:8693/client/ws/updates/${this.loginUserName}`);

    /* Setting up event handlers for the WebSocket connection. */
    this.ws.onopen = () => {
      console.log('Web socket connected');
      this.sendMessage(JSON.stringify({
        username: this.loginUserName
      }));
    };

    this.ws.onmessage = (res) => {
      console.log('Res: ', res?.data);
      // You can emit this data using Subject to components
      this.setWebSocketReceivedRes(res?.data);

      const webSocketRes = JSON.parse(res?.data);
      if (webSocketRes?.module.toLowerCase() === 'reindexing') {
        if (webSocketRes?.status === 'true') {
          this.messageService.add({ key: 'appSuccessMsgKey', severity: 'info', summary: '', detail: `Reindexing of logs completed successfully!` });
        } else {
          this.messageService.add({ key: 'appInfoMsgKey', severity: 'info', summary: '', detail: `Reindexing of logs failed, check server log for more details.` });
        }
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket Error', error);
    };

    this.ws.onclose = () => {
      console.warn('WebSocket closed. Reconnecting in 5 seconds...');
      setTimeout(() => this.connect(), 5000); // Optional auto-reconnect
    };
  }

  setWebSocketReceivedRes(data: any): void {
    this.webSocketResSubject.next(data);
  }

  sendMessage(msg: string) {
    this.ws.send(msg);
  }

  isWSConnected() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('Have a Web socket connection');
      return true;
    } else {
      console.log('Web socket is NOT connected');
      return false;
    }
  }
}

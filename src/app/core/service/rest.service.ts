/*import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class RestService {
  private readonly apiEndPoint = environment.apiEndPointCoreVS;

  constructor(private http: HttpClient) {
  }

  getHeaders(): any {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Access-Control-Allow-Headers', '*');
    return headers;
  }

  get(path: string,  body: object = {}): Observable<any> {
    return this.http.get(`${this.apiEndPoint}${path}`, body);
  }


  post(path: string, body: object): Observable<any> {
    return this.http.post(`${this.apiEndPoint}${path}`,
      body, { headers: this.getHeaders()});
      // .pipe(map((res: Response) => res.json()))
  }

  delete(path: string, body: object = {}): Observable<any> {
    return this.http.delete(`${this.apiEndPoint}${path}`, body);
  }

  put(path: string, body: object = {}): Observable<any> {
    return this.http.put(`${this.apiEndPoint}${path}`, body);
  }
}
*/
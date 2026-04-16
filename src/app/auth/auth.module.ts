import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { LoginComponent } from '../login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../core/guard/auth-guard';
import { AuthService } from './services/auth.service';
// import { RandomGuard } from './guards/random.guard';
import { TokenInterceptor } from './token.interceptor';


@NgModule({
  declarations: [],
  providers: [
    AuthGuard,
    AuthService,
    //  RandomGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule
  ]
})
export class AuthModule { }

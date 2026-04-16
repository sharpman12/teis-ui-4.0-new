import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthService } from '../core/service/auth.service';
import { AlertService } from '../core/service/alert.service';
import { HeaderService } from '../core/service/header.service';
import { BreadCrumbService } from '../core/service/breadcrumb.service';
import { SharedService } from '../shared/services/shared.service';
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None  // Use to disable CSS Encapsulation for this component
})
export class LoginComponent implements OnInit, AfterViewInit {
    @ViewChild('inputBox', { static: true }) elementRef: ElementRef;
    loginForm: UntypedFormGroup;
    loading = false;
    submitted = false;
    firstTimeSubmit = false;
    returnUrl: string;
    message: string;
    error = '';
    isPassword = true;
    showPassword = true;
    formError = false;
    constructor(
        private formBuilder: UntypedFormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthService,
        private alertService: AlertService,
        public header: HeaderService,
        public breadcrumb: BreadCrumbService,
        private sharedService: SharedService,
    ) { }

    ngAfterViewInit() {
        // Autofocus on username textbox
        this.elementRef.nativeElement.focus();
    }

    ngOnInit() {
        this.header.hide();
        this.breadcrumb.hide();
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

        localStorage.clear();
        localStorage.clear();
        this.sharedService.clearLocalUserPermissions();
    }

    get f() { return this.loginForm.controls; }
    validateInput() {
        if (this.loginForm.invalid && this.firstTimeSubmit === true) {
            if (this.loginForm.value.username === '') {
                this.alertService.error('Username is required!');
            }
            if (this.loginForm.value.username !== '' && this.loginForm.value.password === '') {
                this.alertService.error('Password is required!');
            }
        } else if (this.loginForm.invalid === false) {
            this.alertService.clear();
        }
    }
    onSubmit() {
        this.submitted = true;
        this.firstTimeSubmit = true;
        this.validateInput();
        this.loading = true;
        const passwordRequired = (this.f.password.value === 'undefined') ||
            (this.f.password.value === '') ||
            (this.f.password.value === 'null');
        const usernameRequired = (this.f.username.value === 'undefined') ||
            (this.f.username.value === '') ||
            (this.f.username.value === 'null');

        switch (this.submitted = true) {
            case ((usernameRequired && passwordRequired) === true):
                this.alertService.error('Username and Password are required!');
                break;
            case (passwordRequired):
                this.alertService.error('Password is required!');
                break;
            case (usernameRequired):
                this.alertService.error('Username is required!');
                break;
            case ((usernameRequired && passwordRequired) === false):
                this.authenticationService.login({ username: this.f.username.value, password: this.f.password.value })
                    .pipe(first())
                    .subscribe(
                        data => {
                            this.router.navigate([this.returnUrl]);
                        },
                        error => {
                            this.loading = false;
                        });
        }

    }
    onLoginKeyUp() {
        this.submitted = false;
        this.validateInput();
    }
    togglePasswordVisibility() {
        if (this.isPassword === true) {
            this.isPassword = false;
            this.showPassword = false;
        } else {
            this.isPassword = true;
            this.showPassword = true;
        }
    }
}

import { Routes, RouterModule } from '@angular/router';

import {DashboardMainComponent } from "./ehr-modules/dashboard/dashboard-main/dashboard-main.component";
import {PatientMainComponent } from "./ehr-modules/patient/patient-main/patient-main.component";


const appRoutes: Routes = [
    //{ path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardMainComponent },
    { path: 'patient', component: PatientMainComponent }
];

export const routing = RouterModule.forRoot(
    appRoutes
    //,{ enableTracing: true } // <-- debugging purposes only
);
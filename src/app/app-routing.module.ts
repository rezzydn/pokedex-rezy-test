import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'tabs/home', pathMatch: 'full' },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.TABS_ROUTES),
  },
  {
    path: 'pokemon/:id',
    loadComponent: () => import('./pages/detail/detail.page').then((m) => m.DetailPage),
  },
  { path: '**', redirectTo: 'tabs/home' },
];

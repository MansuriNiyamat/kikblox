import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'drawing',
    loadChildren: () =>
      import('./schema/schema.module').then(m => m.SchemaModule)
  },
  // {
  //   path: 'scheduler',
  //   loadChildren: () =>
  //     import('./scheduler/scheduler.module').then(m => m.SchedulerModule)
  // },
  // {
  //   path: 'programs',
  //   loadChildren: () =>
  //     import('./programs/programs.module').then(m => m.ProgramsModule)
  // },
  {
    path: '',
    redirectTo: '/drawing',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/drawing',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }



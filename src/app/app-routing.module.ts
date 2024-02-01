import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { YyzComponent } from './yyz/yyz.component';
import { SheetjsComponent } from './sheetjs/sheetjs.component';

const routes:Routes = [
  { path: "yyz", component:YyzComponent },
  { path:"xls", component:SheetjsComponent }

];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }

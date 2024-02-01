import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button';
import { AsyncPipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-sheetjs',
  standalone: true,
  imports: [HttpClientModule, TableModule, ButtonModule, AsyncPipe, TitleCasePipe],
  templateUrl: './sheetjs.component.html',
  styleUrl: './sheetjs.component.css'
})
export class SheetjsComponent implements OnInit {
  public dataSource$;

  constructor( protected http: HttpClient) {
  }

  ngOnInit(): void {
    console.log("SheetjsComponent{init]");
    this._readData()
  }

  // ==========================================================================
  private _readData() {
/* 
    this.http.get("/assets/data/random-users.json").subscribe({
      next: resp => console.log(resp),
      error: err => console.error(err),
      complete: () => console.log("COMPLETE")
    });
 */
    this.dataSource$ = this.http.get("/assets/data/random-users.json").pipe(
      map( d => d['results'])
    );
  }
}

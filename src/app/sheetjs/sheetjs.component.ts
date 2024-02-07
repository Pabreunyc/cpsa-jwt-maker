import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { of } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { Table, TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AsyncPipe, TitleCasePipe, JsonPipe, CommonModule, DatePipe } from '@angular/common';
import  * as XLSX from 'xlsx';

interface TableColumn {
  field: string;
  header: string;
  type?: string,
  customExportHeader?: string;
};

const DEFAULT_WORKBOOK_PROPS = {
  "Company": "NYC Department of Parks & Recreation"
}

@Component({
  selector: 'app-sheetjs',
  standalone: true,
  imports: [CommonModule, HttpClientModule, TableModule, ButtonModule, TooltipModule, AsyncPipe, JsonPipe, TitleCasePipe, DatePipe],
  templateUrl: './sheetjs.component.html',
  styleUrl: './sheetjs.component.css'
})
export class SheetjsComponent implements OnInit {
  @ViewChild('dt') dtRef: ElementRef<Table>;
  public dataSource$ = null;
  public data = null;
  public loading:boolean = true;
  // tabularData
  public tableData = {
    cols:null,
    data:null
  }
  constructor( protected http: HttpClient) {
  }

  ngOnInit(): void {
    console.log("SheetjsComponent{init]");
    this._init()
  }

  exportCSV() {
    console.log("Exporting to CSV");
  }
  exportExcel() {
    let ts = Date.now();
    let filename = this.dtRef['exportFilename'] + `_${ts}.xlsx`;
    let sheetname:any = new Date().toLocaleDateString();
    sheetname = Date.now();
    console.log("Exporting to Excel Sheet. Using filename", ` "${filename}"`);

    let aoo = this.createWorksheetData();
    let widths = this.getCellWidths(aoo);
    const worksheet = XLSX.utils.json_to_sheet(aoo);
    if(!worksheet["!cols"]) {
      worksheet["!cols"] = widths.map(p => ({wch:p+1}));
      worksheet["!cols"][4] = {wch:11.25};
      worksheet["!cols"][0]['level'] = 1;
      // worksheet["!cols"][0] = {wch:18};
    }
    if(!worksheet["!rows"]) {
      worksheet["!rows"] = [];
      worksheet["!rows"][1] = {"hpx":30.75};
    }
    console.log("worksheet:", worksheet);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetname);

    XLSX.writeFile(workbook, filename, { compression: true });
    console.log("+++++ END +++++ END +++++");
  }
  private createWorksheetData() {
    let widths = [];
    console.log("Creating worksheet data");
    let ret = null;
    let r;
    ret = this.tableData.data.map( p => {
      r = {};
      this.tableData.cols.forEach(f => {
        switch(f.type) {
          case 'date': {
            r[ f['header'] ] = new Date(p[ f['field'] ]);
            break;
          }
          default: {
            r[ f['header'] ] = p[ f['field'] ];
            break;
          }
        }
      });
      r["Cell"] = p['cell'];
      return r;
    })
    console.log("createWorksheetData:", ret);
    return ret;
  }
  private getCellWidths(aoo):Array<number> {
    let w =  Array( Object.keys(aoo[0]).length ).fill(0);

    for(let r of aoo) {
      let i = 0;
      for(let p in r) {
        let l = r[p].length ?? 0;
        w[i] = Math.max(w[i], l);
        i++;
      }
    }
    console.log("Widths:", w);
    return w;
  }
  // ==========================================================================
  private _init() {
    console.log("_readData::");

    this.tableData.cols = [
      {"header":"Name", "field":"full_name"},
      {"header":"Username", "field":"username"},
      {"header":"Salary", "field":"salary"},
      {"header":"E-mail", "field":"email"},
      {"header":"Phone", "field":"phone"},
      {"header":"DOB", "field":"dob_date", "type":"date"}
    ];
/* 
    this.http.get("/assets/data/random-users.json").subscribe({
      next: resp => console.log(resp),
      error: err => console.error(err),
      complete: () => console.log("COMPLETE")
    });
 */
    // https://randomuser.me/api/?seed=626dd180d4939435
    // "/assets/data/random-users.json"
    this.dataSource$ = this.http.get("https://randomuser.me/api/?seed=626dd180d4939435&results=10").pipe(
      delay(1500),
      catchError(error => {
        console.error('Error fetching data:', error);
        return of([]); // return an empty array or appropriate default value
      }),
      tap(console.log),
      map( d => {
        this.data = d['results'].map(p => {
          console.log(this._getSalary())
          p['salary'] = this._getSalary();
          return p;
        });
        return d['results'];
      })
    );
    // console.log(this.dataSource$);

    this.dataSource$.subscribe(
      (d:Array<any>) => {
        d.forEach(el => {
          el['username'] = el['login']['username'];
          el['full_name'] = el['name']['first'] + ' ' + el['name']['last'];
          el['dob_date'] = el['dob']['date'];
        });
        this.tableData.data = d;
        this.loading = false;
        console.log("TableData:", this.tableData);
      }
    );
  }
  private _getSalary() {
    return Math.ceil(Math.random() * 50_000 + 40_000);
  }
}

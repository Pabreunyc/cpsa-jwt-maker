import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { of } from 'rxjs';
import { catchError, delay, finalize, map, tap } from 'rxjs/operators';
import { Table, TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AsyncPipe, TitleCasePipe, JsonPipe, CommonModule, DatePipe, PercentPipe } from '@angular/common';
// import { CommonModule } from '@angular/common';
import  * as XLSX from 'xlsx';
import { PrimeIcons } from 'primeng/api';

interface TableColumn {
  field: string;
  header: string;
  type?: string;
  hiddenTableView?: boolean;
  hiddenExportView?: boolean
};

const DEFAULT_WORKBOOK_PROPS = {
  "Company": "NYC Department of Parks & Recreation"
}
const EXCEL_DATE_FORMAT_1 = "12/31/9999";

const PIPE_IMPORTS = [AsyncPipe, JsonPipe, TitleCasePipe, DatePipe, PercentPipe];
const PRIMENG_IMPORTS = [TableModule, ButtonModule, TooltipModule];
@Component({
  selector: 'app-sheetjs',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ...PRIMENG_IMPORTS, ...PIPE_IMPORTS],
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
    this._init();
    console.log(PrimeIcons.AMAZON);
  }

  exportCSV() {
    console.log("Exporting to CSV");
  }
  exportExcel() {
    let ts = Date.now();
    let filename = this.dtRef['exportFilename'] + `_${ts}.xlsx`;
    let sheetname:any = new Date().toLocaleDateString();
    sheetname = Date.now().toString();
    console.log("Exporting to Excel Sheet. Using filename", ` "${filename}"`);

    let aoo = this.createWorksheetData();
    console.log("aoo:", JSON.parse(JSON.stringify(aoo)));
    let widths = this.getCellWidths(aoo);

    const worksheet = XLSX.utils.json_to_sheet(aoo);
    let range:XLSX.Range = XLSX.utils.decode_range(worksheet["!ref"]);

    console.log("worksheet:", JSON.parse(JSON.stringify(worksheet)));
    console.log("refs:", range);
    console.log("worksheet.cols:", widths, "::", "worksheet.rows:", aoo.length);
    // cell_set_number_format)

    if(!worksheet["!cols"]) {
      worksheet["!cols"] = widths.map(p => ({wch:p+1}));
      worksheet["!cols"][4] = {wch:11.25};
      // worksheet["!cols"][4].hidden = true;
      worksheet["!cols"][5] = {wch:EXCEL_DATE_FORMAT_1.length};
      worksheet["!cols"][0]['level'] = 1;
      worksheet["!cols"][0] = {wch:18};
    }
    if(!worksheet["!rows"]) {
      worksheet["!rows"] = Array(aoo.length);
      worksheet["!rows"][1] = {"hpx":30.75};
    }

    worksheet[XLSX.utils.encode_cell({r:0, c:0})].z = '[Bold]';
    for(let row = range.s.r+1; row <=range.e.r; ++row) {
      const ref = XLSX.utils.encode_cell({ r: row, c: 2 });
      // console.log({ref}, worksheet[ref].v, worksheet[ref].t, worksheet[ref].z);
      worksheet[ref].z = '"$"#,##0.00_);[Red]\\("$"#,##0.00\\)';
    }

    // worksheet["C2"].z = '#,##0';
    // worksheet["C3"].z = '"$"#,##0.00_);\\("$"#,##0.00\\)'; // Currency format

    console.log("worksheet:", worksheet);
    const workbook = XLSX.utils.book_new();
/*     let workbook = { 
      "Props":DEFAULT_WORKBOOK_PROPS,
      "Sheets": { 'Worksheet': worksheet }, "SheetNames": ['Data']
    }; */
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetname);

    // "cellDates":true

    let wr = XLSX.writeFile(workbook, filename, { compression: true, Props:{Author:"SheetJS"} });
    // console.log(wr);
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
        if( f?.hiddenExportView ) return; // ...because we're in a function (anonymous)

        switch(f.type) {
          case 'date': {
            r[ f['header'] ] = new Date(p[ f['field'] ]); break;
          }
          case 'currency': {
            r[ f['header'] ] = p[ f['field'] ]; break;
            // r[ f['header'] ] = XLSX.SSF.format('$0.00', p[ f['field'] ]); break;
          }
          default: {
            r[ f['header'] ] = p[ f['field'] ]; break;
          }
        }
      });
      // r["Cell"] = "p['cell'];"
      r["Cell"] = "🍔"; // 
      return r;
    })
    console.log("createWorksheetData:", ret);
    return ret;
  }
  private getCellWidths(aoo):Array<number> {
    const dateWidth = ""
    let w = [];
    Object.keys(aoo[0]).forEach((p,i) => w[i] = p.length);

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
    console.log("_init::");

    this.tableData.cols = [
      {"header":"Name", "field":"full_name"},
      {"header":"Username", "field":"username"},
      {"header":"Salary", "field":"salary", "type":"currency"},
      {"header":"E-mail", "field":"email"},
      {"header":"Phone", "field":"phone"},
      {"header":"DOB", "field":"dob_date", "type":"date"},
      {"header":"Avatar", "field":"avatar", "type":"pre", "hiddenExportView":true},
      {"header":"Percentile", "field":"percentile", "type":"percent", "hiddenTableView":true}
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
      delay(500),
      catchError(error => {
        console.error('Error fetching data:', error);
        return of([]); // return an empty array or appropriate default value
      }),
      tap(console.log),
      map( d => {
        this.data = d['results'].map(p => {
          p['username'] = p['login']['username'];
          p['full_name'] = p['name']['first'] + ' ' + p['name']['last'];
          p['dob_date'] = p['dob']['date'];
          p['salary'] = this._getSalary();
          p['percentile'] = this._getPercentile();
          p['avatar'] = `avatar\x0ahere`; // \x0a:line feed -- \x0d:carraige return
          return p;
        });
        console.log("results:", d.results);
        return d['results'];
      })
    );
    // console.log(this.dataSource$);

    this.dataSource$.subscribe({
      next:
        (d:Array<any>) => {
          d.forEach(el => {
          });
          this.tableData.data = d;
          this.loading = false;
          console.log("TableData:", this.tableData);
      },
      error: err => console.error(err),
      complete: () => {
        console.log("KOMPLETE");
        // this.exportExcel();
      }
    });
  }
  private _getSalary():number {
    let sign = Math.random() < .5 ? -1 : 1;
    return sign * Math.ceil(Math.random() * 50_000 + 40_000);
  }
  private _getPercentile():number {
    return Number( Number(Math.random()).toFixed(2) );
  }
}

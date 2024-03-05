import { Component } from '@angular/core';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrl: './entry.component.css',
})
export class EntryComponent {
  public timeStamp: Date;

  foo() {
    // FIXME:
    // TODO:
    console.log(this.timeStamp);
  }
}

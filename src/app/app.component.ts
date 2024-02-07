import { Component, OnInit, isDevMode } from '@angular/core';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'cpsa-jwt-maker';

  ngOnInit(): void {
    console.log("INIT.");
    console.log("Devmode:", isDevMode(), "Production:", environment.production);

    console.log(environment);
  }
}

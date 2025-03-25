import { Component, AfterViewInit } from '@angular/core';

declare const ymaps: any;

@Component({
  selector: 'app-yandex-map',
  standalone: true,
  template: '<div id="yandex-map" style="width: 80%; height: 100vh;"></div>',
})
export class YandexMapComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    ymaps.ready().then(() => {
      new ymaps.Map('yandex-map', {
        center: [55.751574, 37.573856],
        zoom: 10,
      });
    });
  }
}

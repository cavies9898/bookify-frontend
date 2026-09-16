import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import * as L from 'leaflet';

const DEFAULT_CENTER: L.LatLngExpression = [19.4326, -99.1332];
const DEFAULT_ZOOM = 13;

@Component({
  selector: 'app-location-map',
  imports: [MatIconModule],
  templateUrl: './location-map.html',
  styleUrl: './location-map.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationMap implements AfterViewInit, OnDestroy {
  private mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');

  readonly latitude = signal<number | undefined>(undefined);
  readonly longitude = signal<number | undefined>(undefined);
  readonly locationSelected = output<{ latitude: number; longitude: number }>();

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  setCoordinates(lat: number, lng: number): void {
    this.latitude.set(lat);
    this.longitude.set(lng);
    if (this.map) {
      this.updateMarker(lat, lng);
      this.map.setView([lat, lng], this.map.getZoom());
      setTimeout(() => this.map?.invalidateSize(), 100);
    }
  }

  private initMap(): void {
    const el = this.mapContainer().nativeElement;

    this.map = L.map(el, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    setTimeout(() => this.map?.invalidateSize(), 100);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.latitude.set(lat);
      this.longitude.set(lng);
      this.updateMarker(lat, lng);
      this.locationSelected.emit({ latitude: lat, longitude: lng });
    });
  }

  private updateMarker(lat: number, lng: number): void {
    if (!this.map) {
      return;
    }
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: '<div class="marker-pin"></div>',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });
      this.marker = L.marker([lat, lng], { icon }).addTo(this.map);
    }
  }
}

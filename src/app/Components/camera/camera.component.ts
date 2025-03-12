import { Component, OnInit } from '@angular/core';
import { CameraService } from '../../camera/services/camera.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-camera',
  imports: [CommonModule],
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent implements OnInit {
  imgUrl: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private cameraService: CameraService) {}

  ngOnInit() {
    this.cameraService.photos$.subscribe((photos) => {
      if (photos.length > 0) {
        this.imgUrl = photos[photos.length - 1]; // Mostrar la última imagen
      } else {
        this.imgUrl = ''; // Si no hay imágenes, limpiar el campo
      }
    });

    this.cameraService.loadPhotos(); // Cargar imágenes guardadas
  }

  async takePicture() {
    this.errorMessage = '';
    this.loading = true;

    try {
      await this.cameraService.takePicture();
    } catch (error) {
      console.error('❌ Error al capturar imagen:', error);
      this.errorMessage = String(error);
    } finally {
      this.loading = false;
    }
  }
}

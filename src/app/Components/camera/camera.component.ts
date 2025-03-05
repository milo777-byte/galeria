import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraService } from '../../camera/services/camera.service';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent implements OnInit {
  cameraService: CameraService = inject(CameraService);
  imgUrl: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  ngOnInit() {
    // 📸 Cargar la última imagen guardada al iniciar
    this.cameraService.photos$.subscribe((photos) => {
      if (photos.length > 0) {
        this.imgUrl = photos[photos.length - 1]; // Mostrar la última imagen
      } else {
        this.imgUrl = ''; // Si no hay imágenes, limpiar el campo
      }
    });
  }

  async takePicture() {
    this.errorMessage = ''; // Limpiar errores anteriores

    try {
      this.loading = true;
      await this.cameraService.takePicture();
      this.loading = false;
    } catch (error) {
      console.error('❌ Error al capturar imagen:', error);
      this.errorMessage = String(error);
      this.loading = false;
    }
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CameraService } from '../../camera/services/camera.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gallery',
  standalone: true, // ✅ Asegurar que sea standalone
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  cameraService = inject(CameraService);
  photos: string[] = []; // Aquí guardaremos las fotos

  ngOnInit() {
    this.cameraService.photos$.subscribe((photos) => {
      console.log('Fotos actualizadas en la galería:', photos);
      this.photos = photos;
    });
  }
}

import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private photosSubject = new BehaviorSubject<string[]>([]);
  photos$ = this.photosSubject.asObservable();
  private readonly MAX_PHOTOS = 10; 

  constructor() {
    this.loadPhotos();
  }

  // 📸 Tomar foto y guardarla
  async takePicture(): Promise<void> {
    try {
      const image: Photo = await Camera.getPhoto({
        quality: 50,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,  // Asegura que devuelve una URL en base64 válida
        source: CameraSource.Camera
      });

      if (!image.dataUrl) {
        throw new Error('No se pudo obtener la imagen');
      }

      let currentPhotos = this.photosSubject.getValue();
      if (currentPhotos.length >= this.MAX_PHOTOS) {
        currentPhotos.shift(); // Elimina la más antigua si supera el límite
      }

      currentPhotos.push(image.dataUrl);
      this.photosSubject.next(currentPhotos);
      await Preferences.set({ key: 'photos', value: JSON.stringify(currentPhotos) });

    } catch (error) {
      console.error('❌ Error al tomar la foto:', error);
      throw error;
    }
  }

  // 🔄 Cargar imágenes guardadas
  async loadPhotos(): Promise<void> {
    try {
      const photosData = await Preferences.get({ key: 'photos' });
      const photoFiles = photosData.value ? JSON.parse(photosData.value) : [];
      this.photosSubject.next(photoFiles);
    } catch (error) {
      console.error('❌ Error cargando imágenes:', error);
      this.photosSubject.next([]);
    }
  }

  // 🗑 Borrar una imagen específica
  async deletePhoto(index: number): Promise<void> {
    try {
      let currentPhotos = this.photosSubject.getValue();
      currentPhotos.splice(index, 1);
      this.photosSubject.next(currentPhotos);
      await Preferences.set({ key: 'photos', value: JSON.stringify(currentPhotos) });

    } catch (error) {
      console.error(`❌ Error eliminando la foto ${index}:`, error);
    }
  }

  // 🔄 Limpiar todas las fotos
  async clearPhotos(): Promise<void> {
    try {
      await Preferences.remove({ key: 'photos' });
      this.photosSubject.next([]);
    } catch (error) {
      console.error('❌ Error limpiando fotos:', error);
    }
  }
}

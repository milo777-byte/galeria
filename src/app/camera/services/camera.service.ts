import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory, WriteFileResult } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private photosSubject = new BehaviorSubject<string[]>([]);
  photos$ = this.photosSubject.asObservable();
  private readonly MAX_PHOTOS = 10; // 🔴 Límite de imágenes para evitar QuotaExceededError

  constructor() {
    this.loadPhotos();
  }

  // 📷 Tomar una foto y guardarla
  async takePicture(): Promise<void> {
    try {
      const image: Photo = await Camera.getPhoto({
        quality: 50,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      if (!image.base64String) {
        throw new Error('No se pudo obtener la imagen en Base64');
      }

      const fileName = `photo_${new Date().getTime()}.jpeg`;
      const savedFile: WriteFileResult = await Filesystem.writeFile({
        path: fileName,
        data: image.base64String,
        directory: Directory.Data
      });

      // 🛑 Si el almacenamiento está lleno, borra la imagen más antigua
      let currentPhotos = this.photosSubject.getValue();
      if (currentPhotos.length >= this.MAX_PHOTOS) {
        await this.deletePhoto(0);
        currentPhotos = this.photosSubject.getValue(); // Recargar lista
      }

      // 📥 Guardar referencia del archivo
      currentPhotos.push(fileName);
      this.photosSubject.next(currentPhotos);
      await Preferences.set({ key: 'photos', value: JSON.stringify(currentPhotos) });

    } catch (error) {
      console.error('❌ Error al tomar la foto:', error);
      throw error;
    }
  }

  // 🔄 Cargar las fotos guardadas
  private async loadPhotos(): Promise<void> {
    try {
      const photosData = await Preferences.get({ key: 'photos' });
      const photoFiles = photosData.value ? JSON.parse(photosData.value) : [];

      const loadedPhotos: string[] = [];

      for (const fileName of photoFiles) {
        try {
          const file = await Filesystem.readFile({
            path: fileName,
            directory: Directory.Data
          });

          if (file.data) {
            // 📌 Asegurar formato correcto Base64
            loadedPhotos.push(`data:image/jpeg;base64,${file.data}`);
          }
        } catch (error) {
          console.error(`❌ Error leyendo la imagen ${fileName}:`, error);
        }
      }

      this.photosSubject.next(loadedPhotos);
    } catch (error) {
      console.error('❌ Error cargando imágenes:', error);
      this.photosSubject.next([]);
    }
  }

  // 🗑 Eliminar una imagen
  async deletePhoto(index: number): Promise<void> {
    try {
      const currentPhotos = this.photosSubject.getValue();
      const fileName = currentPhotos[index];

      await Filesystem.deleteFile({
        path: fileName,
        directory: Directory.Data
      });

      // 📉 Actualizar lista
      const updatedPhotos = currentPhotos.filter((_, i) => i !== index);
      this.photosSubject.next(updatedPhotos);
      await Preferences.set({ key: 'photos', value: JSON.stringify(updatedPhotos) });

    } catch (error) {
      console.error(`❌ Error eliminando la foto ${index}:`, error);
    }
  }
}

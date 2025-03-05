import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CameraComponent } from './Components/camera/camera.component';
import { GalleryComponent } from './Components/gallery/gallery.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CameraComponent, GalleryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'myapp';
}

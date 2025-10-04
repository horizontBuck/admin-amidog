import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminStore } from '../../stores/admin.store';

type Option =
  | 'dashboard'
  | 'clientes'
  | 'prestadores'
  | 'solicitudes'
  | 'finanzas'
  | 'notificaciones'
  | 'ajustes';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  providers: [AdminStore],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  store = inject(AdminStore);


  logout() {
    // Implementar lógica de cierre de sesión
    alert('Cerrar sesión');
  }

  setOption(opt: Option) {
    this.store.setOption(opt);
  }
}
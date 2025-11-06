import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../../../services/data.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-maintenance-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './maintenance-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintenanceListComponent {
  private dataService = inject(DataService);
  
  logs = toSignal(this.dataService.getMaintenanceLogs(), { initialValue: [] });
  filterType = signal<'all' | 'scheduled' | 'emergency'>('all');

  filteredLogs = computed(() => {
    const type = this.filterType();
    if (type === 'all') {
      return this.logs();
    }
    return this.logs().filter(log => log.type === type);
  });

  setFilter(type: 'all' | 'scheduled' | 'emergency') {
    this.filterType.set(type);
  }
}

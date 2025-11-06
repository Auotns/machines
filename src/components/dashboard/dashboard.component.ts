import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../../services/data.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private dataService = inject(DataService);

  // Expose Math for template
  Math = Math;

  // Current month string for display
  currentMonth = new Date().toLocaleDateString('sk-SK', { month: 'long', year: 'numeric' });

  devices = toSignal(this.dataService.loadDevices(), { initialValue: [] });
  parts = toSignal(this.dataService.getParts(), { initialValue: [] });
  logs = toSignal(this.dataService.getMaintenanceLogs(), {initialValue: [] });

  operationalDevices = computed(() => this.devices().filter(d => d.status === 'operational').length);
  maintenanceDevices = computed(() => this.devices().filter(d => d.status === 'maintenance').length);
  offlineDevices = computed(() => this.devices().filter(d => d.status === 'offline').length);
  
  lowStockParts = computed(() => this.parts().filter(p => p.quantity < p.minQuantity).length);

  // Celkový downtime zo všetkých zariadení
  totalDowntime = computed(() => {
    return this.devices().reduce((acc, device) => acc + device.downtime, 0).toFixed(1);
  });

  // Mesačný downtime z maintenance logs (aktuálny mesiac, len aktívne zariadenia)
  monthlyDowntime = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Získať ID aktívnych zariadení (operational alebo maintenance, vynechať offline)
    const activeDeviceIds = this.devices()
      .filter(d => d.status === 'operational' || d.status === 'maintenance')
      .map(d => d.id);
    
    // Filtrovať logy len z aktívnych zariadení v aktuálnom mesiaci
    const monthlyLogs = this.logs().filter(log => {
      const logDate = new Date(log.date);
      const isCurrentMonth = logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
      const isActiveDevice = activeDeviceIds.includes(log.deviceId);
      return isCurrentMonth && isActiveDevice;
    });
    
    const totalMinutes = monthlyLogs.reduce((acc, log) => acc + (log.durationMinutes || 0), 0);
    const totalHours = totalMinutes / 60;
    
    return {
      totalMinutes,
      totalHours: totalHours.toFixed(1),
      logsCount: monthlyLogs.length,
    };
  });

  // Výpočet downtime percentuálne (2.5% target z celkového pracovného času aktívnych strojov)
  downtimePercentage = computed(() => {
    const monthlyHours = parseFloat(this.monthlyDowntime().totalHours);
    
    // Spočítať pracovný čas len pre stroje v prevádzke alebo údržbe (vynechať offline)
    const activeDevices = this.devices().filter(d => d.status === 'operational' || d.status === 'maintenance');
    const workingHoursPerMonth = activeDevices.length * 160; // 160h na stroj (20 dní × 8h)
    
    const percentage = workingHoursPerMonth > 0 ? (monthlyHours / workingHoursPerMonth) * 100 : 0;
    const targetPercentage = 2.5;
    
    return {
      current: percentage.toFixed(2),
      target: targetPercentage.toFixed(1),
      isOverTarget: percentage > targetPercentage,
      workingHours: workingHoursPerMonth,
      activeDevicesCount: activeDevices.length,
    };
  });

  recentLogs = computed(() => this.logs().slice(0, 5));
}

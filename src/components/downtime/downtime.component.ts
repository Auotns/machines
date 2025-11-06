import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../../services/data.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-downtime',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './downtime.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DowntimeComponent {
  private dataService = inject(DataService);

  Math = Math;
  parseFloat = parseFloat;

  // Aktuálny dátum pre výber mesiaca
  private now = new Date();
  selectedYear = signal(this.now.getFullYear());
  selectedMonth = signal(this.now.getMonth());

  // Generovať mesiace pre dropdown (posledných 12 mesiacov)
  availableMonths = computed(() => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: date.toLocaleDateString('sk-SK', { month: 'long', year: 'numeric' }),
        value: `${date.getFullYear()}-${date.getMonth()}`
      });
    }
    
    return months;
  });

  // Aktuálny mesiac ako string pre zobrazenie
  currentMonthLabel = computed(() => {
    const date = new Date(this.selectedYear(), this.selectedMonth(), 1);
    return date.toLocaleDateString('sk-SK', { month: 'long', year: 'numeric' });
  });

  devices = toSignal(this.dataService.loadDevices(), { initialValue: [] });
  logs = toSignal(this.dataService.getMaintenanceLogs(), { initialValue: [] });

  // Metóda na zmenu vybratého mesiaca
  onMonthChange(value: string) {
    const [year, month] = value.split('-').map(Number);
    this.selectedYear.set(year);
    this.selectedMonth.set(month);
  }

  // Vypočítať downtime pre každý stroj samostatne (len aktívne zariadenia)
  deviceDowntimeStats = computed(() => {
    const currentMonth = this.selectedMonth();
    const currentYear = this.selectedYear();
    
    // Filtrovať len aktívne zariadenia (vynechať offline)
    const activeDevices = this.devices().filter(d => d.status === 'operational' || d.status === 'maintenance');
    
    console.log('📊 Computing downtime stats for devices:', activeDevices.length);
    console.log('📋 Total logs:', this.logs().length);
    console.log('📅 Selected period:', currentYear, '-', currentMonth + 1);
    
    return activeDevices.map(device => {
      // Nájsť všetky záznamy údržby pre tento stroj vo vybratom mesiaci
      const deviceLogs = this.logs().filter(log => {
        const logDate = new Date(log.date);
        return log.deviceId === device.id && 
               logDate.getMonth() === currentMonth && 
               logDate.getFullYear() === currentYear;
      });
      
      console.log(`Device ${device.name} (${device.id}):`, deviceLogs.length, 'logs found');

      // Spočítať celkový downtime
      const totalMinutes = deviceLogs.reduce((acc, log) => {
        console.log(`  Log ${log.id}: durationMinutes =`, log.durationMinutes);
        return acc + (log.durationMinutes || 0);
      }, 0);
      const totalHours = totalMinutes / 60;
      console.log(`  Total: ${totalMinutes} min = ${totalHours.toFixed(1)}h`);

      // Vypočítať percentá (160h pracovného času mesačne, 2.5% target = 4h)
      const workingHoursPerMonth = 160;
      const targetPercentage = 2.5;
      const targetHours = (workingHoursPerMonth * targetPercentage) / 100;
      const currentPercentage = (totalHours / workingHoursPerMonth) * 100;
      const isOverTarget = currentPercentage > targetPercentage;

      return {
        device,
        totalMinutes,
        totalHours: totalHours.toFixed(1),
        logsCount: deviceLogs.length,
        workingHours: workingHoursPerMonth,
        currentPercentage: currentPercentage.toFixed(2),
        targetPercentage: targetPercentage.toFixed(1),
        targetHours: targetHours.toFixed(1),
        isOverTarget,
        scheduledCount: deviceLogs.filter(l => l.type === 'scheduled').length,
        emergencyCount: deviceLogs.filter(l => l.type === 'emergency').length,
      };
    });
  });

  // Celkový prehľad
  totalStats = computed(() => {
    const stats = this.deviceDowntimeStats();
    const totalHours = stats.reduce((acc, s) => acc + parseFloat(s.totalHours), 0);
    const totalDevices = stats.length;
    const devicesOverTarget = stats.filter(s => s.isOverTarget).length;
    const totalLogs = stats.reduce((acc, s) => acc + s.logsCount, 0);

    return {
      totalHours: totalHours.toFixed(1),
      totalDevices,
      devicesOverTarget,
      devicesInTarget: totalDevices - devicesOverTarget,
      totalLogs,
      averagePercentage: totalDevices > 0 ? (stats.reduce((acc, s) => acc + parseFloat(s.currentPercentage), 0) / totalDevices).toFixed(2) : '0.00',
    };
  });

  getStatusClass(isOverTarget: boolean): string {
    return isOverTarget ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  }

  getProgressBarColor(isOverTarget: boolean): string {
    return isOverTarget ? 'bg-red-500' : 'bg-green-500';
  }
}

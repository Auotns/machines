import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { ExportService } from '../../../services/export.service';
import { SanitizerService } from '../../../core/services/sanitizer.service';
import { Device } from '../../../models';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './device-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceListComponent {
  private dataService = inject(DataService);
  private exportService = inject(ExportService);
  private sanitizer = inject(SanitizerService);
  
  devices = this.dataService.getDevicesSignal();
  searchTerm = signal('');
  showAddForm = signal(false);
  specificationFields = signal<{key: string, value: string}[]>([]);

  constructor() {
    // Načítať zariadenia pri inicializácii
    this.dataService.loadDevices().subscribe();
  }
  
  addSpecificationField() {
    this.specificationFields.update(fields => [...fields, {key: '', value: ''}]);
  }
  
  removeSpecificationField(index: number) {
    this.specificationFields.update(fields => fields.filter((_, i) => i !== index));
  }
  
  updateSpecificationKey(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    this.specificationFields.update(fields => {
      const newFields = [...fields];
      newFields[index] = {...newFields[index], key: input.value};
      return newFields;
    });
  }
  
  updateSpecificationValue(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    this.specificationFields.update(fields => {
      const newFields = [...fields];
      newFields[index] = {...newFields[index], value: input.value};
      return newFields;
    });
  }

  filteredDevices = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.devices();
    }
    return this.devices().filter(device => 
      device.name.toLowerCase().includes(term) ||
      device.type.toLowerCase().includes(term) ||
      device.location.toLowerCase().includes(term)
    );
  });
  
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  getStatusClass(status: Device['status']): string {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  toggleAddForm() {
    this.showAddForm.update(v => !v);
  }

  addDevice(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      // Sanitize and validate all inputs
      const customId = this.sanitizer.sanitizeSku(formData.get('customId') as string);
      
      // Kontrola či ID už neexistuje
      const existingDevice = this.devices().find(d => d.id === customId);
      if (existingDevice) {
        alert(`Zariadenie s ID "${customId}" už existuje! Použite iné ID.`);
        return;
      }

      const imageFile = formData.get('deviceImage') as File;
      
      // Validácia fotky
      if (imageFile && imageFile.size > 0) {
        if (imageFile.size > 5 * 1024 * 1024) {
          alert('Fotka je príliš veľká! Maximálna veľkosť je 5 MB.');
          return;
        }
        if (!imageFile.type.startsWith('image/')) {
          alert('Neplatný formát súboru! Nahrajte obrázok (JPG, PNG, WebP).');
          return;
        }
      }

      // Sanitize form data
      const name = this.sanitizer.sanitizeName(formData.get('name') as string);
      const type = this.sanitizer.sanitizeName(formData.get('type') as string);
      const manufacturer = formData.get('manufacturer') ? 
        this.sanitizer.sanitizeName(formData.get('manufacturer') as string) : undefined;
      const location = this.sanitizer.sanitizeName(formData.get('location') as string);
      const status = this.sanitizer.sanitizeDeviceStatus(formData.get('status') as string);
      const manualUrl = formData.get('manualUrl') ? 
        this.sanitizer.sanitizeUrl(formData.get('manualUrl') as string) : undefined;
      const lastMaintenance = this.sanitizer.sanitizeDate(formData.get('lastMaintenance') as string);
      const maintenancePeriod = formData.get('maintenancePeriod') as Device['maintenancePeriod'];
      
      // Automaticky vypočítať nextMaintenance na základe maintenancePeriod
      let nextMaintenance = formData.get('nextMaintenance') as string;
      if (lastMaintenance && maintenancePeriod) {
        const lastDate = new Date(lastMaintenance);
        const nextDate = new Date(lastDate);
        
        switch (maintenancePeriod) {
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case 'quarterly':
            nextDate.setMonth(nextDate.getMonth() + 3);
            break;
          case 'semi-annually':
            nextDate.setMonth(nextDate.getMonth() + 6);
            break;
          case 'annually':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        }
        
        nextMaintenance = nextDate.toISOString().split('T')[0];
      }
      nextMaintenance = this.sanitizer.sanitizeDate(nextMaintenance);

      // Spracovať špecifikácie
      const specifications: Record<string, string | number> = {};
      this.specificationFields().forEach(spec => {
        if (spec.key.trim()) {
          const trimmedValue = spec.value.trim();
          // Konvertovať na číslo iba ak hodnota obsahuje VÝHRADNE číslice a desatinnú bodku/čiarku
          const numValue = parseFloat(trimmedValue.replace(',', '.'));
          const isOnlyNumber = /^-?\d+([.,]\d+)?$/.test(trimmedValue);
          
          specifications[spec.key.trim()] = isOnlyNumber && !isNaN(numValue)
            ? numValue 
            : trimmedValue;
        }
      });
      const sanitizedSpecs = this.sanitizer.sanitizeSpecifications(specifications);

      const newDevice = {
        id: customId,
        name: name,
        type: type,
        manufacturer: manufacturer,
        location: location,
        status: status,
        manualUrl: manualUrl,
        lastMaintenance: lastMaintenance,
        nextMaintenance: nextMaintenance,
        maintenancePeriod: maintenancePeriod || undefined,
        specifications: Object.keys(sanitizedSpecs).length > 0 ? sanitizedSpecs : undefined,
        downtime: 0,
        lastStatusChange: new Date().toISOString(),
      };

      console.log('Adding new device with custom ID:', newDevice);
      
      this.dataService.addDevice(newDevice).subscribe({
        next: (addedDevice) => {
          console.log('✅ Device successfully added:', addedDevice);
          
          // Ak je fotka, nahrať ju
          if (imageFile && imageFile.size > 0) {
            console.log('📤 Uploading device image...');
            this.dataService.uploadDeviceImage(addedDevice.id, imageFile).subscribe({
              next: (imageUrl) => {
                console.log('✅ Image uploaded successfully:', imageUrl);
                form.reset();
                this.showAddForm.set(false);
                alert(`Zariadenie "${addedDevice.name}" bolo úspešne pridané s fotkou!`);
              },
              error: (err) => {
                console.error('❌ Error uploading image:', err);
                form.reset();
                this.showAddForm.set(false);
                alert(`Zariadenie "${addedDevice.name}" bolo pridané, ale fotka sa nepodarila nahrať: ${err.message}`);
              }
            });
          } else {
            form.reset();
            this.showAddForm.set(false);
            this.specificationFields.set([]); // Vyčistiť špecifikácie
            alert(`Zariadenie "${addedDevice.name}" bolo úspešne pridané!`);
          }
        },
        error: (err) => {
          console.error('❌ Error adding device:', err);
          alert(`Chyba pri pridávaní zariadenia: ${err.message}`);
        }
      });
    } catch (error: any) {
      alert(`Chyba validcie: ${error.message}`);
    }
  }

  exportDevices() {
    const devices = this.devices();
    
    if (devices.length === 0) {
      alert('Nie sú žiadne zariadenia na export.');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `zariadenia-export-${timestamp}.csv`;
    
    console.log(`📤 Exporting ${devices.length} devices to ${filename}`);
    this.exportService.exportDevicesToCsv(devices, filename);
    
    alert(`Úspešne exportovaných ${devices.length} zariadení do súboru ${filename}`);
  }
}

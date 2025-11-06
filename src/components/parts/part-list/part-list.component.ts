import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-part-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './part-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartListComponent {
  private dataService = inject(DataService);
  authService = inject(AuthService);
  
  // Use the signal directly from DataService that gets updated
  parts = computed(() => this.dataService.getPartsSignal()());
  devices = computed(() => this.dataService.getDevicesSignal()());
  searchTerm = signal('');
  showAddForm = signal(false);
  partsWithHistory = signal<any[]>([]);
  stockFilter = signal<'all' | 'below-min' | 'low' | 'ok'>('all');

  constructor() {
    // Load parts and devices on init
    this.dataService.getParts().subscribe(() => {
      // Po načítaní dielov načítaj históriu pre každý
      this.loadPartsHistory();
    });
    this.dataService.loadDevices().subscribe();
  }

  private loadPartsHistory() {
    const parts = this.parts();
    const partsWithHistory: any[] = [];
    
    parts.forEach(part => {
      this.dataService.getPartLastChange(part.id).subscribe(history => {
        partsWithHistory.push({
          ...part,
          lastChange: history ? {
            date: history.created_at,
            changedBy: history.changed_by,
            notes: history.notes,
            changeType: history.change_type,
            quantityBefore: history.quantity_before,
            quantityAfter: history.quantity_after,
          } : undefined
        });
        
        if (partsWithHistory.length === parts.length) {
          this.partsWithHistory.set(partsWithHistory);
        }
      });
    });
  }

  filteredParts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const filter = this.stockFilter();
    const partsToFilter = this.partsWithHistory().length > 0 ? this.partsWithHistory() : this.parts();
    
    let filtered = partsToFilter;
    
    // Apply stock filter
    if (filter === 'below-min') {
      filtered = filtered.filter((part: any) => part.quantity < part.minQuantity);
    } else if (filter === 'low') {
      filtered = filtered.filter((part: any) => 
        part.quantity >= part.minQuantity && part.quantity < part.minQuantity * 1.5
      );
    } else if (filter === 'ok') {
      filtered = filtered.filter((part: any) => part.quantity >= part.minQuantity * 1.5);
    }
    
    // Apply search term
    if (term) {
      filtered = filtered.filter((part: any) => 
        part.name.toLowerCase().includes(term) ||
        part.sku.toLowerCase().includes(term) ||
        part.location.toLowerCase().includes(term) ||
        (part.deviceName && part.deviceName.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  });
  
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  onFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.stockFilter.set(select.value as any);
  }

  getQuantityClass(quantity: number, minQuantity: number = 10): string {
    if (quantity < minQuantity) return 'text-red-600 font-bold';
    if (quantity < minQuantity * 1.5) return 'text-yellow-600';
    return 'text-gray-800';
  }

  toggleAddForm() {
    this.showAddForm.update(v => !v);
  }

  increaseQuantity(partId: string, currentQuantity: number) {
    const notes = prompt('Dôvod zvýšenia množstva (POVINNÉ - napr. nákup, dodávka):');
    if (!notes || notes.trim() === '') {
      alert('Poznámka je povinná pri zvýšení množstva');
      return;
    }
    
    console.log('➕ Increasing quantity for part:', partId);
    this.dataService.updatePartQuantity(partId, currentQuantity + 1, notes, 'increase').subscribe({
      next: (updatedPart) => {
        console.log('✅ Quantity increased:', updatedPart);
        // Reload history after change
        setTimeout(() => this.loadPartsHistory(), 500);
      },
      error: (err) => {
        console.error('❌ Error increasing quantity:', err);
        alert('Error updating quantity: ' + err.message);
      }
    });
  }

  decreaseQuantity(partId: string, currentQuantity: number) {
    if (currentQuantity <= 0) {
      alert('Množstvo nemôže byť záporné');
      return;
    }
    
    const notes = prompt('Dôvod zníženia množstva (POVINNÉ - napr. použité pri oprave CNC Fréza):');
    if (!notes || notes.trim() === '') {
      alert('Poznámka je povinná pri znížení množstva');
      return;
    }
    
    console.log('➖ Decreasing quantity for part:', partId);
    this.dataService.updatePartQuantity(partId, currentQuantity - 1, notes, 'decrease').subscribe({
      next: (updatedPart) => {
        console.log('✅ Quantity decreased:', updatedPart);
        // Reload history after change
        setTimeout(() => this.loadPartsHistory(), 500);
      },
      error: (err) => {
        console.error('❌ Error decreasing quantity:', err);
        alert('Error updating quantity: ' + err.message);
      }
    });
  }

  setQuantity(partId: string, currentQuantity: number) {
    const input = prompt('Zadajte nové množstvo:');
    if (input === null) return;
    
    const quantity = parseInt(input);
    if (isNaN(quantity) || quantity < 0) {
      alert('Zadajte platné kladné číslo');
      return;
    }

    const notes = prompt('Dôvod zmeny množstva (POVINNÉ - napr. inventúra, korekcia):');
    if (!notes || notes.trim() === '') {
      alert('Poznámka je povinná pri zmene množstva');
      return;
    }
    
    console.log('✏️ Setting quantity for part:', partId, 'to', quantity);
    this.dataService.updatePartQuantity(partId, quantity, notes, 'set').subscribe({
      next: (updatedPart) => {
        console.log('✅ Quantity set:', updatedPart);
        // Reload history after change
        setTimeout(() => this.loadPartsHistory(), 500);
      },
      error: (err) => {
        console.error('❌ Error setting quantity:', err);
        alert('Error updating quantity: ' + err.message);
      }
    });
  }

  addPart(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const deviceId = formData.get('deviceId') as string;
    const selectedDevice = deviceId ? this.devices().find(d => d.id === deviceId) : undefined;
    
    const newPart = {
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      quantity: parseInt(formData.get('quantity') as string),
      minQuantity: parseInt(formData.get('minQuantity') as string) || 10,
      location: formData.get('location') as string,
      deviceId: deviceId || undefined,
      deviceName: selectedDevice?.name || undefined,
    };

    console.log('🔄 Adding new part:', newPart);
    
    this.dataService.addPart(newPart).subscribe({
      next: (addedPart) => {
        console.log('✅ Part added successfully:', addedPart);
        this.showAddForm.set(false);
        form.reset();
        // Explicitne znovu načítať zoznam dielov a ich históriu
        this.dataService.getParts().subscribe(() => {
          console.log('🔄 Parts list refreshed after adding new part');
          this.loadPartsHistory();
        });
      },
      error: (err) => {
        console.error('❌ Error adding part:', err);
        alert('Error adding part: ' + err.message);
      }
    });
  }

  deletePart(partId: string, partName: string) {
    const confirmMessage = `Naozaj chcete vymazať náhradný diel "${partName}"?\n\nTáto akcia sa nedá vrátiť späť a vymaže aj všetku históriu zmien tohto dielu.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    console.log('🗑️ Deleting part:', partId);
    
    this.dataService.deletePart(partId).subscribe({
      next: () => {
        console.log('✅ Part deleted successfully');
        alert(`Náhradný diel "${partName}" bol úspešne vymazaný.`);
        // Explicitne znovu načítať zoznam dielov a ich históriu
        this.dataService.getParts().subscribe(() => {
          console.log('🔄 Parts list refreshed after deletion');
          this.loadPartsHistory();
        });
      },
      error: (err) => {
        console.error('❌ Error deleting part:', err);
        alert(`Chyba pri vymazávaní dielu: ${err.message}`);
      }
    });
  }
}

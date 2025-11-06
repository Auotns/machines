import { Injectable } from '@angular/core';
import { Device } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * Export devices to CSV file
   */
  exportDevicesToCsv(devices: Device[], filename: string = 'devices-export.csv'): void {
    if (!devices || devices.length === 0) {
      console.warn('No devices to export');
      return;
    }

    // CSV header
    const headers = [
      'ID zariadenia',
      'Názov',
      'Typ',
      'Umiestnenie',
      'Výrobca',
      'Stav',
      'Špecifikácie'
    ];

    // Convert devices to CSV rows
    const rows = devices.map(device => {
      // Format specifications as readable string
      let specificationsStr = '';
      if (device.specifications) {
        specificationsStr = Object.entries(device.specifications)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; ');
      }

      return [
        this.escapeCSV(device.id),
        this.escapeCSV(device.name),
        this.escapeCSV(device.type),
        this.escapeCSV(device.location),
        this.escapeCSV(device.manufacturer || '-'),
        this.escapeCSV(this.getStatusLabel(device.status)),
        this.escapeCSV(specificationsStr || '-')
      ];
    });

    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create download link and trigger download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`✅ Exported ${devices.length} devices to ${filename}`);
  }

  /**
   * Escape CSV special characters
   */
  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Get human-readable status label
   */
  private getStatusLabel(status: Device['status']): string {
    switch (status) {
      case 'operational': return 'V prevádzke';
      case 'maintenance': return 'V údržbe';
      case 'offline': return 'Mimo prevádzky';
      default: return status;
    }
  }
}

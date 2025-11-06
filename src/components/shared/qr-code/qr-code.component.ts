import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-2 bg-white inline-block rounded-lg shadow-inner">
      <img 
        [src]="qrCodeUrl()" 
        alt="QR Code" 
        class="w-40 h-40"
        style="image-rendering: pixelated;"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrCodeComponent {
  data = input.required<string>();

  constructor(private sanitizer: DomSanitizer) {
    console.log('🔲 QR Code component initialized');
  }

  qrCodeUrl = computed(() => {
    const text = encodeURIComponent(this.data());
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${text}`;
    console.log('📊 Generated QR code URL:', url);
    return this.sanitizer.bypassSecurityTrustUrl(url);
  });
}

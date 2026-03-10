import { AfterViewInit, Component, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


import { WorldBankService, CountryInfo } from '../world-bank.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

 
  svgContent: SafeHtml = '';
  selectedCode = '';
  selectedCountry: CountryInfo | null = null;
  errorMsg = '';

 
  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private elRef: ElementRef,
    private wb: WorldBankService   
  ) {}

 
  ngAfterViewInit(): void {
    this.http.get('assets/world.svg', { responseType: 'text' }).subscribe(svg => {
      this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svg);
      setTimeout(() => this.attachSvgEvents(), 0);
    });
  }

  
  private attachSvgEvents(): void {
  const svg = this.elRef.nativeElement.querySelector('.map svg') as SVGSVGElement | null;
  if (!svg) return;

  const paths = svg.querySelectorAll('path') as NodeListOf<SVGPathElement>;

  paths.forEach((el: SVGPathElement, index: number) => {
  const code = el.getAttribute('id');
  if (!code) return;

  el.classList.add('country');

  // assign each country a stable hover color once
  const hoverColor = this.getHoverColorForIndex(index);
  (el as any).dataset.hoverColor = hoverColor;

  el.addEventListener('mouseenter', () => {
    el.classList.add('hover');

    // Only apply hover color if not selected
    if (!el.classList.contains('selected')) {
      el.style.fill = (el as any).dataset.hoverColor;
    }
  });

  el.addEventListener('mouseleave', () => {
    el.classList.remove('hover');

    // Restore default green if not selected
    if (!el.classList.contains('selected')) {
      el.style.fill = '';
    }
  });

  el.addEventListener('click', () => {
    // remove previous selection
    const prev = svg.querySelector('.country.selected') as SVGElement | null;
    prev?.classList.remove('selected');
    if (prev) (prev as SVGElement).setAttribute('style', ''); // clears previous inline fill

    // select this
    el.classList.add('selected');

    const iso2 = code.toUpperCase();
    this.selectedCode = iso2;
    this.loadCountry(iso2);
  });
});

  }

 private getHoverColorForIndex(index: number): string {
  
  const palette = [
    '#63b3ed', '#68d391', '#fc8181', '#f6ad55', '#b794f4',
    '#f687b3', '#4fd1c5', '#fbd38d', '#90cdf4', '#9ae6b4',
    '#feb2b2', '#d6bcfa'
  ];

  return palette[index % palette.length];
}

  
  loadCountry(code2: string): void {
    this.errorMsg = '';
    this.selectedCountry = null;

    this.wb.getCountryByCode(code2).subscribe({
      next: (data) => (this.selectedCountry = data),
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Could not load country details. Try another country.';
      }
    });
  }
}

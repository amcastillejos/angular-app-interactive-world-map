import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface CountryInfo {
  code2: string;          
  name: string;           
  capital: string;        
  region: string;         
  incomeLevel: string;    
  latitude: string;      
  longitude: string;      
}

@Injectable({ providedIn: 'root' })
export class WorldBankService {
  private baseUrl = 'https://api.worldbank.org/v2/country';

  constructor(private http: HttpClient) {}

  
  getCountryByCode(code2: string): Observable<CountryInfo> {
    const url = `${this.baseUrl}/${encodeURIComponent(code2)}?format=json`;

    return this.http.get<any>(url).pipe(
      map((resp) => {
        
        const country = resp?.[1]?.[0];
        if (!country) {
          throw new Error('No country data returned from World Bank API.');
        }

        return {
          code2: (country.iso2Code || code2).toUpperCase(),
          name: country.name || '—',
          capital: country.capitalCity || '—',
          region: country.region?.value || '—',
          incomeLevel: country.incomeLevel?.value || '—',
          latitude: country.latitude || '—',
          longitude: country.longitude || '—'
        } as CountryInfo;
      })
    );
  }
}

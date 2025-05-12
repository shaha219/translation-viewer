import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, tap, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private translations: Record<string, any> = {};
  private readonly languages = ['en', 'de', 'fr', 'it'];

  constructor(private readonly http: HttpClient) {}

  loadAll(): Observable<any> {
    const loaders = this.languages.map(lang =>
      this.http.get(`assets/i18n/${lang}.json`).pipe(
        map(data => ({ lang, data }))
      )
    );
    return forkJoin(loaders).pipe(
      tap(results => {
        results.forEach(({ lang, data }) => {
          this.translations[lang] = data;
        });
      })
    );
  }

  getAllTranslations() {
    return this.translations;
  }

  getLanguages() {
    return this.languages;
  }

  getKeys(): string[] {
    return Object.keys(this.translations['en'] ?? {});
  }

  getTranslationByKey(key: string): Record<string, string> {
    const result: Record<string, string> = {};
    for (let lang of this.languages) {
      result[lang] = this.translations[lang][key] ?? '';
    }
    return result;
  }
}

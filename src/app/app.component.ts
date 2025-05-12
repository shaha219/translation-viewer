import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from './translation.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Translation Viewer';
  view: 'table' | 'single' = 'table';
  loaded = false;

  languages: string[] = [];
  translations: Record<string, any> = {};
  keys: string[] = ['key1', 'key2', 'key3', 'key4', 'key5'];

  currentIndex = 0;
  currentKey: string = this.keys[this.currentIndex];
  currentTranslations: Record<string, string> = {};

  tooltipMessage: string = '';
  tooltipTimeout: any = null;
  copiedEntries: { [lang: string]: { [key: string]: string } } = {};

  keyNumberInput: number | null = null;  // User input for key number
  keySearchInput: string = '';  // User input for key search  

  constructor(private readonly translationService: TranslationService) { }

  ngOnInit(): void {
    this.translationService.loadAll().subscribe(() => {
      this.languages = this.translationService.getLanguages();
      this.translations = this.translationService.getAllTranslations();
      this.keys = this.translationService.getKeys();

      const stored = localStorage.getItem('copiedEntries');
      if (stored) {
        this.copiedEntries = JSON.parse(stored);
      }

      this.updateCurrentKey();
      this.loaded = true;
    });
  }

  updateCurrentKey() {
    this.currentKey = this.keys[this.currentIndex];
    this.currentTranslations = this.translationService.getTranslationByKey(this.currentKey);
  }

  next() {
    if (this.currentIndex < this.keys.length - 1) {
      this.onInputChange('nextPrev')
      this.currentIndex++;
      this.updateCurrentKey();
    }
  }
  
  prev() {
    if (this.currentIndex > 0) {
      this.onInputChange('nextPrev')
      this.currentIndex--;
      this.updateCurrentKey();
    }
  }

  copyTextWithContext(lang: string, key: string, value: string) {
    const message = `[${lang.toUpperCase()}] ${key}: ${value}`;
    const existing = JSON.parse(localStorage.getItem('copiedEntries') || '{}');
    if (existing[lang]?.[key]) {
      this.showTooltip(`Already copied: [${lang.toUpperCase()}] ${key}`);
      return;
    }
    if (!existing[lang]) existing[lang] = {};
    existing[lang][key] = value;
    localStorage.setItem('copiedEntries', JSON.stringify(existing));
    this.copiedEntries = existing;

    navigator.clipboard.writeText(value).then(() => {
      this.showTooltip(`Copied: ${message}`);
    }).catch(err => {
      console.error('Clipboard copy failed', err);
    });
  }

  // Tooltip for feedback
  showTooltip(message: string) {
    console.log(message);
    this.tooltipMessage = message;
    clearTimeout(this.tooltipTimeout);
    this.tooltipTimeout = setTimeout(() => {
      this.tooltipMessage = '';
    }, 2000); // Tooltip disappears after 2 seconds
  }

  // Navigate to key by number
  goToKeyByNumber() {
    if (this.keyNumberInput && this.keyNumberInput >= 1 && this.keyNumberInput <= this.keys.length) {
      this.currentIndex = this.keyNumberInput - 1;  // Adjust for zero-indexed array
      this.updateCurrentKey();
    } else {
      this.showTooltip('Invalid key number!');
    }
  }

  // Search for a key
  searchForKey() {
    const foundIndex = this.keys.findIndex(key => key.toLowerCase().includes(this.keySearchInput.toLowerCase()));
    if (foundIndex !== -1) {
      this.currentIndex = foundIndex;
      this.updateCurrentKey();
    }
  }

  // Handle input change for both fields
  onInputChange(inputType: 'number' | 'search' | 'nextPrev') {
    if (inputType === 'number') {
      this.keySearchInput = '';
      this.goToKeyByNumber();
    } else if (inputType === 'search') {
      this.keyNumberInput = null;
      this.searchForKey()
    } else if (inputType === 'nextPrev'){
      this.keySearchInput = '';
      this.keyNumberInput = null;
    }
  }
}

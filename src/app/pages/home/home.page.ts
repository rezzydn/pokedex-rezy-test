import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { search, alertCircleOutline } from 'ionicons/icons';

import { PokemonService } from '../../services/pokemon.service';
import { PokemonListItem } from '../../models/pokemon.model';
import { PokemonCardComponent } from '../../components/pokemon-card/pokemon-card.component';
import { TypeFilterComponent } from '../../components/type-filter/type-filter.component';

const PAGE_SIZE = 24;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSpinner,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    PokemonCardComponent,
    TypeFilterComponent,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage implements OnInit {
  allLoaded: PokemonListItem[] = [];
  displayed: PokemonListItem[] = [];
  searchTerm = '';
  selectedType: string | null = null;

  loading = true;
  loadError = false;
  private nextOffset = 0;
  private hasMore = true;

  constructor(
    private readonly pokemonService: PokemonService,
    private readonly router: Router,
  ) {
    addIcons({ search, alertCircleOutline });
  }

  ngOnInit(): void {
    this.loadFirstPage();
  }

  onTypeSelected(type: string | null): void {
    this.selectedType = type;
    this.searchTerm = '';
    if (type) {
      this.loadByType(type);
    } else {
      this.resetToDefaultBrowsing();
    }
  }

  onSearchChange(term: string): void {
    this.searchTerm = term.trim().toLowerCase();
    this.applySearchFilter();
  }

  onCardOpen(pokemon: PokemonListItem): void {
    this.router.navigate(['/pokemon', pokemon.id]);
  }

  loadMore(event: Event): void {
    if (this.selectedType || !this.hasMore) {
      (event as InfiniteScrollCustomEvent).target.complete();
      return;
    }
    this.pokemonService.getPokemonPage(this.nextOffset, PAGE_SIZE).subscribe({
      next: (page) => {
        this.allLoaded = [...this.allLoaded, ...page.items];
        this.nextOffset = page.nextOffset;
        this.hasMore = page.hasMore;
        this.applySearchFilter();
        (event as InfiniteScrollCustomEvent).target.complete();
      },
      error: () => {
        (event as InfiniteScrollCustomEvent).target.complete();
      },
    });
  }

  refresh(event: Event): void {
    this.resetToDefaultBrowsing(() => (event as RefresherCustomEvent).target.complete());
  }

  private loadFirstPage(): void {
    this.loading = true;
    this.loadError = false;
    this.pokemonService.getPokemonPage(0, PAGE_SIZE).subscribe({
      next: (page) => {
        this.allLoaded = page.items;
        this.nextOffset = page.nextOffset;
        this.hasMore = page.hasMore;
        this.loading = false;
        this.applySearchFilter();
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      },
    });
  }

  private loadByType(type: string): void {
    this.loading = true;
    this.loadError = false;
    this.pokemonService.getPokemonByType(type).subscribe({
      next: (items) => {
        this.allLoaded = items;
        this.loading = false;
        this.applySearchFilter();
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      },
    });
  }

  private resetToDefaultBrowsing(done?: () => void): void {
    this.selectedType = null;
    this.searchTerm = '';
    this.nextOffset = 0;
    this.hasMore = true;
    this.allLoaded = [];
    this.loading = true;
    this.loadError = false;
    this.pokemonService.getPokemonPage(0, PAGE_SIZE).subscribe({
      next: (page) => {
        this.allLoaded = page.items;
        this.nextOffset = page.nextOffset;
        this.hasMore = page.hasMore;
        this.loading = false;
        this.applySearchFilter();
        done?.();
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
        done?.();
      },
    });
  }

  private applySearchFilter(): void {
    this.displayed = this.searchTerm
      ? this.allLoaded.filter((p) => p.name.includes(this.searchTerm))
      : this.allLoaded;
  }
}

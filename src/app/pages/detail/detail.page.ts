import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonContent, IonBackButton, IonIcon, IonImg, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline, alertCircleOutline } from 'ionicons/icons';
import { Observable } from 'rxjs';

import { PokemonService } from '../../services/pokemon.service';
import { FavoritesService } from '../../services/favorites.service';
import { PokemonDetail } from '../../models/pokemon.model';

const MAX_STAT_VALUE = 180;

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonContent,
    IonBackButton,
    IonIcon,
    IonImg,
    IonSpinner,
  ],
  templateUrl: './detail.page.html',
  styleUrl: './detail.page.scss',
})
export class DetailPage implements OnInit {
  pokemon: PokemonDetail | null = null;
  loading = true;
  loadError = false;
  isFavorite$!: Observable<boolean>;

  readonly maxStat = MAX_STAT_VALUE;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly pokemonService: PokemonService,
    private readonly favoritesService: FavoritesService,
  ) {
    addIcons({ heart, heartOutline, alertCircleOutline });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      this.loadError = true;
      return;
    }

    this.pokemonService.getPokemonDetail(id).subscribe({
      next: (detail) => {
        this.pokemon = detail;
        this.isFavorite$ = this.favoritesService.isFavorite$(detail.id);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      },
    });
  }

  toggleFavorite(): void {
    if (!this.pokemon) return;
    this.favoritesService.toggle({
      id: this.pokemon.id,
      name: this.pokemon.name,
      imageUrl: this.pokemon.artworkUrl,
    });
  }

  typeColorVar(type: string): string {
    return `var(--type-${type}, #a8a878)`;
  }
}

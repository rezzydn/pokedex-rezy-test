import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonImg, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { PokemonListItem } from '../../models/pokemon.model';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule, IonImg, IonIcon],
  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.scss',
})
export class PokemonCardComponent implements OnInit {
  @Input({ required: true }) pokemon!: PokemonListItem;
  @Output() open = new EventEmitter<PokemonListItem>();

  isFavorite$!: Observable<boolean>;

  private static readonly PALETTE = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
    'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
  ];

  constructor(private readonly favoritesService: FavoritesService) {
    addIcons({ heart, heartOutline });
  }

  ngOnInit(): void {
    this.isFavorite$ = this.favoritesService.isFavorite$(this.pokemon.id);
  }

  get plateTint(): string {
    const key = PokemonCardComponent.PALETTE[this.pokemon.id % PokemonCardComponent.PALETTE.length];
    return `color-mix(in srgb, var(--type-${key}) 16%, var(--color-paper-raised))`;
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    this.favoritesService.toggle(this.pokemon);
  }
}

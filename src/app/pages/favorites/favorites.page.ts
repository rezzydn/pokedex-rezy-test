import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonHeader, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heartDislikeOutline } from 'ionicons/icons';
import { Observable } from 'rxjs';

import { FavoritesService } from '../../services/favorites.service';
import { PokemonListItem } from '../../models/pokemon.model';
import { PokemonCardComponent } from '../../components/pokemon-card/pokemon-card.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, IonHeader, IonContent, IonIcon, PokemonCardComponent],
  templateUrl: './favorites.page.html',
  styleUrl: './favorites.page.scss',
})
export class FavoritesPage implements OnInit {
  favorites$!: Observable<PokemonListItem[]>;

  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly router: Router,
  ) {
    addIcons({ heartDislikeOutline });
  }

  async ngOnInit(): Promise<void> {
    await this.favoritesService.ready();
    this.favorites$ = this.favoritesService.all$;
  }

  onCardOpen(pokemon: PokemonListItem): void {
    this.router.navigate(['/pokemon', pokemon.id]);
  }
}

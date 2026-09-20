import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonSkeletonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';
import { PokemonService } from '../../services/pokemon.service';

@Component({
  selector: 'app-type-filter',
  standalone: true,
  imports: [CommonModule, IonIcon, IonSkeletonText],
  templateUrl: './type-filter.component.html',
  styleUrl: './type-filter.component.scss',
})
export class TypeFilterComponent implements OnInit {
  @Input() selectedType: string | null = null;
  @Output() typeSelected = new EventEmitter<string | null>();

  types: string[] = [];
  loading = true;

  constructor(private readonly pokemonService: PokemonService) {
    addIcons({ closeCircle });
  }

  ngOnInit(): void {
    this.pokemonService.getTypeList().subscribe({
      next: (types) => {
        this.types = types;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  select(type: string): void {
    this.typeSelected.emit(this.selectedType === type ? null : type);
  }
}

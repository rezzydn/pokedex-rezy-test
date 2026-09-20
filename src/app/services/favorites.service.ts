import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PokemonListItem } from '../models/pokemon.model';

const STORAGE_KEY = 'pokedex.favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly favorites$ = new BehaviorSubject<PokemonListItem[]>([]);
  private loaded = false;
  private loadPromise: Promise<void> | null = null;
  private activeToast: HTMLIonToastElement | null = null;

  readonly all$: Observable<PokemonListItem[]> = this.favorites$.asObservable();

  constructor(private readonly toastController: ToastController) {
    addIcons({ heart, heartOutline });
  }

  async ready(): Promise<void> {
    if (this.loaded) return;
    if (!this.loadPromise) {
      this.loadPromise = this.load();
    }
    return this.loadPromise;
  }

  isFavorite$(id: number): Observable<boolean> {
    return this.favorites$.pipe(map((list) => list.some((p) => p.id === id)));
  }

  async toggle(pokemon: PokemonListItem): Promise<void> {
    await this.ready();
    const current = this.favorites$.value;
    const exists = current.some((p) => p.id === pokemon.id);
    const next = exists ? current.filter((p) => p.id !== pokemon.id) : [...current, pokemon];
    this.favorites$.next(next);
    await this.persist(next);
    await this.notify(pokemon.name, !exists);
  }

  private async load(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEY });
      const parsed: PokemonListItem[] = value ? JSON.parse(value) : [];
      this.favorites$.next(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      console.warn('FavoritesService: failed to load favorites, starting empty.', err);
      this.favorites$.next([]);
    } finally {
      this.loaded = true;
    }
  }

  private async persist(list: PokemonListItem[]): Promise<void> {
    try {
      await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(list) });
    } catch (err) {
      console.warn('FavoritesService: failed to persist favorites.', err);
    }
  }

  private async notify(name: string, added: boolean): Promise<void> {
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);

    if (this.activeToast) {
      await this.activeToast.dismiss();
    }

    const label = name.charAt(0).toUpperCase() + name.slice(1);
    const toast = await this.toastController.create({
      message: added ? `${label} added to Favorites` : `${label} removed from Favorites`,
      duration: 1800,
      position: 'top',
      cssClass: 'app-toast',
      icon: added ? 'heart' : 'heart-outline',
      swipeGesture: 'vertical',
    });

    this.activeToast = toast;
    toast.addEventListener('didDismiss', () => {
      if (this.activeToast === toast) {
        this.activeToast = null;
      }
    });
    await toast.present();
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, shareReplay } from 'rxjs';
import { PokemonDetail, PokemonListItem, PokemonPage, PokemonStat } from '../models/pokemon.model';

interface RawListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: { name: string; url: string }[];
}

interface RawPokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other?: { ['official-artwork']?: { front_default: string | null } };
  };
  types: { slot: number; type: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  stats: { base_stat: number; stat: { name: string } }[];
}

interface RawSpecies {
  flavor_text_entries: { flavor_text: string; language: { name: string } }[];
}

interface RawTypeResponse {
  pokemon: { pokemon: { name: string; url: string } }[];
}

interface RawTypeListResponse {
  results: { name: string; url: string }[];
}

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';

  private readonly detailCache = new Map<string, Observable<PokemonDetail>>();
  private typeListCache$: Observable<string[]> | null = null;

  constructor(private readonly http: HttpClient) {}

  getPokemonPage(offset: number, limit = 24): Observable<PokemonPage> {
    const url = `${this.baseUrl}/pokemon?offset=${offset}&limit=${limit}`;
    return this.http.get<RawListResponse>(url).pipe(
      map((res) => {
        const items: PokemonListItem[] = res.results.map((r) => this.toListItem(r.name, r.url));
        return {
          items,
          hasMore: res.next !== null,
          nextOffset: offset + limit,
        };
      }),
    );
  }

  getPokemonDetail(idOrName: string | number): Observable<PokemonDetail> {
    const key = String(idOrName).toLowerCase();
    const cached = this.detailCache.get(key);
    if (cached) {
      return cached;
    }

    const request$ = forkJoin({
      pokemon: this.http.get<RawPokemonDetail>(`${this.baseUrl}/pokemon/${key}`),
      species: this.http.get<RawSpecies>(`${this.baseUrl}/pokemon-species/${key}`),
    }).pipe(
      map(({ pokemon, species }) => this.toDetail(pokemon, species)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.detailCache.set(key, request$);
    return request$;
  }

  getTypeList(): Observable<string[]> {
    if (!this.typeListCache$) {
      this.typeListCache$ = this.http.get<RawTypeListResponse>(`${this.baseUrl}/type`).pipe(
        map((res) => res.results.map((t) => t.name).filter((name) => name !== 'unknown' && name !== 'shadow')),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.typeListCache$;
  }

  getPokemonByType(type: string): Observable<PokemonListItem[]> {
    return this.http.get<RawTypeResponse>(`${this.baseUrl}/type/${type}`).pipe(
      map((res) => res.pokemon.map((p) => this.toListItem(p.pokemon.name, p.pokemon.url))),
    );
  }

  private toListItem(name: string, url: string): PokemonListItem {
    const id = this.extractIdFromUrl(url);
    return { id, name, imageUrl: this.artworkUrlForId(id) };
  }

  private toDetail(pokemon: RawPokemonDetail, species: RawSpecies): PokemonDetail {
    const stats: PokemonStat[] = pokemon.stats.map((s) => ({
      name: s.stat.name.replace('special-', 'sp. '),
      value: s.base_stat,
    }));

    const englishEntry = species.flavor_text_entries.find((e) => e.language.name === 'en');
    const description = englishEntry
      ? englishEntry.flavor_text.replace(/[\n\f\r]/g, ' ')
      : 'No description available.';

    const artwork =
      pokemon.sprites.other?.['official-artwork']?.front_default ??
      pokemon.sprites.front_default ??
      this.artworkUrlForId(pokemon.id);

    return {
      id: pokemon.id,
      name: pokemon.name,
      imageUrl: pokemon.sprites.front_default ?? artwork,
      artworkUrl: artwork,
      types: pokemon.types.sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
      heightM: pokemon.height / 10,
      weightKg: pokemon.weight / 10,
      abilities: pokemon.abilities.map((a) => a.ability.name),
      stats,
      description,
    };
  }

  private extractIdFromUrl(url: string): number {
    const match = url.replace(/\/$/, '').match(/\/(\d+)$/);
    return match ? Number(match[1]) : 0;
  }

  private artworkUrlForId(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }
}

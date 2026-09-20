export interface PokemonListItem {
  id: number;
  name: string;
  imageUrl: string;
}

export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonDetail {
  id: number;
  name: string;
  imageUrl: string;
  artworkUrl: string;
  types: string[];
  heightM: number;
  weightKg: number;
  abilities: string[];
  stats: PokemonStat[];
  description: string;
}

export interface PokemonPage {
  items: PokemonListItem[];
  hasMore: boolean;
  nextOffset: number;
}

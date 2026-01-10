export interface Image {
    quality: string;
    link?: string;
    url?: string;
}

export interface DownloadUrl {
    quality: string;
    link?: string;
    url?: string;
}

export interface Album {
    id: string;
    name: string;
    url?: string;
}

export interface Artist {
    id: string;
    name: string;
    role?: string;
    image?: Image[];
    type?: string;
    url?: string;
}

export interface Song {
    id: string;
    name: string;
    type: string;
    album: Album;
    year: string;
    releaseDate: string | null;
    duration: string | number;
    label: string;
    primaryArtists: string;
    primaryArtistsId: string;
    featuredArtists: string;
    featuredArtistsId: string;
    explicitContent: number;
    playCount: string;
    language: string;
    hasLyrics: string;
    url: string;
    copyright: string;
    image: Image[];
    downloadUrl: DownloadUrl[];
}

export interface SearchResponse {
    status: string;
    data: {
        results: Song[];
        total: number;
        start: number;
    };
}

export interface TrackData {
    id: string;
    url: string;
    title: string;
    artist: string;
    artistId?: string;
    artwork: string;
    album: string;
    duration: number;
}

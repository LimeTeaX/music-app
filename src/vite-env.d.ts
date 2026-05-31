/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LASTFM_API_KEY: string
  readonly VITE_LASTFM_USERNAME: string
  readonly VITE_YOUTUBE_API_KEY: string
  readonly VITE_SPOTIFY_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

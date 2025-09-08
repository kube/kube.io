import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import React, {
  use,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  IoEllipsisHorizontal,
  IoListOutline,
  IoPause,
  IoPlay,
  IoPlayBack,
  IoPlayForward,
  IoRadioOutline,
  IoRepeatOutline,
  IoSearch,
  IoShuffleOutline,
  IoVolumeHighOutline,
} from "react-icons/io5";
import { Filter as SearchboxFilter } from "virtual:refractionFilter?width=320&height=42&radius=21&bezelWidth=18&glassThickness=100&refractiveIndex=1.3&bezelType=convex_squircle";
import { Filter as PlayerFilter } from "virtual:refractionFilter?width=640&height=63&radius=31&bezelWidth=29&glassThickness=90&refractiveIndex=1.3&bezelType=convex_squircle";
import { LogoStatic } from "../../../../components/Logo";

type Album = {
  collectionId: number;
  collectionName: string;
  artworkUrl100: string;
  artistName: string;
};

function upscaleArtwork(url: string, size = 600) {
  // iTunes artwork URLs include the size; replace to request a larger image
  return url.replace(/\/[0-9]+x[0-9]+bb\.(jpg|png)$/i, `/${size}x${size}bb.$1`);
}

export const MixedUI: React.FC = ({}) => {
  const [query, setQuery] = useState("Jimi Hendrix");
  const [isPlaying, setIsPlaying] = useState(true);

  // Interactive controls (MotionValues only)
  const specularSaturation = useMotionValue(6); // 0..50
  const specularOpacity = useMotionValue(0.4); // 0..1
  const refractionLevel = useMotionValue(1); // 0..1
  const blur = useMotionValue(1); // 0..40
  const progressiveBlurStrength = useMotionValue(1); // how much to ease the blur in the top overlay
  const glassBackgroundOpacity = useMotionValue(0.5); // 0..1
  // Tracks preferred color scheme as a MotionValue: 'light' | 'dark'
  const colorScheme = useMotionValue<"light" | "dark">("light");
  // Track scroll position for bottom gradient fade
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scrollY, scrollYProgress } = useScroll({
    container: scrollContainerRef,
  });

  const scrollDistanceToBottom = useTransform(() => {
    const y = scrollY.get();
    const progress = scrollYProgress.get();
    return (1 - progress) * (y / progress);
  });

  // Transform scroll position to bottom fade (fade out when within 200px of bottom)
  const bottomGradientOpacity = useTransform(() => {
    const distanceToBottom = scrollDistanceToBottom.get();
    if (distanceToBottom < 200) {
      return distanceToBottom / 200;
    }
    return 1;
  });

  // Transform scroll position to top fade (fade in when scrolled past 200px)
  const topGradientOpacity = useTransform(() => {
    // Fade in from 0 to 1 over first 200px of scroll
    return Math.min(1, scrollY.get() / 100);
  });

  // Transform scroll position for searchbox opacity (fade out as user scrolls)
  const searchboxShadowOpacity = useTransform(
    scrollY,
    (scrollYValue: number) => {
      // Start at full opacity, fade out over first 100px of scroll
      return Math.min(1, 0.2 + (scrollYValue / 200) * 0.8);
    }
  );

  // Transform scroll distance to bottom for player shadow opacity (fade in when close to bottom)
  const playerShadowOpacity = useTransform(
    scrollDistanceToBottom,
    (distanceToBottom) => {
      // Start at reduced opacity, fade in as user gets closer to bottom
      return Math.min(1, 0.2 + (distanceToBottom / 300) * 0.8);
    }
  );

  // Sync colorScheme with prefers-color-scheme
  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => colorScheme.set(mq.matches ? "dark" : "light");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [colorScheme]);

  // Hold last loaded albums so bottom player can render outside Suspense
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [albums, setAlbums] = useState<Album[] | null>(null);

  // Searchbox glass params
  const sbHeight = 42;
  const sbWidth = 320;
  const sbRadius = sbHeight / 2;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const pointerDown = useMotionValue(0);
  const focused = useMotionValue(0);

  // Sync colorScheme with prefers-color-scheme
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    )
      return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => colorScheme.set(mq.matches ? "dark" : "light");
    apply();
    // Support older Safari by falling back to addListener/removeListener
    const listener = () => apply();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(listener);
      return () => mq.removeListener(listener);
    }
  }, [colorScheme]);

  // Floating player dimensions (used to pad the scroll area bottom)
  const playerHeight = 63; // must match the player container height
  const playerWidth = 640;
  const playerBottomOffset = 24; // Tailwind bottom-6 = 1.5rem = 24px
  const playerExtraBreathingRoom = 24; // small gap so the last row isn't glued to the player

  const listBottomPadding =
    playerHeight + playerBottomOffset + playerExtraBreathingRoom; // 68 + 24 + 24 = 116

  // UI scale: 0.9 idle → 1 when focused
  const uiScale = useSpring(useTransform(focused, [0, 1], [0.9, 1]), {
    damping: 34,
    stiffness: 800,
  });

  return (
    <div>
      <motion.div
        className="relative h-[640px] rounded-xl -ml-[15px] w-[calc(100%+30px)] border border-black/10 dark:border-white/10 overflow-hidden text-black/5 dark:text-white/5 bg-white dark:bg-black select-none [--glass-rgb:#FFFFFF] dark:[--glass-rgb:#222222]"
        style={
          {
            "--glass-bg-alpha": useTransform(
              glassBackgroundOpacity,
              (x) => `${Math.round(x * 100)}%`
            ),
          } as React.CSSProperties
        }
      >
        {/* Albums grid layer (behind) */}
        <div
          ref={scrollContainerRef}
          className="absolute inset-0 overflow-y-auto px-6 z-0"
          style={{
            paddingTop: sbHeight + 42,
            paddingBottom: listBottomPadding,
          }}
        >
          {albums?.length ? (
            <h3 className="text-xl text-black dark:text-white mb-5 select-none">
              Top Results
            </h3>
          ) : (
            <div className="h-[90%] mb-5 flex justify-center items-center text-black/40 dark:text-white/40">
              No results
            </div>
          )}
          <ErrorBoundary>
            <React.Suspense fallback={<AlbumGridSkeleton />}>
              <AlbumGrid
                query={query}
                onLoaded={setAlbums}
                onSelect={setCurrentAlbum}
              />
            </React.Suspense>
          </ErrorBoundary>
        </div>

        {/* Top searchbox overlay */}
        <motion.div
          className="absolute left-1/2 top-6 -translate-x-1/2 z-10"
          style={{
            width: sbWidth,
            height: sbHeight,
            scale: uiScale,
          }}
          onMouseDown={() => {
            pointerDown.set(1);
            inputRef.current?.focus();
          }}
          onMouseUp={() => pointerDown.set(0)}
        >
          <SearchboxFilter
            id="mixed-ui-search-filter"
            blur={blur}
            scaleRatio={refractionLevel}
            specularOpacity={specularOpacity}
            specularSaturation={specularSaturation}
          />

          <motion.div
            className="absolute inset-0 bg-[var(--glass-rgb)]/[var(--glass-bg-alpha)]"
            style={{
              borderRadius: sbRadius,
              backdropFilter: `url(#mixed-ui-search-filter)`,
              boxShadow: useTransform(
                () =>
                  `0 4px 20px rgba(0, 0, 0, ${
                    0.4 * searchboxShadowOpacity.get()
                  })`
              ),
            }}
          />

          <div
            className="absolute inset-0 flex items-center gap-3 px-3.5"
            style={{ borderRadius: sbRadius, zIndex: 1 }}
          >
            <IoSearch
              className="text-black/60 dark:text-white/50 shrink-0"
              size={22}
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="search"
              placeholder="Search albums"
              aria-label="Search albums"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => focused.set(1)}
              onBlur={() => focused.set(0)}
              className="flex-1 min-w-0 bg-transparent outline-none border-0 text-[16px] leading-none text-black/80 dark:text-white/80 placeholder-black/40 dark:placeholder-white/40 selection:bg-blue-500/30 selection:text-inherit select-text text-shadow-xs text-shadow-white/30 dark:text-shadow-black/60"
              style={{ padding: 0 }}
            />
          </div>
        </motion.div>

        <motion.div className="absolute top-0 left-0 w-full h-[130px] pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full h-full backdrop-blur-[0.8px] mask-b-from-70% mask-b-to-100%"
            style={{
              backdropFilter: useTransform(
                () =>
                  `blur(${
                    Math.sqrt(
                      Math.sqrt(
                        progressiveBlurStrength.get() * topGradientOpacity.get()
                      )
                    ) / 2
                  }px)`
              ),
            }}
          />
          <motion.div
            className="absolute top-0 left-0 w-full h-full backdrop-blur-[2px] mask-b-from-50% mask-b-to-75%"
            style={{
              backdropFilter: useTransform(
                () =>
                  `blur(${Math.sqrt(
                    progressiveBlurStrength.get() * topGradientOpacity.get()
                  )}px)`
              ),
            }}
          />
          <motion.div
            className="absolute top-0 left-0 w-full h-full backdrop-blur-[4px] mask-b-from-20% mask-b-to-55%"
            style={{
              backdropFilter: useTransform(
                () =>
                  `blur(${
                    progressiveBlurStrength.get() * topGradientOpacity.get()
                  }px)`
              ),
            }}
          />
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b from-[var(--glass-rgb)]/40 dark:from-[var(--glass-rgb)]/60 to-transparent"
            style={{
              opacity: topGradientOpacity,
            }}
          />
        </motion.div>

        {/* Bottom player overlay (Apple Music–like) */}
        <div
          className="pointer-events-none absolute left-1/2 bottom-6 -translate-x-1/2 z-10"
          style={{ width: playerWidth, height: playerHeight }}
        >
          {/* Glass backdrop */}
          <PlayerFilter
            id="mixed-ui-player-filter"
            blur={blur}
            scaleRatio={refractionLevel}
            specularOpacity={specularOpacity}
            specularSaturation={specularSaturation}
          />
          <motion.div
            className="absolute inset-0 bg-[var(--glass-rgb)]/[var(--glass-bg-alpha)]"
            style={{
              borderRadius: 34,
              backdropFilter: `url(#mixed-ui-player-filter)`,
              boxShadow: useTransform(
                () =>
                  `0 4px 19px rgba(0, 0, 0, ${0.4 * playerShadowOpacity.get()})`
              ),
            }}
          />

          {/* Content */}
          <div
            className="pointer-events-auto absolute inset-0 flex items-center gap-4 px-6"
            style={{ borderRadius: 34 }}
          >
            {/* Left controls */}
            <div className="flex items-center gap-3 text-black/80 dark:text-white/80">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full p-1 transition-transform duration-150 ease-out hover:scale-110 active:scale-90 focus:outline-none cursor-pointer"
                aria-label="Shuffle"
              >
                <IoShuffleOutline size={18} className="opacity-70" />
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full p-1 transition-transform duration-150 ease-out hover:scale-110 active:scale-90 focus:outline-none cursor-pointer"
                aria-label="Previous"
              >
                <IoPlayBack size={20} />
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full p-2 transition-transform duration-150 ease-out hover:scale-110 active:scale-90 focus:outline-none cursor-pointer"
                onClick={() => setIsPlaying((v) => !v)}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <IoPause size={29} /> : <IoPlay size={29} />}
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full p-1 transition-transform duration-150 ease-out hover:scale-110 active:scale-90 focus:outline-none cursor-pointer"
                aria-label="Next"
              >
                <IoPlayForward size={20} />
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full p-1 transition-transform duration-150 ease-out hover:scale-110 active:scale-90 focus:outline-none cursor-pointer"
                aria-label="Repeat"
              >
                <IoRepeatOutline size={18} className="opacity-70" />
              </button>
            </div>

            {/* Now playing (show cube when nothing selected or not yet loaded; else artwork + text) */}
            {!currentAlbum ? (
              <div className="flex items-center justify-center flex-1 min-w-0">
                <LogoStatic
                  className="w-11 text-slate-800/60 dark:text-slate-200/60"
                  gradientFrom="currentColor"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-14 w-14 rounded overflow-hidden bg-black/10 dark:bg-white/10 shrink-0">
                  <img
                    src={upscaleArtwork(currentAlbum.artworkUrl100, 200)}
                    alt={currentAlbum.collectionName}
                    className="w-full h-full object-cover"
                    draggable={false}
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[14px] text-black/90 dark:text-white/90 truncate [line-height:1.3] text-shadow-xs text-shadow-white/30 dark:text-shadow-black/60">
                    {currentAlbum?.collectionName ?? "\u00A0"}
                  </div>
                  <div className="text-[11px] text-black/60 dark:text-white/60 truncate text-shadow-xs [line-height:1.3] text-shadow-white/30 dark:text-shadow-black/60">
                    {currentAlbum?.artistName
                      ? `${currentAlbum.artistName} — ${currentAlbum.collectionName}`
                      : "\u00A0"}
                  </div>
                  {/* Progress bar */}
                  <div className="mt-1 h-[3px] w-[460px] max-w-full bg-black/10 dark:bg-white/10 rounded">
                    <div className="h-full w-1/3 bg-black/40 dark:bg-white/40 rounded" />
                  </div>
                </div>
              </div>
            )}

            {/* Right actions */}
            <div className="flex items-center gap-4 text-black/80 dark:text-white/80">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full p-1 transition-transform duration-150 ease-out hover:scale-110 active:scale-90 focus:outline-none cursor-pointer"
                aria-label="More Options"
              >
                <IoEllipsisHorizontal size={20} className="opacity-80" />
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full p-1 transition-transform duration-150 ease-out hover:scale-110 active:scale-90 focus:outline-none cursor-pointer"
                aria-label="List"
              >
                <IoListOutline size={18} className="opacity-70" />
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full p-1 transition-transform duration-150 ease-out hover:scale-110 active:scale-90 focus:outline-none cursor-pointer"
                aria-label="Radio"
              >
                <IoRadioOutline size={18} />
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full p-1 transition-transform duration-150 ease-out hover:scale-110 active:scale-90 focus:outline-none cursor-pointer"
                aria-label="Volume"
              >
                <IoVolumeHighOutline size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom black gradient overlay with blur layers */}
        <motion.div
          className="absolute bottom-0 left-0 w-full h-[130px] pointer-events-none overflow-hidden"
          style={{
            opacity: bottomGradientOpacity,
          }}
        >
          <motion.div className="absolute bottom-0 left-0 w-full h-full backdrop-blur-[0.4px] mask-t-from-0% mask-t-to-100%" />
          <motion.div className="pointer-events-none absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black/10 dark:from-black/60 to-transparent" />
        </motion.div>
      </motion.div>

      {/* Controls (MotionValue-driven; Swiss Design style; no React state) */}
      <div className="mt-8 space-y-3 text-black/80 dark:text-white/80">
        <div className="flex items-center gap-4">
          <div className="uppercase tracking-[0.14em] text-[10px] opacity-70 select-none">
            Parameters
          </div>
          <div className="h-[1px] flex-1 bg-black/10 dark:bg-white/10" />
        </div>

        {/* Specular Opacity */}
        <div className="flex items-center gap-4">
          <label className="w-56 uppercase tracking-[0.08em] text-[11px] opacity-80 select-none [line-height:1.2]">
            Specular Opacity
          </label>
          <motion.span className="w-14 text-right font-mono tabular-nums text-[11px] text-black/60 dark:text-white/60">
            {useTransform(specularOpacity, (v) => v.toFixed(2))}
          </motion.span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            defaultValue={specularOpacity.get()}
            onInput={(e) =>
              specularOpacity.set(parseFloat(e.currentTarget.value))
            }
            className="flex-1 appearance-none h-[2px] bg-black/20 dark:bg-white/20 rounded outline-none"
            aria-label="Specular Opacity"
          />
        </div>

        {/* Specular Saturation */}
        <div className="flex items-center gap-4">
          <label className="w-56 uppercase tracking-[0.08em] text-[11px] opacity-80 select-none [line-height:1.2]">
            Specular Saturation
          </label>

          <motion.span className="w-14 text-right font-mono tabular-nums text-[11px] text-black/60 dark:text-white/60">
            {useTransform(specularSaturation, (v) => Math.round(v).toString())}
          </motion.span>
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            defaultValue={specularSaturation.get()}
            onInput={(e) =>
              specularSaturation.set(parseFloat(e.currentTarget.value))
            }
            className="flex-1 appearance-none h-[2px] bg-black/20 dark:bg-white/20 rounded outline-none"
            aria-label="Specular Saturation"
          />
        </div>

        {/* Refraction Level */}
        <div className="flex items-center gap-4">
          <label className="w-56 uppercase tracking-[0.08em] text-[11px] opacity-80 select-none [line-height:1.2]">
            Refraction Level
          </label>
          <motion.span className="w-14 text-right font-mono tabular-nums text-[11px] text-black/60 dark:text-white/60">
            {useTransform(refractionLevel, (v) => v.toFixed(2))}
          </motion.span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            defaultValue={refractionLevel.get()}
            onInput={(e) =>
              refractionLevel.set(parseFloat(e.currentTarget.value))
            }
            className="flex-1 appearance-none h-[2px] bg-black/20 dark:bg-white/20 rounded outline-none"
            aria-label="Refraction Level"
          />
        </div>

        {/* Blur Level */}
        <div className="flex items-center gap-4">
          <label className="w-56 uppercase tracking-[0.08em] text-[11px] opacity-80 select-none [line-height:1.2]">
            Blur Level
          </label>
          <motion.span className="w-14 text-right font-mono tabular-nums text-[11px] text-black/60 dark:text-white/60">
            {useTransform(blur, (v) => v.toFixed(1))}
          </motion.span>
          <input
            type="range"
            min={0}
            max={40}
            step={0.1}
            defaultValue={blur.get()}
            onInput={(e) => blur.set(parseFloat(e.currentTarget.value))}
            className="flex-1 appearance-none h-[2px] bg-black/20 dark:bg-white/20 rounded outline-none"
            aria-label="Blur Level"
          />
        </div>

        {/* Progressive Blur Strength */}
        <div className="flex items-center gap-4">
          <label className="w-56 uppercase tracking-[0.08em] text-[11px] opacity-80 select-none [line-height:1.2]">
            Progressive Blur Strength
          </label>
          <motion.span className="w-14 text-right font-mono tabular-nums text-[11px] text-black/60 dark:text-white/60">
            {useTransform(progressiveBlurStrength, (v) => v.toFixed(2))}
          </motion.span>
          <input
            type="range"
            min={0}
            max={10}
            step={0.01}
            defaultValue={progressiveBlurStrength.get()}
            onInput={(e) =>
              progressiveBlurStrength.set(parseFloat(e.currentTarget.value))
            }
            className="flex-1 appearance-none h-[2px] bg-black/20 dark:bg-white/20 rounded outline-none"
            aria-label="Progressive Blur Strength"
          />
        </div>

        {/* Glass Background Opacity */}
        <div className="flex items-center gap-4">
          <label className="w-56 uppercase tracking-[0.08em] text-[11px] opacity-80 select-none [line-height:1.2]">
            Glass Background Opacity
          </label>
          <motion.span className="w-14 text-right font-mono tabular-nums text-[11px] text-black/60 dark:text-white/60">
            {useTransform(glassBackgroundOpacity, (v) => v.toFixed(2))}
          </motion.span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            defaultValue={glassBackgroundOpacity.get()}
            onInput={(e) =>
              glassBackgroundOpacity.set(parseFloat(e.currentTarget.value))
            }
            className="flex-1 appearance-none h-[2px] bg-black/20 dark:bg-white/20 rounded outline-none"
            aria-label="Glass Background Opacity"
          />
        </div>
      </div>
    </div>
  );
};

// Suspense helpers ---------------------------------------------------------
const albumPromiseCache = new Map<string, Promise<Album[]>>();

function fetchAlbums(term: string): Promise<Album[]> {
  if (!term) return Promise.resolve([]);
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", term);
  url.searchParams.set("entity", "album");
  url.searchParams.set("limit", "100");
  return fetch(url.toString())
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => (data?.results ?? []) as Album[]);
}

function getAlbums(term: string): Promise<Album[]> {
  const key = term.trim().toLowerCase();
  let promise = albumPromiseCache.get(key);
  if (!promise) {
    promise = fetchAlbums(key);
    albumPromiseCache.set(key, promise);
  }
  return promise;
}

type AlbumGridProps = {
  query: string;
  onLoaded: (albums: Album[]) => void;
  onSelect: (album: Album) => void;
};

const AlbumGrid: React.FC<AlbumGridProps> = ({
  query,
  onLoaded,
  onSelect,
}: AlbumGridProps) => {
  const albums = use(getAlbums(query));
  useEffect(() => {
    onLoaded(albums);
  }, [albums, onLoaded]);

  return (
    <div className="grid grid-cols-4 gap-6">
      {albums.map((item) => {
        const title = item.collectionName;
        return (
          <div
            key={item.collectionId}
            className="flex flex-col group"
            role="button"
            tabIndex={0}
            onClick={() => onSelect(item)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(item);
              }
            }}
            aria-label={`Play ${title}`}
            style={{ cursor: "pointer" }}
          >
            <div className="relative aspect-square rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 transition-transform duration-200 ease-out group-hover:scale-[1.03] group-active:scale-97">
              <img
                src={upscaleArtwork(item.artworkUrl100)}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
                loading="lazy"
              />
              {/* Dim overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200" />
              {/* Play icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <IoPlay
                  size={46}
                  className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] group-active:scale-80 transition-transform"
                />
              </div>
            </div>
            <div className="mt-2 text-[11px] tracking-[0.06em] uppercase text-black/70 dark:text-white/70 leading-snug line-clamp-2">
              {title}
            </div>
          </div>
        );
      })}
    </div>
  );
};

type AlbumGridSkeletonProps = {};

const AlbumGridSkeleton: React.FC<
  AlbumGridSkeletonProps
> = ({}: AlbumGridSkeletonProps) => {
  return (
    <div className="grid grid-cols-4 gap-6">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="flex flex-col">
          <div className="relative aspect-square bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden">
            <div className="absolute inset-0 animate-pulse bg-black/10 dark:bg-white/10" />
          </div>
          <div className="mt-2 h-[22px] bg-black/10 dark:bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="text-center text-red-500/80">
          {this.state.error.message || "Something went wrong"}
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { Filter } from "../components/Filter";

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

export const MixedUI: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [query, setQuery] = useState("Jimi Hendrix");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Fetch 20 albums via iTunes Search API (no auth, supports CORS)
  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const url = new URL("https://itunes.apple.com/search");
        url.searchParams.set("term", query);
        url.searchParams.set("entity", "album");
        url.searchParams.set("limit", "100");
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setAlbums(data.results ?? []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to fetch albums");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const items = useMemo(() => albums, [albums]);
  const current = items[currentIndex];

  // Searchbox glass params
  const sbHeight = 52;
  const sbWidth = 470;
  const sbRadius = sbHeight / 2;
  const bezelWidth = 11;
  const glassThickness = 200;
  const refractiveIndex = 1.8;
  const blur = 1;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const pointerDown = useMotionValue(0);
  const focused = useMotionValue(0);

  // Floating player dimensions (used to pad the scroll area bottom)
  const playerHeight = 68; // must match the player container height
  const playerBottomOffset = 24; // Tailwind bottom-6 = 1.5rem = 24px
  const extraBreathingRoom = 24; // small gap so the last row isn't glued to the player
  const listBottomPadding =
    playerHeight + playerBottomOffset + extraBreathingRoom; // 68 + 24 + 24 = 116

  const scaleRatio = useSpring(
    useTransform(
      [pointerDown, focused],
      (vals) => 0.5 + 0.1 * (vals[0] as number) + 0.1 * (vals[1] as number)
    ),
    { damping: 80, stiffness: 2000 }
  );
  const specularOpacity = useSpring(useTransform(focused, [0, 1], [0.8, 0.9]));
  // UI scale: 0.7 idle → 1 when focused
  const uiScale = useSpring(useTransform(focused, [0, 1], [0.9, 1]), {
    damping: 40,
    stiffness: 800,
  });

  return (
    <div className="relative h-[640px] rounded-xl -ml-[15px] w-[calc(100%+30px)] border border-black/10 dark:border-white/10 overflow-hidden text-black/5 dark:text-white/5 bg-white dark:bg-black select-none [--glass-rgb:#FFFFFF99] dark:[--glass-rgb:#16161694]">
      {/* Albums grid layer (behind) */}
      <div
        className="absolute inset-0 overflow-y-auto px-6 z-0"
        style={{ paddingTop: sbHeight + 42, paddingBottom: listBottomPadding }}
      >
        {error && <div className="text-center text-red-500/80">{error}</div>}
        <h3 className="text-xl text-black dark:text-white mb-5 select-none">
          Top Results
        </h3>
        <div className="grid grid-cols-4 gap-6">
          {(loading ? Array.from({ length: 20 }) : items).map((item, i) => {
            const key = (item as any)?.collectionId ?? i;
            const title = loading ? "\u00A0" : (item as Album).collectionName;
            return (
              <div
                key={key}
                className="flex flex-col"
                role={!loading ? "button" : undefined}
                tabIndex={!loading ? 0 : -1}
                onClick={!loading ? () => setCurrentIndex(i) : undefined}
                onKeyDown={
                  !loading
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setCurrentIndex(i);
                        }
                      }
                    : undefined
                }
                aria-label={!loading ? `Play ${title}` : undefined}
                style={{ cursor: loading ? "default" : "pointer" }}
              >
                {/* Square cover */}
                <div className="relative aspect-square bg-black/5 dark:bg-white/5">
                  {loading ? (
                    <div className="absolute inset-0 animate-pulse bg-black/10 dark:bg-white/10" />
                  ) : (
                    <img
                      src={upscaleArtwork((item as Album).artworkUrl100)}
                      alt={title}
                      className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      draggable={false}
                      loading="lazy"
                    />
                  )}
                </div>
                {/* Caption outside, Swiss style */}
                <div className="mt-2 text-[11px] tracking-[0.06em] uppercase text-black/70 dark:text-white/70 leading-snug line-clamp-2">
                  {title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top searchbox overlay */}
      <motion.div
        className="absolute left-1/2 top-6 -translate-x-1/2 z-10"
        style={{ width: sbWidth, height: sbHeight, scale: uiScale }}
        onMouseDown={() => {
          pointerDown.set(1);
          inputRef.current?.focus();
        }}
        onMouseUp={() => pointerDown.set(0)}
      >
        <Filter
          id="mixed-ui-search-filter"
          width={sbWidth}
          height={sbHeight}
          radius={sbRadius}
          bezelWidth={bezelWidth}
          glassThickness={glassThickness}
          refractiveIndex={refractiveIndex}
          blur={blur}
          scaleRatio={scaleRatio}
          specularOpacity={specularOpacity}
          bezelHeightFn={(x) => Math.sqrt(1 - (1 - x) ** 2)}
        />

        <motion.div
          className="absolute inset-0"
          style={{
            borderRadius: sbRadius,
            backdropFilter: `url(#mixed-ui-search-filter)`,
            backgroundColor: "var(--glass-rgb)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        />

        <div
          className="absolute inset-0 flex items-center gap-3 px-5"
          style={{ borderRadius: sbRadius, zIndex: 1 }}
        >
          <IoSearch
            className="text-black/60 dark:text-white/60 shrink-0"
            size={25}
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
            className="flex-1 min-w-0 bg-transparent outline-none border-0 text-[16px] leading-none text-black/80 dark:text-white/80 placeholder-black/40 dark:placeholder-white/40 selection:bg-blue-500/30 selection:text-inherit select-text text-shadow-xs text-shadow-white/70 dark:text-shadow-black/70"
            style={{ padding: 0 }}
          />
        </div>
      </motion.div>

      <div className="absolute top-0 left-0 w-full h-[130px] backdrop-blur-[0.8px] mask-b-from-70% mask-b-to-100%" />
      <div className="absolute top-0 left-0 w-full h-[130px] backdrop-blur-[2px] mask-b-from-50% mask-b-to-75%" />
      <div className="absolute top-0 left-0 w-full h-[130px] backdrop-blur-[4px] mask-b-from-20% mask-b-to-55%" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[160px] bg-gradient-to-b from-black/30 to-transparent" />

      {/* Bottom player overlay (Apple Music–like) */}
      <div
        className="pointer-events-none absolute left-1/2 bottom-6 -translate-x-1/2 z-10"
        style={{ width: 640, height: 68 }}
      >
        {/* Glass backdrop */}
        <Filter
          id="mixed-ui-player-filter"
          width={640}
          height={68}
          radius={34}
          bezelWidth={13}
          glassThickness={200}
          refractiveIndex={1.8}
          blur={1.5}
          scaleRatio={useSpring(0.55)}
          specularOpacity={0.7}
          bezelHeightFn={(x) => Math.sqrt(1 - (1 - x) ** 2)}
        />
        <div
          className="absolute inset-0"
          style={{
            borderRadius: 34,
            backdropFilter: `url(#mixed-ui-player-filter)`,
            backgroundColor: "var(--glass-rgb)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        />

        {/* Content */}
        <div
          className="pointer-events-auto absolute inset-0 flex items-center gap-4 px-6"
          style={{ borderRadius: 34 }}
        >
          {/* Left controls */}
          <div className="flex items-center gap-3 text-black/80 dark:text-white/80">
            <IoShuffleOutline size={18} className="opacity-70" />
            <IoPlayBack size={20} />
            {isPlaying ? (
              <IoPause
                size={29}
                className="cursor-pointer"
                onClick={() => setIsPlaying((v) => !v)}
                aria-label="Pause"
              />
            ) : (
              <IoPlay
                size={29}
                className="cursor-pointer"
                onClick={() => setIsPlaying((v) => !v)}
                aria-label="Play"
              />
            )}
            <IoPlayForward size={20} />
            <IoRepeatOutline size={18} className="opacity-70" />
          </div>

          {/* Now playing */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-14 w-14 rounded overflow-hidden bg-black/10 dark:bg-white/10 shrink-0">
              {current ? (
                <img
                  src={upscaleArtwork(current.artworkUrl100, 200)}
                  alt={current.collectionName}
                  className="w-full h-full object-cover"
                  draggable={false}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full animate-pulse" />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-[14px] text-black/90 dark:text-white/90 truncate [line-height:1.1] text-shadow-xs text-shadow-white/50 dark:text-shadow-black/70">
                {current?.collectionName ?? "\u00A0"}
              </div>
              <div className="text-[11px] text-black/60 dark:text-white/60 truncate text-shadow-xs text-shadow-white/50 dark:text-shadow-black/70">
                {current?.artistName
                  ? `${current.artistName} — ${current.collectionName}`
                  : "\u00A0"}
              </div>
              {/* Progress bar */}
              <div className="mt-1 h-[3px] w-[460px] max-w-full bg-black/10 dark:bg-white/10 rounded">
                <div className="h-full w-1/3 bg-black/40 dark:bg-white/40 rounded" />
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4 text-black/80 dark:text-white/80">
            <IoEllipsisHorizontal size={20} className="opacity-80" />
            <IoListOutline size={18} className="opacity-70" />
            <IoRadioOutline size={18} />
            <IoVolumeHighOutline size={22} />
          </div>
        </div>
      </div>
    </div>
  );
};

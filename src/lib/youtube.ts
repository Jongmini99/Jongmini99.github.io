/**
 * YouTube URL에서 영상 ID를 추출한다.
 * 지원: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/, youtube-nocookie.com/embed/
 */
export function parseYouTubeId(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\.|^m\./, "");
  const isId = (v: string | undefined | null): v is string => !!v && /^[\w-]{11}$/.test(v);

  if (host === "youtu.be") {
    const id = url.pathname.split("/")[1];
    return isId(id) ? id : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = url.searchParams.get("v");
    if (isId(v)) return v;
    const [, kind, id] = url.pathname.split("/");
    if ((kind === "embed" || kind === "shorts" || kind === "live") && isId(id)) return id;
  }
  return null;
}

/** 개인정보 보호 모드(youtube-nocookie) 임베드 URL */
export function youTubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

/** hq: 480×360(4:3, 항상 존재) · maxres: 1280×720(16:9, 업로드 해상도가 낮으면 없음) */
export function youTubeThumbnailUrl(id: string, size: "hq" | "maxres" = "hq"): string {
  return `https://i.ytimg.com/vi/${id}/${size === "maxres" ? "maxresdefault" : "hqdefault"}.jpg`;
}

/**
 * YouTube URL의 시작 시각(t= 또는 start=)을 초 단위로 반환한다. 없거나 해석할 수 없으면 0.
 * 지원: 90, 90s, 1m30s, 1h2m3s. 임베드 플레이어는 t=를 무시하므로 start= 로 넘겨야 한다.
 */
export function parseYouTubeStart(input: string): number {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return 0;
  }
  const raw = url.searchParams.get("t") ?? url.searchParams.get("start");
  if (!raw) return 0;
  if (/^\d+$/.test(raw)) return Number(raw);
  const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(raw);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

/** 임베드 iframe src. start(초)가 있으면 그 지점부터 재생한다. */
export function youTubeEmbedSrc(id: string, youtubeUrl: string, params: string): string {
  const start = parseYouTubeStart(youtubeUrl);
  return `${youTubeEmbedUrl(id)}?${params}${start > 0 ? `&start=${start}` : ""}`;
}

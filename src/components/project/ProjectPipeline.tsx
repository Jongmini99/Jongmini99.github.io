import { ArrowDown, ArrowRight, Bot, Check, Download, RotateCcw, User } from "lucide-react";
import type { Project } from "@/content/schema";
import { Container } from "@/components/layout/Container";
import { withBasePath } from "@/lib/base-path";
import { cx } from "@/lib/cx";

type Pipeline = NonNullable<Project["pipeline"]>;

const OWNER = {
  me: { label: "본인", Icon: User },
  ai: { label: "AI", Icon: Bot },
} as const;

/**
 * 상세 페이지 제목 바로 아래의 "AI 개발 파이프라인" 칸.
 * 단계(본인/AI 구분) → 반복 루프 → 핵심 요약을 한 화면에 보여 준다.
 */
export function ProjectPipeline({ pipeline }: { pipeline: Pipeline }) {
  const { steps } = pipeline;

  return (
    <section aria-labelledby="pipeline-title" className="border-b border-band-line bg-band">
      <Container className="flex flex-col gap-8 py-12 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex max-w-3xl flex-col gap-2">
            <h2 id="pipeline-title" className="text-2xl font-bold tracking-[-0.03em] text-fg sm:text-3xl">
              {pipeline.title}
            </h2>
            {pipeline.intro && <p className="leading-[1.8] text-fg-muted">{pipeline.intro}</p>}
          </div>
          <ul aria-label="범례" className="flex gap-3 text-sm text-fg-muted">
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-3 rounded-full bg-accent-solid" />
              본인 판단
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-3 rounded-full border border-line-strong bg-surface-raised" />
              AI 작업
            </li>
          </ul>
        </div>

        {/* 단계: 모바일 세로, 데스크톱 가로 */}
        <div className="flex flex-col gap-3">
          <ol
            className="grid gap-3 lg:grid-cols-[repeat(var(--steps),minmax(0,1fr))] lg:gap-5"
            style={{ "--steps": steps.length } as React.CSSProperties}
          >
            {steps.map((step, i) => {
              const owner = OWNER[step.owner];
              const mine = step.owner === "me";
              return (
                <li key={`${step.label}-${i}`} className="relative flex flex-col">
                  <div
                    className={cx(
                      "flex h-full flex-col gap-3 rounded-card border p-5",
                      mine ? "border-accent/50 bg-accent-soft" : "border-line bg-surface",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-semibold text-fg-muted">{String(i + 1).padStart(2, "0")}</span>
                      <span
                        className={cx(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          mine ? "bg-accent-solid text-accent-fg" : "border border-line-strong bg-surface-raised text-fg-muted",
                        )}
                      >
                        <owner.Icon className="size-3.5" aria-hidden="true" />
                        {owner.label}
                      </span>
                    </div>
                    <p className="text-lg font-bold tracking-[-0.02em] text-fg">{step.label}</p>
                    <p className="text-sm leading-[1.7] text-fg-muted">{step.text}</p>
                    {step.tools.length > 0 && (
                      <ul aria-label="사용 도구" className="mt-auto flex flex-wrap gap-1.5 pt-1">
                        {step.tools.map((t) => (
                          <li key={t} className="rounded-full border border-line px-2 py-0.5 text-xs text-fg-muted">
                            {t}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <>
                      <ArrowDown aria-hidden="true" className="mx-auto mt-3 size-5 text-accent-text lg:hidden" />
                      <ArrowRight
                        aria-hidden="true"
                        className="absolute top-1/2 -right-5 hidden size-5 -translate-y-1/2 text-accent-text lg:block"
                      />
                    </>
                  )}
                </li>
              );
            })}
          </ol>

          {pipeline.loop && (
            <p className="flex items-center justify-center gap-2 rounded-card border border-dashed border-accent/50 px-4 py-3 text-center text-sm font-semibold text-accent-text">
              <RotateCcw className="size-4 shrink-0" aria-hidden="true" />
              {pipeline.loop}
            </p>
          )}
        </div>

        {pipeline.summary.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wide text-fg-subtle">핵심 요약</h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {pipeline.summary.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-card border border-line bg-surface/70 px-5 py-4">
                  <Check className="mt-0.5 size-5 shrink-0 text-accent-text" aria-hidden="true" />
                  <span className="leading-[1.7] text-fg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pipeline.image && (
          <a
            href={withBasePath(pipeline.image.src)}
            download
            className="inline-flex w-fit items-center gap-2 text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline"
          >
            <Download className="size-4" aria-hidden="true" />
            파이프라인 이미지(PNG) 저장
          </a>
        )}
      </Container>
    </section>
  );
}

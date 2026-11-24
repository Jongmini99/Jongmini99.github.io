import Link from "next/link";
import { ArrowLeft, ArrowRight, Home, LayoutGrid } from "lucide-react";
import type { Project } from "@/content/schema";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";

/** 상세 페이지 맨 아래: 이전/다음 프로젝트 + 소개·전체 프로젝트로 이동 */
export function ProjectPager({
  prev,
  next,
}: {
  prev?: Project;
  next?: Project;
}) {
  return (
    <nav aria-label="다른 프로젝트" className="border-t border-line">
      <Container className="flex flex-col gap-8 py-12">
        {(prev || next) && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              { p: prev, label: "이전 프로젝트", Icon: ArrowLeft, align: "" },
              {
                p: next,
                label: "다음 프로젝트",
                Icon: ArrowRight,
                align: "sm:col-start-2 sm:text-right",
              },
            ].map(({ p, label, Icon, align }) =>
              p ? (
                <li key={label} className={align}>
                  <Link
                    href={`/projects/${p.slug}/`}
                    className="group flex h-full flex-col gap-1 rounded-card border border-line bg-surface p-5 transition-colors duration-150 hover:border-accent/60"
                  >
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm text-fg-muted ${align ? "sm:justify-end" : ""}`}
                    >
                      {label === "이전 프로젝트" && (
                        <Icon className="size-4" aria-hidden="true" />
                      )}
                      {label}
                      {label === "다음 프로젝트" && (
                        <Icon className="size-4" aria-hidden="true" />
                      )}
                    </span>
                    <span className="text-lg font-bold tracking-[-0.02em] text-fg group-hover:text-accent-text">
                      {p.title}
                    </span>
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/#top" variant="outline">
            <Home className="size-4" aria-hidden="true" />
            소개로 돌아가기
          </ButtonLink>
          <ButtonLink href="/projects/" variant="outline">
            <LayoutGrid className="size-4" aria-hidden="true" />
            전체 프로젝트
          </ButtonLink>
        </div>
      </Container>
    </nav>
  );
}

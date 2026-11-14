import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getContact } from "@/content/loaders";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactActions } from "@/components/profile/ProfileBlocks";
import { SectionHeading } from "@/components/ui/Typography";

export const metadata: Metadata = {
  title: "연락하기",
  description: "이메일, GitHub, 이력서 다운로드",
};

export default function ContactPage() {
  const contact = getContact();
  return (
    <>
      <PageHeader eyebrow="Contact" title="연락하기">
        <p>채용 및 협업 관련 문의를 환영합니다.</p>
      </PageHeader>
      <Container className="flex flex-col gap-12 py-12">
        <ContactActions contact={contact} />
        {contact.email && (
          <p className="text-fg-muted">
            이메일: <a href={`mailto:${contact.email}`} className="text-fg underline underline-offset-4">{contact.email}</a>
          </p>
        )}
        {contact.links.length > 0 && (
          <section aria-labelledby="links-heading" className="flex flex-col gap-5">
            <SectionHeading eyebrow="Links" title="외부 링크" id="links-heading" size="md" />
            <ul className="grid gap-3 sm:grid-cols-2">
              {contact.links.map((l, i) => (
                <li key={i}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 rounded-card border border-line bg-surface px-5 py-4 transition-colors duration-150 hover:border-accent/60"
                  >
                    <span>
                      <span className="block font-semibold text-fg">{l.label}</span>
                      {l.description && <span className="text-sm text-fg-subtle">{l.description}</span>}
                    </span>
                    <ArrowUpRight className="size-5 text-fg-muted group-hover:text-accent-text" aria-hidden="true" />
                    <span className="sr-only">(새 창)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </>
  );
}

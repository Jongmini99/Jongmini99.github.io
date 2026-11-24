import Link from "next/link";
import { getContact, getProfile } from "@/content/loaders";
import { HeaderNav } from "./HeaderNav";

export function SiteHeader() {
  const profile = getProfile();
  const contact = getContact();

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-header border-b border-line/80 bg-bg/85 backdrop-blur-md">
      <div className="relative mx-auto flex h-full max-w-(--container-content) items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-fg">
          <span aria-hidden="true" className="flex gap-[3px]">
            <span className="h-4 w-1.5 -skew-x-[20deg] bg-accent" />
            <span className="h-4 w-1.5 -skew-x-[20deg] bg-accent/60" />
          </span>
          <span>
            {profile.name} <span className="font-semibold text-fg-muted">Portfolio</span>
          </span>
        </Link>
        <HeaderNav resume={contact.resume} contact={contact} />
      </div>
    </header>
  );
}

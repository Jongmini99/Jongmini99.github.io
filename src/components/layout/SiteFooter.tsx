import { getContact, getProfile } from "@/content/loaders";
import { Container } from "./Container";
import { Icon } from "@/components/ui/Icon";

export function SiteFooter() {
  const profile = getProfile();
  const contact = getContact();
  const year = new Date().getFullYear();

  return (
    <footer data-site-footer className="border-t border-line">
      <Container className="flex flex-col gap-4 py-8 text-sm text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {profile.name}. {profile.roleTitle}
        </p>
        <ul className="flex items-center gap-4">
          {contact.email && (
            <li>
              <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-1.5 hover:text-fg">
                <Icon name="mail" className="size-4" />
                {contact.email}
              </a>
            </li>
          )}
          {contact.github && (
            <li>
              <a href={contact.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-fg">
                <Icon name="github" className="size-4" />
                GitHub<span className="sr-only"> (새 창)</span>
              </a>
            </li>
          )}
        </ul>
      </Container>
    </footer>
  );
}

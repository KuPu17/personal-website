'use client';

import Link from 'next/link';
import Image from 'next/image';
import InboxInlineField from '@/components/public/InboxInlineField';
import HomeSocialLinks from '@/components/public/HomeSocialLinks';

const NAV_BLOCKS = [
  { href: '/blogs', label: 'blogs', color: '#E1DB36', icon: 'blog' },
  { href: '/works', label: 'works', color: '#FFC102', icon: 'website' },
  { href: '/projects', label: 'projects', color: '#9561A0', icon: 'project' },
] as const;

export default function HomeNav() {
  return (
    <section className="home-stage" aria-label="Home">
      <div className="home-layout">
        <div className="home-nav-row">
          {NAV_BLOCKS.map((block) => (
            <Link
              key={block.href}
              href={block.href}
              className="home-nav-block"
              style={{ backgroundColor: block.color }}
            >
              {/* <NavBlockIconStrip icon={block.icon} /> */}
              <span className="home-nav-block__label">{block.label}</span>
            </Link>
          ))}
        </div>

        <div className="home-contact">
          <HomeSocialLinks />

          <div className="home-inbox">
            <Image
              src="/icons/inbox.svg"
              alt=""
              width={63}
              height={63}
              className="home-inbox__icon"
              draggable={false}
              aria-hidden
            />
            <InboxInlineField />
          </div>
        </div>
      </div>
    </section>
  );
}

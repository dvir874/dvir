import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://regalifnei.vercel.app';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        /* Every route addressed by a private token.
         *
         * Only /couple and /rsvp were listed. /wall, /gallery and /memory are
         * the couple's photographs; /shuttle is a list of named passengers with
         * their phone numbers; /send hands a helper the guest list. A token is
         * unguessable, but it is not a secret once someone pastes the link into
         * a public group — and the crawler that follows it would put a couple's
         * wedding photos in Google. */
        disallow: ['/admin', '/api/', '/couple/', '/rsvp/', '/memory/',
                   '/gallery/', '/wall/', '/shuttle/', '/send/', '/join/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

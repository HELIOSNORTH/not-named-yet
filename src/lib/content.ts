export type Locale = 'en' | 'da';

export const siteUrl = 'https://hartmannsoft.com';

export const film = {
	hls: 'https://video.hartmannsoft.com/hero-1f52ce19944a57e2691a5e3f4e384104620992949d8c91a65e9aa6628e1cea1c/master.m3u8',
	mp4: 'https://video.hartmannsoft.com/media/videos/helios-north-hero-hq.mp4',
	poster: '/media/images/helios-north-hero-poster.jpg',
	width: 2160,
	height: 3840,
	horizonY: 0.715,
	startAt: 4
};

export const socialImage = `${siteUrl}/media/images/hartmann_enterprise_software_ice_crystal_art-social.jpg`;

export const contact = {
	email: 'sales@hartmannsoft.com',
	phone: '+45 60 60 97 46',
	phoneHref: 'tel:+4560609746',
	company: 'Hartmann Software',
	registration: 'CVR 40076409 · © 2026'
};

export const brand = 'Hartmann';

export const localePaths: Record<Locale, string> = { en: '/', da: '/da/' };

export function localeFromPath(pathname: string): Locale {
	return pathname === '/da' || pathname.startsWith('/da/') ? 'da' : 'en';
}

type Word = { text: string; italic?: boolean };
type Line = Word[];

const w = (text: string, italic = false): Word => ({ text, italic });

export const content = {
	en: {
		title: 'Hartmann Software | Enterprise Software Architecture',
		description:
			'Enterprise software architecture, cloud infrastructure and Scandinavian design. Hartmann Software in Vejle, Denmark.',
		ogLocale: 'en_DK',
		headline: 'World-class software architecture inside. Scandinavian design outside.',
		wide: [
			[w('World-class')],
			[w('software'), w('architecture'), w('inside.', true)],
			[w('Scandinavian'), w('design'), w('outside.', true)]
		] as Line[],
		narrow: [
			[w('World-class')],
			[w('software')],
			[w('architecture'), w('inside.', true)],
			[w('Scandinavian')],
			[w('design'), w('outside.', true)]
		] as Line[],
		secondSentenceLine: { wide: 2, narrow: 3 },
		discipline: 'Enterprise Software Architecture',
		consult: 'Consult',
		playFilm: 'Play film',
		address: 'Roms Hule 5, 2. · 7100 Vejle · Denmark',
		languageLabel: 'Language',
		homeLabel: 'Hartmann, back to top'
	},
	da: {
		title: 'Hartmann Software | Enterprise Software Architecture',
		description:
			'Enterprise-softwarearkitektur, cloud-infrastruktur og skandinavisk design. Hartmann Software i Vejle, Danmark.',
		ogLocale: 'da_DK',
		headline: 'Softwarearkitektur i verdensklasse indeni. Skandinavisk design udenpå.',
		wide: [
			[w('Verdensklasse')],
			[w('softwarearkitektur'), w('indeni.', true)],
			[w('Skandinavisk'), w('design'), w('udenpå.', true)]
		] as Line[],
		narrow: [
			[w('Verdensklasse')],
			[w('softwarearkitektur')],
			[w('indeni.', true)],
			[w('Skandinavisk')],
			[w('design'), w('udenpå.', true)]
		] as Line[],
		secondSentenceLine: { wide: 2, narrow: 3 },
		discipline: 'Enterprise Software Architecture',
		consult: 'Kontakt',
		playFilm: 'Afspil film',
		address: 'Roms Hule 5, 2. · 7100 Vejle · Danmark',
		languageLabel: 'Sprog',
		homeLabel: 'Hartmann, til toppen'
	}
} satisfies Record<Locale, unknown>;

export type Copy = (typeof content)[Locale];

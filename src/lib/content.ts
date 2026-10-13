export type Locale = 'en' | 'da';

export const siteUrl = 'https://hartmannsoft.com';

export const heroVideoUrl = 'https://video.hartmannsoft.com/media/videos/helios-north-hero-hq.mp4';

export const contact = {
	email: 'sales@hartmannsoft.com',
	phone: '+45 60 60 97 46',
	phoneHref: 'tel:+4560609746',
	company: 'HARTMANN SOFTWARE',
	registration: 'CVR 40076409 · © 2026'
};

export const brand = 'Hartmann';

export const localePaths: Record<Locale, string> = { en: '/', da: '/da/' };

export function localeFromPath(pathname: string): Locale {
	return pathname === '/da' || pathname.startsWith('/da/') ? 'da' : 'en';
}

const shy = '­';

export const content = {
	en: {
		title: 'Hartmann Software | Enterprise Software Architecture',
		description: 'World-class software architecture inside. Scandinavian design outside.',
		ogLocale: 'en_GB',
		discipline: 'ENTERPRISE SOFTWARE ARCHITECTURE',
		consult: 'CONSULT',
		mailSubject: 'Consultation',
		headline: [
			['World-class', 'software', 'architecture', 'inside.'],
			['Scandinavian', 'design', 'outside.']
		],
		address: 'ROMS HULE 5, 2. · 7100 VEJLE · DENMARK',
		languageLabel: 'Language',
		homeLabel: 'Hartmann Software, back to top',
		pauseVideo: 'Pause background video',
		playVideo: 'Play background video'
	},
	da: {
		title: 'Hartmann Software | Enterprise-softwarearkitektur',
		description: 'Softwarearkitektur i verdensklasse indeni. Skandinavisk design udenpå.',
		ogLocale: 'da_DK',
		discipline: 'ENTERPRISE-SOFTWAREARKITEKTUR',
		consult: 'RÅDGIVNING',
		mailSubject: 'Rådgivning',
		headline: [
			[`Software${shy}arkitektur`, `i verdens${shy}klasse`, 'indeni.'],
			['Skandinavisk', 'design', 'udenpå.']
		],
		address: 'ROMS HULE 5, 2. · 7100 VEJLE · DANMARK',
		languageLabel: 'Sprog',
		homeLabel: 'Hartmann Software, til toppen',
		pauseVideo: 'Sæt baggrundsvideo på pause',
		playVideo: 'Afspil baggrundsvideo'
	}
} satisfies Record<Locale, unknown>;

export type Copy = (typeof content)[Locale];

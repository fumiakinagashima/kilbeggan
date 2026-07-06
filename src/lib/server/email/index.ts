import { sendResend, type ResendConfig } from './providers/resend';

export type Mail = {
	from: string;
	fromName?: string;
	to: string | string[];
	subject: string;
	html?: string;
	text?: string;
};

export type EmailProviderConfig = { provider: 'resend'; config: ResendConfig };

export async function sendEmail(providerConfig: EmailProviderConfig, mail: Mail): Promise<void> {
	return sendResend(providerConfig.config, mail);
}

export type EmailEnv = {
	EMAIL_PROVIDER?: string;
	EMAIL_FROM?: string;
	EMAIL_FROM_NAME?: string;
	RESEND_API_KEY?: string;
};

export type EmailSetup = {
	providerConfig: EmailProviderConfig;
	from: string;
	fromName?: string;
};

export function getEmailSetupFromEnv(env: EmailEnv): EmailSetup | null {
	if (env.EMAIL_PROVIDER !== 'resend') return null;
	if (!env.EMAIL_FROM || !env.RESEND_API_KEY) return null;
	return {
		providerConfig: { provider: 'resend', config: { api_key: env.RESEND_API_KEY } },
		from: env.EMAIL_FROM,
		fromName: env.EMAIL_FROM_NAME || undefined
	};
}

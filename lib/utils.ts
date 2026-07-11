export function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

// Maps ISO 4217 currency codes to their most appropriate locale
const CURRENCY_LOCALES: Record<string, string> = {
    INR: 'en-IN',
    USD: 'en-US',
    GBP: 'en-GB',
    EUR: 'de-DE',
    AUD: 'en-AU',
    CAD: 'en-CA',
    SGD: 'en-SG',
    JPY: 'ja-JP',
    CNY: 'zh-CN',
    AED: 'ar-AE',
};

export function formatCurrency(amount: number, currencyCode: string): string {
    const locale = CURRENCY_LOCALES[currencyCode] ?? 'en-US';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
    }).format(amount);
}

export function getCurrencySymbol(currencyCode: string): string {
    const locale = CURRENCY_LOCALES[currencyCode] ?? 'en-US';
    return (0).toLocaleString(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).replace(/\d/g, '').trim();
}

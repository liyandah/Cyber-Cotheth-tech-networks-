/**
 * Angwa Pay gateway client using domain whitelist + HMAC request signing.
 */
const crypto = require('crypto');

const PROVIDER_CONFIG = {
  EcoCash: { product: 'ECOCASH' },
  Omari: { product: 'OMARI' },
  InnBucks: { product: 'INNBUCKS' },
  OneMoney: { product: 'ONEMONEY' },
};

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_ATTEMPTS = 15;

const LIVE_DEPOSIT_PROVIDERS = ['EcoCash', 'Omari', 'InnBucks', 'OneMoney'];
const LIVE_WITHDRAWAL_PROVIDERS = ['EcoCash', 'Omari', 'InnBucks', 'OneMoney'];

function isConfigured() {
  return Boolean(
    process.env.ANGWA_BASE_URL &&
    process.env.ANGWA_API_KEY &&
    process.env.ANGWA_API_SECRET &&
    process.env.ANGWA_MERCHANT_DOMAIN
  );
}

function getConfig() {
  const baseUrl = process.env.ANGWA_BASE_URL;
  const apiKey = process.env.ANGWA_API_KEY;
  const apiSecret = process.env.ANGWA_API_SECRET;
  const merchantDomain = process.env.ANGWA_MERCHANT_DOMAIN;

  if (!baseUrl || !apiKey || !apiSecret || !merchantDomain) {
    throw new Error(
      'Angwa Pay is not configured. Set ANGWA_BASE_URL, ANGWA_API_KEY, ANGWA_API_SECRET, and ANGWA_MERCHANT_DOMAIN.'
    );
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ''),
    apiKey,
    apiSecret,
    merchantDomain,
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildRequestBody(body) {
  if (body == null) return '';
  return typeof body === 'string' ? body : JSON.stringify(body);
}

function normalizePhoneNumber(phone) {
  const digits = String(phone || '').replace(/[^\d]/g, '');
  if (digits.startsWith('2637') && digits.length === 12) return digits;
  if (digits.startsWith('07') && digits.length === 10) return '263' + digits.slice(1);
  if (digits.startsWith('7') && digits.length === 9) return '263' + digits;
  return digits;
}

function assertOmariMsisdn(phone) {
  const msisdn = normalizePhoneNumber(phone);
  if (!/^2637\d{8}$/.test(msisdn)) {
    throw new Error('Omari requires a phone number in format 2637XXXXXXXX (12 digits).');
  }
  return msisdn;
}

function providerToGatewayConfig(provider) {
  const config = PROVIDER_CONFIG[provider];
  if (!config) {
    throw new Error('Unsupported payment provider for live gateway.');
  }
  return config;
}

function signRequest({ apiSecret, timestamp, nonce, method, path, rawBody }) {
  const payload = `${timestamp}\n${nonce}\n${String(method).toUpperCase()}\n${path}\n${rawBody}`;
  const signature = crypto.createHmac('sha256', apiSecret).update(payload).digest('hex');
  return { payload, signature };
}

async function requestGateway(method, path, body) {
  const { baseUrl, apiKey, apiSecret, merchantDomain } = getConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomUUID();
  const rawBody = buildRequestBody(body);
  const { signature } = signRequest({
    apiSecret,
    timestamp,
    nonce,
    method,
    path,
    rawBody,
  });

  const response = await fetch(baseUrl + path, {
    method,
    headers: {
      'X-API-KEY': apiKey,
      'X-TIMESTAMP': timestamp,
      'X-NONCE': nonce,
      'X-SIGNATURE': signature,
      'X-Merchant-Domain': merchantDomain,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: rawBody || undefined,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = { message: 'Invalid gateway response.' };
  }

  if (!response.ok) {
    const detail = Array.isArray(data.details) ? data.details.join(' ') : '';
    const message =
      data.message ||
      data.error ||
      detail ||
      `Gateway request failed (${response.status}).`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

function createMerchantReference(prefix) {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

async function createOmariDeposit({ amount, phone }) {
  const phoneNumber = assertOmariMsisdn(phone);
  const body = {
    amount,
    currency: 'USD',
    product: 'OMARI',
    phoneNumber,
    reference: createMerchantReference('dep'),
    idempotencyKey: crypto.randomUUID(),
  };

  return requestGateway('POST', '/api/v1/payments/deposits', body);
}

async function createDeposit({ provider, amount, phone }) {
  if (provider === 'Voucher') {
    throw new Error('Voucher deposits are not supported through the live payment gateway.');
  }
  if (provider === 'Omari') {
    return createOmariDeposit({ amount, phone });
  }

  const config = providerToGatewayConfig(provider);
  const body = {
    amount,
    currency: 'USD',
    product: config.product,
    phoneNumber: normalizePhoneNumber(phone),
    reference: createMerchantReference('dep'),
    idempotencyKey: crypto.randomUUID(),
  };

  if (provider === 'EcoCash') {
    body.provider = process.env.ANGWA_ECOCASH_DEPOSIT_PROVIDER || 'ECOCASH_DIRECT';
  }

  return requestGateway('POST', '/api/v1/payments/deposits', body);
}

async function createWithdrawal({ provider, amount, phone, user }) {
  const config = providerToGatewayConfig(provider);
  const body = {
    amount,
    currency: 'USD',
    product: config.product,
    phoneNumber: normalizePhoneNumber(phone),
    reference: createMerchantReference('wdr'),
    idempotencyKey: crypto.randomUUID(),
  };

  if (provider === 'EcoCash') {
    // MERCHANT_AND_ECOPAY companies: withdrawals → ECOPAY bulk (default).
    // PayPulse-only companies: set ANGWA_ECOCASH_WITHDRAW_PROVIDER=PAYPULSE_ECOCASH
    const ecocashProvider = process.env.ANGWA_ECOCASH_WITHDRAW_PROVIDER || 'ECOPAY';
    body.provider = ecocashProvider;

    if (ecocashProvider === 'ECOPAY') {
      if (!user.firstName || !user.surname || !user.nationalId) {
        throw new Error(
          'EcoCash withdrawal requires your registered first name, surname, and national ID.'
        );
      }
      body.recipientFirstName = user.firstName;
      body.recipientLastName = user.surname;
      body.recipientIdNumber = user.nationalId;
    }
  }

  if (provider === 'OneMoney') {
    body.recipientFirstName = user.firstName;
    body.recipientLastName = user.surname;
    body.recipientIdNumber = user.nationalId;
  }

  return requestGateway('POST', '/api/v1/payments/withdrawals', body);
}

async function getPaymentStatus(reference) {
  return requestGateway('GET', `/api/v1/payments/${encodeURIComponent(reference)}/status`, '');
}

async function confirmOmariDeposit({ reference, otp, phone }) {
  const body = {
    otp: String(otp || '').trim(),
    msisdn: assertOmariMsisdn(phone),
  };
  return requestGateway(
    'POST',
    `/api/v1/payments/${encodeURIComponent(reference)}/omari/confirm`,
    body
  );
}

async function waitForFinalStatus(reference) {
  let lastStatus = null;

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    lastStatus = await getPaymentStatus(reference);
    if (lastStatus.terminal) {
      return lastStatus;
    }
    await sleep(POLL_INTERVAL_MS);
  }

  return lastStatus;
}

module.exports = {
  createDeposit,
  createWithdrawal,
  getPaymentStatus,
  confirmOmariDeposit,
  normalizePhoneNumber,
  waitForFinalStatus,
  isConfigured,
  LIVE_DEPOSIT_PROVIDERS,
  LIVE_WITHDRAWAL_PROVIDERS,
};

/**
 * Input validation helpers for auth and wallet endpoints.
 */

const PAYMENT_PROVIDERS = ['Voucher', 'EcoCash', 'Omari', 'InnBucks', 'OneMoney'];

function trimString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validatePersonalDetails({ firstName, surname, phone, nationalId }) {
  const errors = [];
  const data = {
    firstName: trimString(firstName),
    surname: trimString(surname),
    phone: trimString(phone),
    nationalId: trimString(nationalId),
  };

  if (!data.firstName || data.firstName.length < 2) {
    errors.push('First name must be at least 2 characters.');
  }
  if (!data.surname || data.surname.length < 2) {
    errors.push('Surname must be at least 2 characters.');
  }
  if (!/^\+?[0-9]{9,15}$/.test(data.phone.replace(/\s/g, ''))) {
    errors.push('Enter a valid phone number (9–15 digits).');
  } else {
    data.phone = data.phone.replace(/\s/g, '');
  }
  if (!/^[A-Za-z0-9-]{5,20}$/.test(data.nationalId)) {
    errors.push('National ID must be 5–20 alphanumeric characters.');
  }

  return { errors, data };
}

function validateAccountCreation({ username, password, confirmPassword }) {
  const errors = [];
  const data = {
    username: trimString(username),
    password: typeof password === 'string' ? password : '',
    confirmPassword: typeof confirmPassword === 'string' ? confirmPassword : '',
  };

  if (!/^[A-Za-z0-9_]{3,30}$/.test(data.username)) {
    errors.push('Username must be 3–30 characters (letters, numbers, underscore).');
  }
  if (data.password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }
  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match.');
  }

  return { errors, data };
}

function validateLogin({ username, password }) {
  const errors = [];
  const data = {
    username: trimString(username),
    password: typeof password === 'string' ? password : '',
  };

  if (!data.username) errors.push('Username is required.');
  if (!data.password) errors.push('Password is required.');

  return { errors, data };
}

function validateWalletTransaction({ provider, phone, amount }) {
  const errors = [];
  const data = {
    provider: trimString(provider),
    phone: trimString(phone),
    amount: Number(amount),
  };

  if (!PAYMENT_PROVIDERS.includes(data.provider)) {
    errors.push('Select a valid payment provider.');
  }
  if (!/^\+?[0-9]{9,15}$/.test(data.phone.replace(/\s/g, ''))) {
    errors.push('Enter a valid phone number.');
  } else {
    data.phone = data.phone.replace(/\s/g, '');
  }
  if (!Number.isFinite(data.amount) || data.amount <= 0) {
    errors.push('Amount must be greater than zero.');
  } else {
    data.amount = Math.round(data.amount * 100) / 100;
  }

  return { errors, data };
}

module.exports = {
  PAYMENT_PROVIDERS,
  validatePersonalDetails,
  validateAccountCreation,
  validateLogin,
  validateWalletTransaction,
};

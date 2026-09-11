const DEFAULT_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

const uuidv7 = (): string => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Prepend current Unix timestamp in milliseconds (48 bits)
  const timestamp = Date.now();
  bytes[0] = (timestamp / 0x10000000000) & 0xff;
  bytes[1] = (timestamp / 0x100000000) & 0xff;
  bytes[2] = (timestamp / 0x1000000) & 0xff;
  bytes[3] = (timestamp / 0x10000) & 0xff;
  bytes[4] = (timestamp / 0x100) & 0xff;
  bytes[5] = timestamp & 0xff;

  // Enforce Version 7 and Variant 1 rules
  bytes[6] = (bytes[6] & 0x0f) | 0x70; // Set version to 0111 (7)
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Set variant to 10xx

  // Stringify the byte array
  return [...bytes].map((b, i) => {
    let s = b.toString(16).padStart(2, '0');
    if ([3, 5, 7, 9].includes(i)) s += '-';
    return s;
  }).join('');
};

const uuidToBytes = (uuid: string): Uint8Array => {
  const hex = uuid.replace(/-/g, '');
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, (i * 2) + 2), 16);
  }
  return bytes;
};

const bytesToInt = (bytes: Uint8Array): bigint => {
  let result = 0n;
  for (let i = 0; i < bytes.length; i++) {
    result = (result << 8n) + BigInt(bytes[i]);
  }
  return result;
}

const stringToInt = (str: string, alphabet: string): bigint => {
  const base = BigInt(alphabet.length);
  let result = 0n;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const value = alphabet.indexOf(char);
    if (value === -1) {
      throw new Error(`Character '${char}' not found in alphabet`);
    }
    result = result * base + BigInt(value);
  }

  return result;
}

const intToString = (num: bigint, alphabet: string): string => {
  if (num === 0n) {
    return alphabet[0];
  }

  const base = BigInt(alphabet.length);
  let result = '';
  let n = num;

  while (n > 0n) {
    const remainder = Number(n % base);
    result = alphabet[remainder] + result;
    n = n / base;
  }

  return result;
};

const intToBytes = (num: bigint, length = 16): Uint8Array => {
  const bytes = new Uint8Array(length);
  let n = num;
  for (let i = length - 1; i >= 0; i--) {
    bytes[i] = Number(n & 0xffn);
    n >>= 8n;
  }
  return bytes;
}

const bytesToUuid = (bytes: Uint8Array): string => {
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32)
  ].join('-');
};

class ShortUUID {
  readonly #alphabet: string;

  constructor(alphabet = DEFAULT_ALPHABET) {
    this.#alphabet = alphabet;
  }

  get alphabet(): string {
    return this.#alphabet;
  }

  uuid(): string {
    return this.encode(uuidv7());
  }

  encode(uuid: string): string {
    const bytes = uuidToBytes(uuid);
    const num = bytesToInt(bytes);
    return intToString(num, this.#alphabet);
  }

  decode(str: string): string {
    let decodeString = str;

    const num = stringToInt(decodeString, this.#alphabet);
    const bytes = intToBytes(num, 16);
    return bytesToUuid(bytes);
  }
}

const shortuuid = new ShortUUID();

const encode = (uuid: string): string => shortuuid.encode(uuid);

const decode = (str: string): string => shortuuid.decode(str);

const shortid = (): string => encode(uuidv7());

export { uuidv7, shortid, encode, decode };

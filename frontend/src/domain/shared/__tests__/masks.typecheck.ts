/**
 * Type-check tests for domain/shared/masks.ts
 */
import { digitsOnly, maskCep, maskPhone, maskDocument } from '../masks';

// digitsOnly: value → string
const digits: string = digitsOnly('abc-123');

// maskCep: value → string
const cep: string = maskCep('01310100');

// maskPhone: value → string
const phone: string = maskPhone('11999998888');

// maskDocument: value → string
const doc: string = maskDocument('12345678901');

// Suppress unused variable warnings
void digits;
void cep;
void phone;
void doc;

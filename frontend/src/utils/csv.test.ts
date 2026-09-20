import { describe, it, expect } from 'vitest';
import { escapeCsvField } from './csv';

describe('escapeCsvField', () => {
  it('handles null and undefined', () => {
    expect(escapeCsvField(null)).toBe('""');
    expect(escapeCsvField(undefined)).toBe('""');
  });

  it('escapes injection characters', () => {
    expect(escapeCsvField('=cmd')).toBe('"\'=cmd"');
    expect(escapeCsvField('+123')).toBe('"\'+123"');
    expect(escapeCsvField('-123')).toBe('"\'-123"');
    expect(escapeCsvField('@ref')).toBe('"\'@ref"');
  });

  it('escapes double quotes inside the string', () => {
    expect(escapeCsvField('hello "world"')).toBe('"hello ""world"""');
  });

  it('wraps normal strings in quotes', () => {
    expect(escapeCsvField('hello world')).toBe('"hello world"');
  });
});

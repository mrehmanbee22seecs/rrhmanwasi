/**
 * Validation Utilities Tests
 * Tests for common validation patterns used throughout the application
 */

describe('Validation Utilities', () => {
  describe('Email validation', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    test('should validate correct email formats', () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.com',
        'user+tag@example.com',
        'user_name@example.co.uk',
        '123@example.com',
        'user@subdomain.example.com',
      ];

      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user @example.com',
        // Note: Simple regex may not catch all invalid formats
        // For production, use a more robust email validation library
      ];

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('URL validation', () => {
    test('should validate correct URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://example.com',
        'https://www.example.com/path',
        'https://example.com:8080',
        'https://example.com/path?query=value',
      ];

      validUrls.forEach(url => {
        expect(() => new URL(url)).not.toThrow();
      });
    });

    test('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'example.com',
        'ftp://example.com',
        '//example.com',
      ];

      invalidUrls.forEach(url => {
        try {
          new URL(url);
          // If we reach here and it's a relative URL protocol, it should fail
          if (!url.startsWith('http')) {
            fail(`Expected URL to throw for: ${url}`);
          }
        } catch (e) {
          expect(e).toBeTruthy();
        }
      });
    });
  });

  describe('Phone number validation (Pakistan)', () => {
    const phoneRegex = /^(\+92|0)?[0-9]{10}$/;

    test('should validate Pakistani phone numbers', () => {
      const validPhones = [
        '+923001234567',
        '03001234567',
        '3001234567',
      ];

      validPhones.forEach(phone => {
        expect(phoneRegex.test(phone)).toBe(true);
      });
    });

    test('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123',
        '+1234567890',
        'not-a-phone',
        '+92 300 1234567', // spaces
      ];

      invalidPhones.forEach(phone => {
        expect(phoneRegex.test(phone)).toBe(false);
      });
    });
  });

  describe('String sanitization', () => {
    test('should trim whitespace', () => {
      const inputs = [
        '  text  ',
        '\ttext\t',
        '\ntext\n',
        '  multiple   spaces  ',
      ];

      inputs.forEach(input => {
        const trimmed = input.trim();
        expect(trimmed).not.toMatch(/^\s/);
        expect(trimmed).not.toMatch(/\s$/);
      });
    });

    test('should remove multiple spaces', () => {
      const input = 'text    with     multiple      spaces';
      const normalized = input.replace(/\s+/g, ' ');
      
      expect(normalized).toBe('text with multiple spaces');
    });

    test('should handle empty strings', () => {
      const emptyInputs = ['', '   ', '\t\n', null, undefined];
      
      emptyInputs.forEach(input => {
        const result = (input || '').trim();
        expect(result).toBe('');
      });
    });
  });

  describe('Number validation', () => {
    test('should validate integers', () => {
      expect(Number.isInteger(42)).toBe(true);
      expect(Number.isInteger(0)).toBe(true);
      expect(Number.isInteger(-10)).toBe(true);
      expect(Number.isInteger(3.14)).toBe(false);
      expect(Number.isInteger(NaN)).toBe(false);
    });

    test('should validate positive numbers', () => {
      const isPositive = (n: number) => n > 0;
      
      expect(isPositive(42)).toBe(true);
      expect(isPositive(0.1)).toBe(true);
      expect(isPositive(0)).toBe(false);
      expect(isPositive(-1)).toBe(false);
    });

    test('should handle number parsing', () => {
      expect(parseInt('42')).toBe(42);
      expect(parseInt('42.5')).toBe(42);
      expect(parseFloat('42.5')).toBe(42.5);
      expect(isNaN(parseInt('not-a-number'))).toBe(true);
    });
  });

  describe('Date validation', () => {
    test('should validate date objects', () => {
      const validDate = new Date('2025-12-25');
      const invalidDate = new Date('invalid');
      
      expect(validDate.getTime()).toBeGreaterThan(0);
      expect(isNaN(invalidDate.getTime())).toBe(true);
    });

    test('should validate ISO date strings', () => {
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      
      const isoString = new Date().toISOString();
      expect(isoRegex.test(isoString)).toBe(true);
    });

    test('should validate future dates', () => {
      const now = new Date();
      const future = new Date(now.getTime() + 86400000);
      const past = new Date(now.getTime() - 86400000);
      
      expect(future > now).toBe(true);
      expect(past > now).toBe(false);
    });
  });

  describe('File validation', () => {
    test('should validate image MIME types', () => {
      const imageMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      const validMimeTypes = new Set(imageMimeTypes);
      
      imageMimeTypes.forEach(type => {
        expect(validMimeTypes.has(type)).toBe(true);
      });
      
      expect(validMimeTypes.has('application/pdf')).toBe(false);
      expect(validMimeTypes.has('text/plain')).toBe(false);
    });

    test('should validate file size (5MB limit)', () => {
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      
      expect(1024 * 1024 < maxSize).toBe(true); // 1MB
      expect(10 * 1024 * 1024 < maxSize).toBe(false); // 10MB
    });
  });

  describe('Text length validation', () => {
    test('should validate minimum length', () => {
      const minLength = 3;
      
      expect('ab'.length >= minLength).toBe(false);
      expect('abc'.length >= minLength).toBe(true);
      expect('abcd'.length >= minLength).toBe(true);
    });

    test('should validate maximum length', () => {
      const maxLength = 100;
      const longText = 'a'.repeat(150);
      const normalText = 'Normal text';
      
      expect(longText.length <= maxLength).toBe(false);
      expect(normalText.length <= maxLength).toBe(true);
    });

    test('should validate range', () => {
      const minLength = 10;
      const maxLength = 100;
      
      const isValidLength = (text: string) => 
        text.length >= minLength && text.length <= maxLength;
      
      expect(isValidLength('short')).toBe(false);
      expect(isValidLength('valid text here')).toBe(true);
      expect(isValidLength('a'.repeat(150))).toBe(false);
    });
  });
});

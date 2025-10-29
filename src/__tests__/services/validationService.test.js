import { validateBrazilPhone, validateEmail, validatePassword, validateName } from '../../services/validationService';

describe('validationService', () => {
  describe('validateBrazilPhone', () => {
    test('should accept valid phone number', () => {
      expect(validateBrazilPhone('11987654321')).toBeNull();
      expect(validateBrazilPhone('21998765432')).toBeNull();
    });

    test('should reject phone with less than 11 digits', () => {
      expect(validateBrazilPhone('1198765432')).not.toBeNull();
    });

    test('should reject phone with more than 11 digits', () => {
      expect(validateBrazilPhone('119876543210')).not.toBeNull();
    });

    test('should reject phone with invalid DDD', () => {
      expect(validateBrazilPhone('99987654321')).not.toBeNull();
    });

    test('should reject phone not starting with 9', () => {
      expect(validateBrazilPhone('11887654321')).not.toBeNull();
    });
  });

  describe('validateEmail', () => {
    test('should accept valid email', () => {
      expect(validateEmail('test@example.com')).toBeNull();
      expect(validateEmail('user.name+tag@domain.co.uk')).toBeNull();
    });

    test('should reject email without @', () => {
      expect(validateEmail('testexample.com')).toBeTruthy();
    });

    test('should reject email without domain', () => {
      expect(validateEmail('test@')).toBeTruthy();
    });

    test('should reject empty email', () => {
      expect(validateEmail('')).toBeTruthy();
    });
  });

  describe('validatePassword', () => {
    test('should accept valid password', () => {
      expect(validatePassword('pass123', 'pass123')).toBeNull();
      expect(validatePassword('MyP@ss1')).toBeNull();
    });

    test('should reject password shorter than 6 characters', () => {
      expect(validatePassword('abc12')).toBeTruthy();
    });

    test('should reject password without numbers', () => {
      expect(validatePassword('password')).toBeTruthy();
    });

    test('should reject password without letters', () => {
      expect(validatePassword('123456')).toBeTruthy();
    });

    test('should reject mismatched passwords', () => {
      expect(validatePassword('pass123', 'pass456')).toBeTruthy();
    });
  });

  describe('validateName', () => {
    test('should accept valid name', () => {
      expect(validateName('João Silva')).toBeNull();
      expect(validateName('Ana')).toBeNull();
    });

    test('should reject name with less than 2 characters', () => {
      expect(validateName('A')).toBeTruthy();
    });

    test('should reject empty name', () => {
      expect(validateName('')).toBeTruthy();
    });

    test('should reject name with only spaces', () => {
      expect(validateName('   ')).toBeTruthy();
    });
  });
});

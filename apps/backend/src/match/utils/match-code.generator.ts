export class MatchCodeGenerator {
  private static readonly CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  private static readonly CODE_LENGTH = 6;

  /**
   * Generates a random 6-character alphanumeric match code
   * @returns A string containing uppercase letters and numbers
   */
  static generateMatchCode(): string {
    let result = '';
    for (let i = 0; i < this.CODE_LENGTH; i++) {
      result += this.CHARACTERS.charAt(
        Math.floor(Math.random() * this.CHARACTERS.length)
      );
    }
    return result;
  }

  /**
   * Validates if a match code has the correct format
   * @param code The code to validate
   * @returns true if valid, false otherwise
   */
  static isValidMatchCode(code: string): boolean {
    if (!code || code.length !== this.CODE_LENGTH) {
      return false;
    }
    
    return /^[A-Z0-9]{6}$/.test(code);
  }

  /**
   * Formats a match code for display (adds hyphen in middle)
   * @param code The raw match code
   * @returns Formatted code like "ABC-123"
   */
  static formatForDisplay(code: string): string {
    if (!this.isValidMatchCode(code)) {
      return code;
    }
    
    return `${code.slice(0, 3)}-${code.slice(3)}`;
  }

  /**
   * Removes formatting from a match code
   * @param formattedCode A code that might have hyphens or be lowercase
   * @returns Clean uppercase code without hyphens
   */
  static cleanCode(formattedCode: string): string {
    return formattedCode.replace(/[-\s]/g, '').toUpperCase();
  }
}
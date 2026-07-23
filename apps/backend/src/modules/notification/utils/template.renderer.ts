import { logger } from '../../../shared/logger';

export class TemplateRenderer {
  /**
   * Replaces placeholders like {{learnerName}} with values from the payload object.
   * If a placeholder is missing in the payload, it logs a warning and leaves it untouched.
   */
  public static render(templateString: string, payload: Record<string, string>): string {
    if (!templateString) return '';
    
    return templateString.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => {
      if (payload[key] !== undefined) {
        return payload[key];
      } else {
        logger.warn(`TemplateRenderer: Missing payload key for placeholder '${key}'`);
        return match; // Leave untouched
      }
    });
  }
}

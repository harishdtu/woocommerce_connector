import { describe, expect, it } from 'vitest';
import { ALLOWED_TOOLS, isAllowedToolName } from '../../src/tools/toolRegistry.js';
import { buildSecurityReview } from '../../src/security/review.js';

describe('security boundaries', () => {
  it('allows only the read-only tool list', () => {
    for (const tool of ALLOWED_TOOLS) {
      expect(isAllowedToolName(tool)).toBe(true);
    }
    expect(isAllowedToolName('woo_create_order')).toBe(false);
    expect(isAllowedToolName('woo_refund_order')).toBe(false);
  });

  it('blocks mutation intent even if disguised', () => {
    expect(isAllowedToolName('delete_order')).toBe(false);
    expect(isAllowedToolName('payment_modification')).toBe(false);
  });

  it('builds a security report with expected checks', () => {
    const report = buildSecurityReview();
    expect(report.readOnly).toBe(true);
    expect(report.allowListEnabled).toBe(true);
    expect(report.arbitraryEndpointBlocked).toBe(true);
  });

  it('rejects unsupported operations', () => {
    expect(() => {
      const tool = 'woo_create_order';
      if (!isAllowedToolName(tool)) {
        throw new Error('unsupported operation');
      }
    }).toThrow();
  });

  it('keeps tool surface bounded', () => {
    expect(ALLOWED_TOOLS.length).toBe(7);
  });
});

/**
 * Copyright IBM Corp. 2018, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @jest-environment node
 */

'use strict';

const { convert, createSassRenderer } = require('@carbon/test-utils/scss');
const { themes } = require('../src');

const render = createSassRenderer(__dirname);

describe('_mixins.scss', () => {
  it('should export a carbon--theme mixin', async () => {
    const { calls } = await render(`
      @import '../scss/mixins';

      $t: test(mixin-exists(carbon--theme));
    `);

    for (const call of calls) {
      expect(call[0].getValue()).toBe(true);
    }
  });

  it('should set token variables for the given theme', async () => {
    const themeTests = Object.keys(themes).map((key) => {
      const variable = `$carbon--theme--${key}`;
      const test = `
        @include carbon--theme(${variable}) {
          $t: test($interactive-01);
        }
      `;
      return [variable, themes[key].interactive01, test];
    });
    const tests = themeTests
      .map(([_variable, _expectedColor, test]) => test)
      .join('\n');
    const { calls } = await render(`
      @import '../scss/themes';
      ${tests}
    `);

    themeTests.forEach(([_variable, expectedColor], i) => {
      expect(convert(calls[i][0])).toBe(expectedColor);
    });
  });

  it('should set token variables for the given theme', async () => {
    const themeTests = Object.keys(themes).map((key) => {
      const variable = `$carbon--theme--${key}`;
      const test = `
        $feature-flags: (enable-css-custom-properties: true);
        @include carbon--theme(${variable}) {
          $t: test($field-01);
        }
      `;
      return [variable, themes[key].interactive01, test];
    });
    const tests = themeTests
      .map(([_variable, _expectedColor, test]) => test)
      .join('\n');
    const { calls } = await render(`
      @import '../scss/themes';
      ${tests}
    `);
    const colors = calls.map(([call]) => convert(call));
    themeTests.forEach((_, i) => {
      expect(convert(calls[i][0])).toBe(`${colors[i]}`);
    });
  });

  it('should reset token variables after using the theme', async () => {
    const { calls } = await render(`
      @import '../scss/themes';

      $custom-theme: map-merge($carbon--theme--white, (
        interactive-01: #ffffff,
      ));

      $t: test($interactive-01);

      @include carbon--theme($custom-theme) {
        $t: test($interactive-01);
      }

      $t: test($interactive-01);
    `);

    const colors = calls.map((call) => convert(call[0]));
    expect(colors[0]).toEqual(colors[2]);
    expect(colors[1]).toBe('#ffffff');
  });

  it('should reset token variables after using the theme with css custom properties', async () => {
    const { calls } = await render(`
      $feature-flags: (enable-css-custom-properties: true);

      @import '../scss/themes';

      $custom-theme: map-merge($carbon--theme--white, (
        interactive-01: #ffffff,
      ));

      $t: test($interactive-01);

      @include carbon--theme($custom-theme) {
        $t: test($interactive-01);
      }

      $t: test($interactive-01);
    `);

    const colors = calls.map(([call]) => convert(call));
    expect(colors[1]).toBe('var(--cds-interactive-01, #ffffff)');
    expect(colors[2]).toBe(`var(--cds-interactive-01, ${colors[0]})`);
  });

  it('should set the global carbon--theme to match the given theme', async () => {
    const { calls } = await render(`
      @import '../scss/themes';
      $carbon--theme: ( value-01: #000000 );
      $custom-theme: ( value-01: #ffffff );

      @include carbon--theme($custom-theme) {
        $t: test($carbon--theme);
      }

      $t: test($carbon--theme);
    `);

    const [custom, reset] = calls.map(([call]) => convert(call));
    expect(custom['value-01']).toBe('#ffffff');
    expect(reset['value-01']).toBe('#000000');
  });

  describe('@mixin custom-property', () => {
    it('should create a custom property for a given token name and value', async () => {
      const { result } = await render(`
        @import '../scss/mixins';
        .selector {
          @include custom-property('token-01', #000000);
        }
      `);

      expect(result.css.toString()).toEqual(
        expect.stringContaining('--cds-token-01: #000000;')
      );
    });

    it('should export multiple tokens for maps', async () => {
      const { result } = await render(`
        @import '../scss/mixins';
        .selector {
          @include custom-property('token-01', (
            property-01: #000000,
            property-02: #ffffff,
          ));
        }
      `);

      const output = result.css.toString();
      expect(output).toEqual(
        expect.stringContaining('--cds-token-01-property-01: #000000')
      );
      expect(output).toEqual(
        expect.stringContaining('--cds-token-01-property-02: #ffffff')
      );
    });
  });

  describe('@function should-emit', () => {
    it('should emit a value only if they are different', async () => {
      const { calls } = await render(`
        @import '../scss/mixins';

        $theme-a: (
          property-01: #000000,
          property-02: #ffffff,
          property-03: (
            sub-property-01: 16px,
          ),
          property-04: (
            sub-property-01: 16px,
          ),
        );
        $theme-b: (
          property-01: #343434,
          property-02: #ffffff,
          property-03: (
            sub-property-01: 16px,
          ),
          property-04: (
            sub-property-01: 20px,
          ),
        );

        // The properties are different, so should emit
        $t: test(should-emit($theme-a, $theme-b, 'property-01', true));
        $t: test(should-emit($theme-a, $theme-b, 'property-04', true));

        // The properties are the same so should not emit
        $t: test(should-emit($theme-a, $theme-b, 'property-02', true));
        $t: test(should-emit($theme-a, $theme-b, 'property-03', true));
      `);

      expect(convert(calls[0][0])).toBe(true);
      expect(convert(calls[1][0])).toBe(true);
      expect(convert(calls[2][0])).toBe(false);
      expect(convert(calls[3][0])).toBe(false);
    });
  });
});

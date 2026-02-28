

## [0.1.2-beta.1] - 2026-02-28

### Bug Fixes

- Wrong repo name by vrdons (5efa1da)
- Improve error logging for loading paths by randseas (87018ce)

### Dependencies

- Bump oxfmt from 0.26.0 to 0.27.0 ([#20](https://github.com/AroxBot/framework/pull/20)) by dependabot[bot] (78b5e9f)
- Bump oxlint-tsgolint from 0.11.1 to 0.11.3 ([#19](https://github.com/AroxBot/framework/pull/19)) by dependabot[bot] (dd1595c)
- Bump oxlint from 1.41.0 to 1.42.0 ([#18](https://github.com/AroxBot/framework/pull/18)) by dependabot[bot] (eacab34)
- Bump @types/node from 25.0.10 to 25.1.0 ([#17](https://github.com/AroxBot/framework/pull/17)) by dependabot[bot] (398bb31)
- Bump libnpmpack from 9.0.13 to 9.1.1 ([#28](https://github.com/AroxBot/framework/pull/28)) by dependabot[bot] (3e47cdd)
- Bump @types/node from 25.1.0 to 25.2.3 ([#29](https://github.com/AroxBot/framework/pull/29)) by dependabot[bot] (6dcaeae)
- Bump i18next from 25.8.0 to 25.8.5 ([#30](https://github.com/AroxBot/framework/pull/30)) by dependabot[bot] (bb91d53)
- Bump @swc/cli from 0.7.10 to 0.8.0 ([#33](https://github.com/AroxBot/framework/pull/33)) by dependabot[bot] (bc80350)
- Bump oxlint-tsgolint from 0.11.3 to 0.12.0 ([#31](https://github.com/AroxBot/framework/pull/31)) by dependabot[bot] (7dfb461)
- Bump oxlint from 1.42.0 to 1.46.0 ([#32](https://github.com/AroxBot/framework/pull/32)) by dependabot[bot] (8d35b4a)
- Bump oxfmt from 0.27.0 to 0.31.0 ([#34](https://github.com/AroxBot/framework/pull/34)) by dependabot[bot] (26dcd16)
- Bump @types/node from 25.2.3 to 25.3.0 ([#36](https://github.com/AroxBot/framework/pull/36)) by dependabot[bot] (58e6756)
- Bump oxlint from 1.47.0 to 1.48.0 ([#37](https://github.com/AroxBot/framework/pull/37)) by dependabot[bot] (f3836ab)
- Bump oxfmt from 0.32.0 to 0.33.0 ([#38](https://github.com/AroxBot/framework/pull/38)) by dependabot[bot] (7e9510b)
- Bump i18next from 25.8.7 to 25.8.11 ([#40](https://github.com/AroxBot/framework/pull/40)) by dependabot[bot] (a6b0250)
- Bump oxlint-tsgolint from 0.12.0 to 0.14.0 ([#39](https://github.com/AroxBot/framework/pull/39)) by dependabot[bot] (d909e7e)
- Bump libnpmpack from 9.1.1 to 9.1.3 ([#42](https://github.com/AroxBot/framework/pull/42)) by dependabot[bot] (128364e)
- Bump @swc/helpers from 0.5.18 to 0.5.19 ([#43](https://github.com/AroxBot/framework/pull/43)) by dependabot[bot] (4035d3f)
- Bump @types/node from 25.3.0 to 25.3.1 ([#44](https://github.com/AroxBot/framework/pull/44)) by dependabot[bot] (09ea8e3)
- Bump oxlint from 1.48.0 to 1.50.0 ([#45](https://github.com/AroxBot/framework/pull/45)) by dependabot[bot] (40d0858)
- Bump i18next from 25.8.11 to 25.8.13 ([#46](https://github.com/AroxBot/framework/pull/46)) by dependabot[bot] (26abe6e)
- Bump @types/lodash from 4.17.23 to 4.17.24 ([#47](https://github.com/AroxBot/framework/pull/47)) by dependabot[bot] (12b17fe)
- Bump oxlint-tsgolint from 0.14.2 to 0.15.0 ([#48](https://github.com/AroxBot/framework/pull/48)) by dependabot[bot] (5ad3b70)
- Bump oxfmt from 0.33.0 to 0.35.0 ([#49](https://github.com/AroxBot/framework/pull/49)) by dependabot[bot] (fbde8d7)
- Migrate build system to esbuild and oxc by vrdons (625343f)
- Remove @types/node by vrdons (4c2b863)

### Miscellaneous Tasks

- Fix lint check on every pr\nNo need for extra resource by vrdons (6835b09)

### Refactor

- Command builder ([#21](https://github.com/AroxBot/framework/pull/21)) by vrdons (17a1bcd)
- Remove lodash and update dependabot config by vrdons (ad0ef4d)

### Styling

- Remove header from cliff-toml by vrdons (9d08758)


## [0.1.1] - 2026-01-25

### Bug Fixes

- Use stdin for release notes to prevent shell injection by vrdons (3300d6f)

### Dependencies

- Bump oxlint from 1.39.0 to 1.41.0 ([#8](https://github.com/AroxBot/framework/pull/8)) by dependabot[bot] (6dad104)
- Bump @types/node from 25.0.8 to 25.0.10 ([#9](https://github.com/AroxBot/framework/pull/9)) by dependabot[bot] (512e282)
- Bump libnpmpack from 9.0.12 to 9.0.13 ([#10](https://github.com/AroxBot/framework/pull/10)) by dependabot[bot] (a626989)
- Bump oxfmt from 0.24.0 to 0.26.0 ([#11](https://github.com/AroxBot/framework/pull/11)) by dependabot[bot] (ddbef07)

### Feat

- I18next ([#7](https://github.com/AroxBot/framework/pull/7)) by Fhyrox (c3e33a8)

### Ci

- Fix releasing commit ([#5](https://github.com/AroxBot/framework/pull/5)) by vrdons (0c08a88)


## [0.1.0] - 2026-01-18

### Features

- Basic BaseClient (temp) by vrdons (ba204f5)
- Logger with log level option by vrdons (a5e3844)

### Refactor

- Implement class-based structure with hybrid command support ([#2](https://github.com/AroxBot/framework/pull/2)) by Fhyrox (a0ee32c)


## [0.1.0-alpha.2] - 2026-01-15

### Miscellaneous Tasks

- Weekly update by github-actions[bot] (8e7f6b8)
- Update checkVersionExists script by vrdons (73eef8b)
- Fix silly errors by vrdons (042ec4c)
- Fix silly errors part 2 by vrdons (7d0650b)
- Do not use generateNpmrc by vrdons (4a9596f)
- Update createRelease function by vrdons (74afa91)

### Styling

- Update formatting changelog by vrdons (b8f6d09)

### Ci

- Fix "You must specify a tag using --tag when publishing a prerelease version" by vrdons (ae017ee)
- Add npm support by vrdons (010b19d)
- Use OIDC to publish npm by vrdons (79d1493)
- Add husky by vrdons (740c9a6)


## [0.1.0-alpha.1] - 2026-01-15

### Bug Fixes

- Npm build script by vrdons (6f235e3)

### Features

- Github Release by vrdons (80f4b1d)

### Miscellaneous Tasks

- Base template by vrdons (473e8a6)
- Dont ignore package-lock.json by vrdons (f6d2e9e)
- Add Error handling by vrdons (0525018)

### Ci

- Fix checking code by vrdons (310c4e1)
- Fix releasing github by vrdons (6b70d45)
- Move github-release to check by vrdons (9565461)

<!-- generated by git-cliff -->

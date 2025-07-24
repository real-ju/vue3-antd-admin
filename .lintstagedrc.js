export default {
  'src/**/*.{js,json,ts,tsx,css,less,scss,vue,html,md}': 'prettier --write',
  'src/**/*.{js,ts,tsx,vue}': 'eslint --cache --fix',
  'types/**/*.{d.ts,ts}': ['prettier --write', 'eslint --cache --fix']
};

export enum LightColors {
  primary500 = '#6075e2',
  primary50 = '#eff5fe',
  primary100 = '#e3ecfc',
  primary200 = '#ccdbf9',
  primary300 = '#acc3f5',
  primary400 = '#8ba2ee',
  primary600 = '#545fd7',
  primary700 = '#454dbd',
  primary800 = '#3a4199',
  primary900 = '#353c7a',
  primary950 = '#1f2247',
  black = '#010101',
  tips = '#999999',
  title = '#606770',
  white = '#ffffff',
  disable = 'rgb(221, 221, 221)',
  opacity = 'transparent',
  pageBg = '#F3F3F3',
}

export enum DarkColors {
  primary500 = '#545fd7',
  black = 'rgba(255, 255, 255, 0.5)',
  tips = '#757575',
  title = 'rgba(255, 255, 255, 0.6)',
  white = 'rgba(255, 255, 255, 0.7)',
  disable = '#4D4D4D',
  opacity = 'transparent',
  pageBg = '#4b4b4b',
}

const selectColor = (isDark?: boolean) => (isDark ? DarkColors : LightColors);

export default selectColor;

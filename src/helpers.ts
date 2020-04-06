const utc2date = (value: number | Date): Date => {
    return value instanceof Date ? value : new Date(value * 1000);
  },
  day = (utc: number | Date): String => {
    return [
      'Vasárnap',
      'Hétfő',
      'Kedd',
      'Szerda',
      'Csütörtök',
      'Péntek',
      'Szombat'
    ][utc2date(utc).getDay()];
  },
  leadingZero = (n: number) => {
    return `0${n}`.slice(-2);
  },
  formatDate = (value: number | Date, appendDay = true): String => {
    let date = utc2date(value);
    return `${
      date.getFullYear() == new Date().getFullYear()
        ? ''
        : `${date.getFullYear()}. `
    }${leadingZero(date.getMonth() + 1)}. ${leadingZero(date.getDate())}.${
      appendDay ? `, ${day(value)}` : ''
    }`;
  },
  formatTime = (utc: number): String => {
    const date = utc2date(utc);
    return `${leadingZero(date.getHours())}:${leadingZero(date.getMinutes())}`;
  };
export { formatDate, day, utc2date, formatTime };

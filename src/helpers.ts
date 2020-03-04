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
  formatDate = (value: number | Date, appendDay = true): String => {
    let date = utc2date(value);
    return `${
      date.getFullYear() == new Date().getFullYear()
        ? ''
        : `${date.getFullYear()}. `
    }${`0${date.getMonth() + 1}`.slice(-2)}. ${`0${date.getDate()}`.slice(
      -2
    )}.${appendDay ? `, ${day(value)}` : ''}`;
  },
  formatTime = (utc: number): String => {
    return utc2date(utc)
      .toLocaleTimeString()
      .slice(0, -3);
  };

export { formatDate, day, utc2date, formatTime };

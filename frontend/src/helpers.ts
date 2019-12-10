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
  toldyLink = (value: string) => {
    if (/* isToldy() */ value) {
      let link = value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''),
        map = {
          'dr ': '',
          'attila dezso': 'attila',
          'csilla margit': 'csilla',
          'tamas miklos': 'tamas',
          'erika julianna': 'erika',
          zsuzsanna: 'zsuzsa',
          'laszlo elemerne': 'laszlone'
        };
      for (let key in map) {
        link = link.replace(key, map[key]);
      }
      let arr = link.split(' ');
      if (arr.length > 3) arr.pop();
      link = arr.join('-');
      return `<a href="http://www.toldygimnazium.hu/szerzo/${link}">${value}</a>`;
    }
    return value;
  },
  formatTime = (utc: number, sec = true): String => {
    return utc2date(utc)
      .toLocaleTimeString()
      .substr(0, sec ? 8 : -3);
  };

export { formatDate, day, toldyLink, utc2date, formatTime };

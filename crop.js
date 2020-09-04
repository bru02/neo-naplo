const gm = require('gm');

var imageMagick = gm.subClass({ imageMagick: true });

const fs = require('fs');
const directory = './src/assets';
const sizes = [563, 900, 1185, 1785].reverse();
const names = ['sm', 'md', 'lg', 'xl'].reverse();
fs.readdirSync(`${directory}/subject-bg`) /*.slice(0, 1)*/
  .forEach(async (file) => {
    const path = `${directory}/subject-bg/${file}`;
    imageMagick(path).size((er, val) => {
      if (val) {
        console.log(val);
        // const [w, h] = val.size.split('x')

        for (let i = 0; i < 4; i++) {
          const width = sizes[i],
            fn = `${directory}/resized/${file.split('.jpg')[0]}-${
              names[i]
            }.jpg`;

          imageMagick(path)
            .resize(width)
            .write(fn, () => {
              const img2 = imageMagick(fn).size((er, { height }) => {
                console.log(height);
                img2
                  .crop(width, 300, 0, Math.max(0, (height - 300) / 2))
                  .write(fn, () => {});
              });
            });
        }
      } else {
        console.error(`Fuck ${file}: ${er}`);
      }
    });
  });

/*
      'sm': 600px,
    'md': 960px,
    'lg': 1280px - 16px,
        'xl': 1920px - 16px

      (
          sm: 563
    'md': map-get($grid-breakpoints, 'md') * 0.9375, = 900
    'lg': map-get($grid-breakpoints, 'lg') * 0.9375, = 1185
    'xl': map-get($grid-breakpoints, 'xl') * 0.9375 = 1785
  ),
    */

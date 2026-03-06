import {
  array,
  between,
  date,
  nullable,
  number,
  object,
  oneOf,
  sized,
  string,
  urlString,
} from 'decoders';

const stringWithLength = (min: number, max: number) => sized(string, { min, max });

const imageDecoder = object({
  id: number,
  created: date,
  title: stringWithLength(1, 100),
  type: oneOf(['jpg', 'png']),
  size: number,
  url: urlString,
});

const ratingDecoder = object({
  id: number,
  stars: between(1, 5),
  title: stringWithLength(1, 100),
  text: stringWithLength(1, 1000),
  images: array(imageDecoder),
});

const productDecoder = object({
  id: number,
  created: date,
  title: stringWithLength(1, 100),
  brand: stringWithLength(1, 30),
  description: stringWithLength(1, 500),
  price: between(1, 10000),
  discount: nullable(between(1, 100)),
  quantity: between(1, 10),
  tags: array(stringWithLength(1, 30)),
  images: array(imageDecoder),
  ratings: array(ratingDecoder),
});

productDecoder.verify({});

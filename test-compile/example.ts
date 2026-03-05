import { object, number, date, string, array, oneOf, nullable, urlString } from "decoders";

const stringWithLength = (min: number, max: number) =>
  string.refine(
    (value) => value.length >= min && value.length <= max,
    `string must be between ${min} and ${max} characters`,
  );

const numberInRange = (min: number, max: number) =>
  number.refine(
    (value) => value >= min && value <= max,
    `number must be between ${min} and ${max}`,
  );

const imageDecoder = object({
  id: number,
  created: date,
  title: stringWithLength(1, 100),
  type: oneOf(["jpg", "png"]),
  size: number,
  url: urlString,
});

const ratingDecoder = object({
  id: number,
  stars: numberInRange(1, 5),
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
  price: numberInRange(1, 10000),
  discount: nullable(numberInRange(1, 100)),
  quantity: numberInRange(1, 10),
  tags: array(stringWithLength(1, 30)),
  images: array(imageDecoder),
  ratings: array(ratingDecoder),
});

productDecoder.verify({});

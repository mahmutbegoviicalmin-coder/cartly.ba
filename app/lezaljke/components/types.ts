export type ColorId = "maslinasto-siva";

export interface ColorOption {
  id: ColorId;
  label: string;
  hex: string;
  ring: string;
  bg: string;
  image: string;
}

export const COLORS: ColorOption[] = [
  {
    id: "maslinasto-siva",
    label: "Tamno maslinasto siva",
    hex: "#4E5445",
    ring: "#4E5445",
    bg: "#EEF0E8",
    image: "/lezaljke/lezaljka1.png",
  },
];

export const PRODUCT = COLORS[0];

export const PRODUCT_IMAGES = [
  "/lezaljke/lezaljka1.png",
  "/lezaljke/lezaljka2.png",
];

import { isDarwin } from "@llm-flow/utils";

export type KeyboardModifiersObject = {
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
};

export const CODES = {
  EQUAL: "Equal",
  MINUS: "Minus",
  NUM_ADD: "NumpadAdd",
  NUM_SUBTRACT: "NumpadSubtract",
  NUM_ZERO: "Numpad0",
  BRACKET_RIGHT: "BracketRight",
  BRACKET_LEFT: "BracketLeft",
  ONE: "Digit1",
  TWO: "Digit2",
  THREE: "Digit3",
  NINE: "Digit9",
  QUOTE: "Quote",
  ZERO: "Digit0",
  SLASH: "Slash",
  C: "KeyC",
  D: "KeyD",
  H: "KeyH",
  V: "KeyV",
  Z: "KeyZ",
  Y: "KeyY",
  R: "KeyR",
  S: "KeyS",
} as const;

export const KEYS = {
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  ARROW_UP: "ArrowUp",
  PAGE_UP: "PageUp",
  PAGE_DOWN: "PageDown",
  BACKSPACE: "Backspace",
  ALT: "Alt",
  CTRL_OR_CMD: isDarwin ? "metaKey" : "ctrlKey",
  DELETE: "Delete",
  ENTER: "Enter",
  ESCAPE: "Escape",
  QUESTION_MARK: "?",
  SPACE: " ",
  TAB: "Tab",
  CHEVRON_LEFT: "<",
  CHEVRON_RIGHT: ">",
  PERIOD: ".",
  COMMA: ",",
  SUBTRACT: "-",
  SLASH: "/",

  A: "a",
  C: "c",
  D: "d",
  E: "e",
  F: "f",
  G: "g",
  H: "h",
  I: "i",
  L: "l",
  O: "o",
  P: "p",
  Q: "q",
  R: "r",
  S: "s",
  T: "t",
  V: "v",
  X: "x",
  Y: "y",
  Z: "z",
  K: "k",
  W: "w",

  0: "0",
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
} as const;

export type Key = keyof typeof KEYS;



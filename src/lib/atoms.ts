import { atom } from "jotai";
import type { MovieCart } from "~/lib/types";

export const cartAtom = atom<MovieCart[]>([]);

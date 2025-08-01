import { Playwrite_NZ  , Geist, Belanosima, Playfair_Display } from "next/font/google"

export const PlayWriteNewZealandFont = Playwrite_NZ({
    weight: ['400'],
})

export const GeistFont = Geist({
    subsets: ['latin'],
    weight: ['400', '700'],
})

export const BelanosimaFont = Belanosima({
    subsets: ['latin'],
    weight: ['400', '700'],
})

export const playfairDisplay = Playfair_Display({
    subsets: ['latin'],
    weight: ['400', '700'],
});
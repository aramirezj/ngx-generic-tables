// find the keys somewhere, figure out where to place them later
import { english } from '../locales/english';
import { spanish } from '../locales/spanish';

// a simple class that translates resources into actual messages
export class Res {
    public static Get(key: string, locale: string): string {
        // get message from key
        let translates = Res.GetKeys(locale);
        return translates[key];
    }

    /**
     * Receives the locale, and return the keys with the translations, By default english
     * @param locale Locale language
     * @returns The keys
     */
    public static GetKeys(locale: string): any {
        const language: string = locale.split('-')[0];
        let toReturn;
        switch (language) {
            case 'en':
                toReturn = english;
                break;
            case 'es':
                toReturn = spanish;
                break;
            default:
                toReturn = english;
        }
        return toReturn;
    }
}
# HaravaScraper EN

HaravaScraper is a Chrome extension that provides users with an easy way to create sequences for data collection and performing interactive actions on web pages. This application enables users to specify multiple CSS selectors and execute actions in a predefined order as part of a sequence. The extension leverages the Chrome Extension API to store sequence data in a background script (`background.js`), preserving sequence data for the duration of the extension’s operation.

## Features

- **CSS Selector Selection**: Users can choose a CSS selector and save it to a sequence.
- **Sequence Actions**: Users can add actions to the sequence, such as searching by CSS selector or targeting specific HTML elements.
- **Sequence Order Management**: Actions can be arranged in a specific sequence, allowing them to be executed in a selected order.
- **Background Script Storage**: Sequences are saved to `background.js`, preserving data across browser sessions, even if the popup window is closed or the extension is refreshed.

## Usage Instructions

1. **Install HaravaScraper in Chrome**:
   - Download or clone the extension’s source code onto your computer.
   - Open Chrome and go to `chrome://extensions`.
   - Enable developer mode and load the extension by selecting "Load unpacked."

2. **Create and Execute a Sequence**:
   - Click the HaravaScraper icon in the Chrome toolbar to open the extension.
   - Select an action and CSS selector, and add them to the sequence by pressing "Add to Sequence."
   - View and manage the sequence in the popup window.
   - Start the sequence by pressing "Start" and follow the activity log to see actions as they are performed.

## Code Structure

- **background.js**: Manages sequence storage and ensures data persistence across browser sessions.
- **spa.js**: The user interface script, enabling sequence creation and management.
- **js/**: Each function has its own JavaScript file, loaded as needed through `spa.js`.
- **pages/**: HTML files for each specific feature (settings, preview, sequence management).

## Important Information

- **This extension is intended for personal use in web data collection and automation for development purposes only.**
- **Unauthorized sharing or misuse of this code, including distribution to third parties, is prohibited.**

---

© 2024 HaravaScraper. All rights reserved.

**Note:** This extension is copyright protected and is licensed exclusively for personal use. All rights are reserved, and neither the source code nor any part of it may be shared, distributed, or used for commercial purposes without permission from the creator.




#
---
#




# HaravaScraper FI

HaravaScraper on Chrome-laajennus, joka tarjoaa käyttäjälle helppokäyttöisen tavan luoda sekvenssejä verkkosivujen tietojen keräämiseen ja interaktiivisten toimien suorittamiseen. Sovelluksen avulla käyttäjä voi määrittää useita CSS-valitsijoita ja suorittaa sekvenssiin kuuluvia toimintoja tietyssä järjestyksessä. Laajennus hyödyntää Chrome-laajennus-APItä tallentaakseen tiedot taustaskriptiin (background.js) ja ylläpitää sekvenssin tietoja koko laajennuksen toiminnan ajan.

## Ominaisuudet

- **CSS-valitsijan valinta**: Käyttäjä voi valita CSS-valitsijan ja tallentaa sen sekvenssiin.
- **Sekvenssitoiminnot**: Käyttäjä voi lisätä sekvenssiin toimintoja kuten haku CSS-valitsijan perusteella ja tiettyjen HTML elementtien valitsemiseen.
- **Sekvenssijärjestyksen hallinta**: Toiminnot voidaan järjestää tietyssä sekvenssissä, jolloin niitä voidaan suorittaa valitussa järjestyksessä.
- **Taustaskriptiin tallennus**: Sekvenssi tallennetaan `background.js`-taustaskriptiin, joten se säilyy koko selaimen istunnon ajan, vaikka popup-ikkuna suljettaisiin tai laajennus päivitetään.


## Käyttöohje

1. **Asenna HaravaScraper Chromeen**:
   - Lataa tai kloonaa laajennuksen lähdekoodi tietokoneellesi.
   - Avaa Chrome-selain ja siirry osoitteeseen `chrome://extensions`.
   - Ota kehittäjätila käyttöön ja lataa laajennus "lataa pakkaamaton" -painikkeella.
   
2. **Sekvenssin luominen ja suorittaminen**:
   - Klikkaa HaravaScraperin kuvaketta Chromen työkalupalkissa avataksesi laajennuksen.
   - Valitse toiminto ja CSS-valitsija, ja lisää ne sekvenssiin painamalla "Lisää sekvenssiin".
   - Voit katsella ja hallita sekvenssiä popup-ikkunassa.
   - Aloita sekvenssi painamalla "Käynnistä" ja seuraa lokia, joka näyttää suoritetut toiminnot.
   
## Koodin Rakenne

- **background.js**: Hallitsee sekvenssien tallennusta ja varmistaa tietojen jatkuvuuden selainistuntojen välillä.
- **spa.js**: Käyttöliittymäskripti, joka mahdollistaa sekvenssin luomisen ja hallinnan.
- **js/**: Jokaiselle toiminnolle omat JavaScript-tiedostot, jotka ladataan `spa.js`-skriptistä tarpeen mukaan.
- **pages/**: HTML-sivut jokaiselle eri toiminnolle (asetukset, esikatselu, sekvenssin hallinta).
  
## Huomioitavaa

- **Tämä laajennus on tarkoitettu henkilökohtaiseen käyttöön verkkosivujen tietojen keräämisessä ja automatisoinnissa kehitystarkoituksiin.**
- **Koodin väärinkäyttö ja jakaminen kolmansille osapuolille ilman lupaa on kielletty.**

---

© 2024 HaravaScraper. Kaikki oikeudet pidätetään.

**Huomio:** Tämä laajennus on tekijänoikeuksien alainen, ja sen käyttöoikeus on rajoitettu vain henkilökohtaiseen käyttöön. Kaikki oikeudet pidätetään, eikä lähdekoodia tai sen osia saa jakaa, levittää tai käyttää kaupallisiin tarkoituksiin ilman tekijän lupaa.

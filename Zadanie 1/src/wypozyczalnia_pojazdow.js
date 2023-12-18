"use strict";

var express = require('express');
var app = module.exports = express()
var bodyParser = require('body-parser');

app.use(bodyParser.json());

let saveLocation = "";

function KwitWypozyczenie(imie_nazwisko_wypozyczajacego, data_wypozyczenia, data_zwrotu) {
    this.imie_nazwisko_wypozyczajacego = imie_nazwisko_wypozyczajacego;
    this.data_wypozyczenia = data_wypozyczenia;
    this.data_zwrotu = data_zwrotu;
}

function Samochod(numer, przebieg, liczba_pasazerow, cena_za_dzien) {
    this.numer = numer;
    this.przebieg = przebieg;
    this.liczba_pasazerow = liczba_pasazerow;
    this.cena_za_dzien = cena_za_dzien;
    this.lista_uszkodzen = []
    this.lista_wypozyczen = [];

    this.wypozycz = function(imie_nazwisko_wypozyczajacego, data_wypozyczenia, data_planowanego_zwrotu) {
        this.lista_wypozyczen.push(new KwitWypozyczenie(imie_nazwisko_wypozyczajacego, data_wypozyczenia, data_planowanego_zwrotu));
    }

    this.zwroc = function(imie_nazwisko_wypozyczajacego, data_wypozyczenia, data_zwrotu) {
        let entry = this.lista_wypozyczen.find(x => x.imie_nazwisko_wypozyczajacego === imie_nazwisko_wypozyczajacego && x.data_wypozyczenia === data_wypozyczenia);
        entry.data_zwrotu = data_zwrotu;
    }

    this.dostepny_danego_dnia = function(dzien) {
        let free = true;

        this.lista_wypozyczen.forEach(function(wypozyczenie, idx) {
            if (dzien > wypozyczenie.data_zwrotu || dzien < wypozyczenie.data_wypozyczenia) {
            } else {
                free = false;
            }
        });

        return free;
    }

    this.kiedy_dostepny = function(today) {
        /*
         * Look for the first day when car is available.
         * This doesn't check for how long it will be available.
         */
        for (let date = today; ; today.setDate(today.getDate() + 1))
        {
           if (this.dostepny_danego_dnia(date)) {
                return date;
           } 
        }
    }

    this.dodaj_uszkodzenie = function(nazwa_uszkodzenia) {
        this.lista_uszkodzen.push(nazwa_uszkodzenia);
    }

    this.ile_uszkodzen = function() {
        return this.lista_uszkodzen.length;
    }

    this.ile_wypozyczen = function() {
        return this.lista_wypozyczen.length;
    }
}

function Wypozyczalnia() {
    this.lista_samochodow = []

    this.dodaj_samochod = function(samochod) {
        this.lista_samochodow.push(samochod);
    }

    this.liczba_aktualnie_wypozyczonych = function(dzisiejszy_dzien) {
        let ilosc = 0;
        this.lista_samochodow.forEach(function(samochod, idx) {
            let wypozyczenie = samochod.dostepny_danego_dnia(dzisiejszy_dzien);
            if (!wypozyczenie) {
                ilosc++;
            }
        });

        return ilosc;
    }

    this.lista_dostepnych_w_zakresie_czasu = function(data_start, data_koniec) {
        let lista_dostepnosci = [];
        this.lista_samochodow.forEach(function(samochod, idx) {
            lista_dostepnosci.push(0);
        });

        for (let data = new Date(data_start.getTime()); data <= data_koniec; data.setDate(data.getDate() + 1)) {
            this.lista_samochodow.forEach(function(samochod, idx) {
                if (samochod.dostepny_danego_dnia(data)){
                    lista_dostepnosci[idx] += 1;
                }
            });
        }

        let lista_dostepnych = [];
        const ilosc_dni = data_koniec.getDate() - data_start.getDate() + 1;
        const lista_samochodow = this.lista_samochodow;
        lista_dostepnosci.forEach(function(dostepnosc, idx) {
            if (dostepnosc == ilosc_dni) {
                var samochod = lista_samochodow[idx];
                lista_dostepnych.push(samochod);
            }
        });

        return lista_dostepnych;
    }

    // top 10
    this.lista_najczesciej_wypozyczanych = function() {
        let lista_najczesciej = [];
        let prev_max = -1;
        for (let i = 0; i < Math.min(this.lista_samochodow.length, 10); i++){
            let max = -1;
            let auto_max = null;
            this.lista_samochodow.forEach(function(auto, idx) {
                const auto_is_on_list = lista_najczesciej.some(samochod => samochod.numer === auto.numer);
                if (auto.ile_wypozyczen() > max && (prev_max === -1 || 
                    (auto.ile_wypozyczen() <= prev_max && !auto_is_on_list))) {
                    max = auto.ile_wypozyczen();
                    auto_max = auto;
                }
            });

            lista_najczesciej.push(auto_max);
            prev_max = max;
            max = -1;
        }

        return lista_najczesciej;
    }

    this.lista_najczesciej_uszkadzanych = function() {
        let lista_najczesciej = [];
        let prev_max = -1;
        for (let i = 0; i < Math.min(this.lista_samochodow.length, 10); i++){
            let max = -1;
            let auto_max = null;
            this.lista_samochodow.forEach(function(auto, idx) {
                const auto_is_on_list = lista_najczesciej.some(samochod => samochod.numer === auto.numer);
                if (auto.ile_uszkodzen() > max && (prev_max === -1 || 
                    (auto.ile_uszkodzen() <= prev_max && !auto_is_on_list))) {
                    max = auto.ile_uszkodzen();
                    auto_max = auto;
                }
            });

            lista_najczesciej.push(auto_max);
            prev_max = max;
            max = -1;
        }
        
        return lista_najczesciej;
    }
}

module.exports = {
    Samochod,
    Wypozyczalnia,
};

app.post('/samochody', (req, res) => {
    const { numer, przebieg, liczba_pasazerow, cena_za_dzien } = req.body;
    const nowySamochod = new Samochod(numer, przebieg, liczba_pasazerow, cena_za_dzien);
    res.json(nowySamochod);
});

app.get('/samochody', (req, res) => {
    res.json(listaWszystkichSamochodow);
});

app.get('/samochody/:id', (req, res) => {
    const samochodId = req.params.id;
    res.json(znalezionySamochod);
});

app.put('/samochody/:id', (req, res) => {
    const { numer, przebieg, liczba_pasazerow, cena_za_dzien } = req.body;
    res.json(zaktualizowanySamochod);
});

app.delete('/samochody/:id', (req, res) => {
    const samochodId = req.params.id;
    res.json({ message: 'Samochód został usunięty.' });
});

app.post('/setSaveLocation', (req, res) => {
    const { location } = req.body;

    if (location) {
        saveLocation = location;
        res.json({ message: 'Save location set successfully.' });
    } else {
        res.status(400).json({ error: 'Location not provided.' });
    }
});

app.get('/getSaveLocation', (req, res) => {
    res.json({ saveLocation });
});

app.get('/', function (req, res) {
    res.send('Hello World');
 })

if (!module.parent) {
    app.listen(3000);
    console.log('Express started on port 3000');
}

"use strict";

var express = require('express');
var app = module.exports = express()
var bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const { serveSwagger, setupSwagger } = require('./swagger'); // Update with the correct path

app.use(bodyParser.json());
app.use('/api-docs', serveSwagger, setupSwagger);

let saveLocation = "";

function KwitWypozyczenie(imie_nazwisko_wypozyczajacego, data_wypozyczenia, data_zwrotu) {
    this.imie_nazwisko_wypozyczajacego = imie_nazwisko_wypozyczajacego;
    this.data_wypozyczenia = data_wypozyczenia;
    this.data_zwrotu = data_zwrotu;
}

function Samochod(numer, przebieg, liczba_pasazerow, cena_za_dzien, lista_uszkodzen, lista_wypozyczen) {
    this.numer = numer;
    this.przebieg = przebieg;
    this.liczba_pasazerow = liczba_pasazerow;
    this.cena_za_dzien = cena_za_dzien;
    this.lista_uszkodzen = lista_uszkodzen;
    this.lista_wypozyczen = lista_wypozyczen;

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

function Wypozyczalnia(lista_samochodow) {
    this.lista_samochodow = lista_samochodow;

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

/**
 * @swagger
 * /addSamochod:
 *   post:
 *     summary: Add a new samochod
 *     description: Creates a new samochod with the provided details and saves it as a JSON file.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             numer: 'ABC123'
 *             przebieg: 50000
 *             liczba_pasazerow: 5
 *             cena_za_dzien: 100
 *             lista_uszkodzen: ['Scratch on the door', 'Broken headlight']
 *             lista_wypozyczen: []
 *     responses:
 *       200:
 *         description: Samochod added successfully
 *         content:
 *           application/json:
 *             example:
 *               message: 'Samochod saved successfully.'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             example:
 *               error: 'File already exists.'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: 'Internal Server Error'
 */
app.post('/addSamochod', async (req, res) => {
    let { numer, przebieg, liczba_pasazerow, cena_za_dzien, lista_uszkodzen, lista_wypozyczen } = req.body;
    let nowySamochod = new Samochod(numer, przebieg, liczba_pasazerow, cena_za_dzien, lista_uszkodzen, lista_wypozyczen);
    let savePath = `${saveLocation}/samochod_${numer}.json`;
    try { 
        await fs.access(savePath, fs.constants.F_OK);
        res.status(400).json({ error: 'File already exists.' });
    } catch (fileNotFoundError) {
        try {
            const jsonContent = JSON.stringify(nowySamochod, null, 2);
            await fs.writeFile(savePath, jsonContent);
            res.json({ message: 'Samochod saved successfully.' });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

async function findSamochodFiles(saveLocation) {
    try {
        let files = await fs.readdir(saveLocation);
        return files.filter((file) => file.startsWith('samochod_') && file.endsWith('.json'));
    } catch (error) {
        throw error;
    }
}

/**
 * @swagger
 * /getSamochody:
 *   get:
 *     summary: Get all samochody
 *     description: Retrieves a list of all samochody available in the system.
 *     responses:
 *       200:
 *         description: Samochody retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               - numer: 'ABC123'
 *                 przebieg: 50000
 *                 liczba_pasazerow: 5
 *                 cena_za_dzien: 100
 *                 lista_uszkodzen: ['Scratch on the door', 'Broken headlight']
 *                 lista_wypozyczen: [{...}, {...}]
 *               - numer: 'XYZ789'
 *                 przebieg: 30000
 *                 liczba_pasazerow: 4
 *                 cena_za_dzien: 80
 *                 lista_uszkodzen: ['Dented bumper', 'Cracked windshield']
 *                 lista_wypozyczen: []
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: 'Internal Server Error'
 */
app.get('/getSamochody', async (req, res) => {
    try {
        let samochodFiles = await findSamochodFiles(saveLocation);
        let samochody = await Promise.all(
            samochodFiles.map(async (file) => {
                let filePath = path.join(saveLocation, file);
                let fileContent = await fs.readFile(filePath, 'utf-8');
                return JSON.parse(fileContent);
            })
        );

        res.json(samochody);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /getSamochod:
 *   get:
 *     summary: Get a samochod by numer
 *     description: Retrieves information about a samochod identified by its numer.
 *     parameters:
 *       - in: query
 *         name: numer
 *         required: true
 *         description: The numer of the samochod to be retrieved.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Samochod retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               numer: 'ABC123'
 *               przebieg: 50000
 *               liczba_pasazerow: 5
 *               cena_za_dzien: 100
 *               lista_uszkodzen: ['Scratch on the door', 'Broken headlight']
 *               lista_wypozyczen: [{...}, {...}]
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             example:
 *               error: 'Samochod not found.'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: 'Internal Server Error'
 */
app.get('/getSamochod', async (req, res) => {
    try {
        let numer = req.query.numer;
        let filePath = path.join(saveLocation, `samochod_${numer}.json`);
        await fs.access(filePath, fs.constants.F_OK);
        let fileContent = await fs.readFile(filePath, 'utf-8');
        let znalezionySamochod = JSON.parse(fileContent);
        res.json(znalezionySamochod);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Samochod not found.' });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

/**
 * @swagger
 * /updateSamochod:
 *   put:
 *     summary: Update a samochod
 *     description: Updates an existing samochod identified by its numer.
 *     parameters:
 *       - in: query
 *         name: numer
 *         required: true
 *         description: The numer of the samochod to be updated.
 *         schema:
 *           type: string
 *       - in: body
 *         name: Samochod Update
 *         required: true
 *         description: The updated information for the samochod.
 *         schema:
 *           type: object
 *           properties:
 *             przebieg:
 *               type: number
 *               description: The new value for przebieg.
 *             liczba_pasazerow:
 *               type: number
 *               description: The new value for liczba_pasazerow.
 *             cena_za_dzien:
 *               type: number
 *               description: The new value for cena_za_dzien.
 *             lista_uszkodzen:
 *               type: array
 *               items:
 *                 type: string
 *               description: The updated list of uszkodzenia.
 *             lista_wypozyczen:
 *               type: array
 *               items:
 *                 type: object
 *               description: The updated list of wypozyczenia.
 *     responses:
 *       200:
 *         description: Samochod updated successfully
 *         content:
 *           application/json:
 *             example:
 *               numer: 'ABC123'
 *               przebieg: 50000
 *               liczba_pasazerow: 5
 *               cena_za_dzien: 100
 *               lista_uszkodzen: ['Scratch on the door', 'Broken headlight']
 *               lista_wypozyczen: [{...}, {...}]
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             example:
 *               error: 'Samochod not found.'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: 'Internal Server Error'
 */
app.put('/updateSamochod', async (req, res) => {
    try {
        let numer = req.query.numer;
        let { przebieg, liczba_pasazerow, cena_za_dzien, lista_uszkodzen, lista_wypozyczen } = req.body;
        let filePath = path.join(saveLocation, `samochod_${numer}.json`);
        await fs.access(filePath, fs.constants.F_OK);
        let fileContent = await fs.readFile(filePath, 'utf-8');
        let existingSamochod = JSON.parse(fileContent);
        existingSamochod.przebieg = przebieg || existingSamochod.przebieg;
        existingSamochod.liczba_pasazerow = liczba_pasazerow || existingSamochod.liczba_pasazerow;
        existingSamochod.cena_za_dzien = cena_za_dzien || existingSamochod.cena_za_dzien;
        existingSamochod.lista_uszkodzen = lista_uszkodzen || existingSamochod.lista_uszkodzen;
        existingSamochod.lista_wypozyczen = lista_wypozyczen || existingSamochod.lista_wypozyczen;
        let updatedContent = JSON.stringify(existingSamochod, null, 2);
        await fs.writeFile(filePath, updatedContent);
        res.json(existingSamochod);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Samochod not found.' });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

/**
 * @swagger
 * /removeSamochod:
 *   delete:
 *     summary: Remove a samochod
 *     description: Deletes a samochod file identified by its numer.
 *     parameters:
 *       - in: query
 *         name: numer
 *         required: true
 *         description: The numer of the samochod to be removed.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Samochod removed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: 'Samochod został usunięty.'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             example:
 *               error: 'Samochod not found.'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: 'Internal Server Error'
 */
app.delete('/removeSamochod', async (req, res) => {
    try {
        const numer = req.query.numer;
        const filePath = path.join(saveLocation, `samochod_${numer}.json`);
        await fs.access(filePath, fs.constants.F_OK);
        await fs.unlink(filePath);
        res.json({ message: 'Samochod został usunięty.' });
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Samochod not found.' });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

/**
 * @swagger
 * /addWypozyczalnia:
 *   post:
 *     summary: Add a new wypozyczalnia
 *     description: Creates a new wypozyczalnia with the provided list of samochod names.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lista_samochodow:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - lista_samochodow
 *     responses:
 *       200:
 *         description: Wypozyczalnia added successfully
 *         content:
 *           application/json:
 *             example:
 *               message: 'Wypozyczalnia added successfully.'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             examples:
 *               InvalidInput:
 *                 value:
 *                   error: 'Invalid input. lista_samochodow must be an array.'
 *               InvalidEntries:
 *                 value:
 *                   error: 'Invalid entries: ABC123, CPP7312'
 *               FileExists:
 *                 value:
 *                   error: 'File already exists.'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: 'Internal Server Error'
 */
app.post('/addWypozyczalnia', async (req, res) => {
    try {
        const { lista_samochodow } = req.body;
        if (!Array.isArray(lista_samochodow)) {
            res.status(400).json({ error: 'Invalid input. lista_samochodow must be an array.' });
            return;
        }
        const savePath = path.join(saveLocation, "wypozyczalnia.json")

        try {
            await fs.access(savePath, fs.constants.F_OK);
            res.status(400).json({ error: 'File already exists.' });
        } catch (fileNotFoundError) {
            try {
                const verificationResults = await Promise.all(
                    lista_samochodow.map(async (nazwa) => {
                        const samochodFilePath = path.join(saveLocation, `samochod_${nazwa}.json`);
                        try {
                            await fs.access(samochodFilePath, fs.constants.F_OK);
                            return { nazwa, isValid: true };
                        } catch (error) {
                            if (error.code === 'ENOENT') {
                                return { nazwa, isValid: false };
                            } else {
                                throw error;
                            }
                        }
                    })
                );

                const allEntriesValid = verificationResults.every((result) => result.isValid);

                if (allEntriesValid) {
                    const wypozyczalniaPath = path.join(saveLocation, 'wypozyczalnia.json');
                    await fs.writeFile(wypozyczalniaPath, JSON.stringify({ lista_samochodow }, null, 2));
                    res.json({ message: 'Wypozyczalnia added successfully.' });
                } else {
                    const invalidEntries = verificationResults.filter((result) => !result.isValid).map((result) => result.nazwa);
                    res.status(400).json({ error: `Invalid entries: ${invalidEntries.join(', ')}` });
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /getWypozyczalnia:
 *   get:
 *     summary: Get wypozyczalnia information
 *     description: Retrieves information about the car rental service, including details of each samochod.
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               wypozyczalniaData:
 *                 lista_samochodow:
 *                   - samochod1
 *                   - samochod2
 *               samochodyData:
 *                 - nazwa: samochod1
 *                   content: { samochod1 details }
 *                 - nazwa: samochod2
 *                   content: { samochod2 details }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             example:
 *               error: 'Wypozyczalnia not found.'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: 'Internal Server Error'
 *
 */
app.get('/getWypozyczalnia', async (req, res) => {
    try {
        const wypozyczalniaPath = path.join(saveLocation, 'wypozyczalnia.json');
        const wypozyczalniaContent = await fs.readFile(wypozyczalniaPath, 'utf-8');
        const wypozyczalniaData = JSON.parse(wypozyczalniaContent);
        const listaSamochodow = wypozyczalniaData.lista_samochodow;
        const samochodyData = await Promise.all(
            listaSamochodow.map(async (nazwa) => {
                const samochodFilePath = path.join(saveLocation, `samochod_${nazwa}.json`);
                try {
                    const samochodContent = await fs.readFile(samochodFilePath, 'utf-8');
                    return { nazwa, content: JSON.parse(samochodContent) };
                } catch (error) {
                    if (error.code === 'ENOENT') {
                        return { nazwa, error: 'Samochod not found.' };
                    } else {
                        throw error;
                    }
                }
            })
        );

        res.json({ wypozyczalniaData, samochodyData });
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Wypozyczalnia not found.' });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

/**
 * @swagger
 * /updateWypozyczalnia:
 *   put:
 *     summary: Update the wypozyczalnia
 *     description: Updates the list of samochody in the wypozyczalnia.json file.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lista_samochodow:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - lista_samochodow
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               message: 'Wypozyczalnia updated successfully.'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               error: 'Invalid input. lista_samochodow must be an array.'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: 'Internal Server Error'
 */
app.put('/updateWypozyczalnia', async (req, res) => {
    try {
        const wypozyczalniaFilePath = path.join(saveLocation, 'wypozyczalnia.json');
        const { lista_samochodow } = req.body;
        if (!Array.isArray(lista_samochodow)) {
            res.status(400).json({ error: 'Invalid input. lista_samochodow must be an array.' });
            return;
        }

        const verificationResults = await Promise.all(
            lista_samochodow.map(async (nazwa) => {
                const samochodFilePath = path.join(saveLocation, `samochod_${nazwa}.json`);
                try {
                    await fs.access(samochodFilePath, fs.constants.F_OK);
                    return { nazwa, isValid: true };
                } catch (error) {
                    if (error.code === 'ENOENT') {
                        return { nazwa, isValid: false };
                    } else {
                        throw error;
                    }
                }
            })
        );

        const allEntriesValid = verificationResults.every((result) => result.isValid);

        if (allEntriesValid) {
            await fs.writeFile(wypozyczalniaFilePath, JSON.stringify({ lista_samochodow }, null, 2));
            res.json({ message: 'Wypozyczalnia updated successfully.' });
        } else {
            const invalidEntries = verificationResults.filter((result) => !result.isValid).map((result) => result.nazwa);
            res.status(400).json({ error: `Invalid entries: ${invalidEntries.join(', ')}` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /removeWypozyczalnia:
 *   delete:
 *     summary: Remove the wypozyczalnia
 *     description: Deletes the wypozyczalnia.json file, removing all information about the car rental service.
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               message: 'Wypozyczalnia removed successfully.'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             example:
 *               error: 'Wypozyczalnia not found.'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               error: 'Internal Server Error'
 */
app.delete('/removeWypozyczalnia', async (req, res) => {
    try {
        const wypozyczalniaPath = path.join(saveLocation, 'wypozyczalnia.json');
        await fs.unlink(wypozyczalniaPath);
        res.json({ message: 'Wypozyczalnia removed successfully.' });
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Wypozyczalnia not found.' });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

/**
 * @swagger
 * /setSaveLocation:
 *   post:
 *     summary: Set the save location
 *     description: Updates the save location used by the application.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: string
 *             required:
 *               - location
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               message: 'Save location set successfully.'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               error: 'Location not provided.'
 */
app.post('/setSaveLocation', (req, res) => {
    const { location } = req.body;

    if (location) {
        saveLocation = location;
        res.json({ message: 'Save location set successfully.' });
    } else {
        res.status(400).json({ error: 'Location not provided.' });
    }
});

/**
 * @swagger
 * /getSaveLocation:
 *   get:
 *     summary: Get the save location
 *     description: Returns the current save location used by the application.
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               saveLocation: '/path/to/your/save/location'
 */
app.get('/getSaveLocation', (req, res) => {
    res.json({ saveLocation });
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get a greeting
 *     description: Returns a simple "Hello World" message.
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           text/plain:
 *             example:
 *               Hello World
 */
app.get('/', function (req, res) {
    res.send('Hello World');
 })

if (!module.parent) {
    app.listen(3000);
    console.log('Express started on port 3000');
}

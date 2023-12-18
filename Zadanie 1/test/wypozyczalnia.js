let expect = require('chai').expect;
let {Samochod, Wypozyczalnia} = require('../src/wypozyczalnia_pojazdow');

describe('wypozyczalnia-tests', function() 
{
	let wypozyczalnia;
    let samochod_1, samochod_2, samochod_3, samochod_4, samochod_5, samochod_6, samochod_7, samochod_8, samochod_9, samochod_10, samochod_11;
	
	beforeEach(function(){
		/* Index, przebieg, liczba_osob, cena/24h */
        /* 5 - najczesciej uszkadzany, 4 mniej, 3 mniej, 2 mniej, 1 wcale */
        /* 1 - najczesciej wypozyczany, 2 mniej, 3 mniej, 4 mniej, 5 wcale */
		samochod_1 = new Samochod(1, 10222, 4, 500);
        samochod_1.wypozycz("Andrzej Kowalski", new Date(2022, 0, 27), new Date(2022, 0, 29));
		samochod_1.wypozycz("Patryk Myslewski", new Date (2022, 0, 31), new Date(2022, 1, 2));
        samochod_1.wypozycz("Maryla Kowalska", new Date(2022, 1, 4), new Date(2022, 1, 5));
		samochod_1.wypozycz("Patryk Myslewski", new Date (2022, 1, 10), new Date(2022, 1, 30));

        samochod_2 = new Samochod(2, 10500, 2, 600);
        samochod_2.wypozycz("Andrzej Kowalski", new Date(2022, 0, 27), new Date(2022, 0, 29));
		samochod_2.wypozycz("Patryk Myslewski", new Date (2022, 0, 31), new Date(2022, 1, 2));
        samochod_2.wypozycz("Maryla Kowalska", new Date(2022, 1, 4), new Date(2022, 1, 5));
        samochod_2.dodaj_uszkodzenie("Zderzak");

        samochod_3 = new Samochod(3, 102221, 4, 700);
        samochod_3.wypozycz("Andrzej Kowalski", new Date(2022, 0, 27), new Date(2022, 0, 29));
		samochod_3.wypozycz("Patryk Myslewski", new Date (2022, 0, 31), new Date(2022, 1, 2));
        samochod_3.dodaj_uszkodzenie("Zderzak");
        samochod_3.dodaj_uszkodzenie("Zderzak");

        samochod_4 = new Samochod(4, 102220, 4, 800);
        samochod_4.wypozycz("Andrzej Kowalski", new Date(2022, 0, 27), new Date(2022, 0, 29));
        samochod_4.dodaj_uszkodzenie("Zderzak");
        samochod_4.dodaj_uszkodzenie("Zderzak");
        samochod_4.dodaj_uszkodzenie("Zderzak");

        samochod_5 = new Samochod(5, 102220, 4, 800);
        samochod_5.dodaj_uszkodzenie("Zderzak");
        samochod_5.dodaj_uszkodzenie("Zderzak");
        samochod_5.dodaj_uszkodzenie("Zderzak");
        samochod_5.dodaj_uszkodzenie("Zderzak");

        samochod_6 = new Samochod(6, 102220, 4, 800);
        samochod_6.wypozycz("Andrzej Kowalski", new Date(2022, 0, 27), new Date(2022, 0, 29));
		samochod_6.wypozycz("Patryk Myslewski", new Date (2022, 0, 31), new Date(2022, 1, 2));
        samochod_6.wypozycz("Maryla Kowalska", new Date(2022, 1, 4), new Date(2022, 1, 5));
        samochod_6.dodaj_uszkodzenie("Zderzak");
        
        samochod_7 = new Samochod(7, 102220, 4, 800);
        samochod_7.wypozycz("Andrzej Kowalski", new Date(2022, 0, 27), new Date(2022, 0, 29));
		samochod_7.wypozycz("Patryk Myslewski", new Date (2022, 0, 31), new Date(2022, 1, 2));
        samochod_7.dodaj_uszkodzenie("Zderzak");
        samochod_7.dodaj_uszkodzenie("Zderzak");

        samochod_8 = new Samochod(8, 102220, 4, 800);
        samochod_8.wypozycz("Andrzej Kowalski", new Date(2022, 0, 27), new Date(2022, 0, 29));
        samochod_8.dodaj_uszkodzenie("Zderzak");
        samochod_8.dodaj_uszkodzenie("Zderzak");
        samochod_8.dodaj_uszkodzenie("Zderzak");

        samochod_9 = new Samochod(9, 102220, 4, 800);
        samochod_9.wypozycz("Andrzej Kowalski", new Date(2022, 0, 27), new Date(2022, 0, 29));
		samochod_9.wypozycz("Patryk Myslewski", new Date (2022, 0, 31), new Date(2022, 1, 2));
        samochod_9.dodaj_uszkodzenie("Zderzak");
        samochod_9.dodaj_uszkodzenie("Zderzak");
        samochod_9.dodaj_uszkodzenie("Zderzak");
        samochod_9.dodaj_uszkodzenie("Zderzak");

        samochod_10 = new Samochod(10, 102220, 4, 800);
        samochod_10.dodaj_uszkodzenie("Zderzak");
        samochod_10.wypozycz("Andrzej Kowalski", new Date(2022, 0, 27), new Date(2022, 0, 29));
		samochod_10.wypozycz("Patryk Myslewski", new Date (2022, 0, 31), new Date(2022, 1, 2));
        samochod_10.wypozycz("Maryla Kowalska", new Date(2022, 1, 4), new Date(2022, 1, 5));

        samochod_11 = new Samochod(11, 102220, 4, 800);
        samochod_11.wypozycz("Andrzej Kowalski", new Date(2022, 0, 27), new Date(2022, 0, 29));
		samochod_11.wypozycz("Patryk Myslewski", new Date (2022, 0, 31), new Date(2022, 1, 2));
        samochod_11.dodaj_uszkodzenie("Zderzak");
        samochod_11.dodaj_uszkodzenie("Zderzak");

        wypozyczalnia = new Wypozyczalnia();
	});

    it('Nie dodawaj samochodow i sprawdz liczbe wypozyczonych aut', function() 
	{     
        const brak_wypozyczen = wypozyczalnia.liczba_aktualnie_wypozyczonych(new Date(2022, 0, 30));

        expect(brak_wypozyczen).to.eql(0);
	});

	it('Dodaj jeden samochod i sprawdz liczbe wypozyczonych aut', function() 
	{
        wypozyczalnia.dodaj_samochod(samochod_3);
        
        const brak_wypozyczen = wypozyczalnia.liczba_aktualnie_wypozyczonych(new Date(2022, 0, 30));
        const jeden_wypozyczony = wypozyczalnia.liczba_aktualnie_wypozyczonych(new Date(2022, 0, 31));

        expect(brak_wypozyczen).to.eql(0);
        expect(jeden_wypozyczony).to.eql(1);
	});

    it('Dodaj 11 samochodow i sprawdz liczbe wypozyczonych aut', function() 
	{
        wypozyczalnia.dodaj_samochod(samochod_3);
        wypozyczalnia.dodaj_samochod(samochod_2);
        wypozyczalnia.dodaj_samochod(samochod_1);
        wypozyczalnia.dodaj_samochod(samochod_4);
        wypozyczalnia.dodaj_samochod(samochod_5);
        wypozyczalnia.dodaj_samochod(samochod_6);
        wypozyczalnia.dodaj_samochod(samochod_7);
        wypozyczalnia.dodaj_samochod(samochod_8);
        wypozyczalnia.dodaj_samochod(samochod_9);
        wypozyczalnia.dodaj_samochod(samochod_10);
        wypozyczalnia.dodaj_samochod(samochod_11);
        
        const brak_wypozyczen = wypozyczalnia.liczba_aktualnie_wypozyczonych(new Date(2022, 0, 30));
        const osiem_wypozyczony = wypozyczalnia.liczba_aktualnie_wypozyczonych(new Date(2022, 0, 31));
        const cztery_wypozyczony = wypozyczalnia.liczba_aktualnie_wypozyczonych(new Date(2022, 1, 4));
        const jeden_wypozyczony = wypozyczalnia.liczba_aktualnie_wypozyczonych(new Date(2022, 1, 20));

        expect(brak_wypozyczen).to.eql(0);
        expect(osiem_wypozyczony).to.eql(8);
        expect(cztery_wypozyczony).to.eql(4);
        expect(jeden_wypozyczony).to.eql(1);
	});

    it('Nie dodawaj samochodow i sprawdz liste dostepnych aut w zakresie czasu', function() 
	{     
        const brak_dostepnych = wypozyczalnia.lista_dostepnych_w_zakresie_czasu(new Date(2022, 0, 30), new Date(2022, 1, 20));

        expect(brak_dostepnych).to.eql([]);
	});

	it('Dodaj jeden samochod i sprawdz liste dostepnych aut w zakresie czasu', function() 
	{
        wypozyczalnia.dodaj_samochod(samochod_1);
        
        const brak_dostepnych = wypozyczalnia.lista_dostepnych_w_zakresie_czasu(new Date(2022, 0, 27), new Date(2022, 0, 28));
        const jeden_dostepny = wypozyczalnia.lista_dostepnych_w_zakresie_czasu(new Date(2022, 2, 20), new Date(2022, 2, 25));

        expect(brak_dostepnych).to.eql([]);
        expect(jeden_dostepny).to.eql([samochod_1]);
	});

    it('Dodaj 11 samochodow i sprawdz liste dostepnych aut w zakresie czasu', function() 
	{
        wypozyczalnia.dodaj_samochod(samochod_3);
        wypozyczalnia.dodaj_samochod(samochod_2);
        wypozyczalnia.dodaj_samochod(samochod_1);
        wypozyczalnia.dodaj_samochod(samochod_4);
        wypozyczalnia.dodaj_samochod(samochod_5);
        wypozyczalnia.dodaj_samochod(samochod_6);
        wypozyczalnia.dodaj_samochod(samochod_7);
        wypozyczalnia.dodaj_samochod(samochod_8);
        wypozyczalnia.dodaj_samochod(samochod_9);
        wypozyczalnia.dodaj_samochod(samochod_10);
        wypozyczalnia.dodaj_samochod(samochod_11);
        
        const jeden_dostepny = wypozyczalnia.lista_dostepnych_w_zakresie_czasu(new Date(2022, 0, 27), new Date(2022, 0, 28));
        const siedem_dostepny = wypozyczalnia.lista_dostepnych_w_zakresie_czasu(new Date(2022, 1, 4), new Date(2022, 1, 5));
        const dziesiec_dostepnych = wypozyczalnia.lista_dostepnych_w_zakresie_czasu(new Date(2022, 1, 10), new Date(2022, 1, 15));
        const jedenascie_dostepny = wypozyczalnia.lista_dostepnych_w_zakresie_czasu(new Date(2022, 2, 20), new Date(2022, 2, 25));

        expect(jeden_dostepny).to.eql([samochod_5]);
        expect(siedem_dostepny).to.eql([samochod_3, samochod_4, samochod_5, samochod_7, samochod_8, samochod_9, samochod_11]);
        expect(dziesiec_dostepnych).to.eql([samochod_3, samochod_2, samochod_4, samochod_5, samochod_6, samochod_7, samochod_8, samochod_9, samochod_10, samochod_11]);
        expect(jedenascie_dostepny).to.eql([samochod_3, samochod_2, samochod_1, samochod_4, samochod_5, samochod_6, samochod_7, samochod_8, samochod_9, samochod_10, samochod_11]);
	});

    it('Dodawaj samochody i sprawdzaj liste najczesciej uszkadzanych', function() {
        const pusta_lista = wypozyczalnia.lista_najczesciej_uszkadzanych();
        wypozyczalnia.dodaj_samochod(samochod_1);
        const jeden_element = wypozyczalnia.lista_najczesciej_uszkadzanych();
        wypozyczalnia.dodaj_samochod(samochod_5);
        const dwa_elementy = wypozyczalnia.lista_najczesciej_uszkadzanych();
        wypozyczalnia.dodaj_samochod(samochod_3);
        const trzy_elementy = wypozyczalnia.lista_najczesciej_uszkadzanych();
        wypozyczalnia.dodaj_samochod(samochod_2);
        wypozyczalnia.dodaj_samochod(samochod_4);
        wypozyczalnia.dodaj_samochod(samochod_6);
        wypozyczalnia.dodaj_samochod(samochod_7);
        wypozyczalnia.dodaj_samochod(samochod_8);
        wypozyczalnia.dodaj_samochod(samochod_9);
        wypozyczalnia.dodaj_samochod(samochod_10);
        wypozyczalnia.dodaj_samochod(samochod_11);
        const dziesiec_elementow = wypozyczalnia.lista_najczesciej_uszkadzanych();

        expect(pusta_lista).to.eql([]);
        expect(jeden_element).to.eql([samochod_1]);
        expect(dwa_elementy).to.eql([samochod_5, samochod_1]);
        expect(trzy_elementy).to.eql([samochod_5, samochod_3, samochod_1]);
        expect(dziesiec_elementow).to.eql([samochod_5, samochod_9, samochod_4, samochod_8, samochod_3, samochod_7, samochod_11, samochod_2, samochod_6, samochod_10]);
    });

    it('Dodawaj samochody i sprawdzaj liste najczesciej wypozyczanych', function() {
        const pusta_lista = wypozyczalnia.lista_najczesciej_wypozyczanych();
        wypozyczalnia.dodaj_samochod(samochod_1);
        const jeden_element = wypozyczalnia.lista_najczesciej_wypozyczanych();
        wypozyczalnia.dodaj_samochod(samochod_5);
        const dwa_elementy = wypozyczalnia.lista_najczesciej_wypozyczanych();
        wypozyczalnia.dodaj_samochod(samochod_3);
        const trzy_elementy = wypozyczalnia.lista_najczesciej_wypozyczanych();
        wypozyczalnia.dodaj_samochod(samochod_2);
        wypozyczalnia.dodaj_samochod(samochod_4);
        wypozyczalnia.dodaj_samochod(samochod_6);
        wypozyczalnia.dodaj_samochod(samochod_7);
        wypozyczalnia.dodaj_samochod(samochod_8);
        wypozyczalnia.dodaj_samochod(samochod_9);
        wypozyczalnia.dodaj_samochod(samochod_10);
        wypozyczalnia.dodaj_samochod(samochod_11);
        const dziesiec_elementow = wypozyczalnia.lista_najczesciej_wypozyczanych();

        expect(pusta_lista).to.eql([]);
        expect(jeden_element).to.eql([samochod_1]);
        expect(dwa_elementy).to.eql([samochod_1, samochod_5]);
        expect(trzy_elementy).to.eql([samochod_1, samochod_3, samochod_5]);
        expect(dziesiec_elementow).to.eql([samochod_1, samochod_2, samochod_6, samochod_10, samochod_3, samochod_7, samochod_9, samochod_11, samochod_4, samochod_8]);
    });
});
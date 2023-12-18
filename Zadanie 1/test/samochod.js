let expect = require('chai').expect;
let {Samochod} = require('../src/wypozyczalnia_pojazdow');

describe('samochod-tests', function() 
{
	let samochod_obj;
	
	beforeEach(function(){
		/* Index, przebieg, liczba_osob, cena/24h */
		samochod_obj = new Samochod(0, 10222, 4, 500, [], []);
	});

	it('Wypozycz dwa razy samochod i sprawdz dostepnosc', function() 
	{
		samochod_obj.wypozycz("Andrzej Kowalski", new Date(2022, 0, 27), new Date(2022, 0, 29));
		samochod_obj.wypozycz("Patryk Myslewski", new Date (2022, 0, 31), new Date(2022, 1, 2));
		const dostepny_26 = samochod_obj.dostepny_danego_dnia(new Date(2022, 0, 26));
		const dostepny_27 = samochod_obj.dostepny_danego_dnia(new Date(2022, 0, 27));
		const dostepny_28 = samochod_obj.dostepny_danego_dnia(new Date(2022, 0, 28));
		const dostepny_29 = samochod_obj.dostepny_danego_dnia(new Date(2022, 0, 29));
		const dostepny_30 = samochod_obj.dostepny_danego_dnia(new Date(2022, 0, 30));
		const dostepny_31 = samochod_obj.dostepny_danego_dnia(new Date(2022, 0, 31));
		const dostepny_2 = samochod_obj.dostepny_danego_dnia(new Date(2022, 1, 2));
		const dostepny_3 = samochod_obj.dostepny_danego_dnia(new Date(2022, 1, 3));

		const liczba_wypozyczen = samochod_obj.ile_wypozyczen();

		expect(dostepny_26).to.eql(true);
		expect(dostepny_27).to.eql(false);
		expect(dostepny_28).to.eql(false);
		expect(dostepny_29).to.eql(false);
		expect(dostepny_30).to.eql(true);
		expect(dostepny_31).to.eql(false);
		expect(dostepny_2).to.eql(false);
		expect(dostepny_3).to.eql(true);
		expect(liczba_wypozyczen).to.eql(2);
	});

	it('Wypozycz dwa razy samochod i sprawdz kiedy dostepny', function() 
	{
		samochod_obj.wypozycz("Andrzej Kowalski", new Date(2022, 0, 27), new Date(2022, 0, 29));
		samochod_obj.wypozycz("Patryk Myslewski", new Date (2022, 0, 31), new Date(2022, 1, 2));

		const dostepnosc = samochod_obj.kiedy_dostepny(new Date(2022, 0, 20));
		const dostepnosc2 = samochod_obj.kiedy_dostepny(new Date(2022, 0, 27));

		const liczba_wypozyczen = samochod_obj.ile_wypozyczen();

		expect(dostepnosc).to.eql(new Date(2022, 0, 20));
		expect(dostepnosc2).to.eql(new Date(2022, 0, 30));
		expect(liczba_wypozyczen).to.eql(2);
	});

	it('Dodaj dwa uszkodzenia i sprawdz czy liczba uszkodzen 2', function(){
		const zero = samochod_obj.ile_uszkodzen();
		samochod_obj.dodaj_uszkodzenie("Zderzak");
		const jeden = samochod_obj.ile_uszkodzen();
		samochod_obj.dodaj_uszkodzenie("Zderzak");
		const dwa = samochod_obj.ile_uszkodzen();

		expect(zero).to.eql(0);
		expect(jeden).to.eql(1);
		expect(dwa).to.eql(2);
	});
});
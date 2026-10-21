// Alt indholdet samlet ét sted, så det er nemt at rette en rolle eller en snaps.

export const PREMIERE = new Date('2026-11-07T14:00:00+01:00');

export const MAMMA = {
  id: 'mamma',
  navn: 'Mamma',
  rolle: 'Executive Producer',
  replik: 'Hun styrer det hele. Det har hun altid gjort.',
  evne: 'Har sidste ord. Og første. Og alle dem imellem.',
  stats: { Autoritet: 100, Overblik: 100, Tålmodighed: 100 },
};

export const MEDVIRKENDE = [
  { id: 'andreas', navn: 'Andreas', rolle: 'Diplomaten', replik: 'Kan få sild og laks til at sidde ved samme bord.', evne: 'Mægler, når debatten om sylte bliver personlig.' },
  { id: 'jannick', navn: 'Jannick', rolle: 'Bordeaux-baronen', replik: 'Kom i vinrødt. Går hjem i vinrødt.', evne: 'Matcher sit jakkesæt til rødkålen.' },
  { id: 'morten', navn: 'Morten', rolle: 'Butterflyeffekten', replik: 'Én butterfly. Uoverskuelige konsekvenser.', evne: 'Binder butterfly med én hånd. Snapsen er i den anden.' },
  { id: 'marcus', navn: 'Marcus', rolle: 'Snemanden', replik: 'Han kom ikke for at deltage. Han kom for at vinde.', evne: 'Kan ses fra rummet.' },
  { id: 'bojgaard', navn: 'Bøjgaard', rolle: 'Legenden', replik: 'Kun kendt ved efternavn. Som alle de store.', evne: 'Kan alle versene. Også dem, ingen andre kan.' },
  { id: 'patrick', navn: 'Patrick', rolle: 'Gentlemanden', replik: 'Vest, slips og nul fejltrin.', evne: 'Folder servietter til svaner.' },
  { id: 'rasmus', navn: 'Rasmus', rolle: 'Smilet i baggrunden', replik: 'Altid lidt bagved. Altid i godt humør.', evne: 'Dukker op på samtlige billeder.' },
  { id: 'botha', navn: 'Botha', rolle: 'Latteren', replik: 'Griner først. Forstår joken bagefter.', evne: 'Kan høres tre lokaler væk.' },
  { id: 'lasse', navn: 'Lasse', rolle: 'Den beige fare', replik: 'Rolig i jakken. Lynhurtig ved buffeten.', evne: 'Altid først ved ris a la manden.' },
  { id: 'per', navn: 'Per', rolle: 'Instruktøren', replik: 'Byggede denne hjemmeside. Undskylder intet.', evne: 'Skyder gråspurve med kanoner.' },
];

export const STATNAVNE = ['Snapsudholdenhed', 'Sangstemme', 'Sildetolerance'];

// Stabile "tilfældige" værdier, så Marcus altid har de samme tal
export function statsFor(id) {
  let h = 2166136261;
  for (const c of id) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return STATNAVNE.map((navn, i) => [navn, 58 + (((h >>> (i * 8)) & 255) % 42)]);
}

export const STATS = ['Fedt', 'Sprødhed', 'Julestemning', 'Snapsbehov'];

export const AKTER = [
  {
    id: 'havet', nr: 'I', navn: 'Havet', tema: 'hav',
    undertitel: 'Fire retter fra dybet.',
    retter: [
      { navn: 'Marinerede sild', med: 'med karrysalat', note: 'En frisk og syrlig åbning med noter af eddike, Nordsø og mormors køkken. Karryen tilføjer et strejf af 1970’erne.', snaps: 'Aalborg Taffel, iskold', stats: [45, 10, 85, 100] },
      { navn: 'Varmrøget laks', med: 'på salatbund med rejer, asparges, kaviar og dilddressing', note: 'Røget med varme, serveret med respekt. Kaviaren er primært med for at vise, at vi har råd.', snaps: 'Aalborg Dild. Dild til laks er lovpligtigt.', stats: [55, 15, 75, 70] },
      { navn: 'Rødspættefilet', med: 'med remoulade og citron', note: 'Paneret, gylden og fuldstændig ligeglad med dine nytårsforsætter. Remouladen er ikke valgfri.', snaps: 'En kold pilsner. Remouladen kræver det.', stats: [60, 90, 60, 65] },
      { navn: 'Rejer', med: 'med mayonnaise og citron', note: 'Små, lyserøde og i klart overtal. Mayonnaisen binder det hele sammen, også fællesskabet.', snaps: 'Brøndums. Citronen har gjort halvdelen af arbejdet.', stats: [50, 20, 65, 75] },
    ],
  },
  {
    id: 'koedet', nr: 'II', navn: 'Kødet', tema: 'glod',
    undertitel: 'Seks retter. Ingen vegetarer blev konsulteret.',
    retter: [
      { navn: 'Sprængt andebryst', med: '', note: 'Sprængt, ikke stegt. Ingen ved helt, hvad det betyder, men alle er enige om, at det er godt.', snaps: 'Et glas rødvin, hvis nogen husker at åbne den.', stats: [70, 30, 80, 60] },
      { navn: 'Glaseret julehamburgerryg', med: 'med grønlangkål', note: 'Glaseret til et niveau, hvor man kan spejle sig i den. Grønlangkålen er grøn, og det tæller som en salat.', snaps: 'Juleøl. Den mørke slags.', stats: [75, 40, 95, 80] },
      { navn: 'Mørbradbøf', med: 'stegt med bacon i flødesauce', note: 'Stegt med bacon. I flødesauce. Det er ikke en ret, det er en livsstil.', snaps: 'En stor juleøl og en kort lur bagefter.', stats: [95, 35, 70, 85] },
      { navn: 'Små hjemmelavede frikadeller', med: 'med rødkål', note: 'Små, runde og strategisk placeret. Rødkålen giver farve. Frikadellerne giver mening.', snaps: 'Aalborg Jubilæum. Klassikeren til klassikeren.', stats: [80, 60, 100, 90], frikadelle: true },
      { navn: 'Hjemmelavet julepostej', med: 'med champignon og bacon', note: 'Leverpostejens festklædte fætter. Champignon og bacon på toppen, fordi hvorfor ikke.', snaps: 'Rød Aalborg. Postejen fortjener lidt farve.', stats: [85, 55, 90, 70] },
      { navn: 'Hjemmelavet sylte', med: 'med sennep og rødbeder', note: 'Aftenens mest omdiskuterede ret. Elsket af nogle, frygtet af andre. Sennep anbefales til alle.', snaps: 'Gammel Dansk. Man skal være forberedt.', stats: [70, 5, 88, 100] },
    ],
  },
  {
    id: 'stoette', nr: 'III', navn: 'Støttespillerne', tema: 'guld',
    undertitel: 'Uden dem intet. Med dem alt.',
    retter: [
      { navn: 'Brunede kartofler (A)', med: '', note: 'Karamelliseret til perfektion. Hvad (A) står for, er klassificeret.', snaps: 'Vand. Det var en joke. Snaps.', stats: [40, 70, 95, 50] },
      { navn: 'Waldorfsalat', med: 'med æbler, selleri og valnødder', note: 'Den eneste ret på bordet med et luksushotel opkaldt efter sig. Den ved det godt.', snaps: 'Et glas cider. Det er trods alt æbler.', stats: [60, 65, 70, 40] },
      { navn: 'Rugbrød, smør og flûtes', med: '', note: 'Fundamentet. Uden dem er det bare et bord med mad på.', snaps: 'Alt. Rugbrød passer til alt.', stats: [30, 50, 80, 60] },
    ],
  },
];

export const RISALAMANDE = {
  navn: 'Ris a la mande', med: 'med kirsebærsauce',
  note: 'Finalen. Kold, cremet og serveret lige før pakkelegen, hvor venskaber bliver sat på prøve.',
  snaps: 'Kaffe og cognac. Man skal have kræfter til pakkelegen.',
  stats: [65, 5, 100, 30],
};

export const REGNSKAB = { kuverter: 10, prisPrKuvert: 342, mad: 3420, fragt: 350, total: 3770, moms: 754, retter: 14 };

export const STEMNING = [
  ['14:00', 40], ['15:30', 64], ['17:00', 82], ['18:30', 66, 'Syltedippet'],
  ['20:00', 91], ['21:30', 100, 'Fællessang'], ['23:00', 96], ['00:30', 84], ['02:00', 58, 'Taxaen'],
];

export const TJEKLISTE = [
  ['Menu bestilt hos Slagter Lange', true],
  ['Mamma informeret', true],
  ['Hjemmeside overdrevet', true],
  ['Pakke til pakkelegen købt (50 kr)', false],
  ['Snaps i fryseren', false],
  ['Bukser med elastik fundet frem', false],
  ['Sangtekster printet', false],
];

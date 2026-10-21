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
  { id: 'andreas', navn: 'Andreas', rolle: 'Jack-manden', replik: 'Drikker Jack fra solen står op, til den står op igen.', evne: 'Har ikke set en solnedgang ædru siden 2019.' },
  { id: 'jannick', navn: 'Jannick', rolle: 'Bygherren', replik: 'Ægte søn af Mamma. Går aldrig hjem.', evne: 'Har bygget et helt hus kun til julefrokosten. Tak for det.' },
  { id: 'morten', navn: 'Morten', rolle: 'Quizmasteren', replik: 'Står for underholdningen. Den består af én quiz.', evne: 'Quizzen er pervers og grafisk. Alle er vindere, også dem der taber.' },
  { id: 'marcus', navn: 'Marcus', rolle: 'Snemanden', replik: 'Ægte barnebarn af Mamma. Kom for at vinde.', evne: 'Vinder alt undtagen computerspil. Der er han elendig.' },
  { id: 'bojgaard', navn: 'Bøjgaard', rolle: 'Den nøgne sandhed', replik: 'Smider tøjet efter … nej. Han smider bare tøjet.', evne: 'Griner først og klæder sig af bagefter. Kan høres og ses tre lokaler væk.', statsFra: 'botha' },
  { id: 'patrick', navn: 'Patrick', rolle: 'Gentlemanden', replik: 'Vest, slips og nul fejltrin. Tager nok ikke sin PC med.', evne: 'Kan ikke folde servietter til svaner. Til gengæld er han rigtig dårlig til det.' },
  { id: 'rasmus', navn: 'Rasmus', rolle: 'Nikkedukken', replik: 'Smiler og nikker, som om han forstår, hvad du siger.', evne: 'Fortsætter med at nikke længe efter, at du har mistet evnen til at tale.' },
  { id: 'botha', navn: 'Botha', rolle: 'Legenden', replik: 'Kun kendt ved efternavn. Som alle de store.', evne: 'Kan alle versene. Også de sjofle, ingen andre tør synge.', statsFra: 'bojgaard' },
  { id: 'lasse', navn: 'Lasse', rolle: 'Pakkehorderen', replik: 'Hamstrer pakker som et egern med et alvorligt problem.', evne: 'Smiler bredt trods alle skavankerne. Ingen ved, hvordan.' },
  { id: 'per', navn: 'Per', rolle: 'Instruktøren', replik: 'Byggede denne side. Kommer for sent til sin egen premiere.', evne: 'Skyder gråspurve med kanoner. Typisk et kvarter forsinket.' },
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

export const REGNSKAB = { personer: 11, mad: 3420, fragt: 350, total: 3770, moms: 754, retter: 14 };

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

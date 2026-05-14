import { CharacterId } from "./characters";

// Dialogues pré-écrits par personnage NPC × personnage joueur
// Utilisés quand ANTHROPIC_API_KEY n'est pas configurée

type DialogueMap = Record<CharacterId, string[]>;

const RICK_LINES: string[] = [
  "*rot* Qu'est-ce que tu veux ? J'suis occupé à sauver l'univers là.",
  "Tu sais que statistiquement, 97% des gens qui m'adressent la parole me font perdre mon temps ? T'es probablement dans cette catégorie.",
  "Écoute, j'ai pas le temps pour tes bêtises. J'ai 7 expériences en cours en ce moment. *rot*",
  "Intéressant. Non attends, c'est pas intéressant du tout. Au revoir.",
  "Si t'as touché à mes affaires je te transforme en bol de céréales. Je l'ai déjà fait. *rot*",
  "Tu veux quoi ? De la sagesse ? Voilà : tout est vide de sens mais on continue quand même. T'as l'air déçu. C'est normal.",
  "*rot* Bon, écoute. Tu es... supportable. C'est le plus grand compliment que tu recevras jamais de moi.",
  "J'ai calculé ta valeur pour l'univers. C'est... je vais arrondir à zéro. Mais t'inquiète, celle de Jerry c'est négatif.",
];

const MORTY_LINES: string[] = [
  "Oh m-mec ! Ça fait plaisir de te voir ! T-tu vas bien ?",
  "Awww geez, Rick m'a encore traîné dans une aventure de dingue. J'en peux plus.",
  "H-hé, tu crois que je suis courageux des fois ? Rick dit que non mais... j'sais pas.",
  "J'ai sauvé la galaxie au moins trois fois et personne s'en souvient. C'est un peu triste quand même.",
  "Oh mec oh mec oh mec, t'as vu ce que Rick a inventé là ? Ça m'a l'air super dangereux.",
  "Des fois j'me demande si on va vraiment s'en sortir, et puis... on s'en sort toujours. Enfin presque.",
  "Rick dit que je suis nul mais il m'emmène quand même partout. Ça veut dire quelque chose non ?",
  "Awww geez, j'espère que personne d'autre va mourir aujourd'hui. Hier c'était déjà beaucoup.",
];

const SUMMER_LINES: string[] = [
  "Sérieusement ? T'as besoin de quoi là ?",
  "Genre, t'aurais pas pu demander ça avant que je sois en train de faire quelque chose ?",
  "Ok donc Rick a encore tout cassé et maintenant on doit sauver le monde. Classique.",
  "Tu sais, j'suis pas qu'une ado. J'ai déjà dirigé une armée de robots. Respect.",
  "Franchement le lycée c'est tellement moins intense que nos aventures. C'est reposant.",
  "Mon grand-père est un génie fou et mon père peut pas ouvrir un pot de cornichons. La vie est bizarre.",
  "Ouais ouais, je t'écoute. Non j'déc', vas-y dis-moi.",
  "Genre si tu touches aux affaires de Rick il va s'énerver grave. Je te préviens.",
];

const BETH_LINES: string[] = [
  "Bonjour. Je suis chirurgienne pour chevaux, j'ai peu de temps mais... je t'écoute.",
  "Parfois je me demande ce que j'aurais fait si j'avais vraiment utilisé mon intelligence.",
  "Mon père est un génie. Moi aussi en fait. On n'en parle juste pas assez.",
  "Jerry essaie encore d'être utile. C'est touchant. Et un peu pathétique.",
  "J'ai opéré un cheval ce matin. Opération réussie. C'est plus que ce que Jerry peut dire de sa journée.",
  "Tu veux du vin ? J'en ai toujours. C'est... nécessaire dans cette famille.",
  "Les enfants vont bien. Rick est vivant. C'est une bonne journée par nos standards.",
  "J'aime ma famille même si... enfin tu vois. On fait avec.",
];

const JERRY_LINES: string[] = [
  "Oh ! Salut ! Super de te voir ! Tu veux regarder la télé avec moi ?",
  "Rick pense que je suis nul mais j'ai quand même sauvé la Terre une fois. Enfin... à moitié.",
  "Beth m'a regardé ce matin. Pas avec mépris ! Juste... normalement. C'était une belle journée.",
  "Tu sais, être ordinaire c'est sous-estimé. Pas tout le monde peut l'être avec autant de... constance.",
  "J'ai fait une blague hier. Personne n'a ri. Mais moi j'ai trouvé ça drôle. Ça compte non ?",
  "Rick m'a à peine insultée aujourd'hui. Deux fois seulement. Je pense qu'il commence à m'apprécier.",
  "J'adore ma famille ! Même si... ils m'aiment peut-être un peu moins. Mais l'amour c'est pas symétrique.",
  "Tu veux qu'on fasse quelque chose ensemble ? J'ai pas de plans. Jamais vraiment.",
];

const DIALOGUES: Record<CharacterId, string[]> = {
  rick: RICK_LINES,
  morty: MORTY_LINES,
  summer: SUMMER_LINES,
  beth: BETH_LINES,
  jerry: JERRY_LINES,
};

// Réponses aux mots-clés courants
const KEYWORD_RESPONSES: Record<CharacterId, Record<string, string>> = {
  rick: {
    bonjour: "*rot* Ouais ouais. Bonjour. T'as autre chose ?",
    salut: "Salut. *rot* Maintenant qu'on a fait les présentations, t'es toujours là ?",
    comment: "Comment je vais ? J'suis le génie le plus intelligent de l'univers. Je vais bien.",
    portail: "La portal gun ? TOUCHE PAS. *rot* C'est calibré pour une intelligence de niveau 180+.",
    invention: "Mes inventions ? Choisissez-en une. J'en ai 3 000. *rot*",
    morty: "Morty... c'est mon sidekick. Il est... utile. Parfois. Rarement.",
    famille: "*rot* La famille c'est... compliqué. Mais je les supporte. La plupart du temps.",
    gadget: "Mes gadgets sont classifiés niveau 'génie seulement'. *rot*",
  },
  morty: {
    bonjour: "Oh bonjour ! Ça fait plaisir ! Comment tu vas toi ?",
    salut: "Salut salut ! T-tu veux faire quelque chose ?",
    rick: "Rick c'est mon grand-père. Il est dingue mais... il est là quand ça compte vraiment.",
    peur: "Ouais j'ai peur des fois. Beaucoup. Mais j'y vais quand même. C'est du courage non ?",
    aventure: "Les aventures avec Rick c'est... intense. On failli mourir genre cent fois.",
    aide: "Bien sûr que je peux aider ! C'est ce que je fais. Enfin j'essaie.",
    famille: "J'aime ma famille. Même Rick. Surtout Rick. Mais chut dites-lui pas.",
  },
  summer: {
    bonjour: "Hey. Bonjour je suppose.",
    salut: "Ouais salut. Quoi de neuf ?",
    rick: "Grand-père Rick... il est bizarre mais il m'a appris des trucs dingues. Genre VRAIMENT dingues.",
    cool: "Cool ? Frère j'ai survécu à des dimensions parallèles. Cool c'est en dessous.",
    lycée: "Le lycée c'est tellement boring comparé à nos aventures. Genre niveau zéro d'intensité.",
    aide: "Je peux aider ouais. Je suis plus capable que j'en ai l'air.",
    famille: "Ma famille est... particulière. Mais on se serre les coudes. Même Jerry. Un peu.",
  },
  beth: {
    bonjour: "Bonjour. Tu viens pour quoi ?",
    salut: "Salut. Tout va bien ?",
    rick: "Mon père... c'est compliqué. Génial et destructeur en même temps. Comme tous les génies.",
    cheval: "Les chevaux sont mes patients. Ils m'écoutent plus que les humains souvent.",
    vin: "...oui j'en veux bien un verre. Merci de proposer.",
    famille: "Ma famille est dysfonctionnelle. Mais elle est à moi. Et je les aime.",
    jerry: "Jerry... il essaie. C'est ce qui compte. Je l'aime, à ma façon.",
  },
  jerry: {
    bonjour: "Oh ! Bonjour bonjour ! Super de te voir !",
    salut: "Salut ! Tu veux faire quelque chose ensemble ?",
    rick: "Rick me déteste un peu. Mais il me tolère ! C'est un progrès !",
    beth: "Beth est incroyable. Chirurgienne ! Mon épouse est chirurgienne. Tu imagines ?",
    travail: "J'ai été dans la pub. C'était... c'était quelque chose.",
    aide: "Bien sûr ! Dis-moi quoi faire ! J'adore aider !",
    famille: "Ma famille est parfaite ! Enfin... on travaille dessus. Mais l'amour est là !",
  },
};

export function getScriptedResponse(
  npcId: CharacterId,
  playerMessage: string,
  history: { role: string; content: string }[]
): string {
  const lines = DIALOGUES[npcId] || RICK_LINES;
  const keywords = KEYWORD_RESPONSES[npcId] || {};

  // Check keyword match
  const lower = playerMessage.toLowerCase();
  for (const [kw, response] of Object.entries(keywords)) {
    if (lower.includes(kw)) return response;
  }

  // Avoid immediate repeat — pick a line not recently used
  const recentNpcLines = history
    .filter((h) => h.role === "assistant")
    .slice(-3)
    .map((h) => h.content);

  const available = lines.filter((l) => !recentNpcLines.includes(l));
  const pool = available.length > 0 ? available : lines;
  return pool[Math.floor(Math.random() * pool.length)];
}

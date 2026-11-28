// Chapter 1: "The Lost Star Map". Quest data only — the engine is in story.js.
//
// A quest unlocks when every quest in `after` is done (or right away if there is none).
// Steps (done in order):
//   find  — a story thing appears in `scene` at `at` [gx, gy, gz]; tap it.      art: 'letter' | 'note' | 'kitten'
//   talk  — tap character `npc` in `scene`; optional `riddles` must be solved.
//   give  — drag something of `kind` onto `npc` in `scene` (food id prefix or wearable kind).
//   tap   — tap item `item` in `scene`; optional `code` must be dialled in first.
// `say` = lines shown when the step is done (spoken by the npc, or by the narrator for find/tap).
// `ask` = lines when you talk to the npc before a give step is done.

export const PIECES = 6;

export const QUESTS = [
  {
    id: 'letter', title: 'A Mysterious Letter', piece: 'p1', coins: 30,
    steps: [
      { type: 'find', scene: 'home', place: "Olivia's Room", at: [4.4, 4.6], art: 'letter', hint: 'Something was slipped under the door of your room…',
        say: ['A letter with a golden star seal! It says:',
          '"Dear explorer, long ago the STAR MAP of our galaxy was torn into six pieces and hidden far and wide."',
          '"Whoever puts it back together will find a planet no one has ever seen. Begin with someone who knows the stars."',
          '"— A friend" … Who knows the stars? Maybe Juno at the Starry Lookout on Winter Planet! 🔭'] },
      { type: 'talk', scene: 'lookout', npc: 'juno', place: 'Starry Lookout', hint: 'Ask Juno at the Starry Lookout about the letter.',
        intro: ['A letter about the Star Map? I KNEW it was real! ✨', 'I have the first piece — but the map only goes to someone clever. Answer my riddles!'],
        riddles: [
          { q: 'I have a long shiny tail, but I am not a cat. I zoom across the night sky. What am I?', options: ['A comet ☄️', 'A kite 🪁', 'A mouse 🐭'], answer: 0 },
          { q: 'I come out at night without being called, and hide in the day without being stolen. What am I?', options: ['The stars ✨', 'A thief 🦹', 'The milk 🥛'], answer: 0 },
        ],
        say: ['Brilliant! Here is the first piece of the Star Map! 🗺️', 'The other pieces are with friends who need help. Look for the ❗ above their heads.'] },
    ],
  },
  {
    id: 'leo', title: 'Too Hot at the Beach', piece: 'p2', coins: 20, after: ['letter'],
    steps: [
      { type: 'give', scene: 'beach', npc: 'leo', place: 'Beach', kind: 'icecream', hint: 'Leo at the Beach is melting! Bring him an ice cream from the cart.',
        ask: ['Phew, it is SO hot today… 🥵', 'If only someone brought me an ice cream from the cart… 🍦'],
        say: ['Ahh, much better! Thank you! 🍦', 'While digging my castle I found this strange paper with stars on it. It must be yours!'] },
    ],
  },
  {
    id: 'mia', title: "Mia's Big Order", piece: 'p3', coins: 20, after: ['letter'],
    steps: [
      { type: 'give', scene: 'cafe', npc: 'mia', place: 'Sunny Café', kind: 'croissant', hint: 'Mia at the Sunny Café wants a croissant from the pastry case.',
        ask: ['I am SO hungry! Could you get me a croissant? 🥐 The pastry case is by the counter.'],
        say: ['Yum! Now… a smoothie to go with it? The blender is on the counter! 🫐'] },
      { type: 'give', scene: 'cafe', npc: 'mia', place: 'Sunny Café', kind: 'smoothie', hint: 'Now bring Mia a smoothie from the blender.',
        ask: ['A smoothie from the blender, please! 🫐'],
        say: ['Perfect breakfast! 💛', 'Look what was hidden under my plate — a piece of an old map! Take it!'] },
    ],
  },
  {
    id: 'kitten', title: 'The Runaway Kitten', piece: 'p4', coins: 25, after: ['letter'],
    steps: [
      { type: 'talk', scene: 'petshop', npc: 'keeper', place: 'Pet Shop', hint: 'The keeper at the Pet Shop looks worried. Ask what happened.',
        say: ['Oh no, oh no! My kitten Pip ran away this morning! 🐱', 'She loves water and ducks… maybe she went to the Park? Please find her!'] },
      { type: 'find', scene: 'park', place: 'Park', at: [1.9, 6.6], art: 'kitten', hint: 'Look for Pip the kitten in the Park — near the duck pond?',
        say: ['Meow! 🐱 You found Pip! She was watching the ducks.', 'Let\'s bring the good news back to the Pet Shop!'] },
      { type: 'talk', scene: 'petshop', npc: 'keeper', place: 'Pet Shop', hint: 'Tell the keeper at the Pet Shop that Pip is safe.',
        say: ['You found Pip?! Thank you, thank you! 💜', 'Pip was playing with this old paper in her basket. It has stars on it — it must be a map piece!'] },
    ],
  },
  {
    id: 'grandpa', title: "Grandpa Ole's Riddles", piece: 'p5', coins: 25, after: ['letter'],
    steps: [
      { type: 'talk', scene: 'cabin', npc: 'grandpa', place: 'Cozy Cabin', hint: 'Grandpa Ole at the Cozy Cabin on Winter Planet has something for you.',
        intro: ['Ho ho! The Star Map, you say? I have been keeping a piece safe for many years. ❄️', 'But first, warm up an old man\'s brain with my riddles!'],
        riddles: [
          { q: 'The more of me you take, the more you leave behind. What am I?', options: ['Footsteps 👣', 'Cookies 🍪', 'Snowballs ⛄'], answer: 0 },
          { q: 'What has hands but cannot clap?', options: ['A clock 🕰️', 'A snowman ☃️', 'A glove 🧤'], answer: 0 },
        ],
        say: ['Clever! Now, a cup of cocoa would warm my old bones… The stove is right there. ☕'] },
      { type: 'give', scene: 'cabin', npc: 'grandpa', place: 'Cozy Cabin', kind: 'cocoa', hint: 'Make cocoa on the stove and give it to Grandpa Ole.',
        ask: ['Just one cup of cocoa from the stove, please! ☕'],
        say: ['Mmm, perfect! ☕ Here is the piece I promised.', 'And a secret: the LAST piece is hidden in your very own home. Look for torn notes with numbers!'] },
    ],
  },
  {
    id: 'attic', title: 'The Secret Attic', piece: 'p6', coins: 100, after: ['leo', 'mia', 'kitten', 'grandpa'],
    steps: [
      { type: 'find', scene: 'games', place: 'Game Room', at: [7.2, 6.4], art: 'note', digit: '4', order: 'FIRST', hint: 'Torn note 1 of 3: someone saw it in the Game Room.',
        say: ['A torn note! It says: "The FIRST number is 4."'] },
      { type: 'find', scene: 'salon', place: 'Hair Salon', at: [6.6, 5.9], art: 'note', digit: '7', order: 'SECOND', hint: 'Torn note 2 of 3: look in the Hair Salon.',
        say: ['Another torn note! "The SECOND number is 7."'] },
      { type: 'find', scene: 'bakery', place: 'Snowflake Bakery', at: [7.6, 6.6], art: 'note', digit: '2', order: 'THIRD', hint: 'Torn note 3 of 3: it smells like cookies… the Snowflake Bakery!',
        say: ['The last note! "The THIRD number is 2. The bookcase in your room has a secret…"'] },
      { type: 'tap', scene: 'home', item: 'bookshelf', place: "Olivia's Room", code: '472', hint: 'Tap the bookcase in your room and dial the secret code from the torn notes.',
        say: ['Click! The bookcase slides away… there is a hidden ladder going UP! ✨'], go: 'attic' },
      { type: 'tap', scene: 'attic', item: 'chest', place: 'Secret Attic', hint: 'Open the old chest in the Secret Attic.',
        say: ['Inside the chest, wrapped in a blanket… the LAST piece of the Star Map! 🗺️'] },
    ],
    finale: ['The Star Map glows… all six pieces fit together! 🌟',
      'A planet no one has ever seen shines in the corner of the map: MAGIC ACADEMY. 🏰✨',
      'Chapter 1 complete! Your adventure continues in Chapter 2… coming soon!'],
  },
];

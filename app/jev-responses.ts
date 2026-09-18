export type ChaosType =
  | "rush_hour"
  | "health_inspector"
  | "karen"
  | "literal_fire"
  | "idle"
  | "order_complete"
  | "order_burned"
  | "order_sent_back"
  | "meltdown";

export interface JevLine {
  text: string;
  mood: "panicked" | "manic" | "unhinged" | "zen" | "rage" | "defeated";
}

const responses: Record<ChaosType, JevLine[]> = {
  idle: [
    { text: "Alright, keep it together Jev. You got this. Probably.", mood: "zen" },
    { text: "Nice and calm. Too calm. Something is about to go wrong.", mood: "panicked" },
    { text: "Prep the mise en place. Stay focused. Breathe.", mood: "zen" },
    { text: "Why is it so quiet. I don't trust the quiet.", mood: "panicked" },
    { text: "One ticket at a time. Professional. Dignified.", mood: "zen" },
    { text: "Is the pilot light still on? THE PILOT LIGHT??", mood: "panicked" },
    { text: "This is fine. Everything is fine. The stove is fine.", mood: "manic" },
    { text: "Chef mode: activated. Anxiety mode: also activated.", mood: "manic" },
  ],
  rush_hour: [
    { text: "TWELVE TICKETS JUST CAME IN AT ONCE. TWELVE.", mood: "panicked" },
    { text: "WHO ORDERED THE RISOTTO IT TAKES 45 MINUTES", mood: "rage" },
    { text: "FASTER FASTER FASTER the pasta is going to congeal", mood: "manic" },
    { text: "I have four burners and seventeen orders this is MATH", mood: "panicked" },
    { text: "THE PRINTER WON'T STOP. IT WON'T STOP PRINTING.", mood: "unhinged" },
    { text: "Every table ordered medium rare. EVERY. TABLE.", mood: "rage" },
    { text: "I'm speed-dicing onions while crying. The tears are not from the onions.", mood: "defeated" },
    { text: "This is not a kitchen this is a WARZONE", mood: "manic" },
    { text: "Table 7 wants their steak butterflied DURING RUSH HOUR??", mood: "rage" },
    { text: "My hands are moving but my brain left twenty minutes ago", mood: "unhinged" },
  ],
  health_inspector: [
    { text: "HEALTH INSPECTOR?? RIGHT NOW?? *shoves things under counter*", mood: "panicked" },
    { text: "Yes sir that's definitely within temperature range. Don't check.", mood: "panicked" },
    { text: "Oh you want to see the walk-in? haha no that's... decorative.", mood: "manic" },
    { text: "When did that expiration date get there. That wasn't there before.", mood: "panicked" },
    { text: "Everything is labeled and dated! *frantically labeling things*", mood: "manic" },
    { text: "The grease trap? Oh we LOVE maintaining that. Love it.", mood: "unhinged" },
    { text: "Please don't open that drawer. PLEASE DON'T OPEN THAT DRAWER.", mood: "panicked" },
    { text: "Five second rule? Never heard of it. We operate on zero seconds here.", mood: "manic" },
    { text: "Is clipboard man writing? HE'S WRITING SOMETHING DOWN.", mood: "panicked" },
    { text: "Our sanitizer solution is definitely at 200ppm. *sweating*", mood: "defeated" },
  ],
  karen: [
    { text: "She wants it gluten-free, dairy-free, flavor-free apparently", mood: "rage" },
    { text: "Ma'am this is a FRENCH restaurant we don't do 'extra ranch'", mood: "rage" },
    { text: "She sent back the steak for being 'too steaky'", mood: "unhinged" },
    { text: "'Can I speak to the chef' YOU'RE LOOKING AT HIM", mood: "rage" },
    { text: "She's taking PHOTOS of the plate angle. The ANGLE.", mood: "defeated" },
    { text: "Table 4 wants to substitute every single ingredient. EVERY ONE.", mood: "manic" },
    { text: "She's writing a Yelp review IN REAL TIME. I CAN SEE HER TYPING.", mood: "panicked" },
    { text: "No ma'am, the soup is not 'too wet'. It's SOUP.", mood: "rage" },
    { text: "She asked if our water is organic. ORGANIC WATER.", mood: "unhinged" },
    { text: "Karen wants the salmon but cooked like chicken. What does that MEAN.", mood: "unhinged" },
  ],
  literal_fire: [
    { text: "FIRE FIRE ACTUAL FIRE THIS IS NOT A DRILL", mood: "panicked" },
    { text: "WHO LEFT THE OIL UNATTENDED WHO WAS IT", mood: "rage" },
    { text: "THE CURTAINS. THE CURTAINS ARE ON FIRE.", mood: "panicked" },
    { text: "GRAB THE EXTINGUISHER NOT THE OLIVE OIL", mood: "manic" },
    { text: "This is fine. I am calm. NOTHING IS FINE.", mood: "unhinged" },
    { text: "THE FLAMBE WAS TOO FLAMBE. WAY TOO FLAMBE.", mood: "panicked" },
    { text: "Baking soda baking soda WHERE IS THE BAKING SODA", mood: "manic" },
    { text: "The kitchen is now... al dente? Charred? Help.", mood: "defeated" },
    { text: "Insurance. I need to call insurance. WHILE COOKING.", mood: "unhinged" },
    { text: "At least the ambiance is warm. TOO WARM. EXTREMELY WARM.", mood: "manic" },
  ],
  order_complete: [
    { text: "HEARD! One down. Forty-seven to go.", mood: "zen" },
    { text: "Beautiful plate. Chef's kiss. Next!", mood: "zen" },
    { text: "That one actually looked good. I'm shocked.", mood: "manic" },
    { text: "Window! Pick up! Before it dies!", mood: "panicked" },
    { text: "Nailed it. Maybe I AM a real chef.", mood: "zen" },
  ],
  order_burned: [
    { text: "THAT WAS WAGYU. ACTUAL WAGYU. NOW IT'S CHARCOAL.", mood: "rage" },
    { text: "Burnt beyond recognition. Just like my career.", mood: "defeated" },
    { text: "I can feel Gordon Ramsay's disappointment from here.", mood: "defeated" },
    { text: "Trash it. Start over. Don't cry. DON'T CRY.", mood: "panicked" },
    { text: "Carbon is a flavor right? RIGHT?", mood: "unhinged" },
  ],
  order_sent_back: [
    { text: "SENT BACK?? I put my SOUL into that dish!", mood: "rage" },
    { text: "'Undercooked'?? It's TARTARE. It's SUPPOSED to be--fine.", mood: "rage" },
    { text: "They want it more done? I'll give them MORE DONE.", mood: "manic" },
    { text: "My art. Rejected. Again. This is culinary school all over.", mood: "defeated" },
    { text: "Refire on table 4. My nemesis. My archnemesis table.", mood: "rage" },
  ],
  meltdown: [
    { text: "I QUIT. I ACTUALLY QUIT. WHO WANTS TO BE A CHEF ANYWAY.", mood: "rage" },
    { text: "THAT'S IT. EVERYONE OUT OF MY KITCHEN. EVERYONE.", mood: "rage" },
    { text: "YOU CALL THAT A JULIENNE?? MY GRANDMOTHER CUTS BETTER AND SHE'S A ROBOT", mood: "unhinged" },
    { text: "THIS RISOTTO IS SO RAW IT'S STILL GROWING IN A FIELD", mood: "rage" },
    { text: "SHUT IT DOWN. SHUT. IT. DOWN.", mood: "rage" },
    { text: "WHERE'S THE LAMB SAUCE?! oh wait wrong chef. WHERE'S MY SAUCE THOUGH", mood: "unhinged" },
    { text: "I've lost control. The kitchen owns me now. I am the kitchen's puppet.", mood: "unhinged" },
    { text: "IT'S RAAAAAAW. everything. All of it. The whole kitchen. RAW.", mood: "rage" },
  ],
};

export function getJevLine(type: ChaosType): JevLine {
  const lines = responses[type];
  return lines[Math.floor(Math.random() * lines.length)];
}

export const moodColors: Record<JevLine["mood"], string> = {
  panicked: "#f0b429",
  manic: "#e8592f",
  unhinged: "#ff2222",
  zen: "#47a347",
  rage: "#c41e1e",
  defeated: "#7a6a5a",
};

export const moodEmoji: Record<JevLine["mood"], string> = {
  panicked: "O_O",
  manic: ">_<",
  unhinged: "@_@",
  zen: "-_-",
  rage: ">:[",
  defeated: "T_T",
};

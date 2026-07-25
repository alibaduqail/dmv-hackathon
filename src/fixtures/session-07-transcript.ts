import type { TranscriptLine } from '../types.ts';

// FROZEN AT 11:00. Session 7, Jul 25 2026. Teletherapy, ~18 minutes.
//
// This is the only transcript in the repo. Extraction runs on it live, on stage.
// Every `evidence` span the model returns must appear here VERBATIM — validation
// drops anything that fails String.indexOf, because a card that scrolls nowhere
// looks broken in front of judges.
//
// STRAIGHT APOSTROPHES ONLY. A smart quote here silently kills scroll-sync.
//
// Deliberately planted:
//   ~t=452  the independent production. verbal_cue -> INDEPENDENT_PRODUCTION
//   ~t=742  "fourteen out of twenty" — the ATTEMPT trial count, stated aloud
//   ~t=628  client SELF-REPORT, not a clinician observation -> the ~0.6 card to reject
//   ~t=845  /r/ blends probed and inconclusive -> the thread that stays open
//   ~t=96   home practice 2 of 3 -> continuity with session 6

export const transcript: TranscriptLine[] = [
  { t_sec: 0, speaker: 'clinician', text: "Morning, Maya. Can you see and hear me okay?" },
  { t_sec: 5, speaker: 'client', text: "Yeah. My mom's making lunch so it might be loud." },
  { t_sec: 11, speaker: 'clinician', text: "That's fine, we'll work around it. Is your mirror next to you?" },
  { t_sec: 17, speaker: 'client', text: "Got it." },
  { t_sec: 20, speaker: 'clinician', text: "Good. Before we start, how did the practice cards go this week?" },
  { t_sec: 27, speaker: 'client', text: "I did Tuesday and Thursday. Saturday we went to my cousin's so I forgot." },
  { t_sec: 35, speaker: 'clinician', text: "Two out of three is solid. That's the same as last week, and I can see it in your warm-up." },
  { t_sec: 44, speaker: 'client', text: "My mom made me do them before dinner." },
  { t_sec: 49, speaker: 'clinician', text: "Tell her thank you from me. Let's start with the mirror. Watch your own mouth on this one." },
  { t_sec: 58, speaker: 'clinician', text: "Say 'rabbit' for me." },
  { t_sec: 62, speaker: 'client', text: "Rabbit." },
  { t_sec: 65, speaker: 'clinician', text: "That was a W. Look in the mirror and pull the sides of your tongue back and up." },
  { t_sec: 74, speaker: 'client', text: "Rabbit." },
  { t_sec: 77, speaker: 'clinician', text: "Better. Do you hear the difference between those two?" },
  { t_sec: 83, speaker: 'client', text: "The second one was scratchier." },
  { t_sec: 88, speaker: 'clinician', text: "Scratchier is exactly right. That's the R. Keep the mirror for the next set." },
  { t_sec: 96, speaker: 'clinician', text: "Ten words, mirror only. Ready? Rain." },
  { t_sec: 103, speaker: 'client', text: "Rain." },
  { t_sec: 106, speaker: 'clinician', text: "Yes. Red." },
  { t_sec: 110, speaker: 'client', text: "Red." },
  { t_sec: 113, speaker: 'clinician', text: "Road." },
  { t_sec: 116, speaker: 'client', text: "Woad. I mean, road." },
  { t_sec: 121, speaker: 'clinician', text: "You caught that yourself. That's new." },
  { t_sec: 128, speaker: 'clinician', text: "Let's take the mirror away and see what happens. I'll just remind you with my voice." },
  { t_sec: 138, speaker: 'clinician', text: "Tongue back. Rocket." },
  { t_sec: 144, speaker: 'client', text: "Rocket." },
  { t_sec: 148, speaker: 'clinician', text: "Tongue back. River." },
  { t_sec: 153, speaker: 'client', text: "River." },
  { t_sec: 157, speaker: 'clinician', text: "Nice. Two in a row with only a verbal reminder." },
  { t_sec: 166, speaker: 'clinician', text: "Robot." },
  { t_sec: 170, speaker: 'client', text: "Wobot." },
  { t_sec: 174, speaker: 'clinician', text: "Tongue back on that one. Try it again." },
  { t_sec: 180, speaker: 'client', text: "Robot." },
  { t_sec: 184, speaker: 'clinician', text: "There it is. Let's keep going without the mirror." },
  { t_sec: 195, speaker: 'clinician', text: "Rug." },
  { t_sec: 199, speaker: 'client', text: "Rug." },
  { t_sec: 203, speaker: 'clinician', text: "Ring." },
  { t_sec: 207, speaker: 'client', text: "Ring." },
  { t_sec: 215, speaker: 'clinician', text: "You're not waiting for me to remind you anymore. Do you notice that?" },
  { t_sec: 224, speaker: 'client', text: "Kind of." },
  { t_sec: 300, speaker: 'clinician', text: "Let's put it in a sentence. The rabbit ran to the road." },
  { t_sec: 310, speaker: 'client', text: "The wabbit wan to the woad." },
  { t_sec: 316, speaker: 'clinician', text: "Sentences are harder. That's normal. Back to single words for a minute." },
  { t_sec: 330, speaker: 'clinician', text: "Rope." },
  { t_sec: 334, speaker: 'client', text: "Rope." },
  { t_sec: 340, speaker: 'clinician', text: "Rain." },
  { t_sec: 344, speaker: 'client', text: "Rain." },
  { t_sec: 420, speaker: 'client', text: "Can I try the rabbit one again? I want to do it without you telling me." },
  { t_sec: 430, speaker: 'clinician', text: "Go ahead. No mirror, no reminder from me." },
  { t_sec: 438, speaker: 'client', text: "Rabbit." },
  { t_sec: 442, speaker: 'clinician', text: "Maya. Say it one more time." },
  { t_sec: 448, speaker: 'client', text: "Rabbit." },
  { t_sec: 452, speaker: 'clinician', text: "That was a clean R at the front of the word with no cue from me at all. First time since we started in June." },
  { t_sec: 464, speaker: 'client', text: "Really?" },
  { t_sec: 467, speaker: 'clinician', text: "Six weeks. I have it written down every single session." },
  { t_sec: 476, speaker: 'clinician', text: "Do it again so your body remembers it. Rabbit." },
  { t_sec: 483, speaker: 'client', text: "Rabbit." },
  { t_sec: 490, speaker: 'clinician', text: "And again, different word. Rocket." },
  { t_sec: 496, speaker: 'client', text: "Rocket." },
  { t_sec: 560, speaker: 'clinician', text: "Let's finish the probe set. Ten more, no cueing unless you get stuck." },
  { t_sec: 628, speaker: 'client', text: "I think I got that one right. It felt scratchy." },
  { t_sec: 636, speaker: 'clinician', text: "Keep going, we'll count them at the end." },
  { t_sec: 700, speaker: 'clinician', text: "Okay, that's the set." },
  { t_sec: 742, speaker: 'clinician', text: "That's fourteen out of twenty. Last week you were at six." },
  { t_sec: 752, speaker: 'client', text: "Is that good?" },
  { t_sec: 755, speaker: 'clinician', text: "You more than doubled it, and you did most of them with just a verbal reminder." },
  { t_sec: 800, speaker: 'clinician', text: "One more thing I want to try. Blends. Say 'tree' for me." },
  { t_sec: 810, speaker: 'client', text: "Twee." },
  { t_sec: 814, speaker: 'clinician', text: "And 'green'." },
  { t_sec: 818, speaker: 'client', text: "Gween." },
  { t_sec: 822, speaker: 'clinician', text: "Try 'tree' one more time, slower." },
  { t_sec: 828, speaker: 'client', text: "T-ree. Tree?" },
  { t_sec: 834, speaker: 'clinician', text: "That one was closer, but I want more than one before I write anything down." },
  { t_sec: 845, speaker: 'clinician', text: "Blends are still an open question. We'll probe them properly next week." },
  { t_sec: 920, speaker: 'clinician', text: "For home this week, same ten cards, but add three blend words at the end." },
  { t_sec: 932, speaker: 'client', text: "How many nights?" },
  { t_sec: 935, speaker: 'clinician', text: "Three nights, same as before. And I want you doing them in the mirror again." },
  { t_sec: 948, speaker: 'client', text: "Okay." },
  { t_sec: 1010, speaker: 'clinician', text: "Before you go. The thing you did at four minutes in, saying it on your own. That was the whole six weeks paying off." },
  { t_sec: 1024, speaker: 'client', text: "Can I tell my mom?" },
  { t_sec: 1027, speaker: 'clinician', text: "Please do. I'll write it up for her too." },
];

export const transcriptText = () => transcript.map(l => l.text).join('\n');

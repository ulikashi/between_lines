// Editorial speaker direction. Paragraph indices match episodes.js. Unmarked paragraphs are narration.
const dialogueDirection = [
  [
    {
      "2": {
        "speaker": "city-nina",
        "emotion": "afraid",
        "delivery": "letter"
      }
    },
    {
      "1": {
        "speaker": "city-mark",
        "emotion": "neutral",
        "delivery": "speech"
      },
      "3": {
        "speaker": "city-mark",
        "emotion": "tender",
        "delivery": "speech"
      }
    },
    {
      "0": {
        "speaker": "city-nina",
        "emotion": "determined",
        "delivery": "message"
      },
      "1": {
        "speaker": "city-mark",
        "emotion": "sad",
        "delivery": "speech"
      },
      "4": {
        "speaker": "city-lera",
        "emotion": "suspicious",
        "delivery": "speech"
      },
      "6": {
        "speaker": "city-mark",
        "emotion": "tender",
        "delivery": "speech"
      }
    },
    {
      "2": {
        "speaker": "city-lera",
        "emotion": "neutral",
        "delivery": "speech"
      },
      "3": {
        "speaker": "city-mark",
        "emotion": "surprised",
        "delivery": "speech"
      },
      "4": {
        "speaker": "city-lera",
        "emotion": "neutral",
        "delivery": "speech"
      },
      "6": {
        "speaker": "city-mark",
        "emotion": "suspicious",
        "delivery": "speech"
      }
    },
    {
      "4": {
        "speaker": "city-mark",
        "emotion": "surprised",
        "delivery": "speech"
      }
    },
    {
      "4": {
        "speaker": "city-mark",
        "emotion": "afraid",
        "delivery": "speech"
      }
    },
    {
      "3": {
        "speaker": "city-mark",
        "emotion": "sad",
        "delivery": "speech"
      },
      "4": {
        "speaker": "city-lera",
        "emotion": "suspicious",
        "delivery": "speech"
      },
      "5": {
        "speaker": "city-mark",
        "emotion": "sad",
        "delivery": "speech"
      },
      "7": {
        "speaker": "city-mark",
        "emotion": "sad",
        "delivery": "speech"
      }
    },
    {
      "1": {
        "speaker": "city-nina",
        "emotion": "afraid",
        "delivery": "recording"
      },
      "4": {
        "speaker": "city-father",
        "emotion": "tender",
        "delivery": "recording"
      },
      "5": {
        "speaker": "city-nina",
        "emotion": "sad",
        "delivery": "recording"
      }
    },
    {
      "2": {
        "speaker": "city-lera",
        "emotion": "determined",
        "delivery": "speech"
      },
      "3": {
        "speaker": "city-mark",
        "emotion": "neutral",
        "delivery": "speech"
      },
      "4": {
        "speaker": "city-lera",
        "emotion": "determined",
        "delivery": "speech"
      },
      "5": {
        "speaker": "city-mark",
        "emotion": "smile",
        "delivery": "speech"
      },
      "8": {
        "speaker": "city-mark",
        "emotion": "tender",
        "delivery": "speech"
      }
    },
    {
      "2": {
        "speaker": "city-mark",
        "emotion": "tender",
        "delivery": "speech"
      },
      "3": {
        "speaker": "city-lera",
        "emotion": "smile",
        "delivery": "speech"
      },
      "4": {
        "speaker": "city-mark",
        "emotion": "smile",
        "delivery": "speech"
      }
    },
    {
      "4": {
        "speaker": "city-lera",
        "emotion": "determined",
        "delivery": "speech"
      },
      "6": {
        "speaker": "city-mark",
        "emotion": "tender",
        "delivery": "speech"
      }
    },
    {
      "4": {
        "speaker": "city-nina",
        "emotion": "afraid",
        "delivery": "phone"
      },
      "6": {
        "speaker": "city-lera",
        "emotion": "afraid",
        "delivery": "speech"
      },
      "7": {
        "speaker": "city-nina",
        "emotion": "neutral",
        "delivery": "phone"
      }
    },
    {
      "0": {
        "speaker": "city-lera",
        "emotion": "suspicious",
        "delivery": "speech"
      },
      "2": {
        "speaker": "city-nina",
        "emotion": "sad",
        "delivery": "phone"
      },
      "4": {
        "speaker": "city-nina",
        "emotion": "afraid",
        "delivery": "phone"
      },
      "6": {
        "speaker": "city-lera",
        "emotion": "afraid",
        "delivery": "speech"
      },
      "7": {
        "speaker": "city-nina",
        "emotion": "afraid",
        "delivery": "phone"
      }
    }
  ],
  [
    {
      "2": {
        "speaker": "summer-sasha",
        "emotion": "surprised",
        "delivery": "speech"
      },
      "6": {
        "speaker": "summer-sasha",
        "emotion": "smile",
        "delivery": "speech"
      }
    },
    {
      "2": {
        "speaker": "summer-sasha",
        "emotion": "neutral",
        "delivery": "speech"
      },
      "3": {
        "speaker": "summer-heroine",
        "emotion": "smile",
        "delivery": "speech"
      },
      "4": {
        "speaker": "summer-sasha",
        "emotion": "smile",
        "delivery": "speech"
      }
    },
    {
      "1": {
        "speaker": "summer-sasha",
        "emotion": "smile",
        "delivery": "letter"
      },
      "2": {
        "speaker": "summer-heroine",
        "emotion": "smile",
        "delivery": "speech"
      },
      "3": {
        "speaker": "summer-sasha",
        "emotion": "smile",
        "delivery": "speech"
      },
      "4": {
        "speaker": "summer-heroine",
        "emotion": "determined",
        "delivery": "letter"
      }
    },
    {
      "2": {
        "speaker": "summer-sasha",
        "emotion": "tender",
        "delivery": "speech"
      },
      "4": {
        "speaker": "summer-heroine",
        "emotion": "neutral",
        "delivery": "speech"
      },
      "6": {
        "speaker": "summer-heroine",
        "emotion": "tender",
        "delivery": "speech"
      },
      "7": {
        "speaker": "summer-sasha",
        "emotion": "smile",
        "delivery": "speech"
      },
      "8": {
        "speaker": "summer-heroine",
        "emotion": "smile",
        "delivery": "speech"
      }
    },
    {
      "3": {
        "speaker": "summer-sasha",
        "emotion": "tender",
        "delivery": "speech"
      }
    },
    {
      "0": {
        "speaker": "summer-friend",
        "emotion": "smile",
        "delivery": "memory"
      },
      "1": {
        "speaker": "summer-friend",
        "emotion": "tender",
        "delivery": "letter"
      }
    },
    {
      "2": {
        "speaker": "summer-sasha",
        "emotion": "smile",
        "delivery": "speech"
      }
    },
    {
      "5": {
        "speaker": "summer-sasha",
        "emotion": "tender",
        "delivery": "speech"
      }
    },
    {
      "4": {
        "speaker": "summer-sasha",
        "emotion": "determined",
        "delivery": "speech"
      },
      "5": {
        "speaker": "summer-heroine",
        "emotion": "sad",
        "delivery": "speech"
      },
      "6": {
        "speaker": "summer-sasha",
        "emotion": "determined",
        "delivery": "speech"
      },
      "7": {
        "speaker": "summer-heroine",
        "emotion": "surprised",
        "delivery": "speech"
      },
      "9": {
        "speaker": "summer-sasha",
        "emotion": "tender",
        "delivery": "speech"
      }
    },
    {
      "2": {
        "speaker": "summer-sasha",
        "emotion": "neutral",
        "delivery": "speech"
      },
      "4": {
        "speaker": "summer-heroine",
        "emotion": "suspicious",
        "delivery": "speech"
      },
      "6": {
        "speaker": "summer-sasha",
        "emotion": "sad",
        "delivery": "speech"
      }
    },
    {
      "0": {
        "speaker": "summer-sasha",
        "emotion": "determined",
        "delivery": "speech"
      },
      "2": {
        "speaker": "summer-heroine",
        "emotion": "sad",
        "delivery": "speech"
      },
      "3": {
        "speaker": "summer-sasha",
        "emotion": "tender",
        "delivery": "speech"
      },
      "6": {
        "speaker": "summer-heroine",
        "emotion": "determined",
        "delivery": "speech"
      }
    },
    {
      "2": {
        "speaker": "summer-friend",
        "emotion": "tender",
        "delivery": "video"
      },
      "3": {
        "speaker": "summer-heroine",
        "emotion": "surprised",
        "delivery": "speech"
      },
      "4": {
        "speaker": "summer-friend",
        "emotion": "tender",
        "delivery": "video"
      },
      "7": {
        "speaker": "summer-sasha",
        "emotion": "tender",
        "delivery": "speech"
      },
      "8": {
        "speaker": "summer-heroine",
        "emotion": "determined",
        "delivery": "speech"
      },
      "9": {
        "speaker": "summer-sasha",
        "emotion": "neutral",
        "delivery": "speech"
      }
    },
    {
      "3": {
        "speaker": "summer-producer",
        "emotion": "determined",
        "delivery": "speech"
      },
      "6": {
        "speaker": "summer-kirill",
        "emotion": "determined",
        "delivery": "message"
      }
    }
  ],
  [
    {},
    {
      "1": {
        "speaker": "moon-ren",
        "emotion": "determined",
        "delivery": "radio"
      },
      "4": {
        "speaker": "moon-ren",
        "emotion": "neutral",
        "delivery": "speech"
      },
      "5": {
        "speaker": "moon-lera",
        "emotion": "surprised",
        "delivery": "speech"
      },
      "6": {
        "speaker": "moon-ren",
        "emotion": "suspicious",
        "delivery": "speech"
      }
    },
    {
      "3": {
        "speaker": "moon-voronova",
        "emotion": "determined",
        "delivery": "speech"
      },
      "6": {
        "speaker": "moon-ren",
        "emotion": "tender",
        "delivery": "speech"
      },
      "8": {
        "speaker": "moon-voronova",
        "emotion": "angry",
        "delivery": "speech"
      }
    },
    {
      "3": {
        "speaker": "moon-ren",
        "emotion": "suspicious",
        "delivery": "speech"
      },
      "5": {
        "speaker": "moon-lera",
        "emotion": "suspicious",
        "delivery": "speech"
      },
      "6": {
        "speaker": "moon-ren",
        "emotion": "determined",
        "delivery": "speech"
      }
    },
    {
      "2": {
        "speaker": "moon-ren",
        "emotion": "neutral",
        "delivery": "speech"
      },
      "3": {
        "speaker": "moon-lera",
        "emotion": "smile",
        "delivery": "speech"
      },
      "4": {
        "speaker": "moon-ren",
        "emotion": "smile",
        "delivery": "speech"
      }
    },
    {
      "1": {
        "speaker": "moon-voronova",
        "emotion": "suspicious",
        "delivery": "speech"
      },
      "3": {
        "speaker": "moon-ren",
        "emotion": "afraid",
        "delivery": "video",
        "costume": "future"
      }
    },
    {
      "0": {
        "speaker": "moon-ren",
        "emotion": "sad",
        "delivery": "speech"
      },
      "2": {
        "speaker": "moon-ren",
        "emotion": "determined",
        "delivery": "speech"
      }
    },
    {},
    {
      "2": {
        "speaker": "moon-voronova",
        "emotion": "determined",
        "delivery": "speech"
      },
      "5": {
        "speaker": "moon-ren",
        "emotion": "tender",
        "delivery": "speech"
      }
    },
    {
      "2": {
        "speaker": "moon-ren",
        "emotion": "tender",
        "delivery": "radio"
      },
      "5": {
        "speaker": "moon-ren",
        "emotion": "determined",
        "delivery": "radio"
      },
      "6": {
        "speaker": "moon-lera",
        "emotion": "smile",
        "delivery": "speech"
      },
      "7": {
        "speaker": "moon-ren",
        "emotion": "smile",
        "delivery": "radio"
      }
    },
    {
      "1": {
        "speaker": "moon-ren",
        "emotion": "afraid",
        "delivery": "radio"
      },
      "2": {
        "speaker": "moon-lera",
        "emotion": "neutral",
        "delivery": "speech"
      },
      "3": {
        "speaker": "moon-ren",
        "emotion": "smile",
        "delivery": "radio"
      },
      "5": {
        "speaker": "moon-lera",
        "emotion": "smile",
        "delivery": "speech"
      },
      "7": {
        "speaker": "moon-ren",
        "emotion": "smile",
        "delivery": "radio"
      },
      "9": {
        "speaker": "moon-lera",
        "emotion": "determined",
        "delivery": "speech"
      },
      "10": {
        "speaker": "moon-ren",
        "emotion": "determined",
        "delivery": "radio"
      }
    },
    {
      "5": {
        "speaker": "moon-lera",
        "emotion": "determined",
        "delivery": "video",
        "costume": "future"
      },
      "8": {
        "speaker": "moon-lera",
        "emotion": "afraid",
        "delivery": "video",
        "costume": "future"
      }
    },
    {
      "1": {
        "speaker": "moon-ren",
        "emotion": "afraid",
        "delivery": "radio"
      },
      "5": {
        "speaker": "moon-lera",
        "emotion": "afraid",
        "delivery": "speech"
      },
      "6": {
        "speaker": "moon-ren",
        "emotion": "surprised",
        "delivery": "radio"
      },
      "9": {
        "speaker": "moon-lera",
        "emotion": "determined",
        "delivery": "silent",
        "costume": "eva"
      }
    }
  ]
];

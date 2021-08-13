"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.animals = exports.colors = exports.generateWorkspaceID = void 0;
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
var randomNumber = require("random-number-csprng");
function generateWorkspaceID() {
  return __awaiter(this, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          return [4 /*yield*/, random(exports.colors)];
        case 1:
          _a = _c.sent() + "-";
          return [4 /*yield*/, random(exports.animals)];
        case 2:
          _b = _a + _c.sent() + "-";
          return [4 /*yield*/, random(characters, 8)];
        case 3:
          return [2 /*return*/, _b + _c.sent()];
      }
    });
  });
}
exports.generateWorkspaceID = generateWorkspaceID;
function random(array, length) {
  if (length === void 0) {
    length = 1;
  }
  return __awaiter(this, void 0, void 0, function () {
    var result, i, _a, _b;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          result = "";
          i = 0;
          _c.label = 1;
        case 1:
          if (!(i < length)) return [3 /*break*/, 4];
          _a = result;
          _b = array;
          return [4 /*yield*/, randomNumber(0, array.length - 1)];
        case 2:
          result = _a + _b[_c.sent()];
          _c.label = 3;
        case 3:
          i++;
          return [3 /*break*/, 1];
        case 4:
          return [2 /*return*/, result];
      }
    });
  });
}
var characters = "abcdefghijklmnopqrstuvwxyz0123456789".split("");
exports.colors = [
  "amaranth",
  "amber",
  "amethyst",
  "apricot",
  "aqua",
  "aquamarine",
  "azure",
  "beige",
  "black",
  "blue",
  "blush",
  "bronze",
  "brown",
  "chocolate",
  "coffee",
  "copper",
  "coral",
  "crimson",
  "cyan",
  "emerald",
  "fuchsia",
  "gold",
  "gray",
  "green",
  "harlequin",
  "indigo",
  "ivory",
  "jade",
  "kumquat",
  "lavender",
  "lime",
  "magenta",
  "maroon",
  "moccasin",
  "olive",
  "orange",
  "peach",
  "pink",
  "plum",
  "purple",
  "red",
  "rose",
  "salmon",
  "sapphire",
  "scarlet",
  "silver",
  "tan",
  "teal",
  "tomato",
  "turquoise",
  "violet",
  "white",
  "yellow",
];
exports.animals = [
  "canidae",
  "felidae",
  "cat",
  "cattle",
  "dog",
  "donkey",
  "goat",
  "horse",
  "pig",
  "rabbit",
  "aardvark",
  "aardwolf",
  "albatross",
  "alligator",
  "alpaca",
  "amphibian",
  "anaconda",
  "angelfish",
  "anglerfish",
  "ant",
  "anteater",
  "antelope",
  "antlion",
  "ape",
  "aphid",
  "armadillo",
  "asp",
  "baboon",
  "badger",
  "bandicoot",
  "barnacle",
  "barracuda",
  "basilisk",
  "bass",
  "bat",
  "bear",
  "beaver",
  "bedbug",
  "bee",
  "beetle",
  "bird",
  "bison",
  "blackbird",
  "boa",
  "boar",
  "bobcat",
  "bobolink",
  "bonobo",
  "booby",
  "bovid",
  "bug",
  "butterfly",
  "buzzard",
  "camel",
  "canid",
  "capybara",
  "cardinal",
  "caribou",
  "carp",
  "cat",
  "catshark",
  "caterpillar",
  "catfish",
  "cattle",
  "centipede",
  "cephalopod",
  "chameleon",
  "cheetah",
  "chickadee",
  "chicken",
  "chimpanzee",
  "chinchilla",
  "chipmunk",
  "clam",
  "clownfish",
  "cobra",
  "cockroach",
  "cod",
  "condor",
  "constrictor",
  "coral",
  "cougar",
  "cow",
  "coyote",
  "crab",
  "crane",
  "crawdad",
  "crayfish",
  "cricket",
  "crocodile",
  "crow",
  "cuckoo",
  "cicada",
  "damselfly",
  "deer",
  "dingo",
  "dinosaur",
  "dodo",
  "dog",
  "dolphin",
  "donkey",
  "dormouse",
  "dove",
  "dragonfly",
  "dragon",
  "duck",
  "eagle",
  "earthworm",
  "earwig",
  "echidna",
  "eel",
  "egret",
  "elephant",
  "elk",
  "emu",
  "ermine",
  "falcon",
  "ferret",
  "finch",
  "firefly",
  "fish",
  "flamingo",
  "flea",
  "fly",
  "flyingfish",
  "fowl",
  "fox",
  "frog",
  "gamefowl",
  "galliform",
  "gazelle",
  "gecko",
  "gerbil",
  "gibbon",
  "giraffe",
  "goat",
  "goldfish",
  "goose",
  "gopher",
  "gorilla",
  "grasshopper",
  "grouse",
  "guan",
  "guanaco",
  "guineafowl",
  "gull",
  "guppy",
  "haddock",
  "halibut",
  "hamster",
  "hare",
  "harrier",
  "hawk",
  "hedgehog",
  "heron",
  "herring",
  "hippopotamus",
  "hookworm",
  "hornet",
  "horse",
  "hoverfly",
  "hummingbird",
  "hyena",
  "iguana",
  "impala",
  "jackal",
  "jaguar",
  "jay",
  "jellyfish",
  "junglefowl",
  "kangaroo",
  "kingfisher",
  "kite",
  "kiwi",
  "koala",
  "koi",
  "krill",
  "ladybug",
  "lamprey",
  "landfowl",
  "lark",
  "leech",
  "lemming",
  "lemur",
  "leopard",
  "leopon",
  "limpet",
  "lion",
  "lizard",
  "llama",
  "lobster",
  "locust",
  "loon",
  "louse",
  "lungfish",
  "lynx",
  "macaw",
  "mackerel",
  "magpie",
  "mammal",
  "manatee",
  "mandrill",
  "marlin",
  "marmoset",
  "marmot",
  "marsupial",
  "marten",
  "mastodon",
  "meadowlark",
  "meerkat",
  "mink",
  "minnow",
  "mite",
  "mockingbird",
  "mole",
  "mollusk",
  "mongoose",
  "monkey",
  "moose",
  "mosquito",
  "moth",
  "mouse",
  "mule",
  "muskox",
  "narwhal",
  "newt",
  "nightingale",
  "ocelot",
  "octopus",
  "opossum",
  "orangutan",
  "orca",
  "ostrich",
  "otter",
  "owl",
  "ox",
  "panda",
  "panther",
  "parakeet",
  "parrot",
  "parrotfish",
  "partridge",
  "peacock",
  "peafowl",
  "pelican",
  "penguin",
  "perch",
  "pheasant",
  "pig",
  "pigeon",
  "pike",
  "pinniped",
  "piranha",
  "planarian",
  "platypus",
  "pony",
  "porcupine",
  "porpoise",
  "possum",
  "prawn",
  "primate",
  "ptarmigan",
  "puffin",
  "puma",
  "python",
  "quail",
  "quelea",
  "quokka",
  "rabbit",
  "raccoon",
  "rat",
  "rattlesnake",
  "raven",
  "reindeer",
  "reptile",
  "rhinoceros",
  "roadrunner",
  "rodent",
  "rook",
  "rooster",
  "roundworm",
  "sailfish",
  "salamander",
  "salmon",
  "sawfish",
  "scallop",
  "scorpion",
  "seahorse",
  "shark",
  "sheep",
  "shrew",
  "shrimp",
  "silkworm",
  "silverfish",
  "skink",
  "skunk",
  "sloth",
  "slug",
  "smelt",
  "snail",
  "snake",
  "snipe",
  "sole",
  "sparrow",
  "spider",
  "spoonbill",
  "squid",
  "squirrel",
  "starfish",
  "stingray",
  "stoat",
  "stork",
  "sturgeon",
  "swallow",
  "swan",
  "swift",
  "swordfish",
  "swordtail",
  "tahr",
  "takin",
  "tapir",
  "tarantula",
  "tarsier",
  "termite",
  "tern",
  "thrush",
  "tick",
  "tiger",
  "tiglon",
  "toad",
  "tortoise",
  "toucan",
  "trout",
  "tuna",
  "turkey",
  "turtle",
  "tyrannosaurus",
  "urial",
  "vicuna",
  "viper",
  "vole",
  "vulture",
  "wallaby",
  "walrus",
  "wasp",
  "warbler",
  "weasel",
  "whale",
  "whippet",
  "whitefish",
  "wildcat",
  "wildebeest",
  "wildfowl",
  "wolf",
  "wolverine",
  "wombat",
  "woodpecker",
  "worm",
  "wren",
  "xerinae",
  "yak",
  "zebra",
  "alpaca",
  "cat",
  "cattle",
  "chicken",
  "dog",
  "donkey",
  "ferret",
  "gayal",
  "goldfish",
  "guppy",
  "horse",
  "koi",
  "llama",
  "sheep",
  "yak",
  "unicorn",
];
//# sourceMappingURL=generate-workspace-id.js.map

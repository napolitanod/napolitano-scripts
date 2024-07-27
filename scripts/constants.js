export async function getMonsterType(type, cr = 999){
    const pack = game.packs.get("napolitano-compendium.napolitano-monsters");
    const data = await pack.getDocuments(); //await pack.getData()
    const monsters = data.filter(a => a.system.details?.type?.value === type && a.system.details?.cr <= cr)
    return {list: monsters, options: monsters.map(c => [c.id, c.name + ' (CR ' + c.system.details?.cr + ')']).sort(([,a],[,b]) => a.localeCompare(b))}
}

export function setConfigs(){
    DAMAGERESISTANTTYPES.push(...Object.entries(game.dnd5e?.config.damageTypes).map(k=> [k[0],k[1].label]))
    DAMAGETYPES.push(...Object.entries(game.dnd5e?.config.damageTypes).map(k=> [k[0],k[1].label]))
    SKILLS.push(...Object.entries(game.dnd5e?.config.skills).map(k=> [k[0],k[1].label]))
    SKILLSKEYS.push(...Object.keys(game.dnd5e?.config.skills))
}
export const DAMAGERESISTANTTYPES = []
export const DAMAGETYPES = []
export const SKILLS = []
export const SKILLSKEYS = []
export const HOOKIDS = {}

export const AURATAGS = ['NAP-MOV-OUT','NAP-MOV-ANY-0', 'NAP-MOV-ANY-10', 'NAP-MOV-ANY-15','NAP-EOT-0', 'NAP-EOT-5', 'NAP-SOT-0', 'NAP-SOT-5', 'NAP-SOT-10', 'NAP-SOT-15'];

export const CONSUMINGRESOURCETYPES = ['consumable', 'weapon', 'feat']

export const CONTESTS = {
    climbUpon: {name: 'Climb Upon Larger Creature', source: {options: ['acr', 'ath']},target: {options: ['acr']}},
    dislodgeFrom: {name: 'Dislodge Creature from Self', source: {options: ['ath']},target: {options: ['acr', 'ath']}},
    genericContest: {name: 'Contest', source: {options: SKILLSKEYS},target: {options: SKILLSKEYS}},
    grapple: {name: 'Grapple', source: {options: ['ath']},target: {options: ['acr', 'ath']}},
    overrun: {name: 'Overrun', source: {options: ['ath']},target: {options: ['ath']}},
    shoveBack: {name: 'Shove Away', source: {options: ['ath']},target: {options: ['acr', 'ath']}},
    shoveToSide: {name: 'Shove Aside', source: {options: ['ath'], dice:{disadvantage: true}},target: {options: ['acr', 'ath']}},
    shoveProne: {name: 'Shove Prone', source: {options: ['ath']},target: {options: ['acr', 'ath']}},
    tumble: {name: 'Tumble', source: {options: ['acr']},target: {options: ['acr']}}
}

export const HUDOPTIONS = Object.assign({disarm: {name: 'Disarm'}, dodge: {name: 'Dodge'}, helpAttack: {name: `Help (Feint/Distract)`}, helpCheck: {name: `Help (Task)`}, ready: {name: 'Ready'}, search: {name: 'Search'}, hide: {name: 'Hide'}}, CONTESTS)

export const DRAGONVESSELSLUMBERING = {
    ale: "Ale",
    oliveoil: "Olive Oil",
    healing: "Potion of Healing",
    climbing: "Potion of Climbing"
}

export const DRAGONVESSELSTIRRING = Object.assign({
    mead: "Mead",
    greater: "Potion of Healing (Greater)",
    breath: "Potion of Fire Breath"
}, DRAGONVESSELSLUMBERING)

export const EFFECTCONDITIONS = ['Blind', 'Blinded', 'Darkvision', 'Goggles of Night', 'True Seeing', 'Tether Sense']//,'Invisible','Charmed', 'Concentrating', 'Deafened', 'Poisoned','Frightened','Unconscious']

export const EVIL = ['Chaotic Evil', 'Neutral Evil', 'Evil', 'Lawful Evil']

export const EXPERIMENTALELIXIRS = {
    "0": "None",
    "4": "Experimental Elixir: Boldness",
    "5": "Experimental Elixir: Flight",
    "1": "Experimental Elixir: Healing",
    "3": "Experimental Elixir: Resilience",
    "2": "Experimental Elixir: Swiftness",
    "6": "Experimental Elixir: Transformation"
};

export const FAMILIARS =['Bat', 'Cat', 'Crab', 'Frog', 'Hawk', 'Lizard', 'Octopus', 'Owl', 'Poisonous Snake', 'Quipper', 'Rat', 'Raven', 'Sea Horse', 'Spider', 'Weasel'];

export const FAMILIARTYPES = ['Fey', 'Fiend', 'Celestial'];

export const INCAPACITATEDCONDITIONS = ['Incapacitated', 'Dead', 'Unconscious'];

export const MULTIPLEDAMAGEROLLSPELLS = ['Eldritch Blast','Scorching Ray']

export const SIZES = {
    grg: 5,
    huge: 4,
    lg: 3,
    med: 2,
    sm: 1,
    tiny: 0
}

export const TEMPLATEMODIFICATION = [
    {name: 'Countercharm', foe: false, friendly: true, removeSelf: false},
    {name: 'Channel Divinity: Radiance of the Dawn', foe: true, friendly: false, removeSelf: true},
    {name: 'Frightful Cackle', foe: true, friendly: false, removeSelf: true},
    {name: 'Mass Healing Word', foe: false, friendly: true, removeSelf: false},
    {name: 'Necrotic Shroud', foe: true, friendly: true, removeSelf: true},
    {name: 'Protector', foe: false, friendly: true, removeSelf: false},
    {name: 'Sleep', foe: true, friendly: false, removeSelf: true},
    {name: 'Wither and Bloom', foe: true, friendly: false, removeSelf: true},
    {name: 'Word of Radiance', foe: true, friendly: false, removeSelf: true}    
]

export const PCS = {
    chenju: 'Chenju (Narbirt)', 
    wubbub: 'Wubbub'
}

export const SPELLSLOTS = {
    "spell0": 0,
    "spell1": 1,
    "spell2": 2,
    "spell3": 3,
    "spell4": 4,
    "spell5": 5,
    "spell6": 6,
    "spell7": 7,
    "spell8": 8,
    "spell9": 9
 };

export const SPELLS = {
    "1": "1st level spell",
    "2": "2nd level spell",
    "3": "3rd level spell",
    "4": "4th level spell",
    "5": "5th level spell",
    "6": "6th level spell",
    "7": "7th level spell",
    "8": "8th level spell",
    "9": "9th level spell"
 };

export const TOOLS = {
    "0": "None",
    "1": "Alchemist's Supplies",
    "2": "Brewer's Supplies",
    "3": "Calligrapher's Supplies",
    "4": "Carpenter's Tools",
    "5": "Cartographer's Tools",
    "6": "Cobbler's Tools",
    "7": "Cook's Utensils",
    "8": "Glassblower's Tools",
    "9": "Jeweler's Tools",
    "10": "Leatherworker's Tools",
    "11": "Mason's Tools",
    "12": "Painter's Supplies",
    "13": "Potter's Tools",
    "14": "Smith's Tools",
    "15": "Tinker's Tools",
    "16": "Weaver's Tools",
    "17": "Woodcarver's Tools"

};

export const NAPOLITANOCONFIG = {
    accursedSpecter: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Smoke/SmokePuffRing02_01_Dark_Black_400x400.webm', scale: 1.5}},
        sounds: {pre: {file: 'modules/soundfxlibrary/Combat/Single/Spell%20Impact/spell-impact-2.mp3'}},
        killIn: {days: 1},
        name: "Specter"
    },
    ancestralProtectors: {
        name: "Ancestral Protectors"
    },
    animateDead: {
        name: "Animate Dead",
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Smoke/SmokePuffRing02_01_Dark_Black_400x400.webm', scale: 1.5}},
        sounds: {pre: {file:'modules/soundfxlibrary/Combat/Single/Spell%20Impact/spell-impact-2.mp3'}},
        options: [`Bones`, 'Corpse'],
        prompt: `Are you animating Bones or a Corpse?`
    },
    arcaneFirearm: {
        name: "Arcane Firearm"
    },
    armorOfAgathys: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Ice/SnowflakeBurst_01_Regular_TealYellow_Loop_600x600.webm', fadeOut: 500, scale: 0.5, wait: 100}},
        name: "Armor of Agathys"
    },
    assassinate: {
        name: "Assassinate"
    },
    auraOfVitality: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Healing/HealingAbility_02_Regular_PurplePink_Burst_600x600.webm', scale: 1}},
        name: "Aura of Vitality",
    },
    bagOfTricksGray: {
        table: {
            compendium: "Napolitano Roll Table",
            compendiumBackup: "DDB Roll Table",
            name: "Gray Bag of Tricks"
        },
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Particles/ParticlesOutward01_02_Regular_Red_400x400.webm', scale: 1}},
        name: "Gray Bag of Tricks"
    },
    bagOfTricksTan: {
        table: {
            compendium: "Napolitano Roll Table",
            compendiumBackup: "DDB Roll Table",
            name: "Tan Bag of Tricks"
        },
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Particles/ParticlesOutward01_02_Regular_Orange_400x400.webm', scale: 1}},
        name: "Tan Bag of Tricks"
    },
    bigbysHand: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Particles/ParticlesInward01_04_Regular_White_400x400.webm', scale: 1.5}},
        sounds: {pre: {file: 'modules/SoundBoard-BlitzFreePack/bundledAudio/Cult%20Chant/ancient-land-muffled-chorus-chant.ogg'}},
        killIn: {minutes: 1},
        name: "Bigby's Hand"
    },
    blessedHealer: {
        effects: {pre: {file: 'modules/jb2a_patreon/Library/Generic/Healing/HealingAbility_01_Yellow02_200x200.webm', scale: 1, wait: 100}},
        name: "Blessed Healer"
    },
    blessedStrikes: {
        effects: {pre: {file: 'modules/jb2a_patreon/Library/Generic/Explosion/Explosion_03_Regular_GreenOrange_400x400.webm', scale: 1, wait: 100}},
        name: "Blessed Strikes",
        prompt: "Use blessed strikes damage?"
    },
    blight: {
        effects: {
            pre: {
                file: 'modules/jb2a_patreon/Library/Generic/Nature/SwirlingLeaves01_01_Regular_GreenOrange_30ft_1600x400.webm', 
                stretch: true
            }
        },
        sounds: {
            pre: {
                file: 'modules/soundfxlibrary/Nature/Single/Tree%20Falling/tree-falling-1.mp3'
            }
        },
        name: "Blight"
    },
    boomingBlade: {
        name: "Booming Blade",
        effects: {
            pre: {
                file: 'modules/jb2a_patreon/Library/1st_Level/Thunderwave/Thunderwave_01_Bright_Green_Center_600x600.webm'
            }
        },
        sounds: {
            pre: {
                file: 'modules/SoundBoard-BlitzFreePack/bundledAudio/Misc/Thunder-Crash/thunder_mountainous_big_crack_02.wav'
            }
        },
    },
    brazierOfCommandingFireElementals: {
        effects:{
            pre: {file: 'modules/jb2a_patreon/Library/Generic/Fire/Eruption_01_Regular_Orange_600x600.webm', scale: 1}
        },
        sounds: {
            pre: {file: 'modules/SoundBoard-BlitzFreePack/bundledAudio/Magic/fire-blast-binaural/Designed%20Fire-04.ogg', volume: 0.85}
        },
        name: "Fire Elemental"
    },
    channelDivinityInvokeDuplicity: {
        killIn: {minutes: 1},
        name: "Illusion"
    },
    chardalyn: {
        effects: {pre: {file: 'modules/jb2a_patreon/Library/Generic/Conditions/Dizzy_Stars/DizzyStars_01_Black_400x400.webm', scale: 1}},
        saying: {
            macro: "Chardalyn Madness"
        },
        sounds: {pre: {file: 'modules/SoundBoard-BlitzFreePack/bundledAudio/Cult%20Chant/come-demon-mandymod-chant.ogg'}}
    },
    chromaticOrb: {
        name: "Chromatic Orb",
        options: [`acid`, `cold`, `fire`, `lightning`, `poison`, `thunder`]
    },
    cloakOfFlies: {
        effects: {pre: {file: 'modules/jb2a_patreon/Library/Generic/Fireflies/Fireflies_01_Purple_Many02_400x400.webm', scale: 1}},
        name: "Cloak of Flies"
    },
    cloudOfDaggers: {
        killIn: {minutes: 1},
        name: "Cloud of Daggers"
    },
    colorSpray: {
        effects: {pre: {file: 'modules/jb2a_patreon/Library/Generic/Liquid/WaterSplashLoop_01_01_Regular_Purple_600x600.webm', scale: 1}},
        name: "Color Spray"
    },
    colossusSlayer: {
        name:'Colossus Slayer'
    },
    confusingGaze: {
        effects: {pre: {file: 'modules/jb2a_patreon/Library/Generic/Conditions/Dizzy_Stars/DizzyStars_01_Red_400x400.webm', scale: 1}},
        name: "Confusing Gaze",
        table: {
            compendium: "Napolitano Roll Table",
            name: "Confusing Gaze"
        }
    },
    counterspell: {
        name: "Counterspell"
    },
    createBonfire: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Smoke/SmokePuffRing02_01_Regular_White_400x400.webm', scale: 1}},
        sounds: {pre: {file: 'modules/soundfxlibrary/Combat/Single/Spell%20Whoosh/spell-whoosh-2.mp3'}},
        killIn: {minutes: 1},
        name: "Bonfire"
    },
    createEldritchCannon: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Particles/ParticlesOutward02_03_Regular_White_400x400.webm', scale: 1.5}},
        sounds: {pre: {file: 'modules/SoundBoard-BlitzFreePack/bundledAudio/Ambience/light-hammering.ogg'}},
        options: [`Flamethrower`, `Force Ballista`,`Protector`],
        killIn: {minutes: 60},
        name: "Eldritch Cannon"
    },
    cuttingWords: {
        name: "Cutting Words"
    },
    darkness: {
        killIn: {minutes: 10},
        name: "Darkness",
        wallData: {
            move: 0,
            sound: 0
        }
    },
    dawn: {
        killIn: {minutes: 1},
        name: "Dawn"
    },
    daylight: {
        killIn: {minutes: 60},
        name: "Daylight"
    },
    deathWard: {
        name: "Death Ward"
    },
    disarmingAttack: {
        name: "Disarming Attack"
    },
    divineSmite: {
        name: "Divine Smite"
    },
    dragonsBreath: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Magic_Signs/Runes/TransmutationRuneLoop_01_Regular_Purple_400x400.webm', scale: 1}},
        name: "Dragon's Breath",
        options: [`acid`, `cold`, `fire`, `lightning`, `poison`]
    },
    dragonVessel: {
        name: "Dragon Vessel",
        item: {
            compendium: "Napolitano Items",
            compendiumBackup: "DDB Items"
        }
    },
    dustDevil: {
        aura: {
          name: "Wind and debris damage"  
        },
        effects:{pre: {file: 'modules/jb2a_patreon/Library/7th_Level/Whirlwind/Whirlwind_01_BlueGrey_01_400x400.webm', scale: 1}},
        sounds: {pre: {file: 'modules/SoundBoard-BlitzFreePack/bundledAudio/Magic/airy-movement.wav'}},
        killIn: {minutes: 1},
        name: "Dust Devil"
    },
    echoingMind: {
        name: "Echoing Mind",
        table: {
            compendium: "Napolitano Roll Table",
            compendiumBackup: "DDB Roll Table",
            name: "Echoing Mind"
        }
    },
    echoingMindLvl4: {
        name: "Echoing Mind Level 4",
        table: {
            compendium: "Napolitano Roll Table",
            compendiumBackup: "DDB Roll Table",
            name: "Echoing Mind Level 4"
        }
    },
    elementalGem: {
        redCorundum: {
            effects:{
                intro: {file: 'modules/jb2a_patreon/Library/Generic/Impact/Impact_03_Regular_Orange_400x400.webm', scale: 1},
                pre: {file: 'modules/jb2a_patreon/Library/Generic/Fire/Eruption_01_Regular_Orange_600x600.webm', scale: 1}
            },
            sounds: {
                intro: {file: 'modules/SoundBoard-BlitzFreePack/bundledAudio/Impacts/pottery-smash.wav'},
                pre: {file: 'modules/SoundBoard-BlitzFreePack/bundledAudio/Magic/fire-blast-binaural/Designed%20Fire-04.ogg', volume: 0.85}
            },
            killIn: {minutes: 60},
            name: "Fire Elemental"
        }
    },
    experimentalElixer: {
        name: "Experimenal Elixer",
        item: {
            compendium: "Napolitano Items",
            compendiumBackup: "DDB Items"
        },
        updates: {
            "flags": {
                "ddbimporter": {"ignoreItemImport": true}, 
                "napolitano-scripts":{'experimentalElixir': true}
            }
        }
    },
    falseLife: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Magic_Signs/Runes/NecromancyRuneLoop_01_Regular_Blue_400x400.webm', scale: 1}},
        name: "False Life"
    },
    fangedBite: {
        effects: {pre: {file: 'modules/jb2a_patreon/Library/Generic/Creature/Bite_01_Regular_Red_400x400.webm', scale: 1}},
        sounds: {pre: {file: 'modules/SoundBoard-BlitzFreePack/bundledAudio/Enemies/Zombie_Eating.mp3'}}
    },
    featherOfDiatrymaSummoning: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Energy/SwirlingSparkles_01_Regular_GreenOrange_400x400.webm', scale: 1.5}},
        name: "Diatryma",
        killIn: {hours: 6}
    },
    figurineOfWonderousPowerLions: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Explosion/Explosion_05_Dark_Blue_400x400.webm', scale: 1.5}},
        sounds: {pre: {file: 's3/audio/samples/Roar/roar_3.mp3'}},
        name: "Lion",
        killIn: {hours: 1}
    },
    figurineOfWonderousPowerObsidianSteed: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Smoke/SmokePuffRing02_01_Dark_Black_400x400.webm', scale: 1.5}},
        sounds: {pre: {file: 'modules/soundfxlibrary/Combat/Single/Spell%20Impact/spell-impact-2.mp3'}},
        killIn: {days: 1},
        name: "Nightmare"
    },
    fireShield: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Explosion/Explosion_05_Dark_Orange_400x400.webm', fadeOut: 500, scale: 0.5, wait: 100}},
        name: "Fire Shield"
    },
    flamingSphere: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Smoke/SmokePuffRing02_01_Regular_White_400x400.webm', scale: 1.5}},
        sounds: {pre: {file: 'modules/soundfxlibrary/Combat/Single/Spell%20Whoosh/spell-whoosh-2.mp3'}},
        killIn: {minutes: 1},
        name: "Flaming Sphere"
    },
    fogCloud:{
        killIn: {minutes: 60},
        name: "Fog Cloud",
        wallData: {
            move: 0,
            sound: 0
        }
    },
    formOfDread: {
        effects: {pre: {file: 'modules/jb2a_patreon/Library/Generic/Eyes/Eyes_Many01_02_Dark_Red_600x600.webm', scale: 1}},
        name: "Form of Dread",
        prompt: "Use Form of Dread to frighten?"
    },
    gazerEyeRays: {
        table: {
            compendium: "Napolitano Roll Table",
            compendiumBackup: "DDB Roll Table",
            name: "Gazer Eye Rays"
        },
        name: "Eye Rays"
    },
    geniesWrath: {
        effects: {pre: {file: 'modules/jb2a_patreon/Library/Generic/Explosion/Explosion_03_Regular_PurplePink_400x400.webm', scale: 1, wait: 100}},
        name: "Genie's Wrath",
        prompt: "Use Genie's Wrath damage?",
        availableItems: ["Genie's Vessel: Genie's Wrath (Dao)", "Genie's Vessel: Genie's Wrath (Djinni)", "Genie's Vessel: Genie's Wrath (Efreeti)", "Genie's Vessel: Genie's Wrath (Marid)"]
    },
    greenFlameBlade: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Impact/Impact_04_Regular_Green_400x400.webm', scale: 1}},
        name: "Green-Flame Blade"
    },
    guardianOfFaith: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Cantrip/Dancing_Lights/DancingLights_01_BlueYellow_200x200.webm', scale: 1}},
        killIn: {hours: 8},
        name: "Guardian of Faith"
    },
    goodberry: {
        name: "Goodberry",
        item: {
            compendium: "Napolitano Items",
            compendiumBackup: "DDB Items",
            name: "Goodberries"
        },
        updates: {
            "flags": {
                "ddbimporter": {"ignoreItemImport": true}
            }
        }
    },
    grease: {
        name: "Grease",
        killIn: {minutes: 1}
    },
    guidedStrike: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Cantrip/Sacred_Flame/SacredFlameSource_01_Regular_Blue_400x400.webm', scale: 1}}
    },
    haloOfSpores: {
        name: "Halo of Spores",
        prompt: "Use your halo of spores reaction?",
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Particles/ParticlesSwirl01_01_Regular_GreenYellow_400x400.webm', scale: 1}}
    },
    healingSpirit: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/3rd_Level/Spirit_Guardians/SpiritGuardiansParticles_01_Light_PinkPurple_600x600.webm', scale: 1}},
        killIn: {minutes: 1},
        name: "Healing Spirit"
    },
    heatedBody: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Explosion/Explosion_05_Dark_Orange_400x400.webm', fadeOut: 500, scale: 0.5, wait: 100}},
        name: "Heated Body"
    },
    hex: {
        effects: {pre: {file: "modules/jb2a_patreon/Library/Generic/Magic_Signs/Runes/NecromancyRuneLoop_01_Regular_Green_400x400.webm"}},
        name: "Hex"
    },
    hexbladesCurse: {
        effects: {pre: {file: "modules/jb2a_patreon/Library/Generic/Magic_Signs/Runes/NecromancyRuneLoop_01_Regular_Purple_400x400.webm"}},
        name: "Hexblade's Curse"
    },
    hungryJaws: {
        effects: {pre: {file: 'modules/jb2a_patreon/Library/Generic/Creature/Bite_01_Regular_Green_400x400.webm', scale: 1}},
        sounds: {pre: {file: 'modules/SoundBoard-BlitzFreePack/bundledAudio/Enemies/Zombie_Eating.mp3'}}
    },
    iceKnife:{ 
        name: "Ice Knife Explosion"
    },
    infuseItem: {
        action: {
            cancel: 'chooses to not continue with infusing an item.'
        },
        item: {
            compendium: "Napolitano Items",
            compendiumBackup: "DDB Items"
        },
        updates: {
            "flags": {
                "ddbimporter": {"ignoreItemImport": true}, 
                "napolitano-scripts":{'infusion': true}
            }
        }
    },
    infuseItemHomunculus: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_01_Dark_Purple_400x400.webm', scale: 1.5}},
        sounds: {pre: {file: 'modules/SoundBoard-BlitzFreePack/bundledAudio/People/amused-evil-laugh.mp3'}},
        name: "Homunculus"
    },
    intrusiveEchoes: {
        name: "Intrusive Echoes",
        table: {
            compendium: "Napolitano Roll Table",
            compendiumBackup: "DDB Roll Table",
            name: "Intrusive Echoes"
        }
    },
    layOnHands: {
        name: "Lay on Hands"
    },
    lesserRestoration: {
        effects: {pre: {file: 'modules/jb2a_patreon/Library/Generic/Healing/HealingAbility_02_Regular_TealYellow_Burst_600x600.webm', scale: 1}},
        name: 'Lesser Restoration',
        options: ['Blinded', 'Deafened', 'Paralyzed', 'Poisoned']
    },
    mageHand: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_01_Regular_Blue_400x400.webm', scale: 1.25}},
        killIn: {minutes: 1},
        name: "Mage Hand"
    },
    magicalTinkering: {
        name: "Magical Tinkering",
        options: [`Light: External Object`, 'Light: On Self', 'Light: On Target', 'Other: External Object', 'Other'],
    },
    manifestEcho: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_02_Regular_Grey_400x400.webm', scale: 1.25}},
        name: "Echo Knight"
    },
    maximiliansEarthenGrasp: {
        killIn: {minutes: 1},
        name: "Maximilian's Earthen Grasp"
    },
    melfsMinuteMeteors : {
        item: {
            compendium: "Napolitano Items",
            compendiumBackup: "DDB Items"
        },
        name: "Melf's Minute Meteors Meteor"
    },
    mirrorImage: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Impact/Impact_04_Dark_Purple_400x400.webm', scale: 1, fadeIn: 500}},
        name: "Mirror Image"
    },
    moonbeam: {
        killIn: {minutes: 1},
        name: "Moonbeam"
    },
    motivationalSpeech: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Template/Circle/OutPulse/OutPulse_02_Regular_GreenOrange_Burst_600x600.webm', fadeOut: 500, scale: 0.5, wait: 100}},
        name: "Motivational Speech"
    },
    nathairsMischief: {
        name: "Nathair's Mischief",
        table: {
            compendium: "Napolitano Roll Table",
            compendiumBackup: "DDB Roll Table",
            name: "Nathair's Mischief: Mischievous Surge"
        }
    },
    nathairsMischiefHook: {
        name: "Nathair's Mischief"
    },
    necroticShroud: {
        effects: {pre: {file: 'modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_01_Dark_Black_400x400.webm', scale: 1}},
        name: "Necrotic Shroud",
        prompt: "Use necrotic shroud damage?"
    },
    overrun: {
        name: "Overrun"
    },
    packTactics: {
        name: "Pack Tactics"
    },
    passWithoutTrace: {
        name: "Pass without Trace",
        effects: {pre: {file: 'modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_03_Regular_Grey_400x400.webm', scale: 1}}
    },
    polymorph: {
        name: "Polymorpth",
        prompt: "Choose a beast to polymorph the target into."
    },
    potentSpellcasting: {
        effects: {pre: {file: 'modules/jb2a_patreon/Library/Generic/Explosion/Explosion_03_Regular_GreenOrange_400x400.webm', scale: 1, wait: 100}},
        name: "Potent Spellcasting"
    },
    powerSurge: {
        name: "Power Surge"
    },
    produceFlame: {
        name: "Produce Flame"
    },
    radiantSoul: {
        name: "Radiant Soul",
        prompt: "Add Radiant Soul Damage?",
        effects: {pre: {file: 'modules/jb2a_patreon/Library/Generic/Energy/SwirlingSparkles_01_Regular_Yellow_400x400.webm', scale: 1, wait: 100}}
    },
    rayOfEnfeeblement: {
        name: "Ray of Enfeeblement"
    },
    relentless: {
        name: "Relentless"
    },
    relentlessEndurance: {
        name: "Relentless Endurance"
    },
    shadowGaze: {
        effects: {pre: {file: 'modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_01_Dark_Black_400x400.webm', scale: 1}},
        name: "Shadow Gaze",
        table: {
            compendium: "Napolitano Roll Table",
            name: "Shadow Gaze"
        }
    },
    shadowTattoo: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Smoke/SmokePuffRing02_01_Dark_Black_400x400.webm', scale: 1.5}},
        sounds: {pre: {file:'modules/soundfxlibrary/Combat/Single/Spell%20Impact/spell-impact-2.mp3'}},
        name: "Shadow Tattoo"
    },
    shield: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/1st_Level/Shield/Shield_01_Regular_Blue_Complete_400x400.webm', scale: 1.5}},
        name: "Shield"
    },
    shoveBack: {
        name: "Shove Away"
    },
    shoveProne: {
        name: "Shove Prone"
    },
    shoveBack: {
        name: "Shove Aside"
    },
    silveryBarbs: {
        name: "Silvery Barbs"
    },
    sleep: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/1st_Level/Sleep/Cloud01_02_Regular_Pink_400x400.webm', scale: 1}},
        name: "Sleep"
    },
    sneakAttack: {
        effects: {pre: {file: 'modules/jb2a_patreon/Library/1st_Level/Sneak_Attack/Sneak_Attack_Regular_Blue_300x300.webm', scale: 1, wait: 100}},
        name: "Sneak Attack",
        prompt: "Use Sneak Attack?"
    },
    spikeGrowth: {
        name: "Spike Growth",
        killIn: {minutes: 10}
    },
    spiritGuardians: {
        effects: {pre: {file: 'modules/jb2a_patreon/Library/3rd_Level/Spirit_Guardians/SpiritGuardiansParticles_01_Light_Blue_600x600.webm', scale: 0.5}},
        name: "Spirit Guardians"
    },
    spiritualWeapon: {
        name: "Spiritual Weapon",
        killIn: {minutes: 1}
    },
    staffOfThePython: {
        name: "Giant Constrictor Snake"
    },
    stormSphere: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Lightning/StaticElectricity_03_Regular_Green02_400x400.webm', scale: 1}},
        sounds: {pre: {file:'modules/soundfxlibrary/Nature/Single/Thunder/thunder-3.mp3'}},
        killIn: {minutes: 1},
        name: "Storm Sphere"
    },
    summonAberration: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Smoke/SmokePuffRing02_01_Dark_Black_400x400.webm', scale: 1.5}},
        sounds: {pre: {file:'modules/soundfxlibrary/Combat/Single/Spell%20Impact/spell-impact-2.mp3'}},
        killIn: {minutes: 60},
        name: "Aberrant Spirit"
    },
    summonFey: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Smoke/SmokeRing_01_Regular_White_800x800.webm', scale: 1}},
        sounds: {pre: {file:'modules/SoundBoard-BlitzFreePack/bundledAudio/Magic/airy-movement.wav'}},
        options: [`Mirthful`, `Fuming`,`Tricksy`],
        killIn: {minutes: 60},
        name: "Fey Spirit"
    },
    summonBlight: {
        table: {
            compendium: "Napolitano Roll Table",
            name: "Summon Blight"
        },
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Nature/SwirlingLeavesComplete01_01_Regular_GreenOrange_400x400.webm', scale: 1}},
        sounds: {pre: {file:'modules/SoundBoard-BlitzFreePack/bundledAudio/Magic/airy-movement.wav'}},
        name: "Summon Blight"
    },
    summonShadowspawn: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Smoke/SmokePuffRing02_01_Dark_Black_400x400.webm', scale: 1.5}},
        sounds: {pre: {file:'modules/soundfxlibrary/Combat/Single/Spell%20Impact/spell-impact-2.mp3'}},
        options: [`Fury`, `Despair`,`Fear`],
        killIn: {minutes: 60},
        name: "Shadow Spirit"
    },
    symbioticEntity: {
        name: "Symbiotic Entity",
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Particles/ParticlesSwirl01_01_Regular_GreenYellow_400x400.webm', scale: 1}}
    },
    tasteOfTheStones: {
        name: "Taste of the Stones"
    },
    toggleEffectEffects: {
        blind: {
            animate: false
        }
    },
    tollTheDead: {
        name: "Toll the Dead"
    },
    theRightToolForTheJob: {
        item: {
            compendium: "Napolitano Items",
            compendiumBackup: "DDB Items"
        },
        updates: {
            "flags": {
                "ddbimporter": {"ignoreItemImport": true}, 
                "napolitano-scripts":{'rightToolForTheJob': true}
                }
            }
    },
    tumble: {
        name: "Tumble"
    },
    turnUndead: {
        effects: {
            pre: {
                file:'modules/jb2a_patreon/Library/Cantrip/Toll_The_Dead/TollTheDeadSkullSmoke_01_Regular_Purple_400x400.webm',
                duration: 1000, 
                scale: 1.5
            }
        },
        sounds: {
            pre: {
                file: 'modules/SoundBoard-BlitzFreePack/bundledAudio/Enemies/Zombie_GaspingForAir.mp3'
            }
        }
    },
    voicesFromBeyond: {
        name: "Voices from Beyond",
        table: {
            compendium: "Napolitano Roll Table",
            compendiumBackup: "DDB Roll Table",
            name: "Voices from Beyond"
        }
    },
    wardingFlare: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Energy/Shimmer01_01_Regular_Orange_400x400.webm', duration: 2000, scale: 2}},
        name: "Warding Flare"
    },
    whisperingAura: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_02_Regular_Grey_400x400.webm', scale: 1}},
        name: "Whispering Aura"
    },
    wildSurgeRetribution: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Marker/EnergyStrands_01_Regular_Blue_600x600.webm', fadeOut: 500, scale: 0.5, wait: 100}},
        name: "Wild Surge: Retribution"
    },
    witchBolt: {
        effects: {
            pre: {
                file: "modules/jb2a_patreon/Library/1st_Level/Witch_Bolt/WitchBolt_01_Regular_Green_30ft_1600x400.webm",
                duration: 1000, 
                stretch: true
            }},
        sounds: {
            pre: {
                file: "modules/SoundBoard-BlitzFreePack/bundledAudio/Magic/electric-blast.wav"
            }
        },
        name: "Witch Bolt"
    },
    unseenServant: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_02_Regular_Grey_400x400.webm', scale: 1.25}},
        killIn: {minutes: 60},
        name: "Unseen Servant"
    },
    varallasClawsOfDarkness: {
        effects:{pre: {file: 'modules/jb2a_patreon/Library/Generic/Smoke/SmokePuffRing02_01_Dark_Black_400x400.webm', scale: 1.5}},
        sounds: {pre: {file:'modules/soundfxlibrary/Combat/Single/Spell%20Impact/spell-impact-2.mp3'}},
        killIn: {minutes: 1},
        name: "Varalla's Claws of Darkness"
    },
    zeroChargeDestroy: {
        rollOneOnTwenty: ['Staff of Frost', 'Wand of Magic Missiles', 'Wand of Fear']
    }
}

const LINKDATACATEGORIES = {
    arrows: {
        0: {target: 'Arrows', type: "ammo"},
        1: {target: 'Arrows +1',  type: "ammo"},
        2: {target: 'Arrows +2',  type: "ammo"},
        3: {target: 'Arrows +3', type: "ammo"}
    },
    bolts: {
        0: {target: 'Crossbow Bolts', type: "ammo"},
        1: {target: 'Crossbow Bolts +1', type: "ammo"},
        2: {target: 'Crossbow Bolts +2', type: "ammo"},
        3: {target: 'Crossbow Bolts +3', type: "ammo"}
    },
    bullets: {
        0: {target: 'Blunderbuss Bullets', type: "ammo"}
    },
    darts: {0: {target: 'Dart', type: "ammo"}},
    kipoints: {0: {target: 'Ki Points', type: "charges"}},
    torches: {0: {target: 'Torch', type: "ammo"}},
    divinity: {0: {target: 'Channel Divinity', type: "charges"}},
    formOfDread: {0: {target: 'Form of Dread: Transform', type: "charges"}},
    superiority: {0: {target: 'Superiority Dice', type: "charges"}},
    wildshape: {0: {target: 'Wild Shape', type: "charges"}},
    sorcerypoints: {0: {target: 'Sorcery Points', type: "charges"}},
    bardicInspiration: {0: {target: 'Bardic Inspiration', type: "charges"}}
}

export const HOOKEDUSEITEMITEMS = {
    'Accursed Specter': 'accursedSpecter',
    'Booming Blade': 'boomingBlade',
    'Divine Smite': 'divineSmite',
    'Feather of Diatryma Summoning': 'featherOfDiatrymaSummoning',
    'Figurine of Wondrous Power (Golden Lions)': 'figurineOfWonderousPowerLions',
    'Figurine of Wondrous Power (Obsidian Steed)': 'figurineOfWonderousPowerObsidianSteed',
    'Fog Cloud': 'fogCloud',
    'Grease': 'grease',
    'Halo of Spores': 'haloOfSpores',
    'Hand Grenade': 'handGrenade',
    "Maximilian's Earthen Grasp": 'maximiliansEarthenGrasp',
    'Polymorph': 'polymorph',
    'Silvery Barbs': 'silveryBarbs',
    'Spare the Dying': 'spareTheDying',
    'Spike Growth': 'spikeGrowth',
    'Symbiotic Entity': 'symbioticEntity',
    "Varalla's Claws of Darkness": 'varallasClawsOfDarkness'
}

export const HOOKEDITEMUSAGECONSUMPTIONITEMS = {
    'Flaming Sphere': 'flamingSphere',
    'Healing Spirit': 'healingSpirit',
    'Mage Hand': 'mageHand'
}

export const CONFIGS = [
    {id:"condition-effects", name:"Condition Effects"},
    {id:"dnd5e-posthooks", name:"DnD5e Post Hooks"},
    {id:"hp-roll", name:"Roll HP On New NPC Tokens"},
    {id:"template-targeting", name:"Template Targeting"},
    {id:"link-items", name:"Link Items to Uses"},
    {id:"long-rest", name:"Long Rest"},
    {id:"short-rest", name:"Short Rest"},
    {id:"ping-dm", name:"Ping DM"},
    {id:"ancestral-protectors", name:"Ancestral Protectors"},
    {id:"arcane-firearm", name:"Arcane Firearm"},
    {id:"armor-of-agathys", name:"Armor of Agathys"},
    {id:"assassinate", name: "Assassinate"},
    {id:"blessed-healer", name:"Blessed Healer"},
    {id:"blessed-strikes", name:"Blessed Strikes"},
    {id:"chardalyn", name:"Chardalyn"},
    {id:"colossus-slayer", name:"Colossus Slayer"},
    {id:"counterspell", name:"Counterspell"},
    {id:"cutting-words", name:"Cutting Words"},
    {id:"death-ward", name:"Death Ward"},
    {id:"disarming-attack", name:"Disarming Attack"},
    {id:"echoing-mind", name:"Echoing Mind"},
    {id:"fire-shield", name:"Fire Shield"},
    {id:"form-of-dread", name:"Form of Dread"},
    {id:"genies-wrath", name:"Genie's Wrath"},
    {id:"green-flame-blade", name:"Green Flame Blade"},
    {id:"guided-strike", name:"Guided Strike"},
    {id:"heated-body", name:"Heated Body"},
    {id:"hex", name:"Hex"},
    {id:"hexblades-curse", name:"Hexblade's Curse"},
    {id:"hungry-jaws", name:"Hungry Jaws"},
    {id:"interception", name:"Interception"},
    {id:"intrusive-echoes", name:"Intrusive Echoes"},
    {id:"mirror-image", name:"Mirror Image"},
    {id:"motivational-speech", name:"Motivational Speech"},
    {id:"nathairs-mischief", name:"Nathair's Mischief"},
    {id:"necrotic-shroud", name:"Necrotic Shroud"},
    {id:"pack-tactics", name:"Pack Tactics"},
    {id:"parry", name:"Parry"},
    {id:"potent-spellcasting", name:"Potent Spellcasting"},
    {id:"precision-attack", name:"Precision Attack"},
    {id:"radiant-soul", name:"Radiant Soul"},
    {id:"rayOfEnfeeblement", name: "Ray of Enfeeblement"},
    {id:"relentless", name:"Relentless"},
    {id:"relentless-endurance", name:"Relentless Endurence"},
    {id:"shield", name:"Shield (spell)"},
    {id:"silvery-barbs", name:"Silvery Barbs"},
    {id:"sneak-attack", name:"Sneak Attack"},
    {id:"taste-of-the-stones", name:"Taste of the Stones"},
    {id:"voices-from-beyond", name:"Voices from Beyond"},
    {id:"warding-flare", name:"Warding Flare"},
    {id:"wild-surge", name:"Wild Surge"},
    {id:"witch-bolt", name:"Witch Bolt"}
]

export const LINKDATA = [
    {item: 'Longbow', resources: LINKDATACATEGORIES.arrows, matchOn: "weapon", retrieve: "consumable", amount: 1},
    {item: 'Shortbow', resources: LINKDATACATEGORIES.arrows, matchOn: "weapon", retrieve: "consumable", amount: 1},
    {item: 'Crossbow,', resources: LINKDATACATEGORIES.bolts, matchOn: "weapon", retrieve: "consumable", amount: 1},
    {item: 'Dart', resources: LINKDATACATEGORIES.darts, matchOn: "weapon", retrieve: "weapon", amount: 1},
    {item: 'Shotgun', resources: LINKDATACATEGORIES.bullets, matchOn: "weapon", retrieve: "consumable", amount: 1},
    {item: 'Patient Defense', resources: LINKDATACATEGORIES.kipoints, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Step of the Wind', resources: LINKDATACATEGORIES.kipoints, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Deflect Missiles Attack', resources: LINKDATACATEGORIES.kipoints, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Stunning Strike', resources: LINKDATACATEGORIES.kipoints, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Quickened Healing', resources: LINKDATACATEGORIES.kipoints, matchOn: "feat", retrieve: "feat", amount: 2},
    {item: 'Focused Aim', resources: LINKDATACATEGORIES.kipoints, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Flurry of Blows', resources: LINKDATACATEGORIES.kipoints, matchOn: "weapon", retrieve: "feat", amount: 1},
    {item: 'Searing Arc Strike', resources: LINKDATACATEGORIES.kipoints, matchOn: "feat", retrieve: "feat", amount: 2},
    {item: 'Torch', resources: LINKDATACATEGORIES.torches, matchOn: "consumable", retrieve: "consumable", amount: 1},
    {item: 'Channel Divinity: Radiance of the Dawn', resources: LINKDATACATEGORIES.divinity, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Channel Divinity: Guided Strike', resources: LINKDATACATEGORIES.divinity, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Channel Divinity: Turn Undead', resources: LINKDATACATEGORIES.divinity, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Channel Divinity: Champion Challenge', resources: LINKDATACATEGORIES.divinity, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Channel Divinity: Turn the Tide', resources: LINKDATACATEGORIES.divinity, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Harness Divine Power', resources: LINKDATACATEGORIES.divinity, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Maneuvers: Parry', resources: LINKDATACATEGORIES.superiority, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Maneuvers: Precision Attack', resources: LINKDATACATEGORIES.superiority, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Maneuvers: Disarming Attack', resources: LINKDATACATEGORIES.superiority, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Wild Companion', resources: LINKDATACATEGORIES.wildshape, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Ki-Fueled Attack', resources: LINKDATACATEGORIES.kipoints, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Metamagic - Empowered Spell', resources: LINKDATACATEGORIES.sorcerypoints, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Bend Luck', resources: LINKDATACATEGORIES.sorcerypoints, matchOn: "feat", retrieve: "feat", amount: 2},
    {item: 'Channel Divinity: Emissary of Peace', resources: LINKDATACATEGORIES.divinity, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Channel Divinity: Rebuke the Violent', resources: LINKDATACATEGORIES.divinity, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Maneuvers: Commander’s Strike', resources: LINKDATACATEGORIES.superiority, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Maneuvers: Disarming Attack', resources: LINKDATACATEGORIES.superiority, matchOn: "feat", retrieve: "feat", amount: 0},
    {item: 'Maneuvers: Menacing Attack', resources: LINKDATACATEGORIES.superiority, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Maneuvers: Precision Attack', resources: LINKDATACATEGORIES.superiority, matchOn: "feat", retrieve: "feat", amount: 0},
    {item: 'Combat Inspiration', resources: LINKDATACATEGORIES.bardicInspiration, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Magical Inspiration', resources: LINKDATACATEGORIES.bardicInspiration, matchOn: "feat", retrieve: "feat", amount: 1},
    {item: 'Form of Dread', resources: LINKDATACATEGORIES.formOfDread, matchOn: "feat", retrieve: "feat", amount: 1}
]

export const SPIRITUALWEAPONS ={
    greatAxe:{
        green: 'GreatAxe01_02_Spectral_Green'
    }, 
    greatSword:{
        green: 'GreatSword01_02_Spectral_Green'
    }, 
    greatClub:{
        green: 'GreatClub01_02_Spectral_Green'
    },
    mace: {
        blue: 'Mace01_01_Spectral_Blue',
        orange: 'Mace01_01_Spectral_Orange',
        purple: 'Mace01_01_Spectral_Purple',
        green: 'Mace01_01_Spectral_Green',
        red: 'Mace01_01_Spectral_Red'
    },
    maul: {
        blue: 'Maul01_01_Spectral_Blue',
        orange: 'Maul01_01_Spectral_Orange',
        purple: 'Maul01_01_Spectral_Purple',
        green: 'Maul01_01_Spectral_Green',
        red: 'Maul01_01_Spectral_Red'
    },
    quarterstaff: {
        green: 'Quarterstaff02_02_Spectral_Green',
        greenCrystal: 'Quarterstaff03_02_Spectral_Green',
        greenRamsHead: 'Quarterstaff04_02_Spectral_Green'
    },
    rapier: {
        green: 'Rapier01_02_Spectral_Green'
    },
    scythe: {
        blue: 'Scythe01_02_Spectral_Blue',
        orange: 'Scythe01_02_Spectral_Orange',
        purple: 'Scythe01_02_Spectral_Purple',
        green: 'Scythe01_02_Spectral_Green',
        red: 'Scythe01_02_Spectral_Red',
        white: 'Scythe01_02_Spectral_White'
    },
    spear: {
        green: 'Spear01_02_Spectral_Green'
    },
    sword: {
        blue: 'Sword01_01_Spectral_Blue',
        orange: 'Sword01_01_Spectral_Orange',
        purple: 'Sword01_01_Spectral_Purple',
        green: 'Sword01_01_Spectral_Green',
        red: 'Sword01_01_Spectral_Red'
    },
    trident: {
        green: 'Trident01_02_Spectral_Green'
    },
    warhammer : {
        green: 'Warhammer01_02_Spectral_Green'
    }
}

const PLAY_MODE = {
  SINGLE: 0,
  DOUBLE: 1
};

const MUSIC_LIST_URL = 'https://p.eagate.573.jp/game/ddr/ddra20/p/music/index.html';
const SCORE_LIST_URL = {};
SCORE_LIST_URL[PLAY_MODE.SINGLE] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_single.html';
//SCORE_LIST_URL[PLAY_MODE.SINGLE] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/rival/rival_musicdata_single.html?rival_id=11048968';
SCORE_LIST_URL[PLAY_MODE.DOUBLE] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_double.html';
//SCORE_LIST_URL[PLAY_MODE.DOUBLE] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/rival/rival_musicdata_double.html?rival_id=11048968';
const MUSIC_DETAIL_URL = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_detail.html?index=[musicId]'
//const MUSIC_DETAIL_URL = 'https://p.eagate.573.jp/game/ddr/ddra20/p/rival/music_detail.html?rival_id=11048968&index=[musicId]'

const PARSED_MUSIC_LIST_URL = 'https://ryowatanabe.github.io/DDRScoreTracker/musics.txt';

const LOAD_INTERVAL = 3000;

const LIST_TYPE = {
  MENU: 0,
  MUSIC: 1
};

const MENU_DATA = [
  {
    id: "all",
    name: "All Music",
    condition: [ ]
  },
  {
    id: "sp-all",
    name: "Single All",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.SINGLE ] } ]
  },
  {
    id: "dp-all",
    name: "Double All",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] } ]
  },
  {
    id: "dp-lv1",
    name: "Double Level 1",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] }, { attribute: 'level', values: [ 1 ] } ]
  },
  {
    id: "dp-lv2",
    name: "Double Level 2",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] }, { attribute: 'level', values: [ 2 ] } ]
  },
  {
    id: "dp-lv3",
    name: "Double Level 3",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] }, { attribute: 'level', values: [ 3 ] } ]
  },
  {
    id: "dp-lv4",
    name: "Double Level 4",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] }, { attribute: 'level', values: [ 4 ] } ]
  },
  {
    id: "dp-lv5",
    name: "Double Level 5",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] }, { attribute: 'level', values: [ 5 ] } ]
  },
  {
    id: "dp-lv6",
    name: "Double Level 6",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] }, { attribute: 'level', values: [ 6 ] } ]
  },
  {
    id: "dp-lv7",
    name: "Double Level 7",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] }, { attribute: 'level', values: [ 7 ] } ]
  },
  {
    id: "dp-lv8",
    name: "Double Level 8",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] }, { attribute: 'level', values: [ 8 ] } ]
  },
  {
    id: "dp-lv9",
    name: "Double Level 9",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] }, { attribute: 'level', values: [ 9 ] } ]
  },
  {
    id: "dp-lv10",
    name: "Double Level 10",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] }, { attribute: 'level', values: [ 10 ] } ]
  },
  {
    id: "dp-lv11",
    name: "Double Level 11",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] }, { attribute: 'level', values: [ 11 ] } ]
  },
  {
    id: "dp-lv12",
    name: "Double Level 12",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] }, { attribute: 'level', values: [ 12 ] } ]
  },
  {
    id: "dp-lv13",
    name: "Double Level 13",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] }, { attribute: 'level', values: [ 13 ] } ]
  },
  {
    id: "dp-lv14",
    name: "Double Level 14",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] }, { attribute: 'level', values: [ 14 ] } ]
  },
  {
    id: "dp-lv15",
    name: "Double Level 15",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] }, { attribute: 'level', values: [ 15 ] } ]
  },
  {
    id: "dp-lv16",
    name: "Double Level 16",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] }, { attribute: 'level', values: [ 16 ] } ]
  },
  {
    id: "dp-lv17",
    name: "Double Level 17",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] }, { attribute: 'level', values: [ 17 ] } ]
  },
  {
    id: "dp-lv18",
    name: "Double Level 18",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] }, { attribute: 'level', values: [ 18 ] } ]
  },
  {
    id: "dp-lv19",
    name: "Double Level 19",
    condition: [ { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] }, { attribute: 'level', values: [ 19 ] } ]
  },
];

const DIFFICULTIES = {
  BEGINNER:  0,
  BASIC:     1,
  DIFFICULT: 2,
  EXPERT:    3,
  CHALLENGE: 4
};

const DIFFICULTY_NAME_MAP = {
  'beginner':  DIFFICULTIES.BEGINNER,
  'basic':     DIFFICULTIES.BASIC,
  'difficult': DIFFICULTIES.DIFFICULT,
  'expert':    DIFFICULTIES.EXPERT,
  'challenge': DIFFICULTIES.CHALLENGE
};

const DIFFICULTIES_OFFSET_FOR_DOUBLE = 4;

const FULL_COMBO_TYPE = {
  NO_FC:        0,
  GOOD_FC:      1,
  GREAT_FC:     2,
  PERFECT_FC:   3,
  MARVELOUS_FC: 4
};

const FULL_COMBO_TYPE_FILE_MAP = {
  'full_none.png':    FULL_COMBO_TYPE.NO_FC,
  'full_good.png':    FULL_COMBO_TYPE.GOOD_FC,
  'full_great.png':   FULL_COMBO_TYPE.GREAT_FC,
  'full_perfect.png': FULL_COMBO_TYPE.PERFECT_FC,
  'full_mar.png':     FULL_COMBO_TYPE.MARFVELOUS_FC
};

const SCORE_RANK = {
  NO_PLAY:   0,
  E:         1,
  D:         2,
  D_PLUS:    3,
  C_MINUS:   4,
  C:         5,
  C_PLUS:    6,
  B_MINUS:   7,
  B:         8,
  B_PLUS:    9,
  A_MINUS:  10,
  A:        11,
  A_PLUS:   12,
  AA_MINUS: 13,
  AA:       14,
  AA_PLUS:  15,
  AAA:      16
};

const SCORE_RANK_FILE_MAP = {
  'rank_s_none.png': SCORE_RANK.NO_PLAY,
  'rank_s_e.png':    SCORE_RANK.E,
  'rank_s_d.png':    SCORE_RANK.D,
  'rank_s_d_p.png':  SCORE_RANK.D_PLUS,
  'rank_s_c_m.png':  SCORE_RANK.C_MINUS,
  'rank_s_c.png':    SCORE_RANK.C,
  'rank_s_c_p.png':  SCORE_RANK.C_PLUS,
  'rank_s_b_m.png':  SCORE_RANK.B_MINUS,
  'rank_s_b.png':    SCORE_RANK.B,
  'rank_s_b_p.png':  SCORE_RANK.B_PLUS,
  'rank_s_a_m.png':  SCORE_RANK.A_MINUS,
  'rank_s_a.png':    SCORE_RANK.A,
  'rank_s_a_p.png':  SCORE_RANK.A_PLUS,
  'rank_s_aa_m.png': SCORE_RANK.AA_MINUS,
  'rank_s_aa.png':   SCORE_RANK.AA,
  'rank_s_aa_p.png': SCORE_RANK.AA_PLUS,
  'rank_s_aaa.png':  SCORE_RANK.AAA
};

const PLAY_MODE = {
  SINGLE: 0,
  DOUBLE: 1
};

const MUSIC_LIST_URL = 'https://p.eagate.573.jp/game/ddr/ddra20/p/music/index.html';
const SCORE_LIST_URL = {};
SCORE_LIST_URL[PLAY_MODE.SINGLE] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_single.html';
SCORE_LIST_URL[PLAY_MODE.DOUBLE] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_double.html';
const MUSIC_DETAIL_URL = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_detail.html?index=[musicId]'

const LOAD_INTERVAL = 3000;

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

const PLAY_MODE = {
  SINGLE: 0,
  DOUBLE: 1
};

const MUSIC_LIST_URL = 'https://p.eagate.573.jp/game/ddr/ddra20/p/music/index.html';
const SCORE_LIST_URL = {};
SCORE_LIST_URL[PLAY_MODE.SINGLE] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_single.html';
//SCORE_LIST_URL[PLAY_MODE.SINGLE] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/rival/rival_musicdata_single.html?rival_id=11048968';
SCORE_LIST_URL[PLAY_MODE.DOUBLE] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_double.html';
//https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_double.html?offset=17&filter=0&filtertype=0&sorttype=0
//SCORE_LIST_URL[PLAY_MODE.DOUBLE] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/rival/rival_musicdata_double.html?rival_id=11048968';
const MUSIC_DETAIL_URL = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_detail.html?index=[musicId]'
//const MUSIC_DETAIL_URL = 'https://p.eagate.573.jp/game/ddr/ddra20/p/rival/music_detail.html?rival_id=11048968&index=[musicId]'
const SCORE_DETAIL_URL = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_detail.html?index=[musicId]&diff=[difficulty]'

const PARSED_MUSIC_LIST_URL = 'https://ryowatanabe.github.io/DDRScoreTracker/musics.txt';

const LOAD_INTERVAL = 3000;

const LIST_TYPE = {
  MENU: 0,
  MUSIC: 1
};

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

const CLEAR_TYPE = {
  NO_PLAY:      0,
  FAILED:       1,
  ASSIST_CLEAR: 2,
  CLEAR:        3,
  LIFE4:        4,
  GOOD_FC:      5,
  GREAT_FC:     6,
  PERFECT_FC:   7,
  MARVELOUS_FC: 8
}

const CLEAR_TYPE_FILE_MAP = {
  'full_none.png':    null,
  'full_good.png':    CLEAR_TYPE.GOOD_FC,
  'full_great.png':   CLEAR_TYPE.GREAT_FC,
  'full_perfect.png': CLEAR_TYPE.PERFECT_FC,
  'full_mar.png':     CLEAR_TYPE.MARFVELOUS_FC
};

const CLEAR_TYPE_NAME_MAP = {
  '---': null,
  'グッドフルコンボ': CLEAR_TYPE.GOOD_FC,
  'グレートフルコンボ': CLEAR_TYPE.GREAT_FC,
  'パーフェクトフルコンボ': CLEAR_TYPE.PERFECT_FC,
  'マーベラスフルコンボ': CLEAR_TYPE.MARVELOUS_FC
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

const SCORE_RANK_NAME_MAP = {
  'E':    SCORE_RANK.E,
  'D':    SCORE_RANK.D,
  'D+':  SCORE_RANK.D_PLUS,
  'C-':  SCORE_RANK.C_MINUS,
  'C':    SCORE_RANK.C,
  'C+':  SCORE_RANK.C_PLUS,
  'B-':  SCORE_RANK.B_MINUS,
  'B':    SCORE_RANK.B,
  'B+':  SCORE_RANK.B_PLUS,
  'A-':  SCORE_RANK.A_MINUS,
  'A':    SCORE_RANK.A,
  'A+':  SCORE_RANK.A_PLUS,
  'AA-': SCORE_RANK.AA_MINUS,
  'AA':   SCORE_RANK.AA,
  'AA+': SCORE_RANK.AA_PLUS,
  'AAA':  SCORE_RANK.AAA
};

/*
表示・CSS class用文字列
*/

const CLEAR_TYPE_STRING = {};
CLEAR_TYPE_STRING[CLEAR_TYPE.NO_PLAY]      = "NoPlay";
CLEAR_TYPE_STRING[CLEAR_TYPE.FAILED]       = "Failed";
CLEAR_TYPE_STRING[CLEAR_TYPE.ASSIST_CLEAR] = "AssistClear";
CLEAR_TYPE_STRING[CLEAR_TYPE.CLEAR]        = "Clear";
CLEAR_TYPE_STRING[CLEAR_TYPE.LIFE4]        = "LIFE4";
CLEAR_TYPE_STRING[CLEAR_TYPE.GOOD_FC]      = "GFC";
CLEAR_TYPE_STRING[CLEAR_TYPE.GREAT_FC]     = "FC";
CLEAR_TYPE_STRING[CLEAR_TYPE.PERFECT_FC]   = "PFC";
CLEAR_TYPE_STRING[CLEAR_TYPE.MARVELOUS_FC] = "MFC";

const FULL_COMBO_SYMBOL = {};
FULL_COMBO_SYMBOL[CLEAR_TYPE.NO_PLAY]      = "";
FULL_COMBO_SYMBOL[CLEAR_TYPE.FAILED]       = "";
FULL_COMBO_SYMBOL[CLEAR_TYPE.ASSIST_CLEAR] = "";
FULL_COMBO_SYMBOL[CLEAR_TYPE.CLEAR]        = "";
FULL_COMBO_SYMBOL[CLEAR_TYPE.LIFE4]        = "○";
FULL_COMBO_SYMBOL[CLEAR_TYPE.GOOD_FC]      = "○";
FULL_COMBO_SYMBOL[CLEAR_TYPE.GREAT_FC]     = "○";
FULL_COMBO_SYMBOL[CLEAR_TYPE.PERFECT_FC]   = "○";
FULL_COMBO_SYMBOL[CLEAR_TYPE.MARVELOUS_FC] = "○";

const CLEAR_TYPE_CLASS_STRING = {};
CLEAR_TYPE_CLASS_STRING[CLEAR_TYPE.NO_PLAY]      = "no_play";
CLEAR_TYPE_CLASS_STRING[CLEAR_TYPE.FAILED]       = "failed";
CLEAR_TYPE_CLASS_STRING[CLEAR_TYPE.ASSIST_CLEAR] = "assist_clear";
CLEAR_TYPE_CLASS_STRING[CLEAR_TYPE.CLEAR]        = "clear";
CLEAR_TYPE_CLASS_STRING[CLEAR_TYPE.LIFE4]        = "life4";
CLEAR_TYPE_CLASS_STRING[CLEAR_TYPE.GOOD_FC]      = "good_fc";
CLEAR_TYPE_CLASS_STRING[CLEAR_TYPE.GREAT_FC]     = "great_fc";
CLEAR_TYPE_CLASS_STRING[CLEAR_TYPE.PERFECT_FC]   = "perfect_fc";
CLEAR_TYPE_CLASS_STRING[CLEAR_TYPE.MARVELOUS_FC] = "marvelous_fc";

const SCORE_RANK_STRING = {};
SCORE_RANK_STRING[SCORE_RANK.NO_PLAY]  = "";
SCORE_RANK_STRING[SCORE_RANK.E]        = "E";
SCORE_RANK_STRING[SCORE_RANK.D]        = "D";
SCORE_RANK_STRING[SCORE_RANK.D_PLUS]   = "D+";
SCORE_RANK_STRING[SCORE_RANK.C_MINUS]  = "C-";
SCORE_RANK_STRING[SCORE_RANK.C]        = "C";
SCORE_RANK_STRING[SCORE_RANK.C_PLUS]   = "C+";
SCORE_RANK_STRING[SCORE_RANK.B_MINUS]  = "B-";
SCORE_RANK_STRING[SCORE_RANK.B]        = "B";
SCORE_RANK_STRING[SCORE_RANK.B_PLUS]   = "B+";
SCORE_RANK_STRING[SCORE_RANK.A_MINUS]  = "A-";
SCORE_RANK_STRING[SCORE_RANK.A]        = "A";
SCORE_RANK_STRING[SCORE_RANK.A_PLUS]   = "A+";
SCORE_RANK_STRING[SCORE_RANK.AA_MINUS] = "AA-";
SCORE_RANK_STRING[SCORE_RANK.AA]       = "AA";
SCORE_RANK_STRING[SCORE_RANK.AA_PLUS]  = "AA+";
SCORE_RANK_STRING[SCORE_RANK.AAA]      = "AAA";

const SCORE_RANK_CLASS_STRING = {};
SCORE_RANK_CLASS_STRING[SCORE_RANK.NO_PLAY]  = "rank_none";
SCORE_RANK_CLASS_STRING[SCORE_RANK.E]        = "rank_e";
SCORE_RANK_CLASS_STRING[SCORE_RANK.D]        = "rank_d";
SCORE_RANK_CLASS_STRING[SCORE_RANK.D_PLUS]   = "rank_d_p";
SCORE_RANK_CLASS_STRING[SCORE_RANK.C_MINUS]  = "rank_c_m";
SCORE_RANK_CLASS_STRING[SCORE_RANK.C]        = "rank_c";
SCORE_RANK_CLASS_STRING[SCORE_RANK.C_PLUS]   = "rank_c_p";
SCORE_RANK_CLASS_STRING[SCORE_RANK.B_MINUS]  = "rank_b_m";
SCORE_RANK_CLASS_STRING[SCORE_RANK.B]        = "rank_b";
SCORE_RANK_CLASS_STRING[SCORE_RANK.B_PLUS]   = "rank_b_p";
SCORE_RANK_CLASS_STRING[SCORE_RANK.A_MINUS]  = "rank_a_m";
SCORE_RANK_CLASS_STRING[SCORE_RANK.A]        = "rank_a";
SCORE_RANK_CLASS_STRING[SCORE_RANK.A_PLUS]   = "rank_a_p";
SCORE_RANK_CLASS_STRING[SCORE_RANK.AA_MINUS] = "rank_aa_m";
SCORE_RANK_CLASS_STRING[SCORE_RANK.AA]       = "rank_aa";
SCORE_RANK_CLASS_STRING[SCORE_RANK.AA_PLUS]  = "rank_aa_p";
SCORE_RANK_CLASS_STRING[SCORE_RANK.AAA]      = "rank_aaa";

const DIFFICULTY_CLASS_STRING = {};
DIFFICULTY_CLASS_STRING[DIFFICULTIES.BEGINNER]  = "beginner";
DIFFICULTY_CLASS_STRING[DIFFICULTIES.BASIC]     = "basic";
DIFFICULTY_CLASS_STRING[DIFFICULTIES.DIFFICULT] = "difficult";
DIFFICULTY_CLASS_STRING[DIFFICULTIES.EXPERT]    = "expert";
DIFFICULTY_CLASS_STRING[DIFFICULTIES.CHALLENGE] = "challenge";

const PLAY_MODE_SYMBOL = {};
PLAY_MODE_SYMBOL[PLAY_MODE.SINGLE] = "'";
PLAY_MODE_SYMBOL[PLAY_MODE.DOUBLE] = '"';

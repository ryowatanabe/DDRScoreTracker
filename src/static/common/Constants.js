export class Constants {
  static get GAME_VERSION() {
    return {
      A20PLUS: 0,
      A3: 1,
    };
  }

  static get PLAY_MODE() {
    return {
      SINGLE: 0,
      DOUBLE: 1,
    };
  }
  static get PLAY_MODE_FIRST() {
    return 0;
  }
  static get PLAY_MODE_LAST() {
    return 1;
  }

  static get MUSIC_TYPE() {
    return {
      UNKNOWN: -1,
      NORMAL: 0,
      NONSTOP: 1,
      GRADE: 2,
      GRADE_PLUS: 3,
      GRADE_A3: 4,
    };
  }
  static get MUSIC_TYPE_FIRST() {
    return 0;
  }
  static get MUSIC_TYPE_LAST() {
    return 4;
  }

  static get MUSIC_LIST_VERSION() {
    return 2;
  }

  static get MUSIC_LIST_URL() {
    return 'https://p.eagate.573.jp/game/ddr/ddra20/p/music/index.html';
  }

  static get SCORE_LIST_URL() {
    const result = {};
    result[this.GAME_VERSION.A20PLUS] = {};
    result[this.GAME_VERSION.A20PLUS][this.PLAY_MODE.SINGLE] = {};
    result[this.GAME_VERSION.A20PLUS][this.PLAY_MODE.DOUBLE] = {};
    result[this.GAME_VERSION.A20PLUS][this.PLAY_MODE.SINGLE][this.MUSIC_TYPE.NORMAL] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_single.html';
    result[this.GAME_VERSION.A20PLUS][this.PLAY_MODE.DOUBLE][this.MUSIC_TYPE.NORMAL] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_double.html';
    result[this.GAME_VERSION.A20PLUS][this.PLAY_MODE.SINGLE][this.MUSIC_TYPE.NONSTOP] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/nonstop_data_single.html';
    result[this.GAME_VERSION.A20PLUS][this.PLAY_MODE.DOUBLE][this.MUSIC_TYPE.NONSTOP] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/nonstop_data_double.html';
    result[this.GAME_VERSION.A20PLUS][this.PLAY_MODE.SINGLE][this.MUSIC_TYPE.GRADE] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/grade_data_single.html?folder=0';
    result[this.GAME_VERSION.A20PLUS][this.PLAY_MODE.DOUBLE][this.MUSIC_TYPE.GRADE] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/grade_data_double.html?folder=0';
    result[this.GAME_VERSION.A20PLUS][this.PLAY_MODE.SINGLE][this.MUSIC_TYPE.GRADE_PLUS] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/grade_data_single.html';
    result[this.GAME_VERSION.A20PLUS][this.PLAY_MODE.DOUBLE][this.MUSIC_TYPE.GRADE_PLUS] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/grade_data_double.html';
    result[this.GAME_VERSION.A20PLUS][this.PLAY_MODE.SINGLE][this.MUSIC_TYPE.GRADE_A3] = '';
    result[this.GAME_VERSION.A20PLUS][this.PLAY_MODE.DOUBLE][this.MUSIC_TYPE.GRADE_A3] = '';
    result[this.GAME_VERSION.A3] = {};
    result[this.GAME_VERSION.A3][this.PLAY_MODE.SINGLE] = {};
    result[this.GAME_VERSION.A3][this.PLAY_MODE.DOUBLE] = {};
    result[this.GAME_VERSION.A3][this.PLAY_MODE.SINGLE][this.MUSIC_TYPE.NORMAL] = 'https://p.eagate.573.jp/game/ddr/ddra3/p/playdata/music_data_single.html';
    result[this.GAME_VERSION.A3][this.PLAY_MODE.DOUBLE][this.MUSIC_TYPE.NORMAL] = 'https://p.eagate.573.jp/game/ddr/ddra3/p/playdata/music_data_double.html';
    result[this.GAME_VERSION.A3][this.PLAY_MODE.SINGLE][this.MUSIC_TYPE.NONSTOP] = 'https://p.eagate.573.jp/game/ddr/ddra3/p/playdata/nonstop_data_single.html';
    result[this.GAME_VERSION.A3][this.PLAY_MODE.DOUBLE][this.MUSIC_TYPE.NONSTOP] = 'https://p.eagate.573.jp/game/ddr/ddra3/p/playdata/nonstop_data_double.html';
    result[this.GAME_VERSION.A3][this.PLAY_MODE.SINGLE][this.MUSIC_TYPE.GRADE] = '';
    result[this.GAME_VERSION.A3][this.PLAY_MODE.DOUBLE][this.MUSIC_TYPE.GRADE] = '';
    result[this.GAME_VERSION.A3][this.PLAY_MODE.SINGLE][this.MUSIC_TYPE.GRADE_PLUS] = '';
    result[this.GAME_VERSION.A3][this.PLAY_MODE.DOUBLE][this.MUSIC_TYPE.GRADE_PLUS] = '';
    result[this.GAME_VERSION.A3][this.PLAY_MODE.SINGLE][this.MUSIC_TYPE.GRADE_A3] = 'https://p.eagate.573.jp/game/ddr/ddra3/p/playdata/grade_data_single.html';
    result[this.GAME_VERSION.A3][this.PLAY_MODE.DOUBLE][this.MUSIC_TYPE.GRADE_A3] = 'https://p.eagate.573.jp/game/ddr/ddra3/p/playdata/grade_data_double.html';
    return result;
  }

  static get MUSIC_DETAIL_URL() {
    const result = {};
    result[this.GAME_VERSION.A20PLUS] = {};
    result[this.GAME_VERSION.A20PLUS][this.MUSIC_TYPE.NORMAL] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_detail.html?index=[musicId]';
    result[this.GAME_VERSION.A20PLUS][this.MUSIC_TYPE.NONSTOP] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/course_detail.html?index=[musicId]';
    result[this.GAME_VERSION.A20PLUS][this.MUSIC_TYPE.GRADE] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/course_detail.html?index=[musicId]&gtype=1';
    result[this.GAME_VERSION.A20PLUS][this.MUSIC_TYPE.GRADE_PLUS] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/course_detail.html?index=[musicId]&gtype=1';
    result[this.GAME_VERSION.A20PLUS][this.MUSIC_TYPE.GRADE_A3] = '';
    result[this.GAME_VERSION.A3] = {};
    result[this.GAME_VERSION.A3][this.MUSIC_TYPE.NORMAL] = 'https://p.eagate.573.jp/game/ddr/ddra3/p/playdata/music_detail.html?index=[musicId]';
    result[this.GAME_VERSION.A3][this.MUSIC_TYPE.NONSTOP] = 'https://p.eagate.573.jp/game/ddr/ddra3/p/playdata/course_detail.html?index=[musicId]';
    result[this.GAME_VERSION.A3][this.MUSIC_TYPE.GRADE] = '';
    result[this.GAME_VERSION.A3][this.MUSIC_TYPE.GRADE_PLUS] = '';
    result[this.GAME_VERSION.A3][this.MUSIC_TYPE.GRADE_A3] = 'https://p.eagate.573.jp/game/ddr/ddra3/p/playdata/course_detail.html?index=[musicId]&gtype=1';
    return result;
  }

  static get SCORE_DETAIL_URL() {
    const result = {};
    result[this.GAME_VERSION.A20PLUS] = {};
    result[this.GAME_VERSION.A20PLUS][this.MUSIC_TYPE.NORMAL] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_detail.html?index=[musicId]&diff=[difficulty]';
    result[this.GAME_VERSION.A20PLUS][this.MUSIC_TYPE.NONSTOP] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/course_detail.html?index=[musicId]&diff=[difficulty]';
    result[this.GAME_VERSION.A20PLUS][this.MUSIC_TYPE.GRADE] = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/course_detail.html?index=[musicId]&diff=[difficulty]&gtype=1';
    result[this.GAME_VERSION.A20PLUS][this.MUSIC_TYPE.GRADE_PLUS] =
      'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/course_detail.html?index=[musicId]&diff=[difficulty]&gtype=1';
    result[this.GAME_VERSION.A20PLUS][this.MUSIC_TYPE.GRADE_A3] = '';
    result[this.GAME_VERSION.A3] = {};
    result[this.GAME_VERSION.A3][this.MUSIC_TYPE.NORMAL] = 'https://p.eagate.573.jp/game/ddr/ddra3/p/playdata/music_detail.html?index=[musicId]&diff=[difficulty]';
    result[this.GAME_VERSION.A3][this.MUSIC_TYPE.NONSTOP] = 'https://p.eagate.573.jp/game/ddr/ddra3/p/playdata/course_detail.html?index=[musicId]&diff=[difficulty]';
    result[this.GAME_VERSION.A3][this.MUSIC_TYPE.GRADE] = '';
    result[this.GAME_VERSION.A3][this.MUSIC_TYPE.GRADE_PLUS] = '';
    result[this.GAME_VERSION.A3][this.MUSIC_TYPE.GRADE_A3] = 'https://p.eagate.573.jp/game/ddr/ddra3/p/playdata/course_detail.html?index=[musicId]&diff=[difficulty]&gtype=1';
    return result;
  }

  static get PARSED_MUSIC_LIST_URL() {
    return 'https://ryowatanabe.github.io/DDRScoreTracker/musics/[version].txt';
  }

  static get PAGE_LENGTH() {
    return 500;
  }

  static get MUSIC_LIST_RELOAD_INTERVAL() {
    return 86400000; // milliseconds
  }

  static get LOAD_INTERVAL() {
    return 5000; // milliseconds
  }

  static get DIFFICULTIES() {
    return {
      BEGINNER: 0,
      BASIC: 1,
      DIFFICULT: 2,
      EXPERT: 3,
      CHALLENGE: 4,
    };
  }

  static get DIFFICULTY_NAME_MAP() {
    return {
      beginner: this.DIFFICULTIES.BEGINNER,
      basic: this.DIFFICULTIES.BASIC,
      difficult: this.DIFFICULTIES.DIFFICULT,
      expert: this.DIFFICULTIES.EXPERT,
      challenge: this.DIFFICULTIES.CHALLENGE,
    };
  }

  static get DIFFICULTIES_OFFSET_FOR_DOUBLE() {
    return 4;
  }

  static get CLEAR_TYPE() {
    return {
      NO_PLAY: 0,
      FAILED: 1,
      ASSIST_CLEAR: 2,
      CLEAR: 3,
      LIFE4: 4,
      GOOD_FC: 5,
      GREAT_FC: 6,
      PERFECT_FC: 7,
      MARVELOUS_FC: 8,
    };
  }

  static get CLEAR_TYPE_FILE_MAP() {
    return {
      'full_none.png': null,
      'full_good.png': this.CLEAR_TYPE.GOOD_FC,
      'full_great.png': this.CLEAR_TYPE.GREAT_FC,
      'full_perfect.png': this.CLEAR_TYPE.PERFECT_FC,
      'full_mar.png': this.CLEAR_TYPE.MARFVELOUS_FC,
    };
  }

  static get CLEAR_TYPE_NAME_MAP() {
    return {
      '---': null,
      グッドフルコンボ: this.CLEAR_TYPE.GOOD_FC,
      グレートフルコンボ: this.CLEAR_TYPE.GREAT_FC,
      パーフェクトフルコンボ: this.CLEAR_TYPE.PERFECT_FC,
      マーベラスフルコンボ: this.CLEAR_TYPE.MARVELOUS_FC,
    };
  }

  static get SCORE_RANK() {
    return {
      NO_PLAY: 0,
      E: 1,
      D: 2,
      D_PLUS: 3,
      C_MINUS: 4,
      C: 5,
      C_PLUS: 6,
      B_MINUS: 7,
      B: 8,
      B_PLUS: 9,
      A_MINUS: 10,
      A: 11,
      A_PLUS: 12,
      AA_MINUS: 13,
      AA: 14,
      AA_PLUS: 15,
      AAA: 16,
    };
  }

  static get SCORE_TO_SCORE_RANK_THRESHOLD() {
    return [
      { score: 990000, scoreRank: this.SCORE_RANK.AAA },
      { score: 950000, scoreRank: this.SCORE_RANK.AA_PLUS },
      { score: 900000, scoreRank: this.SCORE_RANK.AA },
      { score: 890000, scoreRank: this.SCORE_RANK.AA_MINUS },
      { score: 850000, scoreRank: this.SCORE_RANK.A_PLUS },
      { score: 800000, scoreRank: this.SCORE_RANK.A },
      { score: 790000, scoreRank: this.SCORE_RANK.A_MINUS },
      { score: 750000, scoreRank: this.SCORE_RANK.B_PLUS },
      { score: 700000, scoreRank: this.SCORE_RANK.B },
      { score: 690000, scoreRank: this.SCORE_RANK.B_MINUS },
      { score: 650000, scoreRank: this.SCORE_RANK.C_PLUS },
      { score: 600000, scoreRank: this.SCORE_RANK.C },
      { score: 590000, scoreRank: this.SCORE_RANK.C_MINUS },
      { score: 550000, scoreRank: this.SCORE_RANK.D_PLUS },
      { score: 0, scoreRank: this.SCORE_RANK.D },
    ];
  }

  static get SCORE_RANK_FILE_MAP() {
    return {
      'rank_s_none.png': this.SCORE_RANK.NO_PLAY,
      'rank_s_e.png': this.SCORE_RANK.E,
      'rank_s_d.png': this.SCORE_RANK.D,
      'rank_s_d_p.png': this.SCORE_RANK.D_PLUS,
      'rank_s_c_m.png': this.SCORE_RANK.C_MINUS,
      'rank_s_c.png': this.SCORE_RANK.C,
      'rank_s_c_p.png': this.SCORE_RANK.C_PLUS,
      'rank_s_b_m.png': this.SCORE_RANK.B_MINUS,
      'rank_s_b.png': this.SCORE_RANK.B,
      'rank_s_b_p.png': this.SCORE_RANK.B_PLUS,
      'rank_s_a_m.png': this.SCORE_RANK.A_MINUS,
      'rank_s_a.png': this.SCORE_RANK.A,
      'rank_s_a_p.png': this.SCORE_RANK.A_PLUS,
      'rank_s_aa_m.png': this.SCORE_RANK.AA_MINUS,
      'rank_s_aa.png': this.SCORE_RANK.AA,
      'rank_s_aa_p.png': this.SCORE_RANK.AA_PLUS,
      'rank_s_aaa.png': this.SCORE_RANK.AAA,
    };
  }

  static get SCORE_RANK_NAME_MAP() {
    return {
      E: this.SCORE_RANK.E,
      D: this.SCORE_RANK.D,
      'D+': this.SCORE_RANK.D_PLUS,
      'C-': this.SCORE_RANK.C_MINUS,
      C: this.SCORE_RANK.C,
      'C+': this.SCORE_RANK.C_PLUS,
      'B-': this.SCORE_RANK.B_MINUS,
      B: this.SCORE_RANK.B,
      'B+': this.SCORE_RANK.B_PLUS,
      'A-': this.SCORE_RANK.A_MINUS,
      A: this.SCORE_RANK.A,
      'A+': this.SCORE_RANK.A_PLUS,
      'AA-': this.SCORE_RANK.AA_MINUS,
      AA: this.SCORE_RANK.AA,
      'AA+': this.SCORE_RANK.AA_PLUS,
      AAA: this.SCORE_RANK.AAA,
    };
  }

  /*
  表示・CSS class用文字列
  */

  static get PLAY_MODE_AND_DIFFICULTY_STRING() {
    const result = {};
    result[0] = 'bSP';
    result[1] = 'BSP';
    result[2] = 'DSP';
    result[3] = 'ESP';
    result[4] = 'CSP';
    result[5] = 'BDP';
    result[6] = 'DDP';
    result[7] = 'EDP';
    result[8] = 'CDP';
    return result;
  }

  static get CLEAR_TYPE_STRING() {
    const result = {};
    result[this.CLEAR_TYPE.NO_PLAY] = 'NoPlay';
    result[this.CLEAR_TYPE.FAILED] = 'Failed';
    result[this.CLEAR_TYPE.ASSIST_CLEAR] = 'AssistClear';
    result[this.CLEAR_TYPE.CLEAR] = 'Clear';
    result[this.CLEAR_TYPE.LIFE4] = 'LIFE4';
    result[this.CLEAR_TYPE.GOOD_FC] = 'GFC';
    result[this.CLEAR_TYPE.GREAT_FC] = 'FC';
    result[this.CLEAR_TYPE.PERFECT_FC] = 'PFC';
    result[this.CLEAR_TYPE.MARVELOUS_FC] = 'MFC';
    return result;
  }

  static get FULL_COMBO_SYMBOL() {
    const result = {};
    result[this.CLEAR_TYPE.NO_PLAY] = '';
    result[this.CLEAR_TYPE.FAILED] = '';
    result[this.CLEAR_TYPE.ASSIST_CLEAR] = '';
    result[this.CLEAR_TYPE.CLEAR] = '';
    result[this.CLEAR_TYPE.LIFE4] = '○';
    result[this.CLEAR_TYPE.GOOD_FC] = '○';
    result[this.CLEAR_TYPE.GREAT_FC] = '○';
    result[this.CLEAR_TYPE.PERFECT_FC] = '○';
    result[this.CLEAR_TYPE.MARVELOUS_FC] = '○';
    return result;
  }

  static get CLEAR_TYPE_CLASS_STRING() {
    const result = {};
    result[this.CLEAR_TYPE.NO_PLAY] = 'no_play';
    result[this.CLEAR_TYPE.FAILED] = 'failed';
    result[this.CLEAR_TYPE.ASSIST_CLEAR] = 'assist_clear';
    result[this.CLEAR_TYPE.CLEAR] = 'clear';
    result[this.CLEAR_TYPE.LIFE4] = 'life4';
    result[this.CLEAR_TYPE.GOOD_FC] = 'good_fc';
    result[this.CLEAR_TYPE.GREAT_FC] = 'great_fc';
    result[this.CLEAR_TYPE.PERFECT_FC] = 'perfect_fc';
    result[this.CLEAR_TYPE.MARVELOUS_FC] = 'marvelous_fc';
    return result;
  }

  static get SCORE_RANK_STRING() {
    const result = {};
    result[this.SCORE_RANK.NO_PLAY] = 'NoPlay';
    result[this.SCORE_RANK.E] = 'E';
    result[this.SCORE_RANK.D] = 'D';
    result[this.SCORE_RANK.D_PLUS] = 'D+';
    result[this.SCORE_RANK.C_MINUS] = 'C-';
    result[this.SCORE_RANK.C] = 'C';
    result[this.SCORE_RANK.C_PLUS] = 'C+';
    result[this.SCORE_RANK.B_MINUS] = 'B-';
    result[this.SCORE_RANK.B] = 'B';
    result[this.SCORE_RANK.B_PLUS] = 'B+';
    result[this.SCORE_RANK.A_MINUS] = 'A-';
    result[this.SCORE_RANK.A] = 'A';
    result[this.SCORE_RANK.A_PLUS] = 'A+';
    result[this.SCORE_RANK.AA_MINUS] = 'AA-';
    result[this.SCORE_RANK.AA] = 'AA';
    result[this.SCORE_RANK.AA_PLUS] = 'AA+';
    result[this.SCORE_RANK.AAA] = 'AAA';
    return result;
  }

  static get SCORE_RANK_CLASS_STRING() {
    const result = {};
    result[this.SCORE_RANK.NO_PLAY] = 'rank_none';
    result[this.SCORE_RANK.E] = 'rank_e';
    result[this.SCORE_RANK.D] = 'rank_d';
    result[this.SCORE_RANK.D_PLUS] = 'rank_d_p';
    result[this.SCORE_RANK.C_MINUS] = 'rank_c_m';
    result[this.SCORE_RANK.C] = 'rank_c';
    result[this.SCORE_RANK.C_PLUS] = 'rank_c_p';
    result[this.SCORE_RANK.B_MINUS] = 'rank_b_m';
    result[this.SCORE_RANK.B] = 'rank_b';
    result[this.SCORE_RANK.B_PLUS] = 'rank_b_p';
    result[this.SCORE_RANK.A_MINUS] = 'rank_a_m';
    result[this.SCORE_RANK.A] = 'rank_a';
    result[this.SCORE_RANK.A_PLUS] = 'rank_a_p';
    result[this.SCORE_RANK.AA_MINUS] = 'rank_aa_m';
    result[this.SCORE_RANK.AA] = 'rank_aa';
    result[this.SCORE_RANK.AA_PLUS] = 'rank_aa_p';
    result[this.SCORE_RANK.AAA] = 'rank_aaa';
    return result;
  }

  static get DIFFICULTY_CLASS_STRING() {
    const result = {};
    result[this.DIFFICULTIES.BEGINNER] = 'beginner';
    result[this.DIFFICULTIES.BASIC] = 'basic';
    result[this.DIFFICULTIES.DIFFICULT] = 'difficult';
    result[this.DIFFICULTIES.EXPERT] = 'expert';
    result[this.DIFFICULTIES.CHALLENGE] = 'challenge';
    return result;
  }

  static get PLAY_MODE_SYMBOL() {
    const result = {};
    result[this.PLAY_MODE.SINGLE] = "'";
    result[this.PLAY_MODE.DOUBLE] = '"';
    return result;
  }
}

import { SkillAttackIndexMap } from './SkillAttackIndexMap.js';
import { SkillAttackDataList } from './SkillAttackDataList.js';
import { Logger } from './Logger.js';
import { I18n } from './I18n.js';

export class SkillAttackExporter {
  constructor(musicList, scoreList, options) {
    this.musicList = musicList;
    this.scoreList = scoreList;
    this.options = options;
  }

  async export(ddrcode, password) {
    const params = new URLSearchParams();
    params.append('_', '');
    params.append('password', password);
    params.append('ddrcode', ddrcode);
    Logger.info(I18n.getMessage('log_message_export_score_to_skill_attack_begin'));

    try {
      // Step 1: ログイン認証
      const loginResponse = await fetch('http://skillattack.com/sa4/dancer_input.php', { method: 'POST', body: params });
      if (!loginResponse.ok) {
        throw new Error(`HTTP status: ${loginResponse.status}`);
      }
      const loginText = await loginResponse.text();
      if (loginText.indexOf('Password invalid') >= 0) {
        Logger.info(I18n.getMessage('log_message_export_score_to_skill_attack_password_invalid'));
        Logger.info(I18n.getMessage('log_message_aborted'));
        return;
      }

      // Step 2: 楽曲マスターデータ取得
      const masterResponse = await fetch('http://skillattack.com/sa4/data/master_music.txt', { cache: 'no-store' });
      if (!masterResponse.ok) {
        throw new Error(`HTTP status: ${masterResponse.status}`);
      }
      Logger.info(I18n.getMessage('log_message_export_score_to_skill_attack_fetch_music_master_success'));
      const skillAttackIndexMap = SkillAttackIndexMap.createFromText(await masterResponse.text());

      // Step 3: プレイヤーのスコアデータ取得
      const scoreResponse = await fetch(`http://skillattack.com/sa4/data/dancer/${ddrcode}/score_${ddrcode}.txt`, { cache: 'no-store' });
      if (!scoreResponse.ok) {
        throw new Error(`HTTP status: ${scoreResponse.status}`);
      }
      Logger.info(I18n.getMessage('log_message_export_score_to_skill_attack_fetch_score_data_success'));
      const skillAttackDataList = new SkillAttackDataList(skillAttackIndexMap);
      skillAttackDataList.applyText(await scoreResponse.text());
      const skillAttackDataListDiff = skillAttackDataList.getDiff(this.musicList, this.scoreList);

      if (skillAttackDataListDiff.count === 0) {
        Logger.info(I18n.getMessage('log_message_export_score_to_skill_attack_no_differences'));
        return;
      }
      Logger.debug(skillAttackDataListDiff);
      Logger.debug(skillAttackDataListDiff.urlSearchParams(ddrcode, password).toString());

      if (this.options.notSendDataToSkillAttack) {
        Logger.info(I18n.getMessage('log_message_done'));
        return;
      }

      // Step 4: スコアデータ送信
      Logger.info(I18n.getMessage('log_message_export_score_to_skill_attack_send_data'));
      const submitResponse = await fetch('http://skillattack.com/sa4/dancer_input.php', {
        method: 'POST',
        body: skillAttackDataListDiff.urlSearchParams(ddrcode, password),
      });
      if (!submitResponse.ok) {
        throw new Error(`HTTP status: ${submitResponse.status}`);
      }
      Logger.info(I18n.getMessage('log_message_done'));
    } catch (reason) {
      Logger.info(I18n.getMessage('log_message_network_error'));
      Logger.debug(reason);
      Logger.info(I18n.getMessage('log_message_aborted'));
    }
  }
}

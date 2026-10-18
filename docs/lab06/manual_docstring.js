'use strict';

/**
 * Phase (a) — гараар бичсэн docstring.
 *
 * Энэ нь SkillSwap-ийн үндсэн session ангийн гараар бичсэн хувилбар.
 * Засварлагдсан текст lib/skillswap-client.js дотор нэгтгэсэн.
 * Жишээ бүр нэг домэйн: Оюунцэцэг (usr_b82e17), Бат-Эрдэнэ (usr_4f2a91),
 * Франц хэл, 2026-10-12 14:00–15:00 (+08), 5 credit.
 *
 * Chinchilla Ch. 7 (consistent example): нэг persona, нэг ур чадвар,
 * нэг цаг, нэг credit. Тайлбар, параметр, буцах утга, алдаа, жишээ
 * бүрд байна.
 */

/**
 * @typedef {object} Session
 * @property {string} session_id
 * @property {string} teacher_id
 * @property {string} learner_id
 * @property {string} skill
 * @property {string} start_time
 * @property {string} end_time
 * @property {number} credits
 * @property {string} status
 * @property {string} proposed_by
 * @property {{teacher: boolean, learner: boolean}} checkins
 * @property {string|null} completed_at
 * @property {object} ratings
 * @property {string|null} flag_id
 */

/**
 * @typedef {object} ProposeSessionInput
 * @property {string} teacherId Заагчийн id. Домэйн: usr_4f2a91.
 * @property {string} skill Ур чадварын нэр. Домэйн: Франц хэл.
 * @property {string} startTime ISO-8601. Домэйн: 2026-10-12T14:00:00+08:00.
 * @property {string} endTime ISO-8601. startTime-аас хойш.
 * @property {number} credits Эерэг бүхэл тоо. Домэйн: 5.
 */

/**
 * @typedef {object} NoShowInput
 * @property {string} absentUserId Ирээгүй оролцогч. Өөрийн id байж болохгүй.
 * @property {string} [comment] Нэмэлт тайлбар.
 */

/**
 * @typedef {object} NoShowResult
 * @property {string} session_id
 * @property {string} status no_show_reported.
 * @property {boolean} absent_user_restricted 30 хоногт 3 дахь мэдэгдэл бол true.
 */

class SkillSwapError extends Error {
  /**
   * @param {number} status
   * @param {string} code
   * @param {string} message
   */
  constructor(status, code, message) {
    super(message);
    this.name = 'SkillSwapError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Session санал, check-in, no-show.
 * Lab 5-ын sample_1_propose_session.py болон sample_2_check_in.py-ийн
 * үргэлжлэл.
 */
class SkillSwapSessionApi {
  /**
   * @param {string} [baseUrl=http://localhost:3000]
   */
  constructor(baseUrl = 'http://localhost:3000') {
    /** @private */
    this.baseUrl = String(baseUrl).replace(/\/$/, '');
    /** @private */
    this.token = '';
  }

  /**
   * @param {string} accessToken
   * @returns {void}
   */
  setToken(accessToken) {
    this.token = accessToken;
  }

  /**
   * Дотоод HTTP туслах. Нийтийн API-д орохгүй.
   * @private
   * @param {string} method
   * @param {string} path
   * @param {object} [body]
   * @returns {Promise<object>}
   */
  async _request(method, path, body) {
    const headers = { Accept: 'application/json' };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json; charset=utf-8';
    }
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new SkillSwapError(
        response.status,
        data.code || 'HTTP_ERROR',
        data.message || response.statusText
      );
    }
    return data;
  }

  /**
   * Суралцагч заагчид skill session санал болгоно.
   *
   * Оюунцэцэг Бат-Эрдэнэд Франц хэлний 1 цагийн хичээлийг 5 credit-ээр
   * санал болгоход ашиглана. Session proposed төлөвт үүснэ. Credit
   * энэ мөчид шилжихгүй. Үлдэгдэл нь credits-ээс багагүй байх ёстой.
   * @param {ProposeSessionInput} input
   * @returns {Promise<Session>} 201. status нь proposed.
   * @throws {SkillSwapError} 400 VALIDATION_ERROR — талбар дутуу, credits бүхэл биш, цаг буруу, teacher_id буруу.
   * @throws {SkillSwapError} 401 UNAUTHORIZED
   * @throws {SkillSwapError} 403 RESTRICTED — 30 хоногт 3 no-show, 7 хоног хаагдсан.
   * @throws {SkillSwapError} 403 INSUFFICIENT_CREDITS — үлдэгдэл хүрэлцэхгүй.
   * @example
   * const session = await client.proposeSession({
   *   teacherId: 'usr_4f2a91',
   *   skill: 'Франц хэл',
   *   startTime: '2026-10-12T14:00:00+08:00',
   *   endTime: '2026-10-12T15:00:00+08:00',
   *   credits: 5
   * });
   * // session.learner_id === 'usr_b82e17'
   * // session.status === 'proposed'
   */
  async proposeSession(input) {
    return this._request('POST', '/sessions', {
      teacher_id: input.teacherId,
      skill: input.skill,
      start_time: input.startTime,
      end_time: input.endTime,
      credits: input.credits
    });
  }

  /**
   * Session-д нэг тал check-in хийнэ.
   *
   * Бат-Эрдэнэ (teacher) болон Оюунцэцэг (learner) тус тусдаа
   * check-in хийсний дараа л status completed болж, 5 credit нэг
   * удаа шилжинэ. Ганц тал 24 цаг өнгөрсөн хойш нөгөө тал check-in
   * хийгээгүй бол status unconfirmed болно. Давхар шилжүүлэг байхгүй.
   * @param {string} sessionId proposeSession-оос авсан session_id.
   * @param {'teacher'|'learner'} role Дуудаж буй хэрэглэгчийн үүрэг.
   * @returns {Promise<Session>} 200. Хоёр дахь check-in дээр status completed.
   * @throws {SkillSwapError} 400 VALIDATION_ERROR — role буруу, эсвэл тухайн role таных биш.
   * @throws {SkillSwapError} 400 INVALID_STATE — session confirmed биш.
   * @throws {SkillSwapError} 401 UNAUTHORIZED
   * @throws {SkillSwapError} 404 NOT_FOUND
   * @throws {SkillSwapError} 409 INSUFFICIENT_CREDITS — шилжүүлэх үед үлдэгдэл хүрэлцэхгүй.
   * @example
   * await teacher.checkIn(session.session_id, 'teacher');
   * const done = await learner.checkIn(session.session_id, 'learner');
   * // done.status === 'completed'
   * // done.credits === 5
   * // done.skill === 'Франц хэл'
   */
  async checkIn(sessionId, role) {
    return this._request(
      'POST',
      `/sessions/${encodeURIComponent(sessionId)}/check-in`,
      { role }
    );
  }

  /**
   * Ирээгүй оролцогчийг no-show гэж мэдээлнэ.
   *
   * Зөвхөн confirmed session дээр, эхэлсэн цагаас хойш, дууссанаас
   * хойш 1 цагийн дотор. 30 хоногт 3 удаа бүртгэгдвэл тухайн хүн
   * 7 хоног шинэ session захиалах эрхгүй болно.
   * @param {string} sessionId
   * @param {NoShowInput} input
   * @returns {Promise<NoShowResult>} 200.
   * @throws {SkillSwapError} 400 VALIDATION_ERROR — absent_user_id нь оролцогч биш, эсвэл өөрөө.
   * @throws {SkillSwapError} 400 INVALID_STATE — confirmed биш.
   * @throws {SkillSwapError} 400 NO_SHOW_TOO_EARLY — session эхлээгүй.
   * @throws {SkillSwapError} 400 NO_SHOW_WINDOW_CLOSED — дууссанаас хойш 1 цаг өнгөрсөн.
   * @throws {SkillSwapError} 401 UNAUTHORIZED
   * @throws {SkillSwapError} 404 NOT_FOUND
   * @example
   * const report = await learner.reportNoShow(session.session_id, {
   *   absentUserId: 'usr_4f2a91',
   *   comment: 'Бат-Эрдэнэ Франц хэлний цагт ирээгүй.'
   * });
   * // report.status === 'no_show_reported'
   */
  async reportNoShow(sessionId, input) {
    return this._request(
      'POST',
      `/sessions/${encodeURIComponent(sessionId)}/no-show`,
      {
        absent_user_id: input.absentUserId,
        comment: input.comment || ''
      }
    );
  }
}

module.exports = { SkillSwapSessionApi, SkillSwapError };

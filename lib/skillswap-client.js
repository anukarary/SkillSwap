'use strict';

/**
 * SkillSwap-ийн public API клиент.
 *
 * Lab 2–5-д хэрэгжүүлсэн REST endpoint-уудыг (бүртгэл, хайлт, session,
 * credit, мессеж, no-show, flag, admin) нэг ангиар дуудна. Жишээ бүр
 * нэг домэйн ашиглана: суралцагч Оюунцэцэг (`usr_b82e17`), заагч
 * Бат-Эрдэнэ (`usr_4f2a91`), ур чадвар «Франц хэл», 2026-10-12
 * 14:00–15:00 (+08), 5 credit.
 *
 * Helper функц `_request` нь public API-д орохгүй. Хэрэглэгч HTTP-г
 * нэрлэсэн методаар дуудна.
 *
 * @example
 * const { SkillSwapClient } = require('./lib/skillswap-client');
 * const client = new SkillSwapClient('http://localhost:3000');
 * const login = await client.login(
 *   'oyuntsetseg@num.edu.mn',
 *   'your_account_password'
 * );
 * client.setToken(login.access_token);
 */

/**
 * @typedef {object} Skill
 * @property {string} name Ур чадварын нэр. Домэйн: Франц хэл.
 * @property {string} category Ангилал. Домэйн: Хэл.
 */

/**
 * @typedef {object} RegisterResult
 * @property {string} user_id
 * @property {string} name
 * @property {string} email
 * @property {Skill[]} skills
 */

/**
 * @typedef {object} LoginResult
 * @property {string} access_token Bearer token. 1 цаг хүчинтэй.
 * @property {string} token_type Үргэлж `Bearer`.
 * @property {number} expires_in Секунд. Сервер 3600 буцаана.
 */

/**
 * @typedef {object} MeResult
 * @property {string} user_id
 * @property {string} name
 * @property {string} email
 * @property {string} role `user` эсвэл `admin`.
 * @property {Skill[]} skills
 * @property {string|null} restricted_until No-show хязгаарлалт дуусах ISO цаг, эсвэл null.
 */

/**
 * @typedef {object} ProfileResult
 * @property {string} user_id
 * @property {string} name
 * @property {Skill[]} skills
 * @property {number|null} avg_rating 1–5, үнэлгээ байхгүй бол null.
 * @property {number} rating_count
 * @property {number} completed_sessions
 * @property {number} no_show_rate 0–1 хоорондох хувь.
 */

/**
 * @typedef {object} SearchHit
 * @property {string} user_id
 * @property {string} name
 * @property {string} skill
 * @property {string} category
 * @property {number|null} avg_rating
 * @property {number} completed_sessions
 * @property {number} no_show_rate
 */

/**
 * @typedef {object} SearchResult
 * @property {SearchHit[]} results avg_rating-аар буурахаар эрэмбэлэгдсэн.
 */

/**
 * @typedef {object} Checkins
 * @property {boolean} teacher
 * @property {boolean} learner
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
 * @property {string} status proposed, confirmed, cancelled, completed, unconfirmed, no_show_reported.
 * @property {string} proposed_by
 * @property {Checkins} checkins
 * @property {string|null} completed_at
 * @property {object} ratings
 * @property {string|null} flag_id
 * @property {string} [teacher_name] Зөвхөн GET /sessions дээр.
 * @property {string} [learner_name] Зөвхөн GET /sessions дээр.
 */

/**
 * @typedef {object} SessionList
 * @property {Session[]} sessions Дуудсан хэрэглэгчийн session-ууд, шинэ нь эхэнд.
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
 * @typedef {object} RespondInput
 * @property {'accept'|'decline'|'counter'} action
 * @property {number} [credits] counter үед шинэ credit.
 * @property {string} [startTime] counter үед шинэ эхлэх цаг.
 * @property {string} [endTime] counter үед шинэ дуусах цаг.
 */

/**
 * @typedef {object} NoShowInput
 * @property {string} absentUserId Ирээгүй оролцогч. Өөрийн id байж болохгүй.
 * @property {string} [comment] Нэмэлт тайлбар.
 */

/**
 * @typedef {object} NoShowResult
 * @property {string} session_id
 * @property {string} status `no_show_reported`.
 * @property {boolean} absent_user_restricted 30 хоногт 3 дахь мэдэгдэл бол true.
 */

/**
 * @typedef {object} RateInput
 * @property {number} stars 1–5 бүхэл тоо.
 * @property {string} [comment]
 */

/**
 * @typedef {object} RateResult
 * @property {string} session_id
 * @property {string} rated_user Үнэлгээ очсон хэрэглэгч.
 * @property {number} stars
 */

/**
 * @typedef {object} ChatMessage
 * @property {string} from
 * @property {string} from_name
 * @property {string} text Хамгийн ихдээ 500 тэмдэгт.
 * @property {string} at ISO-8601.
 */

/**
 * @typedef {object} MessageList
 * @property {ChatMessage[]} messages
 */

/**
 * @typedef {object} FlagResult
 * @property {string} id
 * @property {string} session_id
 * @property {string} raised_by
 * @property {string} reason
 * @property {string} status Нээх үед `open`.
 * @property {number} credits Царцаасан credit.
 */

/**
 * @typedef {object} CreditBalance
 * @property {number} balance Зарцуулж болох credit.
 * @property {number} frozen Flag-аар царцаасан credit.
 */

/**
 * @typedef {object} LedgerEntry
 * @property {string} id
 * @property {string} type transfer, freeze, refund, release.
 * @property {string} session_id
 * @property {string|null} from
 * @property {string|null} to
 * @property {number} credits
 * @property {string} at
 */

/**
 * @typedef {object} LedgerResult
 * @property {LedgerEntry[]} entries Шинэ гүйлгээ эхэнд.
 */

/**
 * @typedef {object} NotificationItem
 * @property {string} id
 * @property {string} user_id
 * @property {string} kind
 * @property {string} message
 * @property {string} send_at
 * @property {string} state `sent` эсвэл `scheduled`.
 */

/**
 * @typedef {object} CalendarEvent
 * @property {string} event_id
 * @property {string} session_id
 * @property {string} title
 * @property {string} start_time
 * @property {string} end_time
 * @property {string[]} attendees
 */

/**
 * @typedef {object} NotificationResult
 * @property {NotificationItem[]} notifications
 * @property {CalendarEvent[]} calendar_events Симуляци хийсэн calendar. Жинхэнэ Google Calendar биш.
 */

/**
 * @typedef {object} WebhookInput
 * @property {string} callbackUrl Зөвхөн https:// URL.
 * @property {string[]} events WEBHOOK_EVENTS-ийн дэд олонлог.
 */

/**
 * @typedef {object} WebhookResult
 * @property {string} webhook_id
 * @property {string} callback_url
 * @property {string[]} events
 */

/**
 * @typedef {object} AdminDashboard
 * @property {object[]} flags Нээлттэй flag-ууд.
 * @property {object[]} no_shows no_show_reported session-ууд.
 * @property {object[]} frozen Царцаасан credit-ууд.
 */

/**
 * @typedef {object} ResolveFlagInput
 * @property {'approve'|'reject'} decision approve бол credit суралцагчид буцна.
 * @property {string} [note] Audit log-д бичигдэх тэмдэглэл.
 */

/**
 * @typedef {object} AuditEntry
 * @property {string} at
 * @property {string} actor
 * @property {string} action
 * @property {string} target
 * @property {string} detail
 */

/**
 * @typedef {object} AuditLogResult
 * @property {AuditEntry[]} entries Шинэ бичлэг эхэнд.
 */

/**
 * Серверийн алдаа. HTTP status, `code`, `message` нь server.js-ийн
 * HttpError хариутай ижил.
 */
class SkillSwapError extends Error {
  /**
   * @param {number} status HTTP төлөв.
   * @param {string} code Жишээ: VALIDATION_ERROR, UNAUTHORIZED, NOT_FOUND.
   * @param {string} message Серверийн монгол мессеж.
   * @param {object} [body] Бүтэн JSON хариу.
   */
  constructor(status, code, message, body) {
    super(message);
    this.name = 'SkillSwapError';
    this.status = status;
    this.code = code;
    this.body = body || null;
  }
}

/**
 * POST /webhooks/subscribe дээр зөвшөөрөгдөх үйл явдал.
 * server.js дахь EVENTS жагсаалттай ижил.
 * @type {readonly string[]}
 */
const WEBHOOK_EVENTS = Object.freeze([
  'session.confirmed',
  'session.completed',
  'session.cancelled',
  'credit.transferred'
]);

/**
 * SkillSwap REST API.
 */
class SkillSwapClient {
  /**
   * @param {string} [baseUrl=http://localhost:3000] Demo серверийн үндэс.
   * @example
   * const client = new SkillSwapClient('http://localhost:3000');
   */
  constructor(baseUrl = 'http://localhost:3000') {
    /**
     * Серверийн үндэс URL, төгсгөлийн slash-гүй.
     * Нийтийн талбар биш: дуудлага бүр өөрийн method-оо ашиглана.
     * @private
     */
    this.baseUrl = String(baseUrl).replace(/\/$/, '');
    /**
     * Bearer token. login-оос хойш setToken-оор тавигдана.
     * @private
     */
    this.token = '';
  }

  /**
   * Дараагийн хүсэлтэд Bearer token тавина.
   * @param {string} accessToken login()-оос авсан access_token.
   * @returns {void}
   * @example
   * client.setToken(login.access_token);
   */
  setToken(accessToken) {
    this.token = accessToken;
  }

  /**
   * HTTP дуудлагын дотоод туслах.
   * Нийтийн API-д оруулаагүй: зам, header, алдаа задлах нь клиентийн
   * дотоод хэрэгсэл. Гаднаас endpoint-ийг нэрлэсэн методаар дуудна.
   * @private
   * @param {string} method HTTP method.
   * @param {string} path Зам, query-тэй байж болно.
   * @param {object} [body] JSON body. GET дээр өгөхгүй.
   * @returns {Promise<object>}
   */
  async _request(method, path, body) {
    /** @type {Record<string, string>} */
    const headers = { Accept: 'application/json' };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json; charset=utf-8';
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });

    const text = await response.text();
    /** @type {{ code?: string, message?: string }} */
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      throw new SkillSwapError(
        response.status,
        data.code || 'HTTP_ERROR',
        data.message || response.statusText,
        data
      );
    }

    return data;
  }

  /**
   * Шинэ хэрэглэгч бүртгэнэ.
   * Нэр, утас, имэйл, нууц үг заавал. Ур чадвар заавал биш.
   * Нууц үг хамгийн багадаа 8 тэмдэгт. Давхардсан имэйлдаас татгалзана.
   * @param {object} input
   * @param {string} input.name Харагдах нэр.
   * @param {string} input.phone Утас.
   * @param {string} input.email Имэйл.
   * @param {string} input.password Хамгийн багадаа 8 тэмдэгт.
   * @param {Skill[]} [input.skills] Заах ур чадвар.
   * @returns {Promise<RegisterResult>} 201.
   * @throws {SkillSwapError} 400 VALIDATION_ERROR — талбар дутуу, нууц үг богино, имэйл бүртгэлтэй.
   * @example
   * const created = await client.register({
   *   name: 'Оюунцэцэг',
   *   phone: '99112233',
   *   email: 'oyuntsetseg.new@num.edu.mn',
   *   password: 'your_account_password',
   *   skills: []
   * });
   */
  async register(input) {
    return this._request('POST', '/auth/register', {
      name: input.name,
      phone: input.phone,
      email: input.email,
      password: input.password,
      skills: input.skills || []
    });
  }

  /**
   * Нэвтэрч JWT access token авна.
   * Хариунд хэрэглэгчийн объект байхгүй. Зөвхөн token байна.
   * @param {string} email Домэйн: oyuntsetseg@num.edu.mn.
   * @param {string} password Demo нууц үг: your_account_password.
   * @returns {Promise<LoginResult>} 200.
   * @throws {SkillSwapError} 400 VALIDATION_ERROR — email эсвэл password дутуу.
   * @throws {SkillSwapError} 401 UNAUTHORIZED — имэйл эсвэл нууц үг буруу.
   * @example
   * const login = await client.login(
   *   'oyuntsetseg@num.edu.mn',
   *   'your_account_password'
   * );
   * client.setToken(login.access_token);
   */
  async login(email, password) {
    return this._request('POST', '/auth/login', { email, password });
  }

  /**
   * Одоогийн token-ы хэрэглэгчийг буцаана.
   * @returns {Promise<MeResult>} 200.
   * @throws {SkillSwapError} 401 UNAUTHORIZED — token байхгүй эсвэл хүчингүй.
   * @example
   * const me = await client.me();
   * // me.user_id === 'usr_b82e17'
   * // me.name === 'Оюунцэцэг'
   */
  async me() {
    return this._request('GET', '/me');
  }

  /**
   * Session товлохоос өмнө нөгөө талын үнэлгээ, дууссан session,
   * no-show хувийг нэг хариунд авна.
   * @param {string} userId Домэйн: usr_4f2a91 (Бат-Эрдэнэ).
   * @returns {Promise<ProfileResult>} 200.
   * @throws {SkillSwapError} 401 UNAUTHORIZED
   * @throws {SkillSwapError} 404 NOT_FOUND — хэрэглэгч байхгүй.
   * @example
   * const profile = await client.getProfile('usr_4f2a91');
   * // profile.name === 'Бат-Эрдэнэ'
   * // profile.skills[0].name === 'Франц хэл'
   */
  async getProfile(userId) {
    return this._request('GET', `/users/${encodeURIComponent(userId)}/profile`);
  }

  /**
   * Ур чадвар, ангилал, хамгийн бага үнэлгээ, боломжит цагаар заагч хайна.
   * skill эсвэл category-ийн аль нэг заавал. Үр дүн үнэлгээгээр буурна.
   * Админ болон өөрөө хайлтад орохгүй.
   * @param {object} query
   * @param {string} [query.skill] Нэрийн дэд мөр. Домэйн: Франц хэл.
   * @param {string} [query.category] Яг таарах ангилал. Домэйн: Хэл.
   * @param {number} [query.minRating] 0–5. Домэйн: 4.
   * @param {string} [query.availableFrom] ISO-8601. Домэйн: 2026-10-12T14:00:00+08:00.
   * @returns {Promise<SearchResult>} 200.
   * @throws {SkillSwapError} 400 VALIDATION_ERROR — skill болон category хоёул хоосон, min_rating мужийн гадна, огноо буруу.
   * @throws {SkillSwapError} 401 UNAUTHORIZED
   * @example
   * const found = await client.searchSkills({
   *   skill: 'Франц хэл',
   *   category: 'Хэл',
   *   minRating: 4,
   *   availableFrom: '2026-10-12T14:00:00+08:00'
   * });
   * // found.results[0].user_id === 'usr_4f2a91'
   */
  async searchSkills(query) {
    const params = new URLSearchParams();
    if (query.skill) params.set('skill', query.skill);
    if (query.category) params.set('category', query.category);
    if (query.minRating != null) params.set('min_rating', String(query.minRating));
    if (query.availableFrom) params.set('available_from', query.availableFrom);
    return this._request('GET', `/skills/search?${params.toString()}`);
  }

  /**
   * Миний оролцсон session-уудыг буцаана.
   * @returns {Promise<SessionList>} 200.
   * @throws {SkillSwapError} 401 UNAUTHORIZED
   * @example
   * const mine = await client.listSessions();
   */
  async listSessions() {
    return this._request('GET', '/sessions');
  }

  /**
   * Суралцагч заагчид skill session санал болгоно.
   *
   * Оюунцэцэг Бат-Эрдэнэд Франц хэлний 1 цагийн хичээлийг 5 credit-ээр
   * санал болгоход ашиглана. Session `proposed` төлөвт үүснэ. Credit
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
   * Санал хүлээн авсан тал зөвшөөрөх, татгалзах, эсвэл counter хийнэ.
   * Санал тавьсан хүн өөрөө хариулж болохгүй. accept хийвэл session
   * confirmed болж, сануулга болон calendar симуляци үүснэ.
   * @param {string} sessionId
   * @param {RespondInput} input
   * @returns {Promise<Session>} 200.
   * @throws {SkillSwapError} 400 INVALID_STATE — proposed биш, эсвэл санал тавьсан хүн нь өөрөө.
   * @throws {SkillSwapError} 400 VALIDATION_ERROR — action эсвэл counter талбар буруу.
   * @throws {SkillSwapError} 401 UNAUTHORIZED
   * @throws {SkillSwapError} 403 INSUFFICIENT_CREDITS — accept үед суралцагчийн үлдэгдэл хүрэхгүй.
   * @throws {SkillSwapError} 404 NOT_FOUND
   * @example
   * // Бат-Эрдэнийн token-оор
   * const confirmed = await teacher.respond(session.session_id, {
   *   action: 'accept'
   * });
   * // confirmed.status === 'confirmed'
   */
  async respond(sessionId, input) {
    /** @type {{ action: string, credits?: number, start_time?: string, end_time?: string }} */
    const body = { action: input.action };
    if (input.credits != null) body.credits = input.credits;
    if (input.startTime) body.start_time = input.startTime;
    if (input.endTime) body.end_time = input.endTime;
    return this._request(
      'POST',
      `/sessions/${encodeURIComponent(sessionId)}/respond`,
      body
    );
  }

  /**
   * proposed эсвэл confirmed session-ыг цуцална.
   * Calendar симуляци дээрх event хамт устана.
   * @param {string} sessionId
   * @returns {Promise<Session>} 200. status нь cancelled.
   * @throws {SkillSwapError} 400 INVALID_STATE — цуцлах төлөвт биш.
   * @throws {SkillSwapError} 401 UNAUTHORIZED
   * @throws {SkillSwapError} 404 NOT_FOUND
   * @example
   * const cancelled = await client.cancel(session.session_id);
   * // cancelled.skill === 'Франц хэл'
   * // cancelled.status === 'cancelled'
   */
  async cancel(sessionId) {
    return this._request(
      'POST',
      `/sessions/${encodeURIComponent(sessionId)}/cancel`
    );
  }

  /**
   * Session-д нэг тал check-in хийнэ.
   *
   * Бат-Эрдэнэ (`teacher`) болон Оюунцэцэг (`learner`) тус тусдаа
   * check-in хийсний дараа л status `completed` болж, 5 credit нэг
   * удаа шилжинэ. Ганц тал 24 цаг өнгөрсөн хойш check-in хийгээгүй
   * хэвээр байвал status `unconfirmed` болно. Давхар шилжүүлэг байхгүй.
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

  /**
   * Дууссан session дээр нөгөө талыг 1–5 одоор үнэлнэ.
   * Нэг хэрэглэгч нэг session-д нэг л удаа үнэлнэ.
   * @param {string} sessionId
   * @param {RateInput} input
   * @returns {Promise<RateResult>} 200.
   * @throws {SkillSwapError} 400 VALIDATION_ERROR — stars 1–5 бүхэл биш.
   * @throws {SkillSwapError} 400 INVALID_STATE — session completed биш.
   * @throws {SkillSwapError} 400 ALREADY_RATED
   * @throws {SkillSwapError} 401 UNAUTHORIZED
   * @throws {SkillSwapError} 404 NOT_FOUND
   * @example
   * const rating = await learner.rate(session.session_id, {
   *   stars: 5,
   *   comment: 'Бат-Эрдэнэ Франц хэлний цагийг тодорхой заасан.'
   * });
   * // rating.rated_user === 'usr_4f2a91'
   */
  async rate(sessionId, input) {
    return this._request(
      'POST',
      `/sessions/${encodeURIComponent(sessionId)}/rate`,
      {
        stars: input.stars,
        comment: input.comment || ''
      }
    );
  }

  /**
   * Session-ы мессежүүдийг авна. Зөвхөн оролцогч уншина.
   * @param {string} sessionId
   * @returns {Promise<MessageList>} 200.
   * @throws {SkillSwapError} 401 UNAUTHORIZED
   * @throws {SkillSwapError} 404 NOT_FOUND
   * @example
   * const box = await client.listMessages(session.session_id);
   */
  async listMessages(sessionId) {
    return this._request(
      'GET',
      `/sessions/${encodeURIComponent(sessionId)}/messages`
    );
  }

  /**
   * Session дотор мессеж илгээнэ. Текст 500 тэмдэгтээр таслагдана.
   * @param {string} sessionId
   * @param {string} text Домэйн: Франц хэлний цагийг 14:00 цагт баталгаажуулъя.
   * @returns {Promise<ChatMessage>} 201.
   * @throws {SkillSwapError} 400 VALIDATION_ERROR — text дутуу.
   * @throws {SkillSwapError} 401 UNAUTHORIZED
   * @throws {SkillSwapError} 404 NOT_FOUND
   * @example
   * const message = await client.postMessage(
   *   session.session_id,
   *   'Франц хэлний цагийг 14:00 цагт баталгаажуулъя.'
   * );
   * // message.from === 'usr_b82e17'
   */
  async postMessage(sessionId, text) {
    return this._request(
      'POST',
      `/sessions/${encodeURIComponent(sessionId)}/messages`,
      { text }
    );
  }

  /**
   * Дууссанаас хойш 72 цагийн дотор credit маргаан нээж, заагчийн
   * credit-ийг царцаана. Нэг session-д нэг flag.
   * @param {string} sessionId
   * @param {string} reason Домэйн: Тохирсон 5 credit биш өөр дүн нэхсэн.
   * @returns {Promise<FlagResult>} 201.
   * @throws {SkillSwapError} 400 VALIDATION_ERROR — reason дутуу.
   * @throws {SkillSwapError} 400 INVALID_STATE — session completed биш.
   * @throws {SkillSwapError} 400 FLAG_WINDOW_CLOSED — 72 цаг өнгөрсөн.
   * @throws {SkillSwapError} 400 ALREADY_FLAGGED
   * @throws {SkillSwapError} 401 UNAUTHORIZED
   * @throws {SkillSwapError} 404 NOT_FOUND
   * @example
   * const flag = await learner.flagSession(
   *   session.session_id,
   *   'Тохирсон 5 credit биш өөр дүн нэхсэн.'
   * );
   * // flag.status === 'open'
   * // flag.credits === 5
   */
  async flagSession(sessionId, reason) {
    return this._request(
      'POST',
      `/sessions/${encodeURIComponent(sessionId)}/flag`,
      { reason }
    );
  }

  /**
   * Миний credit үлдэгдэл болон царцаасан дүнг буцаана.
   * @returns {Promise<CreditBalance>} 200.
   * @throws {SkillSwapError} 401 UNAUTHORIZED
   * @example
   * const wallet = await client.getBalance();
   * // Оюунцэцэгийн анхны үлдэгдэл 25
   */
  async getBalance() {
    return this._request('GET', '/credits/balance');
  }

  /**
   * Миний credit гүйлгээний түүх.
   * @returns {Promise<LedgerResult>} 200.
   * @throws {SkillSwapError} 401 UNAUTHORIZED
   * @example
   * const history = await client.getLedger();
   */
  async getLedger() {
    return this._request('GET', '/credits/ledger');
  }

  /**
   * Сануулга болон симуляци calendar event-үүдийг буцаана.
   * Жинхэнэ FCM, Google Calendar руу холбогдохгүй.
   * @returns {Promise<NotificationResult>} 200.
   * @throws {SkillSwapError} 401 UNAUTHORIZED
   * @example
   * const inbox = await client.listNotifications();
   */
  async listNotifications() {
    return this._request('GET', '/notifications');
  }

  /**
   * Session үйл явдлын webhook бүртгэнэ.
   * callback URL зөвхөн HTTPS. events нь WEBHOOK_EVENTS-ээс байна.
   * @param {WebhookInput} input
   * @returns {Promise<WebhookResult>} 201.
   * @throws {SkillSwapError} 400 VALIDATION_ERROR — URL нь https биш, эсвэл event танихгүй.
   * @throws {SkillSwapError} 401 UNAUTHORIZED
   * @example
   * const hook = await client.subscribeWebhook({
   *   callbackUrl: 'https://oyuntsetseg.num.edu.mn/hooks/skillswap',
   *   events: ['session.confirmed', 'credit.transferred']
   * });
   */
  async subscribeWebhook(input) {
    return this._request('POST', '/webhooks/subscribe', {
      callback_url: input.callbackUrl,
      events: input.events
    });
  }

  /**
   * Админы самбар: нээлттэй flag, no-show, царцаасан credit.
   * Зөвхөн role=admin. Домэйн админ: Тэмүүлэн, temuulen@num.edu.mn.
   * @returns {Promise<AdminDashboard>} 200.
   * @throws {SkillSwapError} 401 UNAUTHORIZED
   * @throws {SkillSwapError} 403 FORBIDDEN — админ биш.
   * @example
   * const board = await admin.adminDashboard();
   */
  async adminDashboard() {
    return this._request('GET', '/admin/dashboard');
  }

  /**
   * Нээлттэй flag-ыг approve эсвэл reject хийнэ.
   * approve бол царцаасан credit суралцагчид буцна. reject бол заагчид суллагдана.
   * @param {string} flagId flagSession-оос авсан id.
   * @param {ResolveFlagInput} input
   * @returns {Promise<FlagResult>} 200. status нь upheld эсвэл rejected.
   * @throws {SkillSwapError} 400 VALIDATION_ERROR — decision буруу.
   * @throws {SkillSwapError} 401 UNAUTHORIZED
   * @throws {SkillSwapError} 403 FORBIDDEN
   * @throws {SkillSwapError} 404 NOT_FOUND — нээлттэй flag байхгүй.
   * @example
   * const closed = await admin.resolveFlag(flag.id, {
   *   decision: 'approve',
   *   note: 'Франц хэлний 5 credit-ийн маргааныг суралцагчийн талд шийдсэн.'
   * });
   */
  async resolveFlag(flagId, input) {
    return this._request(
      'POST',
      `/admin/flags/${encodeURIComponent(flagId)}/resolve`,
      {
        decision: input.decision,
        note: input.note || ''
      }
    );
  }

  /**
   * Админы audit log. Шинэ бичлэг эхэнд.
   * @returns {Promise<AuditLogResult>} 200.
   * @throws {SkillSwapError} 401 UNAUTHORIZED
   * @throws {SkillSwapError} 403 FORBIDDEN
   * @example
   * const log = await admin.auditLog();
   */
  async auditLog() {
    return this._request('GET', '/admin/audit-log');
  }
}

module.exports = {
  SkillSwapClient,
  SkillSwapError,
  WEBHOOK_EVENTS
};

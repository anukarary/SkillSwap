'use strict';

/**
 * AI-ийн үүсгэсэн docstring 
 *
 * Энэ файлыг кодонд нэгтгээгүй. Bhatti аудитаар зассан хувилбар нь
 * manual_docstring.js болон lib/skillswap-client.js дээр байна.
 * Доорх зохиосон method, type-уудыг test_ai_hallucinations.js барина.
 */

/**
 * @typedef {object} InstantPayout
 * @property {string} payout_id Шууд шилжүүлгийн id. Сервер дээр ийм талбар байхгүй.
 * @property {number} credits
 * @property {string} settled_at
 */

/**
 * @typedef {object} GeoMatch
 * @property {string} user_id
 * @property {number} meters Байршлаар ойрхон заагч. API дээр байршил байхгүй.
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
 * Session API. Бүх эцсийн хэрэглэгчдэд зөв, найдвартай ажиллахыг
 * баталгаажуулах үүднээс (гэхдээ үүгээр хязгаарлагдахгүй) session-той
 * холбоотой боломжит үйлдлүүдийг агуулна.
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
   * Create a session proposal for any skill.
   *
   * Assuming all of the aforementioned conditions are met, including but
   * not limited to a valid account, this endpoint posts to
   * `/sessions/propose` and returns a receipt with calendar_event_id.
   * Credits move to the teacher immediately.
   * @param {object} input
   * @param {string} input.teacherId for example test
   * @param {string} input.skill for example foo
   * @param {string} input.startTime
   * @param {string} input.endTime
   * @param {number} input.credits
   * @returns {Promise<object>} 201 with calendar_event_id and skill_id.
   * @throws {Error} something went wrong
   * @example
   * await client.proposeSession({
   *   teacherId: 'test',
   *   skill: 'foo',
   *   startTime: '2020-01-01T00:00:00Z',
   *   endTime: '2020-01-01T01:00:00Z',
   *   credits: 1
   * });
   */
  async proposeSession(input) {
    return this._request('POST', '/sessions/propose', input);
  }

  /**
   * Check in. The first caller settles credits and receives HTTP 204.
   * @param {string} sessionId
   * @param {string} role teacher, learner, or observer
   * @returns {Promise<void>} 204 No Content.
   * @throws {Error} if the session does not exist
   * @example
   * await client.checkIn('ses_test', 'observer');
   */
  async checkIn(sessionId, role) {
    return this._request(
      'POST',
      `/sessions/${encodeURIComponent(sessionId)}/check-in`,
      { role }
    );
  }

  /**
   * Report a no-show any time within 24 hours, including but not limited
   * to before the session starts.
   * @param {string} sessionId
   * @param {object} input
   * @param {string} input.absentUserId
   * @returns {Promise<object>}
   * @throws {Error} generic failure
   * @example
   * await client.reportNoShow('ses_test', { absentUserId: 'user123' });
   */
  async reportNoShow(sessionId, input) {
    return this._request(
      'POST',
      `/sessions/${encodeURIComponent(sessionId)}/no-show`,
      input
    );
  }

  /**
   * Credit-ийг check-in хүлээлгүй шууд шилжүүлнэ.
   * Зохиосон API: server.js дээр ийм method, endpoint байхгүй.
   * @param {string} sessionId
   * @returns {Promise<InstantPayout>}
   * @example
   * const payout = await client.instantSettle('ses_test');
   */
  async instantSettle(sessionId) {
    return this._request(
      'POST',
      `/sessions/${encodeURIComponent(sessionId)}/instant-settle`
    );
  }

  /**
   * Заагчийг өргөрөг, уртрагаар ойртуулж олно.
   * Зохиосон API: хайлт зөвхөн skill, category, min_rating, available_from.
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<GeoMatch[]>}
   * @example
   * await client.matchByLocation(47.92, 106.91);
   */
  async matchByLocation(latitude, longitude) {
    return this._request(
      'GET',
      `/skills/nearby?lat=${latitude}&lng=${longitude}`
    );
  }

  /**
   * Session-ы төлбөрийн баримт татна.
   * Зохиосон API: GET /sessions/{id}/receipt байхгүй.
   * @param {string} sessionId
   * @returns {Promise<InstantPayout>}
   * @example
   * await client.getReceipt('ses_test');
   */
  async getReceipt(sessionId) {
    return this._request(
      'GET',
      `/sessions/${encodeURIComponent(sessionId)}/receipt`
    );
  }
}

module.exports = {
  SkillSwapSessionApi,
  SkillSwapError
};

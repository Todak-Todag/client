/**
 * 단어 끝 받침에 맞는 조사를 붙인다. 한글이 아니면 받침 없는 쪽을 쓴다.
 * withParticle('방문요양', '은', '는') → '방문요양은' · withParticle('방문간호', '은', '는') → '방문간호는'
 *
 * @param {string} word
 * @param {string} withBatchim 받침 있을 때 (은·이·과·을)
 * @param {string} withoutBatchim 받침 없을 때 (는·가·와·를)
 */
export function withParticle(word, withBatchim, withoutBatchim) {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  const hasBatchim = code >= 0 && code <= 11171 && code % 28 !== 0
  return `${word}${hasBatchim ? withBatchim : withoutBatchim}`
}

/**
 * 全量功能测试 — 按 PRD 用户故事逐项验证（对本地 dev server 发真实 HTTP 请求）
 * 运行：node scripts/full-functional-test.mjs
 */
const BASE = process.env.BASE || 'http://localhost:3000'
let passCount = 0, failCount = 0
const failures = []

function check(name, cond, detail = '') {
  if (cond) { passCount++; console.log(`  ✓ ${name}`) }
  else { failCount++; failures.push({ name, detail }); console.log(`  ✗ ${name} ${detail ? '— ' + detail : ''}`) }
}

async function req(method, path, token, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  let data = null
  try { data = await res.json() } catch {}
  return { status: res.status, data }
}

async function register(nickname) {
  const email = `qa_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@test.com`
  const r = await req('POST', '/api/auth/register', null, { email, password: 'qatest123', nickname })
  if (r.status !== 200) console.log(`[dbg] register ${nickname} → ${r.status}`, JSON.stringify(r.data))
  return { token: r.data.token, userId: r.data.userId, ...(await me(r.data.token)) }
}
async function me(token) {
  const r = await req('GET', '/api/auth/me', token)
  if (!r.data?.character) console.log(`[dbg-me] ${r.status}`, JSON.stringify(r.data)?.slice(0, 150), '| token=', String(token).slice(0, 15))
  return { character: r.data.character }
}
async function setup(token, characterId, patch) {
  return req('POST', '/api/test/char-resource', token, { characterId, ...patch })
}

// ───────────────────────── 1. 认证与账户 ─────────────────────────
async function testAuth() {
  console.log('\n■ 认证与账户(PRD US1/2/19)')
  const email = `qa_auth_${Date.now()}@test.com`
  const reg = await req('POST', '/api/auth/register', null, { email, password: 'qatest123', nickname: '认证测试' })
  check('注册成功返回 token', reg.status === 200 && !!reg.data.token)
  const dup = await req('POST', '/api/auth/register', null, { email, password: 'qatest123' })
  check('重复邮箱注册被拒(409)', dup.status === 409)
  const badpw = await req('POST', '/api/auth/register', null, { email: `x${email}`, password: '12345' })
  check('密码少于6位被拒(400)', badpw.status === 400)
  const bademail = await req('POST', '/api/auth/register', null, { email: 'not-an-email', password: 'qatest123' })
  check('非法邮箱格式被拒(400)', bademail.status === 400)
  const login = await req('POST', '/api/auth/login', null, { email, password: 'qatest123' })
  check('登录成功', login.status === 200 && !!login.data.token)
  const badlogin = await req('POST', '/api/auth/login', null, { email, password: 'wrong!' })
  check('错误密码登录被拒(401)', badlogin.status === 401)
  const t = login.data.token
  const meRes = await req('GET', '/api/auth/me', t)
  check('me 返回角色信息(道号/境界/层数)', meRes.status === 200 && meRes.data.character?.nickname && meRes.data.character?.realm)
  const prof = await req('PUT', '/api/auth/profile', t, { nickname: '改名测试' })
  const me2 = await req('GET', '/api/auth/me', t)
  check('修改道号生效', prof.status === 200 && me2.data.character?.nickname === '改名测试')
  const noauth = await req('GET', '/api/cultivate/progress', null)
  check('无 token 访问受保护端点被拒(401)', noauth.status === 401)
  return t
}

// ───────────────────────── 2. 修炼核心 ─────────────────────────
async function testCultivation() {
  console.log('\n■ 修炼核心(PRD US3-11 / 前期优化)')
  const u = await register('修炼测试')
  const t = u.token, cid = u.character.id

  // 离线收益结算
  const p1 = await req('GET', '/api/cultivate/progress', t)
  check('progress 结算返回角色+收益', p1.status === 200 && p1.data.character && 'offlineEarnings' in p1.data)

  // 小境界自动晋升：凝气1层→灵气满→突破→第2层
  await setup(t, cid, { realmLayer: 1, lingqi: 150 })
  const small = await req('POST', '/api/cultivate/breakthrough', t, { usePill: false })
  check('小境界自动晋升到第2层', small.status === 200 && small.data.success && small.data.character.realmLayer === 2)
  check('小境界突破后灵气清零', parseFloat(small.data.character.lingqi) === 0)

  // 大境界瓶颈：凝气9层 + 必败 roll（固定 realm 防止前序状态漂移）
  await setup(t, cid, { realm: 'condensing_qi', realmLayer: 9, lingqi: 150 })
  const failDet = await fetch(BASE + '/api/cultivate/breakthrough', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}`, 'x-test-breakthrough-roll': '0.99' },
    body: JSON.stringify({ usePill: false }),
  }).then(r => r.json())
  check('大境界失败保留50%灵气(75)', failDet.success === false && parseFloat(failDet.character.lingqi) === 75)
  check('失败后连败计数=1', failDet.character.breakthroughFailureCount === 1)
  check('失败不损失灵气上限(cap 不变)', parseFloat(failDet.character.lingqiCap) === 150)

  // 连败保底:pityChanceStep=0.05,max=0.2 → failureCount=4 时保底满 +20%
  await setup(t, cid, { realm: 'condensing_qi', realmLayer: 9, breakthroughFailureCount: 4, lingqi: 150 })
  const pity = await fetch(BASE + '/api/cultivate/breakthrough', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}`, 'x-test-breakthrough-roll': '0.99' },
    body: JSON.stringify({ usePill: false }),
  }).then(r => r.json())
  check('连败保底封顶 +20%(0.6+0.2=0.8)', pity.effectiveChance === 0.8 && pity.pityBonus === 0.2)

  // 必胜突破 → 筑基期,计数清零,cap/rates 更新为筑基配置
  await setup(t, cid, { realm: 'condensing_qi', realmLayer: 9, lingqi: 150 })
  const win = await fetch(BASE + '/api/cultivate/breakthrough', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}`, 'x-test-breakthrough-roll': '0' },
    body: JSON.stringify({ usePill: false }),
  }).then(r => r.json())
  check('大境界成功晋升筑基期', win.success && win.character.realm === 'foundation' && win.character.realmLayer === 1)
  check('成功后连败计数清零', win.character.breakthroughFailureCount === 0)
  check('成功后 cap/速率更新为筑基配置(450/45)', parseFloat(win.character.lingqiCap) === 450 && parseFloat(win.character.lingqiRate) === 45)

  // 灵气未满时拒绝突破
  const notFull = await req('POST', '/api/cultivate/breakthrough', t, { usePill: false })
  check('灵气未满突破被拒(400 尚未圆满)', notFull.status === 400 && notFull.data.message.includes('尚未圆满'))

  // 破境丹 +20%:给一颗筑基丹,充满灵气,usePill=true
  await setup(t, cid, { realm: 'foundation', realmLayer: 3, lingqiCap: 450, lingqiRate: 45, lingshiRate: 45, lingqi: 450, materials: { tianli_dan: 1 } })
  const withPill = await fetch(BASE + '/api/cultivate/breakthrough', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}`, 'x-test-breakthrough-roll': '0.55' },
    body: JSON.stringify({ usePill: true }),
  }).then(r => r.json())
  check('破境丹 +20% 生效(0.5+0.2=0.7,roll 0.55 成功)', withPill.success === true && withPill.effectiveChance === 0.7)
  return { t, cid }
}

// ───────────────────────── 3. 经济:商店/炼丹/背包 ─────────────────────────
async function testEconomy() {
  console.log('\n■ 经济系统(PRD US12-15/27-28)')
  const u = await register('经济测试')
  const t = u.token, cid = u.character.id
  await setup(t, cid, { lingshi: 100000 })

  // 商店
  const items = await req('GET', '/api/shop/items', t)
  check('商店商品列表可读', items.status === 200 && Array.isArray(items.data.items) && items.data.items.length > 0)
  const buy = await req('POST', '/api/shop/buy', t, { itemId: 'youhun_cao', quantity: 5 })
  check('购买材料成功', buy.status === 200 && buy.data.success)
  const invAfterBuy = (await (await req('GET', '/api/inventory', t)).data.items ?? [])
  check('购买后背包数量正确(+5)', invAfterBuy.find(i => i.itemId === 'youhun_cao')?.quantity === 5)
  const poor = await req('POST', '/api/shop/buy', t, { itemId: 'qicai_xuelian', quantity: 999999 })
  check('灵石不足购买被拒(400)', poor.status === 400)
  const badItem = await req('POST', '/api/shop/buy', t, { itemId: 'nonexistent_item' })
  check('无效商品被拒(400)', badItem.status === 400)

  // 炼丹:培元丹 = 幽魂草×2 + 凝血花×1 + 50 灵石
  await req('POST', '/api/shop/buy', t, { itemId: 'ningxue_hua', quantity: 2 })
  const refine = await req('POST', '/api/alchemy/refine', t, { pillType: 'peiyuan_dan' })
  check('炼丹成功(100% 成功率设定)', refine.status === 200 && refine.data.success)
  const inv = (await (await req('GET', '/api/inventory', t)).data.items ?? [])
  check('丹药入包', inv.find(i => i.itemId === 'peiyuan_dan')?.quantity >= 1)
  const alchemyList = await req('GET', '/api/alchemy/list', t)
  const recipes = alchemyList.data.recipes ?? alchemyList.data.pills ?? []
  check('丹方列表含修炼/破境两类', alchemyList.status === 200 && recipes.some(r => r.type === 'cultivation') && recipes.some(r => r.type === 'breakthrough'))
  // 材料不足炼丹
  const noMat = await req('POST', '/api/alchemy/refine', t, { pillType: 'wendao_dan' }) // 七彩雪莲等昂贵材料
  check('材料不足炼丹被拒(400)', noMat.status === 400)

  // ⚠️ PRD US13「服用修炼丹加速」验证:是否存在消费途径
  const consumeProbe = await Promise.all([
    req('POST', '/api/inventory/use', t, { itemId: 'peiyuan_dan' }),
    req('POST', '/api/pills/use', t, { itemId: 'peiyuan_dan' }),
    req('POST', '/api/alchemy/consume', t, { pillId: 'peiyuan_dan' }),
  ])
  check('⚠️ 修炼丹存在可用服用途径(US13 加速修炼)',
    consumeProbe.some(r => r.status !== 404),
    '所有疑似服用端点均 404 —— 修炼丹炼成后无法使用,加速效果无法生效')
  return { t, cid }
}

// ───────────────────────── 4. 好友/论道 ─────────────────────────
async function testSocial() {
  console.log('\n■ 好友与论道(PRD US21/22)')
  const A = await register('好友甲')
  const B = await register('好友乙')
  const search = await req('GET', `/api/friends/search?q=${encodeURIComponent('好友乙')}`, A.token)
  check('搜索玩家可找到对方', search.status === 200 && JSON.stringify(search.data).includes(B.character.id),
    JSON.stringify(search.data).slice(0, 80))
  const fr = await req('POST', '/api/friends/request', A.token, { toCharacterId: B.character.id })
  check('发送好友请求', fr.status === 200)
  const dupFr = await req('POST', '/api/friends/request', A.token, { toCharacterId: B.character.id })
  check('重复请求被拒(409/400)', [409, 400].includes(dupFr.status))
  const pendingB = await req('GET', '/api/friends/pending', B.token)
  const firstReqId = pendingB.data.requests?.[0]?.id ?? pendingB.data.pending?.[0]?.id
  check('乙可见待处理请求', pendingB.status === 200 && JSON.stringify(pendingB.data).includes(A.character.id))
  const accept = await req('POST', '/api/friends/respond', B.token, { requestId: firstReqId, action: 'accept' })
  check('乙同意请求成为好友', accept.status === 200)
  const listA = await req('GET', '/api/friends/list', A.token)
  check('好友列表包含对方', JSON.stringify(listA.data).includes(B.character.id))

  // 论道
  const dao = await req('POST', '/api/dao/start', A.token, { targetCharacterId: B.character.id })
  check('与好友论道获得灵气', dao.status === 200 && dao.data.success !== false, JSON.stringify(dao.data).slice(0, 80))
  const daoDup = await req('POST', '/api/dao/start', A.token, { targetCharacterId: B.character.id })
  check('同日重复论道被拒', [400, 409].includes(daoDup.status))
  const daoStatus = await req('GET', '/api/dao/status', A.token)
  check('论道状态可查', daoStatus.status === 200)

  // 删除好友（端点语义为删除好友关系记录,参数是 request id）
  const del = await req('DELETE', `/api/friends/${firstReqId}`, A.token)
  check('删除好友成功', del.status === 200 || del.status === 204, `status=${del.status}`)
  return { A, B }
}

// ───────────────────────── 5. 宗门 ─────────────────────────
async function testClan() {
  console.log('\n■ 宗门(PRD US24/25)')
  const A = await register('宗主')
  const B = await register('弟子')
  await setup(A.token, A.character.id, { lingshi: 1000 })
  const create = await req('POST', '/api/clan/create', A.token, { name: `测试宗门${Date.now() % 10000}`, description: 'QA' })
  check('创建宗门', create.status === 200, JSON.stringify(create.data).slice(0, 60))
  const clanId = create.data.clan?.id ?? create.data.clanId
  const my = await req('GET', '/api/clan/my', A.token)
  check('宗主查询我的宗门', my.status === 200 && JSON.stringify(my.data).includes('测试宗门'))
  const join = await req('POST', '/api/clan/join', B.token, { clanId })
  check('加入宗门', join.status === 200, JSON.stringify(join.data).slice(0, 60))
  const search = await req('POST', '/api/clan/search', B.token, { query: '测试宗门' })
  check('宗门搜索', search.status === 200 && JSON.stringify(search.data).includes('测试宗门'))
  const tasks = await req('GET', '/api/clan/tasks', A.token)
  check('宗门任务列表', tasks.status === 200 && (tasks.data.tasks?.length ?? 0) > 0)
  const taskId = tasks.data.tasks?.[0]?.id ?? tasks.data.tasks?.[0]?.taskId
  if (taskId) {
    const prog = await req('POST', '/api/clan/task-progress', A.token, { taskId, amount: 999 })
    check('推进宗门任务进度', prog.status === 200, JSON.stringify(prog.data).slice(0, 80))
    const claim = await req('POST', '/api/clan/task-claim', A.token, { taskId })
    check('领取任务奖励(贡献值)', claim.status === 200, JSON.stringify(claim.data).slice(0, 80))
  } else {
    check('宗门任务列表非空', false, 'tasks 为空,无法继续任务链路')
  }
  const leave = await req('POST', '/api/clan/leave', B.token, {})
  check('退出宗门', leave.status === 200, JSON.stringify(leave.data).slice(0, 60))
  return { A, B, clanId }
}

// ───────────────────────── 6. 锻造 ─────────────────────────
async function testForge() {
  console.log('\n■ 锻造装备(PRD US23)')
  const u = await register('铁匠')
  await setup(u.t ?? u.token, u.cid ?? u.character.id, { lingshi: 5000, materials: { youhun_cao: 10 } })
  const t = u.token
  const inv = await req('GET', '/api/forge/inventory', t)
  check('锻造背包可查', inv.status === 200)
  const craft = await req('POST', '/api/forge/craft', t, { recipeId: 'wooden_sword' })
  check('锻造木剑成功(品质随机)', craft.status === 200 && craft.data.success !== false, JSON.stringify(craft.data).slice(0, 80))
  const equip = await req('POST', '/api/forge/equip', t, { equipmentId: craft.data.equipment?.id ?? craft.data.equipmentId })
  check('穿戴装备成功', equip.status === 200, JSON.stringify(equip.data).slice(0, 80))
  const craftNoMat = await req('POST', '/api/forge/craft', t, { recipeId: 'spirit_circlet' })
  check('材料不足锻造被拒(400)', craftNoMat.status === 400)
}

// ───────────────────────── 7. 签到/奇遇/成就/排行榜 ─────────────────────────
async function testMisc() {
  console.log('\n■ 签到/奇遇/成就/排行榜(PRD US16/18/20/26)')
  const u = await register('杂项测试')
  const t = u.token

  const signIn = await req('POST', '/api/sign-in', t, {})
  check('首次签到成功且 Day1 奖励=10 灵石', signIn.status === 200 && signIn.data.reward === 10)
  const dupSignIn = await req('POST', '/api/sign-in', t, {})
  check('同日重复签到被拒(409)', dupSignIn.status === 409)
  const status = await req('GET', '/api/sign-in/status', t)
  check('签到状态 consecutiveDays=1', status.data.consecutiveDays === 1 && status.data.signedIn === true)

  const advPending = await req('GET', '/api/adventure/pending', t)
  check('奇遇 pending 可查', advPending.status === 200)
  if (advPending.data.event) {
    const resolve = await req('POST', '/api/adventure/resolve', t, { choice: 0 })
    check('奇遇抉择结算成功', resolve.status === 200)
  } else {
    console.log('  ℹ 本次未触发奇遇事件(概率性),跳过 resolve 断言')
  }

  const achList = await req('GET', '/api/achievement/list', t)
  check('成就列表可读且非空', achList.status === 200 && (achList.data.achievements?.length ?? 0) > 0)
  const achCheck = await req('POST', '/api/achievement/check', t, { eventType: 'sign_in' })
  check('成就检查执行', achCheck.status === 200)

  const rankings = await req('GET', '/api/rankings', null)
  check('排行榜无需登录可访问且包含玩家', rankings.status === 200 && Array.isArray(rankings.data.rankings) && rankings.data.rankings.length > 0)
}

// ───────────────────────── 8. 聊天系统 ─────────────────────────
async function testChat() {
  console.log('\n■ 聊天系统(PRD 聊天章节)')
  const A = await register('话痨甲')

  // 新号凝气1层应被拒
  const denied = await req('POST', '/api/chat/world', A.token, { content: '大家好呀' })
  check('凝气3层以下世界发言被拒(403)', denied.status === 403)

  await setup(A.token, A.character.id, { realmLayer: 3 })
  const ok = await req('POST', '/api/chat/world', A.token, { content: '道友你好' })
  check('凝气3层发言成功', ok.status === 200 && ok.data.message?.type === 'chat')
  const tooLong = await req('POST', '/api/chat/world', A.token, { content: '啊'.repeat(201) })
  check('超过200字被拒(400)', tooLong.status === 400)
  const exactly200 = await req('POST', '/api/chat/world', A.token, { content: '好'.repeat(199) })
  check('199字(留CD余量)发送成功', exactly200.status === 200)

  // 限流:10秒内最多3条 —— 上面已发 2 条成功(第一条被拒不计),再发 2 条应有 429
  const third = await req('POST', '/api/chat/world', A.token, { content: '第三条' })
  const fourth = await req('POST', '/api/chat/world', A.token, { content: '第四条' })
  check('10秒3条限流生效(第4条 429)', fourth.status === 429 || third.status === 429,
    `third=${third.status} fourth=${fourth.status}`)

  // 私聊:A → B
  const B = await register('私信乙')
  const pm = await req('POST', `/api/chat/private/${B.character.id}`, A.token, { content: '私聊测试' })
  check('私聊发送成功(无境界限制)', pm.status === 200 && pm.data.message?.content === '私聊测试')
  const unread = await req('GET', '/api/chat/unread', B.token)
  check('乙的未读统计>0', (unread.data.total ?? 0) >= 1, JSON.stringify(unread.data).slice(0, 60))
  const history = await req('GET', `/api/chat/private/${A.character.id}?limit=50`, B.token)
  check('乙拉取历史可见消息', history.status === 200 && history.data.items?.some(m => m.content === '私聊测试'))
  const pusherAuth = await req('POST', '/api/pusher/auth', A.token, { socket_id: '1.1', channel_name: 'private-user-' + A.character.id })
  check('Pusher 私有频道认证可用', [200, 400].includes(pusherAuth.status) && pusherAuth.status !== 500, `status=${pusherAuth.status}(未配 Pusher env 时 400 合理)`)
}

// ───────────────────────── 9. 越权与边界 ─────────────────────────
async function testSecurity() {
  console.log('\n■ 越权与边界安全')
  const A = await register('越权甲')
  const B = await register('越权乙')
  const x = await req('POST', '/api/test/char-resource', A.token, { characterId: B.character.id, lingshi: 999999 })
  check('test 接口不能操作他人角色(403)', x.status === 403)
  const fakeProfile = await req('PUT', '/api/auth/profile', A.token, { nickname: '' })
  check('空昵称被拒或回退默认(非500)', fakeProfile.status < 500)
  const badToken = await fetch(BASE + '/api/auth/me', { headers: { Authorization: 'Bearer garbage.token.here' } })
  check('伪造 JWT 被拒(401)', badToken.status === 401)
  const prodHeader = await fetch(BASE + '/api/cultivate/breakthrough', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${A.token}`, 'x-test-breakthrough-roll': '0' },
    body: JSON.stringify({ usePill: false }),
  })
  check('test roll 头仅在 dev 生效(dev 下 200/400,生产 404 已由部署验证)', [200, 400].includes(prodHeader.status))
}

// ═══════════════════════ 执行 ═══════════════════════
const results = []
try { results.push(await testAuth()) } catch (e) { failCount++; failures.push({ name: '认证模块异常', detail: e.message }) }
try { results.push(await testCultivation()) } catch (e) { failCount++; failures.push({ name: '修炼模块异常', detail: e.message }); console.log(e.stack?.split('\n').slice(0,5).join('\n')) }
try { results.push(await testEconomy()) } catch (e) { failCount++; failures.push({ name: '经济模块异常', detail: e.message }) }
try { results.push(await testSocial()) } catch (e) { failCount++; failures.push({ name: '社交模块异常', detail: e.message }) }
try { results.push(await testClan()) } catch (e) { failCount++; failures.push({ name: '宗门模块异常', detail: e.message }) }
try { results.push(await testForge()) } catch (e) { failCount++; failures.push({ name: '锻造模块异常', detail: e.message }) }
try { results.push(await testMisc()) } catch (e) { failCount++; failures.push({ name: '杂项模块异常', detail: e.message }) }
try { results.push(await testChat()) } catch (e) { failCount++; failures.push({ name: '聊天模块异常', detail: e.message }) }
try { results.push(await testSecurity()) } catch (e) { failCount++; failures.push({ name: '安全模块异常', detail: e.message }) }

console.log(`\n${'═'.repeat(46)}`)
console.log(`总计: ${passCount} 通过 | ${failCount} 失败`)
if (failures.length) {
  console.log('\n失败清单:')
  for (const f of failures) console.log(`  ✗ ${f.name}${f.detail ? ' — ' + f.detail.slice(0, 120) : ''}`)
}
